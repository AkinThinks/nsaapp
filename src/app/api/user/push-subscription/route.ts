import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// POST - Save push subscription
export async function POST(request: NextRequest) {
  const supabase = createServerClient()

  try {
    const body = await request.json()
    const { user_id, subscription, vibration_enabled } = body

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription' },
        { status: 400 }
      )
    }

    // Upsert subscription
    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id,
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
          },
          vibration_enabled: vibration_enabled !== false, // Default to true
        },
        { onConflict: 'endpoint' }
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ subscription: data })
  } catch (error) {
    console.error('Error saving subscription:', error)
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    )
  }
}

// PATCH - Update vibration preference for user's subscriptions
export async function PATCH(request: NextRequest) {
  const supabase = createServerClient()

  try {
    const body = await request.json()
    const { user_id, vibration_enabled } = body

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    // Update all subscriptions for this user
    const { error } = await supabase
      .from('push_subscriptions')
      .update({ vibration_enabled })
      .eq('user_id', user_id)

    if (error) throw error

    return NextResponse.json({ success: true, vibration_enabled })
  } catch (error) {
    console.error('Error updating vibration preference:', error)
    return NextResponse.json(
      { error: 'Failed to update preference' },
      { status: 500 }
    )
  }
}

// DELETE - Remove push subscription
export async function DELETE(request: NextRequest) {
  const supabase = createServerClient()

  try {
    const body = await request.json()
    const { endpoint, user_id } = body

    if (!endpoint && !user_id) {
      return NextResponse.json({ error: 'Missing endpoint or user_id' }, { status: 400 })
    }

    // Delete by endpoint or user_id
    const query = supabase.from('push_subscriptions').delete()

    if (endpoint) {
      query.eq('endpoint', endpoint)
    } else if (user_id) {
      query.eq('user_id', user_id)
    }

    const { error } = await query

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting subscription:', error)
    return NextResponse.json(
      { error: 'Failed to delete subscription' },
      { status: 500 }
    )
  }
}
