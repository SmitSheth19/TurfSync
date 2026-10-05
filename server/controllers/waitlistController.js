const dbAdapter = require('../services/dbAdapter');

exports.getMyWaitlist = async (req, res) => {
  try {
    const email = req.user.email;
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
      userId: req.user.id,
      userName: req.body.userName || req.user.fullName,
      userEmail: req.user.email,
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
    const mine = await dbAdapter.getWaitlist({ userEmail: req.user.email });
    if (!mine.some(w => w.id === req.params.id)) {
      return res.status(404).json({ error: 'Waitlist entry not found.' });
    }
    await dbAdapter.deleteWaitlist(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
