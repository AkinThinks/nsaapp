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
    const { user_id, area_name, area_slug, state, is_primary } = body

    if (!user_id || !area_name || !area_slug || !state) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    const { data, error } = await supabase
      .from('user_locations')
      .insert({
        user_id,
        area_name,
        area_slug,
        state,
        is_primary: is_primary || false,
      })
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
