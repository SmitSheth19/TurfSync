const { supabase, isSupabaseConfigured } = require('../config/supabase');
const DB = require('../config/db');

// Venues store sports as JSON; derive from courts when it's missing or empty
function venueSports(v, courts) {
  let sports = v.sports;
  if (typeof sports === 'string') { try { sports = JSON.parse(sports); } catch (e) { sports = []; } }
  if (!Array.isArray(sports) || sports.length === 0) sports = [...new Set(courts.map(c => c.sport))];
  return sports;
}

const dbAdapter = {
  isSupabase() {
    return isSupabaseConfigured() && supabase !== null;
  },

  // Venues
  async getVenues() {
    if (this.isSupabase()) {
      const { data, error } = await supabase.from('venues').select('*').order('created_at');
      if (!error && data) {
        // Also fetch courts
        const { data: courts } = await supabase.from('courts').select('*');
        return data.map(v => {
          const venueCourts = (courts || []).filter(c => c.venue_id === v.id);
          return {
            ...v,
            sports: venueSports(v, venueCourts),
            cancellationPolicyHours: v.cancellation_policy_hours,
            openingTime: v.opening_time,
            closingTime: v.closing_time,
            reviewCount: v.review_count,
            courts: venueCourts.map(c => ({
              ...c,
              venueId: c.venue_id,
              baseRate: Number(c.base_rate),
              isActive: c.is_active,
              isIndoor: c.is_indoor
            }))
          };
        });
      }
    }
    return DB.venues.map(v => {
      const courts = DB.courts.filter(c => c.venueId === v.id);
      return { ...v, courts };
    });
  },

  async getVenueById(id) {
    if (this.isSupabase()) {
      const { data: v, error } = await supabase.from('venues').select('*').eq('id', id).single();
      if (!error && v) {
        const { data: courts } = await supabase.from('courts').select('*').eq('venue_id', id);
        return {
          ...v,
          sports: venueSports(v, courts || []),
          cancellationPolicyHours: v.cancellation_policy_hours,
          openingTime: v.opening_time,
          closingTime: v.closing_time,
          reviewCount: v.review_count,
          courts: (courts || []).map(c => ({
            ...c,
            venueId: c.venue_id,
            baseRate: Number(c.base_rate),
            isActive: c.is_active,
            isIndoor: c.is_indoor
          }))
        };
      }
    }
    const venue = DB.venues.find(v => v.id === id);
    if (!venue) return null;
    const courts = DB.courts.filter(c => c.venueId === venue.id);
    return { ...venue, courts };
  },

  // Courts
  async getCourts(venueId) {
    if (this.isSupabase()) {
      let query = supabase.from('courts').select('*');
      if (venueId) query = query.eq('venue_id', venueId);
      const { data, error } = await query;
      if (!error && data) {
        return data.map(c => ({
          ...c,
          venueId: c.venue_id,
          baseRate: Number(c.base_rate),
          isActive: c.is_active,
          isIndoor: c.is_indoor
        }));
      }
    }
    if (venueId) return DB.courts.filter(c => c.venueId === venueId);
    return DB.courts;
  },

  async getCourtById(id) {
    if (this.isSupabase()) {
      const { data: c, error } = await supabase.from('courts').select('*').eq('id', id).single();
      if (!error && c) {
        return {
          ...c,
          venueId: c.venue_id,
          baseRate: Number(c.base_rate),
          isActive: c.is_active,
          isIndoor: c.is_indoor
        };
      }
    }
    return DB.courts.find(c => c.id === id) || null;
  },

  async toggleCourt(id) {
    const court = await this.getCourtById(id);
    if (!court) return null;
    const newStatus = !court.isActive;

    if (this.isSupabase()) {
      await supabase.from('courts').update({ is_active: newStatus }).eq('id', id);
    }
    const local = DB.courts.find(c => c.id === id);
    if (local) local.isActive = newStatus;

    return { ...court, isActive: newStatus };
  },

  // Users
  async getUserByEmail(email) {
    const cleanEmail = email.trim().toLowerCase();
    if (this.isSupabase()) {
      const { data, error } = await supabase.from('users').select('*').eq('email', cleanEmail).single();
      if (!error && data) {
        return {
          id: data.id,
          fullName: data.full_name,
          email: data.email,
          phone: data.phone,
          passwordHash: data.password_hash,
          role: data.role,
          venueId: data.venue_id
        };
      }
    }
    return DB.users.find(u => u.email.toLowerCase() === cleanEmail) || null;
  },

  async getUserById(id) {
    if (this.isSupabase()) {
      const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
      if (!error && data) {
        return {
          id: data.id,
          fullName: data.full_name,
          email: data.email,
          phone: data.phone,
          passwordHash: data.password_hash,
          role: data.role,
          venueId: data.venue_id
        };
      }
    }
    return DB.users.find(u => u.id === id) || null;
  },

  async createUser(payload) {
    if (this.isSupabase()) {
      await supabase.from('users').insert([{
        id: payload.id,
        full_name: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        password_hash: payload.passwordHash,
        role: payload.role,
        venue_id: payload.venueId
      }]);
    }
    DB.users.push(payload);
    return payload;
  },

  async createVenue(venue) {
    if (this.isSupabase()) {
      await supabase.from('venues').insert([{
        id: venue.id,
        name: venue.name,
        tagline: venue.tagline,
        description: venue.description,
        address: venue.address,
        city: venue.city,
        area: venue.area,
        rating: venue.rating || 5.0,
        review_count: venue.reviewCount || 0,
        cancellation_policy_hours: venue.cancellationPolicyHours || 24,
        opening_time: venue.openingTime || '06:00',
        closing_time: venue.closingTime || '23:00',
        image: venue.image
      }]);
    }
    DB.venues.push(venue);
    return venue;
  },

  async createCourt(court) {
    if (this.isSupabase()) {
      await supabase.from('courts').insert([{
        id: court.id,
        venue_id: court.venueId,
        name: court.name,
        sport: court.sport,
        surface: court.surface,
        is_indoor: court.isIndoor || false,
        base_rate: court.baseRate,
        is_active: court.isActive !== undefined ? court.isActive : true
      }]);
    }
    DB.courts.push(court);
    return court;
  },

  // Bookings
  async getBookings(filter = {}) {
    if (this.isSupabase()) {
      let q = supabase.from('bookings').select('*').order('created_at', { ascending: false });
      if (filter.venueId) q = q.eq('venue_id', filter.venueId);
      if (filter.courtId) q = q.eq('court_id', filter.courtId);
      if (filter.userEmail) q = q.eq('user_email', filter.userEmail);
      if (filter.date) q = q.eq('booking_date', filter.date);
      if (filter.status) q = q.eq('status', filter.status);

      const { data, error } = await q;
      if (!error && data) {
        return data.map(b => ({
          id: b.id,
          venueId: b.venue_id,
          courtId: b.court_id,
          courtName: b.court_name,
          sport: b.sport,
          venueName: b.venue_name,
          userId: b.user_id,
          userName: b.user_name,
          userEmail: b.user_email,
          userPhone: b.user_phone,
          bookingDate: b.booking_date,
          startTime: b.start_time,
          endTime: b.end_time,
          baseAmount: Number(b.base_amount),
          totalAmount: Number(b.total_amount),
          status: b.status,
          paymentStatus: b.payment_status,
          paymentMethod: b.payment_method,
          isRecurring: b.is_recurring,
          cancellationReason: b.cancellation_reason,
          refundAmount: Number(b.refund_amount || 0),
          refundPercent: b.refund_percent || 0
        }));
      }
    }

    return DB.bookings.filter(b => {
      if (filter.venueId && b.venueId !== filter.venueId) return false;
      if (filter.courtId && b.courtId !== filter.courtId) return false;
      if (filter.userEmail && b.userEmail !== filter.userEmail) return false;
      if (filter.date && b.bookingDate !== filter.date) return false;
      if (filter.status && b.status !== filter.status) return false;
      return true;
    });
  },

  async createBooking(booking) {
    if (this.isSupabase()) {
      const { error } = await supabase.from('bookings').insert([{
        id: booking.id,
        venue_id: booking.venueId,
        court_id: booking.courtId,
        court_name: booking.courtName,
        sport: booking.sport,
        venue_name: booking.venueName,
        user_id: booking.userId,
        user_name: booking.userName,
        user_email: booking.userEmail,
        user_phone: booking.userPhone,
        booking_date: booking.bookingDate,
        start_time: booking.startTime,
        end_time: booking.endTime,
        base_amount: booking.baseAmount,
        total_amount: booking.totalAmount,
        status: booking.status || 'CONFIRMED',
        payment_status: booking.paymentStatus || 'SUCCEEDED',
        payment_method: booking.paymentMethod,
        is_recurring: booking.isRecurring || false,
        created_at: booking.createdAt || new Date().toISOString()
      }]);
      if (error && error.code === '23505') { // Postgres Unique Constraint Violation
        const err = new Error('Slot already reserved in database!');
        err.code = 409;
        throw err;
      }
    }
    DB.bookings.unshift(booking);
    return booking;
  },

  async updateBooking(id, updates) {
    if (this.isSupabase()) {
      const dbUpdates = {};
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.cancelledAt) dbUpdates.cancelled_at = updates.cancelledAt;
      if (updates.cancellationReason) dbUpdates.cancellation_reason = updates.cancellationReason;
      if (updates.refundAmount !== undefined) dbUpdates.refund_amount = updates.refundAmount;
      if (updates.refundPercent !== undefined) dbUpdates.refund_percent = updates.refundPercent;
      if (updates.paymentStatus) dbUpdates.payment_status = updates.paymentStatus;

      await supabase.from('bookings').update(dbUpdates).eq('id', id);
    }
    const local = DB.bookings.find(b => b.id === id);
    if (local) {
      Object.assign(local, updates);
      return local;
    }
    return null;
  },

  // Pricing Rules
  async getPricingRules(venueId) {
    if (this.isSupabase()) {
      let q = supabase.from('pricing_rules').select('*');
      if (venueId) q = q.eq('venue_id', venueId);
      const { data, error } = await q;
      if (!error && data) {
        return data.map(r => ({
          id: r.id,
          venueId: r.venue_id,
          name: r.name,
          days: r.days,
          startTime: r.start_time,
          endTime: r.end_time,
          multiplier: Number(r.multiplier),
          badgeText: r.badge_text
        }));
      }
    }
    if (venueId) return DB.pricingRules.filter(r => r.venueId === venueId);
    return DB.pricingRules;
  },

  async createPricingRule(rule) {
    if (this.isSupabase()) {
      await supabase.from('pricing_rules').insert([{
        id: rule.id,
        venue_id: rule.venueId,
        name: rule.name,
        days: rule.days || '1,2,3,4,5,6,7',
        start_time: rule.startTime,
        end_time: rule.endTime,
        multiplier: rule.multiplier,
        badge_text: rule.badgeText
      }]);
    }
    DB.pricingRules.push(rule);
    return rule;
  },

  async deletePricingRule(id) {
    if (this.isSupabase()) {
      await supabase.from('pricing_rules').delete().eq('id', id);
    }
    const idx = DB.pricingRules.findIndex(r => r.id === id);
    if (idx !== -1) DB.pricingRules.splice(idx, 1);
  },

  // Waitlist
  async getWaitlist(filter = {}) {
    if (this.isSupabase()) {
      let q = supabase.from('waitlist').select('*, courts(name), venues(name)');
      if (filter.userEmail) q = q.eq('user_email', filter.userEmail);
      if (filter.courtId) q = q.eq('court_id', filter.courtId);
      const { data, error } = await q;
      if (!error && data) {
        return data.map(w => ({
          id: w.id,
          venueId: w.venue_id,
          courtId: w.court_id,
          courtName: w.courts?.name || 'Sports Court',
          venueName: w.venues?.name || 'Sports Arena',
          bookingDate: w.booking_date,
          date: w.booking_date,
          startTime: w.start_time,
          userId: w.user_id,
          userName: w.user_name,
          userEmail: w.user_email,
          userPhone: w.user_phone,
          status: w.status,
          createdAt: w.created_at,
          notifiedAt: w.notified_at
        }));
      }
    }
    return DB.waitlist.filter(w => {
      if (filter.userEmail && w.userEmail !== filter.userEmail) return false;
      if (filter.courtId && w.courtId !== filter.courtId) return false;
      return true;
    });
  },

  async createWaitlist(entry) {
    if (this.isSupabase()) {
      await supabase.from('waitlist').insert([{
        id: entry.id,
        venue_id: entry.venueId,
        court_id: entry.courtId,
        booking_date: entry.bookingDate || entry.date,
        start_time: entry.startTime,
        user_id: entry.userId,
        user_name: entry.userName,
        user_email: entry.userEmail,
        user_phone: entry.userPhone,
        status: entry.status || 'WAITING'
      }]);
    }
    DB.waitlist.push(entry);
    return entry;
  },

  async updateWaitlistStatus(id, status) {
    if (this.isSupabase()) {
      await supabase.from('waitlist').update({ status, notified_at: new Date().toISOString() }).eq('id', id);
    }
    const local = DB.waitlist.find(w => w.id === id);
    if (local) local.status = status;
  },

  async deleteWaitlist(id) {
    if (this.isSupabase()) {
      await supabase.from('waitlist').delete().eq('id', id);
    }
    const idx = DB.waitlist.findIndex(w => w.id === id);
    if (idx !== -1) DB.waitlist.splice(idx, 1);
  },

  // Reviews
  async getReviews(venueId) {
    if (this.isSupabase()) {
      let q = supabase.from('reviews').select('*').order('date', { ascending: false });
      if (venueId) q = q.eq('venue_id', venueId);
      const { data, error } = await q;
      if (!error && data) {
        return data.map(r => ({
          id: r.id,
          venueId: r.venue_id,
          userName: r.user_name,
          rating: r.rating,
          comment: r.comment,
          date: r.date
        }));
      }
    }
    return venueId ? DB.reviews.filter(r => r.venueId === venueId) : DB.reviews;
  },

  async createReview(review) {
    if (this.isSupabase()) {
      await supabase.from('reviews').insert([{
        id: review.id,
        venue_id: review.venueId,
        user_name: review.userName,
        rating: review.rating,
        comment: review.comment,
        date: review.date
      }]);
    }
    DB.reviews.unshift(review);
    return review;
  }
};

module.exports = dbAdapter;
