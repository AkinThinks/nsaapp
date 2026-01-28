import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET - Fetch user's saved locations
export async function GET(request: NextRequest) {
  const supabase = createServerClient()

  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('user_id')

  if (!userId) {
    return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from('user_locations')
      .select('*')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ locations: data })
  } catch (error) {
    console.error('Error fetching user locations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    )
  }
}

// POST - Add a new location
export async function POST(request: NextRequest) {
  const supabase = createServerClient()

  try {
    const body = await request.json()
    const {
      user_id,
      area_name,
      area_slug,
      state,
      is_primary,
      // New fields for enhanced location system
      name,           // Display name like "Home", "Work"
      latitude,
      longitude,
      lga,
      alert_radius_km = 3.0,  // Default 3km radius
      alerts_enabled = true,
    } = body

    if (!user_id || !area_name || !state) {
      return NextResponse.json(
        { error: 'Missing required fields (user_id, area_name, state)' },
        { status: 400 }
      )
    }

    // If setting as primary, unset other primary locations
    if (is_primary) {
      await supabase
        .from('user_locations')
        .update({ is_primary: false })
        .eq('user_id', user_id)
    }

    // Build insert data with optional fields
    const insertData: Record<string, unknown> = {
      user_id,
      area_name,
      area_slug: area_slug || area_name.toLowerCase().replace(/\s+/g, '-'),
      state,
      is_primary: is_primary || false,
      alert_radius_km,
      alerts_enabled,
    }

    // Add optional fields if provided
    if (name) insertData.name = name
    if (latitude !== undefined && latitude !== null) insertData.latitude = latitude
    if (longitude !== undefined && longitude !== null) insertData.longitude = longitude
    if (lga) insertData.lga = lga

    const { data, error } = await supabase
      .from('user_locations')
      .insert(insertData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ location: data }, { status: 201 })
  } catch (error) {
    console.error('Error adding location:', error)
    return NextResponse.json(
      { error: 'Failed to add location' },
      { status: 500 }
    )
  }
}

// PATCH - Update a location
export async function PATCH(request: NextRequest) {
  const supabase = createServerClient()

  try {
    const body = await request.json()
    const {
      id,
      user_id,
      name,
      latitude,
      longitude,
      area_name,
      lga,
      state,
      alert_radius_km,
      alerts_enabled,
      is_primary,
    } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Missing location id' },
        { status: 400 }
      )
    }

    // Build update data with only provided fields
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (name !== undefined) updateData.name = name
    if (latitude !== undefined) updateData.latitude = latitude
    if (longitude !== undefined) updateData.longitude = longitude
    if (area_name !== undefined) updateData.area_name = area_name
    if (lga !== undefined) updateData.lga = lga
    if (state !== undefined) updateData.state = state
    if (alert_radius_km !== undefined) updateData.alert_radius_km = alert_radius_km
    if (alerts_enabled !== undefined) updateData.alerts_enabled = alerts_enabled

    // Handle primary flag change
    if (is_primary !== undefined) {
      updateData.is_primary = is_primary
      // If setting as primary, unset other primary locations
      if (is_primary && user_id) {
        await supabase
          .from('user_locations')
          .update({ is_primary: false })
          .eq('user_id', user_id)
          .neq('id', id)
      }
    }

    const { data, error } = await supabase
      .from('user_locations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ location: data })
  } catch (error) {
    console.error('Error updating location:', error)
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    )
  }
}

// DELETE - Remove a location
export async function DELETE(request: NextRequest) {
  const supabase = createServerClient()

  const searchParams = request.nextUrl.searchParams
  const locationId = searchParams.get('id')

  if (!locationId) {
    return NextResponse.json({ error: 'Missing location id' }, { status: 400 })
  }

  try {
    const { error } = await supabase
      .from('user_locations')
      .delete()
      .eq('id', locationId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting location:', error)
    return NextResponse.json(
      { error: 'Failed to delete location' },
      { status: 500 }
    )
  }
}
