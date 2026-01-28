import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'

/**
 * GET /api/admin/moderation-queue
 * Fetch items that need moderation review
 * - Flagged text content
 * - Flagged/pending images
 * - Reports from low-trust users
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin('moderate_reports')
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const supabase = createServerClient()
  const searchParams = request.nextUrl.searchParams

  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const filter = searchParams.get('filter') || 'all' // all, text, image, low-trust
  const offset = (page - 1) * limit

  try {
    // Build query for items needing review
    let query = supabase
      .from('reports')
      .select(`
        *,
        users!user_id (
          id,
          phone,
          phone_verified,
          trust_score
        )
      `, { count: 'exact' })
      .in('status', ['active', 'pending'])
      .order('created_at', { ascending: false })

    // Apply filters
    if (filter === 'text') {
      query = query.eq('text_moderation_status', 'flagged')
    } else if (filter === 'image') {
      query = query.or('image_moderation_status.eq.flagged,image_moderation_status.eq.pending')
    } else if (filter === 'low-trust') {
      // Reports from users with trust score < 30
      query = query.or(
        'text_moderation_status.eq.flagged,image_moderation_status.eq.flagged,image_moderation_status.eq.pending'
      )
    } else {
      // All items needing review
      query = query.or(
        'text_moderation_status.eq.flagged,image_moderation_status.eq.flagged,image_moderation_status.eq.pending,moderation_status.eq.pending'
      )
    }

    query = query.range(offset, offset + limit - 1)

    const { data: reports, error, count } = await query

    if (error) throw error

    // Get counts by category for the filter tabs
    const [textFlagged, imageFlagged, imagePending] = await Promise.all([
      supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('text_moderation_status', 'flagged')
        .in('status', ['active', 'pending']),
      supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('image_moderation_status', 'flagged')
        .in('status', ['active', 'pending']),
      supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('image_moderation_status', 'pending')
        .in('status', ['active', 'pending']),
    ])

    return NextResponse.json({
      reports: reports || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      counts: {
        textFlagged: textFlagged.count || 0,
        imageFlagged: imageFlagged.count || 0,
        imagePending: imagePending.count || 0,
        total: (textFlagged.count || 0) + (imageFlagged.count || 0) + (imagePending.count || 0),
      },
    })
  } catch (error) {
    console.error('Error fetching moderation queue:', error)
    return NextResponse.json(
      { error: 'Failed to fetch moderation queue' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/moderation-queue
 * Bulk moderate items
 */
export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin('moderate_reports')
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const supabase = createServerClient()

  try {
    const { reportIds, action, reason } = await request.json()

    if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
      return NextResponse.json(
        { error: 'Report IDs required' },
        { status: 400 }
      )
    }

    if (!['approve_text', 'approve_image', 'approve_all', 'remove'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    let updateData: Record<string, any> = {}

    switch (action) {
      case 'approve_text':
        updateData = { text_moderation_status: 'approved' }
        break
      case 'approve_image':
        updateData = { image_moderation_status: 'approved' }
        break
      case 'approve_all':
        updateData = {
          text_moderation_status: 'approved',
          image_moderation_status: 'approved',
          moderation_status: 'approved',
        }
        break
      case 'remove':
        updateData = {
          status: 'removed',
          moderation_status: 'removed',
          moderation_notes: reason || 'Removed via moderation queue',
        }
        break
    }

    const { error } = await supabase
      .from('reports')
      .update(updateData)
      .in('id', reportIds)

    if (error) throw error

    // Log moderation actions
    const actionLogs = reportIds.map((reportId) => ({
      report_id: reportId,
      admin_id: auth.admin!.adminId,
      action,
      reason: reason || null,
      created_at: new Date().toISOString(),
    }))

    await supabase.from('moderation_actions').insert(actionLogs)

    return NextResponse.json({
      success: true,
      moderated: reportIds.length,
    })
  } catch (error) {
    console.error('Error moderating items:', error)
    return NextResponse.json(
      { error: 'Failed to moderate items' },
      { status: 500 }
    )
  }
}
