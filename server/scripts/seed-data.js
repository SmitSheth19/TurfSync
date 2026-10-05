// TurfSync seed dataset — 12 Mumbai venues with owners, courts, pricing, players,
// reviews, bookings and waitlist entries. Dates are relative to the day it is run.

const IMG = id => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;

const venues = [
  { id: 'venue-1',  name: 'Apex Arena Sports Complex',        area: 'BKC',            address: 'Plot C-12, G Block, Bandra Kurla Complex',     tagline: 'Premier 7v7 football & cricket in BKC',           image: IMG('1551958219-acbc608c6377'), open: '06:00', close: '23:00', policy: 24,
    description: 'FIFA-approved artificial turf, a floodlit cricket pitch and indoor badminton, minutes from the BKC business district.' },
  { id: 'venue-2',  name: 'Metro Kick Rooftop Arena',         area: 'Andheri West',   address: 'Rooftop, Infiniti Mall Annexe, Link Road',      tagline: 'Rooftop football under the Andheri skyline',       image: IMG('1574629810360-7efbbe195018'), open: '07:00', close: '24:00', policy: 12,
    description: 'A rooftop 5v5 turf and box-cricket cage with skyline views, open till midnight.' },
  { id: 'venue-3',  name: 'Smash Point Racquet Club',         area: 'Juhu',           address: '14 Juhu Tara Road, near Juhu Beach',            tagline: 'Tennis & pickleball by the sea',                   image: IMG('1554068865-24cecd4e34b8'), open: '06:00', close: '22:00', policy: 24,
    description: 'Cushioned hard courts for tennis and pickleball with coaching available on weekends.' },
  { id: 'venue-4',  name: 'Goal Zone Powai',                  area: 'Powai',          address: 'Hiranandani Gardens, Central Avenue',           tagline: 'Lakeside turf in Hiranandani',                     image: IMG('1431324155629-1a6deb1dec8d'), open: '06:00', close: '23:00', policy: 24,
    description: 'Two 6v6 football turfs and a badminton hall a short walk from Powai Lake.' },
  { id: 'venue-5',  name: 'Champions Turf Malad',             area: 'Malad West',     address: 'Mindspace Road, behind Inorbit Mall',           tagline: 'Multi-sport hub for the western suburbs',          image: IMG('1543351611-58f69d7c1781'), open: '06:00', close: '23:00', policy: 12,
    description: 'Football, box cricket and badminton under one roof, with free parking.' },
  { id: 'venue-6',  name: 'ProSports Arena Vashi',            area: 'Vashi',          address: 'Sector 17, Palm Beach Road, Vashi',       tagline: "Navi Mumbai's biggest sports complex",            image: IMG('1459865264687-595d652de67e'), open: '05:30', close: '23:00', policy: 24,
    description: 'Full-size football turf, cricket nets, tennis and badminton courts across one campus.' },
  { id: 'venue-7',  name: 'Kick Factory Borivali',            area: 'Borivali West',  address: 'Rooftop, Chamunda Circle, S.V. Road',           tagline: 'Rooftop turf next to Borivali station',            image: IMG('1575361204480-aadea25e6e68'), open: '06:00', close: '24:00', policy: 6,
    description: 'Well-lit rooftop turfs two minutes from the station, ideal for after-work games.' },
  { id: 'venue-8',  name: 'Elite Cricket Academy',            area: 'Kandivali East', address: 'Thakur Village, Western Express Highway',       tagline: 'Turf wickets and bowling machines',                image: IMG('1624526267942-ab0ff8a3e972'), open: '06:00', close: '21:00', policy: 48,
    description: 'Practice nets with bowling machines and a full turf wicket for match practice.' },
  { id: 'venue-9',  name: 'Mumbai Sports Village',            area: 'Chembur',        address: 'Diamond Garden, Sion-Trombay Road',             tagline: 'Everything in one place in Chembur',               image: IMG('1518604666860-9ed391f76460'), open: '06:00', close: '23:00', policy: 24,
    description: 'Football, cricket, badminton and pickleball courts with a café and changing rooms.' },
  { id: 'venue-10', name: 'Kings Court Dadar',                area: 'Dadar West',     address: 'Near Shivaji Park, Kelkar Road',                tagline: 'Indoor badminton & pickleball near Shivaji Park',  image: IMG('1626224583764-f87db24ac4ea'), open: '06:00', close: '22:00', policy: 12,
    description: 'Air-conditioned wooden badminton courts and pickleball courts in central Mumbai.' },
  { id: 'venue-11', name: 'Bandstand Football Club',          area: 'Bandra West',    address: 'Bandstand Promenade, Mount Mary Road',          tagline: 'Sea-facing 5v5 in Bandra',                         image: IMG('1553778263-73a83bab9b0c'), open: '06:00', close: '23:00', policy: 24,
    description: 'Two sea-facing 5v5 turfs with evening floodlights, steps from Bandstand.' },
  { id: 'venue-12', name: 'Worli Sports Dome',                area: 'Worli',          address: 'Dr. Annie Besant Road, Worli Naka',             tagline: 'All-weather indoor dome in Worli',                 image: IMG('1599474924187-334a4ae5bd3c'), open: '06:00', close: '24:00', policy: 24,
    description: 'Monsoon-proof indoor dome with football, tennis and badminton courts.' }
];

// [venueId, name, sport, surface, isIndoor, baseRate]
const courtRows = [
  ['venue-1',  'Main Arena 7v7 Turf',        'FOOTBALL',   'FIFA Pro AstroTurf 50mm',  false, 1800],
  ['venue-1',  'Thunder Box Cricket Pitch',  'CRICKET',    'Synthetic Turf Matting',   false, 1400],
  ['venue-1',  'Indoor Badminton Court 1',   'BADMINTON',  'BWF Wooden Flooring',      true,  600],
  ['venue-2',  'SkyTurf 5v5 Pitch',          'FOOTBALL',   'Monofilament AstroTurf',   false, 1500],
  ['venue-2',  'Gully Cricket Cage',         'CRICKET',    'Astro Matting',            false, 1200],
  ['venue-3',  'Centre Court',               'TENNIS',     'Acrylic Cushion Hardcourt', false, 1100],
  ['venue-3',  'Court 2',                    'TENNIS',     'Acrylic Hardcourt',        false, 900],
  ['venue-3',  'Pickleball Court A',         'PICKLEBALL', 'Pro-X Hardcoat',           true,  850],
  ['venue-4',  'Lakeview Turf 1',            'FOOTBALL',   'AstroTurf 40mm',           false, 1600],
  ['venue-4',  'Lakeview Turf 2',            'FOOTBALL',   'AstroTurf 40mm',           false, 1600],
  ['venue-4',  'Badminton Hall Court',       'BADMINTON',  'Synthetic PU',             true,  550],
  ['venue-5',  'Champions 6v6 Turf',         'FOOTBALL',   'AstroTurf 40mm',           false, 1400],
  ['venue-5',  'Box Cricket Arena',          'CRICKET',    'Synthetic Turf',           false, 1200],
  ['venue-5',  'Badminton Court 1',          'BADMINTON',  'Wooden Flooring',          true,  500],
  ['venue-5',  'Badminton Court 2',          'BADMINTON',  'Wooden Flooring',          true,  500],
  ['venue-6',  'Grand 9v9 Turf',             'FOOTBALL',   'FIFA Quality Pro',         false, 2200],
  ['venue-6',  'Cricket Nets',               'CRICKET',    'Turf Wicket',              false, 900],
  ['venue-6',  'Tennis Court',               'TENNIS',     'Synthetic Clay',           false, 1000],
  ['venue-6',  'Badminton Court',            'BADMINTON',  'BWF Wooden Flooring',      true,  550],
  ['venue-7',  'Rooftop Turf A',             'FOOTBALL',   'AstroTurf 40mm',           false, 1300],
  ['venue-7',  'Rooftop Turf B',             'FOOTBALL',   'AstroTurf 40mm',           false, 1300],
  ['venue-7',  'Box Cricket Cage',           'CRICKET',    'Astro Matting',            false, 1100],
  ['venue-8',  'Match Wicket',               'CRICKET',    'Natural Turf Wicket',      false, 2000],
  ['venue-8',  'Bowling Machine Net 1',      'CRICKET',    'Turf Mat',                 false, 800],
  ['venue-8',  'Bowling Machine Net 2',      'CRICKET',    'Turf Mat',                 false, 800],
  ['venue-9',  'Village Football Turf',      'FOOTBALL',   'AstroTurf 50mm',           false, 1500],
  ['venue-9',  'Village Cricket Box',        'CRICKET',    'Synthetic Turf',           false, 1100],
  ['venue-9',  'Badminton Court',            'BADMINTON',  'Synthetic PU',             true,  500],
  ['venue-9',  'Pickleball Court',           'PICKLEBALL', 'Acrylic Hardcourt',        false, 700],
  ['venue-10', 'Royal Badminton Court 1',    'BADMINTON',  'BWF Wooden Flooring',      true,  600],
  ['venue-10', 'Royal Badminton Court 2',    'BADMINTON',  'BWF Wooden Flooring',      true,  600],
  ['venue-10', 'Pickleball Court',           'PICKLEBALL', 'Pro-X Hardcoat',           true,  800],
  ['venue-11', 'Seaside Turf 1',             'FOOTBALL',   'AstroTurf 40mm',           false, 1700],
  ['venue-11', 'Seaside Turf 2',             'FOOTBALL',   'AstroTurf 40mm',           false, 1700],
  ['venue-12', 'Dome Football Pitch',        'FOOTBALL',   'FIFA Pro AstroTurf 50mm',  true,  2000],
  ['venue-12', 'Dome Tennis Court',          'TENNIS',     'Acrylic Cushion Hardcourt', true, 1300],
  ['venue-12', 'Dome Badminton Court 1',     'BADMINTON',  'BWF Wooden Flooring',      true,  650],
  ['venue-12', 'Dome Badminton Court 2',     'BADMINTON',  'BWF Wooden Flooring',      true,  650]
];
const courts = courtRows.map(([venueId, name, sport, surface, isIndoor, baseRate], i) => ({
  id: `court-${i + 1}`, venueId, name, sport, surface, isIndoor, baseRate, isActive: true
}));

// One owner per venue: [fullName, email, phone]
const ownerRows = [
  ['Rajesh Malhotra', 'owner.apex@turfsync.in',      '+91 98200 11001'],
  ['Farah Khan',      'owner.metrokick@turfsync.in', '+91 98200 11002'],
  ['Vikram Desai',    'owner.smashpoint@turfsync.in','+91 98200 11003'],
  ['Sneha Iyer',      'owner.goalzone@turfsync.in',  '+91 98200 11004'],
  ['Arjun Shah',      'owner.champions@turfsync.in', '+91 98200 11005'],
  ['Meera Pillai',    'owner.prosports@turfsync.in', '+91 98200 11006'],
  ['Kunal Joshi',     'owner.kickfactory@turfsync.in','+91 98200 11007'],
  ['Harbhajan Gill',  'owner.elitecricket@turfsync.in','+91 98200 11008'],
  ['Pooja Nair',      'owner.sportsvillage@turfsync.in','+91 98200 11009'],
  ['Sameer Kulkarni', 'owner.kingscourt@turfsync.in','+91 98200 11010'],
  ['Natasha Fernandes','owner.bandstand@turfsync.in','+91 98200 11011'],
  ['Aditya Birla',    'owner.worlidome@turfsync.in', '+91 98200 11012']
];
const owners = ownerRows.map(([fullName, email, phone], i) => ({
  id: `admin-${i + 1}`, fullName, email, phone, role: 'ROLE_VENUE_ADMIN', venueId: `venue-${i + 1}`
}));

const playerRows = [
  ['Alex Morgan',     'player@turfsync.in',          '+91 98765 43210'],
  ['Rohan Mehta',     'rohan.mehta@example.com',     '+91 99300 20001'],
  ['Priya Sharma',    'priya.sharma@example.com',    '+91 99300 20002'],
  ['Karthik Rao',     'karthik.rao@example.com',     '+91 99300 20003'],
  ['Ananya Gupta',    'ananya.gupta@example.com',    '+91 99300 20004'],
  ['Imran Shaikh',    'imran.shaikh@example.com',    '+91 99300 20005'],
  ['Neha Patil',      'neha.patil@example.com',      '+91 99300 20006'],
  ['Siddharth Jain',  'siddharth.jain@example.com',  '+91 99300 20007'],
  ['Zoya Merchant',   'zoya.merchant@example.com',   '+91 99300 20008'],
  ['Aditya Kapoor',   'aditya.kapoor@example.com',   '+91 99300 20009'],
  ['Tanvi Deshmukh',  'tanvi.deshmukh@example.com',  '+91 99300 20010'],
  ['Rahul Verma',     'rahul.verma@example.com',     '+91 99300 20011']
];
const players = playerRows.map(([fullName, email, phone], i) => ({
  id: `user-${i + 1}`, fullName, email, phone, role: 'ROLE_PLAYER', venueId: null
}));

// Pricing rules: a peak rule for every venue, plus extras for some
const pricingRules = [];
venues.forEach((v, i) => {
  pricingRules.push({ venueId: v.id, name: 'Evening Peak', days: '1,2,3,4,5,6,7', startTime: '18:00', endTime: '22:00', multiplier: 1.3, badgeText: 'Peak Hours (+30%)' });
  if (i % 2 === 0) pricingRules.push({ venueId: v.id, name: 'Weekend Surge', days: '6,7', startTime: '07:00', endTime: '18:00', multiplier: 1.2, badgeText: 'Weekend (+20%)' });
  if (i % 3 === 0) pricingRules.push({ venueId: v.id, name: 'Early Bird', days: '1,2,3,4,5', startTime: v.open, endTime: '09:00', multiplier: 0.85, badgeText: 'Early Bird (-15%)' });
});
pricingRules.forEach((r, i) => { r.id = `rule-${i + 1}`; });

const reviewComments = [
  [5, 'Turf quality is excellent and the floodlights are really bright. Booking took under a minute.'],
  [4, 'Great facility, clean changing rooms. Parking gets tight on weekend evenings.'],
  [5, 'Staff were helpful and the slot started exactly on time. Will book again.'],
  [4, 'Good value during early-bird hours. Surface could use a brush-up in one corner.'],
  [5, 'Our regular Friday game spot now. Never had a double-booking issue.'],
  [3, 'Decent courts but the washrooms need better upkeep.']
];
const reviews = [];
venues.forEach((v, vi) => {
  const n = 2 + (vi % 3); // 2–4 reviews per venue
  for (let k = 0; k < n; k++) {
    const [rating, comment] = reviewComments[(vi + k) % reviewComments.length];
    const d = new Date(); d.setDate(d.getDate() - (5 + vi * 3 + k * 7));
    reviews.push({ venueId: v.id, userName: players[(vi + k) % players.length].fullName, rating, comment, date: d.toISOString().slice(0, 10) });
  }
});
reviews.forEach((r, i) => { r.id = `rev-${i + 1}`; });

// Bookings: past, upcoming and a few cancellations spread across players and venues
const hhmm = h => `${String(h).padStart(2, '0')}:00`;
const { calculateSlotPrice } = require('../services/pricingEngine');
const bookings = [];
const bookingPlan = [
  // [playerIdx, courtIdx, dayOffset, startHour, status]
  [0, 0, 1, 19, 'CONFIRMED'], [0, 9, 3, 7, 'CONFIRMED'], [0, 5, -4, 18, 'CONFIRMED'], [0, 2, -10, 20, 'CANCELLED'],
  [1, 3, 0, 21, 'CONFIRMED'], [1, 15, 2, 18, 'CONFIRMED'], [1, 12, -2, 19, 'CONFIRMED'],
  [2, 7, 1, 8, 'CONFIRMED'],  [2, 29, 4, 17, 'CONFIRMED'], [2, 31, -6, 10, 'CONFIRMED'],
  [3, 22, 2, 7, 'CONFIRMED'], [3, 23, -3, 16, 'CONFIRMED'], [3, 16, 5, 6, 'CANCELLED'],
  [4, 13, 0, 18, 'CONFIRMED'], [4, 36, 3, 20, 'CONFIRMED'],
  [5, 19, 1, 22, 'CONFIRMED'], [5, 32, -1, 19, 'CONFIRMED'],
  [6, 27, 2, 9, 'CONFIRMED'],  [6, 10, -5, 18, 'CONFIRMED'],
  [7, 34, 0, 20, 'CONFIRMED'], [7, 8, 6, 19, 'CONFIRMED'],
  [8, 33, 1, 18, 'CONFIRMED'], [8, 6, -8, 7, 'CONFIRMED'],
  [9, 25, 2, 19, 'CONFIRMED'], [9, 0, -7, 21, 'CONFIRMED'],
  [10, 30, 3, 11, 'CONFIRMED'], [11, 4, 1, 20, 'CONFIRMED'], [11, 20, -3, 21, 'CANCELLED']
];
bookingPlan.forEach(([pi, ci, dayOffset, hour, status], i) => {
  const p = players[pi], c = courts[ci], v = venues.find(x => x.id === c.venueId);
  const d = new Date(); d.setDate(d.getDate() + dayOffset);
  // Same pricing as checkout: venue rules applied to the base rate, then 18% GST
  const price = calculateSlotPrice(c, d.toISOString().slice(0, 10), hhmm(hour), pricingRules.filter(r => r.venueId === v.id)).finalPrice;
  const total = Math.round(price * 1.18);
  const cancelled = status === 'CANCELLED';
  bookings.push({
    id: `TS-${d.getFullYear()}-${9001 + i}`,
    venueId: v.id, courtId: c.id, courtName: c.name, sport: c.sport, venueName: v.name,
    userId: p.id, userName: p.fullName, userEmail: p.email, userPhone: p.phone,
    bookingDate: d.toISOString().slice(0, 10), startTime: hhmm(hour), endTime: hhmm(hour + 1),
    baseAmount: price, totalAmount: total,
    status, paymentStatus: cancelled ? 'REFUNDED' : 'SUCCEEDED', paymentMethod: 'Stripe Card (•••• 4242)',
    cancellationReason: cancelled ? 'Team could not make it' : null,
    cancelledAt: cancelled ? new Date().toISOString() : null,
    refundAmount: cancelled ? total : 0, refundPercent: cancelled ? 100 : 0
  });
});

// Waitlist entries on upcoming confirmed slots, from other players
const waitlist = bookings
  .filter(b => b.status === 'CONFIRMED' && b.bookingDate >= new Date().toISOString().slice(0, 10))
  .slice(0, 4)
  .map((b, i) => {
    const p = players[(players.findIndex(x => x.id === b.userId) + 3) % players.length];
    return { id: `wl-${i + 1}`, venueId: b.venueId, courtId: b.courtId, bookingDate: b.bookingDate, startTime: b.startTime,
      userId: p.id, userName: p.fullName, userEmail: p.email, userPhone: p.phone, status: 'WAITING' };
  });

module.exports = { venues, courts, owners, players, pricingRules, reviews, bookings, waitlist };
