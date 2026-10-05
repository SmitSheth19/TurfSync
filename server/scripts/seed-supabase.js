require('dotenv').config();
const { supabase, isSupabaseConfigured } = require('../config/supabase');
const DB = require('../config/db');

async function seed() {
  console.log('--- TURFSYNC SUPABASE SEEDING SCRIPT ---');

  if (!isSupabaseConfigured() || !supabase) {
    console.error('? Supabase is not configured in server/.env.');
    console.log('?? Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) in server/.env first.');
    console.log('?? Also make sure you have run server/db/schema.sql in your Supabase SQL editor.');
    process.exit(1);
  }

  try {
    console.log('1. Seeding Venues...');
    for (const v of DB.venues) {
      const { error } = await supabase.from('venues').upsert({
        id: v.id,
        name: v.name,
        tagline: v.tagline,
        description: v.description,
        address: v.address,
        city: v.city,
        area: v.area,
        rating: v.rating,
        review_count: v.reviewCount,
        cancellation_policy_hours: v.cancellationPolicyHours,
        opening_time: v.openingTime,
        closing_time: v.closingTime,
        image: v.image,
        sports: JSON.stringify(v.sports || [])
      });
      if (error) console.warn('Venue warning:', v.name, error.message);
      else console.log('  ? Venue seeded:', v.name);
    }

    console.log('2. Seeding Courts...');
    for (const c of DB.courts) {
      const { error } = await supabase.from('courts').upsert({
        id: c.id,
        venue_id: c.venueId,
        name: c.name,
        sport: c.sport,
        surface: c.surface,
        is_indoor: c.isIndoor,
        base_rate: c.baseRate,
        is_active: c.isActive
      });
      if (error) console.warn('Court warning:', c.name, error.message);
      else console.log('  ? Court seeded:', c.name);
    }

    console.log('3. Seeding Pricing Surge Rules...');
    for (const r of DB.pricingRules) {
      const { error } = await supabase.from('pricing_rules').upsert({
        id: r.id,
        venue_id: r.venueId,
        name: r.name,
        days: r.days,
        start_time: r.startTime,
        end_time: r.endTime,
        multiplier: r.multiplier,
        badge_text: r.badgeText
      });
      if (error) console.warn('Pricing rule warning:', r.name, error.message);
      else console.log('  ? Pricing rule seeded:', r.name);
    }

    console.log('4. Seeding Demo Users...');
    for (const u of DB.users) {
      const { error } = await supabase.from('users').upsert({
        id: u.id,
        full_name: u.fullName,
        email: u.email,
        phone: u.phone,
        password_hash: u.passwordHash,
        role: u.role,
        venue_id: u.venueId
      });
      if (error) console.warn('User warning:', u.email, error.message);
      else console.log('  ? User seeded:', u.fullName, '(' + u.role + ')');
    }

    console.log('5. Seeding Reviews...');
    for (const rev of DB.reviews) {
      const { error } = await supabase.from('reviews').upsert({
        id: rev.id,
        venue_id: rev.venueId,
        user_name: rev.userName,
        rating: rev.rating,
        comment: rev.comment,
        date: rev.date
      });
      if (error) console.warn('Review warning:', rev.id, error.message);
      else console.log('  ? Review seeded for venue:', rev.venueId);
    }

    console.log('\n? Supabase database successfully seeded with all Mumbai sports facilities!');
  } catch (err) {
    console.error('? Seeding error:', err);
  }
}

seed();
