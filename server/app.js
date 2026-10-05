require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { authenticateToken, requireAuth, requireRole } = require('./middleware/auth');
const { isSupabaseConfigured } = require('./config/supabase');

const authController     = require('./controllers/authController');
const venueController    = require('./controllers/venueController');
const bookingController  = require('./controllers/bookingController');
const pricingController  = require('./controllers/pricingController');
const waitlistController = require('./controllers/waitlistController');
const adminController    = require('./controllers/adminController');
const syncController     = require('./controllers/syncController');

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(authenticateToken);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'TurfSync Backend API',
    mode: isSupabaseConfigured() ? 'supabase-postgresql' : 'local-fallback',
    timestamp: new Date().toISOString()
  });
});

// Frontend data snapshot
app.get('/api/sync', syncController.getSnapshot);

// Auth
app.post('/api/auth/login',    authController.login);
app.post('/api/auth/register', authController.register);
app.get('/api/auth/me',        authController.getCurrentUser);

// Venues
app.get('/api/venues',               venueController.getAllVenues);
app.get('/api/venues/:id',           venueController.getVenueById);
app.get('/api/venues/:id/courts',    venueController.getVenueCourts);
app.get('/api/venues/:id/reviews',   venueController.getVenueReviews);
app.post('/api/venues/:id/reviews',  requireAuth, venueController.addReview);

// Bookings & Slots
app.get('/api/bookings/slots',        bookingController.getSlotMatrix);
app.post('/api/bookings/confirm',     requireAuth, bookingController.confirmBooking);
app.post('/api/bookings/:id/cancel',  requireAuth, bookingController.cancelBooking);
app.get('/api/bookings/my',           requireAuth, bookingController.getMyBookings);
app.get('/api/bookings/stats',        requireAuth, bookingController.getPlayerStats);

// Dynamic Pricing
app.get('/api/pricing',         pricingController.getRules);
app.post('/api/pricing',        requireAuth, requireRole('ROLE_VENUE_ADMIN'), pricingController.addRule);
app.delete('/api/pricing/:id',  requireAuth, requireRole('ROLE_VENUE_ADMIN'), pricingController.deleteRule);

// Waitlist
app.get('/api/waitlist/my',      requireAuth, waitlistController.getMyWaitlist);
app.post('/api/waitlist',        requireAuth, waitlistController.joinWaitlist);
app.delete('/api/waitlist/:id',  requireAuth, waitlistController.cancelWaitlist);

// Admin — Owner Only
app.get('/api/admin/stats',
  requireAuth, requireRole('ROLE_VENUE_ADMIN'), adminController.getStats);
app.get('/api/admin/courts',
  requireAuth, requireRole('ROLE_VENUE_ADMIN'), adminController.getCourts);
app.patch('/api/admin/courts/:id/toggle',
  requireAuth, requireRole('ROLE_VENUE_ADMIN'), adminController.toggleCourt);
app.post('/api/admin/offline-booking',
  requireAuth, requireRole('ROLE_VENUE_ADMIN'), adminController.createOfflineBooking);
app.put('/api/admin/venue',
  requireAuth, requireRole('ROLE_VENUE_ADMIN'), adminController.updateVenue);
app.post('/api/admin/courts',
  requireAuth, requireRole('ROLE_VENUE_ADMIN'), adminController.addCourt);
app.put('/api/admin/courts/:id',
  requireAuth, requireRole('ROLE_VENUE_ADMIN'), adminController.updateCourt);
app.delete('/api/admin/courts/:id',
  requireAuth, requireRole('ROLE_VENUE_ADMIN'), adminController.deleteCourt);

module.exports = app;
