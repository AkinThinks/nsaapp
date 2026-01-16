/**
 * Create First Admin Script (Direct)
 */

import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase environment variables.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
  const email = 'admin@safetyalerts.ng'
  const password = 'Admin123!'
  const fullName = 'Super Admin'

  console.log('\n🛡️  SafetyAlerts - Creating Super Admin')
  console.log('=====================================\n')

  // Check if admin already exists
  const { data: existingAdmin } = await supabase
    .from('admin_users')
    .select('id, email')
    .eq('email', email)
    .single()

  if (existingAdmin) {
    console.log(`⚠️  Admin already exists: ${existingAdmin.email}`)
    console.log('You can login at: http://localhost:3002/admin/login')
    process.exit(0)
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12)

  // Create admin
  const { data: newAdmin, error: createError } = await supabase
    .from('admin_users')
    .insert({
      email: email.toLowerCase(),
      password_hash: passwordHash,
      full_name: fullName,
      role: 'super_admin',
      is_active: true,
    })
    .select('id, email, full_name, role')
    .single()

  if (createError) {
    console.error('Error creating admin:', createError.message)
    process.exit(1)
  }

  console.log('✅ Super admin created successfully!')
  console.log('=====================================')
  console.log(`Email:    ${newAdmin.email}`)
  console.log(`Password: Admin123!`)
  console.log(`Role:     ${newAdmin.role}`)
  console.log('=====================================\n')
  console.log('Login at: http://localhost:3002/admin/login')
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
