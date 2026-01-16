'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import { getDistanceKm } from '@/lib/distance'
import { useAppStore } from '@/lib/store'
import type { Report, Alert, RiskLevel, Coordinates } from '@/types'

// Check if Supabase is configured
function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

interface UseAlertsOptions {
  radiusKm?: number
  limit?: number
}

interface UseAlertsReturn {
  alerts: Alert[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  hasActiveAlerts: boolean
  nearbyCount: number
  lastUpdated: Date | null
}

export function useAlerts(options: UseAlertsOptions = {}): UseAlertsReturn {
  const { radiusKm = 50, limit = 50 } = options
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const savedLocations = useAppStore((state) => state.savedLocations)
  const currentLocation = useAppStore((state) => state.currentLocation)

  const fetchReports = useCallback(async () => {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      setAlerts([])
      setLoading(false)
      setError('Database not configured. Running in demo mode.')
      return
    }

    if (savedLocations.length === 0 && !currentLocation) {
      setAlerts([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = getSupabase()

      // Get area slugs from saved locations
      const areaSlugs = savedLocations.map((loc) => loc.area_slug)

      // Build query
      let query = supabase
        .from('reports')
        .select('*')
        .in('status', ['active', 'ended'])
        .gte(
          'created_at',
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        ) // Last 24 hours
        .order('created_at', { ascending: false })
        .limit(limit)

      // Filter by areas if user has saved locations
      if (areaSlugs.length > 0) {
        query = query.in('area_slug', areaSlugs)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      // Process reports into alerts with distance and risk
      const processedAlerts = processReports(
        data || [],
        currentLocation,
        radiusKm
      )

      setAlerts(processedAlerts)
      setLastUpdated(new Date())
    } catch (err: any) {
      console.error('Error fetching reports:', err)
      setError('Could not load alerts')
    } finally {
      setLoading(false)
    }
  }, [savedLocations, currentLocation, radiusKm, limit])

  // Initial fetch
  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  // Subscribe to realtime updates
  useEffect(() => {
    if (savedLocations.length === 0 || !isSupabaseConfigured()) return

    const supabase = getSupabase()
    const areaSlugs = savedLocations.map((loc) => loc.area_slug)

    const channel = supabase
      .channel('reports-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reports',
        },
        (payload) => {
          const report = payload.new as Report

          // Check if report is in user's areas
          if (areaSlugs.includes(report.area_slug)) {
            // Refresh on any change
            fetchReports()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [savedLocations, fetchReports])

  const hasActiveAlerts = alerts.some((a) => a.status === 'active')
  const nearbyCount = alerts.filter(
    (a) => a.distance_km && a.distance_km < 5
  ).length

  return {
    alerts,
    loading,
    error,
    refresh: fetchReports,
    hasActiveAlerts,
    nearbyCount,
    lastUpdated,
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function processReports(
  reports: Report[],
  userLocation: Coordinates | null,
  maxRadiusKm: number
): Alert[] {
  return reports
    .map((report) => processReport(report, userLocation))
    .filter((alert) => !alert.distance_km || alert.distance_km <= maxRadiusKm)
    .sort((a, b) => {
      // Sort by distance first, then by time
      if (a.distance_km && b.distance_km) {
        return a.distance_km - b.distance_km
      }
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    })
}

function processReport(report: Report, userLocation: Coordinates | null): Alert {
  let distance: number | undefined

  if (userLocation) {
    distance = getDistanceKm(
      userLocation.lat,
      userLocation.lng,
      report.latitude,
      report.longitude
    )
  }

  return {
    ...report,
    distance_km: distance,
    time_ago: formatTimeAgo(new Date(report.created_at)),
    risk_level: calculateRiskLevel(report, distance),
  }
}

function calculateRiskLevel(
  report: Report,
  distanceKm: number | undefined
): RiskLevel {
  const severeTypes = ['kidnapping', 'robbery', 'attack', 'gunshots']
  const isSevere = severeTypes.includes(report.incident_type)

  // If we don't have distance, base on incident type alone
  if (distanceKm === undefined) {
    return isSevere ? 'HIGH' : 'MODERATE'
  }

  if (distanceKm < 1 && isSevere) return 'EXTREME'
  if (distanceKm < 2 && isSevere) return 'VERY HIGH'
  if (distanceKm < 5 || isSevere) return 'HIGH'
  if (distanceKm < 10) return 'MODERATE'
  return 'LOW'
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

/**
 * Get alerts for a specific area
 */
export function useAreaAlerts(areaSlug: string) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      if (!isSupabaseConfigured()) {
        setLoading(false)
        return
      }

      try {
        const supabase = getSupabase()
        const { data } = await supabase
          .from('reports')
          .select('*')
          .eq('area_slug', areaSlug)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(20)

        if (data) {
          setAlerts(
            data.map((r) => ({
              ...r,
              time_ago: formatTimeAgo(new Date(r.created_at)),
              risk_level: calculateRiskLevel(r, undefined),
            }))
          )
        }
      } catch (err) {
        console.error('Error fetching area alerts:', err)
      }
      setLoading(false)
    }

    fetch()
  }, [areaSlug])

  return { alerts, loading }
}
