const dbAdapter = require('../services/dbAdapter');

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

exports.addReview = async (req, res) => {
  try {
    const { rating, comment, userName } = req.body;
    const review = {
      id: /^rev-\d+$/.test(req.body.id) ? req.body.id : `rev-${Date.now()}`,
      venueId: req.params.id,
      userName: req.user.fullName,
      rating: parseInt(rating) || 5,
      comment: comment || '',
      date: new Date().toISOString().split('T')[0]
    };
    await dbAdapter.createReview(review);
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit review.' });
  }
};
