'use client'

import { useState, useEffect } from 'react'
import { X, Share, Plus } from 'lucide-react'
import { NigerianShield } from '@/components/landing/NigerianShield'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIOSPrompt, setShowIOSPrompt] = useState(false)
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
      return // Already installed
    }

    // Check if dismissed recently
    const dismissedAt = localStorage.getItem('pwa-prompt-dismissed')
    if (dismissedAt) {
      const hoursSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60)
      if (hoursSinceDismissed < 24) {
        return // Don't show for 24 hours after dismissal
      }
    }

    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches

    if (isIOS && !isInStandaloneMode) {
      // Wait a bit before showing iOS prompt
      const timer = setTimeout(() => setShowIOSPrompt(true), 3000)
      return () => clearTimeout(timer)
    }

    // Listen for Android/Desktop install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
      setTimeout(() => setShowAndroidPrompt(true), 2000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return

    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice

    if (outcome === 'accepted') {
      setShowAndroidPrompt(false)
    }
    setInstallPrompt(null)
  }

  const handleDismiss = () => {
    setShowIOSPrompt(false)
    setShowAndroidPrompt(false)
    setDismissed(true)
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString())
  }

  // iOS Install Instructions
  if (showIOSPrompt && !dismissed) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg animate-slide-up safe-bottom">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 max-w-lg mx-auto">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <NigerianShield className="w-8 h-8" />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Install SafetyAlerts</h3>
            <p className="text-sm text-gray-600 mt-1">
              Get instant alerts on your home screen
            </p>

            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Share className="w-4 h-4 text-blue-500" />
                <span>Tap the <strong>Share</strong> button below</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Plus className="w-4 h-4 text-gray-500" />
                <span>Then tap <strong>&quot;Add to Home Screen&quot;</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Android/Desktop Install Prompt
  if (showAndroidPrompt && !dismissed && installPrompt) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg animate-slide-up safe-bottom">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 max-w-lg mx-auto">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <NigerianShield className="w-8 h-8" />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Install SafetyAlerts</h3>
            <p className="text-sm text-gray-600 mt-1">
              Add to your home screen for quick access
            </p>
          </div>

          <button
            onClick={handleInstall}
            className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Install
          </button>
        </div>
      </div>
    )
  }

  return null
}
