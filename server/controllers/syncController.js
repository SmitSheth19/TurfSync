const dbAdapter = require('../services/dbAdapter');

// GET /api/sync — everything the frontend caches, in one call.
// Other people's bookings are reduced to slot occupancy (no names, emails or phones).
exports.getSnapshot = async (req, res) => {
  try {
    const user = req.user;
    const isAdmin = user && (user.role === 'ROLE_VENUE_ADMIN' || user.role === 'VENUE_ADMIN');

    const [venues, pricingRules, reviews, bookings, waitlist] = await Promise.all([
      dbAdapter.getVenues(),
      dbAdapter.getPricingRules(),
      dbAdapter.getReviews(),
      dbAdapter.getBookings(),
      user ? dbAdapter.getWaitlist({ userEmail: user.email }) : []
    ]);

    const canSeeFull = b => user && (b.userEmail === user.email || (isAdmin && b.venueId === user.venueId));
    const visibleBookings = bookings
      .filter(b => canSeeFull(b) || b.status === 'CONFIRMED' || b.status === 'HOLD')
      .map(b => canSeeFull(b) ? b : {
        id: b.id, venueId: b.venueId, courtId: b.courtId, courtName: b.courtName, sport: b.sport,
        venueName: b.venueName, bookingDate: b.bookingDate, startTime: b.startTime,
        endTime: b.endTime, status: b.status
      });

    res.json({ venues, pricingRules, reviews, bookings: visibleBookings, waitlist });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load data.' });
  }
};
