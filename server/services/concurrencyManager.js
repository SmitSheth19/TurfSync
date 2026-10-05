/**
 * Concurrency Lock Manager
 * Prevents double-booking race conditions during simultaneous peak booking attempts.
 */
class ConcurrencyManager {
  constructor() {
    this.locks = new Set();
  }

  acquireLock(courtId, date, startTime) {
    const key = `${courtId}_${date}_${startTime}`;
    if (this.locks.has(key)) {
      return false; // Already locked by another transaction in progress
    }
    this.locks.add(key);
    return true;
  }

  releaseLock(courtId, date, startTime) {
    const key = `${courtId}_${date}_${startTime}`;
    this.locks.delete(key);
  }
}

module.exports = new ConcurrencyManager();
