/**
 * Image utilities for compression and processing
 * Optimized for Nigerian mobile users on 2G/3G/4G networks
 */

// Dynamic import for heic2any to avoid SSR issues
let heic2any: ((options: { blob: Blob; toType: string; quality?: number }) => Promise<Blob | Blob[]>) | null = null

async function loadHeic2Any() {
  if (!heic2any && typeof window !== 'undefined') {
    try {
      const heicModule = await import('heic2any')
      heic2any = heicModule.default
    } catch (e) {
      console.warn('heic2any not available:', e)
    }
  }
  return heic2any
}

export interface CompressOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  type?: 'image/jpeg' | 'image/png' | 'image/webp'
}

export type NetworkTier = '2g' | '3g' | '4g' | 'unknown'

/**
 * Get compression settings based on network speed
 * Optimized for Nigerian network conditions
 */
export function getCompressionTier(networkType?: string): {
  tier: NetworkTier
  options: CompressOptions
  description: string
} {
  const effectiveType = networkType || getEffectiveNetworkType()

  switch (effectiveType) {
    case 'slow-2g':
    case '2g':
      return {
        tier: '2g',
        options: {
          maxWidth: 600,
          maxHeight: 600,
          quality: 0.5,
          type: 'image/jpeg',
        },
        description: 'Optimizing for slow network...',
      }
    case '3g':
      return {
        tier: '3g',
        options: {
          maxWidth: 800,
          maxHeight: 800,
          quality: 0.6,
          type: 'image/jpeg',
        },
        description: 'Optimizing for your network...',
      }
    case '4g':
    default:
      return {
        tier: '4g',
        options: {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.8,
          type: 'image/jpeg',
        },
        description: 'Preparing image...',
      }
  }
}

/**
 * Get effective network type from Navigator API
 */
function getEffectiveNetworkType(): string {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const connection = (navigator as any).connection
    if (connection?.effectiveType) {
      return connection.effectiveType
    }
  }
  return '4g' // Default to 4G if unknown
}

const DEFAULT_OPTIONS: CompressOptions = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.8,
  type: 'image/jpeg',
}

/**
 * Check if file is HEIC/HEIF format (iPhone default)
 */
export function isHeicFile(file: File): boolean {
  const type = file.type.toLowerCase()
  const name = file.name.toLowerCase()
  return (
    type === 'image/heic' ||
    type === 'image/heif' ||
    name.endsWith('.heic') ||
    name.endsWith('.heif')
  )
}

/**
 * Convert HEIC to JPEG using heic2any library
 * Falls back to original file if conversion fails
 */
export async function convertHeicToJpeg(file: File): Promise<File> {
  if (!isHeicFile(file)) {
    return file
  }

  try {
    const converter = await loadHeic2Any()
    if (!converter) {
      console.warn('HEIC converter not available, returning original file')
      return file
    }

    const result = await converter({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9,
    })

    // heic2any can return single blob or array
    const blob = Array.isArray(result) ? result[0] : result

    // Create new File from blob
    const newFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg')
    return new File([blob], newFileName, { type: 'image/jpeg' })
  } catch (error) {
    console.error('HEIC conversion failed:', error)
    // Return original file - server will try to convert
    return file
  }
}

/**
 * Compress an image file for upload
 * - Automatically converts HEIC to JPEG (for iPhone)
 * - Resizes based on network speed
 * - Targets optimal file size for network conditions
 *
 * @param file - The image file to compress
 * @param options - Override compression options (optional)
 * @param useAdaptiveCompression - Use network-based compression (default: true)
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {},
  useAdaptiveCompression: boolean = true
): Promise<Blob> {
  // Convert HEIC to JPEG first if needed
  let processedFile = file
  if (isHeicFile(file)) {
    processedFile = await convertHeicToJpeg(file)
  }

  // Get compression settings
  let opts: CompressOptions
  if (useAdaptiveCompression && Object.keys(options).length === 0) {
    const { options: tierOptions } = getCompressionTier()
    opts = tierOptions
  } else {
    opts = { ...DEFAULT_OPTIONS, ...options }
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }

    img.onload = () => {
      // Revoke object URL to free memory
      URL.revokeObjectURL(img.src)

      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img
      const maxW = opts.maxWidth!
      const maxH = opts.maxHeight!

      if (width > maxW) {
        height = (height * maxW) / width
        width = maxW
      }
      if (height > maxH) {
        width = (width * maxH) / height
        height = maxH
      }

      // Round dimensions
      width = Math.round(width)
      height = Math.round(height)

      // Set canvas dimensions
      canvas.width = width
      canvas.height = height

      // Draw image with white background (for transparency)
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to compress image'))
          }
        },
        opts.type,
        opts.quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new Error('Failed to load image'))
    }

    // Load the image
    img.src = URL.createObjectURL(processedFile)
  })
}

/**
 * Validate image file
 * - Check file type (including HEIC for iPhone)
 * - Check file size (max 10MB before compression)
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
  ]

  // Check type - also check extension for HEIC (some devices don't set MIME type correctly)
  const type = file.type.toLowerCase()
  const name = file.name.toLowerCase()
  const isValidType =
    validTypes.includes(type) ||
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg') ||
    name.endsWith('.png') ||
    name.endsWith('.webp') ||
    name.endsWith('.heic') ||
    name.endsWith('.heif')

  if (!isValidType) {
    return {
      valid: false,
      error: 'Please select a valid image (JPEG, PNG, WebP, or HEIC)',
    }
  }

  const maxSize = 15 * 1024 * 1024 // 15MB (increased for HEIC files which can be large)

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image is too large. Please select an image under 15MB.',
    }
  }

  return { valid: true }
}

/**
 * Generate a unique filename for upload
 */
export function generateImageFilename(userId: string | undefined): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const prefix = userId ? userId.substring(0, 8) : 'anon'
  return `${prefix}_${timestamp}_${random}.jpg`
}

/**
 * Convert file to base64 for preview
 * Handles HEIC files by converting first
 */
export async function fileToDataUrl(file: File): Promise<string> {
  // Convert HEIC to JPEG for preview
  let processedFile = file
  if (isHeicFile(file)) {
    try {
      processedFile = await convertHeicToJpeg(file)
    } catch (e) {
      // If conversion fails, try to read original (may not work in all browsers)
      console.warn('HEIC preview conversion failed, trying original:', e)
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(processedFile)
  })
}

/**
 * Get estimated upload time based on file size and network
 */
export function getEstimatedUploadTime(sizeBytes: number, networkType?: string): string {
  const tier = getCompressionTier(networkType).tier

  // Estimated speeds (conservative)
  const speeds: Record<NetworkTier, number> = {
    '2g': 15 * 1024, // 15 KB/s
    '3g': 100 * 1024, // 100 KB/s
    '4g': 500 * 1024, // 500 KB/s
    unknown: 100 * 1024,
  }

  const seconds = Math.ceil(sizeBytes / speeds[tier])

  if (seconds < 5) return 'a few seconds'
  if (seconds < 30) return 'less than 30 seconds'
  if (seconds < 60) return 'about a minute'
  return `about ${Math.ceil(seconds / 60)} minutes`
}
