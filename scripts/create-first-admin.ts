/**
 * Create First Admin Script
 *
 * This script creates the first super_admin account for SafetyAlerts.
 * Run it after setting up the database schema.
 *
 * Usage: npx tsx scripts/create-first-admin.ts
 */

import * as dotenv from 'dotenv'
import * as path from 'path'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import * as readline from 'readline'

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase environment variables.')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer)
    })
  })
}

async function main() {
  console.log('\n🛡️  SafetyAlerts - First Admin Setup')
  console.log('=====================================\n')

  // Check if super_admin already exists
  const { data: existingAdmin, error: checkError } = await supabase
    .from('admin_users')
    .select('id, email')
    .eq('role', 'super_admin')
    .limit(1)
    .single()

  if (existingAdmin) {
    console.log(`⚠️  A super admin already exists: ${existingAdmin.email}`)
    console.log('If you need to create another admin, use the admin dashboard.')
    rl.close()
    process.exit(0)
  }

  if (checkError && checkError.code !== 'PGRST116') {
    // PGRST116 means no rows returned, which is expected
    console.error('Error checking for existing admin:', checkError.message)
    rl.close()
    process.exit(1)
  }

  console.log('No super admin found. Let\'s create one.\n')

  // Get admin details
  const fullName = await prompt('Full Name: ')
  if (!fullName.trim()) {
    console.error('Error: Full name is required.')
    rl.close()
    process.exit(1)
  }

  const email = await prompt('Email: ')
  if (!email.trim() || !email.includes('@')) {
    console.error('Error: Valid email is required.')
    rl.close()
    process.exit(1)
  }

  const password = await prompt('Password (min 8 characters): ')
  if (password.length < 8) {
    console.error('Error: Password must be at least 8 characters.')
    rl.close()
    process.exit(1)
  }

  // Hash password
  console.log('\nCreating admin account...')
  const passwordHash = await bcrypt.hash(password, 12)

  // Create admin
  const { data: newAdmin, error: createError } = await supabase
    .from('admin_users')
    .insert({
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      full_name: fullName.trim(),
      role: 'super_admin',
      is_active: true,
    })
    .select('id, email, full_name, role')
    .single()

  if (createError) {
    console.error('Error creating admin:', createError.message)
    rl.close()
    process.exit(1)
  }

  console.log('\n✅ Super admin created successfully!')
  console.log('=====================================')
  console.log(`Name:  ${newAdmin.full_name}`)
  console.log(`Email: ${newAdmin.email}`)
  console.log(`Role:  ${newAdmin.role}`)
  console.log('=====================================\n')
  console.log('You can now login at: http://localhost:3000/admin/login')
  console.log('\n⚠️  Remember to keep your credentials secure!')

  rl.close()
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  rl.close()
  process.exit(1)
})
