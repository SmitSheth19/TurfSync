const dbAdapter = require('../services/dbAdapter');
const { todayIST, slotStart } = require('../services/time');

exports.getAllVenues = async (req, res) => {
  try {
    const venues = await dbAdapter.getVenues();
    res.json(venues);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch venues.' });
  }
};

exports.getVenueById = async (req, res) => {
  try {
    const venue = await dbAdapter.getVenueById(req.params.id);
    if (!venue) return res.status(404).json({ error: 'Venue not found' });
    res.json(venue);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch venue details.' });
  }
};

exports.getVenueCourts = async (req, res) => {
  try {
    const courts = await dbAdapter.getCourts(req.params.id);
    res.json(courts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courts.' });
  }
};

exports.getVenueReviews = async (req, res) => {
  try {
    const reviews = await dbAdapter.getReviews(req.params.id);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
};

// Players may review a venue once per match they've actually played there
exports.addReview = async (req, res) => {
  try {
    const venueId = req.params.id;
    const rating = parseInt(req.body.rating, 10);
    const comment = String(req.body.comment || '').trim();
    if (!(rating >= 1 && rating <= 5)) return res.status(400).json({ error: 'Rating must be 1 to 5 stars.' });
    if (comment.length > 500) return res.status(400).json({ error: 'Review must be under 500 characters.' });

    const played = (await dbAdapter.getBookings({ venueId, userEmail: req.user.email, status: 'CONFIRMED' }))
      .filter(b => slotStart(b.bookingDate, b.startTime) <= new Date());
    if (played.length === 0) return res.status(403).json({ error: 'You can review a venue after playing there.' });
    const mine = (await dbAdapter.getReviews(venueId)).filter(r => r.userName === req.user.fullName);
    if (mine.length >= played.length) return res.status(409).json({ error: 'You have already reviewed your matches here.' });

    const review = {
      id: /^rev-\d+$/.test(req.body.id) ? req.body.id : `rev-${Date.now()}`,
      venueId,
      userName: req.user.fullName,
      rating,
      comment,
      date: todayIST()
    };
    await dbAdapter.createReview(review);

    // Keep the venue's headline rating in step with its reviews
    const all = await dbAdapter.getReviews(venueId);
    const avg = Math.round((all.reduce((s, r) => s + r.rating, 0) / all.length) * 10) / 10;
    await dbAdapter.updateVenueStats(venueId, avg, all.length);
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit review.' });
  }
};
