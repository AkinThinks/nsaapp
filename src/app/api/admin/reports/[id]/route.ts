import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin('view_reports')
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id } = await params
  const supabase = createServerClient()

  // Get report with user info
  const { data: report, error } = await supabase
    .from('reports')
    .select(`
      *,
      users!reports_user_id_fkey(id, phone, trust_score),
      moderated_by_admin:admin_users!reports_moderated_by_fkey(full_name, email)
    `)
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  }

  // Get confirmations
  const { data: confirmations } = await supabase
    .from('confirmations')
    .select('*')
    .eq('report_id', id)
    .order('created_at', { ascending: false })

  return NextResponse.json({
    report,
    confirmations: confirmations || [],
  })
}
