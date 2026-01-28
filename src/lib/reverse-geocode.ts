import { NIGERIAN_LOCATIONS } from './locations'
import type { NigerianLocation, ReverseGeocodeResponse } from '@/types'

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse'

/**
 * Convert coordinates to area name using Nominatim (OpenStreetMap)
 * Free, no API key required
 *
 * VERCEL FREE TIER: 3 second timeout to prevent function timeout
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ReverseGeocodeResponse> {
  // Create abort controller for timeout (Vercel free tier = 10s max)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second max

  try {
    const response = await fetch(
      `${NOMINATIM_URL}?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'SafetyAlertsNG/1.0 (contact@safetyalertsng.com)',
        },
        signal: controller.signal,
      }
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      return { success: false, error: 'Geocoding service unavailable' }
    }

    const data = await response.json()

    if (data.error) {
      return { success: false, error: data.error }
    }

    const address = data.address || {}

    // Extract area name from response (try multiple fields)
    const rawAreaName =
      address.suburb ||
      address.neighbourhood ||
      address.city_district ||
      address.town ||
      address.city ||
      address.county

    const rawState = address.state

    if (!rawAreaName) {
      return {
        success: false,
        error: 'Could not determine location',
        raw: address,
      }
    }

    // Try to match to our known locations
    const matchedArea = findBestMatch(rawAreaName, rawState)

    return {
      success: true,
      area: matchedArea,
      raw: address,
    }
  } catch (error) {
    clearTimeout(timeoutId)

    // Handle timeout - use fallback to static location matching
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Nominatim timeout - using fallback location')
      return fallbackLocationLookup(lat, lng)
    }

    console.error('Reverse geocode error:', error)
    return { success: false, error: 'Location lookup failed' }
  }
}

/**
 * Fallback location lookup using static Nigerian locations data
 * Used when Nominatim times out (Vercel free tier optimization)
 */
function fallbackLocationLookup(lat: number, lng: number): ReverseGeocodeResponse {
  // Find nearest known location based on coordinates
  // This is a simple approximation - good enough for Nigerian cities

  // Major Nigerian cities with approximate coordinates
  const majorLocations = [
    { name: 'Lagos Island', slug: 'lagos-island', state: 'Lagos', lat: 6.4541, lng: 3.3947 },
    { name: 'Victoria Island', slug: 'victoria-island', state: 'Lagos', lat: 6.4281, lng: 3.4219 },
    { name: 'Lekki', slug: 'lekki', state: 'Lagos', lat: 6.4698, lng: 3.5852 },
    { name: 'Ikeja', slug: 'ikeja', state: 'Lagos', lat: 6.5954, lng: 3.3464 },
    { name: 'Abuja Central', slug: 'abuja-central', state: 'FCT', lat: 9.0579, lng: 7.4951 },
    { name: 'Wuse', slug: 'wuse', state: 'FCT', lat: 9.0765, lng: 7.4897 },
    { name: 'Port Harcourt', slug: 'port-harcourt', state: 'Rivers', lat: 4.8156, lng: 7.0498 },
    { name: 'Ibadan', slug: 'ibadan', state: 'Oyo', lat: 7.3775, lng: 3.9470 },
    { name: 'Kano', slug: 'kano', state: 'Kano', lat: 12.0022, lng: 8.5920 },
    { name: 'Kaduna', slug: 'kaduna', state: 'Kaduna', lat: 10.5105, lng: 7.4165 },
    { name: 'Enugu', slug: 'enugu', state: 'Enugu', lat: 6.4584, lng: 7.5464 },
    { name: 'Benin City', slug: 'benin-city', state: 'Edo', lat: 6.3350, lng: 5.6037 },
  ]

  // Find nearest location (simple Euclidean distance)
  let nearest = majorLocations[0]
  let minDist = Number.MAX_VALUE

  for (const loc of majorLocations) {
    const dist = Math.sqrt(Math.pow(lat - loc.lat, 2) + Math.pow(lng - loc.lng, 2))
    if (dist < minDist) {
      minDist = dist
      nearest = loc
    }
  }

  // If too far from any known location (> ~50km), return generic
  if (minDist > 0.5) {
    return {
      success: true,
      area: {
        name: 'Unknown Area',
        slug: 'unknown-area',
        state: 'Nigeria',
      },
    }
  }

  return {
    success: true,
    area: {
      name: nearest.name,
      slug: nearest.slug,
      state: nearest.state,
    },
  }
}

/**
 * Find best matching location from our database
 */
function findBestMatch(
  rawAreaName: string,
  rawState: string | undefined
): { name: string; slug: string; state: string } {
  const normalizedArea = rawAreaName.toLowerCase().trim()
  const normalizedState = rawState?.toLowerCase().trim()

  // Try exact name match
  let match = NIGERIAN_LOCATIONS.find(
    (loc) =>
      loc.name.toLowerCase() === normalizedArea ||
      loc.slug === normalizedArea.replace(/\s+/g, '-')
  )

  // Try alias match
  if (!match) {
    match = NIGERIAN_LOCATIONS.find((loc) =>
      loc.aliases.some((alias) => alias.toLowerCase() === normalizedArea)
    )
  }

  // Try partial match
  if (!match) {
    match = NIGERIAN_LOCATIONS.find(
      (loc) =>
        loc.name.toLowerCase().includes(normalizedArea) ||
        normalizedArea.includes(loc.name.toLowerCase())
    )
  }

  // Try state-filtered partial match
  if (!match && normalizedState) {
    match = NIGERIAN_LOCATIONS.find(
      (loc) =>
        loc.state.toLowerCase() === normalizedState &&
        (loc.name.toLowerCase().includes(normalizedArea) ||
          normalizedArea.includes(loc.name.toLowerCase()))
    )
  }

  if (match) {
    return {
      name: match.name,
      slug: match.slug,
      state: match.state,
    }
  }

  // No match - create new entry from raw data
  return {
    name: rawAreaName,
    slug: rawAreaName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, ''),
    state: rawState || 'Unknown',
  }
}

/**
 * Get address string from coordinates (simplified version)
 */
export async function getAddressFromCoords(
  lat: number,
  lng: number
): Promise<string | null> {
  const result = await reverseGeocode(lat, lng)
  if (result.success && result.area) {
    return `${result.area.name}, ${result.area.state}`
  }
  return null
}
