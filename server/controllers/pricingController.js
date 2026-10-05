const dbAdapter = require('../services/dbAdapter');

exports.getRules = async (req, res) => {
  let { venueId } = req.query;
  if (req.user && (req.user.role === 'ROLE_VENUE_ADMIN' || req.user.role === 'VENUE_ADMIN')) {
    venueId = req.user.venueId;
  }
  try {
    const rules = await dbAdapter.getPricingRules(venueId);
    res.json(rules);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve pricing rules.' });
  }
};

exports.addRule = async (req, res) => {
  const venueId = (req.user && req.user.venueId) ? req.user.venueId : req.body.venueId;
  const { name, days, startTime, endTime, multiplier, badgeText } = req.body;
  const newRule = {
    id: /^rule-\d+$/.test(req.body.id) ? req.body.id : `rule-${Date.now()}`,
    venueId, name, days, startTime, endTime, multiplier, badgeText
  };
  try {
    await dbAdapter.createPricingRule(newRule);
    res.status(201).json(newRule);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add pricing rule.' });
  }
};

exports.deleteRule = async (req, res) => {
  try {
    const allRules = await dbAdapter.getPricingRules();
    const rule = allRules.find(r => r.id === req.params.id);
    if (rule) {
      if (req.user && req.user.venueId && rule.venueId !== req.user.venueId) {
        return res.status(403).json({ error: 'Unauthorized to delete this pricing rule.' });
      }
      await dbAdapter.deletePricingRule(req.params.id);
    }
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete pricing rule.' });
  }
};
