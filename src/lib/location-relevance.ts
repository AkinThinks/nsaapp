// Location relevance calculations using zone-based proximity
// Based on Tobler's First Law of Geography
// Implements Inverse Distance Weighting (IDW) concept via zone mapping

import { getAreaHierarchy } from './area-state-mapping'

export type RelevanceZone = 'immediate' | 'nearby' | 'same_region' | 'same_state' | 'distant'

export interface ZoneConfig {
  zone: RelevanceZone
  score: number
  label: string
  includeInPrimaryCount: boolean
}

export const ZONE_CONFIGS: Record<RelevanceZone, ZoneConfig> = {
  immediate: { 
    zone: 'immediate', 
    score: 1.0, 
    label: 'In this area', 
    includeInPrimaryCount: true 
  },
  nearby: { 
    zone: 'nearby', 
    score: 0.7, 
    label: 'Nearby (~15km)', 
    includeInPrimaryCount: true 
  },
  same_region: { 
    zone: 'same_region', 
    score: 0.4, 
    label: 'Same region (~30km)', 
    includeInPrimaryCount: true 
  },
  same_state: { 
    zone: 'same_state', 
    score: 0.15, 
    label: 'Elsewhere in state', 
    includeInPrimaryCount: false 
  },
  distant: { 
    zone: 'distant', 
    score: 0, 
    label: 'Far from your location', 
    includeInPrimaryCount: false 
  },
}

// Zone mappings for major cities (using existing area-state-mapping structure)
// Lagos zones (expanded from existing mapping)
const LAGOS_ZONES: Record<string, { immediate: string[]; nearby: string[]; same_region: string[] }> = {
  'lekki': {
    immediate: ['lekki', 'lekki-phase-1', 'lekki-phase-2', 'chevron', 'ikate', 'marwa', 'jakande'],
    nearby: ['ajah', 'victoria-island', 'vi', 'ikoyi', 'sangotedo', 'abraham-adesanya', 'oniru'],
    same_region: ['lagos-island', 'eko-atlantic', 'banana-island', 'obalende'],
  },
  'victoria-island': {
    immediate: ['victoria-island', 'vi', 'oniru', 'eko-atlantic', 'bar-beach'],
    nearby: ['lekki', 'ikoyi', 'lagos-island', 'obalende'],
    same_region: ['ajah', 'banana-island', 'apapa'],
  },
  'ikoyi': {
    immediate: ['ikoyi', 'banana-island', 'parkview'],
    nearby: ['victoria-island', 'vi', 'obalende', 'lagos-island'],
    same_region: ['lekki', 'apapa', 'yaba'],
  },
  'ikeja': {
    immediate: ['ikeja', 'ikeja-gra', 'alausa', 'oregun', 'opebi', 'adeniyi-jones', 'awolowo-way'],
    nearby: ['maryland', 'ojodu', 'ogba', 'agidingbi', 'magodo', 'omole'],
    same_region: ['yaba', 'surulere', 'gbagada', 'anthony', 'berger'],
  },
  'yaba': {
    immediate: ['yaba', 'akoka', 'unilag', 'iwaya', 'onike'],
    nearby: ['surulere', 'ebute-metta', 'oyingbo', 'gbagada', 'anthony'],
    same_region: ['ikeja', 'maryland', 'lagos-island', 'apapa'],
  },
  'surulere': {
    immediate: ['surulere', 'aguda', 'iponri', 'ojuelegba', 'lawanson'],
    nearby: ['yaba', 'mushin', 'oshodi', 'ikate'],
    same_region: ['ikeja', 'apapa', 'festac'],
  },
  'ikorodu': {
    immediate: ['ikorodu', 'ikorodu-town', 'igbogbo', 'ijede', 'imota'],
    nearby: ['agric', 'owutu', 'agbowa'],
    same_region: ['gbagada', 'ojota', 'ketu', 'mile-12'],
  },
  'badagry': {
    immediate: ['badagry', 'badagry-town', 'ajara'],
    nearby: ['ojo', 'satellite-town'],
    same_region: ['festac', 'alaba', 'apapa'],
  },
  'festac': {
    immediate: ['festac', 'festac-town', 'amuwo-odofin'],
    nearby: ['apapa', 'ojo', 'satellite-town', 'alaba'],
    same_region: ['surulere', 'iganmu', 'orile'],
  },
  'apapa': {
    immediate: ['apapa', 'apapa-wharf', 'tin-can', 'kirikiri'],
    nearby: ['festac', 'iganmu', 'orile', 'ijora'],
    same_region: ['surulere', 'yaba', 'lagos-island'],
  },
}

// FCT Abuja zones
const ABUJA_ZONES: Record<string, { immediate: string[]; nearby: string[]; same_region: string[] }> = {
  'wuse': {
    immediate: ['wuse', 'wuse-2', 'wuse-zone-3', 'wuse-zone-4', 'wuse-zone-5'],
    nearby: ['garki', 'maitama', 'utako', 'jabi', 'gudu'],
    same_region: ['asokoro', 'gwarinpa', 'central-area'],
  },
  'maitama': {
    immediate: ['maitama', 'maitama-district'],
    nearby: ['wuse', 'asokoro', 'garki', 'jabi'],
    same_region: ['gwarinpa', 'utako', 'central-area'],
  },
  'gwarinpa': {
    immediate: ['gwarinpa', 'gwarimpa', 'life-camp', 'kado'],
    nearby: ['jabi', 'utako', 'wuye', 'mabushi'],
    same_region: ['wuse', 'maitama', 'kubwa'],
  },
  'garki': {
    immediate: ['garki', 'garki-area-1', 'garki-area-2', 'garki-area-3'],
    nearby: ['wuse', 'asokoro', 'central-area', 'gudu'],
    same_region: ['maitama', 'jabi', 'lugbe'],
  },
  'kubwa': {
    immediate: ['kubwa', 'kubwa-fha', 'byazhin', 'gwarinpa-estate'],
    nearby: ['bwari', 'dutse', 'dei-dei'],
    same_region: ['gwarinpa', 'jabi', 'wuse'],
  },
  'lugbe': {
    immediate: ['lugbe', 'lugbe-fha', 'airport-road'],
    nearby: ['idu', 'jabi', 'garki', 'kuje'],
    same_region: ['wuse', 'asokoro', 'nyanya'],
  },
  'nyanya': {
    immediate: ['nyanya', 'karu', 'jikwoyi', 'orozo'],
    nearby: ['mararaba', 'kurudu', 'asokoro-extension'],
    same_region: ['lugbe', 'garki', 'kuje'],
  },
}

// Enugu zones
const ENUGU_ZONES: Record<string, { immediate: string[]; nearby: string[]; same_region: string[] }> = {
  'enugu': {
    immediate: ['enugu', 'enugu-city', 'independence-layout', 'gra-enugu', 'new-haven', 'ogui'],
    nearby: ['trans-ekulu', 'abakpa', 'emene', 'uwani'],
    same_region: ['agbani', '9th-mile', 'udi'],
  },
  'nsukka': {
    immediate: ['nsukka', 'nsukka-town', 'unn', 'university-of-nigeria'],
    nearby: ['obukpa', 'edem', 'ibagwa'],
    same_region: ['enugu-ezike', 'obollo-afor'],
  },
}

// Rivers zones
const RIVERS_ZONES: Record<string, { immediate: string[]; nearby: string[]; same_region: string[] }> = {
  'port-harcourt': {
    immediate: ['port-harcourt', 'ph', 'gra-ph', 'd-line', 'old-gra', 'new-gra'],
    nearby: ['trans-amadi', 'rumuokoro', 'eliozu', 'rumuola', 'peter-odili'],
    same_region: ['obio-akpor', 'oyigbo', 'eleme'],
  },
}

// Kaduna zones
const KADUNA_ZONES: Record<string, { immediate: string[]; nearby: string[]; same_region: string[] }> = {
  'kaduna': {
    immediate: ['kaduna', 'kaduna-town', 'barnawa', 'sabon-tasha', 'malali'],
    nearby: ['kakuri', 'narayi', 'ungwan-rimi', 'tudun-wada'],
    same_region: ['rigasa', 'mando', 'kaduna-south'],
  },
  'zaria': {
    immediate: ['zaria', 'zaria-city', 'abu', 'samaru'],
    nearby: ['sabon-gari-zaria', 'tudun-jukun', 'kwarbai'],
    same_region: ['soba', 'giwa'],
  },
}

// Kano zones
const KANO_ZONES: Record<string, { immediate: string[]; nearby: string[]; same_region: string[] }> = {
  'kano': {
    immediate: ['kano', 'kano-city', 'nasarawa-gra', 'bompai', 'sabon-gari-kano'],
    nearby: ['fagge', 'tarauni', 'ungogo', 'gwale'],
    same_region: ['wudil', 'dawakin', 'kumbotso'],
  },
}

// Oyo zones
const OYO_ZONES: Record<string, { immediate: string[]; nearby: string[]; same_region: string[] }> = {
  'ibadan': {
    immediate: ['ibadan', 'ibadan-city', 'bodija', 'uc-ibadan', 'dugbe', 'challenge'],
    nearby: ['ring-road', 'iwo-road', 'ojoo', 'agodi', 'jericho'],
    same_region: ['oluyole', 'egbeda', 'moniya'],
  },
}

// All zones combined
const ALL_ZONES: Record<string, Record<string, { immediate: string[]; nearby: string[]; same_region: string[] }>> = {
  'lagos': LAGOS_ZONES,
  'fct': ABUJA_ZONES,
  'fct-abuja': ABUJA_ZONES,
  'abuja': ABUJA_ZONES,
  'enugu': ENUGU_ZONES,
  'rivers': RIVERS_ZONES,
  'kaduna': KADUNA_ZONES,
  'kano': KANO_ZONES,
  'oyo': OYO_ZONES,
}

/**
 * Get the state for an area (using existing mapping)
 */
export function getStateForArea(area: string): string | null {
  const hierarchy = getAreaHierarchy(area)
  return hierarchy?.state || null
}

/**
 * Normalize location string for comparison
 */
function normalizeLocation(location: string): string {
  return location.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

/**
 * Check if two locations match (fuzzy matching)
 */
function locationsMatch(loc1: string, loc2: string): boolean {
  const norm1 = normalizeLocation(loc1)
  const norm2 = normalizeLocation(loc2)
  
  // Exact match
  if (norm1 === norm2) return true
  
  // One contains the other
  if (norm1.includes(norm2) || norm2.includes(norm1)) return true
  
  // Check for common variations
  const variations1 = norm1.split('-')
  const variations2 = norm2.split('-')
  
  // Check if any significant word matches
  return variations1.some(v1 => 
    v1.length > 3 && variations2.some(v2 => v2.length > 3 && v1 === v2)
  )
}

/**
 * Determine relevance zone for an incident location relative to user's search
 * Uses zone-based proximity (simpler than coordinate-based IDW)
 */
export function getRelevanceZone(
  userSearchArea: string,
  incidentLocation: string | null,
  userState: string
): RelevanceZone {
  if (!incidentLocation) {
    return 'same_state' // Default if location unknown
  }

  const searchNorm = normalizeLocation(userSearchArea)
  const incidentNorm = normalizeLocation(incidentLocation)
  const stateNorm = normalizeLocation(userState)

  // Same exact area
  if (locationsMatch(searchNorm, incidentNorm)) {
    return 'immediate'
  }

  // Check zone mappings
  const stateZones = ALL_ZONES[stateNorm]
  if (stateZones) {
    const areaZones = stateZones[searchNorm]
    if (areaZones) {
      // Check immediate zones
      if (areaZones.immediate.some(z => locationsMatch(incidentNorm, z))) {
        return 'immediate'
      }

      // Check nearby zones
      if (areaZones.nearby.some(z => locationsMatch(incidentNorm, z))) {
        return 'nearby'
      }

      // Check same region
      if (areaZones.same_region.some(z => locationsMatch(incidentNorm, z))) {
        return 'same_region'
      }
    }
  }

  // Check if incident mentions the state
  const incidentState = getStateForArea(incidentNorm)
  if (incidentState && normalizeLocation(incidentState) === stateNorm) {
    return 'same_state'
  }

  // Check if incident contains state name
  if (incidentNorm.includes(stateNorm) || 
      incidentNorm.includes(userState.toLowerCase())) {
    return 'same_state'
  }

  return 'distant'
}

/**
 * Get relevance score for a zone
 */
export function getRelevanceScore(zone: RelevanceZone): number {
  return ZONE_CONFIGS[zone].score
}

/**
 * Get display label for relevance zone
 */
export function getZoneLabel(zone: RelevanceZone): string {
  return ZONE_CONFIGS[zone].label
}



