import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAdmin, logAdminAction } from '@/lib/admin-auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin('moderate_reports')
  if (!auth.success || !auth.admin) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id } = await params
  const body = await request.json()
  const { action, reason, internalNotes } = body

  if (!action || !['approve', 'remove'].includes(action)) {
    return NextResponse.json(
      { error: 'Invalid action. Must be "approve" or "remove"' },
      { status: 400 }
    )
  }

  if (action === 'remove' && !reason) {
    return NextResponse.json(
      { error: 'Reason is required when removing a report' },
      { status: 400 }
    )
  }

  const supabase = createServerClient()

  // Check if report exists
  const { data: report, error: fetchError } = await supabase
    .from('reports')
    .select('id, moderation_status')
    .eq('id', id)
    .single()

  if (fetchError || !report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  }

  // Update report
  const updates: Record<string, unknown> = {
    moderation_status: action === 'approve' ? 'approved' : 'removed',
    moderated_by: auth.admin.adminId,
    moderated_at: new Date().toISOString(),
  }

  if (action === 'remove') {
    updates.removal_reason = reason
    updates.status = 'removed'
  }

  const { error: updateError } = await supabase
    .from('reports')
    .update(updates)
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 })
  }

  // Create moderation action record
  await supabase.from('moderation_actions').insert({
    admin_id: auth.admin.adminId,
    entity_type: 'report',
    entity_id: id,
    action: action === 'approve' ? 'approved' : 'removed',
    reason,
    internal_notes: internalNotes,
  })

  // Log the action
  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown'
  await logAdminAction(auth.admin.adminId, auth.admin.email, `${action}_report`, {
    entityType: 'report',
    entityId: id,
    details: { reason, internalNotes },
    ipAddress,
  })

  return NextResponse.json({ success: true })
}
