/**
 * Location Utilities for Nigeria Security Alert
 *
 * Handles:
 * - Distance calculations (Haversine formula)
 * - Permission detection and management
 * - Location verification for reports
 * - Geocoding helpers
 */

// ============================================
// TYPES
// ============================================

export interface Coordinates {
  lat: number
  lng: number
}

export interface LocationResult {
  success: boolean
  coords?: Coordinates
  accuracy?: number
  error?: string
  source: 'gps' | 'network' | 'manual' | 'unknown'
}

export interface PermissionState {
  state: 'granted' | 'denied' | 'prompt' | 'unknown'
  canRequest: boolean
}

export type VerificationStatus =
  | 'verified_onsite'      // < 500m from incident
  | 'verified_nearby'      // 500m - 2km from incident
  | 'unverified_distant'   // > 2km from incident
  | 'unverified_manual'    // User entered location manually
  | 'unverified_permission_denied'
  | 'unverified_gps_failed'
  | 'pending'

export interface VerificationResult {
  status: VerificationStatus
  distanceMeters: number | null
  trustBonus: number
  message: string
}

// ============================================
// CONSTANTS
// ============================================

// Earth's radius in kilometers
const EARTH_RADIUS_KM = 6371

// Verification distance thresholds (in meters)
export const VERIFICATION_THRESHOLDS = {
  ONSITE: 500,      // < 500m = verified onsite
  NEARBY: 2000,     // 500m - 2km = verified nearby
  DISTANT: 2000,    // > 2km = unverified distant
}

// Trust score bonuses for verification
export const VERIFICATION_TRUST_BONUS = {
  verified_onsite: 3,
  verified_nearby: 1,
  unverified_distant: 0,
  unverified_manual: 0,
  unverified_permission_denied: 0,
  unverified_gps_failed: 0,
  pending: 0,
}

// Default alert radius for new saved locations (km)
export const DEFAULT_ALERT_RADIUS_KM = 3

// ============================================
// DISTANCE CALCULATION
// ============================================

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in kilometers
 */
export function calculateDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return EARTH_RADIUS_KM * c
}

/**
 * Calculate distance in meters
 */
export function calculateDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  return calculateDistanceKm(lat1, lng1, lat2, lng2) * 1000
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  const km = meters / 1000
  if (km < 10) {
    return `${km.toFixed(1)}km`
  }
  return `${Math.round(km)}km`
}

// ============================================
// PERMISSION DETECTION
// ============================================

/**
 * Check the current geolocation permission state
 * Works across different browsers and PWA contexts
 */
export async function checkLocationPermission(): Promise<PermissionState> {
  // Check if geolocation is supported
  if (!navigator.geolocation) {
    return { state: 'denied', canRequest: false }
  }

  // Try using the Permissions API (modern browsers)
  if (navigator.permissions && navigator.permissions.query) {
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' })
      return {
        state: result.state as 'granted' | 'denied' | 'prompt',
        canRequest: result.state !== 'denied',
      }
    } catch {
      // Permissions API not supported for geolocation in this browser
    }
  }

  // Fallback: We don't know the state, but can try requesting
  return { state: 'unknown', canRequest: true }
}

/**
 * Check if we should show permission explanation
 * (when permission is 'prompt' or 'unknown')
 */
export async function shouldShowPermissionExplanation(): Promise<boolean> {
  const permission = await checkLocationPermission()
  return permission.state === 'prompt' || permission.state === 'unknown'
}

/**
 * Check if permission was previously denied
 */
export async function wasPermissionDenied(): Promise<boolean> {
  const permission = await checkLocationPermission()
  return permission.state === 'denied'
}

// ============================================
// LOCATION FETCHING
// ============================================

/**
 * Get current location with timeout and error handling
 * Optimized for Nigerian network conditions
 */
export function getCurrentLocation(
  options: {
    timeout?: number
    enableHighAccuracy?: boolean
    maximumAge?: number
  } = {}
): Promise<LocationResult> {
  const {
    timeout = 10000,       // 10 seconds (reasonable for Nigerian networks)
    enableHighAccuracy = true,
    maximumAge = 60000,    // Accept cached location up to 1 minute old
  } = options

  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        success: false,
        error: 'Geolocation not supported',
        source: 'unknown',
      })
      return
    }

    // Set a manual timeout in case browser doesn't respect the option
    const timeoutId = setTimeout(() => {
      resolve({
        success: false,
        error: 'Location request timed out',
        source: 'unknown',
      })
    }, timeout + 2000)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId)
        resolve({
          success: true,
          coords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          accuracy: position.coords.accuracy,
          source: position.coords.accuracy < 100 ? 'gps' : 'network',
        })
      },
      (error) => {
        clearTimeout(timeoutId)
        let errorMessage: string
        let source: LocationResult['source'] = 'unknown'

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable'
            source = 'network'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
          default:
            errorMessage = 'Unknown location error'
        }

        resolve({
          success: false,
          error: errorMessage,
          source,
        })
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    )
  })
}

/**
 * Get location with automatic retry on failure
 * First tries high accuracy, then falls back to low accuracy
 */
export async function getLocationWithFallback(): Promise<LocationResult> {
  // Try high accuracy first (GPS)
  const highAccuracyResult = await getCurrentLocation({
    enableHighAccuracy: true,
    timeout: 8000,
  })

  if (highAccuracyResult.success) {
    return highAccuracyResult
  }

  // Fall back to low accuracy (network-based)
  const lowAccuracyResult = await getCurrentLocation({
    enableHighAccuracy: false,
    timeout: 5000,
    maximumAge: 300000, // Accept cached location up to 5 minutes old
  })

  return lowAccuracyResult
}

// ============================================
// VERIFICATION LOGIC
// ============================================

/**
 * Verify a report's location by comparing device location to incident location
 */
export function verifyReportLocation(
  deviceLocation: Coordinates | null,
  incidentLocation: Coordinates,
  isSafeDistanceReport: boolean = false
): VerificationResult {
  // No device location = can't verify
  if (!deviceLocation) {
    return {
      status: 'unverified_gps_failed',
      distanceMeters: null,
      trustBonus: 0,
      message: 'Location could not be verified',
    }
  }

  // Calculate distance
  const distanceMeters = calculateDistanceMeters(
    deviceLocation.lat,
    deviceLocation.lng,
    incidentLocation.lat,
    incidentLocation.lng
  )

  // If user marked "safe distance", don't penalize for being far
  if (isSafeDistanceReport && distanceMeters > VERIFICATION_THRESHOLDS.NEARBY) {
    return {
      status: 'verified_nearby',
      distanceMeters,
      trustBonus: 1,
      message: `Reporting from ${formatDistance(distanceMeters)} away (safe distance)`,
    }
  }

  // Determine verification status based on distance
  if (distanceMeters <= VERIFICATION_THRESHOLDS.ONSITE) {
    return {
      status: 'verified_onsite',
      distanceMeters,
      trustBonus: VERIFICATION_TRUST_BONUS.verified_onsite,
      message: `Verified at scene (${formatDistance(distanceMeters)} away)`,
    }
  }

  if (distanceMeters <= VERIFICATION_THRESHOLDS.NEARBY) {
    return {
      status: 'verified_nearby',
      distanceMeters,
      trustBonus: VERIFICATION_TRUST_BONUS.verified_nearby,
      message: `Verified nearby (${formatDistance(distanceMeters)} away)`,
    }
  }

  // Far from incident without safe distance flag
  return {
    status: 'unverified_distant',
    distanceMeters,
    trustBonus: VERIFICATION_TRUST_BONUS.unverified_distant,
    message: `${formatDistance(distanceMeters)} from reported location`,
  }
}

/**
 * Get user-friendly message for verification status
 */
export function getVerificationMessage(status: VerificationStatus): string {
  switch (status) {
    case 'verified_onsite':
      return 'Verified at scene'
    case 'verified_nearby':
      return 'Verified nearby'
    case 'unverified_distant':
      return 'Reporting from a distance'
    case 'unverified_manual':
      return 'Location entered manually'
    case 'unverified_permission_denied':
      return 'Location permission denied'
    case 'unverified_gps_failed':
      return 'Could not get location'
    case 'pending':
      return 'Verification pending'
    default:
      return 'Unknown'
  }
}

/**
 * Check if a verification status is considered "verified"
 */
export function isVerified(status: VerificationStatus): boolean {
  return status === 'verified_onsite' || status === 'verified_nearby'
}

// ============================================
// ALERT MATCHING (Client-side preview)
// ============================================

/**
 * Check if a user's saved location should receive an alert for an incident
 * This is a client-side preview - actual matching is done server-side
 */
export function shouldReceiveAlert(
  savedLocation: {
    lat: number
    lng: number
    alertRadiusKm: number
    lga?: string
  },
  incident: {
    lat: number
    lng: number
    lga?: string
  }
): boolean {
  // Distance-based match
  const distance = calculateDistanceKm(
    savedLocation.lat,
    savedLocation.lng,
    incident.lat,
    incident.lng
  )

  if (distance <= savedLocation.alertRadiusKm) {
    return true
  }

  // LGA-based match (fallback)
  if (savedLocation.lga && incident.lga && savedLocation.lga === incident.lga) {
    return true
  }

  return false
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get browser/device specific instructions for enabling location
 */
export function getLocationEnableInstructions(): {
  platform: 'ios' | 'android' | 'desktop' | 'unknown'
  browser: string
  instructions: string[]
} {
  const ua = navigator.userAgent.toLowerCase()

  // Detect platform
  let platform: 'ios' | 'android' | 'desktop' | 'unknown' = 'unknown'
  if (/iphone|ipad|ipod/.test(ua)) {
    platform = 'ios'
  } else if (/android/.test(ua)) {
    platform = 'android'
  } else if (/windows|macintosh|linux/.test(ua)) {
    platform = 'desktop'
  }

  // Detect browser
  let browser = 'your browser'
  if (/chrome/.test(ua) && !/edg/.test(ua)) {
    browser = 'Chrome'
  } else if (/safari/.test(ua) && !/chrome/.test(ua)) {
    browser = 'Safari'
  } else if (/firefox/.test(ua)) {
    browser = 'Firefox'
  } else if (/edg/.test(ua)) {
    browser = 'Edge'
  } else if (/samsung/.test(ua)) {
    browser = 'Samsung Internet'
  }

  // Generate instructions
  let instructions: string[]

  if (platform === 'ios') {
    if (browser === 'Safari') {
      instructions = [
        'Open Settings on your iPhone',
        'Scroll down and tap Safari',
        'Tap Location',
        'Select "Allow" or "Ask"',
        'Return to this app and try again',
      ]
    } else {
      instructions = [
        `Open Settings on your iPhone`,
        `Find ${browser} in the app list`,
        'Tap Location',
        'Select "While Using the App"',
        'Return to this app and try again',
      ]
    }
  } else if (platform === 'android') {
    instructions = [
      `In ${browser}, tap the menu (⋮)`,
      'Tap Settings',
      'Tap Site Settings',
      'Tap Location',
      'Find this site and tap Allow',
    ]
  } else {
    instructions = [
      'Click the lock/info icon in the address bar',
      'Find Location in the permissions list',
      'Change it to Allow',
      'Refresh the page',
    ]
  }

  return { platform, browser, instructions }
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S'
  const lngDir = lng >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`
}

/**
 * Check if coordinates are within Nigeria (roughly)
 */
export function isWithinNigeria(lat: number, lng: number): boolean {
  // Nigeria's approximate bounding box
  const NIGERIA_BOUNDS = {
    minLat: 4.0,
    maxLat: 14.0,
    minLng: 2.5,
    maxLng: 15.0,
  }

  return (
    lat >= NIGERIA_BOUNDS.minLat &&
    lat <= NIGERIA_BOUNDS.maxLat &&
    lng >= NIGERIA_BOUNDS.minLng &&
    lng <= NIGERIA_BOUNDS.maxLng
  )
}
