import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin('view_users')
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id } = await params
  const supabase = createServerClient()

  // Get user
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Get user's saved locations
  const { data: locations } = await supabase
    .from('user_locations')
    .select('*')
    .eq('user_id', id)

  // Get user's reports
  const { data: reports } = await supabase
    .from('reports')
    .select('id, incident_type, area_name, status, created_at')
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Get user's confirmations
  const { data: confirmations, count: confirmationCount } = await supabase
    .from('confirmations')
    .select('*', { count: 'exact' })
    .eq('user_id', id)

  // Get moderation history
  const { data: moderationHistory } = await supabase
    .from('moderation_actions')
    .select('*, admin_users(full_name)')
    .eq('entity_type', 'user')
    .eq('entity_id', id)
    .order('created_at', { ascending: false })

  // Calculate stats
  const reportCount = reports?.length || 0
  const correctConfirmations = confirmations?.filter(
    (c) => c.confirmation_type === 'confirm'
  ).length || 0
  const accuracy = confirmationCount && confirmationCount > 0
    ? Math.round((correctConfirmations / confirmationCount) * 100)
    : 0

  return NextResponse.json({
    user,
    locations: locations || [],
    reports: reports || [],
    moderationHistory: moderationHistory || [],
    stats: {
      reportCount,
      confirmationCount: confirmationCount || 0,
      accuracy,
      warningCount: user.warning_count || 0,
    },
  })
}
