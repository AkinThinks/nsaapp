'use client'

import { useState, useEffect } from 'react'

export interface DeviceInfo {
  // Device type
  isIOS: boolean
  isAndroid: boolean
  isDesktop: boolean
  isMobile: boolean

  // Browser info
  isSafari: boolean
  isChrome: boolean
  isFirefox: boolean
  isSamsungBrowser: boolean

  // In-app browser detection (Instagram, TikTok, Facebook, etc.)
  isInAppBrowser: boolean
  inAppBrowserName: 'instagram' | 'facebook' | 'tiktok' | 'twitter' | 'linkedin' | 'snapchat' | 'telegram' | 'whatsapp' | null

  // PWA status
  isStandalone: boolean  // Running as installed PWA
  canInstall: boolean    // Browser supports installation
  isPWAReady: boolean    // Service worker registered

  // Capabilities
  supportsPush: boolean
  supportsGeolocation: boolean
  supportsVibration: boolean
  supportsShare: boolean

  // Connection
  isOnline: boolean
  connectionType: 'wifi' | '4g' | '3g' | '2g' | 'unknown'

  // Screen
  screenSize: 'small' | 'medium' | 'large'  // <640, 640-1024, >1024
}

/**
 * Smart device detection hook for Nigerian context
 * Optimized for common devices: Tecno, Infinix, Samsung, iPhone
 */
export function useDeviceDetect(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isIOS: false,
    isAndroid: false,
    isDesktop: true,
    isMobile: false,
    isSafari: false,
    isChrome: false,
    isFirefox: false,
    isSamsungBrowser: false,
    isInAppBrowser: false,
    inAppBrowserName: null,
    isStandalone: false,
    canInstall: false,
    isPWAReady: false,
    supportsPush: false,
    supportsGeolocation: false,
    supportsVibration: false,
    supportsShare: false,
    isOnline: true,
    connectionType: 'unknown',
    screenSize: 'large',
  })

  useEffect(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return

    const ua = navigator.userAgent.toLowerCase()

    // Device detection
    const isIOS = /ipad|iphone|ipod/.test(ua) && !(window as { MSStream?: unknown }).MSStream
    const isAndroid = /android/.test(ua)
    const isMobile = isIOS || isAndroid || /mobile|tablet/.test(ua)
    const isDesktop = !isMobile

    // Browser detection
    const isSafari = /safari/.test(ua) && !/chrome|chromium|edg|firefox|opera|samsung/.test(ua)
    const isChrome = /chrome|chromium/.test(ua) && !/edg|opera|samsung/.test(ua)
    const isFirefox = /firefox/.test(ua)
    const isSamsungBrowser = /samsungbrowser/.test(ua)

    // In-app browser detection
    let isInAppBrowser = false
    let inAppBrowserName: DeviceInfo['inAppBrowserName'] = null

    if (/instagram/i.test(ua)) {
      isInAppBrowser = true
      inAppBrowserName = 'instagram'
    } else if (/fban|fbav|fb_iab/i.test(ua)) {
      isInAppBrowser = true
      inAppBrowserName = 'facebook'
    } else if (/tiktok|bytedancewebview|musical_ly/i.test(ua)) {
      isInAppBrowser = true
      inAppBrowserName = 'tiktok'
    } else if (/twitter/i.test(ua)) {
      isInAppBrowser = true
      inAppBrowserName = 'twitter'
    } else if (/linkedin/i.test(ua)) {
      isInAppBrowser = true
      inAppBrowserName = 'linkedin'
    } else if (/snapchat/i.test(ua)) {
      isInAppBrowser = true
      inAppBrowserName = 'snapchat'
    } else if (/telegram/i.test(ua)) {
      isInAppBrowser = true
      inAppBrowserName = 'telegram'
    } else if (/whatsapp/i.test(ua)) {
      isInAppBrowser = true
      inAppBrowserName = 'whatsapp'
    }

    // PWA status
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as { standalone?: boolean }).standalone === true

    // Capability detection
    const supportsPush = 'PushManager' in window && 'serviceWorker' in navigator
    const supportsGeolocation = 'geolocation' in navigator
    const supportsVibration = 'vibrate' in navigator
    const supportsShare = 'share' in navigator

    // Connection type
    let connectionType: DeviceInfo['connectionType'] = 'unknown'
    if ('connection' in navigator) {
      const connection = (navigator as { connection?: { effectiveType?: string } }).connection
      if (connection?.effectiveType) {
        const type = connection.effectiveType.toLowerCase()
        if (type.includes('wifi') || type === '4g') connectionType = type as 'wifi' | '4g'
        else if (type === '3g') connectionType = '3g'
        else if (type.includes('2g')) connectionType = '2g'
      }
    }

    // Screen size
    const width = window.innerWidth
    const screenSize: DeviceInfo['screenSize'] = width < 640 ? 'small' : width < 1024 ? 'medium' : 'large'

    // Check if service worker is ready
    let isPWAReady = false
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setDeviceInfo(prev => ({ ...prev, isPWAReady: true }))
      })
    }

    setDeviceInfo({
      isIOS,
      isAndroid,
      isDesktop,
      isMobile,
      isSafari,
      isChrome,
      isFirefox,
      isSamsungBrowser,
      isInAppBrowser,
      inAppBrowserName,
      isStandalone,
      canInstall: !isStandalone && !isInAppBrowser && (isChrome || isSamsungBrowser || (isAndroid && !isSafari)),
      isPWAReady,
      supportsPush,
      supportsGeolocation,
      supportsVibration,
      supportsShare,
      isOnline: navigator.onLine,
      connectionType,
      screenSize,
    })

    // Listen for online/offline changes
    const handleOnline = () => setDeviceInfo(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setDeviceInfo(prev => ({ ...prev, isOnline: false }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Listen for display mode changes (PWA installed)
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const handleDisplayChange = (e: MediaQueryListEvent) => {
      setDeviceInfo(prev => ({ ...prev, isStandalone: e.matches }))
    }
    mediaQuery.addEventListener('change', handleDisplayChange)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      mediaQuery.removeEventListener('change', handleDisplayChange)
    }
  }, [])

  return deviceInfo
}

/**
 * Get device-specific install instructions
 */
export function getInstallInstructions(deviceInfo: DeviceInfo): {
  title: string
  steps: string[]
  icon: 'share' | 'menu' | 'plus'
} {
  if (deviceInfo.isIOS && deviceInfo.isSafari) {
    return {
      title: 'Install on iPhone/iPad',
      steps: [
        'Tap the Share button at the bottom',
        'Scroll down and tap "Add to Home Screen"',
        'Tap "Add" to confirm'
      ],
      icon: 'share'
    }
  }

  if (deviceInfo.isAndroid && deviceInfo.isChrome) {
    return {
      title: 'Install on Android',
      steps: [
        'Tap the menu (three dots) at the top',
        'Tap "Add to Home screen"',
        'Tap "Add" to confirm'
      ],
      icon: 'menu'
    }
  }

  if (deviceInfo.isSamsungBrowser) {
    return {
      title: 'Install on Samsung',
      steps: [
        'Tap the menu icon',
        'Tap "Add page to"',
        'Select "Home screen"'
      ],
      icon: 'menu'
    }
  }

  // Desktop Chrome/Edge
  return {
    title: 'Install SafetyAlerts',
    steps: [
      'Click the install icon in the address bar',
      'Or click "Install" button when prompted'
    ],
    icon: 'plus'
  }
}
