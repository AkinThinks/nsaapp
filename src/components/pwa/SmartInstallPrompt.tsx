'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion'
import {
  X,
  Share,
  Plus,
  MoreVertical,
  CheckCircle2,
  Bell,
  Zap,
  Copy,
  Check,
  ChevronUp,
  Smartphone,
  WifiOff
} from 'lucide-react'
import { useDeviceDetect } from '@/hooks/useDeviceDetect'
import { NigerianShield } from '@/components/landing/NigerianShield'
import { triggerHaptic } from '@/hooks/useHaptic'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type PromptStage = 'hidden' | 'teaser' | 'instructions' | 'inapp' | 'success'

const APP_URL = 'app.safetyalertsng.com'

/**
 * Smart PWA Install Prompt - World-class UX
 * Fixed to viewport bottom, works on all devices
 */
export function SmartInstallPrompt() {
  const device = useDeviceDetect()
  const pathname = usePathname()
  const [stage, setStage] = useState<PromptStage>('hidden')
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [copied, setCopied] = useState(false)
  const dragControls = useDragControls()
  const sheetRef = useRef<HTMLDivElement>(null)

  // Don't show during onboarding
  const isOnboarding = pathname?.includes('/onboarding')

  // Check dismissal state and show teaser
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Already installed as PWA
    if (device.isStandalone) {
      setStage('hidden')
      return
    }

    // Don't show during onboarding
    if (isOnboarding) {
      setStage('hidden')
      return
    }

    // Check dismissal time (48 hours)
    const dismissedAt = localStorage.getItem('pwa-smart-dismissed')
    if (dismissedAt) {
      const hoursSince = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60)
      if (hoursSince < 48) {
        setDismissed(true)
        return
      }
    }

    // Show teaser after brief delay
    const timer = setTimeout(() => {
      if (!dismissed && !device.isStandalone && !isOnboarding) {
        setStage('teaser')
        triggerHaptic('light')
      }
    }, 2500)

    return () => clearTimeout(timer)
  }, [device.isStandalone, dismissed, isOnboarding])

  // Listen for native install prompt (Android/Desktop Chrome)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  }, [])

  // Handle native install
  const handleNativeInstall = useCallback(async () => {
    if (!installPrompt) return

    triggerHaptic('medium')
    try {
      await installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice

      if (outcome === 'accepted') {
        triggerHaptic('success')
        setStage('success')
        setTimeout(() => setStage('hidden'), 3000)
      } else {
        setStage('hidden')
      }
    } catch (error) {
      console.error('Install prompt error:', error)
    }
    setInstallPrompt(null)
  }, [installPrompt])

  // Handle dismiss
  const handleDismiss = useCallback(() => {
    triggerHaptic('selection')
    setStage('hidden')
    setDismissed(true)
    localStorage.setItem('pwa-smart-dismissed', Date.now().toString())
  }, [])

  // Handle expand from teaser
  const handleExpand = useCallback(() => {
    triggerHaptic('light')

    if (device.isInAppBrowser) {
      setStage('inapp')
    } else if (installPrompt) {
      handleNativeInstall()
    } else {
      setStage('instructions')
    }
  }, [installPrompt, device.isInAppBrowser, handleNativeInstall])

  // Handle copy link
  const handleCopyLink = useCallback(async () => {
    triggerHaptic('success')
    try {
      await navigator.clipboard.writeText(`https://${APP_URL}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch (err) {
      // Fallback
      const textArea = document.createElement('textarea')
      textArea.value = `https://${APP_URL}`
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 3000)
      } catch (e) {
        console.error('Failed to copy:', e)
      }
      document.body.removeChild(textArea)
    }
  }, [])

  // Handle drag to dismiss
  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.velocity.y > 300 || info.offset.y > 100) {
      handleDismiss()
    }
  }, [handleDismiss])

  // Don't render if hidden, dismissed, installed, or during onboarding
  if (stage === 'hidden' || dismissed || device.isStandalone || isOnboarding) {
    return null
  }

  return (
    <>
      {/* Backdrop for modals */}
      <AnimatePresence>
        {(stage === 'instructions' || stage === 'inapp') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={handleDismiss}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {/* Success state */}
        {stage === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-0 left-0 right-0 z-[9999] p-4 pb-safe"
          >
            <div className="bg-emerald-600 text-white rounded-2xl p-4 shadow-2xl max-w-sm mx-auto flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
              >
                <CheckCircle2 className="w-8 h-8" />
              </motion.div>
              <div>
                <p className="font-bold text-lg">Installed!</p>
                <p className="text-emerald-100 text-sm">Find SafetyAlerts on your home screen</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Teaser - minimal bottom bar */}
        {stage === 'teaser' && (
          <motion.div
            key="teaser"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[9999] p-3 pb-safe"
          >
            <div className="max-w-md mx-auto">
              <motion.button
                onClick={handleExpand}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-white rounded-2xl p-3 shadow-2xl border border-gray-100 flex items-center gap-3 active:bg-gray-50"
              >
                {/* App icon */}
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <NigerianShield className="w-8 h-8 text-white" />
                </div>

                {/* Text */}
                <div className="flex-1 text-left min-w-0">
                  <p className="font-bold text-gray-900 text-base">
                    {device.isInAppBrowser ? 'Open in Browser' : 'Install SafetyAlerts'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {device.isInAppBrowser
                      ? `Copy link & open in ${device.isIOS ? 'Safari' : 'Chrome'}`
                      : 'Get instant alerts on your home screen'
                    }
                  </p>
                </div>

                {/* Action indicator */}
                <div className="flex-shrink-0">
                  <motion.div
                    animate={{ y: [-2, 2, -2] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md"
                  >
                    {device.isInAppBrowser ? 'Copy' : 'Install'}
                  </motion.div>
                </div>
              </motion.button>

              {/* Dismiss button - subtle */}
              <button
                onClick={handleDismiss}
                className="absolute -top-2 right-1 w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Instructions sheet - compact and mobile-friendly */}
        {stage === 'instructions' && (
          <motion.div
            key="instructions"
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            className="fixed bottom-0 left-0 right-0 z-[9999] touch-none"
          >
            <div className="bg-white rounded-t-3xl shadow-2xl max-w-lg mx-auto overflow-hidden">
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>

              {/* Header */}
              <div className="px-5 pb-4 flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <NigerianShield className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-gray-900 text-lg">Install SafetyAlerts</h2>
                  <p className="text-sm text-gray-500">Add to home screen in seconds</p>
                </div>
                <button
                  onClick={handleDismiss}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 active:scale-90 transition-all flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Benefits - compact */}
              <div className="px-5 pb-4">
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                  <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0">
                    <WifiOff className="w-3.5 h-3.5" />
                    <span>Works offline</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0">
                    <Bell className="w-3.5 h-3.5" />
                    <span>Instant alerts</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0">
                    <Zap className="w-3.5 h-3.5" />
                    <span>No download</span>
                  </div>
                </div>
              </div>

              {/* Instructions - device specific, compact */}
              <div className="px-5 pb-6">
                <CompactInstructions device={device} onInstall={installPrompt ? handleNativeInstall : undefined} />
              </div>

              {/* Bottom safe area */}
              <div className="h-safe" />
            </div>
          </motion.div>
        )}

        {/* In-app browser - copy link UI */}
        {stage === 'inapp' && (
          <motion.div
            key="inapp"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            className="fixed bottom-0 left-0 right-0 z-[9999] touch-none"
          >
            <div className="bg-white rounded-t-3xl shadow-2xl max-w-lg mx-auto overflow-hidden">
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>

              {/* Header */}
              <div className="px-5 pb-4 flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <NigerianShield className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-gray-900 text-lg">Open in {device.isIOS ? 'Safari' : 'Chrome'}</h2>
                  <p className="text-sm text-gray-500">
                    {device.inAppBrowserName
                      ? `${device.inAppBrowserName.charAt(0).toUpperCase() + device.inAppBrowserName.slice(1)} browser can\u2019t install apps`
                      : "This browser can\u2019t install apps"
                    }
                  </p>
                </div>
                <button
                  onClick={handleDismiss}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 active:scale-90 transition-all flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Copy link section */}
              <div className="px-5 pb-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-3">
                    Copy this link and paste in {device.isIOS ? 'Safari' : 'Chrome'}:
                  </p>

                  <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                    <span className="text-gray-900 font-medium text-sm truncate">{APP_URL}</span>
                    <motion.button
                      onClick={handleCopyLink}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex-shrink-0 ${
                        copied
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-emerald-600 text-white shadow-md active:shadow-sm'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div className="px-5 pb-6">
                <div className="space-y-2">
                  <Step number={1} text="Tap Copy button above" done={copied} />
                  <Step number={2} text={`Open ${device.isIOS ? 'Safari' : 'Chrome'} on your phone`} />
                  <Step number={3} text="Paste the link in address bar" />
                </div>

                {copied && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-emerald-700">
                      Link copied! Now open {device.isIOS ? 'Safari' : 'Chrome'}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Bottom safe area */}
              <div className="h-safe" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/**
 * Compact step indicator
 */
function Step({ number, text, done }: { number: number; text: string; done?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
        done ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700'
      }`}>
        {done ? <Check className="w-3.5 h-3.5" /> : number}
      </div>
      <p className={`text-sm ${done ? 'text-emerald-700 font-medium' : 'text-gray-700'}`}>{text}</p>
    </div>
  )
}

/**
 * Compact device-specific install instructions
 */
function CompactInstructions({
  device,
  onInstall
}: {
  device: ReturnType<typeof useDeviceDetect>
  onInstall?: () => void
}) {
  // Native install available (Android Chrome, Desktop)
  if (onInstall) {
    return (
      <div className="space-y-4">
        <motion.button
          onClick={onInstall}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 px-6 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 active:shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Smartphone className="w-5 h-5" />
          <span>Install Now</span>
        </motion.button>
        <p className="text-xs text-gray-500 text-center">
          No app store needed. Installs instantly.
        </p>
      </div>
    )
  }

  // iOS Safari
  if (device.isIOS && device.isSafari) {
    return (
      <div className="space-y-3">
        <IOSInstallStep
          number={1}
          title="Tap the Share button"
          description="At the bottom of Safari"
          icon={<ShareIcon />}
          highlight
        />
        <IOSInstallStep
          number={2}
          title="Tap 'Add to Home Screen'"
          description="Scroll down in the menu"
          icon={<Plus className="w-4 h-4" />}
        />
        <IOSInstallStep
          number={3}
          title="Tap 'Add'"
          description="Done! Find it on your home screen"
          icon={<Check className="w-4 h-4" />}
        />
      </div>
    )
  }

  // Android Chrome (no native prompt fallback)
  if (device.isAndroid && device.isChrome) {
    return (
      <div className="space-y-3">
        <IOSInstallStep
          number={1}
          title="Tap the menu ⋮"
          description="Three dots at top right"
          icon={<MoreVertical className="w-4 h-4" />}
          highlight
        />
        <IOSInstallStep
          number={2}
          title="Tap 'Add to Home screen'"
          description="Then tap 'Add' to confirm"
          icon={<Smartphone className="w-4 h-4" />}
        />
      </div>
    )
  }

  // Samsung Browser
  if (device.isSamsungBrowser) {
    return (
      <div className="space-y-3">
        <IOSInstallStep
          number={1}
          title="Tap the menu ≡"
          description="Three lines at bottom"
          icon={<span className="text-sm font-bold">≡</span>}
          highlight
        />
        <IOSInstallStep
          number={2}
          title="Tap 'Add page to'"
          description="Then select 'Home screen'"
          icon={<Smartphone className="w-4 h-4" />}
        />
      </div>
    )
  }

  // Default fallback
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
        <Smartphone className="w-5 h-5 text-gray-600" />
        <div>
          <p className="text-sm font-medium text-gray-900">Look for install prompt</p>
          <p className="text-xs text-gray-500">Check your browser&apos;s address bar or menu</p>
        </div>
      </div>
    </div>
  )
}

/**
 * iOS-style install step
 */
function IOSInstallStep({
  number,
  title,
  description,
  icon,
  highlight
}: {
  number: number
  title: string
  description: string
  icon: React.ReactNode
  highlight?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: number * 0.1 }}
      className={`flex items-center gap-3 p-3 rounded-xl ${
        highlight ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50'
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
        highlight ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600'
      }`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${highlight ? 'text-emerald-900' : 'text-gray-900'}`}>
          {title}
        </p>
        <p className={`text-xs ${highlight ? 'text-emerald-700' : 'text-gray-500'}`}>
          {description}
        </p>
      </div>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
        highlight ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
      }`}>
        {number}
      </div>
    </motion.div>
  )
}

/**
 * iOS Share icon (square with arrow)
 */
function ShareIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  )
}
