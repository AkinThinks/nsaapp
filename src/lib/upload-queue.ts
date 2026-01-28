/**
 * Upload Queue Manager
 *
 * Handles offline-resilient image uploads with retry logic.
 * Uses IndexedDB to persist uploads across app restarts.
 */

import { get, set, del, keys, createStore } from 'idb-keyval'

// Create a dedicated store for uploads
const uploadStore = createStore('safetyalerts-uploads', 'pending-uploads')

export interface PendingUpload {
  id: string
  reportId: string
  imageBlob: Blob
  userId?: string
  attempts: number
  lastAttempt: number
  status: 'pending' | 'uploading' | 'failed' | 'complete'
  error?: string
  createdAt: number
}

export interface UploadResult {
  success: boolean
  url?: string
  urls?: {
    full?: string
    preview?: string
    thumb?: string
  }
  error?: string
}

// Retry delays in milliseconds
const RETRY_DELAYS = [
  0,        // Immediate
  5000,     // 5 seconds
  30000,    // 30 seconds
  120000,   // 2 minutes
  300000,   // 5 minutes
]

const MAX_ATTEMPTS = RETRY_DELAYS.length

/**
 * Generate a unique ID for the upload
 */
function generateId(): string {
  return `upload_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
}

/**
 * Add a new upload to the queue
 */
export async function queueUpload(
  reportId: string,
  imageBlob: Blob,
  userId?: string
): Promise<string> {
  const id = generateId()

  const upload: PendingUpload = {
    id,
    reportId,
    imageBlob,
    userId,
    attempts: 0,
    lastAttempt: 0,
    status: 'pending',
    createdAt: Date.now(),
  }

  await set(id, upload, uploadStore)

  // Try to process immediately
  processQueue().catch(console.error)

  return id
}

/**
 * Get all pending uploads
 */
export async function getPendingUploads(): Promise<PendingUpload[]> {
  const allKeys = await keys(uploadStore)
  const uploads: PendingUpload[] = []

  for (const key of allKeys) {
    const upload = await get<PendingUpload>(key, uploadStore)
    if (upload && upload.status !== 'complete') {
      uploads.push(upload)
    }
  }

  return uploads.sort((a, b) => a.createdAt - b.createdAt)
}

/**
 * Get pending upload count
 */
export async function getPendingCount(): Promise<number> {
  const uploads = await getPendingUploads()
  return uploads.filter(u => u.status !== 'complete').length
}

/**
 * Remove a completed or cancelled upload
 */
export async function removeUpload(id: string): Promise<void> {
  await del(id, uploadStore)
}

/**
 * Update upload status
 */
async function updateUpload(upload: PendingUpload): Promise<void> {
  await set(upload.id, upload, uploadStore)
}

/**
 * Process a single upload
 */
async function processUpload(upload: PendingUpload): Promise<UploadResult> {
  // Check if we should retry based on delay
  const delay = RETRY_DELAYS[Math.min(upload.attempts, RETRY_DELAYS.length - 1)]
  const timeSinceLastAttempt = Date.now() - upload.lastAttempt

  if (upload.attempts > 0 && timeSinceLastAttempt < delay) {
    return { success: false, error: 'Waiting for retry delay' }
  }

  // Check max attempts
  if (upload.attempts >= MAX_ATTEMPTS) {
    upload.status = 'failed'
    upload.error = 'Max retry attempts reached'
    await updateUpload(upload)
    return { success: false, error: upload.error }
  }

  // Update status
  upload.status = 'uploading'
  upload.attempts++
  upload.lastAttempt = Date.now()
  await updateUpload(upload)

  try {
    // Create form data
    const formData = new FormData()
    formData.append('file', upload.imageBlob, 'photo.jpg')
    formData.append('report_id', upload.reportId)
    if (upload.userId) {
      formData.append('user_id', upload.userId)
    }

    // Upload
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Upload failed')
    }

    const data = await response.json()

    // Attach image to report
    await attachImageToReport(upload.reportId, data.url, data.urls, upload.userId)

    // Mark as complete
    upload.status = 'complete'
    await updateUpload(upload)

    // Clean up after short delay
    setTimeout(() => removeUpload(upload.id), 5000)

    return {
      success: true,
      url: data.url,
      urls: data.urls,
    }
  } catch (error) {
    upload.status = 'failed'
    upload.error = error instanceof Error ? error.message : 'Upload failed'
    await updateUpload(upload)

    return { success: false, error: upload.error }
  }
}

/**
 * Attach uploaded image to report
 */
async function attachImageToReport(
  reportId: string,
  photoUrl: string,
  urls?: { full?: string; preview?: string; thumb?: string },
  userId?: string
): Promise<void> {
  try {
    const response = await fetch(`/api/reports/${reportId}/attach-image`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        photo_url: photoUrl,
        photo_thumb_url: urls?.thumb,
        photo_preview_url: urls?.preview,
        user_id: userId,
      }),
    })

    if (!response.ok) {
      console.error('Failed to attach image to report')
    }
  } catch (error) {
    console.error('Error attaching image:', error)
  }
}

/**
 * Process all pending uploads
 */
export async function processQueue(): Promise<void> {
  // Check if online
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return
  }

  const uploads = await getPendingUploads()

  for (const upload of uploads) {
    if (upload.status === 'uploading') {
      // Skip if already uploading (might be stale)
      const staleTime = 60000 // 1 minute
      if (Date.now() - upload.lastAttempt > staleTime) {
        upload.status = 'pending' // Reset stale upload
        await updateUpload(upload)
      } else {
        continue
      }
    }

    if (upload.status === 'pending' || upload.status === 'failed') {
      await processUpload(upload)
    }
  }
}

/**
 * Retry a specific failed upload
 */
export async function retryUpload(id: string): Promise<UploadResult> {
  const upload = await get<PendingUpload>(id, uploadStore)

  if (!upload) {
    return { success: false, error: 'Upload not found' }
  }

  // Reset for retry
  upload.status = 'pending'
  upload.attempts = Math.max(0, upload.attempts - 1) // Give one more chance
  await updateUpload(upload)

  return processUpload(upload)
}

/**
 * Initialize queue processor
 * Should be called when app starts
 */
export function initializeUploadQueue(): void {
  if (typeof window === 'undefined') return

  // Process queue on load
  processQueue().catch(console.error)

  // Process queue when coming back online
  window.addEventListener('online', () => {
    processQueue().catch(console.error)
  })

  // Register for background sync if available
  if ('serviceWorker' in navigator && 'sync' in (window as any).ServiceWorkerRegistration?.prototype) {
    navigator.serviceWorker.ready.then((registration) => {
      // @ts-ignore - sync is not in TS types
      registration.sync?.register('sync-uploads').catch(console.error)
    })
  }
}

/**
 * Subscribe to upload status changes
 */
export function onUploadStatusChange(
  callback: (uploads: PendingUpload[]) => void
): () => void {
  let interval: NodeJS.Timeout | null = null

  const check = async () => {
    const uploads = await getPendingUploads()
    callback(uploads)
  }

  // Check every 2 seconds
  interval = setInterval(check, 2000)
  check() // Initial check

  // Return unsubscribe function
  return () => {
    if (interval) {
      clearInterval(interval)
    }
  }
}
