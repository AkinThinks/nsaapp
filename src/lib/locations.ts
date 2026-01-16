import type { NigerianLocation, AreaSearchResult } from '@/types'

export const NIGERIAN_LOCATIONS: NigerianLocation[] = [
  // ============================================
  // LAGOS
  // ============================================
  // Lekki Axis
  {
    slug: 'lekki-phase-1',
    name: 'Lekki Phase 1',
    state: 'Lagos',
    aliases: ['lekki 1', 'phase 1', 'lekki phase one'],
    nearby: ['lekki-phase-2', 'victoria-island', 'ikate', 'jakande', 'oniru'],
    popular: true,
  },
  {
    slug: 'lekki-phase-2',
    name: 'Lekki Phase 2',
    state: 'Lagos',
    aliases: ['lekki 2', 'phase 2'],
    nearby: ['lekki-phase-1', 'ajah', 'chevron', 'jakande'],
  },
  {
    slug: 'ajah',
    name: 'Ajah',
    state: 'Lagos',
    aliases: ['aja'],
    nearby: ['lekki-phase-2', 'sangotedo', 'abraham-adesanya', 'badore', 'langbasa'],
    popular: true,
  },
  {
    slug: 'victoria-island',
    name: 'Victoria Island',
    state: 'Lagos',
    aliases: ['vi', 'v.i.', 'v.i'],
    nearby: ['lekki-phase-1', 'ikoyi', 'lagos-island', 'oniru', 'eko-atlantic'],
    popular: true,
  },
  {
    slug: 'ikoyi',
    name: 'Ikoyi',
    state: 'Lagos',
    aliases: [],
    nearby: ['victoria-island', 'lagos-island', 'obalende', 'banana-island'],
    popular: true,
  },
  {
    slug: 'ikate',
    name: 'Ikate',
    state: 'Lagos',
    aliases: ['ikate elegushi', 'elegushi'],
    nearby: ['lekki-phase-1', 'oniru', 'victoria-island', 'chisco'],
  },
  {
    slug: 'jakande',
    name: 'Jakande',
    state: 'Lagos',
    aliases: ['jakande lekki'],
    nearby: ['lekki-phase-1', 'lekki-phase-2', 'osapa-london', 'agungi'],
  },
  {
    slug: 'chevron',
    name: 'Chevron',
    state: 'Lagos',
    aliases: ['chevron drive', 'chevron lekki'],
    nearby: ['lekki-phase-2', 'ajah', 'igbo-efon'],
  },
  {
    slug: 'sangotedo',
    name: 'Sangotedo',
    state: 'Lagos',
    aliases: [],
    nearby: ['ajah', 'abraham-adesanya', 'shapati', 'ogombo'],
  },

  // Island
  {
    slug: 'lagos-island',
    name: 'Lagos Island',
    state: 'Lagos',
    aliases: ['island', 'marina'],
    nearby: ['victoria-island', 'ikoyi', 'obalende', 'cms'],
  },
  {
    slug: 'oniru',
    name: 'Oniru',
    state: 'Lagos',
    aliases: ['oniru estate', 'oniru vi'],
    nearby: ['victoria-island', 'lekki-phase-1', 'eko-atlantic'],
  },

  // Mainland
  {
    slug: 'ikeja',
    name: 'Ikeja',
    state: 'Lagos',
    aliases: ['ikeja gra', 'alausa'],
    nearby: ['maryland', 'ogba', 'opebi', 'oregun', 'agidingbi'],
    popular: true,
  },
  {
    slug: 'yaba',
    name: 'Yaba',
    state: 'Lagos',
    aliases: [],
    nearby: ['surulere', 'ebute-metta', 'akoka', 'unilag'],
    popular: true,
  },
  {
    slug: 'surulere',
    name: 'Surulere',
    state: 'Lagos',
    aliases: [],
    nearby: ['yaba', 'mushin', 'iponri', 'ojuelegba'],
    popular: true,
  },
  {
    slug: 'maryland',
    name: 'Maryland',
    state: 'Lagos',
    aliases: [],
    nearby: ['ikeja', 'anthony', 'gbagada', 'ojota'],
  },
  {
    slug: 'gbagada',
    name: 'Gbagada',
    state: 'Lagos',
    aliases: [],
    nearby: ['maryland', 'anthony', 'oworonshoki', 'bariga'],
  },
  {
    slug: 'ikorodu',
    name: 'Ikorodu',
    state: 'Lagos',
    aliases: [],
    nearby: ['agric', 'owutu', 'ijede', 'imota'],
  },
  {
    slug: 'festac',
    name: 'Festac',
    state: 'Lagos',
    aliases: ['festac town'],
    nearby: ['amuwo-odofin', 'satellite', 'apapa', 'ojo'],
  },
  {
    slug: 'apapa',
    name: 'Apapa',
    state: 'Lagos',
    aliases: [],
    nearby: ['festac', 'ijora', 'tin-can', 'kirikiri'],
  },
  {
    slug: 'oshodi',
    name: 'Oshodi',
    state: 'Lagos',
    aliases: [],
    nearby: ['isolo', 'mushin', 'mafoluku', 'shogunle'],
  },
  {
    slug: 'mushin',
    name: 'Mushin',
    state: 'Lagos',
    aliases: [],
    nearby: ['oshodi', 'surulere', 'palmgrove', 'fadeyi'],
  },
  {
    slug: 'alimosho',
    name: 'Alimosho',
    state: 'Lagos',
    aliases: [],
    nearby: ['egbeda', 'idimu', 'iyana-ipaja', 'ikotun'],
  },
  {
    slug: 'berger',
    name: 'Berger',
    state: 'Lagos',
    aliases: ['ojodu berger'],
    nearby: ['ojodu', 'omole', 'magodo', 'isheri'],
  },

  // ============================================
  // FCT ABUJA
  // ============================================
  {
    slug: 'wuse',
    name: 'Wuse',
    state: 'FCT',
    aliases: ['wuse 2', 'wuse zone'],
    nearby: ['garki', 'maitama', 'utako', 'jabi', 'wuse-2'],
    popular: true,
  },
  {
    slug: 'wuse-2',
    name: 'Wuse 2',
    state: 'FCT',
    aliases: ['wuse ii', 'wuse two'],
    nearby: ['wuse', 'maitama', 'utako', 'jabi'],
    popular: true,
  },
  {
    slug: 'garki',
    name: 'Garki',
    state: 'FCT',
    aliases: ['garki area 1', 'garki area 2', 'garki area 3'],
    nearby: ['wuse', 'asokoro', 'central-area', 'gudu'],
    popular: true,
  },
  {
    slug: 'maitama',
    name: 'Maitama',
    state: 'FCT',
    aliases: [],
    nearby: ['wuse', 'asokoro', 'jabi', 'wuse-2'],
    popular: true,
  },
  {
    slug: 'asokoro',
    name: 'Asokoro',
    state: 'FCT',
    aliases: [],
    nearby: ['maitama', 'garki', 'central-area', 'guzape'],
  },
  {
    slug: 'gwarinpa',
    name: 'Gwarinpa',
    state: 'FCT',
    aliases: ['gwarimpa'],
    nearby: ['jabi', 'kado', 'life-camp', 'dawaki'],
    popular: true,
  },
  {
    slug: 'jabi',
    name: 'Jabi',
    state: 'FCT',
    aliases: [],
    nearby: ['utako', 'wuse-2', 'gwarinpa', 'life-camp'],
  },
  {
    slug: 'utako',
    name: 'Utako',
    state: 'FCT',
    aliases: [],
    nearby: ['jabi', 'wuse-2', 'mabushi', 'wuye'],
  },
  {
    slug: 'kubwa',
    name: 'Kubwa',
    state: 'FCT',
    aliases: [],
    nearby: ['bwari', 'dutse', 'dei-dei'],
  },
  {
    slug: 'lugbe',
    name: 'Lugbe',
    state: 'FCT',
    aliases: [],
    nearby: ['airport-road', 'idu', 'kuje'],
  },
  {
    slug: 'nyanya',
    name: 'Nyanya',
    state: 'FCT',
    aliases: [],
    nearby: ['karu', 'mararaba', 'jikwoyi', 'kurudu'],
  },
  {
    slug: 'central-area',
    name: 'Central Area',
    state: 'FCT',
    aliases: ['central business district', 'cbd'],
    nearby: ['garki', 'asokoro', 'wuse'],
  },

  // ============================================
  // RIVERS
  // ============================================
  {
    slug: 'port-harcourt',
    name: 'Port Harcourt',
    state: 'Rivers',
    aliases: ['ph', 'portharcourt'],
    nearby: ['gra-ph', 'd-line', 'trans-amadi', 'rumuokoro'],
    popular: true,
  },
  {
    slug: 'gra-ph',
    name: 'GRA Port Harcourt',
    state: 'Rivers',
    aliases: ['old gra', 'new gra'],
    nearby: ['port-harcourt', 'd-line', 'rumuola'],
  },
  {
    slug: 'trans-amadi',
    name: 'Trans Amadi',
    state: 'Rivers',
    aliases: [],
    nearby: ['port-harcourt', 'rumuokoro', 'eliozu'],
  },

  // ============================================
  // ENUGU
  // ============================================
  {
    slug: 'enugu',
    name: 'Enugu',
    state: 'Enugu',
    aliases: ['enugu city'],
    nearby: ['independence-layout', 'gra-enugu', 'new-haven', 'trans-ekulu'],
    popular: true,
  },
  {
    slug: 'independence-layout',
    name: 'Independence Layout',
    state: 'Enugu',
    aliases: [],
    nearby: ['enugu', 'gra-enugu', 'new-haven'],
  },
  {
    slug: 'nsukka',
    name: 'Nsukka',
    state: 'Enugu',
    aliases: ['unn'],
    nearby: ['obukpa', 'edem', 'ibagwa'],
  },

  // ============================================
  // KADUNA
  // ============================================
  {
    slug: 'kaduna',
    name: 'Kaduna',
    state: 'Kaduna',
    aliases: ['kaduna city'],
    nearby: ['barnawa', 'sabon-tasha', 'kakuri', 'ungwan-rimi'],
    popular: true,
  },
  {
    slug: 'zaria',
    name: 'Zaria',
    state: 'Kaduna',
    aliases: ['abu zaria'],
    nearby: ['samaru', 'sabon-gari-zaria'],
  },

  // ============================================
  // KANO
  // ============================================
  {
    slug: 'kano',
    name: 'Kano',
    state: 'Kano',
    aliases: ['kano city'],
    nearby: ['nasarawa-gra', 'bompai', 'sabon-gari-kano', 'fagge'],
    popular: true,
  },

  // ============================================
  // OYO
  // ============================================
  {
    slug: 'ibadan',
    name: 'Ibadan',
    state: 'Oyo',
    aliases: [],
    nearby: ['bodija', 'uc-ibadan', 'dugbe', 'challenge', 'ring-road'],
    popular: true,
  },
  {
    slug: 'bodija',
    name: 'Bodija',
    state: 'Oyo',
    aliases: [],
    nearby: ['ibadan', 'uc-ibadan', 'agodi', 'secretariat'],
  },

  // ============================================
  // DELTA
  // ============================================
  {
    slug: 'warri',
    name: 'Warri',
    state: 'Delta',
    aliases: [],
    nearby: ['effurun', 'uvwie', 'ekpan'],
    popular: true,
  },
  {
    slug: 'asaba',
    name: 'Asaba',
    state: 'Delta',
    aliases: [],
    nearby: ['okpanam', 'cable-point'],
    popular: true,
  },

  // ============================================
  // EDO
  // ============================================
  {
    slug: 'benin-city',
    name: 'Benin City',
    state: 'Edo',
    aliases: ['benin', 'edo'],
    nearby: ['gra-benin', 'ring-road-benin', 'uselu', 'ugbowo'],
    popular: true,
  },

  // ============================================
  // OGUN
  // ============================================
  {
    slug: 'abeokuta',
    name: 'Abeokuta',
    state: 'Ogun',
    aliases: [],
    nearby: ['oke-ilewo', 'ibara', 'kuto'],
    popular: true,
  },

  // ============================================
  // ANAMBRA
  // ============================================
  {
    slug: 'onitsha',
    name: 'Onitsha',
    state: 'Anambra',
    aliases: [],
    nearby: ['fegge', 'inland-town', 'woliwo'],
    popular: true,
  },
  {
    slug: 'awka',
    name: 'Awka',
    state: 'Anambra',
    aliases: [],
    nearby: ['amawbia', 'enugu-agidi'],
  },

  // ============================================
  // ONDO
  // ============================================
  {
    slug: 'akure',
    name: 'Akure',
    state: 'Ondo',
    aliases: [],
    nearby: ['alagbaka', 'oba-ile'],
    popular: true,
  },

  // ============================================
  // KWARA
  // ============================================
  {
    slug: 'ilorin',
    name: 'Ilorin',
    state: 'Kwara',
    aliases: [],
    nearby: ['gra-ilorin', 'tanke', 'fate'],
    popular: true,
  },

  // ============================================
  // CROSS RIVER
  // ============================================
  {
    slug: 'calabar',
    name: 'Calabar',
    state: 'Cross River',
    aliases: [],
    nearby: ['state-housing', 'ekorinim', 'marian'],
    popular: true,
  },

  // ============================================
  // AKWA IBOM
  // ============================================
  {
    slug: 'uyo',
    name: 'Uyo',
    state: 'Akwa Ibom',
    aliases: [],
    nearby: ['ewet-housing', 'shelter-afrique'],
    popular: true,
  },
]

// ============================================
// SEARCH FUNCTIONS
// ============================================

export function searchLocations(query: string, limit = 10): NigerianLocation[] {
  if (!query || query.length < 2) return []

  const q = query.toLowerCase().trim()

  // Score each location by relevance
  const scored = NIGERIAN_LOCATIONS.map((loc) => {
    let score = 0

    // Exact name match
    if (loc.name.toLowerCase() === q) score += 100
    // Name starts with query
    else if (loc.name.toLowerCase().startsWith(q)) score += 50
    // Name contains query
    else if (loc.name.toLowerCase().includes(q)) score += 25

    // Slug match
    if (loc.slug === q) score += 80
    else if (loc.slug.startsWith(q)) score += 40
    else if (loc.slug.includes(q)) score += 20

    // Alias match
    for (const alias of loc.aliases) {
      if (alias.toLowerCase() === q) score += 70
      else if (alias.toLowerCase().startsWith(q)) score += 35
      else if (alias.toLowerCase().includes(q)) score += 15
    }

    // State match
    if (loc.state.toLowerCase() === q) score += 30
    else if (loc.state.toLowerCase().startsWith(q)) score += 15

    // Boost popular locations
    if (loc.popular) score *= 1.2

    return { location: loc, score }
  })

  // Sort by score and return top results
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.location)
}

export function getLocationBySlug(slug: string): NigerianLocation | undefined {
  return NIGERIAN_LOCATIONS.find((loc) => loc.slug === slug)
}

export function getNearbyLocations(slug: string): NigerianLocation[] {
  const location = getLocationBySlug(slug)
  if (!location) return []

  return location.nearby
    .map((s) => getLocationBySlug(s))
    .filter((loc): loc is NigerianLocation => loc !== undefined)
}

export function getPopularLocations(state?: string): NigerianLocation[] {
  let locations = NIGERIAN_LOCATIONS.filter((loc) => loc.popular)

  if (state) {
    locations = locations.filter(
      (loc) => loc.state.toLowerCase() === state.toLowerCase()
    )
  }

  return locations
}

export function getLocationsByState(state: string): NigerianLocation[] {
  return NIGERIAN_LOCATIONS.filter(
    (loc) => loc.state.toLowerCase() === state.toLowerCase()
  )
}

export function toAreaSearchResult(loc: NigerianLocation): AreaSearchResult {
  return {
    name: loc.name,
    slug: loc.slug,
    state: loc.state,
  }
}
