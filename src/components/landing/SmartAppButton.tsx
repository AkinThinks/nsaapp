'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Download, ArrowRight } from 'lucide-react'
import { useDevice } from '@/hooks/useDevice'

/**
 * Context-aware button that changes based on device state:
 * - PWA already installed → "Open App"
 * - Mobile, can install → "Install App"
 * - Default → "Open App"
 */
export function SmartAppButton() {
  const device = useDevice()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Server-side or loading: show default
  if (!mounted || device.isLoading) {
    return (
      <Link
        href="/app"
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-full transition-colors"
      >
        <span>Open App</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    )
  }

  // Already running as PWA - show "Open App"
  if (device.isPWA) {
    return (
      <Link
        href="/app"
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-full transition-colors"
      >
        <span>Open App</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    )
  }

  // Mobile and can install - show "Install App"
  if (device.isMobile && device.showInstallPrompt) {
    return (
      <Link
        href="/app"
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-full transition-colors shadow-sm"
      >
        <Download className="w-4 h-4" />
        <span>Install App</span>
      </Link>
    )
  }

  // Default - show "Open App"
  return (
    <Link
      href="/app"
      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-full transition-colors"
    >
      <span>Open App</span>
      <ArrowRight className="w-4 h-4" />
    </Link>
  )
}
