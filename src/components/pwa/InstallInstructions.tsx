'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Share,
  Plus,
  MoreVertical,
  Check,
  ChevronDown,
  Smartphone,
  Wifi,
  WifiOff,
  Bell,
  Zap,
  ArrowDown,
  ExternalLink,
  AlertCircle,
} from 'lucide-react'
import { NigerianShield } from '@/components/landing/NigerianShield'

// ============================================
// TYPES
// ============================================

export type DeviceType =
  | 'ios-safari'
  | 'ios-chrome'
  | 'ios-other'
  | 'android-chrome'
  | 'android-samsung'
  | 'android-opera'
  | 'android-firefox'
  | 'android-other'
  | 'desktop-chrome'
  | 'desktop-other'
  | 'in-app-browser'
  | 'unknown'

export interface DetectedDevice {
  type: DeviceType
  browserName: string
  canInstallPWA: boolean
  needsSafariFallback: boolean // iOS non-Safari browsers
  isInAppBrowser: boolean
}

// ============================================
// DEVICE DETECTION (Enhanced)
// ============================================

export function detectDevice(): DetectedDevice {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      type: 'unknown',
      browserName: 'Unknown',
      canInstallPWA: false,
      needsSafariFallback: false,
      isInAppBrowser: false,
    }
  }

  const ua = navigator.userAgent.toLowerCase()

  // Check for in-app browsers first (Facebook, Instagram, WhatsApp, Twitter)
  const isInAppBrowser = /fban|fbav|instagram|whatsapp|twitter|snapchat|linkedin/i.test(ua)
  if (isInAppBrowser) {
    return {
      type: 'in-app-browser',
      browserName: 'In-App Browser',
      canInstallPWA: false,
      needsSafariFallback: false,
      isInAppBrowser: true,
    }
  }

  // iOS Detection
  const isIOS = /ipad|iphone|ipod/.test(ua) && !(window as any).MSStream
  if (isIOS) {
    // Safari is the only iOS browser that can install PWAs
    const isSafari = /safari/.test(ua) && !/chrome|chromium|crios|fxios|edgios|opera/.test(ua)

    if (isSafari) {
      return {
        type: 'ios-safari',
        browserName: 'Safari',
        canInstallPWA: true,
        needsSafariFallback: false,
        isInAppBrowser: false,
      }
    }

    // Chrome on iOS
    if (/crios/.test(ua)) {
      return {
        type: 'ios-chrome',
        browserName: 'Chrome',
        canInstallPWA: false,
        needsSafariFallback: true,
        isInAppBrowser: false,
      }
    }

    // Other iOS browsers
    return {
      type: 'ios-other',
      browserName: 'Browser',
      canInstallPWA: false,
      needsSafariFallback: true,
      isInAppBrowser: false,
    }
  }

  // Android Detection
  const isAndroid = /android/.test(ua)
  if (isAndroid) {
    // Samsung Internet
    if (/samsungbrowser/.test(ua)) {
      return {
        type: 'android-samsung',
        browserName: 'Samsung Internet',
        canInstallPWA: true,
        needsSafariFallback: false,
        isInAppBrowser: false,
      }
    }

    // Opera Mini/Mobile
    if (/opera|opr/.test(ua)) {
      return {
        type: 'android-opera',
        browserName: 'Opera',
        canInstallPWA: true, // Opera supports PWA
        needsSafariFallback: false,
        isInAppBrowser: false,
      }
    }

    // Firefox
    if (/firefox|fxandroid/.test(ua)) {
      return {
        type: 'android-firefox',
        browserName: 'Firefox',
        canInstallPWA: true,
        needsSafariFallback: false,
        isInAppBrowser: false,
      }
    }

    // Chrome (default Android)
    if (/chrome/.test(ua) && !/edg/.test(ua)) {
      return {
        type: 'android-chrome',
        browserName: 'Chrome',
        canInstallPWA: true,
        needsSafariFallback: false,
        isInAppBrowser: false,
      }
    }

    return {
      type: 'android-other',
      browserName: 'Browser',
      canInstallPWA: true,
      needsSafariFallback: false,
      isInAppBrowser: false,
    }
  }

  // Desktop
  if (/chrome/.test(ua) && !/edg/.test(ua)) {
    return {
      type: 'desktop-chrome',
      browserName: 'Chrome',
      canInstallPWA: true,
      needsSafariFallback: false,
      isInAppBrowser: false,
    }
  }

  return {
    type: 'desktop-other',
    browserName: 'Browser',
    canInstallPWA: false,
    needsSafariFallback: false,
    isInAppBrowser: false,
  }
}

// ============================================
// ILLUSTRATED STEP COMPONENT
// ============================================

interface StepProps {
  number: number
  title: string
  description: string
  illustration: React.ReactNode
  isLast?: boolean
  highlight?: boolean
}

function IllustratedStep({ number, title, description, illustration, isLast, highlight }: StepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: number * 0.15 }}
      className={`relative flex gap-4 ${!isLast ? 'pb-6' : ''}`}
    >
      {/* Connecting line */}
      {!isLast && (
        <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-gradient-to-b from-emerald-300 to-transparent" />
      )}

      {/* Step number badge */}
      <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 ${
        highlight
          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
          : 'bg-emerald-100 text-emerald-700'
      }`}>
        {number}
      </div>

      {/* Content */}
      <div className="flex-1 pt-1">
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-600 mb-3">{description}</p>

        {/* Visual illustration */}
        <div className={`rounded-2xl p-4 ${
          highlight ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-gray-50'
        }`}>
          {illustration}
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// DEVICE-SPECIFIC ILLUSTRATIONS
// ============================================

// iOS Safari Share Button Illustration
function IOSShareIllustration() {
  return (
    <div className="flex flex-col items-center">
      {/* Safari browser mockup */}
      <div className="w-full max-w-[200px] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        {/* URL bar */}
        <div className="bg-gray-100 px-3 py-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-300" />
          <div className="flex-1 bg-white rounded px-2 py-1 text-[10px] text-gray-400 truncate">
            safetyalertsng.com
          </div>
        </div>
        {/* Content area */}
        <div className="p-3 flex items-center justify-center h-16">
          <NigerianShield className="w-8 h-8 opacity-30" />
        </div>
        {/* Bottom toolbar - THIS IS THE FOCUS */}
        <div className="bg-gray-100 px-4 py-3 flex items-center justify-around border-t border-gray-200">
          <div className="w-6 h-6 rounded bg-gray-300" />
          <div className="w-6 h-6 rounded bg-gray-300" />
          {/* Share button - HIGHLIGHTED */}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="relative"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-lg">
              <Share className="w-5 h-5 text-white" />
            </div>
            {/* Pulsing ring */}
            <motion.div
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 rounded-lg bg-blue-500"
            />
          </motion.div>
          <div className="w-6 h-6 rounded bg-gray-300" />
          <div className="w-6 h-6 rounded bg-gray-300" />
        </div>
      </div>
      {/* Arrow and label */}
      <motion.div
        animate={{ y: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 1 }}
        className="mt-3 flex flex-col items-center text-blue-600"
      >
        <ArrowDown className="w-5 h-5" />
        <span className="text-xs font-medium mt-1">Tap this button</span>
      </motion.div>
    </div>
  )
}

// iOS "Add to Home Screen" Menu Illustration
function IOSAddToHomeIllustration() {
  return (
    <div className="flex flex-col items-center">
      {/* Share sheet mockup */}
      <div className="w-full max-w-[220px] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <div className="text-xs text-gray-500 text-center">safetyalertsng.com</div>
        </div>

        {/* App icons row */}
        <div className="px-4 py-3 flex gap-4 border-b border-gray-200 overflow-x-auto">
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-xl bg-gray-200" />
            <span className="text-[9px] text-gray-500">Copy</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-xl bg-green-500" />
            <span className="text-[9px] text-gray-500">WhatsApp</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-xl bg-blue-500" />
            <span className="text-[9px] text-gray-500">Message</span>
          </div>
        </div>

        {/* Action list */}
        <div className="divide-y divide-gray-100">
          <div className="px-4 py-3 flex items-center gap-3 text-sm text-gray-600">
            <div className="w-6 h-6 rounded bg-gray-200" />
            <span>Add Bookmark</span>
          </div>

          {/* THE KEY OPTION - HIGHLIGHTED */}
          <motion.div
            animate={{ backgroundColor: ['#f0fdf4', '#dcfce7', '#f0fdf4'] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="px-4 py-3 flex items-center gap-3"
          >
            <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-emerald-700">Add to Home Screen</span>
          </motion.div>

          <div className="px-4 py-3 flex items-center gap-3 text-sm text-gray-600">
            <div className="w-6 h-6 rounded bg-gray-200" />
            <span>Add to Reading List</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3 text-center">
        Scroll down to find this option
      </p>
    </div>
  )
}

// Android Chrome Menu Illustration
function AndroidMenuIllustration() {
  return (
    <div className="flex flex-col items-center">
      {/* Chrome browser mockup */}
      <div className="w-full max-w-[200px] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        {/* Chrome header with menu */}
        <div className="bg-gray-100 px-3 py-2 flex items-center justify-between">
          <div className="flex-1 bg-white rounded-full px-3 py-1 text-[10px] text-gray-400">
            safetyalertsng.com
          </div>
          {/* Menu button - HIGHLIGHTED */}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="ml-2 relative"
          >
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              <MoreVertical className="w-5 h-5 text-white" />
            </div>
            <motion.div
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 rounded-full bg-gray-700"
            />
          </motion.div>
        </div>
        {/* Content */}
        <div className="p-4 flex items-center justify-center h-20">
          <NigerianShield className="w-10 h-10 opacity-30" />
        </div>
      </div>

      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 1 }}
        className="mt-3 flex items-center gap-2 text-gray-700"
      >
        <span className="text-sm font-medium">Tap the 3 dots</span>
        <MoreVertical className="w-5 h-5" />
      </motion.div>
    </div>
  )
}

// Android "Add to Home Screen" Dropdown Illustration
function AndroidAddToHomeIllustration() {
  return (
    <div className="flex flex-col items-center">
      {/* Dropdown menu mockup */}
      <div className="w-full max-w-[200px] bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
        <div className="divide-y divide-gray-100">
          <div className="px-4 py-3 flex items-center gap-3 text-sm text-gray-600">
            <div className="w-5 h-5 rounded bg-gray-200" />
            <span>New tab</span>
          </div>
          <div className="px-4 py-3 flex items-center gap-3 text-sm text-gray-600">
            <div className="w-5 h-5 rounded bg-gray-200" />
            <span>Bookmarks</span>
          </div>

          {/* HIGHLIGHTED OPTION */}
          <motion.div
            animate={{ backgroundColor: ['#f0fdf4', '#dcfce7', '#f0fdf4'] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="px-4 py-3 flex items-center gap-3"
          >
            <Smartphone className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-emerald-700">Add to Home screen</span>
          </motion.div>

          <div className="px-4 py-3 flex items-center gap-3 text-sm text-gray-600">
            <div className="w-5 h-5 rounded bg-gray-200" />
            <span>Settings</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-emerald-600 mt-3 font-medium">
        Tap this option
      </p>
    </div>
  )
}

// Samsung Browser Illustration
function SamsungMenuIllustration() {
  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-[200px] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="bg-purple-600 px-3 py-2 flex items-center justify-between">
          <div className="flex-1 bg-white/20 rounded-full px-3 py-1 text-[10px] text-white/80">
            safetyalertsng.com
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="ml-2"
          >
            <div className="w-7 h-7 rounded-full bg-white/30 flex items-center justify-center">
              <span className="text-white text-lg">≡</span>
            </div>
          </motion.div>
        </div>
        <div className="p-4 flex items-center justify-center h-16">
          <NigerianShield className="w-8 h-8 opacity-30" />
        </div>
      </div>
      <p className="text-xs text-gray-600 mt-3">Tap the menu icon (≡)</p>
    </div>
  )
}

// Success/Confirmation Illustration
function SuccessIllustration() {
  return (
    <div className="flex flex-col items-center py-2">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg mb-3"
      >
        <Check className="w-8 h-8 text-white" />
      </motion.div>
      <p className="text-sm text-gray-600 text-center">
        Done! Find SafetyAlerts on your home screen
      </p>
    </div>
  )
}

// ============================================
// MAIN INSTALL INSTRUCTIONS COMPONENT
// ============================================

interface InstallInstructionsProps {
  device?: DetectedDevice
  onComplete?: () => void
  variant?: 'modal' | 'inline' | 'compact'
}

export function InstallInstructions({
  device: propDevice,
  onComplete,
  variant = 'modal'
}: InstallInstructionsProps) {
  const [device] = useState(() => propDevice || detectDevice())
  const [showSafariFallback, setShowSafariFallback] = useState(false)

  // Benefits that resonate with Nigerian users
  const benefits = [
    {
      icon: <WifiOff className="w-4 h-4" />,
      text: 'Works even with poor network',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: <Bell className="w-4 h-4" />,
      text: 'Get alerts instantly, even when phone is locked',
      color: 'bg-amber-50 text-amber-600',
    },
    {
      icon: <Zap className="w-4 h-4" />,
      text: 'No app store needed - saves your data',
      color: 'bg-emerald-50 text-emerald-600',
    },
  ]

  // Handle in-app browser
  if (device.isInAppBrowser) {
    return (
      <div className={`${variant === 'modal' ? 'p-6' : 'p-4'}`}>
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Open in your browser</p>
            <p className="text-sm text-amber-700 mt-1">
              To install SafetyAlerts, tap the menu and select &quot;Open in Browser&quot; or &quot;Open in Safari/Chrome&quot;
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <ExternalLink className="w-4 h-4" />
          <span>Copy link: safetyalertsng.com</span>
        </div>
      </div>
    )
  }

  // Handle iOS non-Safari browsers
  if (device.needsSafariFallback) {
    return (
      <div className={`${variant === 'modal' ? 'p-6' : 'p-4'}`}>
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl mb-4">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800">Open in Safari to install</p>
            <p className="text-sm text-blue-700 mt-1">
              {device.browserName} cannot install apps. Please open this page in Safari browser.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">1</span>
            <span className="text-sm text-gray-700">Copy this link: <strong>safetyalertsng.com</strong></span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">2</span>
            <span className="text-sm text-gray-700">Open <strong>Safari</strong> browser</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">3</span>
            <span className="text-sm text-gray-700">Paste the link and follow install steps</span>
          </div>
        </div>
      </div>
    )
  }

  // iOS Safari instructions
  if (device.type === 'ios-safari') {
    return (
      <div className={`${variant === 'modal' ? 'p-6' : 'p-4'} space-y-6`}>
        {/* Benefits */}
        {variant !== 'compact' && (
          <div className="flex flex-wrap gap-2">
            {benefits.map((benefit, i) => (
              <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs ${benefit.color}`}>
                {benefit.icon}
                <span>{benefit.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Steps */}
        <div className="space-y-2">
          <IllustratedStep
            number={1}
            title="Tap the Share button"
            description="It's at the bottom of your screen (the square with arrow)"
            illustration={<IOSShareIllustration />}
            highlight
          />

          <IllustratedStep
            number={2}
            title="Tap 'Add to Home Screen'"
            description="Scroll down in the menu to find this option"
            illustration={<IOSAddToHomeIllustration />}
          />

          <IllustratedStep
            number={3}
            title="Tap 'Add' to confirm"
            description="SafetyAlerts will appear on your home screen"
            illustration={<SuccessIllustration />}
            isLast
          />
        </div>
      </div>
    )
  }

  // Android Chrome instructions
  if (device.type === 'android-chrome') {
    return (
      <div className={`${variant === 'modal' ? 'p-6' : 'p-4'} space-y-6`}>
        {variant !== 'compact' && (
          <div className="flex flex-wrap gap-2">
            {benefits.map((benefit, i) => (
              <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs ${benefit.color}`}>
                {benefit.icon}
                <span>{benefit.text}</span>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <IllustratedStep
            number={1}
            title="Tap the menu (⋮)"
            description="Three dots at the top right corner of Chrome"
            illustration={<AndroidMenuIllustration />}
            highlight
          />

          <IllustratedStep
            number={2}
            title="Tap 'Add to Home screen'"
            description="Then tap 'Add' to confirm"
            illustration={<AndroidAddToHomeIllustration />}
            isLast
          />
        </div>
      </div>
    )
  }

  // Samsung Browser instructions
  if (device.type === 'android-samsung') {
    return (
      <div className={`${variant === 'modal' ? 'p-6' : 'p-4'} space-y-6`}>
        {variant !== 'compact' && (
          <div className="flex flex-wrap gap-2">
            {benefits.map((benefit, i) => (
              <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs ${benefit.color}`}>
                {benefit.icon}
                <span>{benefit.text}</span>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <IllustratedStep
            number={1}
            title="Tap the menu (≡)"
            description="Three lines at the bottom right of Samsung Internet"
            illustration={<SamsungMenuIllustration />}
            highlight
          />

          <IllustratedStep
            number={2}
            title="Tap 'Add page to'"
            description="Then select 'Home screen'"
            illustration={<AndroidAddToHomeIllustration />}
            isLast
          />
        </div>
      </div>
    )
  }

  // Opera Browser instructions
  if (device.type === 'android-opera') {
    return (
      <div className={`${variant === 'modal' ? 'p-6' : 'p-4'} space-y-6`}>
        {variant !== 'compact' && (
          <div className="flex flex-wrap gap-2">
            {benefits.map((benefit, i) => (
              <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs ${benefit.color}`}>
                {benefit.icon}
                <span>{benefit.text}</span>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white font-bold">O</div>
            <div>
              <p className="font-medium text-gray-900">Using Opera Browser</p>
              <p className="text-sm text-gray-600">Tap menu (⋮) → &quot;Home screen&quot;</p>
            </div>
          </div>

          <ol className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-medium">1</span>
              Tap the Opera menu icon
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-medium">2</span>
              Tap &quot;Add to Home screen&quot; or &quot;Home screen&quot;
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-medium">3</span>
              Tap &quot;Add&quot; to confirm
            </li>
          </ol>
        </div>
      </div>
    )
  }

  // Firefox instructions
  if (device.type === 'android-firefox') {
    return (
      <div className={`${variant === 'modal' ? 'p-6' : 'p-4'} space-y-6`}>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold">FF</div>
            <div>
              <p className="font-medium text-gray-900">Using Firefox</p>
              <p className="text-sm text-gray-600">Tap menu (⋮) → &quot;Install&quot;</p>
            </div>
          </div>

          <ol className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-medium">1</span>
              Tap the three dots menu (⋮)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-medium">2</span>
              Tap &quot;Install&quot; or &quot;Add to Home screen&quot;
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-medium">3</span>
              Confirm by tapping &quot;Add&quot;
            </li>
          </ol>
        </div>
      </div>
    )
  }

  // Default/Desktop instructions
  return (
    <div className={`${variant === 'modal' ? 'p-6' : 'p-4'} space-y-4`}>
      <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
        <Smartphone className="w-6 h-6 text-gray-600" />
        <div>
          <p className="font-medium text-gray-900">Install SafetyAlerts</p>
          <p className="text-sm text-gray-600">Click the install icon in your browser&apos;s address bar</p>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Or click the &quot;Install&quot; button when your browser prompts you
      </p>
    </div>
  )
}

// ============================================
// EXPORT HELPER
// ============================================

export { IOSShareIllustration, IOSAddToHomeIllustration, AndroidMenuIllustration, AndroidAddToHomeIllustration }
