// Route-specific relevance calculations using corridor-based proximity
// Routes are linear corridors, not points - different relevance model than areas

import { getRoadsForRoute } from './road-mapping'

export type RouteRelevanceZone = 'on_route' | 'route_state' | 'off_route'

export interface RouteRelevanceConfig {
  zone: RouteRelevanceZone
  score: number
  label: string
  includeInPrimaryCount: boolean
}

export const ROUTE_ZONE_CONFIGS: Record<RouteRelevanceZone, RouteRelevanceConfig> = {
  on_route: { 
    zone: 'on_route', 
    score: 1.0, 
    label: 'On this route', 
    includeInPrimaryCount: true 
  },
  route_state: { 
    zone: 'route_state', 
    score: 0.5, 
    label: 'In route state', 
    includeInPrimaryCount: true 
  },
  off_route: { 
    zone: 'off_route', 
    score: 0.1, 
    label: 'Elsewhere (not on route)', 
    includeInPrimaryCount: false 
  },
}

/**
 * Normalize location string for comparison
 */
function normalizeLocation(location: string): string {
  return location.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

/**
 * Check if location matches any term in a list (fuzzy matching)
 */
function locationMatchesTerms(location: string, terms: string[]): boolean {
  const locationNorm = normalizeLocation(location)
  
  return terms.some(term => {
    const termNorm = normalizeLocation(term)
    if (termNorm.length < 3) return false
    
    // Exact match
    if (locationNorm === termNorm) return true
    
    // Contains match
    if (locationNorm.includes(termNorm) || termNorm.includes(locationNorm)) return true
    
    // Word boundary match
    const locationWords = locationNorm.split('-')
    const termWords = termNorm.split('-')
    
    return locationWords.some(lw => 
      lw.length > 3 && termWords.some(tw => tw.length > 3 && lw === tw)
    )
  })
}

/**
 * Extract road names from route
 */
function getRouteRoadNames(stateIds: string[]): string[] {
  const roads = getRoadsForRoute(stateIds)
  const roadNames: string[] = []
  
  roads.forEach(road => {
    // Add road name
    roadNames.push(road.name)
    
    // Add query terms
    if (road.queryTerms) {
      roadNames.push(...road.queryTerms)
    }
    
    // Extract key terms from road name
    const nameTerms = road.name
      .split(/[\s-]+/)
      .filter(term => term.length > 3 && !['road', 'highway', 'expressway', 'route'].includes(term.toLowerCase()))
    
    roadNames.push(...nameTerms)
  })
  
  return Array.from(new Set(roadNames)) // Deduplicate
}

/**
 * Determine route relevance zone for an incident
 * Routes are corridors - incidents can be ON the route, IN a route state, or OFF route
 */
export function getRouteRelevanceZone(
  incidentLocation: string | null,
  routeStateIds: string[],
  routeRoadNames: string[]
): RouteRelevanceZone {
  if (!incidentLocation) {
    return 'route_state' // Default to route state if location unknown
  }

  const locationNorm = normalizeLocation(incidentLocation)
  
  // Step 1: Check if incident mentions any route road name
  // This indicates the incident is ON the actual route corridor
  if (routeRoadNames.length > 0) {
    if (locationMatchesTerms(incidentLocation, routeRoadNames)) {
      return 'on_route'
    }
    
    // Also check for common road-related terms near route locations
    const roadKeywords = ['highway', 'expressway', 'road', 'junction', 'interchange', 'toll', 'gate']
    const hasRoadKeyword = roadKeywords.some(keyword => locationNorm.includes(keyword))
    
    if (hasRoadKeyword) {
      // Check if any route state is mentioned nearby
      for (const stateId of routeStateIds) {
        const stateNorm = normalizeLocation(stateId)
        if (locationNorm.includes(stateNorm)) {
          return 'on_route'
        }
      }
    }
  }
  
  // Step 2: Check if incident is in a route state
  // This means it's in a state along the route, but may not be on the actual road
  for (const stateId of routeStateIds) {
    const stateNorm = normalizeLocation(stateId)
    
    // Direct state match
    if (locationNorm === stateNorm || locationNorm.includes(stateNorm)) {
      return 'route_state'
    }
    
    // Check state name variations
    const stateWords = stateId.toLowerCase().split(/[\s-]+/)
    if (stateWords.some(word => word.length > 3 && locationNorm.includes(word))) {
      return 'route_state'
    }
  }
  
  // Step 3: If not in route states, it's off route
  return 'off_route'
}

/**
 * Get relevance score for a route zone
 */
export function getRouteRelevanceScore(zone: RouteRelevanceZone): number {
  return ROUTE_ZONE_CONFIGS[zone].score
}

/**
 * Get display label for route relevance zone
 */
export function getRouteZoneLabel(zone: RouteRelevanceZone): string {
  return ROUTE_ZONE_CONFIGS[zone].label
}

/**
 * Get all road names for a route (helper for intelligence hook)
 */
export function getRouteRoadNamesForStates(stateIds: string[]): string[] {
  return getRouteRoadNames(stateIds)
}



