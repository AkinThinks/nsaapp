/**
 * Location Intelligence System
 * 
 * Implements the 3-file hierarchy lookup:
 * 1. locations-complete.json - Find location and basic risk level
 * 2. detailed-location-intelligence.json - Get state-level guidance
 * 3. tiered-location-intelligence.json - Get location-specific detail (overrides state)
 */

export interface Location {
  id: string
  name: string
  state?: string
  type: 'state' | 'lga' | 'city' | 'area' | 'institution' | 'market' | 'tourist' | 'airport' | 'industrial'
  risk_level: 'EXTREME' | 'VERY HIGH' | 'HIGH' | 'MODERATE' | 'LOW'
}

export interface StateIntelligence {
  name: string
  risk_level: string
  badge: string
  summary: string
  key_threats?: string[]
  safer_zones?: string[]
  danger_zones?: string[]
  travel_windows?: {
    safest?: string
    avoid?: string
    note?: string
  }
  if_you_must_go?: string[]
  residents_tips?: string[]
  tips?: string[]
  emergency_contacts?: {
    police?: string
    emergency?: string
    [key: string]: string | undefined
  }
  travel_advice?: {
    abuja_to_kaduna?: {
      recommended?: string
      avoid?: string
      flight?: string
    }
    [key: string]: any
  }
  monday_warning?: {
    status: string
    reason: string
    advice: string
  }
  checkpoints?: {
    what_to_expect?: string
    documents?: string
    behavior?: string
  }
  if_stranded?: string[]
  what_not_to_do?: string[]
  evacuation_routes?: string[] | {
    primary?: string
    secondary?: string
    note?: string
  }
  [key: string]: any
}

export interface DetailedLocationIntelligence {
  meta?: {
    version?: string
    last_updated?: string
    description?: string
  }
  extreme_states?: Record<string, StateIntelligence>
  very_high_states?: Record<string, StateIntelligence>
  high_states?: Record<string, StateIntelligence>
  moderate_states?: Record<string, StateIntelligence>
  low_states?: Record<string, StateIntelligence>
}

export interface TieredLocationIntelligence {
  location_id: string
  location_name: string
  state: string
  risk_level: string
  badge: string
  summary?: string
  key_threats?: string[]
  safer_zones?: string[]
  danger_zones?: string[]
  travel_windows?: {
    safest?: string
    avoid?: string
    note?: string
  }
  resident_tips?: string[]
  visitor_advice?: string
  transit_advice?: string
  safer_hours?: string
  emergency_contacts?: string[]
  alternatives?: string[]
  highlights?: string[]
  visitor_tips?: string[]
  if_you_must_go?: string[]
  what_not_to_do?: string[]
  if_stranded?: string[]
  checkpoints?: {
    what_to_expect?: string
    documents?: string
    behavior?: string
  }
  evacuation_routes?: string[]
  [key: string]: any
}

export interface CombinedLocationData {
  // Basic info (from locations-complete.json)
  location_id: string
  location_name: string
  state: string
  type: string
  risk_level: 'EXTREME' | 'VERY HIGH' | 'HIGH' | 'MODERATE' | 'LOW'
  
  // Badge (from risk_level)
  badge: string
  
  // Summary (location > state)
  summary: string
  
  // Key Threats (combine, prefer location)
  key_threats: string[]
  
  // Safer Zones (location > state)
  safer_zones: string[]
  
  // Danger Zones (location > state)
  danger_zones: string[]
  
  // Travel Windows (location > state)
  travel_windows?: {
    safest?: string
    avoid?: string
    note?: string
  }
  
  // Safer Hours (from tiered data)
  safer_hours?: string
  
  // Tips (combine both - state + location)
  resident_tips: string[]
  visitor_tips: string[]
  transit_tips: string[]
  
  // Emergency Contacts (state-level)
  emergency_contacts?: {
    police?: string
    emergency?: string
    [key: string]: string | undefined
  }
  
  // Special cases
  monday_warning?: {
    status: string
    reason: string
    advice: string
  }
  travel_advice?: {
    abuja_to_kaduna?: {
      recommended?: string
      avoid?: string
      flight?: string
    }
    [key: string]: any
  }
  
  // EXTREME areas extra info
  what_not_to_do?: string[]
  if_stranded?: string[]
  checkpoints?: {
    what_to_expect?: string
    documents?: string
    behavior?: string
  }
  evacuation_routes?: string[]  // Always normalized to array in return value
  
  // Alternatives
  alternatives?: string[]
  
  // Highlights (for safe areas)
  highlights?: string[]
  
  // Visitor/Transit advice
  visitor_advice?: string
  transit_advice?: string
  
  // Welcome messages for context
  resident_welcome?: string
  visitor_welcome?: string
  transit_welcome?: string
}

/**
 * Badge mapping based on risk level
 */
const badgeMapping: Record<string, { emoji: string; text: string }> = {
  EXTREME: { emoji: '⛔', text: 'Do Not Travel' },
  'VERY HIGH': { emoji: '⚠️', text: 'Reconsider Travel' },
  HIGH: { emoji: '🔔', text: 'Stay Alert' },
  MODERATE: { emoji: '✅', text: 'Generally Safe' },
  LOW: { emoji: '🟢', text: 'Safe' },
}

/**
 * Get state data from detailed-location-intelligence.json
 */
function getStateIntelligence(
  stateId: string,
  detailedIntelligence: DetailedLocationIntelligence
): StateIntelligence | null {
  const normalizedStateId = stateId.toLowerCase().trim()
  
  // Check each risk tier
  const tiers = [
    detailedIntelligence.extreme_states,
    detailedIntelligence.very_high_states,
    detailedIntelligence.high_states,
    detailedIntelligence.moderate_states,
    detailedIntelligence.low_states,
  ]
  
  for (const tier of tiers) {
    if (tier?.[normalizedStateId]) {
      return tier[normalizedStateId]
    }
  }
  
  return null
}

/**
 * Get location-specific data from tiered-location-intelligence.json
 */
function getTieredLocationData(
  locationId: string,
  tieredIntelligence: Record<string, Record<string, TieredLocationIntelligence>>
): TieredLocationIntelligence | null {
  const normalizedLocationId = locationId.toLowerCase().trim()
  const tiers = ['extreme', 'very_high', 'high', 'moderate', 'low']
  
  for (const tier of tiers) {
    if (tieredIntelligence[tier]?.[normalizedLocationId]) {
      return tieredIntelligence[tier][normalizedLocationId]
    }
  }
  
  return null
}

/**
 * Main lookup function - follows the 3-file hierarchy
 */
export function lookupLocationIntelligence(
  locationId: string,
  locationsComplete: Location[],
  detailedIntelligence: DetailedLocationIntelligence,
  tieredIntelligence: Record<string, Record<string, TieredLocationIntelligence>>
): CombinedLocationData | null {
  // Input validation
  if (!locationId || typeof locationId !== 'string') {
    console.warn('Invalid locationId provided to lookupLocationIntelligence')
    return null
  }
  
  if (!Array.isArray(locationsComplete)) {
    console.warn('locationsComplete must be an array')
    return null
  }
  
  // STEP 1: Find location in locations-complete.json
  const normalizedLocationId = locationId.toLowerCase().trim()
  const basicLocation = locationsComplete.find(
    loc => loc && loc.id && typeof loc.id === 'string' && loc.id.toLowerCase().trim() === normalizedLocationId
  )
  
  if (!basicLocation) {
    console.warn(`Location ${locationId} not found in merged locations`)
    return null
  }
  
  // STEP 2: Get state data from detailed-location-intelligence.json
  // If location is a state itself, use its own ID; otherwise use its state field
  const stateId = basicLocation.type === 'state' 
    ? normalizedLocationId 
    : (basicLocation.state?.toLowerCase().trim() || '')
  const stateData = stateId ? getStateIntelligence(stateId, detailedIntelligence) : null
  
  // STEP 3: Check tiered-location-intelligence.json for location-specific data
  const locationSpecificData = getTieredLocationData(normalizedLocationId, tieredIntelligence)
  
  // STEP 4: Determine risk level (location takes priority over state)
  const riskLevel = basicLocation.risk_level
  
  // STEP 5: Combine data with proper hierarchy
  const badge = badgeMapping[riskLevel] || { emoji: '⚠️', text: 'Unknown' }
  
  // Summary: location-specific > state > default (with more context)
  const summary = locationSpecificData?.summary 
    || stateData?.summary 
    || (() => {
      // Generate more helpful default summary based on risk level and type
      if (basicLocation.type === 'state') {
        return `${basicLocation.name} State has ${riskLevel.toLowerCase()} security risks. Exercise appropriate caution.`
      } else if (basicLocation.type === 'city') {
        return `${basicLocation.name} has ${riskLevel.toLowerCase()} security risks. Standard precautions recommended.`
      } else {
        return `This area has ${riskLevel.toLowerCase()} security risks. Stay informed and exercise caution.`
      }
    })()
  
  // Helper function to ensure value is an array (handles all edge cases)
  const ensureArray = (value: any): string[] => {
    if (value === null || value === undefined) return []
    if (Array.isArray(value)) {
      // Filter out any null/undefined values
      return value.filter(item => item != null && typeof item === 'string')
    }
    if (typeof value === 'string' && value.trim()) return [value]
    if (typeof value === 'number') return [String(value)]
    return []
  }

  // Key Threats: combine both, prefer location-specific
  const keyThreats = [
    ...ensureArray(locationSpecificData?.key_threats),
    ...ensureArray(stateData?.key_threats),
  ]
  // Remove duplicates while preserving order (location first)
  const uniqueThreats = Array.from(new Set(keyThreats))

  // Safer Zones: location > state
  const locationSaferZones = ensureArray(locationSpecificData?.safer_zones)
  const saferZones = locationSaferZones.length > 0 
    ? locationSaferZones 
    : ensureArray(stateData?.safer_zones)

  // Danger Zones: location > state
  const locationDangerZones = ensureArray(locationSpecificData?.danger_zones)
  const dangerZones = locationDangerZones.length > 0 
    ? locationDangerZones 
    : ensureArray(stateData?.danger_zones)
  
  // Travel Windows: location > state
  const travelWindows = locationSpecificData?.travel_windows 
    || stateData?.travel_windows 
    || undefined
  
  // Tips: combine both (state + location)
  const residentTips = [
    ...ensureArray(locationSpecificData?.resident_tips),
    ...ensureArray(stateData?.residents_tips),
    ...ensureArray(stateData?.tips),
  ]

  const visitorTips = ensureArray(locationSpecificData?.visitor_tips)
  const transitTips = ensureArray(locationSpecificData?.transit_tips)
  
  // Emergency Contacts: state-level
  const emergencyContacts = stateData?.emergency_contacts || {}
  
  // Special cases
  const mondayWarning = stateData?.monday_warning
  const travelAdvice = stateData?.travel_advice
  
  // EXTREME areas extra info
  const whatNotToDo = [
    ...ensureArray(locationSpecificData?.what_not_to_do),
    ...ensureArray(stateData?.what_not_to_do),
  ]

  const ifStranded = [
    ...ensureArray(locationSpecificData?.if_stranded),
    ...ensureArray(stateData?.if_stranded),
  ]
  
  const checkpoints = locationSpecificData?.checkpoints || stateData?.checkpoints
  
  // Handle evacuation_routes - can be array or object
  const normalizeEvacuationRoutes = (routes: any): string[] => {
    if (!routes) return []
    if (Array.isArray(routes)) return routes
    if (typeof routes === 'object') {
      // Convert object format to array
      const arr: string[] = []
      if (routes.primary) arr.push(routes.primary)
      if (routes.secondary) arr.push(routes.secondary)
      if (routes.note) arr.push(routes.note)
      return arr
    }
    return []
  }
  
  const evacuationRoutes = [
    ...normalizeEvacuationRoutes(locationSpecificData?.evacuation_routes),
    ...normalizeEvacuationRoutes(stateData?.evacuation_routes),
  ]
  
  // Alternatives
  const alternatives = ensureArray(locationSpecificData?.alternatives)
  
  // Highlights (for safe areas)
  const highlights = ensureArray(locationSpecificData?.highlights)
  
  // Visitor/Transit advice
  const visitorAdvice = locationSpecificData?.visitor_advice
  const transitAdvice = locationSpecificData?.transit_advice
  
  // Safer hours (from tiered data)
  const saferHours = locationSpecificData?.safer_hours
  
  // If you must go (combine)
  const ifYouMustGo = [
    ...ensureArray(locationSpecificData?.if_you_must_go),
    ...ensureArray(stateData?.if_you_must_go),
  ]
  
  // Generate welcome messages based on context if not provided
  const residentWelcome = locationSpecificData?.resident_welcome || 
    (riskLevel === 'MODERATE' || riskLevel === 'LOW' 
      ? `Welcome to ${basicLocation.name}!` 
      : `Safety Tips for ${basicLocation.name}`)
  
  const visitorWelcome = locationSpecificData?.visitor_welcome || 
    `Travel Advisory: ${basicLocation.name}`
  
  const transitWelcome = locationSpecificData?.transit_welcome || 
    `Route Safety: Through ${basicLocation.name}`
  
  return {
    location_id: basicLocation.id,
    location_name: basicLocation.name,
    state: basicLocation.state || '',
    type: basicLocation.type,
    risk_level: riskLevel,
    badge: `${badge.emoji} ${badge.text}`,
    summary,
    key_threats: uniqueThreats,
    safer_zones: saferZones,
    danger_zones: dangerZones,
    travel_windows: travelWindows,
    safer_hours: saferHours,
    resident_tips: residentTips,
    visitor_tips: visitorTips,
    transit_tips: transitTips,
    emergency_contacts: Object.keys(emergencyContacts).length > 0 ? emergencyContacts : undefined,
    monday_warning: mondayWarning,
    travel_advice: travelAdvice,
    what_not_to_do: whatNotToDo.length > 0 ? whatNotToDo : undefined,
    if_stranded: ifStranded.length > 0 ? ifStranded : undefined,
    checkpoints,
    evacuation_routes: evacuationRoutes.length > 0 ? evacuationRoutes : undefined,
    alternatives: alternatives.length > 0 ? alternatives : undefined,
    highlights: highlights.length > 0 ? highlights : undefined,
    visitor_advice: visitorAdvice,
    transit_advice: transitAdvice,
    if_you_must_go: ifYouMustGo.length > 0 ? ifYouMustGo : undefined,
    // Add welcome messages
    resident_welcome: residentWelcome,
    visitor_welcome: visitorWelcome,
    transit_welcome: transitWelcome,
  }
}

