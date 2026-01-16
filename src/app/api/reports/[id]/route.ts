import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET - Fetch single report
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient()

  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    return NextResponse.json({ report: data })
  } catch (error) {
    console.error('Error fetching report:', error)
    return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  }
}

// PATCH - Update report status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient()

  try {
    const body = await request.json()
    const { status, ended_at } = body

    const updates: any = {}
    if (status) updates.status = status
    if (ended_at) updates.ended_at = ended_at

    const { data, error } = await supabase
      .from('reports')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ report: data })
  } catch (error) {
    console.error('Error updating report:', error)
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 }
    )
  }
}
