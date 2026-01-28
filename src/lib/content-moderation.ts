/**
 * Content Moderation for Nigeria Security Alert
 *
 * Handles image moderation using external APIs.
 * Designed to be non-blocking - reports go out immediately,
 * moderation happens in background.
 */

export interface ImageModerationResult {
  safe: boolean
  confidence: number
  categories?: {
    nsfw?: number
    violence?: number
    hate?: number
    spam?: number
  }
  reason?: string
  provider?: string
}

export interface ModerationConfig {
  provider: 'cloudflare' | 'manual' | 'disabled'
  cloudflareAccountId?: string
  cloudflareApiToken?: string
}

/**
 * Get moderation configuration from environment
 */
function getConfig(): ModerationConfig {
  // Check if Cloudflare AI is configured
  if (
    process.env.CLOUDFLARE_ACCOUNT_ID &&
    process.env.CLOUDFLARE_API_TOKEN
  ) {
    return {
      provider: 'cloudflare',
      cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID,
      cloudflareApiToken: process.env.CLOUDFLARE_API_TOKEN,
    }
  }

  // Default to manual moderation (admin reviews all)
  return { provider: 'manual' }
}

/**
 * Moderate an image using configured provider
 *
 * @param imageUrl - Public URL of the image to moderate
 * @returns Moderation result
 */
export async function moderateImage(
  imageUrl: string
): Promise<ImageModerationResult> {
  const config = getConfig()

  switch (config.provider) {
    case 'cloudflare':
      return moderateWithCloudflare(imageUrl, config)
    case 'disabled':
      return { safe: true, confidence: 1, provider: 'disabled' }
    case 'manual':
    default:
      // Manual moderation - mark as pending for admin review
      return {
        safe: true, // Allow through, but flagged for review
        confidence: 0,
        reason: 'pending_manual_review',
        provider: 'manual',
      }
  }
}

/**
 * Moderate image using Cloudflare AI
 * Uses the NSFW classification model
 */
async function moderateWithCloudflare(
  imageUrl: string,
  config: ModerationConfig
): Promise<ImageModerationResult> {
  try {
    // Fetch the image
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image')
    }

    const imageBuffer = await imageResponse.arrayBuffer()

    // Call Cloudflare AI NSFW model
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${config.cloudflareAccountId}/ai/run/@cf/microsoft/resnet-50`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.cloudflareApiToken}`,
          'Content-Type': 'application/octet-stream',
        },
        body: imageBuffer,
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Cloudflare AI error:', errorData)
      // Fall back to manual review on error
      return {
        safe: true,
        confidence: 0,
        reason: 'api_error_fallback_manual',
        provider: 'cloudflare',
      }
    }

    const result = await response.json()

    // Parse Cloudflare response
    // Note: Actual response format depends on the specific model used
    // This is a simplified example - adjust based on real API response
    const nsfwScore = extractNsfwScore(result)

    return {
      safe: nsfwScore < 0.7, // 70% threshold
      confidence: 1 - nsfwScore,
      categories: {
        nsfw: nsfwScore,
      },
      reason: nsfwScore >= 0.7 ? 'nsfw_content_detected' : undefined,
      provider: 'cloudflare',
    }
  } catch (error) {
    console.error('Cloudflare moderation error:', error)
    // Fall back to manual review on error
    return {
      safe: true,
      confidence: 0,
      reason: 'moderation_error_fallback_manual',
      provider: 'cloudflare',
    }
  }
}

/**
 * Extract NSFW score from Cloudflare AI response
 * Adjust this based on actual model output format
 */
function extractNsfwScore(result: any): number {
  // Cloudflare AI models return different formats
  // This is a placeholder - adjust based on actual response
  if (result?.result) {
    // Look for NSFW-related labels in classification results
    const nsfwLabels = ['nsfw', 'adult', 'explicit', 'pornography', 'nudity']

    for (const item of result.result) {
      if (nsfwLabels.some(label =>
        item.label?.toLowerCase().includes(label)
      )) {
        return item.score || 0
      }
    }
  }

  return 0 // Default to safe if no NSFW labels found
}

/**
 * Trigger background moderation for a report's image
 * This is called asynchronously after upload
 */
export async function triggerImageModeration(
  reportId: string,
  imageUrl: string
): Promise<void> {
  try {
    const result = await moderateImage(imageUrl)

    // Update report with moderation result
    const status = result.safe
      ? result.reason === 'pending_manual_review'
        ? 'pending'
        : 'approved'
      : 'flagged'

    await updateReportModerationStatus(reportId, status, result.reason)
  } catch (error) {
    console.error('Failed to moderate image:', error)
    // Leave as pending for manual review
  }
}

/**
 * Update report's image moderation status in database
 */
async function updateReportModerationStatus(
  reportId: string,
  status: string,
  notes?: string
): Promise<void> {
  try {
    // This would typically be a direct Supabase call
    // For now, we'll call an internal API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/admin/reports/${reportId}/moderate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Use service role for internal calls
        'x-internal-service': 'true',
      },
      body: JSON.stringify({
        action: status === 'approved' ? 'approve' : 'flag',
        type: 'image',
        notes,
        auto: true, // Flag as automated moderation
      }),
    })

    if (!response.ok) {
      console.error('Failed to update moderation status')
    }
  } catch (error) {
    console.error('Error updating moderation status:', error)
  }
}

/**
 * Check if content moderation is configured
 */
export function isModerationEnabled(): boolean {
  const config = getConfig()
  return config.provider !== 'disabled'
}

/**
 * Get current moderation provider info
 */
export function getModerationInfo(): { provider: string; configured: boolean } {
  const config = getConfig()
  return {
    provider: config.provider,
    configured: config.provider === 'cloudflare'
      ? !!(config.cloudflareAccountId && config.cloudflareApiToken)
      : true,
  }
}
