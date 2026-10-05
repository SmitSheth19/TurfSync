const { slotStart } = require('./time');

// Tiered refund based on the venue's cancellation policy (in hours):
// full refund with at least `policyHours` notice, 50% with at least half of it, else none.
function calculateRefund(booking, policyHours = 24) {
  const diffHours = (slotStart(booking.bookingDate, booking.startTime) - new Date()) / (1000 * 60 * 60);
  const halfHours = policyHours / 2;

  let refundPercent = 0;
  let tierLabel = '';

  if (diffHours >= policyHours) {
    refundPercent = 100;
    tierLabel = `Full Refund (>${policyHours}h Notice)`;
  } else if (diffHours >= halfHours) {
    refundPercent = 50;
    tierLabel = `50% Partial Refund (${halfHours}h–${policyHours}h Notice)`;
  } else {
    refundPercent = 0;
    tierLabel = `No Refund (<${halfHours}h Notice)`;
  }

  const refundAmount = Math.round((booking.totalAmount * refundPercent) / 100);

  return {
    diffHours: Math.max(0, Math.round(diffHours * 10) / 10),
    refundPercent,
    tierLabel,
    refundAmount,
    currency: '₹'
  };
}

module.exports = { calculateRefund };
