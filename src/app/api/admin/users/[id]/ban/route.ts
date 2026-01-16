import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAdmin, logAdminAction } from '@/lib/admin-auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin('ban_users')
  if (!auth.success || !auth.admin) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id } = await params
  const body = await request.json()
  const { reason, duration } = body // duration in days, null for permanent

  if (!reason) {
    return NextResponse.json({ error: 'Reason is required' }, { status: 400 })
  }

  const supabase = createServerClient()

  // Check if user exists
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('id, status')
    .eq('id', id)
    .single()

  if (fetchError || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Calculate status_until for temporary bans
  let statusUntil = null
  if (duration) {
    const until = new Date()
    until.setDate(until.getDate() + duration)
    statusUntil = until.toISOString()
  }

  // Update user
  const newStatus = duration ? 'suspended' : 'banned'
  const { error: updateError } = await supabase
    .from('users')
    .update({
      status: newStatus,
      status_reason: reason,
      status_until: statusUntil,
    })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to ban user' }, { status: 500 })
  }

  // Create moderation action
  await supabase.from('moderation_actions').insert({
    admin_id: auth.admin.adminId,
    entity_type: 'user',
    entity_id: id,
    action: newStatus,
    reason,
    expires_at: statusUntil,
  })

  // Log action
  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown'
  await logAdminAction(auth.admin.adminId, auth.admin.email, `${newStatus}_user`, {
    entityType: 'user',
    entityId: id,
    details: { reason, duration, statusUntil },
    ipAddress,
  })

  return NextResponse.json({ success: true })
}

// Unban user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin('ban_users')
  if (!auth.success || !auth.admin) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id } = await params
  const supabase = createServerClient()

  // Update user status
  const { error: updateError } = await supabase
    .from('users')
    .update({
      status: 'active',
      status_reason: null,
      status_until: null,
    })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to unban user' }, { status: 500 })
  }

  // Create moderation action
  await supabase.from('moderation_actions').insert({
    admin_id: auth.admin.adminId,
    entity_type: 'user',
    entity_id: id,
    action: 'unbanned',
    reason: 'Manual unban by admin',
  })

  // Log action
  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown'
  await logAdminAction(auth.admin.adminId, auth.admin.email, 'unban_user', {
    entityType: 'user',
    entityId: id,
    ipAddress,
  })

  return NextResponse.json({ success: true })
}
