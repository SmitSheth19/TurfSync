/**
 * TurfSync Local Storage & State Management Service
 * Provides full persistence and state methods for multi-venue data,
 * slot bookings, hold reservations, dynamic pricing rules, waitlist, and tiered refunds.
 */

const TurfStorage = {
  STORAGE_KEY: 'TURFSYNC_APP_DATA_V4',
  AUTH_USER_KEY: 'TURFSYNC_AUTH_USER',

  init() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
    } else {
      // Sync any new seed users if not yet present
      try {
        const current = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
        if (current && current.users) {
          let updated = false;
          DEFAULT_DATA.users.forEach(defUser => {
            if (!current.users.some(u => u.email.toLowerCase() === defUser.email.toLowerCase())) {
              current.users.push(defUser);
              updated = true;
            }
          });
          if (updated) localStorage.setItem(this.STORAGE_KEY, JSON.stringify(current));
        }
      } catch (e) {}
    }
  },

  getData() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || DEFAULT_DATA;
    } catch (e) {
      console.error('Failed to parse local storage data, resetting...', e);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
      return DEFAULT_DATA;
    }
  },

  saveData(data) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  },

  // Venue Operations
  getVenues() {
    return this.getData().venues || [];
  },

  // The API uses ROLE_VENUE_ADMIN; locally created accounts use VENUE_ADMIN
  isOwner(user) {
    return !!user && (user.role === 'VENUE_ADMIN' || user.role === 'ROLE_VENUE_ADMIN');
  },

  getVenuesForUser(user) {
    const venues = this.getVenues();
    if (this.isOwner(user)) {
      return venues.filter(v => v.id === user.venueId);
    }
    return venues;
  },

  getVenueById(id) {
    return this.getVenues().find(v => v.id === id) || null;
  },

  getCourtById(courtId) {
    for (const venue of this.getVenues()) {
      const court = venue.courts.find(c => c.id === courtId);
      if (court) return { ...court, venueId: venue.id, venueName: venue.name };
    }
    return null;
  },

  // Pricing Engine Evaluation
  calculateSlotPrice(courtId, dateStr, timeStr) {
    const court = this.getCourtById(courtId);
    if (!court) return { basePrice: 0, finalPrice: 0, multipliers: [], badge: null };

    const data = this.getData();
    const rules = (data.pricingRules || []).filter(r => r.venueId === court.venueId);

    // Calculate day of week: JS getDay() is 0 (Sun) to 6 (Sat). We map 1(Sun)..7(Sat) or check day
    const dateObj = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = dateObj.getDay() === 0 ? 7 : dateObj.getDay(); // 1=Mon..7=Sun

    let totalMultiplier = 1.0;
    let appliedRules = [];
    let badgeText = null;

    const [hour] = timeStr.split(':').map(Number);

    for (const rule of rules) {
      const [startH] = rule.startTime.split(':').map(Number);
      const [endH] = rule.endTime.split(':').map(Number);

      const matchesDay = !rule.days || rule.days.includes(dayOfWeek);
      const matchesTime = hour >= startH && hour < endH;

      if (matchesDay && matchesTime) {
        totalMultiplier *= rule.multiplier;
        appliedRules.push(rule);
        badgeText = rule.badgeText;
      }
    }

    const finalPrice = Math.round(court.baseRate * totalMultiplier);

    return {
      basePrice: court.baseRate,
      finalPrice: finalPrice,
      multiplier: totalMultiplier,
      appliedRules: appliedRules,
      badge: badgeText
    };
  },

  // Booking Operations
  getBookings() {
    return this.getData().bookings || [];
  },

  getBookingById(id) {
    return this.getBookings().find(b => b.id === id) || null;
  },

  getUserBookings(userEmail) {
    const email = userEmail || this.getCurrentUser()?.email;
    if (!email) return [];
    return this.getBookings()
      .filter(b => b.userEmail === email)
      .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
  },

  // Confirmed and not yet started (venue times are Mumbai time)
  isUpcoming(booking) {
    return booking.status === 'CONFIRMED' && new Date(`${booking.date}T${booking.startTime}:00+05:30`) > new Date();
  },

  isSlotBooked(courtId, dateStr, timeStr) {
    const bookings = this.getBookings();
    return bookings.some(b => 
      b.courtId === courtId && 
      b.date === dateStr && 
      b.startTime === timeStr && 
      (b.status === 'CONFIRMED' || b.status === 'HOLD')
    );
  },

  getSlotStatus(courtId, dateStr, timeStr) {
    const booking = this.getBookings().find(b => 
      b.courtId === courtId && 
      b.date === dateStr && 
      b.startTime === timeStr && 
      (b.status === 'CONFIRMED' || b.status === 'HOLD')
    );
    if (!booking) return 'AVAILABLE';
    return booking.status; // 'CONFIRMED' or 'HOLD'
  },

  createBooking(bookingPayload) {
    const data = this.getData();
    const newBooking = {
      id: `TS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      status: 'CONFIRMED',
      paymentStatus: 'SUCCEEDED',
      ...bookingPayload
    };

    data.bookings.unshift(newBooking);
    this.saveData(data);
    return newBooking;
  },

  // Tiered Cancellation Engine
  // Mirrors server/services/cancellationEngine.js: tiers follow the venue's policy hours
  calculateRefund(booking) {
    const bookingDateTime = new Date(`${booking.date}T${booking.startTime}:00+05:30`);
    const now = new Date();
    const diffHours = (bookingDateTime - now) / (1000 * 60 * 60);
    const policyHours = this.getVenueById(booking.venueId)?.cancellationPolicyHours || 24;
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
      diffHours: Math.max(0, diffHours.toFixed(1)),
      refundPercent,
      tierLabel,
      refundAmount,
      currency: '₹'
    };
  },

  cancelBooking(bookingId, reason = 'Player requested cancellation') {
    const data = this.getData();
    const booking = data.bookings.find(b => b.id === bookingId);
    if (!booking) return null;

    const refundInfo = this.calculateRefund(booking);

    booking.status = 'CANCELLED';
    booking.cancelledAt = new Date().toISOString();
    booking.cancellationReason = reason;
    booking.refundAmount = refundInfo.refundAmount;
    booking.refundPercent = refundInfo.refundPercent;
    booking.paymentStatus = refundInfo.refundPercent > 0 ? 'REFUNDED' : 'SUCCEEDED';

    this.saveData(data);

    // Auto promote waitlist if exists for this slot
    this.promoteWaitlistForSlot(booking.courtId, booking.date, booking.startTime);

    return { booking, refundInfo };
  },

  // Waitlist System
  getUserWaitlists(userEmail) {
    const email = userEmail || this.getCurrentUser()?.email;
    if (!email) return [];
    return (this.getData().waitlist || []).filter(w => w.userEmail === email);
  },

  joinWaitlist(entry) {
    const data = this.getData();
    const newEntry = {
      id: `wl-${Date.now()}`,
      status: 'WAITING',
      createdAt: new Date().toISOString(),
      ...entry
    };
    data.waitlist = data.waitlist || [];
    data.waitlist.push(newEntry);
    this.saveData(data);
    return newEntry;
  },

  cancelWaitlist(waitlistId) {
    const data = this.getData();
    data.waitlist = (data.waitlist || []).filter(w => w.id !== waitlistId);
    this.saveData(data);
    return true;
  },

  promoteWaitlistForSlot(courtId, dateStr, timeStr) {
    const data = this.getData();
    const candidate = (data.waitlist || []).find(w => 
      w.courtId === courtId && 
      w.date === dateStr && 
      w.startTime === timeStr && 
      w.status === 'WAITING'
    );
    if (candidate) {
      candidate.status = 'NOTIFIED';
      candidate.notifiedAt = new Date().toISOString();
      this.saveData(data);
      console.log(`[Waitlist Notification Triggered] Email/SMS sent to ${candidate.userName} (${candidate.userEmail}) for released slot.`);
    }
  },

  // Player Dashboard KPI Statistics
  getPlayerStats(userEmail) {
    const bookings = this.getUserBookings(userEmail);
    const waitlists = this.getUserWaitlists(userEmail);

    const activeBookings = bookings.filter(b => this.isUpcoming(b));
    const pastOrCompleted = bookings.filter(b => b.status === 'CONFIRMED' && !this.isUpcoming(b));
    const activeWaitlists = waitlists.filter(w => w.status === 'WAITING' || w.status === 'NOTIFIED');

    // Calculate favorite sport
    const sportCounts = {};
    bookings.filter(b => b.status === 'CONFIRMED').forEach(b => {
      const sp = b.sport || 'FOOTBALL';
      sportCounts[sp] = (sportCounts[sp] || 0) + 1;
    });

    let favSport = null;
    let maxCount = 0;
    for (const [sport, count] of Object.entries(sportCounts)) {
      if (count > maxCount) {
        maxCount = count;
        favSport = sport;
      }
    }

    const sportDisplayNames = {
      'FOOTBALL': 'Football (7v7 / 5v5)',
      'CRICKET': 'Box Cricket',
      'TENNIS': 'Lawn Tennis',
      'PICKLEBALL': 'Pickleball',
      'BADMINTON': 'Badminton'
    };

    return {
      activePasses: activeBookings.length,
      totalMatches: pastOrCompleted.length,
      activeWaitlists: activeWaitlists.length,
      favoriteSport: favSport ? (sportDisplayNames[favSport] || favSport) : '—',
      activeBookings,
      waitlists
    };
  },

  // Dynamic Pricing Rules Management
  getPricingRules(venueId) {
    const rules = this.getData().pricingRules || [];
    if (!venueId) return rules;
    return rules.filter(r => r.venueId === venueId);
  },

  addPricingRule(rule) {
    const data = this.getData();
    const newRule = {
      id: `rule-${Date.now()}`,
      ...rule
    };
    data.pricingRules.push(newRule);
    this.saveData(data);
    return newRule;
  },

  deletePricingRule(ruleId) {
    const data = this.getData();
    data.pricingRules = (data.pricingRules || []).filter(r => r.id !== ruleId);
    this.saveData(data);
  },

  // Reviews
  getVenueReviews(venueId) {
    return (this.getData().reviews || []).filter(r => r.venueId === venueId);
  },

  addReview(review) {
    const data = this.getData();
    const newReview = {
      id: `rev-${Date.now()}`,
      date: new Date().toLocaleDateString('en-CA'), // local YYYY-MM-DD
      ...review
    };
    data.reviews.unshift(newReview);
    this.saveData(data);
    return newReview;
  },

  // User Authentication & Session Management
  getUsers() {
    return this.getData().users || DEFAULT_DATA.users;
  },

  getCurrentUser() {
    try {
      const stored = localStorage.getItem(this.AUTH_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  },

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem(this.AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.AUTH_USER_KEY);
    }
  },

  login(email, password) {
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    
    if (!user) {
      return { success: false, error: 'No account found with this email address.' };
    }

    if (user.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    const authSession = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      venueId: user.venueId || null
    };

    this.setCurrentUser(authSession);
    return { success: true, user: authSession };
  },

  register(payload) {
    const data = this.getData();
    data.users = data.users || DEFAULT_DATA.users;

    const existing = data.users.find(u => u.email.toLowerCase() === payload.email.trim().toLowerCase());
    if (existing) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    let assignedVenueId = payload.venueId;
    if (payload.role === 'VENUE_ADMIN' || payload.role === 'ROLE_VENUE_ADMIN') {
      if (payload.venueName) {
        assignedVenueId = `venue-${Date.now()}`;
        const newVenue = {
          id: assignedVenueId,
          name: payload.venueName,
          tagline: `Premier Sports Arena in Mumbai`,
          description: `Modern sports facility managed by ${payload.fullName}. Featuring world-class turf grounds and real-time scheduling.`,
          address: "Sports Hub, Mumbai",
          city: "Mumbai",
          area: "Mumbai",
          sports: ["FOOTBALL", "CRICKET"],
          rating: 5.0,
          reviewCount: 0,
          image: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=800&q=80",
          cancellationPolicyHours: 24,
          openingTime: "06:00",
          closingTime: "23:00",
          courts: [
            {
              id: `court-${Date.now()}-1`,
              name: "Ground 1 (Main Turf)",
              sport: "FOOTBALL",
              surface: "AstroTurf Pro",
              isIndoor: false,
              baseRate: 1500,
              isActive: true
            }
          ]
        };
        data.venues = data.venues || [];
        data.venues.push(newVenue);
      } else {
        assignedVenueId = assignedVenueId || 'venue-1';
      }
    }

    const newUser = {
      id: (payload.role === 'VENUE_ADMIN' || payload.role === 'ROLE_VENUE_ADMIN') ? `admin-${Date.now()}` : `user-${Date.now()}`,
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      role: payload.role || 'PLAYER',
      password: payload.password,
      venueId: assignedVenueId || null,
      createdAt: new Date().toISOString()
    };

    data.users.push(newUser);
    this.saveData(data);

    const authSession = {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      venueId: newUser.venueId
    };

    this.setCurrentUser(authSession);
    return { success: true, user: authSession };
  },

  logout() {
    this.setCurrentUser(null);
    window.location.href = 'index.html';
  },

  resetData() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
  }
};

TurfStorage.init();
