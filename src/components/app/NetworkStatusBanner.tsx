'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { useAppStore } from '@/lib/store'

/**
 * Network Status Banner
 * Shows a non-intrusive banner when the user goes offline or comes back online.
 * Auto-dismisses after showing "Back online" message.
 */
export function NetworkStatusBanner() {
  const { isOnline, setIsOnline } = useAppStore()
  const [showBanner, setShowBanner] = useState(false)
  const [wasOffline, setWasOffline] = useState(false)
  const [isReconnecting, setIsReconnecting] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Initial state
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      if (wasOffline) {
        setIsReconnecting(true)
        setShowBanner(true)
        // Hide banner after 3 seconds when back online
        setTimeout(() => {
          setShowBanner(false)
          setIsReconnecting(false)
          setWasOffline(false)
        }, 3000)
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
      setShowBanner(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [wasOffline, setIsOnline])

  // Don't show anything if online and not reconnecting
  if (!showBanner) return null

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-50 safe-top"
        >
          <div
            className={`mx-4 mt-4 rounded-xl shadow-lg ${
              isOnline
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-800 text-white'
            }`}
          >
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isOnline ? (
                  <>
                    {isReconnecting ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Wifi className="w-5 h-5" />
                    )}
                    <div>
                      <p className="font-medium">Back online</p>
                      <p className="text-sm text-emerald-100">
                        {isReconnecting ? 'Syncing your data...' : 'Connection restored'}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-5 h-5" />
                    <div>
                      <p className="font-medium">You&apos;re offline</p>
                      <p className="text-sm text-gray-300">
                        Reports will be saved and sent when you reconnect
                      </p>
                    </div>
                  </>
                )}
              </div>

              {!isOnline && (
                <button
                  onClick={() => setShowBanner(false)}
                  className="p-1 hover:bg-white/10 rounded transition-colors text-sm"
                  aria-label="Dismiss"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
