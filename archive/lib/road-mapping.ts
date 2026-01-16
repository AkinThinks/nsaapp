// Maps state pairs to road names for GDELT queries
// Uses existing data from dangerous-roads-lookup.json as reference

export interface RoadInfo {
  id: string
  name: string
  queryTerms: string[]
}

// State pair to road mapping
// Key format: "state1_state2" (alphabetically sorted)
export const STATE_PAIR_TO_ROAD: Record<string, RoadInfo> = {
  // Lagos corridor
  "lagos_ogun": {
    id: "lagos-ibadan",
    name: "Lagos - Ibadan Expressway",
    queryTerms: ["Lagos Ibadan expressway", "Shagamu", "Sagamu interchange", "Ibafo"]
  },
  "ogun_oyo": {
    id: "lagos-ibadan-2",
    name: "Lagos - Ibadan Expressway",
    queryTerms: ["Lagos Ibadan expressway", "Ibadan toll gate"]
  },
  
  // Ibadan - Ilorin
  "kwara_oyo": {
    id: "ibadan-ilorin",
    name: "Ibadan - Ilorin Road",
    queryTerms: ["Ibadan Ilorin road", "Oyo Ogbomoso road", "Ogbomoso"]
  },
  
  // Ilorin - Lokoja
  "kogi_kwara": {
    id: "ilorin-lokoja",
    name: "Ilorin - Lokoja Highway",
    queryTerms: ["Ilorin Lokoja highway", "Jebba", "Kabba road"]
  },
  
  // Lokoja - Abuja
  "fct_kogi": {
    id: "lokoja-abuja",
    name: "Lokoja - Abuja Highway",
    queryTerms: ["Lokoja Abuja highway", "Lokoja Abuja road", "Koton Karfe"]
  },
  
  // Abuja - Kaduna
  "fct_kaduna": {
    id: "abuja-kaduna",
    name: "Abuja - Kaduna Highway",
    queryTerms: ["Abuja Kaduna highway", "Abuja Kaduna expressway", "Rijana", "Katari"]
  },
  
  // Kaduna - Kano
  "kaduna_kano": {
    id: "kaduna-kano",
    name: "Kaduna - Kano Road",
    queryTerms: ["Kaduna Kano road", "Kaduna Zaria road", "Zaria Kano"]
  },
  
  // Lagos - Benin (Ore road)
  "lagos_ondo": {
    id: "lagos-ore",
    name: "Lagos - Ore - Benin Expressway",
    queryTerms: ["Lagos Benin expressway", "Ore road", "Sagamu Benin", "Ijebu Ode road"]
  },
  "edo_ondo": {
    id: "ore-benin",
    name: "Ore - Benin Expressway",
    queryTerms: ["Ore Benin road", "Lagos Benin expressway", "Okada"]
  },
  "ogun_ondo": {
    id: "sagamu-ore",
    name: "Sagamu - Ore Road",
    queryTerms: ["Sagamu Ore", "Sagamu Benin", "Ijebu Ode"]
  },
  
  // Benin - Onitsha
  "anambra_edo": {
    id: "benin-onitsha",
    name: "Benin - Asaba - Onitsha Road",
    queryTerms: ["Benin Onitsha", "Benin Asaba road", "Asaba Onitsha", "Niger bridge"]
  },
  "delta_edo": {
    id: "benin-asaba",
    name: "Benin - Asaba Expressway",
    queryTerms: ["Benin Asaba expressway", "Benin Asaba road"]
  },
  "anambra_delta": {
    id: "asaba-onitsha",
    name: "Asaba - Onitsha (Niger Bridge)",
    queryTerms: ["Asaba Onitsha", "Niger bridge", "Onitsha bridge"]
  },
  
  // Onitsha - Enugu
  "anambra_enugu": {
    id: "onitsha-enugu",
    name: "Onitsha - Enugu Expressway",
    queryTerms: ["Onitsha Enugu expressway", "Onitsha Enugu road", "Awka road"]
  },
  
  // Enugu - Port Harcourt
  "enugu_rivers": {
    id: "enugu-ph",
    name: "Enugu - Port Harcourt Expressway",
    queryTerms: ["Enugu Port Harcourt expressway", "Enugu PH road"]
  },
  "abia_enugu": {
    id: "enugu-aba",
    name: "Enugu - Aba Road",
    queryTerms: ["Enugu Aba road", "Enugu Abia"]
  },
  "abia_rivers": {
    id: "aba-ph",
    name: "Aba - Port Harcourt Expressway",
    queryTerms: ["Aba Port Harcourt expressway", "Aba PH road"]
  },
  
  // Owerri connections
  "imo_rivers": {
    id: "owerri-ph",
    name: "Owerri - Port Harcourt Road",
    queryTerms: ["Owerri Port Harcourt road", "Owerri PH"]
  },
  "abia_imo": {
    id: "aba-owerri",
    name: "Aba - Owerri Road",
    queryTerms: ["Aba Owerri road", "Aba Owerri expressway"]
  },
  
  // Northern routes
  "kaduna_niger": {
    id: "kaduna-minna",
    name: "Kaduna - Minna Road",
    queryTerms: ["Kaduna Minna road"]
  },
  "fct_niger": {
    id: "abuja-minna",
    name: "Abuja - Minna Road",
    queryTerms: ["Abuja Minna road", "Suleja Minna"]
  },
  "fct_nasarawa": {
    id: "abuja-lafia",
    name: "Abuja - Lafia Road",
    queryTerms: ["Abuja Lafia road", "Keffi road"]
  },
  "benue_nasarawa": {
    id: "lafia-makurdi",
    name: "Lafia - Makurdi Road",
    queryTerms: ["Lafia Makurdi road"]
  },
  
  // Jos connections
  "kaduna_plateau": {
    id: "kaduna-jos",
    name: "Kaduna - Jos Road",
    queryTerms: ["Kaduna Jos road", "Kafanchan Jos"]
  },
  "bauchi_plateau": {
    id: "jos-bauchi",
    name: "Jos - Bauchi Road",
    queryTerms: ["Jos Bauchi road"]
  },
  
  // Calabar route
  "akwa-ibom_cross-river": {
    id: "uyo-calabar",
    name: "Uyo - Calabar Road",
    queryTerms: ["Uyo Calabar road"]
  },
  "akwa-ibom_rivers": {
    id: "ph-uyo",
    name: "Port Harcourt - Uyo Road",
    queryTerms: ["Port Harcourt Uyo road", "PH Uyo"]
  },
}

// Get road info for a state pair
export function getRoadForStatePair(state1: string, state2: string): RoadInfo | null {
  // Normalize state IDs
  const s1 = state1.toLowerCase().replace(/\s+/g, '-')
  const s2 = state2.toLowerCase().replace(/\s+/g, '-')
  
  // Create sorted key
  const key = [s1, s2].sort().join('_')
  
  return STATE_PAIR_TO_ROAD[key] || null
}

// Get all roads for a route (array of state IDs)
export function getRoadsForRoute(stateIds: string[]): RoadInfo[] {
  const roads: RoadInfo[] = []
  const seenRoadIds = new Set<string>()
  
  for (let i = 0; i < stateIds.length - 1; i++) {
    const road = getRoadForStatePair(stateIds[i], stateIds[i + 1])
    
    if (road && !seenRoadIds.has(road.id)) {
      roads.push(road)
      seenRoadIds.add(road.id)
    }
  }
  
  return roads
}

// Get generic query for unknown state pair
export function getGenericRoadQuery(state1: string, state2: string): string {
  return `${state1} ${state2} road highway`
}



