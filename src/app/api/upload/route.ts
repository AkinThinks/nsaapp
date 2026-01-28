import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import sharp from 'sharp'

const BUCKET_NAME = 'report-images'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB - client compresses before upload

// Optimized for Vercel free tier (10s timeout)
// Only 2 sizes to stay within timeout
const IMAGE_SIZES = {
  thumb: { width: 300, height: 300, quality: 65 },    // Feed cards - small & fast
  full: { width: 1000, height: 1000, quality: 80 },   // Detail view - reduced from 1200
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient()

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('user_id') as string | null
    const reportId = formData.get('report_id') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type - now including HEIC/HEIF
    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif',
    ]

    // Also check by extension (some devices don't set MIME type correctly)
    const fileName = file.name.toLowerCase()
    const isValidByExtension =
      fileName.endsWith('.jpg') ||
      fileName.endsWith('.jpeg') ||
      fileName.endsWith('.png') ||
      fileName.endsWith('.webp') ||
      fileName.endsWith('.heic') ||
      fileName.endsWith('.heif')

    if (!validTypes.includes(file.type) && !isValidByExtension) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPEG, PNG, WebP, or HEIC.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const inputBuffer = Buffer.from(arrayBuffer)

    // Generate unique base filename
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const prefix = userId ? userId.substring(0, 8) : 'anon'
    const baseFilename = `reports/${prefix}_${timestamp}_${random}`

    // Process image with sharp - this handles HEIC conversion automatically
    let sharpInstance = sharp(inputBuffer)

    // Get image metadata
    const metadata = await sharpInstance.metadata()

    // Rotate based on EXIF orientation (important for iPhone photos)
    sharpInstance = sharpInstance.rotate()

    // Process and upload all sizes
    const uploadPromises: Promise<{ size: string; url: string; path: string } | null>[] = []

    for (const [sizeName, config] of Object.entries(IMAGE_SIZES)) {
      uploadPromises.push(
        processAndUploadSize(
          supabase,
          sharpInstance.clone(),
          baseFilename,
          sizeName,
          config,
          metadata
        )
      )
    }

    const results = await Promise.all(uploadPromises)
    const successfulUploads = results.filter((r): r is { size: string; url: string; path: string } => r !== null)

    if (successfulUploads.length === 0) {
      throw new Error('Failed to upload any image sizes')
    }

    // Get URLs by size
    const urls: Record<string, string> = {}
    const paths: Record<string, string> = {}

    for (const upload of successfulUploads) {
      urls[upload.size] = upload.url
      paths[upload.size] = upload.path
    }

    // Return all URLs
    return NextResponse.json({
      success: true,
      url: urls.full || urls.thumb, // Main URL for backwards compatibility
      urls: {
        full: urls.full,
        thumb: urls.thumb,
      },
      paths: {
        full: paths.full,
        thumb: paths.thumb,
      },
      reportId,
    })
  } catch (error) {
    console.error('Error uploading image:', error)

    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('unsupported image format')) {
        return NextResponse.json(
          { error: 'Image format not supported. Please try a different image.' },
          { status: 400 }
        )
      }
      if (error.message.includes('Input buffer contains unsupported image format')) {
        return NextResponse.json(
          { error: 'Could not process this image. Please try a JPEG or PNG.' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to upload image. Please try again.' },
      { status: 500 }
    )
  }
}

/**
 * Process image to specific size and upload to Supabase
 */
async function processAndUploadSize(
  supabase: ReturnType<typeof createServerClient>,
  sharpInstance: sharp.Sharp,
  baseFilename: string,
  sizeName: string,
  config: { width: number; height: number; quality: number },
  metadata: sharp.Metadata
): Promise<{ size: string; url: string; path: string } | null> {
  try {
    // Skip larger sizes if original is smaller
    const originalWidth = metadata.width || 0
    const originalHeight = metadata.height || 0

    // For thumb, always generate. For others, skip if original is smaller
    if (sizeName !== 'thumb') {
      if (originalWidth <= config.width && originalHeight <= config.height) {
        // Original is smaller than target - only generate for 'full'
        if (sizeName !== 'full') {
          return null
        }
      }
    }

    // Resize with fit inside (maintains aspect ratio)
    const processedBuffer = await sharpInstance
      .resize(config.width, config.height, {
        fit: 'inside',
        withoutEnlargement: sizeName !== 'thumb', // Allow enlargement for thumb
      })
      .jpeg({
        quality: config.quality,
        progressive: true, // Progressive JPEG for better loading UX
      })
      .toBuffer()

    const filename = `${baseFilename}_${sizeName}.jpg`

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, processedBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '31536000', // 1 year cache
        upsert: false,
      })

    if (uploadError) {
      console.error(`Upload error for ${sizeName}:`, uploadError)

      // Check if bucket doesn't exist
      if (uploadError.message?.includes('Bucket not found')) {
        throw new Error('Storage not configured. Please contact support.')
      }

      return null
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filename)

    return {
      size: sizeName,
      url: urlData.publicUrl,
      path: data.path,
    }
  } catch (error) {
    console.error(`Error processing ${sizeName}:`, error)
    return null
  }
}
