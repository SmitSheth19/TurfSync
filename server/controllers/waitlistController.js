const dbAdapter = require('../services/dbAdapter');

exports.getMyWaitlist = async (req, res) => {
  try {
    const email = req.query.email || (req.user ? req.user.email : 'player@turfsync.com');
    const userWaitlists = await dbAdapter.getWaitlist({ userEmail: email });
    res.json(userWaitlists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.joinWaitlist = async (req, res) => {
  try {
    const { courtId, startTime, courtName, venueId } = req.body;
    const bookingDate = req.body.bookingDate || req.body.date;
    if (!courtId || !bookingDate || !startTime) {
      return res.status(400).json({ error: 'courtId, bookingDate and startTime are required.' });
    }
    const newEntry = {
      id: /^wl-\d+$/.test(req.body.id) ? req.body.id : `wl-${Date.now()}`,
      courtId,
      courtName: courtName || 'Sports Court',
      venueId: venueId || 'venue-1',
      bookingDate,
      startTime,
      userId: req.user ? req.user.id : (req.body.userId || 'user-1'),
      userName: req.user ? req.user.fullName : (req.body.userName || 'Alex Morgan'),
      userEmail: req.user ? req.user.email : (req.body.userEmail || 'player@turfsync.com'),
      userPhone: req.body.userPhone || null,
      status: 'WAITING',
      createdAt: new Date().toISOString(),
      notifiedAt: null
    };
    await dbAdapter.createWaitlist(newEntry);
    res.status(201).json(newEntry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cancelWaitlist = async (req, res) => {
  try {
    await dbAdapter.deleteWaitlist(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
