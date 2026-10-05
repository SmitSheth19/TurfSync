/**
 * TurfSync UI Utilities & Helpers
 * Includes Toast Notifications, Native Dialog Controllers, Formatters, and Navbar Helpers.
 */

const TurfUI = {
  // Toast Notification System
  showToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ';
    toast.innerHTML = `
      <div style="display:flex;align-items:center;gap:0.6rem;">
        <span style="font-weight:bold;font-size:1.1rem;">${icon}</span>
        <span>${message}</span>
      </div>
      <button style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:1.1rem;" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  },

  // Native Dialog Controller
  openModal(modalId) {
    const dialog = document.getElementById(modalId);
    if (dialog && typeof dialog.showModal === 'function') {
      dialog.showModal();
    }
  },

  closeModal(modalId) {
    const dialog = document.getElementById(modalId);
    if (dialog && typeof dialog.close === 'function') {
      dialog.close();
    }
  },

  // Setup click outside to dismiss native dialog
  setupModalBackdropDismiss() {
    document.querySelectorAll('dialog.modal').forEach(dialog => {
      dialog.addEventListener('click', (event) => {
        const rect = dialog.getBoundingClientRect();
        const isInDialog = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (!isInDialog) {
          dialog.close();
        }
      });
    });
  },

  // Currency & Date Formatters
  formatISODate(dateObj) {
    const d = dateObj || new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // "1,2,3,4,5" -> "Mon–Fri"; days are 1=Mon..7=Sun
  formatRuleDays(days) {
    const d = String(days || '1,2,3,4,5,6,7');
    if (d === '1,2,3,4,5,6,7') return 'Every day';
    if (d === '1,2,3,4,5') return 'Mon–Fri';
    if (d === '6,7') return 'Sat–Sun';
    const names = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return d.split(',').map(n => names[Number(n)] || n).join(', ');
  },

  // Owners with one venue: show its full name instead of a disabled, truncated dropdown
  showSingleVenue(select, venue) {
    if (!select || !venue) return;
    const label = document.createElement('div');
    label.textContent = venue.name;
    label.style.cssText = 'color:#fff;font-weight:700;font-size:0.95rem;line-height:1.3;';
    select.replaceWith(label);
  },

  getTodayISODate() {
    return this.formatISODate(new Date());
  },

  formatCurrency(amount, currency = '₹') {
    return `${currency}${Number(amount).toLocaleString('en-IN')}`;
  },

  formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
      return d.toLocaleDateString('en-US', options);
    }
    return dateStr;
  },

  formatTime(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    return `${displayHour}:${m === 0 ? '00' : m} ${period}`;
  },

  // Mobile Menu Toggle
  // Delegated, because renderNavbarAuth() re-creates the button after this runs
  setupMobileNav() {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.mobile-menu-btn')) return;
      document.querySelector('.nav-links')?.classList.toggle('mobile-open');
    });
  },

  // Dynamic Navbar Authentication State & Role-Based Navigation
  renderNavbarAuth() {
    const navLinks = document.querySelector('.nav-links');
    const navActions = document.querySelector('.nav-actions');
    const pathname = window.location.pathname.toLowerCase();
    const isLoginPage = pathname.endsWith('login.html');
    const isRegisterPage = pathname.endsWith('register.html');
    const user = TurfStorage.getCurrentUser();

    // 1. Dynamically render main navigation links based on user role
    if (navLinks) {
      if (!user) {
        // Guest / Unregistered: Pure discovery & booking (no owner portal, no private player dashboard)
        navLinks.innerHTML = `
          <li><a href="index.html" class="nav-link">Home</a></li>
          <li><a href="venues.html" class="nav-link">Explore Venues</a></li>
        `;
      } else if (TurfStorage.isOwner(user)) {
        // Facility Owner: Administrative controls and facility management
        navLinks.innerHTML = `
          <li><a href="admin-dashboard.html" class="nav-link" style="color:var(--primary);font-weight:700;">🏟️ Owner Dashboard</a></li>
          <li><a href="admin-pricing.html" class="nav-link">Surge Pricing</a></li>
          <li><a href="admin-analytics.html" class="nav-link">Analytics</a></li>
          <li><a href="venues.html" class="nav-link">Public Catalog</a></li>
        `;
      } else {
        // Registered Player: Player reservation tools (no owner portal)
        navLinks.innerHTML = `
          <li><a href="index.html" class="nav-link">Home</a></li>
          <li><a href="venues.html" class="nav-link">Explore Venues</a></li>
          <li><a href="my-bookings.html" class="nav-link">My Bookings</a></li>
        `;
      }
    }

    // Auto highlight active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href && pathname.endsWith(href.split('?')[0])) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });

    if (!navActions) return;

    const isMobileBtn = navActions.querySelector('.mobile-menu-btn');
    const mobileBtnHtml = isMobileBtn ? isMobileBtn.outerHTML : '<button class="mobile-menu-btn" aria-label="Toggle menu">&#9776;</button>';

    // 2. Render right-hand action buttons / Profile pills
    if (user) {
      const initials = user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
      const isOwner = TurfStorage.isOwner(user);

      navActions.innerHTML = `
        <div style="display:flex;align-items:center;gap:0.75rem;">
          <a href="${isOwner ? 'admin-dashboard.html' : 'my-bookings.html'}" style="display:flex;align-items:center;gap:0.5rem;color:var(--text-inverse);background:rgba(255,255,255,0.08);padding:0.35rem 0.75rem;border-radius:var(--radius-full);border:1px solid rgba(255,255,255,0.15);transition:var(--transition);" title="View ${isOwner ? 'Facility Owner Portal' : 'Player Dashboard'}">
            <div style="width:28px;height:28px;background:var(--primary);color:var(--secondary);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.75rem;">
              ${initials}
            </div>
            <div class="nav-user-text" style="display:flex;flex-direction:column;text-align:left;">
              <span style="font-size:0.825rem;font-weight:700;line-height:1.1;">${user.fullName}</span>
              <span style="font-size:0.675rem;color:${isOwner ? 'var(--accent-amber)' : 'var(--primary)'};font-weight:600;">${isOwner ? '🏟️ Turf Owner' : '⚽ Player'}</span>
            </div>
          </a>
          <button class="btn btn-sm btn-outline" style="color:#cbd5e1;border-color:rgba(255,255,255,0.25);padding:0.4rem 0.7rem;font-size:0.8rem;" onclick="TurfStorage.logout()">
            Sign Out
          </button>
        </div>
        ${mobileBtnHtml}
      `;
    } else {
      if (isLoginPage) {
        navActions.innerHTML = `
          <div style="display:flex;align-items:center;gap:0.6rem;">
            <a href="register.html" class="btn btn-sm btn-primary">Create Account</a>
          </div>
          ${mobileBtnHtml}
        `;
      } else if (isRegisterPage) {
        navActions.innerHTML = `
          <div style="display:flex;align-items:center;gap:0.6rem;">
            <a href="login.html" class="btn btn-sm btn-outline" style="color:var(--text-inverse);border-color:rgba(255,255,255,0.3);">Sign In</a>
          </div>
          ${mobileBtnHtml}
        `;
      } else {
        navActions.innerHTML = `
          <div style="display:flex;align-items:center;gap:0.6rem;">
            <a href="login.html" class="btn btn-sm btn-outline" style="color:var(--text-inverse);border-color:rgba(255,255,255,0.25);">Sign In</a>
            <a href="register.html" class="btn btn-sm btn-primary">Sign Up</a>
          </div>
          ${mobileBtnHtml}
        `;
      }
    }

  }
};

document.addEventListener('DOMContentLoaded', () => {
  TurfUI.setupModalBackdropDismiss();
  TurfUI.setupMobileNav();
  TurfUI.renderNavbarAuth();
});
