import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAdmin, logAdminAction } from '@/lib/admin-auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin('warn_users')
  if (!auth.success || !auth.admin) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id } = await params
  const body = await request.json()
  const { reason } = body

  if (!reason) {
    return NextResponse.json({ error: 'Reason is required' }, { status: 400 })
  }

  const supabase = createServerClient()

  // Check if user exists
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('id, warning_count, status')
    .eq('id', id)
    .single()

  if (fetchError || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Update user
  const newWarningCount = (user.warning_count || 0) + 1
  const { error: updateError } = await supabase
    .from('users')
    .update({
      status: 'warned',
      status_reason: reason,
      warning_count: newWarningCount,
    })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to warn user' }, { status: 500 })
  }

  // Create moderation action
  await supabase.from('moderation_actions').insert({
    admin_id: auth.admin.adminId,
    entity_type: 'user',
    entity_id: id,
    action: 'warned',
    reason,
  })

  // Log action
  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown'
  await logAdminAction(auth.admin.adminId, auth.admin.email, 'warn_user', {
    entityType: 'user',
    entityId: id,
    details: { reason, warningCount: newWarningCount },
    ipAddress,
  })

  return NextResponse.json({ success: true })
}
