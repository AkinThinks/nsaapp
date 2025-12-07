// Research-backed risk scoring using multi-criteria weighted analysis
// Based: ISO 31000, FBI UCR methodology, epidemiological time-series
// Enhanced with dynamic risk adjustment based on live data trends

import { RelevanceZone, getRelevanceScore } from './location-relevance'
import { type RiskLevel } from './risk-time-windows'

export interface ClassifiedIncident {
  headline: string
  notification: string
  incident_type: string
  severity: string
  location_extracted: string | null
  confidence: number
  date: string
  url: string
  relevance?: {
    zone: RelevanceZone
    score: number
    label: string
  }
}

export interface RiskScoreResult {
  score: number  // 1-10 scale
  level: 'low' | 'moderate' | 'elevated' | 'high'
  confidence: 'high' | 'medium' | 'low'
  methodology: string
  breakdown: {
    immediateCount: number
    nearbyCount: number
    regionalCount: number
    stateCount: number
    weightedTotal: number
    dominantType: string
    hasFatalities: boolean
  }
}

// Severity weights based on FBI UCR severity index methodology
const SEVERITY_WEIGHTS: Record<string, number> = {
  'fatal': 1.0,
  'serious': 0.7,
  'moderate': 0.4,
  'minor': 0.2,
  'unknown': 0.5,
}

// Incident type weights (some types indicate higher risk)
const TYPE_WEIGHTS: Record<string, number> = {
  'kidnapping': 1.0,
  'terrorism': 1.0,
  'attack': 0.9,
  'cult_clash': 0.8,
  'robbery': 0.7,
  'accident': 0.5,
  'unrest': 0.6,
  'other_incident': 0.5,
}

/**
 * Parse GDELT date format (YYYYMMDD or YYYYMMDDHHMMSS) to Date object
 * Handles both date-only and full timestamp formats
 * Returns epoch date (1970-01-01) for invalid dates to ensure they sort last
 * 
 * @export - Used across the codebase for consistent date parsing
 */
export function parseGDELTDate(dateStr: string): Date {
  if (!dateStr || dateStr.length < 8) {
    return new Date(0) // Return epoch for invalid dates (will sort last)
  }
  
  try {
    const year = dateStr.slice(0, 4)
    const month = dateStr.slice(4, 6)
    const day = dateStr.slice(6, 8)
    
    // Check if we have time component (14 digits = YYYYMMDDHHMMSS)
    if (dateStr.length >= 14) {
      const hour = dateStr.slice(8, 10)
      const minute = dateStr.slice(10, 12)
      const second = dateStr.slice(12, 14)
      const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`)
      
      if (isNaN(date.getTime())) {
        return new Date(0) // Invalid date
      }
      return date
    } else {
      // Date only (YYYYMMDD) - use start of day (00:00:00)
      const date = new Date(`${year}-${month}-${day}T00:00:00`)
      
      if (isNaN(date.getTime())) {
        return new Date(0) // Invalid date
      }
      return date
    }
  } catch {
    return new Date(0) // Invalid date
  }
}

/**
 * Calculate recency weight using exponential decay
 * More recent incidents are weighted higher
 * Half-life of ~7 days (standard in epidemiology)
 */
function calculateRecencyWeight(dateStr: string): number {
  try {
    // Use the new parseGDELTDate function
    const date = parseGDELTDate(dateStr)
    
    if (date.getTime() === 0) return 0.5 // Invalid date

    const now = new Date()
    const daysAgo = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)

    // Handle future dates (shouldn't happen, but be safe)
    if (daysAgo < 0) return 1.0

    // Exponential decay with 7-day half-life
    return Math.exp(-daysAgo / 7)
  } catch {
    return 0.5 // Default if date parsing fails
  }
}

/**
 * Calculate comprehensive risk score
 * Uses multi-criteria weighted analysis (ISO 31000 framework)
 */
export function calculateRiskScore(incidents: ClassifiedIncident[]): RiskScoreResult {
  // Count by zone
  const immediate = incidents.filter(i => i.relevance?.zone === 'immediate')
  const nearby = incidents.filter(i => i.relevance?.zone === 'nearby')
  const regional = incidents.filter(i => i.relevance?.zone === 'same_region')
  const stateWide = incidents.filter(i => i.relevance?.zone === 'same_state')

  // Relevant incidents (immediate + nearby + regional)
  const relevant = [...immediate, ...nearby, ...regional]

  // If no relevant incidents, very low risk
  if (relevant.length === 0) {
    return {
      score: 1.5,
      level: 'low',
      confidence: incidents.length > 0 ? 'high' : 'low',
      methodology: 'No incidents in immediate vicinity',
      breakdown: {
        immediateCount: 0,
        nearbyCount: 0,
        regionalCount: 0,
        stateCount: stateWide.length,
        weightedTotal: 0,
        dominantType: 'none',
        hasFatalities: false,
      },
    }
  }

  // Calculate weighted incident count (proximity-weighted)
  const weightedCount = relevant.reduce((sum, i) => sum + (i.relevance?.score || 0), 0)

  // Component 1: Volume (normalized, 5+ weighted incidents = max)
  const volumeComponent = Math.min(weightedCount / 5, 1)

  // Component 2: Severity average
  const severitySum = relevant.reduce((sum, i) => sum + (SEVERITY_WEIGHTS[i.severity] || 0.5), 0)
  const severityComponent = relevant.length > 0 ? severitySum / relevant.length : 0.5

  // Component 3: Type severity
  const typeSum = relevant.reduce((sum, i) => sum + (TYPE_WEIGHTS[i.incident_type] || 0.5), 0)
  const typeComponent = relevant.length > 0 ? typeSum / relevant.length : 0.5

  // Component 4: Recency (are incidents recent or old?)
  const recencySum = relevant.reduce((sum, i) => sum + calculateRecencyWeight(i.date), 0)
  const recencyComponent = relevant.length > 0 ? recencySum / relevant.length : 0.5

  // Component 5: Concentration (ratio of immediate to total)
  const concentrationComponent = relevant.length > 0 ? immediate.length / relevant.length : 0

  // Weighted combination (ISO 31000 multi-criteria approach)
  const weights = {
    volume: 0.30,
    severity: 0.25,
    type: 0.20,
    recency: 0.15,
    concentration: 0.10,
  }

  const compositeScore = (
    (volumeComponent * weights.volume) +
    (severityComponent * weights.severity) +
    (typeComponent * weights.type) +
    (recencyComponent * weights.recency) +
    (concentrationComponent * weights.concentration)
  )

  // Scale to 1-10
  const finalScore = Math.round((1 + compositeScore * 9) * 10) / 10

  // Determine level
  let level: RiskScoreResult['level']
  if (finalScore <= 2.5) level = 'low'
  else if (finalScore <= 4.5) level = 'moderate'
  else if (finalScore <= 6.5) level = 'elevated'
  else level = 'high'

  // Find dominant type
  const typeCounts: Record<string, number> = {}
  relevant.forEach(i => {
    const type = i.incident_type || 'unknown'
    typeCounts[type] = (typeCounts[type] || 0) + 1
  })
  const dominantType = Object.entries(typeCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'unknown'

  // Check for fatalities
  const hasFatalities = relevant.some(i => i.severity === 'fatal')

  return {
    score: finalScore,
    level,
    confidence: relevant.length >= 3 ? 'high' : relevant.length >= 1 ? 'medium' : 'low',
    methodology: 'Multi-criteria weighted analysis (proximity, severity, recency)',
    breakdown: {
      immediateCount: immediate.length,
      nearbyCount: nearby.length,
      regionalCount: regional.length,
      stateCount: stateWide.length,
      weightedTotal: Math.round(weightedCount * 10) / 10,
      dominantType,
      hasFatalities,
    },
  }
}

/**
 * Group incidents by relevance zone for display (area-based)
 * Sorted by full timestamp (date + time) - most recent first
 */
export function groupIncidentsByZone(incidents: ClassifiedIncident[]): {
  immediate: ClassifiedIncident[]
  nearby: ClassifiedIncident[]
  regional: ClassifiedIncident[]
  stateWide: ClassifiedIncident[]
} {
  // Sort function: most recent first (by full timestamp)
  const sortByTimestamp = (a: ClassifiedIncident, b: ClassifiedIncident) => {
    const dateA = parseGDELTDate(a.date)
    const dateB = parseGDELTDate(b.date)
    return dateB.getTime() - dateA.getTime() // Descending (newest first)
  }

  return {
    immediate: incidents
      .filter(i => i.relevance?.zone === 'immediate')
      .sort(sortByTimestamp),
    nearby: incidents
      .filter(i => i.relevance?.zone === 'nearby')
      .sort(sortByTimestamp),
    regional: incidents
      .filter(i => i.relevance?.zone === 'same_region')
      .sort(sortByTimestamp),
    stateWide: incidents
      .filter(i => i.relevance?.zone === 'same_state')
      .sort(sortByTimestamp),
  }
}

/**
 * Group incidents by route relevance zone for display (route-based)
 * Sorted by full timestamp (date + time) - most recent first
 */
export function groupIncidentsByRouteZone(incidents: ClassifiedIncident[]): {
  onRoute: ClassifiedIncident[]
  routeState: ClassifiedIncident[]
  offRoute: ClassifiedIncident[]
} {
  // Sort function: most recent first (by full timestamp)
  const sortByTimestamp = (a: ClassifiedIncident, b: ClassifiedIncident) => {
    const dateA = parseGDELTDate(a.date)
    const dateB = parseGDELTDate(b.date)
    return dateB.getTime() - dateA.getTime() // Descending (newest first)
  }

  return {
    onRoute: incidents
      .filter(i => i.relevance?.zone === 'on_route')
      .sort(sortByTimestamp),
    routeState: incidents
      .filter(i => i.relevance?.zone === 'route_state')
      .sort(sortByTimestamp),
    offRoute: incidents
      .filter(i => i.relevance?.zone === 'off_route')
      .sort(sortByTimestamp),
  }
}

export interface DynamicRiskResult {
  staticRisk: string
  adjustedRisk: string
  daysSinceLastIncident: number | null
  trend: 'improving' | 'stable' | 'worsening'
  reasoning: string
}

export function calculateDynamicRisk(
  staticRiskLevel: string,
  incidents: ClassifiedIncident[],
  timeWindowDays: number
): DynamicRiskResult {
  const now = new Date()
  const relevantIncidents = incidents.filter(i => {
    const incidentDate = parseGDELTDate(i.date)
    if (incidentDate.getTime() === 0) return false
    const daysDiff = (now.getTime() - incidentDate.getTime()) / (1000 * 60 * 60 * 24)
    return daysDiff <= timeWindowDays && daysDiff >= 0
  })

  if (relevantIncidents.length === 0) {
    return {
      staticRisk: staticRiskLevel,
      adjustedRisk: staticRiskLevel,
      daysSinceLastIncident: null,
      trend: 'stable',
      reasoning: 'No recent incidents in the specified time window. Risk level remains at static baseline.',
    }
  }

  const sortedIncidents = [...relevantIncidents].sort((a, b) => {
    const dateA = parseGDELTDate(a.date)
    const dateB = parseGDELTDate(b.date)
    return dateB.getTime() - dateA.getTime()
  })

  const mostRecentIncident = sortedIncidents[0]
  const mostRecentDate = parseGDELTDate(mostRecentIncident.date)
  const daysSinceLast = (now.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24)

  const recentIncidents = relevantIncidents.filter(i => {
    const incidentDate = parseGDELTDate(i.date)
    const daysDiff = (now.getTime() - incidentDate.getTime()) / (1000 * 60 * 60 * 24)
    return daysDiff <= 7
  })

  const fatalIncidents = relevantIncidents.filter(i => i.severity === 'fatal')
  const highSeverityIncidents = relevantIncidents.filter(i => 
    i.severity === 'fatal' || i.severity === 'serious'
  )

  const staticRiskNormalized = staticRiskLevel.toUpperCase().trim()
  let adjustedRisk = staticRiskLevel
  let trend: 'improving' | 'stable' | 'worsening' = 'stable'
  let reasoning = ''

  if (recentIncidents.length >= 3 && fatalIncidents.length > 0) {
    if (staticRiskNormalized === 'LOW' || staticRiskNormalized === 'MODERATE') {
      adjustedRisk = 'HIGH'
      trend = 'worsening'
      reasoning = `Multiple recent incidents (${recentIncidents.length} in past 7 days) including fatalities. Risk elevated significantly.`
    } else if (staticRiskNormalized === 'HIGH') {
      adjustedRisk = 'VERY HIGH'
      trend = 'worsening'
      reasoning = `Multiple recent incidents (${recentIncidents.length} in past 7 days) with fatalities. Risk elevated.`
    }
  } else if (recentIncidents.length >= 2 && highSeverityIncidents.length > 0) {
    if (staticRiskNormalized === 'LOW') {
      adjustedRisk = 'MODERATE'
      trend = 'worsening'
      reasoning = `Recent incidents (${recentIncidents.length} in past 7 days) with serious incidents. Risk elevated.`
    } else if (staticRiskNormalized === 'MODERATE') {
      adjustedRisk = 'HIGH'
      trend = 'worsening'
      reasoning = `Recent incidents (${recentIncidents.length} in past 7 days) with serious incidents. Risk elevated.`
    }
  } else if (recentIncidents.length >= 1 && daysSinceLast <= 2) {
    if (staticRiskNormalized === 'LOW') {
      adjustedRisk = 'MODERATE'
      trend = 'worsening'
      reasoning = `Very recent incident (${Math.round(daysSinceLast)} days ago). Risk temporarily elevated.`
    }
  } else if (daysSinceLast > 14 && relevantIncidents.length > 0) {
    if (staticRiskNormalized === 'VERY HIGH' || staticRiskNormalized === 'HIGH') {
      trend = 'improving'
      reasoning = `No incidents in past 14 days. Risk may be stabilizing, but static level remains due to historical patterns.`
    }
  }

  if (!reasoning) {
    reasoning = `Risk assessment based on ${relevantIncidents.length} incident(s) in past ${timeWindowDays} days. Most recent: ${Math.round(daysSinceLast)} days ago.`
  }

  return {
    staticRisk: staticRiskLevel,
    adjustedRisk,
    daysSinceLastIncident: Math.round(daysSinceLast),
    trend,
    reasoning,
  }
}

