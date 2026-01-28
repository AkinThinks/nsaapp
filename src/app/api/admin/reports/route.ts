import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin('view_reports')
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''
  const type = searchParams.get('type') || ''
  const status = searchParams.get('status') || ''
  const moderationStatus = searchParams.get('moderation_status') || ''

  const offset = (page - 1) * limit
  const supabase = createServerClient()

  let query = supabase
    .from('reports')
    .select('*, users!reports_user_id_fkey(phone, trust_score)', { count: 'exact' })

  // Apply filters
  if (search) {
    query = query.or(`area_name.ilike.%${search}%,landmark.ilike.%${search}%`)
  }
  if (type) {
    query = query.eq('incident_type', type)
  }
  if (status) {
    query = query.eq('status', status)
  }

  // Handle moderation status filter
  if (moderationStatus) {
    if (moderationStatus === 'needs_review') {
      // Show reports with flagged images or text, or pending moderation
      query = query.or('image_moderation_status.eq.flagged,text_moderation_status.eq.flagged,moderation_status.eq.pending')
    } else if (moderationStatus === 'flagged') {
      // Show reports with any flagged content
      query = query.or('image_moderation_status.eq.flagged,text_moderation_status.eq.flagged')
    } else {
      query = query.eq('moderation_status', moderationStatus)
    }
  }

  // Apply pagination and ordering
  const { data: reports, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    reports,
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  })
}
