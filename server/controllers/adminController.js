const dbAdapter = require('../services/dbAdapter');
const { calculateSlotPrice } = require('../services/pricingEngine');
const { todayIST, slotStart } = require('../services/time');

const openHours = v => parseInt(v.closingTime, 10) - parseInt(v.openingTime, 10);

let wsBroadcaster = null;
exports.setWsBroadcaster = (fn) => { wsBroadcaster = fn; };

// GET /api/admin/stats - Owner KPIs for their specific turf
exports.getStats = async (req, res) => {
  try {
    const venueId = req.user?.venueId;
    if (!venueId) return res.status(403).json({ error: 'Access denied: No venue assigned to this account.' });

    const venue = await dbAdapter.getVenueById(venueId);
    if (!venue) return res.status(404).json({ error: 'Venue not found.' });

    const venueCourts = await dbAdapter.getCourts(venueId);
    const bookings = await dbAdapter.getBookings({ venueId, status: 'CONFIRMED' });
    const todayStr = todayIST();
    const todayBookings = bookings.filter(b => b.bookingDate === todayStr);

    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const todayRevenue = todayBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const totalCourtHours = venueCourts.length * openHours(venue);
    const utilizationRate = totalCourtHours > 0 ? Math.round((todayBookings.length / totalCourtHours) * 100) : 0;

    res.json({
      venueId,
      venueName: venue.name,
      totalRevenue,
      todayRevenue,
      confirmedBookingsCount: bookings.length,
      todayBookingsCount: todayBookings.length,
      utilizationRate,
      activeCourtsCount: venueCourts.filter(c => c.isActive).length,
      totalCourtsCount: venueCourts.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/admin/courts - Owner's courts with live slot occupancy
exports.getCourts = async (req, res) => {
  try {
    const venueId = req.user?.venueId;
    if (!venueId) return res.status(403).json({ error: 'Access denied.' });

    const todayStr = todayIST();
    const courts = await dbAdapter.getCourts(venueId);
    const todayBookings = await dbAdapter.getBookings({ venueId, date: todayStr, status: 'CONFIRMED' });

    const courtsWithStats = courts.map(c => {
      const todaySlotsOccupied = todayBookings.filter(b => b.courtId === c.id).length;
      return {
        ...c,
        todaySlotsOccupied
      };
    });

    res.json(courtsWithStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/admin/courts/:id/toggle - Maintenance Block/Unblock Court
exports.toggleCourt = async (req, res) => {
  try {
    const { id } = req.params;
    const court = await dbAdapter.getCourtById(id);
    if (!court) return res.status(404).json({ error: 'Court not found.' });

    if (court.venueId !== req.user?.venueId) {
      return res.status(403).json({ error: 'Unauthorized: You do not own this court.' });
    }

    const updated = await dbAdapter.toggleCourt(id);
    res.json({ success: true, court: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/admin/offline-booking - Walk-in cash booking recording
exports.createOfflineBooking = async (req, res) => {
  try {
    const venueId = req.user?.venueId;
    const { courtId, bookingDate, startTime, userName, userPhone } = req.body;

    const court = await dbAdapter.getCourtById(courtId);
    if (!court || court.venueId !== venueId) {
      return res.status(400).json({ error: 'Court not found or unauthorized.' });
    }

    const existing = await dbAdapter.getBookings({ courtId, date: bookingDate, status: 'CONFIRMED' });
    const occupied = existing.some(b => b.startTime === startTime);
    if (occupied) return res.status(409).json({ error: 'Slot is already booked!' });

    const venue = await dbAdapter.getVenueById(venueId);
    const startH = parseInt(startTime.split(':')[0]);
    const endTime = String(startH + 1).padStart(2, '0') + ':00';
    if (startTime < venue.openingTime || startTime >= venue.closingTime) {
      return res.status(400).json({ error: 'The venue is closed at that time.' });
    }
    // Walk-ins may be recorded for the hour in progress, but not for hours already over
    if (slotStart(bookingDate, endTime === '24:00' ? '23:59' : endTime) <= new Date()) {
      return res.status(400).json({ error: 'That slot is already over.' });
    }
    const rules = await dbAdapter.getPricingRules(venueId);
    const price = calculateSlotPrice(court, bookingDate, startTime, rules).finalPrice;

    const newBooking = {
      id: 'TS-OFFLINE-' + Date.now().toString().slice(-7),
      venueId,
      courtId,
      courtName: court.name,
      sport: court.sport,
      venueName: venue?.name || 'Sports Arena',
      userId: 'offline-walkin',
      userName: userName || 'Offline Walk-in',
      userEmail: 'counter.cash@turfsync.local',
      userPhone: userPhone || '+91 99999 00000',
      bookingDate,
      startTime,
      endTime,
      baseAmount: price,
      totalAmount: Math.round(price * 1.18),
      status: 'CONFIRMED',
      paymentStatus: 'SUCCEEDED',
      paymentMethod: 'Cash / On-Site',
      isRecurring: false,
      cancellationReason: null,
      cancelledAt: null,
      refundAmount: 0,
      refundPercent: 0,
      createdAt: new Date().toISOString()
    };

    await dbAdapter.createBooking(newBooking);

    if (wsBroadcaster) {
      wsBroadcaster({
        type: 'SLOT_BOOKED',
        courtId,
        date: bookingDate,
        time: startTime,
        status: 'CONFIRMED',
        booking: newBooking
      });
    }

    res.status(201).json(newBooking);
  } catch (err) {
    if (err.code === 409) {
      return res.status(409).json({ error: 'Slot is already booked!' });
    }
    res.status(500).json({ error: err.message });
  }
};
