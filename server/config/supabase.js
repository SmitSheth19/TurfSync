const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;

function isSupabaseConfigured() {
  return Boolean(
    supabaseUrl && 
    supabaseKey && 
    !supabaseUrl.includes('your-project-id') &&
    !supabaseKey.includes('your-supabase-key')
  );
}

if (isSupabaseConfigured()) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    console.log('? Connected to Supabase Cloud PostgreSQL (' + supabaseUrl + ')');
  } catch (err) {
    console.warn('?? Failed to initialize Supabase client:', err.message);
    supabase = null;
  }
} else {
  console.log('?? Supabase credentials not set in .env. Running on local resilient store.');
}

module.exports = {
  supabase,
  isSupabaseConfigured
};
