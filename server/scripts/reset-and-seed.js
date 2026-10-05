// Wipes every TurfSync table in Supabase and reseeds it from seed-data.js.
// A JSON backup of the existing rows is written first.
// Usage: node scripts/reset-and-seed.js --yes [--backup-dir <dir>]
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { supabase, isSupabaseConfigured } = require('../config/supabase');
const data = require('./seed-data');

const OWNER_PASSWORD = process.env.SEED_OWNER_PASSWORD || 'Owner@123';
const PLAYER_PASSWORD = process.env.SEED_PLAYER_PASSWORD || 'Player@123';

// Children first so foreign keys never block a delete
const TABLES = ['waitlist', 'bookings', 'reviews', 'pricing_rules', 'users', 'courts', 'venues'];

async function insert(table, rows) {
  const { error } = await supabase.from(table).insert(rows);
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`  ✓ ${table}: ${rows.length}`);
}

async function main() {
  if (!process.argv.includes('--yes')) {
    console.error('This deletes ALL TurfSync data in Supabase. Re-run with --yes to confirm.');
    process.exit(1);
  }
  if (!isSupabaseConfigured() || !supabase || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in server/.env.');
    process.exit(1);
  }

  // 1. Backup
  const backup = {};
  for (const t of TABLES) {
    const { data: rows, error } = await supabase.from(t).select('*');
    if (error) throw new Error(`backup ${t}: ${error.message}`);
    backup[t] = rows;
  }
  const dirArg = process.argv.indexOf('--backup-dir');
  const dir = dirArg > -1 ? process.argv[dirArg + 1] : path.join(__dirname, '..', 'db');
  const file = path.join(dir, `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(file, JSON.stringify(backup, null, 2));
  console.log('Backup written:', file, TABLES.map(t => `${t}=${backup[t].length}`).join(' '));

  // 2. Wipe
  for (const t of TABLES) {
    const { error } = await supabase.from(t).delete().neq('id', '');
    if (error) throw new Error(`delete ${t}: ${error.message}`);
  }
  console.log('All tables cleared.');

  // 3. Seed
  const sportsOf = id => [...new Set(data.courts.filter(c => c.venueId === id).map(c => c.sport))];
  const reviewsOf = id => data.reviews.filter(r => r.venueId === id);

  await insert('venues', data.venues.map(v => {
    const rs = reviewsOf(v.id);
    return {
      id: v.id, name: v.name, tagline: v.tagline, description: v.description, address: v.address,
      city: 'Mumbai', area: v.area, image: v.image, sports: sportsOf(v.id),
      rating: Math.round((rs.reduce((s, r) => s + r.rating, 0) / rs.length) * 10) / 10,
      review_count: rs.length, cancellation_policy_hours: v.policy,
      opening_time: v.open, closing_time: v.close
    };
  }));

  await insert('courts', data.courts.map(c => ({
    id: c.id, venue_id: c.venueId, name: c.name, sport: c.sport, surface: c.surface,
    is_indoor: c.isIndoor, base_rate: c.baseRate, is_active: c.isActive
  })));

  const ownerHash = bcrypt.hashSync(OWNER_PASSWORD, 10);
  const playerHash = bcrypt.hashSync(PLAYER_PASSWORD, 10);
  await insert('users', [...data.owners, ...data.players].map(u => ({
    id: u.id, full_name: u.fullName, email: u.email, phone: u.phone,
    password_hash: u.role === 'ROLE_VENUE_ADMIN' ? ownerHash : playerHash,
    role: u.role, venue_id: u.venueId
  })));

  await insert('pricing_rules', data.pricingRules.map(r => ({
    id: r.id, venue_id: r.venueId, name: r.name, days: r.days, start_time: r.startTime,
    end_time: r.endTime, multiplier: r.multiplier, badge_text: r.badgeText
  })));

  await insert('reviews', data.reviews.map(r => ({
    id: r.id, venue_id: r.venueId, user_name: r.userName, rating: r.rating, comment: r.comment, date: r.date
  })));

  await insert('bookings', data.bookings.map(b => ({
    id: b.id, venue_id: b.venueId, court_id: b.courtId, court_name: b.courtName, sport: b.sport,
    venue_name: b.venueName, user_id: b.userId, user_name: b.userName, user_email: b.userEmail,
    user_phone: b.userPhone, booking_date: b.bookingDate, start_time: b.startTime, end_time: b.endTime,
    base_amount: b.baseAmount, total_amount: b.totalAmount, status: b.status,
    payment_status: b.paymentStatus, payment_method: b.paymentMethod, is_recurring: false,
    cancellation_reason: b.cancellationReason, cancelled_at: b.cancelledAt,
    refund_amount: b.refundAmount, refund_percent: b.refundPercent
  })));

  await insert('waitlist', data.waitlist.map(w => ({
    id: w.id, venue_id: w.venueId, court_id: w.courtId, booking_date: w.bookingDate,
    start_time: w.startTime, user_id: w.userId, user_name: w.userName, user_email: w.userEmail,
    user_phone: w.userPhone, status: w.status
  })));

  console.log(`\nDone. Owner password: ${OWNER_PASSWORD}  Player password: ${PLAYER_PASSWORD}`);
}

main().catch(err => { console.error('Failed:', err.message); process.exit(1); });
