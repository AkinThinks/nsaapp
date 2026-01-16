/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export function getDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`
  }
  if (km < 10) {
    return `${km.toFixed(1)}km`
  }
  return `${Math.round(km)}km`
}

/**
 * Check if user is within range to confirm/deny a report
 */
export function canInteractWithReport(
  userLat: number,
  userLng: number,
  reportLat: number,
  reportLng: number,
  maxDistanceKm: number = 3
): { canInteract: boolean; distance: number } {
  const distance = getDistanceKm(userLat, userLng, reportLat, reportLng)
  return {
    canInteract: distance <= maxDistanceKm,
    distance: Math.round(distance * 10) / 10,
  }
}

/**
 * Get human-readable distance description
 */
export function getDistanceDescription(km: number): string {
  if (km < 0.5) return 'Very close'
  if (km < 1) return 'Nearby'
  if (km < 3) return 'In your area'
  if (km < 5) return 'Close by'
  if (km < 10) return 'In your vicinity'
  return 'In your region'
}
