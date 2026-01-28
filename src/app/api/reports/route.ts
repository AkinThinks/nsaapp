import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import webpush from 'web-push'
import type { Report, IncidentType } from '@/types'
import { moderateReportContent } from '@/lib/text-moderation'
import {
  calculateDistanceMeters,
  VERIFICATION_THRESHOLDS,
  VERIFICATION_TRUST_BONUS,
  type VerificationStatus,
} from '@/lib/location'

// Configure web-push if VAPID keys are available
if (process.env.VAPID_PRIVATE_KEY && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
  webpush.setVapidDetails(
    'mailto:hello@safetyalertsng.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
}

// GET - Fetch reports for areas
export async function GET(request: NextRequest) {
  const supabase = createServerClient()

  const searchParams = request.nextUrl.searchParams
  const areas = searchParams.get('areas')?.split(',') || []
  const status = searchParams.get('status') || 'active'
  const limit = parseInt(searchParams.get('limit') || '50')

  try {
    let query = supabase
      .from('reports')
      .select('*')
      .in('status', status === 'all' ? ['active', 'ended'] : [status])
      .gte(
        'created_at',
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      )
      .order('created_at', { ascending: false })
      .limit(limit)

    // Filter by areas if provided
    if (areas.length > 0) {
      query = query.in('area_slug', areas)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ reports: data })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}

// POST - Create new report
export async function POST(request: NextRequest) {
  const supabase = createServerClient()

  try {
    const body = await request.json()

    const {
      user_id,
      incident_type,
      landmark,
      description,
      photo_url,
      photo_thumb_url,
      photo_preview_url,
      latitude,
      longitude,
      area_name,
      area_slug,
      state,
      lga,
      pending_image, // Flag indicating image will be uploaded separately
      // Device location for verification
      device_latitude,
      device_longitude,
      device_accuracy_meters,
      is_safe_distance_report = false,
      location_source = 'unknown',
    } = body

    // Validate required fields
    if (!incident_type || !latitude || !longitude || !area_name || !area_slug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Moderate text content (language-inclusive, safety-focused)
    const textModeration = moderateReportContent(description, landmark)
    const textModerationStatus = textModeration.safe ? 'approved' : 'flagged'

    // Determine image moderation status
    // If photo provided, set to pending. If pending_image flag, also pending.
    // If no image at all, set to approved (nothing to moderate)
    let imageModerationStatus = 'approved'
    if (photo_url || pending_image) {
      imageModerationStatus = 'pending'
    }

    // Calculate location verification
    let verificationStatus: VerificationStatus = 'pending'
    let distanceToIncidentMeters: number | null = null

    if (device_latitude != null && device_longitude != null && latitude != null && longitude != null) {
      // Calculate distance between device and incident location
      distanceToIncidentMeters = Math.round(
        calculateDistanceMeters(device_latitude, device_longitude, latitude, longitude)
      )

      // Determine verification status based on distance
      if (distanceToIncidentMeters <= VERIFICATION_THRESHOLDS.ONSITE) {
        verificationStatus = 'verified_onsite'
      } else if (distanceToIncidentMeters <= VERIFICATION_THRESHOLDS.NEARBY) {
        verificationStatus = 'verified_nearby'
      } else if (is_safe_distance_report) {
        // User indicated they're reporting from safe distance - give them nearby status
        verificationStatus = 'verified_nearby'
      } else {
        verificationStatus = 'unverified_distant'
      }
    } else if (location_source === 'manual') {
      verificationStatus = 'unverified_manual'
    } else {
      verificationStatus = 'unverified_gps_failed'
    }

    // Get trust bonus based on verification status
    const trustBonus = VERIFICATION_TRUST_BONUS[verificationStatus] || 0

    // Insert report with verification data
    const { data: report, error: insertError } = await supabase
      .from('reports')
      .insert({
        user_id,
        incident_type,
        landmark,
        description,
        photo_url: photo_url || null,
        photo_thumb_url: photo_thumb_url || null,
        photo_preview_url: photo_preview_url || null,
        latitude,
        longitude,
        area_name,
        area_slug,
        state,
        lga: lga || null,
        // Device location for verification
        device_latitude: device_latitude ?? null,
        device_longitude: device_longitude ?? null,
        device_accuracy_meters: device_accuracy_meters ?? null,
        // Verification data
        verification_status: verificationStatus,
        distance_to_incident_meters: distanceToIncidentMeters,
        is_safe_distance_report: is_safe_distance_report || false,
        location_source: location_source || 'unknown',
        status: 'active',
        confirmation_count: 1 + trustBonus, // Verified reports start with trust bonus
        denial_count: 0,
        text_moderation_status: textModerationStatus,
        image_moderation_status: imageModerationStatus,
        moderation_notes: !textModeration.safe ? textModeration.reason : null,
      })
      .select()
      .single()

    if (insertError) throw insertError

    // Send push notifications to users in this area (non-blocking)
    // Notifications go out immediately regardless of moderation status
    sendAlertNotifications(supabase, report).catch(console.error)

    return NextResponse.json({
      report,
      moderation: {
        text: textModerationStatus,
        image: imageModerationStatus,
        pending_image: !!pending_image,
      },
      verification: {
        status: verificationStatus,
        distance_meters: distanceToIncidentMeters,
        trust_bonus: trustBonus,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    )
  }
}

// Send push notifications to users in affected area
// Uses incident location (not device location) for alert matching
async function sendAlertNotifications(supabase: any, report: Report) {
  try {
    let userIds: string[] = []

    // Try enhanced alert matching using incident location
    // This uses the find_users_to_alert SQL function if available
    if (report.latitude && report.longitude) {
      const { data: matchedUsers, error: funcError } = await supabase.rpc(
        'find_users_to_alert',
        {
          incident_lat: report.latitude,
          incident_lng: report.longitude,
          incident_lga: (report as any).lga || null,
          incident_state: report.state || null,
          is_major_incident: false,
        }
      )

      if (!funcError && matchedUsers && matchedUsers.length > 0) {
        userIds = matchedUsers.map((m: any) => m.user_id)
      }
    }

    // Fallback to area_slug matching if no users found via location
    // or if the SQL function isn't available
    if (userIds.length === 0) {
      const { data: userLocations } = await supabase
        .from('user_locations')
        .select('user_id')
        .eq('area_slug', report.area_slug)

      if (userLocations && userLocations.length > 0) {
        userIds = Array.from(new Set(userLocations.map((ul: any) => ul.user_id)))
      }
    }

    if (userIds.length === 0) return

    // Exclude the reporter
    const filteredUserIds = userIds.filter((id) => id !== report.user_id)

    if (filteredUserIds.length === 0) return

    // Get push subscriptions (limit for Vercel free tier)
    // Max 500 recipients per notification batch to stay under 10s timeout
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('user_id', filteredUserIds)
      .limit(500)

    if (!subscriptions || subscriptions.length === 0) return

    // Prepare notification payload
    const incidentLabels: Record<IncidentType, string> = {
      robbery: '🔴 ROBBERY',
      attack: '🔴 ATTACK',
      gunshots: '🔴 GUNSHOTS',
      kidnapping: '🔴 KIDNAPPING',
      checkpoint: '🟡 CHECKPOINT',
      fire: '🟠 FIRE',
      accident: '🟠 ACCIDENT',
      traffic: '🟡 TRAFFIC',
      suspicious: '🟠 SUSPICIOUS',
      other: '⚠️ ALERT',
      official: '📢 OFFICIAL ALERT',
    }

    const title = `${incidentLabels[report.incident_type] || '⚠️ ALERT'} near ${report.area_name}`
    const bodyText = report.landmark
      ? `${report.landmark}: ${report.description || 'Tap for details'}`
      : report.description || 'Tap for details'

    // Send to all subscriptions with per-user vibration preference
    const sendPromises = subscriptions.map(async (sub: any) => {
      const payload = JSON.stringify({
        title,
        body: bodyText.slice(0, 100),
        tag: `report-${report.id}`,
        url: `/app/alert/${report.id}`,
        alertId: report.id,
        vibrate: sub.vibration_enabled !== false, // Respect user preference
        data: {
          type: 'report',
          incident_type: report.incident_type,
        },
      })

      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          payload
        )
      } catch (err: any) {
        // Remove invalid subscriptions
        if (err.statusCode === 404 || err.statusCode === 410) {
          await supabase.from('push_subscriptions').delete().eq('id', sub.id)
        }
      }
    })

    await Promise.allSettled(sendPromises)
  } catch (error) {
    console.error('Error sending notifications:', error)
  }
}
