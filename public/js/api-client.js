/**
 * TurfSync Frontend API Bridge
 * Connects the UI to the Express Backend (/api — relative, works on Vercel & localhost).
 * Real-time slot updates use Supabase Realtime in production (see js/supabase-client.js).
 * Falls back to TurfStorage (localStorage) if the backend is offline.
 */

const TurfAPI = {
  BASE_URL: '/api',
  isBackendOnline: null,
  _realtimeChannel: null,

  initWebSocket(onSlotUpdate) {
    // In production: use Supabase Realtime (initialized in js/supabase-client.js)
    if (window.TurfRealtime) {
      if (this._realtimeChannel) return; // already subscribed
      this._realtimeChannel = window.TurfRealtime.subscribeToBookings((data) => {
        if (typeof onSlotUpdate === 'function') onSlotUpdate(data);
      });
      console.log('📡 Connected to TurfSync Live Slot Stream via Supabase Realtime');
      return;
    }
    // In local dev: fall back to WebSocket if available
    try {
      const ws = new WebSocket('ws://localhost:5000');
      ws.onopen = () => console.log('📡 Connected to TurfSync Live Slot WebSocket Stream (local)');
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'SLOT_BOOKED' || data.type === 'SLOT_CANCELLED') {
            if (typeof onSlotUpdate === 'function') onSlotUpdate(data);
          }
        } catch (e) {}
      };
    } catch (e) {
      console.warn('Real-time updates not available:', e);
    }
  },

  async checkBackendHealth() {
    if (this.isBackendOnline !== null) return this.isBackendOnline;
    // Share one in-flight check; allow time for a serverless cold start
    if (!this._healthCheck) {
      this._healthCheck = fetch(`${this.BASE_URL}/health`, { method: 'GET', signal: AbortSignal.timeout(10000) })
        .then(res => res.ok)
        .catch(() => false)
        .then(ok => (this.isBackendOnline = ok));
    }
    return this._healthCheck;
  },

  // Pull venues, pricing, reviews, bookings and waitlist from the backend into the
  // TurfStorage cache that the pages render from. Resolves false when offline.
  sync() {
    if (!this._sync) {
      this._sync = (async () => {
        if (!(await this.checkBackendHealth())) return false;
        try {
          const res = await fetch(`${this.BASE_URL}/sync`, { headers: this.getAuthHeaders() });
          if (!res.ok) return false;
          const snap = await res.json();
          const data = TurfStorage.getData();
          data.venues = snap.venues;
          data.pricingRules = snap.pricingRules;
          data.reviews = snap.reviews;
          data.bookings = snap.bookings.map(b => this._normalize(b));
          data.waitlist = snap.waitlist.map(w => this._normalize(w));
          TurfStorage.saveData(data);
          return true;
        } catch (e) {
          console.warn('Sync with backend failed, using cached data:', e);
          return false;
        }
      })();
    }
    return this._sync;
  },

  // Run fn once the DOM is ready and the backend sync has finished (or failed)
  onReady(fn) {
    const dom = document.readyState === 'loading'
      ? new Promise(r => document.addEventListener('DOMContentLoaded', r))
      : Promise.resolve();
    Promise.all([dom, this.sync()]).then(() => fn());
  },

  // The pages use `date`; the API uses `bookingDate`
  _normalize(item) {
    return { ...item, date: item.date || item.bookingDate };
  },

  // Fire-and-forget write; local state has already been updated optimistically
  async _send(method, path, body) {
    if (!(await this.checkBackendHealth())) return null;
    try {
      const res = await fetch(`${this.BASE_URL}${path}`, {
        method,
        headers: this.getAuthHeaders(),
        body: body ? JSON.stringify(body) : undefined
      });
      if (!res.ok) console.warn(`${method} ${path} failed:`, res.status);
      return res;
    } catch (e) {
      console.warn(`${method} ${path} failed:`, e);
      return null;
    }
  },

  joinWaitlist(entry) {
    const local = TurfStorage.joinWaitlist(entry);
    this._send('POST', '/waitlist', { ...local, bookingDate: local.date });
    return local;
  },

  cancelWaitlist(id) {
    TurfStorage.cancelWaitlist(id);
    this._send('DELETE', `/waitlist/${id}`);
  },

  addPricingRule(rule) {
    const local = TurfStorage.addPricingRule(rule);
    this._send('POST', '/pricing', local);
    return local;
  },

  deletePricingRule(id) {
    TurfStorage.deletePricingRule(id);
    this._send('DELETE', `/pricing/${id}`);
  },

  addReview(venueId, rating, comment) {
    return this._writeAndSync('POST', `/venues/${venueId}/reviews`, { rating, comment });
  },

  // Writes whose result the user must see: wait for the server, then re-sync the local cache
  async _writeAndSync(method, path, body) {
    try {
      const res = await fetch(`${this.BASE_URL}${path}`, {
        method,
        headers: this.getAuthHeaders(),
        body: body ? JSON.stringify(body) : undefined
      });
      const data = res.status === 204 ? null : await res.json().catch(() => ({}));
      if (!res.ok) return { success: false, error: data?.error || 'Could not save changes.' };
      this._sync = null;
      await this.sync();
      return { success: true, data };
    } catch (e) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  updateVenue(fields) { return this._writeAndSync('PUT', '/admin/venue', fields); },
  addCourt(fields) { return this._writeAndSync('POST', '/admin/courts', fields); },
  updateCourt(id, fields) { return this._writeAndSync('PUT', `/admin/courts/${id}`, fields); },
  deleteCourt(id) { return this._writeAndSync('DELETE', `/admin/courts/${id}`); },

  toggleCourt(courtId) {
    this._send('PATCH', `/admin/courts/${courtId}/toggle`);
  },

  // Walk-in booking recorded by a venue owner
  async createOfflineBooking(payload) {
    if (await this.checkBackendHealth()) {
      try {
        const res = await fetch(`${this.BASE_URL}/admin/offline-booking`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ ...payload, bookingDate: payload.date })
        });
        const data = await res.json();
        if (!res.ok) return { success: false, error: data.error || 'Could not save booking.' };
        return { success: true, booking: TurfStorage.createBooking(this._normalize(data)) };
      } catch (e) {
        console.warn('Backend offline booking failed, saving locally:', e);
      }
    }
    return { success: true, booking: TurfStorage.createBooking(payload) };
  },

  getAuthHeaders() {
    const token = localStorage.getItem('TURFSYNC_JWT_TOKEN');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  },

  // Auth Operations
  async login(email, password) {
    const online = await this.checkBackendHealth();
    if (online) {
      try {
        const res = await fetch(`${this.BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem('TURFSYNC_JWT_TOKEN', data.token);
          TurfStorage.setCurrentUser(data.user);
          return { success: true, user: data.user, token: data.token };
        }
        return { success: false, error: data.error || 'Login failed.' };
      } catch (err) {
        console.warn('Backend login request failed, falling back to local storage:', err);
      }
    }
    return TurfStorage.login(email, password);
  },

  async register(payload) {
    const online = await this.checkBackendHealth();
    if (online) {
      try {
        const res = await fetch(`${this.BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem('TURFSYNC_JWT_TOKEN', data.token);
          TurfStorage.setCurrentUser(data.user);
          return { success: true, user: data.user, token: data.token };
        }
        return { success: false, error: data.error || 'Registration failed.' };
      } catch (err) {
        console.warn('Backend registration failed, falling back to local storage:', err);
      }
    }
    return TurfStorage.register(payload);
  },

  // Venue Operations
  async getVenues() {
    const online = await this.checkBackendHealth();
    if (online) {
      try {
        const res = await fetch(`${this.BASE_URL}/venues`);
        // Courts are already embedded in each venue by the API
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Failed to fetch venues from backend, using local data:', e);
      }
    }
    return TurfStorage.getVenues();
  },

  // Slot Availability Matrix
  async getSlots(venueId, date) {
    const online = await this.checkBackendHealth();
    if (online) {
      try {
        const res = await fetch(`${this.BASE_URL}/bookings/slots?venueId=${venueId}&date=${date}`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Failed to fetch live slots from backend, using local calculation:', e);
      }
    }
    return null; // Signals caller to use local calendar calculation
  },

  // Booking Operations
  async confirmBooking(bookingPayload) {
    const online = await this.checkBackendHealth();
    if (online) {
      try {
        const res = await fetch(`${this.BASE_URL}/bookings/confirm`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ ...bookingPayload, bookingDate: bookingPayload.date })
        });
        if (res.ok) {
          const booking = TurfStorage.createBooking(this._normalize(await res.json())); // Keep local storage in sync
          return { success: true, booking };
        } else if (res.status === 409) {
          return { success: false, error: 'Slot already reserved by another player!' };
        }
        const data = await res.json().catch(() => ({}));
        return { success: false, error: data.error || 'Booking failed. Please try again.' };
      } catch (e) {
        console.warn('Backend booking failed, falling back to local storage:', e);
      }
    }
    const booking = TurfStorage.createBooking(bookingPayload);
    return { success: true, booking };
  },

  // Cancellation with Tiered Refund
  async cancelBooking(bookingId, reason) {
    const online = await this.checkBackendHealth();
    if (online) {
      try {
        const res = await fetch(`${this.BASE_URL}/bookings/${bookingId}/cancel`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ reason })
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          // Mirror the server's outcome (incl. its refund) in the local cache
          const cache = TurfStorage.getData();
          const local = cache.bookings.find(b => b.id === bookingId);
          if (local) {
            Object.assign(local, {
              status: 'CANCELLED', cancelledAt: new Date().toISOString(), cancellationReason: reason,
              refundAmount: data.refund?.refundAmount || 0, refundPercent: data.refund?.refundPercent || 0,
              paymentStatus: data.refund?.refundPercent > 0 ? 'REFUNDED' : 'SUCCEEDED'
            });
            TurfStorage.saveData(cache);
          }
          return { success: true, booking: local, refund: data.refund };
        }
        return { success: false, error: data.error || 'Cancellation failed.' };
      } catch (e) {
        console.warn('Backend cancellation failed, falling back to local storage:', e);
      }
    }
    const local = TurfStorage.cancelBooking(bookingId, reason);
    return local ? { success: true, booking: local.booking, refund: local.refundInfo } : { success: false, error: 'Booking not found.' };
  }
};

window.TurfAPI = TurfAPI;
