/**
 * TurfSync Analytics & Occupancy Heatmap Controller
 * Computes hourly utilization heatmaps, sport popularity breakdown, and revenue trends.
 */

const TurfAnalytics = {
  currentVenueId: 'venue-1',

  init() {
    const user = TurfStorage.getCurrentUser();
    if (!user || !TurfStorage.isOwner(user)) {
      alert('Access restricted: Please log in with a Facility Owner account to view analytics.');
      window.location.href = 'login.html';
      return;
    }
    this.currentVenueId = user.venueId || 'venue-1';
    this.setupVenueSelector();
    this.renderOccupancyHeatmap();
    this.renderSportDistribution();
  },

  setupVenueSelector() {
    const user = TurfStorage.getCurrentUser();
    const select = document.getElementById('analytics-venue-select');
    if (!select) return;

    const myVenues = TurfStorage.getVenuesForUser(user);
    const venuesToDisplay = myVenues.length > 0 ? myVenues : TurfStorage.getVenues().filter(v => v.id === this.currentVenueId);

    select.innerHTML = venuesToDisplay.map(v => `
      <option value="${v.id}" selected>${v.name}</option>
    `).join('');

    if (venuesToDisplay.length <= 1) {
      TurfUI.showSingleVenue(select, venuesToDisplay[0]);
    } else {
      select.addEventListener('change', (e) => {
        if (!myVenues.some(v => v.id === e.target.value)) {
          TurfUI.showToast('Unauthorized facility access.', 'error');
          return;
        }
        this.currentVenueId = e.target.value;
        this.renderOccupancyHeatmap();
        this.renderSportDistribution();
      });
    }
  },

  // Confirmed bookings for this venue within ±4 weeks of today, plus the capacity they fill
  getWindow() {
    const venue = TurfStorage.getVenueById(this.currentVenueId);
    const from = new Date(); from.setDate(from.getDate() - 28);
    const to = new Date(); to.setDate(to.getDate() + 28);
    const fromStr = TurfUI.formatISODate(from), toStr = TurfUI.formatISODate(to);
    const bookings = TurfStorage.getBookings().filter(b =>
      b.venueId === this.currentVenueId && b.status === 'CONFIRMED' && b.date >= fromStr && b.date <= toStr);
    const courts = venue ? venue.courts.filter(c => c.isActive !== false).length : 0;
    return { venue, bookings, slotsPerCell: courts * 8 }; // 8 weeks of each weekday-hour
  },

  // Weekday index 0=Mon..6=Sun for a YYYY-MM-DD date
  weekdayOf(dateStr) {
    const d = new Date(dateStr + 'T00:00:00').getDay();
    return d === 0 ? 6 : d - 1;
  },

  renderOccupancyHeatmap() {
    const container = document.getElementById('heatmap-container');
    if (!container) return;

    const { venue, bookings, slotsPerCell } = this.getWindow();
    if (!venue) return;

    const counts = {};
    bookings.forEach(b => {
      const key = `${this.weekdayOf(b.date)}-${parseInt(b.startTime, 10)}`;
      counts[key] = (counts[key] || 0) + 1;
    });

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const openH = parseInt(venue.openingTime, 10), closeH = parseInt(venue.closingTime, 10);

    let html = '<div class="heatmap-grid">';
    html += '<div class="grid-header" style="font-size:0.75rem;font-weight:700;">HOUR</div>';
    days.forEach(d => { html += `<div class="grid-header" style="font-size:0.75rem;font-weight:700;">${d}</div>`; });

    for (let h = openH; h < closeH; h++) {
      const displayHour = TurfUI.formatTime(`${String(h).padStart(2, '0')}:00`);
      html += `<div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);display:flex;align-items:center;">${displayHour}</div>`;
      days.forEach((day, dIdx) => {
        const count = counts[`${dIdx}-${h}`] || 0;
        const pct = slotsPerCell ? Math.round((count / slotsPerCell) * 100) : 0;
        let heatClass = 'heat-0';
        if (pct >= 85) heatClass = 'heat-100';
        else if (pct >= 60) heatClass = 'heat-75';
        else if (pct >= 35) heatClass = 'heat-50';
        else if (pct > 0) heatClass = 'heat-25';
        html += `<div class="heatmap-cell ${heatClass}" title="${day} at ${displayHour}: ${count} booking${count === 1 ? '' : 's'} (${pct}% of court-hours)">${pct}%</div>`;
      });
    }

    html += '</div>';
    container.innerHTML = html;
    this.renderPricingTips(counts, venue);
  },

  renderSportDistribution() {
    const container = document.getElementById('sport-distribution-list');
    if (!container) return;

    const { venue, bookings } = this.getWindow();
    if (!venue) return;
    const counts = {};
    bookings.forEach(b => { counts[b.sport] = (counts[b.sport] || 0) + 1; });
    const sports = [...new Set(venue.courts.map(c => c.sport))];
    const total = bookings.length;

    if (total === 0) {
      container.innerHTML = `<p style="color:var(--text-muted);font-size:0.9rem;">No confirmed bookings in this period yet.</p>`;
      return;
    }

    container.innerHTML = sports.map(sport => {
      const count = counts[sport] || 0;
      const pct = Math.round((count / total) * 100);
      const emoji = sport === 'FOOTBALL' ? '⚽' : sport === 'CRICKET' ? '🏏' : sport === 'BADMINTON' ? '🏸' : sport === 'TENNIS' ? '🎾' : '🏓';
      return `
        <div style="margin-bottom:1.1rem;">
          <div style="display:flex;justify-content:space-between;font-size:0.875rem;font-weight:700;margin-bottom:0.35rem;">
            <span>${emoji} ${sport}</span>
            <span>${pct}% (${count} booking${count === 1 ? '' : 's'})</span>
          </div>
          <div style="width:100%;height:8px;background:var(--bg-subtle);border-radius:var(--radius-full);overflow:hidden;">
            <div style="width:${pct}%;height:100%;background:var(--primary);border-radius:var(--radius-full);"></div>
          </div>
        </div>
      `;
    }).join('');
  },

  // Point owners at their busiest hour (surge candidate) and their quietest weekday hours (discount candidate)
  renderPricingTips(counts, venue) {
    const container = document.getElementById('pricing-tips');
    if (!container) return;

    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const tip = (color, title, body) => `
      <div style="padding:0.75rem;background:#fff;border-radius:var(--radius-md);border-left:4px solid ${color};">
        <div style="font-weight:700;font-size:0.9rem;color:var(--secondary);">${title}</div>
        <div style="font-size:0.8rem;color:var(--text-muted);margin-top:0.2rem;">${body}</div>
      </div>`;

    if (entries.length < 3) {
      container.innerHTML = tip('var(--border)', 'Not enough booking data yet', 'Suggestions appear once this venue has a few more confirmed bookings.');
      return;
    }

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const [busyKey, busyCount] = entries[0];
    const [busyDay, busyHour] = busyKey.split('-').map(Number);
    const busyTime = TurfUI.formatTime(`${String(busyHour).padStart(2, '0')}:00`);
    const rules = TurfStorage.getPricingRules(venue.id);
    const covered = rules.some(r => parseInt(r.startTime, 10) <= busyHour && busyHour < parseInt(r.endTime, 10) && r.multiplier > 1);

    // Weekday hours (Mon–Fri) with no bookings at all
    const openH = parseInt(venue.openingTime, 10), closeH = parseInt(venue.closingTime, 10);
    let emptyHours = 0;
    for (let d = 0; d < 5; d++) for (let h = openH; h < closeH; h++) if (!counts[`${d}-${h}`]) emptyHours++;

    container.innerHTML =
      tip('var(--accent-amber)', `Busiest slot: ${days[busyDay]}s at ${busyTime}`,
        `${busyCount} bookings in this period. ${covered ? 'A surge rule already covers this hour.' : 'Consider a surge rule for this hour.'}`) +
      tip('var(--primary)', `${emptyHours} weekday court-hours had no bookings`,
        'An off-peak discount (e.g. 0.85x) on quiet weekday hours can help fill them.');
  }
};

window.TurfAnalytics = TurfAnalytics;
