import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * PATCH /api/reports/[id]/attach-image
 *
 * Attach an uploaded image to an existing report.
 * Optimized for Vercel free tier (10s timeout).
 *
 * Flow:
 * 1. Report created first (notifications sent immediately)
 * 2. Image uploaded in background
 * 3. Image URL attached to report via this endpoint
 * 4. Image marked "pending" for admin review (no async AI to avoid timeout)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: reportId } = await params
  const supabase = createServerClient()

  try {
    const body = await request.json()
    const { photo_url, photo_thumb_url, photo_preview_url, user_id } = body

    if (!photo_url) {
      return NextResponse.json(
        { error: 'photo_url is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(photo_url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid photo_url format' },
        { status: 400 }
      )
    }

    // First, verify the report exists and belongs to the user (if user_id provided)
    const { data: existingReport, error: fetchError } = await supabase
      .from('reports')
      .select('id, user_id, photo_url')
      .eq('id', reportId)
      .single()

    if (fetchError || !existingReport) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    // Verify ownership if user_id is provided
    if (user_id && existingReport.user_id !== user_id) {
      return NextResponse.json(
        { error: 'Not authorized to update this report' },
        { status: 403 }
      )
    }

    // Don't overwrite existing photo unless explicitly requested
    if (existingReport.photo_url && !body.overwrite) {
      return NextResponse.json({
        success: true,
        message: 'Report already has a photo',
        photo_url: existingReport.photo_url,
      })
    }

    // Update the report with image URLs
    const updateData: Record<string, string> = {
      photo_url,
      image_moderation_status: 'pending', // Queue for moderation
    }

    // Add thumbnail URLs if provided
    if (photo_thumb_url) {
      updateData.photo_thumb_url = photo_thumb_url
    }
    if (photo_preview_url) {
      updateData.photo_preview_url = photo_preview_url
    }

    const { data, error: updateError } = await supabase
      .from('reports')
      .update(updateData)
      .eq('id', reportId)
      .select()
      .single()

    if (updateError) {
      console.error('Error attaching image:', updateError)
      return NextResponse.json(
        { error: 'Failed to attach image to report' },
        { status: 500 }
      )
    }

    // Image is now attached with status "pending"
    // Admin will review in dashboard - no async AI call to avoid Vercel timeout
    return NextResponse.json({
      success: true,
      report: data,
    })
  } catch (error) {
    console.error('Error in attach-image:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
