/**
 * TurfSync Supabase Browser Client
 * Used for Supabase Realtime slot updates (replaces WebSockets in production).
 * The ANON key is safe to expose in the browser — it is the public key.
 */
(function () {
  // Injected at build time by Vercel env vars via a meta tag, or falls back to window config
  const SUPABASE_URL = (window.TURFSYNC_CONFIG && window.TURFSYNC_CONFIG.supabaseUrl) || '';
  const SUPABASE_ANON_KEY = (window.TURFSYNC_CONFIG && window.TURFSYNC_CONFIG.supabaseAnonKey) || '';

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase Realtime: config not found, real-time updates disabled.');
    window.TurfRealtime = null;
    return;
  }

  // Use the Supabase CDN client
  const { createClient } = window.supabase;
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  window.TurfRealtime = {
    client,
    /**
     * Subscribe to booking changes for real-time slot matrix updates.
     * @param {Function} onBookingChange - called with the changed booking row
     */
    subscribeToBookings(onBookingChange) {
      return client
        .channel('turfsync-bookings')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'bookings' },
          (payload) => {
            if (typeof onBookingChange === 'function') {
              onBookingChange({
                type: payload.eventType === 'INSERT' ? 'SLOT_BOOKED' : 'SLOT_UPDATED',
                booking: payload.new || payload.old
              });
            }
          }
        )
        .subscribe();
    }
  };

  console.log('Supabase Realtime client initialized');
})();
