import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import {
  requireAdmin,
  logAdminAction,
  invalidateAllSessions,
} from '@/lib/admin-auth'

// Update admin role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin('manage_admins')
  if (!auth.success || !auth.admin) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id } = await params
  const body = await request.json()
  const { role } = body

  // Prevent updating own role
  if (id === auth.admin.adminId) {
    return NextResponse.json(
      { error: 'You cannot update your own role' },
      { status: 400 }
    )
  }

  // Prevent setting super_admin unless current user is super_admin
  if (role === 'super_admin' && auth.admin.role !== 'super_admin') {
    return NextResponse.json(
      { error: 'Only super admins can assign the super admin role' },
      { status: 403 }
    )
  }

  const supabase = createServerClient()

  // Check if target is a super_admin (can't change super_admin unless you're super_admin)
  const { data: targetAdmin } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', id)
    .single()

  if (targetAdmin?.role === 'super_admin' && auth.admin.role !== 'super_admin') {
    return NextResponse.json(
      { error: 'Only super admins can modify super admin accounts' },
      { status: 403 }
    )
  }

  // Update role
  const { error } = await supabase
    .from('admin_users')
    .update({ role })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Failed to update admin' }, { status: 500 })
  }

  // Log action
  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown'
  await logAdminAction(auth.admin.adminId, auth.admin.email, 'update_admin_role', {
    entityType: 'admin',
    entityId: id,
    details: { newRole: role },
    ipAddress,
  })

  return NextResponse.json({ success: true })
}

// Deactivate admin
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin('delete_admins')
  if (!auth.success || !auth.admin) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id } = await params

  // Prevent self-deletion
  if (id === auth.admin.adminId) {
    return NextResponse.json(
      { error: 'You cannot deactivate your own account' },
      { status: 400 }
    )
  }

  const supabase = createServerClient()

  // Check if target is a super_admin
  const { data: targetAdmin } = await supabase
    .from('admin_users')
    .select('role, email')
    .eq('id', id)
    .single()

  if (!targetAdmin) {
    return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
  }

  if (targetAdmin.role === 'super_admin' && auth.admin.role !== 'super_admin') {
    return NextResponse.json(
      { error: 'Only super admins can deactivate super admin accounts' },
      { status: 403 }
    )
  }

  // Deactivate (soft delete)
  const { error } = await supabase
    .from('admin_users')
    .update({ is_active: false })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Failed to deactivate admin' }, { status: 500 })
  }

  // Invalidate all sessions for this admin
  await invalidateAllSessions(id)

  // Log action
  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown'
  await logAdminAction(auth.admin.adminId, auth.admin.email, 'deactivate_admin', {
    entityType: 'admin',
    entityId: id,
    details: { email: targetAdmin.email },
    ipAddress,
  })

  return NextResponse.json({ success: true })
}
