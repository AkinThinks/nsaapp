/**
 * SafetyAlerts Database Migration Script
 * Connects directly to PostgreSQL to execute schema
 */

import { Client } from 'pg';

const PROJECT_REF = 'llzqyfkxlwirjbkaopbh';
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;

if (!DATABASE_PASSWORD) {
  console.log('Usage: DATABASE_PASSWORD=your_password npx tsx scripts/run-migrations-pg.ts');
  process.exit(1);
}

// Try different connection methods
const connectionStrings = [
  // Direct connection
  `postgresql://postgres:${DATABASE_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres`,
  // Pooler - session mode (different regions)
  `postgresql://postgres.${PROJECT_REF}:${DATABASE_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres.${PROJECT_REF}:${DATABASE_PASSWORD}@aws-0-us-west-1.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres.${PROJECT_REF}:${DATABASE_PASSWORD}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres.${PROJECT_REF}:${DATABASE_PASSWORD}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres.${PROJECT_REF}:${DATABASE_PASSWORD}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`,
];

// SQL migrations
const migrations = [
  { name: 'Enable uuid-ossp extension', sql: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` },
  { name: 'Create users table', sql: `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      phone VARCHAR(20) UNIQUE,
      phone_verified BOOLEAN DEFAULT FALSE,
      trust_score INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  ` },
  { name: 'Create users phone index', sql: `CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);` },
  { name: 'Create user_locations table', sql: `
    CREATE TABLE IF NOT EXISTS user_locations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      area_name VARCHAR(100) NOT NULL,
      area_slug VARCHAR(100) NOT NULL,
      state VARCHAR(50) NOT NULL,
      is_primary BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  ` },
  { name: 'Create user_locations indexes', sql: `
    CREATE INDEX IF NOT EXISTS idx_user_locations_user ON user_locations(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_locations_area ON user_locations(area_slug);
  ` },
  { name: 'Create reports table', sql: `
    CREATE TABLE IF NOT EXISTS reports (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      incident_type VARCHAR(50) NOT NULL,
      landmark VARCHAR(200),
      description TEXT,
      photo_url VARCHAR(500),
      latitude DECIMAL(10, 8) NOT NULL,
      longitude DECIMAL(11, 8) NOT NULL,
      area_name VARCHAR(100) NOT NULL,
      area_slug VARCHAR(100) NOT NULL,
      state VARCHAR(50) NOT NULL,
      status VARCHAR(20) DEFAULT 'active',
      confirmation_count INTEGER DEFAULT 1,
      denial_count INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      ended_at TIMESTAMP WITH TIME ZONE
    );
  ` },
  { name: 'Create reports indexes', sql: `
    CREATE INDEX IF NOT EXISTS idx_reports_area ON reports(area_slug);
    CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
    CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at DESC);
  ` },
  { name: 'Create confirmations table', sql: `
    CREATE TABLE IF NOT EXISTS confirmations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      latitude DECIMAL(10, 8) NOT NULL,
      longitude DECIMAL(11, 8) NOT NULL,
      distance_km DECIMAL(5, 2) NOT NULL,
      confirmation_type VARCHAR(20) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(report_id, user_id)
    );
  ` },
  { name: 'Create confirmations index', sql: `CREATE INDEX IF NOT EXISTS idx_confirmations_report ON confirmations(report_id);` },
  { name: 'Create push_subscriptions table', sql: `
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      endpoint TEXT NOT NULL UNIQUE,
      keys JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  ` },
  { name: 'Create push_subscriptions index', sql: `CREATE INDEX IF NOT EXISTS idx_push_subs_user ON push_subscriptions(user_id);` },
  { name: 'Create otp_codes table', sql: `
    CREATE TABLE IF NOT EXISTS otp_codes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      phone VARCHAR(20) NOT NULL,
      code VARCHAR(6) NOT NULL,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      used BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  ` },
  { name: 'Create otp_codes index', sql: `CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_codes(phone);` },
  { name: 'Create confirmation counts function', sql: `
    CREATE OR REPLACE FUNCTION update_confirmation_counts()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.confirmation_type = 'confirm' THEN
        UPDATE reports SET confirmation_count = confirmation_count + 1 WHERE id = NEW.report_id;
      ELSIF NEW.confirmation_type = 'deny' THEN
        UPDATE reports SET denial_count = denial_count + 1 WHERE id = NEW.report_id;
      ELSIF NEW.confirmation_type = 'ended' THEN
        UPDATE reports SET status = 'ended', ended_at = NOW() WHERE id = NEW.report_id AND status = 'active';
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  ` },
  { name: 'Create confirmation trigger', sql: `
    DROP TRIGGER IF EXISTS trigger_update_confirmation_counts ON confirmations;
    CREATE TRIGGER trigger_update_confirmation_counts
    AFTER INSERT ON confirmations
    FOR EACH ROW EXECUTE FUNCTION update_confirmation_counts();
  ` },
  { name: 'Enable RLS on all tables', sql: `
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;
    ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
    ALTER TABLE confirmations ENABLE ROW LEVEL SECURITY;
    ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;
  ` },
  { name: 'Create users RLS policies', sql: `
    DROP POLICY IF EXISTS "allow_select" ON users;
    DROP POLICY IF EXISTS "allow_insert" ON users;
    DROP POLICY IF EXISTS "allow_update" ON users;
    CREATE POLICY "allow_select" ON users FOR SELECT USING (true);
    CREATE POLICY "allow_insert" ON users FOR INSERT WITH CHECK (true);
    CREATE POLICY "allow_update" ON users FOR UPDATE USING (true);
  ` },
  { name: 'Create user_locations RLS policies', sql: `
    DROP POLICY IF EXISTS "allow_select" ON user_locations;
    DROP POLICY IF EXISTS "allow_insert" ON user_locations;
    DROP POLICY IF EXISTS "allow_delete" ON user_locations;
    CREATE POLICY "allow_select" ON user_locations FOR SELECT USING (true);
    CREATE POLICY "allow_insert" ON user_locations FOR INSERT WITH CHECK (true);
    CREATE POLICY "allow_delete" ON user_locations FOR DELETE USING (true);
  ` },
  { name: 'Create reports RLS policies', sql: `
    DROP POLICY IF EXISTS "allow_select" ON reports;
    DROP POLICY IF EXISTS "allow_insert" ON reports;
    DROP POLICY IF EXISTS "allow_update" ON reports;
    CREATE POLICY "allow_select" ON reports FOR SELECT USING (true);
    CREATE POLICY "allow_insert" ON reports FOR INSERT WITH CHECK (true);
    CREATE POLICY "allow_update" ON reports FOR UPDATE USING (true);
  ` },
  { name: 'Create confirmations RLS policies', sql: `
    DROP POLICY IF EXISTS "allow_select" ON confirmations;
    DROP POLICY IF EXISTS "allow_insert" ON confirmations;
    CREATE POLICY "allow_select" ON confirmations FOR SELECT USING (true);
    CREATE POLICY "allow_insert" ON confirmations FOR INSERT WITH CHECK (true);
  ` },
  { name: 'Create push_subscriptions RLS policies', sql: `
    DROP POLICY IF EXISTS "allow_select" ON push_subscriptions;
    DROP POLICY IF EXISTS "allow_insert" ON push_subscriptions;
    DROP POLICY IF EXISTS "allow_delete" ON push_subscriptions;
    CREATE POLICY "allow_select" ON push_subscriptions FOR SELECT USING (true);
    CREATE POLICY "allow_insert" ON push_subscriptions FOR INSERT WITH CHECK (true);
    CREATE POLICY "allow_delete" ON push_subscriptions FOR DELETE USING (true);
  ` },
  { name: 'Create otp_codes RLS policies', sql: `
    DROP POLICY IF EXISTS "allow_all" ON otp_codes;
    CREATE POLICY "allow_all" ON otp_codes FOR ALL USING (true);
  ` },
];

async function tryConnect(connectionString: string): Promise<Client | null> {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  try {
    await client.connect();
    return client;
  } catch {
    try { await client.end(); } catch {}
    return null;
  }
}

async function runMigrations() {
  console.log('SafetyAlerts Database Migration');
  console.log('================================\n');
  console.log('Trying to connect to Supabase PostgreSQL...\n');

  let client: Client | null = null;

  for (const connStr of connectionStrings) {
    const host = connStr.match(/@([^:\/]+)/)?.[1] || 'unknown';
    process.stdout.write(`  Trying ${host}... `);
    client = await tryConnect(connStr);
    if (client) {
      console.log('[OK]');
      break;
    } else {
      console.log('[FAIL]');
    }
  }

  if (!client) {
    console.log('\n[ERROR] Could not connect to database with any method.');
    console.log('Please check your database password and try again.');
    process.exit(1);
  }

  console.log('\nRunning migrations...\n');

  let success = 0;
  let failed = 0;

  for (const migration of migrations) {
    process.stdout.write(`  ${migration.name}... `);
    try {
      await client.query(migration.sql);
      console.log('[OK]');
      success++;
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        console.log('[SKIP]');
        success++;
      } else {
        console.log(`[FAIL] ${error.message.substring(0, 50)}`);
        failed++;
      }
    }
  }

  // Enable realtime
  console.log('\nEnabling realtime...');
  for (const table of ['reports', 'confirmations']) {
    try {
      await client.query(`ALTER PUBLICATION supabase_realtime ADD TABLE ${table};`);
      console.log(`  ${table}: [OK]`);
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message.includes('already member')) {
        console.log(`  ${table}: [SKIP - already enabled]`);
      } else {
        console.log(`  ${table}: [WARN] ${error.message.substring(0, 40)}`);
      }
    }
  }

  await client.end();

  console.log('\n================================');
  console.log(`Results: ${success} succeeded, ${failed} failed`);

  if (failed === 0) {
    console.log('\n[SUCCESS] All migrations completed!');
    console.log('Run verification: npx tsx scripts/verify-database.ts');
  }
}

runMigrations();
