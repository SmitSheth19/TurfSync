const dbAdapter = require('../services/dbAdapter');
const { calculateSlotPrice } = require('../services/pricingEngine');
const { calculateRefund } = require('../services/cancellationEngine');
const concurrencyManager = require('../services/concurrencyManager');
const { isSupabaseConfigured } = require('../config/supabase');
const { todayIST, slotStart } = require('../services/time');

const GST_RATE = 0.18;
const isOwner = user => user && (user.role === 'ROLE_VENUE_ADMIN' || user.role === 'VENUE_ADMIN');

let wsBroadcaster = null;

exports.setWsBroadcaster = (fn) => {
  wsBroadcaster = fn;
};

// Slot Matrix
exports.getSlotMatrix = async (req, res) => {
  const { venueId, date } = req.query;
  if (!venueId || !date) {
    return res.status(400).json({ error: 'venueId and date query parameters are required.' });
  }

  try {
    const courts = await dbAdapter.getCourts(venueId);
    const rules = await dbAdapter.getPricingRules(venueId);
    const bookings = await dbAdapter.getBookings({ venueId, date });

    const hours = ["06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00"];
    const matrix = [];

    for (const court of courts) {
      for (const time of hours) {
        const existing = bookings.find(b => b.courtId === court.id && b.startTime === time && (b.status === 'CONFIRMED' || b.status === 'HOLD'));
        const pricing = calculateSlotPrice(court, date, time, rules);

        matrix.push({
          courtId: court.id,
          courtName: court.name,
          sport: court.sport,
          date,
          time,
          status: existing ? existing.status : 'AVAILABLE',
          price: pricing.finalPrice,
          basePrice: pricing.basePrice,
          badge: pricing.badge
        });
      }
    }

    res.json(matrix);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate slot matrix.' });
  }
};

// Confirm Booking — Atomic Concurrency via DB unique index (Supabase) or in-memory mutex (local)
exports.confirmBooking = async (req, res) => {
  const { courtId, startTime, isRecurring } = req.body;
  const bookingDate = req.body.bookingDate || req.body.date;

  if (!courtId || !bookingDate || !/^\d{2}:00$/.test(startTime || '')) {
    return res.status(400).json({ error: 'courtId, bookingDate, and startTime are required.' });
  }

  const court = await dbAdapter.getCourtById(courtId);
  const venue = court && await dbAdapter.getVenueById(court.venueId);
  if (!court || !venue) return res.status(404).json({ error: 'Court not found.' });
  if (!court.isActive) return res.status(409).json({ error: 'This court is temporarily blocked for maintenance.' });
  if (startTime < venue.openingTime || startTime >= venue.closingTime) {
    return res.status(400).json({ error: 'The venue is closed at that time.' });
  }
  if (slotStart(bookingDate, startTime) <= new Date()) {
    return res.status(400).json({ error: 'That slot has already started or passed.' });
  }

  // In local mode: use in-memory mutex as layer 1.
  // In Supabase mode: skip mutex (stateless serverless) — rely on PostgreSQL unique index.
  const useLocalMutex = !isSupabaseConfigured();
  if (useLocalMutex) {
    const lockAcquired = concurrencyManager.acquireLock(courtId, bookingDate, startTime);
    if (!lockAcquired) {
      return res.status(409).json({ error: 'Slot is currently being processed by another transaction. Please try again.' });
    }
  }

  try {
    // 2. Check if already booked
    const dayBookings = await dbAdapter.getBookings({ courtId, date: bookingDate });
    const existing = dayBookings.find(b => 
      b.startTime === startTime && 
      (b.status === 'CONFIRMED' || b.status === 'HOLD')
    );

    if (existing) {
      return res.status(409).json({ error: 'Slot has already been reserved by another player!' });
    }

    // 3. Create Booking — price is computed here, never trusted from the client
    const rules = await dbAdapter.getPricingRules(venue.id);
    const price = calculateSlotPrice(court, bookingDate, startTime, rules).finalPrice;
    const endHour = parseInt(startTime, 10) + 1;
    const newBooking = {
      id: `TS-${bookingDate.slice(0, 4)}-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 10)}`,
      venueId: venue.id,
      courtId,
      courtName: court.name,
      sport: court.sport,
      venueName: venue.name,
      userId: req.user.id,
      userName: req.body.userName || req.user.fullName,
      userEmail: req.user.email,
      userPhone: req.body.userPhone || null,
      bookingDate,
      startTime,
      endTime: `${String(endHour).padStart(2, '0')}:00`,
      baseAmount: price,
      totalAmount: Math.round(price * (1 + GST_RATE)),
      status: 'CONFIRMED',
      paymentStatus: 'SUCCEEDED',
      paymentMethod: req.body.paymentMethod || 'Stripe Card (•••• 4242)',
      isRecurring: !!isRecurring,
      cancellationReason: null,
      cancelledAt: null,
      refundAmount: 0,
      refundPercent: 0,
      createdAt: new Date().toISOString()
    };

    await dbAdapter.createBooking(newBooking);

    // 4. Broadcast live slot update over WebSockets
    if (wsBroadcaster) {
      wsBroadcaster({
        type: 'SLOT_BOOKED',
        courtId: newBooking.courtId,
        date: newBooking.bookingDate,
        time: newBooking.startTime,
        status: 'CONFIRMED',
        booking: newBooking
      });
    }

    res.status(201).json(newBooking);
  } catch (err) {
    if (err.code === 409) {
      return res.status(409).json({ error: 'Slot has already been reserved by another player!' });
    }
    res.status(500).json({ error: 'Failed to process booking.' });
  } finally {
    // Release mutex only in local mode
    if (useLocalMutex) {
      concurrencyManager.releaseLock(courtId, bookingDate, startTime);
    }
  }
};

// Cancel Booking & Tiered Refund
exports.cancelBooking = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body || {};

  try {
    const allBookings = await dbAdapter.getBookings();
    const booking = allBookings.find(b => b.id === id);
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });

    const ownsBooking = booking.userEmail === req.user.email;
    const ownsVenue = isOwner(req.user) && req.user.venueId === booking.venueId;
    if (!ownsBooking && !ownsVenue) return res.status(403).json({ error: 'You can only cancel your own bookings.' });
    if (booking.status !== 'CONFIRMED') return res.status(409).json({ error: 'This booking is already cancelled.' });
    if (slotStart(booking.bookingDate, booking.startTime) <= new Date()) {
      return res.status(400).json({ error: 'Past bookings cannot be cancelled.' });
    }

    const venue = await dbAdapter.getVenueById(booking.venueId);
    // The venue cancelling on a customer always refunds in full
    const refund = ownsBooking
      ? calculateRefund(booking, venue?.cancellationPolicyHours || 24)
      : { refundPercent: 100, refundAmount: booking.totalAmount, tierLabel: 'Full refund (cancelled by venue)', currency: '₹' };

    const updates = {
      status: 'CANCELLED',
      cancelledAt: new Date().toISOString(),
      cancellationReason: reason || 'Player cancellation',
      refundAmount: refund.refundAmount,
      refundPercent: refund.refundPercent,
      paymentStatus: refund.refundPercent > 0 ? 'REFUNDED' : 'SUCCEEDED'
    };

    const updatedBooking = await dbAdapter.updateBooking(id, updates);

    // Auto-promote waitlist candidate
    const waitlist = await dbAdapter.getWaitlist({ courtId: booking.courtId });
    const waitlistEntry = waitlist.find(w => 
      w.date === booking.bookingDate && 
      w.startTime === booking.startTime && 
      w.status === 'WAITING'
    );

    if (waitlistEntry) {
      await dbAdapter.updateWaitlistStatus(waitlistEntry.id, 'NOTIFIED');
      console.log(`⚡ [Waitlist Auto-Promote] Notified ${waitlistEntry.userName} (${waitlistEntry.userEmail}) for freed slot!`);
    }

    // Broadcast slot cancellation over WebSockets
    if (wsBroadcaster) {
      wsBroadcaster({
        type: 'SLOT_CANCELLED',
        courtId: booking.courtId,
        date: booking.bookingDate,
        time: booking.startTime,
        status: 'AVAILABLE'
      });
    }

    res.json({ booking: updatedBooking || booking, refund });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel booking.' });
  }
};

// Player Bookings
exports.getMyBookings = async (req, res) => {
  const email = req.user.email;
  try {
    const userBookings = await dbAdapter.getBookings({ userEmail: email });
    res.json(userBookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve bookings.' });
  }
};

// Player KPI Stats
exports.getPlayerStats = async (req, res) => {
  const email = req.user.email;
  try {
    const bookings = await dbAdapter.getBookings({ userEmail: email });
    const waitlists = await dbAdapter.getWaitlist({ userEmail: email });

    const activePasses = bookings.filter(b => b.status === 'CONFIRMED').length;
    const totalMatches = bookings.filter(b => b.status === 'CONFIRMED' && b.bookingDate < todayIST()).length;
    const activeWaitlists = waitlists.filter(w => w.status === 'WAITING' || w.status === 'NOTIFIED').length;

    res.json({
      activePasses,
      totalMatches,
      activeWaitlists,
      favoriteSport: 'Football (7v7 / 5v5)'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute player stats.' });
  }
};
