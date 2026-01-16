/**
 * Browser Compatibility Utilities
 * Detects browser types and applies compatibility fixes
 */

export interface BrowserInfo {
  isUCBrowser: boolean
  isOperaMini: boolean
  isSafari: boolean
  isChrome: boolean
  isFirefox: boolean
  isIE: boolean
  isEdge: boolean
  isMobile: boolean
  isIOS: boolean
  isAndroid: boolean
  version: string | null
}

/**
 * Detect browser type and version
 */
export function detectBrowser(): BrowserInfo {
  if (typeof window === 'undefined') {
    // Server-side: return defaults
    return {
      isUCBrowser: false,
      isOperaMini: false,
      isSafari: false,
      isChrome: false,
      isFirefox: false,
      isIE: false,
      isEdge: false,
      isMobile: false,
      isIOS: false,
      isAndroid: false,
      version: null,
    }
  }

  const ua = navigator.userAgent.toLowerCase()
  const platform = navigator.platform.toLowerCase()

  // Detect mobile
  const isMobile = /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)
  const isIOS = /iphone|ipad|ipod/i.test(ua)
  const isAndroid = /android/i.test(ua)

  // Detect browsers
  const isUCBrowser = /ucbrowser|uc browser/i.test(ua)
  const isOperaMini = /opera mini/i.test(ua)
  const isSafari = /safari/i.test(ua) && !/chrome|crios|fxios/i.test(ua)
  const isChrome = /chrome|crios/i.test(ua) && !/edge|opr|ucbrowser/i.test(ua)
  const isFirefox = /firefox|fxios/i.test(ua)
  const isIE = /msie|trident/i.test(ua)
  const isEdge = /edge|edg/i.test(ua)

  // Extract version
  let version: string | null = null
  if (isChrome) {
    const match = ua.match(/chrome\/(\d+)/)
    version = match ? match[1] : null
  } else if (isSafari) {
    const match = ua.match(/version\/(\d+)/)
    version = match ? match[1] : null
  } else if (isFirefox) {
    const match = ua.match(/firefox\/(\d+)/)
    version = match ? match[1] : null
  } else if (isUCBrowser) {
    const match = ua.match(/ucbrowser\/(\d+)/)
    version = match ? match[1] : null
  }

  return {
    isUCBrowser,
    isOperaMini,
    isSafari,
    isChrome,
    isFirefox,
    isIE,
    isEdge,
    isMobile,
    isIOS,
    isAndroid,
    version,
  }
}

/**
 * Apply browser-specific CSS classes to document
 */
export function applyBrowserFixes(): void {
  if (typeof window === 'undefined') return

  const browser = detectBrowser()
  const html = document.documentElement

  // Remove existing browser classes
  html.classList.remove(
    'uc-browser',
    'opera-mini',
    'safari',
    'chrome',
    'firefox',
    'ie',
    'edge',
    'mobile',
    'ios',
    'android'
  )

  // Add browser-specific classes
  if (browser.isUCBrowser) {
    html.classList.add('uc-browser')
  }
  if (browser.isOperaMini) {
    html.classList.add('opera-mini')
  }
  if (browser.isSafari) {
    html.classList.add('safari')
  }
  if (browser.isChrome) {
    html.classList.add('chrome')
  }
  if (browser.isFirefox) {
    html.classList.add('firefox')
  }
  if (browser.isIE) {
    html.classList.add('ie')
  }
  if (browser.isEdge) {
    html.classList.add('edge')
  }
  if (browser.isMobile) {
    html.classList.add('mobile')
  }
  if (browser.isIOS) {
    html.classList.add('ios')
  }
  if (browser.isAndroid) {
    html.classList.add('android')
  }
}

/**
 * Check if browser supports a specific feature
 */
export function supportsFeature(feature: string): boolean {
  if (typeof window === 'undefined') return false

  switch (feature) {
    case 'safe-area-insets':
      return CSS.supports('padding', 'max(0px)')
    case 'css-grid':
      return CSS.supports('display', 'grid')
    case 'flexbox':
      return CSS.supports('display', 'flex')
    case 'backdrop-filter':
      return CSS.supports('backdrop-filter', 'blur(10px)')
    case 'touch-action':
      return CSS.supports('touch-action', 'manipulation')
    default:
      return false
  }
}

/**
 * Initialize browser compatibility on client side
 */
export function initBrowserCompat(): void {
  if (typeof window === 'undefined') return

  // Apply browser fixes immediately
  applyBrowserFixes()

  // Re-apply on orientation change (mobile)
  window.addEventListener('orientationchange', () => {
    setTimeout(applyBrowserFixes, 100)
  })

  // Re-apply on resize (handles browser zoom)
  let resizeTimer: NodeJS.Timeout
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(applyBrowserFixes, 250)
  })
}

