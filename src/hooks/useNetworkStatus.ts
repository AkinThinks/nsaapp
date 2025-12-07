'use client'

import { useState, useEffect } from 'react'

export interface NetworkStatus {
  isOnline: boolean
  wasOffline: boolean  // True if we detected offline state at some point
  isSlowConnection: boolean  // Detected slow connection (2G/3G)
}

/**
 * Hook to detect network status and connection quality
 * Provides real-time network monitoring for better UX
 */
export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)
  const [isSlowConnection, setIsSlowConnection] = useState(false)

  useEffect(() => {
    // Check initial online status
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine)
      
      // Check connection quality if available (Chrome/Edge)
      if ('connection' in navigator) {
        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
        if (connection) {
          // Detect slow connections (2G, slow-2g, 3g)
          const slowTypes = ['2g', 'slow-2g', '3g']
          setIsSlowConnection(slowTypes.includes(connection.effectiveType?.toLowerCase() || ''))
          
          // Listen for connection changes
          connection.addEventListener('change', () => {
            setIsSlowConnection(slowTypes.includes(connection.effectiveType?.toLowerCase() || ''))
          })
        }
      }
    }

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
  }, [])

  return {
    isOnline,
    wasOffline,
    isSlowConnection,
  }
}



