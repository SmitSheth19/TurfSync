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

// ── Venue & court management (owner's own venue only) ─────────────────────────

const SPORTS = ['FOOTBALL', 'CRICKET', 'BADMINTON', 'TENNIS', 'PICKLEBALL'];
const HOUR = /^([01]\d|2[0-4]):00$/;
const text = (v, min, max) => typeof v === 'string' && v.trim().length >= min && v.trim().length <= max;

// Upcoming confirmed bookings, optionally narrowed by a predicate
async function upcomingBookings(filter, predicate = () => true) {
  const bookings = await dbAdapter.getBookings({ ...filter, status: 'CONFIRMED' });
  return bookings.filter(b => slotStart(b.bookingDate, b.startTime) > new Date() && predicate(b));
}

// PUT /api/admin/venue
exports.updateVenue = async (req, res) => {
  try {
    const venueId = req.user.venueId;
    const venue = await dbAdapter.getVenueById(venueId);
    if (!venue) return res.status(404).json({ error: 'Venue not found.' });

    const b = req.body || {};
    const errors = [];
    if (!text(b.name, 2, 120)) errors.push('Name must be 2–120 characters.');
    if (!text(b.address, 3, 200)) errors.push('Address must be 3–200 characters.');
    if (!text(b.area, 2, 80)) errors.push('Area must be 2–80 characters.');
    if (b.tagline && !text(b.tagline, 0, 160)) errors.push('Tagline must be under 160 characters.');
    if (b.description && !text(b.description, 0, 1000)) errors.push('Description must be under 1000 characters.');
    if (b.image && !/^https:\/\/[^\s"'<>`]{5,490}$/.test(b.image)) errors.push('Photo must be an https:// image link.');
    if (!HOUR.test(b.openingTime || '') || !HOUR.test(b.closingTime || '') || b.openingTime >= b.closingTime || b.openingTime === '24:00') {
      errors.push('Opening hours must be whole hours, with opening before closing.');
    }
    const policy = Number(b.cancellationPolicyHours);
    if (!Number.isInteger(policy) || policy < 1 || policy > 72) errors.push('Cancellation notice must be 1–72 hours.');
    if (errors.length) return res.status(400).json({ error: errors.join(' ') });

    // Don't strand players who already booked hours the venue would no longer open
    const outside = await upcomingBookings({ venueId }, bk => bk.startTime < b.openingTime || bk.startTime >= b.closingTime);
    if (outside.length) {
      return res.status(409).json({ error: `${outside.length} upcoming booking(s) fall outside these hours. Cancel or keep those hours open first.` });
    }

    const updated = await dbAdapter.updateVenue(venueId, {
      name: b.name.trim(), tagline: (b.tagline || '').trim(), description: (b.description || '').trim(),
      address: b.address.trim(), area: b.area.trim(), image: b.image || venue.image,
      openingTime: b.openingTime, closingTime: b.closingTime, cancellationPolicyHours: policy
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

function validateCourt(b) {
  const errors = [];
  if (!text(b.name, 2, 80)) errors.push('Court name must be 2–80 characters.');
  if (!SPORTS.includes(b.sport)) errors.push('Choose a sport.');
  if (b.surface && !text(b.surface, 0, 80)) errors.push('Surface must be under 80 characters.');
  const rate = Number(b.baseRate);
  if (!Number.isInteger(rate) || rate < 100 || rate > 20000) errors.push('Hourly rate must be a whole number from ₹100 to ₹20,000.');
  return errors;
}

// POST /api/admin/courts
exports.addCourt = async (req, res) => {
  try {
    const b = req.body || {};
    const errors = validateCourt(b);
    if (errors.length) return res.status(400).json({ error: errors.join(' ') });
    const court = {
      id: `court-${Date.now()}`,
      venueId: req.user.venueId,
      name: b.name.trim(), sport: b.sport, surface: (b.surface || '').trim(),
      isIndoor: !!b.isIndoor, baseRate: Number(b.baseRate), isActive: true
    };
    await dbAdapter.createCourt(court);
    res.status(201).json(court);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/admin/courts/:id
exports.updateCourt = async (req, res) => {
  try {
    const court = await dbAdapter.getCourtById(req.params.id);
    if (!court || court.venueId !== req.user.venueId) return res.status(404).json({ error: 'Court not found.' });
    const b = req.body || {};
    const errors = validateCourt(b);
    if (errors.length) return res.status(400).json({ error: errors.join(' ') });
    const updated = await dbAdapter.updateCourt(court.id, {
      name: b.name.trim(), sport: b.sport, surface: (b.surface || '').trim(),
      isIndoor: !!b.isIndoor, baseRate: Number(b.baseRate)
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/admin/courts/:id
exports.deleteCourt = async (req, res) => {
  try {
    const court = await dbAdapter.getCourtById(req.params.id);
    if (!court || court.venueId !== req.user.venueId) return res.status(404).json({ error: 'Court not found.' });
    const courts = await dbAdapter.getCourts(court.venueId);
    if (courts.length <= 1) return res.status(409).json({ error: 'A venue needs at least one court.' });
    const upcoming = await upcomingBookings({ courtId: court.id });
    if (upcoming.length) {
      return res.status(409).json({ error: `${upcoming.length} upcoming booking(s) on this court. Block it instead, or cancel those first.` });
    }
    await dbAdapter.deleteCourt(court.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
