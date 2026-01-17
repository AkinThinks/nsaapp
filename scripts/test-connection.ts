import * as dotenv from 'dotenv'
import * as path from 'path'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { Client } from 'pg';

// Extract project ref from Supabase URL
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const PROJECT_REF = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
const PASSWORD = process.env.DATABASE_PASSWORD

if (!PROJECT_REF || !PASSWORD) {
  console.error('Error: Missing environment variables.')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and DATABASE_PASSWORD are set in .env.local')
  console.error('\nUsage: npx tsx scripts/test-connection.ts')
  process.exit(1)
}

// All possible Supabase regions
const regions = [
  'us-east-1',
  'us-west-1',
  'us-west-2',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'eu-central-1',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-south-1',
  'sa-east-1',
  'ca-central-1',
];

async function testConnections() {
  console.log('Testing Supabase PostgreSQL connections...\n');
  console.log(`Project: ${PROJECT_REF}`);
  console.log(`Password: ${PASSWORD.substring(0, 4)}...${PASSWORD.substring(PASSWORD.length - 4)}\n`);

  // Test all regions with session pooler (port 5432)
  for (const region of regions) {
    const url = `postgresql://postgres.${PROJECT_REF}:${PASSWORD}@aws-0-${region}.pooler.supabase.com:5432/postgres`;
    process.stdout.write(`Testing ${region}... `);

    const client = new Client({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });

    try {
      await client.connect();
      console.log('[SUCCESS]');
      const result = await client.query('SELECT current_database(), current_user, version()');
      console.log(`  Database: ${result.rows[0].current_database}`);
      console.log(`  User: ${result.rows[0].current_user}`);
      console.log(`  Version: ${result.rows[0].version.substring(0, 50)}...`);
      await client.end();
      console.log(`\n\nCORRECT REGION: ${region}`);
      console.log(`Connection URL: postgresql://postgres.${PROJECT_REF}:[PASSWORD]@aws-0-${region}.pooler.supabase.com:5432/postgres`);
      return region;
    } catch (err: unknown) {
      const error = err as Error;
      const shortErr = error.message.length > 30 ? error.message.substring(0, 30) + '...' : error.message;
      console.log(`[FAIL] ${shortErr}`);
      try { await client.end(); } catch {}
    }
  }

  console.log('\n\nNo region worked. The project may be paused or have IP restrictions.');
  return null;
}

testConnections();
