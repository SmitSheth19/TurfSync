const DB = require('../config/db');

function calculateSlotPrice(courtOrId, dateStr, timeStr, customRules = null) {
  const court = typeof courtOrId === 'object' && courtOrId !== null
    ? courtOrId 
    : DB.courts.find(c => c.id === courtOrId);

  if (!court) {
    return { basePrice: 0, finalPrice: 0, multiplier: 1.0, badge: '' };
  }

  const rules = customRules || DB.pricingRules.filter(r => r.venueId === court.venueId);
  const dateObj = new Date(dateStr + 'T00:00:00');
  const dayOfWeek = dateObj.getDay() === 0 ? 7 : dateObj.getDay(); // 1=Mon..7=Sun

  const [hour] = timeStr.split(':').map(Number);
  let totalMultiplier = 1.0;
  let badgeText = null;

  for (const rule of rules) {
    const [startH] = rule.startTime.split(':').map(Number);
    const [endH] = rule.endTime.split(':').map(Number);

    const matchesDay = !rule.days || rule.days.split(',').map(Number).includes(dayOfWeek);
    const matchesTime = hour >= startH && hour < endH;

    if (matchesDay && matchesTime) {
      totalMultiplier *= rule.multiplier;
      badgeText = rule.badgeText;
    }
  }

  const finalPrice = Math.round(court.baseRate * totalMultiplier);

  return {
    basePrice: court.baseRate,
    finalPrice,
    multiplier: totalMultiplier,
    badge: badgeText || ''
  };
}

module.exports = { calculateSlotPrice };
