function calculateRefund(booking) {
  const matchDateTime = new Date(`${booking.bookingDate}T${booking.startTime}:00`);
  const now = new Date();
  const diffHours = (matchDateTime - now) / (1000 * 60 * 60);

  let refundPercent = 0;
  let tierLabel = '';

  if (diffHours >= 24) {
    refundPercent = 100;
    tierLabel = 'Full Refund (>24h Notice)';
  } else if (diffHours >= 12) {
    refundPercent = 50;
    tierLabel = '50% Partial Refund (12h–24h Notice)';
  } else {
    refundPercent = 0;
    tierLabel = 'No Refund (<12h Notice)';
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
