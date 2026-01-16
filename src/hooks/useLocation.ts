'use client'

import { useState, useCallback } from 'react'
import { reverseGeocode } from '@/lib/reverse-geocode'
import type { LocationResult, Coordinates } from '@/types'

interface UseLocationReturn {
  loading: boolean
  error: string | null
  location: LocationResult | null
  getLocation: () => Promise<LocationResult>
  clearError: () => void
}

export function useLocation(): UseLocationReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [location, setLocation] = useState<LocationResult | null>(null)

  const getLocation = useCallback(async (): Promise<LocationResult> => {
    setLoading(true)
    setError(null)

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      const result: LocationResult = {
        success: false,
        error: 'Location is not supported on this device',
      }
      setError(result.error!)
      setLoading(false)
      setLocation(result)
      return result
    }

    try {
      // Get current position
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000,
          })
        }
      )

      const { latitude, longitude } = position.coords

      // Reverse geocode to get area
      const geocodeResult = await reverseGeocode(latitude, longitude)

      if (!geocodeResult.success || !geocodeResult.area) {
        const result: LocationResult = {
          success: false,
          coords: { lat: latitude, lng: longitude },
          error: geocodeResult.error || 'Could not determine your location',
        }
        setError(result.error!)
        setLocation(result)
        setLoading(false)
        return result
      }

      const result: LocationResult = {
        success: true,
        coords: { lat: latitude, lng: longitude },
        area: geocodeResult.area,
      }

      setLocation(result)
      setLoading(false)
      return result
    } catch (err: any) {
      let errorMessage = 'Could not get your location'

      if (err.code === 1) {
        errorMessage =
          'Location permission denied. Please enable location access.'
      } else if (err.code === 2) {
        errorMessage = 'Location unavailable. Please try again.'
      } else if (err.code === 3) {
        errorMessage = 'Location request timed out. Please try again.'
      }

      const result: LocationResult = {
        success: false,
        error: errorMessage,
      }

      setError(errorMessage)
      setLocation(result)
      setLoading(false)
      return result
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    loading,
    error,
    location,
    getLocation,
    clearError,
  }
}

/**
 * Watch user's location continuously
 */
export function useLocationWatch(
  onUpdate: (coords: Coordinates) => void,
  onError?: (error: string) => void
) {
  const [watchId, setWatchId] = useState<number | null>(null)

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      onError?.('Geolocation not supported')
      return
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        onUpdate({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
      },
      (err) => {
        let message = 'Location error'
        if (err.code === 1) message = 'Location permission denied'
        if (err.code === 2) message = 'Location unavailable'
        if (err.code === 3) message = 'Location timeout'
        onError?.(message)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    )

    setWatchId(id)
  }, [onUpdate, onError])

  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
    }
  }, [watchId])

  return { startWatching, stopWatching, isWatching: watchId !== null }
}
