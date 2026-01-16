import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin('view_users')
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''

  const offset = (page - 1) * limit
  const supabase = createServerClient()

  let query = supabase.from('users').select('*', { count: 'exact' })

  // Apply filters
  if (search) {
    query = query.ilike('phone', `%${search}%`)
  }
  if (status) {
    query = query.eq('status', status)
  }

  // Apply pagination and ordering
  const { data: users, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get report counts for each user
  const userIds = users?.map((u) => u.id) || []
  const { data: reportCounts } = await supabase
    .from('reports')
    .select('user_id')
    .in('user_id', userIds)

  const reportCountMap: Record<string, number> = {}
  reportCounts?.forEach((r) => {
    reportCountMap[r.user_id] = (reportCountMap[r.user_id] || 0) + 1
  })

  // Add report count to each user
  const usersWithCounts = users?.map((u) => ({
    ...u,
    report_count: reportCountMap[u.id] || 0,
  }))

  return NextResponse.json({
    users: usersWithCounts,
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  })
}
