'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cloud, CloudOff, RefreshCw, Check, X, Loader2 } from 'lucide-react'
import {
  getPendingUploads,
  onUploadStatusChange,
  retryUpload,
  removeUpload,
  type PendingUpload,
} from '@/lib/upload-queue'

interface UploadStatusIndicatorProps {
  className?: string
  minimal?: boolean // Show only count, not details
}

/**
 * Upload Status Indicator
 *
 * Shows pending/uploading/failed upload status.
 * Appears when there are uploads in the queue.
 */
export function UploadStatusIndicator({
  className = '',
  minimal = false,
}: UploadStatusIndicatorProps) {
  const [uploads, setUploads] = useState<PendingUpload[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Subscribe to upload status changes
    const unsubscribe = onUploadStatusChange(setUploads)

    // Track online status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine)
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
    }

    return () => {
      unsubscribe()
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
  }, [])

  // Count by status
  const pendingCount = uploads.filter((u) => u.status === 'pending').length
  const uploadingCount = uploads.filter((u) => u.status === 'uploading').length
  const failedCount = uploads.filter((u) => u.status === 'failed').length
  const totalPending = pendingCount + uploadingCount + failedCount

  // Don't show if no pending uploads
  if (totalPending === 0) {
    return null
  }

  // Determine status color
  const statusColor = failedCount > 0
    ? 'bg-safety-red'
    : uploadingCount > 0
      ? 'bg-safety-amber'
      : 'bg-primary'

  const handleRetry = async (id: string) => {
    await retryUpload(id)
  }

  const handleCancel = async (id: string) => {
    await removeUpload(id)
  }

  if (minimal) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium text-white ${statusColor} ${className}`}
      >
        {uploadingCount > 0 ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : failedCount > 0 ? (
          <CloudOff className="w-3 h-3" />
        ) : (
          <Cloud className="w-3 h-3" />
        )}
        <span>{totalPending}</span>
      </motion.div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={`fixed bottom-20 left-4 right-4 z-50 ${className}`}
      >
        <div className="bg-background-elevated border border-border rounded-2xl shadow-lg overflow-hidden max-w-md mx-auto">
          {/* Header - Always visible */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors"
          >
            <div className={`w-8 h-8 rounded-full ${statusColor} flex items-center justify-center`}>
              {uploadingCount > 0 ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : failedCount > 0 ? (
                <CloudOff className="w-4 h-4 text-white" />
              ) : (
                <Cloud className="w-4 h-4 text-white" />
              )}
            </div>

            <div className="flex-1 text-left">
              <p className="font-medium text-foreground text-sm">
                {uploadingCount > 0
                  ? `Uploading ${uploadingCount} photo${uploadingCount > 1 ? 's' : ''}...`
                  : failedCount > 0
                    ? `${failedCount} upload${failedCount > 1 ? 's' : ''} failed`
                    : `${pendingCount} photo${pendingCount > 1 ? 's' : ''} waiting`}
              </p>
              <p className="text-xs text-muted-foreground">
                {!isOnline
                  ? 'Waiting for connection...'
                  : uploadingCount > 0
                    ? 'Your report is live, photo uploading'
                    : failedCount > 0
                      ? 'Tap to retry'
                      : 'Will upload automatically'}
              </p>
            </div>

            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              className="text-muted-foreground"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </motion.div>
          </button>

          {/* Expanded list */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden border-t border-border"
              >
                <div className="max-h-48 overflow-y-auto">
                  {uploads.map((upload) => (
                    <div
                      key={upload.id}
                      className="px-4 py-2 flex items-center gap-3 border-b border-border last:border-0"
                    >
                      {/* Status icon */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          upload.status === 'uploading'
                            ? 'bg-safety-amber/20'
                            : upload.status === 'failed'
                              ? 'bg-safety-red/20'
                              : upload.status === 'complete'
                                ? 'bg-safety-green/20'
                                : 'bg-muted'
                        }`}
                      >
                        {upload.status === 'uploading' ? (
                          <Loader2 className="w-3 h-3 text-safety-amber animate-spin" />
                        ) : upload.status === 'failed' ? (
                          <X className="w-3 h-3 text-safety-red" />
                        ) : upload.status === 'complete' ? (
                          <Check className="w-3 h-3 text-safety-green" />
                        ) : (
                          <Cloud className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">
                          Report photo
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {upload.status === 'uploading'
                            ? `Attempt ${upload.attempts}`
                            : upload.status === 'failed'
                              ? upload.error || 'Upload failed'
                              : upload.status === 'complete'
                                ? 'Uploaded'
                                : 'Pending'}
                        </p>
                      </div>

                      {/* Actions */}
                      {upload.status === 'failed' && (
                        <button
                          onClick={() => handleRetry(upload.id)}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                          title="Retry"
                        >
                          <RefreshCw className="w-4 h-4 text-muted-foreground" />
                        </button>
                      )}
                      {(upload.status === 'failed' || upload.status === 'pending') && (
                        <button
                          onClick={() => handleCancel(upload.id)}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                          title="Cancel"
                        >
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default UploadStatusIndicator
