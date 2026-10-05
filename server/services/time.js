// All venues are in Mumbai; the server (Vercel) runs in UTC, so pin times to IST.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// "2026-10-06" for the current day in Mumbai
function todayIST() {
  return new Date(Date.now() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

// Absolute instant of a slot given as local Mumbai date + "HH:MM"
function slotStart(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr}:00+05:30`);
}

module.exports = { todayIST, slotStart };
