const bcrypt = require('bcryptjs');

// In-Memory Grounded Seed Database for Mumbai Sports Arenas
const DB = {
  users: [
    {
      id: "user-1",
      fullName: "Alex Morgan",
      email: "player@turfsync.com",
      phone: "+91 98765 43210",
      passwordHash: bcrypt.hashSync("password123", 10),
      role: "ROLE_PLAYER",
      venueId: null,
      createdAt: new Date().toISOString()
    },
    {
      id: "admin-1",
      fullName: "Apex Arena BKC Owner",
      email: "admin@apexarena.com",
      phone: "+91 98222 33445",
      passwordHash: bcrypt.hashSync("admin123", 10),
      role: "ROLE_VENUE_ADMIN",
      venueId: "venue-1",
      createdAt: new Date().toISOString()
    },
    {
      id: "admin-2",
      fullName: "Metro Kick Andheri Owner",
      email: "owner@metrokick.com",
      phone: "+91 98333 44556",
      passwordHash: bcrypt.hashSync("admin123", 10),
      role: "ROLE_VENUE_ADMIN",
      venueId: "venue-2",
      createdAt: new Date().toISOString()
    },
    {
      id: "admin-3",
      fullName: "Smash Point Juhu Owner",
      email: "owner@smashpoint.com",
      phone: "+91 98444 55667",
      passwordHash: bcrypt.hashSync("admin123", 10),
      role: "ROLE_VENUE_ADMIN",
      venueId: "venue-3",
      createdAt: new Date().toISOString()
    },
    {
      id: "admin-4",
      fullName: "Rahul Desai",
      email: "owner@goalzone.com",
      phone: "+91 98555 10001",
      passwordHash: bcrypt.hashSync("admin123", 10),
      role: "ROLE_VENUE_ADMIN",
      venueId: "venue-4",
      createdAt: new Date().toISOString()
    },
    {
      id: "admin-5",
      fullName: "Anita Sharma",
      email: "owner@championsturf.com",
      phone: "+91 98555 10002",
      passwordHash: bcrypt.hashSync("admin123", 10),
      role: "ROLE_VENUE_ADMIN",
      venueId: "venue-5",
      createdAt: new Date().toISOString()
    },
    {
      id: "admin-6",
      fullName: "Suresh Patil",
      email: "owner@prosports.com",
      phone: "+91 98555 10003",
      passwordHash: bcrypt.hashSync("admin123", 10),
      role: "ROLE_VENUE_ADMIN",
      venueId: "venue-6",
      createdAt: new Date().toISOString()
    },
    {
      id: "admin-7",
      fullName: "Vikram Joshi",
      email: "owner@kickfactory.com",
      phone: "+91 98555 10004",
      passwordHash: bcrypt.hashSync("admin123", 10),
      role: "ROLE_VENUE_ADMIN",
      venueId: "venue-7",
      createdAt: new Date().toISOString()
    },
    {
      id: "admin-8",
      fullName: "Pradeep Nair",
      email: "owner@elitecricket.com",
      phone: "+91 98555 10005",
      passwordHash: bcrypt.hashSync("admin123", 10),
      role: "ROLE_VENUE_ADMIN",
      venueId: "venue-8",
      createdAt: new Date().toISOString()
    },
    {
      id: "admin-9",
      fullName: "Meena Kulkarni",
      email: "owner@mumbaisports.com",
      phone: "+91 98555 10006",
      passwordHash: bcrypt.hashSync("admin123", 10),
      role: "ROLE_VENUE_ADMIN",
      venueId: "venue-9",
      createdAt: new Date().toISOString()
    },
    {
      id: "admin-10",
      fullName: "Arun Sawant",
      email: "owner@kingscourt.com",
      phone: "+91 98555 10007",
      passwordHash: bcrypt.hashSync("admin123", 10),
      role: "ROLE_VENUE_ADMIN",
      venueId: "venue-10",
      createdAt: new Date().toISOString()
    },
    {
      id: "admin-11",
      fullName: "Deepika Fernandes",
      email: "owner@versova.com",
      phone: "+91 98555 10008",
      passwordHash: bcrypt.hashSync("admin123", 10),
      role: "ROLE_VENUE_ADMIN",
      venueId: "venue-11",
      createdAt: new Date().toISOString()
    },
    {
      id: "admin-12",
      fullName: "Nikhil Malhotra",
      email: "owner@worlidome.com",
      phone: "+91 98555 10009",
      passwordHash: bcrypt.hashSync("admin123", 10),
      role: "ROLE_VENUE_ADMIN",
      venueId: "venue-12",
      createdAt: new Date().toISOString()
    },
    {
      id: "admin-13",
      fullName: "Kavya Menon",
      email: "owner@premierfc.com",
      phone: "+91 98555 10010",
      passwordHash: bcrypt.hashSync("admin123", 10),
      role: "ROLE_VENUE_ADMIN",
      venueId: "venue-13",
      createdAt: new Date().toISOString()
    },
    {
      id: "user-2",
      fullName: "Rahul Sharma",
      email: "rahul.sharma@gmail.com",
      phone: "+91 97001 11001",
      passwordHash: bcrypt.hashSync("password123", 10),
      role: "ROLE_PLAYER",
      venueId: null,
      createdAt: new Date().toISOString()
    },
    {
      id: "user-3",
      fullName: "Priya Patel",
      email: "priya.patel@gmail.com",
      phone: "+91 97001 11002",
      passwordHash: bcrypt.hashSync("password123", 10),
      role: "ROLE_PLAYER",
      venueId: null,
      createdAt: new Date().toISOString()
    },
    {
      id: "user-4",
      fullName: "Arjun Mehta",
      email: "arjun.mehta@gmail.com",
      phone: "+91 97001 11003",
      passwordHash: bcrypt.hashSync("password123", 10),
      role: "ROLE_PLAYER",
      venueId: null,
      createdAt: new Date().toISOString()
    },
    {
      id: "user-5",
      fullName: "Sneha Kapoor",
      email: "sneha.kapoor@gmail.com",
      phone: "+91 97001 11004",
      passwordHash: bcrypt.hashSync("password123", 10),
      role: "ROLE_PLAYER",
      venueId: null,
      createdAt: new Date().toISOString()
    },
    {
      id: "user-6",
      fullName: "Vikram Singh",
      email: "vikram.singh@gmail.com",
      phone: "+91 97001 11005",
      passwordHash: bcrypt.hashSync("password123", 10),
      role: "ROLE_PLAYER",
      venueId: null,
      createdAt: new Date().toISOString()
    },
    {
      id: "user-7",
      fullName: "Ananya Nair",
      email: "ananya.nair@gmail.com",
      phone: "+91 97001 11006",
      passwordHash: bcrypt.hashSync("password123", 10),
      role: "ROLE_PLAYER",
      venueId: null,
      createdAt: new Date().toISOString()
    },
    {
      id: "user-8",
      fullName: "Rohan Verma",
      email: "rohan.verma@gmail.com",
      phone: "+91 97001 11007",
      passwordHash: bcrypt.hashSync("password123", 10),
      role: "ROLE_PLAYER",
      venueId: null,
      createdAt: new Date().toISOString()
    },
    {
      id: "user-9",
      fullName: "Divya Krishnan",
      email: "divya.krishnan@gmail.com",
      phone: "+91 97001 11008",
      passwordHash: bcrypt.hashSync("password123", 10),
      role: "ROLE_PLAYER",
      venueId: null,
      createdAt: new Date().toISOString()
    }
  ],

  venues: [
    // ── EXISTING 3 VENUES ────────────────────────────────────────────────────
    {
      id: "venue-1",
      name: "Apex Arena Sports Complex",
      tagline: "Premier 7v7 Football & Cricket Ground in BKC",
      description: "State-of-the-art sports complex in BKC, Mumbai featuring FIFA-approved artificial turf, pro cricket pitch with floodlights, and locker rooms.",
      address: "Plot C-12, G Block, Bandra Kurla Complex",
      city: "Mumbai",
      area: "BKC",
      rating: 4.9,
      reviewCount: 128,
      cancellationPolicyHours: 24,
      openingTime: "06:00",
      closingTime: "23:00",
      image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "venue-2",
      name: "Metro Kick Rooftop Arena",
      tagline: "Skyline 5v5 Football & Box Cricket in Andheri",
      description: "Mumbai rooftop turf offering panoramic skyline views, tournament-grade bounce, dynamic LED stadium lighting, and refreshment cafe.",
      address: "Level 6, Infinity Mall Link Road, Andheri West",
      city: "Mumbai",
      area: "Andheri West",
      rating: 4.7,
      reviewCount: 95,
      cancellationPolicyHours: 12,
      openingTime: "07:00",
      closingTime: "24:00",
      image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "venue-3",
      name: "Smash Point Tennis & Pickleball Club",
      tagline: "International Standard Acrylic & Hard Courts in Juhu",
      description: "Dedicated racquet sport center in Juhu featuring 2 US Open-cushioned tennis courts and 2 fast-paced pickleball courts.",
      address: "12 Palm Avenue, Near Juhu Beach",
      city: "Mumbai",
      area: "Juhu",
      rating: 4.9,
      reviewCount: 62,
      cancellationPolicyHours: 24,
      openingTime: "06:00",
      closingTime: "22:00",
      image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80"
    },

    // ── NEW VENUES ────────────────────────────────────────────────────────────
    {
      id: "venue-4",
      name: "Goal Zone Powai Sports Hub",
      tagline: "Premium Indoor & Outdoor Football in Powai",
      description: "Powai's largest multi-sport destination beside Hiranandani Lake, featuring two 7-a-side turfs, an indoor futsal court, and a fully equipped gym.",
      address: "Hiranandani Business Park, Powai",
      city: "Mumbai",
      area: "Powai",
      rating: 4.8,
      reviewCount: 110,
      cancellationPolicyHours: 24,
      openingTime: "06:00",
      closingTime: "23:00",
      image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "venue-5",
      name: "Champions Turf Malad",
      tagline: "Floodlit 7v7 Turf & Badminton Complex in Malad West",
      description: "North Mumbai's go-to sports hub in Malad West, offering two floodlit football turfs, four air-cooled badminton courts, and private changing rooms.",
      address: "SV Road, Near Malad Railway Station, Malad West",
      city: "Mumbai",
      area: "Malad West",
      rating: 4.6,
      reviewCount: 84,
      cancellationPolicyHours: 12,
      openingTime: "06:00",
      closingTime: "23:30",
      image: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "venue-6",
      name: "ProSports Arena Vashi",
      tagline: "Navi Mumbai's #1 Multi-Sport Complex",
      description: "Navi Mumbai's flagship sports destination in Vashi, with three FIFA-grade turf pitches, indoor basketball, cricket nets, and a sports cafe.",
      address: "Sector 30A, Vashi, Navi Mumbai",
      city: "Mumbai",
      area: "Vashi",
      rating: 4.8,
      reviewCount: 143,
      cancellationPolicyHours: 24,
      openingTime: "05:30",
      closingTime: "23:00",
      image: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "venue-7",
      name: "Kick Factory Borivali",
      tagline: "High-Energy Football & Cricket Hub in Borivali East",
      description: "Western suburb powerhouse in Borivali East with two rooftop turfs, a caged cricket box, and 24/7 locker facility, all minutes from the station.",
      address: "Eksar Road, Near Borivali Station, Borivali East",
      city: "Mumbai",
      area: "Borivali",
      rating: 4.5,
      reviewCount: 76,
      cancellationPolicyHours: 12,
      openingTime: "06:00",
      closingTime: "24:00",
      image: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "venue-8",
      name: "Elite Cricket Academy Kandivali",
      tagline: "Professional Pitch & Nets for Serious Cricketers",
      description: "Kandivali's dedicated cricket facility with 3 full-length synthetic pitches, 6 bowling net lanes, batting analysis, and certified BCCI coaching staff.",
      address: "Thakur Complex, Kandivali East",
      city: "Mumbai",
      area: "Kandivali",
      rating: 4.7,
      reviewCount: 58,
      cancellationPolicyHours: 24,
      openingTime: "06:00",
      closingTime: "22:00",
      image: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "venue-9",
      name: "Mumbai Sports Village Chembur",
      tagline: "Central Mumbai's Multi-Sport Destination",
      description: "Central Mumbai's sprawling sports village in Chembur with football turf, cricket pitch, two badminton courts, and a swimming pool, all under one roof.",
      address: "RCF Colony, Chembur",
      city: "Mumbai",
      area: "Chembur",
      rating: 4.6,
      reviewCount: 97,
      cancellationPolicyHours: 24,
      openingTime: "06:00",
      closingTime: "22:30",
      image: "https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "venue-10",
      name: "Kings Court Dadar",
      tagline: "Heritage Football & Indoor Sports Hub in Dadar",
      description: "Centrally located in the heart of Dadar with two premium AstroTurf pitches, indoor table tennis, and a recently renovated squash court — easy train access.",
      address: "Shivaji Park Road, Dadar West",
      city: "Mumbai",
      area: "Dadar",
      rating: 4.7,
      reviewCount: 89,
      cancellationPolicyHours: 24,
      openingTime: "06:00",
      closingTime: "23:00",
      image: "https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "venue-11",
      name: "Versova Beach Football Club",
      tagline: "Beachside Futsal & Football in Versova",
      description: "Mumbai's only beach-adjacent futsal complex in Versova with two sand-adjacent AstroTurf pitches, ocean breeze floodlights, and a beachside kiosk.",
      address: "Versova Beach Road, Andheri West",
      city: "Mumbai",
      area: "Versova",
      rating: 4.8,
      reviewCount: 112,
      cancellationPolicyHours: 12,
      openingTime: "06:00",
      closingTime: "23:00",
      image: "https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "venue-12",
      name: "Worli Sports Dome",
      tagline: "South Mumbai's Premier Indoor Multi-Sport Dome",
      description: "South Mumbai's most modern sports dome near Worli Seaface — fully air-conditioned indoor football, basketball, badminton, and table tennis, all in one iconic dome.",
      address: "Dr. Annie Besant Road, Worli",
      city: "Mumbai",
      area: "Worli",
      rating: 4.9,
      reviewCount: 155,
      cancellationPolicyHours: 24,
      openingTime: "06:00",
      closingTime: "23:00",
      image: "https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "venue-13",
      name: "Premier FC Bandra",
      tagline: "Bandra's Iconic Football & Fitness Hub",
      description: "Bandra's most sought-after football destination with a rooftop 5v5 turf, a ground-level 7v7 pitch, indoor cycling studio, and post-match protein bar.",
      address: "Turner Road, Near Chapel Road, Bandra West",
      city: "Mumbai",
      area: "Bandra",
      rating: 4.8,
      reviewCount: 201,
      cancellationPolicyHours: 24,
      openingTime: "05:30",
      closingTime: "24:00",
      image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=800&q=80"
    }
  ],

  courts: [
    // ── VENUE 1: Apex Arena BKC ──────────────────────────────────────────────
    { id: "court-1",  venueId: "venue-1",  name: "Main Arena 7v7 Turf",        sport: "FOOTBALL",   surface: "FIFA Pro AstroTurf 50mm",       isIndoor: false, baseRate: 1800, isActive: true },
    { id: "court-2",  venueId: "venue-1",  name: "Thunder Box Cricket Pitch",  sport: "CRICKET",    surface: "Synthetic Turf Matting",         isIndoor: false, baseRate: 1400, isActive: true },
    { id: "court-3",  venueId: "venue-1",  name: "Indoor Badminton Court 1",   sport: "BADMINTON",  surface: "BWF Approved Wooden/Vinyl",       isIndoor: true,  baseRate: 600,  isActive: true },

    // ── VENUE 2: Metro Kick Andheri ──────────────────────────────────────────
    { id: "court-4",  venueId: "venue-2",  name: "SkyTurf 5v5 Pitch A",        sport: "FOOTBALL",   surface: "Monofilament AstroTurf",          isIndoor: false, baseRate: 1500, isActive: true },
    { id: "court-5",  venueId: "venue-2",  name: "Gully Cricket Cage",          sport: "CRICKET",    surface: "Astro Matting",                   isIndoor: false, baseRate: 1200, isActive: true },

    // ── VENUE 3: Smash Point Juhu ────────────────────────────────────────────
    { id: "court-6",  venueId: "venue-3",  name: "Centre Court Tennis",         sport: "TENNIS",     surface: "DecoTurf Acrylic Cushion",        isIndoor: false, baseRate: 1100, isActive: true },
    { id: "court-7",  venueId: "venue-3",  name: "Pickleball Court Alpha",      sport: "PICKLEBALL", surface: "Pro-X Hardcoat",                  isIndoor: true,  baseRate: 850,  isActive: true },

    // ── VENUE 4: Goal Zone Powai ─────────────────────────────────────────────
    { id: "court-8",  venueId: "venue-4",  name: "Lakeside 7v7 Turf A",         sport: "FOOTBALL",   surface: "FIFA Pro AstroTurf 50mm",         isIndoor: false, baseRate: 1700, isActive: true },
    { id: "court-9",  venueId: "venue-4",  name: "Lakeside 7v7 Turf B",         sport: "FOOTBALL",   surface: "FIFA Pro AstroTurf 50mm",         isIndoor: false, baseRate: 1700, isActive: true },
    { id: "court-10", venueId: "venue-4",  name: "Indoor Futsal Court",          sport: "FOOTBALL",   surface: "Polyurethane Sports Floor",       isIndoor: true,  baseRate: 1200, isActive: true },

    // ── VENUE 5: Champions Turf Malad ────────────────────────────────────────
    { id: "court-11", venueId: "venue-5",  name: "Champions Turf Main",          sport: "FOOTBALL",   surface: "Domo AstroTurf 60mm",             isIndoor: false, baseRate: 1600, isActive: true },
    { id: "court-12", venueId: "venue-5",  name: "Champions Turf Side",          sport: "FOOTBALL",   surface: "Domo AstroTurf 60mm",             isIndoor: false, baseRate: 1500, isActive: true },
    { id: "court-13", venueId: "venue-5",  name: "Badminton Court A",            sport: "BADMINTON",  surface: "BWF PVC Vinyl",                   isIndoor: true,  baseRate: 500,  isActive: true },
    { id: "court-14", venueId: "venue-5",  name: "Badminton Court B",            sport: "BADMINTON",  surface: "BWF PVC Vinyl",                   isIndoor: true,  baseRate: 500,  isActive: true },

    // ── VENUE 6: ProSports Arena Vashi ───────────────────────────────────────
    { id: "court-15", venueId: "venue-6",  name: "Vashi Turf Pitch 1",           sport: "FOOTBALL",   surface: "FIFA Quality Pro Turf",           isIndoor: false, baseRate: 1900, isActive: true },
    { id: "court-16", venueId: "venue-6",  name: "Vashi Turf Pitch 2",           sport: "FOOTBALL",   surface: "FIFA Quality Pro Turf",           isIndoor: false, baseRate: 1900, isActive: true },
    { id: "court-17", venueId: "venue-6",  name: "Indoor Basketball Court",      sport: "BASKETBALL", surface: "Hardwood Maple",                  isIndoor: true,  baseRate: 1300, isActive: true },
    { id: "court-18", venueId: "venue-6",  name: "Cricket Net Lane 1",           sport: "CRICKET",    surface: "Coir-Backed Synthetic Mat",        isIndoor: false, baseRate: 700,  isActive: true },

    // ── VENUE 7: Kick Factory Borivali ───────────────────────────────────────
    { id: "court-19", venueId: "venue-7",  name: "Rooftop Turf Alpha",           sport: "FOOTBALL",   surface: "FieldTurf Revolution 360",        isIndoor: false, baseRate: 1400, isActive: true },
    { id: "court-20", venueId: "venue-7",  name: "Rooftop Turf Beta",            sport: "FOOTBALL",   surface: "FieldTurf Revolution 360",        isIndoor: false, baseRate: 1400, isActive: true },
    { id: "court-21", venueId: "venue-7",  name: "Cricket Cage Box",             sport: "CRICKET",    surface: "Coir Synthetic",                  isIndoor: false, baseRate: 1000, isActive: true },

    // ── VENUE 8: Elite Cricket Academy Kandivali ─────────────────────────────
    { id: "court-22", venueId: "venue-8",  name: "Main Match Pitch",             sport: "CRICKET",    surface: "SIS Grass Synthetic",             isIndoor: false, baseRate: 1600, isActive: true },
    { id: "court-23", venueId: "venue-8",  name: "Practice Pitch A",             sport: "CRICKET",    surface: "Coconut Coir Mat",                isIndoor: false, baseRate: 1100, isActive: true },
    { id: "court-24", venueId: "venue-8",  name: "Bowling Net Lane Block",       sport: "CRICKET",    surface: "Green Coconut Mat",               isIndoor: false, baseRate: 600,  isActive: true },

    // ── VENUE 9: Mumbai Sports Village Chembur ───────────────────────────────
    { id: "court-25", venueId: "venue-9",  name: "Village Turf Main",            sport: "FOOTBALL",   surface: "AstroTurf 40mm Pile",             isIndoor: false, baseRate: 1500, isActive: true },
    { id: "court-26", venueId: "venue-9",  name: "Cricket Centre Pitch",         sport: "CRICKET",    surface: "Bhavani Synthetic Turf",           isIndoor: false, baseRate: 1200, isActive: true },
    { id: "court-27", venueId: "venue-9",  name: "Badminton Hall Court 1",       sport: "BADMINTON",  surface: "Lin Dan Series PVC",              isIndoor: true,  baseRate: 550,  isActive: true },
    { id: "court-28", venueId: "venue-9",  name: "Badminton Hall Court 2",       sport: "BADMINTON",  surface: "Lin Dan Series PVC",              isIndoor: true,  baseRate: 550,  isActive: true },

    // ── VENUE 10: Kings Court Dadar ──────────────────────────────────────────
    { id: "court-29", venueId: "venue-10", name: "Shivaji Park Turf A",          sport: "FOOTBALL",   surface: "FIFA AstroTurf 55mm",             isIndoor: false, baseRate: 1650, isActive: true },
    { id: "court-30", venueId: "venue-10", name: "Shivaji Park Turf B",          sport: "FOOTBALL",   surface: "FIFA AstroTurf 55mm",             isIndoor: false, baseRate: 1650, isActive: true },
    { id: "court-31", venueId: "venue-10", name: "Squash Court",                 sport: "SQUASH",     surface: "ASB Glass Court Flooring",        isIndoor: true,  baseRate: 900,  isActive: true },

    // ── VENUE 11: Versova Beach FC ───────────────────────────────────────────
    { id: "court-32", venueId: "venue-11", name: "Beachside Pitch North",        sport: "FOOTBALL",   surface: "Beach AstroTurf Sand-Filled",     isIndoor: false, baseRate: 1600, isActive: true },
    { id: "court-33", venueId: "venue-11", name: "Beachside Pitch South",        sport: "FOOTBALL",   surface: "Beach AstroTurf Sand-Filled",     isIndoor: false, baseRate: 1600, isActive: true },

    // ── VENUE 12: Worli Sports Dome ──────────────────────────────────────────
    { id: "court-34", venueId: "venue-12", name: "Dome Indoor Football Pitch",   sport: "FOOTBALL",   surface: "Polyurethane Indoor Turf",        isIndoor: true,  baseRate: 2000, isActive: true },
    { id: "court-35", venueId: "venue-12", name: "Dome Basketball Court",        sport: "BASKETBALL", surface: "Hardwood Maple Pro Grade",        isIndoor: true,  baseRate: 1400, isActive: true },
    { id: "court-36", venueId: "venue-12", name: "Dome Badminton Court A",       sport: "BADMINTON",  surface: "Yonex AC702 Performance Vinyl",  isIndoor: true,  baseRate: 700,  isActive: true },
    { id: "court-37", venueId: "venue-12", name: "Dome Badminton Court B",       sport: "BADMINTON",  surface: "Yonex AC702 Performance Vinyl",  isIndoor: true,  baseRate: 700,  isActive: true },

    // ── VENUE 13: Premier FC Bandra ──────────────────────────────────────────
    { id: "court-38", venueId: "venue-13", name: "Rooftop 5v5 Premier Pitch",    sport: "FOOTBALL",   surface: "CCGrass FIFA Quality",            isIndoor: false, baseRate: 1750, isActive: true },
    { id: "court-39", venueId: "venue-13", name: "Ground Level 7v7 Stadium",     sport: "FOOTBALL",   surface: "CCGrass Stadium Pro",             isIndoor: false, baseRate: 2000, isActive: true }
  ],

  pricingRules: [
    // ── Venue 1 ──────────────────────────────────────────────────────────────
    { id: "rule-1",  venueId: "venue-1",  name: "Evening Peak Rush",       days: "1,2,3,4,5,6,7", startTime: "18:00", endTime: "22:00", multiplier: 1.30, badgeText: "Peak Hours (+30%)" },
    { id: "rule-2",  venueId: "venue-1",  name: "Weekend All-Day Surge",   days: "6,7",            startTime: "07:00", endTime: "22:00", multiplier: 1.20, badgeText: "Weekend Surge (+20%)" },
    { id: "rule-3",  venueId: "venue-1",  name: "Early Bird Discount",     days: "1,2,3,4,5",     startTime: "06:00", endTime: "09:00", multiplier: 0.85, badgeText: "Early Bird (-15%)" },
    // ── Venue 2 ──────────────────────────────────────────────────────────────
    { id: "rule-4",  venueId: "venue-2",  name: "Night Owls Rush",         days: "5,6,7",          startTime: "20:00", endTime: "24:00", multiplier: 1.25, badgeText: "Night Rush (+25%)" },
    { id: "rule-5",  venueId: "venue-2",  name: "Happy Hour Discount",     days: "1,2,3,4,5",     startTime: "12:00", endTime: "15:00", multiplier: 0.80, badgeText: "Happy Hour (-20%)" },
    // ── Venue 3 ──────────────────────────────────────────────────────────────
    { id: "rule-6",  venueId: "venue-3",  name: "Weekend Tennis Peak",     days: "6,7",            startTime: "07:00", endTime: "11:00", multiplier: 1.25, badgeText: "Morning Rush (+25%)" },
    // ── Venue 4 ──────────────────────────────────────────────────────────────
    { id: "rule-7",  venueId: "venue-4",  name: "Powai Evening Rush",      days: "1,2,3,4,5,6,7", startTime: "17:00", endTime: "22:00", multiplier: 1.30, badgeText: "Peak Hours (+30%)" },
    { id: "rule-8",  venueId: "venue-4",  name: "Powai Early Bird",        days: "1,2,3,4,5",     startTime: "06:00", endTime: "08:00", multiplier: 0.85, badgeText: "Early Bird (-15%)" },
    // ── Venue 5 ──────────────────────────────────────────────────────────────
    { id: "rule-9",  venueId: "venue-5",  name: "Malad Weekend Surge",     days: "6,7",            startTime: "08:00", endTime: "22:00", multiplier: 1.20, badgeText: "Weekend Surge (+20%)" },
    // ── Venue 6 ──────────────────────────────────────────────────────────────
    { id: "rule-10", venueId: "venue-6",  name: "Vashi Prime Time",        days: "1,2,3,4,5,6,7", startTime: "18:00", endTime: "22:00", multiplier: 1.35, badgeText: "Prime Time (+35%)" },
    { id: "rule-11", venueId: "venue-6",  name: "Vashi Dawn Special",      days: "1,2,3,4,5",     startTime: "05:30", endTime: "08:00", multiplier: 0.80, badgeText: "Dawn Discount (-20%)" },
    // ── Venue 7 ──────────────────────────────────────────────────────────────
    { id: "rule-12", venueId: "venue-7",  name: "Borivali Night Surge",    days: "5,6,7",          startTime: "20:00", endTime: "24:00", multiplier: 1.25, badgeText: "Night Surge (+25%)" },
    // ── Venue 8 ──────────────────────────────────────────────────────────────
    { id: "rule-13", venueId: "venue-8",  name: "Academy Weekend",         days: "6,7",            startTime: "06:00", endTime: "14:00", multiplier: 1.20, badgeText: "Weekend Premium (+20%)" },
    // ── Venue 9 ──────────────────────────────────────────────────────────────
    { id: "rule-14", venueId: "venue-9",  name: "Chembur Evening Peak",    days: "1,2,3,4,5,6,7", startTime: "18:00", endTime: "22:00", multiplier: 1.25, badgeText: "Peak Hours (+25%)" },
    // ── Venue 10 ─────────────────────────────────────────────────────────────
    { id: "rule-15", venueId: "venue-10", name: "Dadar Rush Hour",         days: "1,2,3,4,5,6,7", startTime: "17:30", endTime: "21:30", multiplier: 1.30, badgeText: "Rush Hour (+30%)" },
    // ── Venue 11 ─────────────────────────────────────────────────────────────
    { id: "rule-16", venueId: "venue-11", name: "Versova Sunset Special",  days: "1,2,3,4,5,6,7", startTime: "17:00", endTime: "20:00", multiplier: 1.35, badgeText: "Sunset Surge (+35%)" },
    // ── Venue 12 ─────────────────────────────────────────────────────────────
    { id: "rule-17", venueId: "venue-12", name: "Dome Prime Evenings",     days: "1,2,3,4,5,6,7", startTime: "18:00", endTime: "23:00", multiplier: 1.30, badgeText: "Prime Time (+30%)" },
    { id: "rule-18", venueId: "venue-12", name: "Dome Morning Deals",      days: "1,2,3,4,5",     startTime: "06:00", endTime: "09:00", multiplier: 0.85, badgeText: "Morning Deal (-15%)" },
    // ── Venue 13 ─────────────────────────────────────────────────────────────
    { id: "rule-19", venueId: "venue-13", name: "Bandra Weeknight Peak",   days: "1,2,3,4,5",     startTime: "18:00", endTime: "22:00", multiplier: 1.30, badgeText: "Peak Hours (+30%)" },
    { id: "rule-20", venueId: "venue-13", name: "Bandra Weekend Premium",  days: "6,7",            startTime: "07:00", endTime: "22:00", multiplier: 1.25, badgeText: "Weekend Premium (+25%)" }
  ],

  bookings: [
    {
      id: "TS-2026-8801",
      venueId: "venue-1",
      courtId: "court-1",
      courtName: "Main Arena 7v7 Turf",
      sport: "FOOTBALL",
      venueName: "Apex Arena Sports Complex",
      userId: "user-1",
      userName: "Alex Morgan",
      userEmail: "player@turfsync.com",
      userPhone: "+91 98765 43210",
      bookingDate: new Date().toISOString().split('T')[0],
      startTime: "19:00",
      endTime: "20:00",
      baseAmount: 1800,
      totalAmount: 2340,
      status: "CONFIRMED",
      paymentStatus: "SUCCEEDED",
      paymentMethod: "Stripe Card (•••• 4242)",
      isRecurring: false,
      cancellationReason: null,
      cancelledAt: null,
      refundAmount: 0,
      refundPercent: 0,
      createdAt: new Date().toISOString()
    }
  ],

  waitlist: [
    {
      id: "wl-1",
      courtId: "court-1",
      courtName: "Main Arena 7v7 Turf",
      venueId: "venue-1",
      bookingDate: new Date().toISOString().split('T')[0],
      startTime: "19:00",
      userId: "user-4",
      userName: "Daniel Craig",
      userEmail: "daniel@example.com",
      status: "WAITING",
      createdAt: new Date().toISOString(),
      notifiedAt: null
    }
  ],

  reviews: [
    { id: "rev-1",  venueId: "venue-1",  userName: "Karthik R.",      rating: 5, date: "2026-08-20", comment: "Best turf in Mumbai! Lighting in BKC is super bright, ball roll is true, and the automated slot booking saves so much time." },
    { id: "rev-2",  venueId: "venue-1",  userName: "Samantha M.",     rating: 5, date: "2026-08-18", comment: "Super smooth checkout. Got an instant refund when we cancelled 2 days prior without hassle." },
    { id: "rev-3",  venueId: "venue-2",  userName: "Rohit S.",        rating: 5, date: "2026-09-01", comment: "Rooftop experience is unreal — playing football with the Andheri skyline at night is something else." },
    { id: "rev-4",  venueId: "venue-3",  userName: "Priya T.",        rating: 5, date: "2026-09-10", comment: "Best pickleball courts in Mumbai, hands down. Springy surface and great lighting at Juhu." },
    { id: "rev-5",  venueId: "venue-4",  userName: "Aditya K.",       rating: 5, date: "2026-09-15", comment: "Playing football by Hiranandani Lake in Powai is a vibe. Excellent turf quality." },
    { id: "rev-6",  venueId: "venue-5",  userName: "Neha P.",         rating: 4, date: "2026-09-12", comment: "Great facility in Malad. Badminton courts are well maintained, parking is easy." },
    { id: "rev-7",  venueId: "venue-6",  userName: "Vijay M.",        rating: 5, date: "2026-09-20", comment: "Best sports complex in Navi Mumbai by far. Turf quality rivals BKC. Worth every rupee." },
    { id: "rev-8",  venueId: "venue-7",  userName: "Suresh B.",       rating: 4, date: "2026-09-05", comment: "Convenient location right near Borivali station. Rooftop turf is well-lit and clean." },
    { id: "rev-9",  venueId: "venue-8",  userName: "Ramesh G.",       rating: 5, date: "2026-09-22", comment: "The BCCI-certified coaches here are phenomenal. Best cricket academy in the western suburbs." },
    { id: "rev-10", venueId: "venue-9",  userName: "Anjali D.",       rating: 4, date: "2026-09-18", comment: "Great all-in-one facility at Chembur. Love that you can book football AND badminton in one place." },
    { id: "rev-11", venueId: "venue-10", userName: "Milind C.",       rating: 5, date: "2026-09-25", comment: "Central location at Dadar is a huge plus. Squash court is excellent — best in south Mumbai." },
    { id: "rev-12", venueId: "venue-11", userName: "Devika N.",       rating: 5, date: "2026-09-28", comment: "There is nothing like playing football with sea breeze at Versova. Magical evening experience!" },
    { id: "rev-13", venueId: "venue-12", userName: "Siddharth W.",   rating: 5, date: "2026-10-01", comment: "The Worli dome is outstanding — fully air-conditioned indoor football in Mumbai? Incredible." },
    { id: "rev-14", venueId: "venue-13", userName: "Alisha B.",      rating: 5, date: "2026-10-03", comment: "Premier FC is a Bandra institution. Rooftop 5v5 at sunset with city views — nothing beats it." }
  ]
};

module.exports = DB;
