import * as dotenv from 'dotenv'
import * as path from 'path'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase environment variables.')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyDatabase() {
  console.log('Checking SafetyAlerts database tables...\n');

  const tables = [
    'users',
    'user_locations',
    'reports',
    'confirmations',
    'push_subscriptions',
    'otp_codes'
  ];

  let allExist = true;
  const missing: string[] = [];
  const existing: string[] = [];

  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(1);

    if (error && error.code === '42P01') {
      console.log(`[X] ${table}: TABLE DOES NOT EXIST`);
      allExist = false;
      missing.push(table);
    } else if (error) {
      console.log(`[!] ${table}: ${error.message}`);
      missing.push(table);
      allExist = false;
    } else {
      console.log(`[OK] ${table}: EXISTS`);
      existing.push(table);
    }
  }

  console.log('\n' + '='.repeat(50));

  if (allExist) {
    console.log('\n[SUCCESS] All tables exist! Database is ready.');
    console.log('\nExisting tables:');
    existing.forEach(t => console.log(`  - ${t}`));
  } else {
    console.log('\n[ERROR] Some tables are missing. Run the SQL schema in Supabase Dashboard.');
    console.log('\nExisting tables:');
    existing.forEach(t => console.log(`  - ${t}`));
    console.log('\nMissing tables:');
    missing.forEach(t => console.log(`  - ${t}`));
    console.log('\n--- NEXT STEPS ---');
    console.log('1. Go to your Supabase project SQL Editor');
    console.log('2. Click "New Query"');
    console.log('3. Paste the contents of scripts/database-schema.sql');
    console.log('4. Click "Run"');
    console.log('5. Run this verification script again: npx tsx scripts/verify-database.ts');
  }
}

verifyDatabase().catch(console.error);
