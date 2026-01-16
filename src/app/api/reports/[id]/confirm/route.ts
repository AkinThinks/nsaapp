import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getDistanceKm } from '@/lib/distance'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient()
  const reportId = params.id

  try {
    const body = await request.json()
    const { user_id, latitude, longitude, confirmation_type } = body

    // Validate
    if (!latitude || !longitude || !confirmation_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['confirm', 'deny', 'ended'].includes(confirmation_type)) {
      return NextResponse.json(
        { error: 'Invalid confirmation type' },
        { status: 400 }
      )
    }

    // Get the report
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single()

    if (reportError || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Check distance (must be within 3km to confirm)
    const distance = getDistanceKm(
      latitude,
      longitude,
      report.latitude,
      report.longitude
    )

    if (distance > 3) {
      return NextResponse.json(
        {
          error: 'You are too far from this location to confirm',
          distance: Math.round(distance * 10) / 10,
        },
        { status: 400 }
      )
    }

    // Check for existing confirmation from this user
    if (user_id) {
      const { data: existing } = await supabase
        .from('confirmations')
        .select('id')
        .eq('report_id', reportId)
        .eq('user_id', user_id)
        .single()

      if (existing) {
        return NextResponse.json(
          { error: 'You have already responded to this report' },
          { status: 400 }
        )
      }
    }

    // Insert confirmation
    const { data: confirmation, error: insertError } = await supabase
      .from('confirmations')
      .insert({
        report_id: reportId,
        user_id,
        latitude,
        longitude,
        distance_km: Math.round(distance * 100) / 100,
        confirmation_type,
      })
      .select()
      .single()

    if (insertError) throw insertError

    // Update report counts based on confirmation type
    if (confirmation_type === 'confirm') {
      await supabase
        .from('reports')
        .update({ confirmation_count: report.confirmation_count + 1 })
        .eq('id', reportId)
    } else if (confirmation_type === 'deny') {
      await supabase
        .from('reports')
        .update({ denial_count: report.denial_count + 1 })
        .eq('id', reportId)
    } else if (confirmation_type === 'ended') {
      await supabase
        .from('reports')
        .update({ status: 'ended', ended_at: new Date().toISOString() })
        .eq('id', reportId)
    }

    return NextResponse.json({ confirmation, distance })
  } catch (error) {
    console.error('Error confirming report:', error)
    return NextResponse.json(
      { error: 'Failed to confirm report' },
      { status: 500 }
    )
  }
}
