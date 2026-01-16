import { NIGERIAN_LOCATIONS } from './locations'
import type { NigerianLocation, ReverseGeocodeResponse } from '@/types'

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse'

/**
 * Convert coordinates to area name using Nominatim (OpenStreetMap)
 * Free, no API key required
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ReverseGeocodeResponse> {
  try {
    const response = await fetch(
      `${NOMINATIM_URL}?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'SafetyAlertsNG/1.0 (contact@safetyalertsng.com)',
        },
      }
    )

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
    console.error('Reverse geocode error:', error)
    return { success: false, error: 'Location lookup failed' }
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
