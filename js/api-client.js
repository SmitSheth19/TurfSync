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
          body: JSON.stringify(bookingPayload)
        });
        if (res.ok) {
          const booking = await res.json();
          TurfStorage.createBooking(booking); // Keep local storage in sync
          return { success: true, booking };
        } else if (res.status === 409) {
          return { success: false, error: 'Slot already reserved by another player!' };
        }
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
        if (res.ok) {
          const booking = await res.json();
          TurfStorage.cancelBooking(bookingId, reason); // Sync local storage
          return { success: true, booking };
        }
      } catch (e) {
        console.warn('Backend cancellation failed, falling back to local storage:', e);
      }
    }
    return TurfStorage.cancelBooking(bookingId, reason);
  }
};
