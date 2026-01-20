import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * GET /api/user/profile?user_id=xxx
 * Fetch user profile from database
 */
export async function GET(request: NextRequest) {
  const supabase = createServerClient()
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('user_id')

  if (!userId) {
    return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // User not found
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/user/profile
 * Update user profile
 */
export async function PATCH(request: NextRequest) {
  const supabase = createServerClient()

  try {
    const body = await request.json()
    const { user_id, ...updates } = body

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
    }

    // Only allow certain fields to be updated
    const allowedUpdates: Record<string, any> = {}
    if (updates.last_active !== undefined) allowedUpdates.last_active = updates.last_active

    const { data: user, error } = await supabase
      .from('users')
      .update({
        ...allowedUpdates,
        last_active: new Date().toISOString(),
      })
      .eq('id', user_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    )
  }
}
