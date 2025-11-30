'use client'

import { useEffect } from 'react'
import { initBrowserCompat } from '@/lib/browser-compat'

/**
 * Browser Compatibility Provider
 * Initializes browser detection and applies compatibility fixes
 */
export function BrowserCompatProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize browser compatibility on mount
    initBrowserCompat()
  }, [])

  return <>{children}</>
}

