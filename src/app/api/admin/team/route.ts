import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import {
  requireAdmin,
  createAdmin,
  logAdminAction,
  type AdminRole,
} from '@/lib/admin-auth'

// Get all admin users
export async function GET() {
  const auth = await requireAdmin('view_team')
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const supabase = createServerClient()

  const { data: admins, error } = await supabase
    .from('admin_users')
    .select('id, email, full_name, role, is_active, last_login, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ admins })
}

// Create new admin
export async function POST(request: NextRequest) {
  const auth = await requireAdmin('manage_admins')
  if (!auth.success || !auth.admin) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const body = await request.json()
  const { email, password, fullName, role } = body

  // Validate inputs
  if (!email || !password || !fullName || !role) {
    return NextResponse.json(
      { error: 'All fields are required' },
      { status: 400 }
    )
  }

  // Password validation
  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters' },
      { status: 400 }
    )
  }

  // Prevent creating super_admin unless current user is super_admin
  if (role === 'super_admin' && auth.admin.role !== 'super_admin') {
    return NextResponse.json(
      { error: 'Only super admins can create super admin accounts' },
      { status: 403 }
    )
  }

  // Check if email already exists
  const supabase = createServerClient()
  const { data: existing } = await supabase
    .from('admin_users')
    .select('id')
    .eq('email', email.toLowerCase())
    .single()

  if (existing) {
    return NextResponse.json(
      { error: 'An admin with this email already exists' },
      { status: 400 }
    )
  }

  // Create admin
  const newAdmin = await createAdmin(
    {
      email,
      password,
      full_name: fullName,
      role: role as AdminRole,
    },
    auth.admin.adminId
  )

  if (!newAdmin) {
    return NextResponse.json(
      { error: 'Failed to create admin' },
      { status: 500 }
    )
  }

  // Log action
  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown'
  await logAdminAction(auth.admin.adminId, auth.admin.email, 'create_admin', {
    entityType: 'admin',
    entityId: newAdmin.id,
    details: { email, role },
    ipAddress,
  })

  return NextResponse.json({ admin: newAdmin })
}
