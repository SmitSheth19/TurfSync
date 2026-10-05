-- ========================================================================
-- TurfSync Supabase (PostgreSQL) DDL Schema
-- Production sports court booking, concurrency, and dynamic surge pricing
-- ========================================================================

-- 1. Venues Table (Mumbai Sports Facilities)
CREATE TABLE IF NOT EXISTS venues (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  tagline VARCHAR(255),
  description TEXT,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) DEFAULT 'Mumbai',
  area VARCHAR(100) NOT NULL,
  rating NUMERIC(3, 1) DEFAULT 5.0,
  review_count INT DEFAULT 0,
  cancellation_policy_hours INT DEFAULT 24,
  opening_time VARCHAR(10) DEFAULT '06:00',
  closing_time VARCHAR(10) DEFAULT '23:00',
  image TEXT,
  sports JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Courts Table (Sub-units within facilities)
CREATE TABLE IF NOT EXISTS courts (
  id VARCHAR(64) PRIMARY KEY,
  venue_id VARCHAR(64) NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sport VARCHAR(50) NOT NULL,
  surface VARCHAR(100),
  is_indoor BOOLEAN DEFAULT FALSE,
  base_rate NUMERIC(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Users Table (Players and Facility Owners)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'ROLE_PLAYER',
  venue_id VARCHAR(64) REFERENCES venues(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Dynamic Pricing Surge Rules
CREATE TABLE IF NOT EXISTS pricing_rules (
  id VARCHAR(64) PRIMARY KEY,
  venue_id VARCHAR(64) NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  days VARCHAR(50) DEFAULT '1,2,3,4,5,6,7',
  start_time VARCHAR(10) NOT NULL,
  end_time VARCHAR(10) NOT NULL,
  multiplier NUMERIC(4, 2) NOT NULL DEFAULT 1.0,
  badge_text VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(64) PRIMARY KEY,
  venue_id VARCHAR(64) NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  court_id VARCHAR(64) NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  court_name VARCHAR(255) NOT NULL,
  sport VARCHAR(50) NOT NULL,
  venue_name VARCHAR(255) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_phone VARCHAR(50),
  booking_date DATE NOT NULL,
  start_time VARCHAR(10) NOT NULL,
  end_time VARCHAR(10) NOT NULL,
  base_amount NUMERIC(10, 2) NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED',
  payment_status VARCHAR(50) NOT NULL DEFAULT 'SUCCEEDED',
  payment_method VARCHAR(100) DEFAULT 'Stripe Card',
  is_recurring BOOLEAN DEFAULT FALSE,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  refund_amount NUMERIC(10, 2) DEFAULT 0,
  refund_percent INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique index: ZERO double bookings at PostgreSQL level
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_slot
ON bookings (court_id, booking_date, start_time)
WHERE (status = 'CONFIRMED');

-- 6. Priority Waitlist Queue
CREATE TABLE IF NOT EXISTS waitlist (
  id VARCHAR(64) PRIMARY KEY,
  venue_id VARCHAR(64) NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  court_id VARCHAR(64) NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  start_time VARCHAR(10) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_phone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'WAITING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notified_at TIMESTAMPTZ
);

-- 7. Venue Customer Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(64) PRIMARY KEY,
  venue_id VARCHAR(64) NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_courts_venue ON courts(venue_id);
CREATE INDEX IF NOT EXISTS idx_pricing_venue ON pricing_rules(venue_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_email);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date, venue_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_slot ON waitlist(court_id, booking_date, start_time);
