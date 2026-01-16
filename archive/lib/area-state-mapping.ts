// Maps areas to their parent state and optional zone

export interface AreaHierarchy {
  zone?: string
  state: string
}

export const AREA_TO_STATE: Record<string, AreaHierarchy> = {
  // Lagos - Island
  "lekki": { zone: "Lagos Island", state: "Lagos" },
  "victoria-island": { zone: "Lagos Island", state: "Lagos" },
  "vi": { zone: "Lagos Island", state: "Lagos" },
  "ikoyi": { zone: "Lagos Island", state: "Lagos" },
  "lagos-island": { zone: "Lagos Island", state: "Lagos" },
  "ajah": { zone: "Lekki-Ajah", state: "Lagos" },
  "sangotedo": { zone: "Lekki-Ajah", state: "Lagos" },
  
  // Lagos - Mainland
  "ikeja": { zone: "Lagos Mainland", state: "Lagos" },
  "yaba": { zone: "Lagos Mainland", state: "Lagos" },
  "surulere": { zone: "Lagos Mainland", state: "Lagos" },
  "maryland": { zone: "Lagos Mainland", state: "Lagos" },
  "ojodu": { zone: "Lagos Mainland", state: "Lagos" },
  "berger": { zone: "Lagos Mainland", state: "Lagos" },
  "ogba": { zone: "Lagos Mainland", state: "Lagos" },
  "gbagada": { zone: "Lagos Mainland", state: "Lagos" },
  "anthony": { zone: "Lagos Mainland", state: "Lagos" },
  "lagos-mainland": { zone: "Lagos Mainland", state: "Lagos" },
  
  // Lagos - Other areas
  "mushin": { zone: "Mushin-Oshodi", state: "Lagos" },
  "oshodi": { zone: "Mushin-Oshodi", state: "Lagos" },
  "isolo": { zone: "Mushin-Oshodi", state: "Lagos" },
  "ikorodu": { zone: "Ikorodu", state: "Lagos" },
  "epe": { zone: "Epe", state: "Lagos" },
  "badagry": { zone: "Badagry", state: "Lagos" },
  "apapa": { zone: "Apapa", state: "Lagos" },
  "festac": { zone: "Festac-Amuwo", state: "Lagos" },
  "amuwo-odofin": { zone: "Festac-Amuwo", state: "Lagos" },
  "agege": { zone: "Agege-Ifako", state: "Lagos" },
  "ifako": { zone: "Agege-Ifako", state: "Lagos" },
  "alimosho": { zone: "Alimosho", state: "Lagos" },
  "egbeda": { zone: "Alimosho", state: "Lagos" },
  "idimu": { zone: "Alimosho", state: "Lagos" },
  
  // FCT Abuja
  "abuja": { state: "FCT Abuja" },
  "wuse": { zone: "Abuja Central", state: "FCT Abuja" },
  "wuse-2": { zone: "Abuja Central", state: "FCT Abuja" },
  "garki": { zone: "Abuja Central", state: "FCT Abuja" },
  "maitama": { zone: "Abuja Central", state: "FCT Abuja" },
  "asokoro": { zone: "Abuja Central", state: "FCT Abuja" },
  "central-area": { zone: "Abuja Central", state: "FCT Abuja" },
  "gwarinpa": { zone: "Abuja North", state: "FCT Abuja" },
  "jabi": { zone: "Abuja North", state: "FCT Abuja" },
  "utako": { zone: "Abuja North", state: "FCT Abuja" },
  "wuye": { zone: "Abuja North", state: "FCT Abuja" },
  "lifecamp": { zone: "Abuja North", state: "FCT Abuja" },
  "kubwa": { zone: "Kubwa", state: "FCT Abuja" },
  "bwari": { zone: "Bwari", state: "FCT Abuja" },
  "nyanya": { zone: "Nyanya-Karu", state: "FCT Abuja" },
  "karu": { zone: "Nyanya-Karu", state: "FCT Abuja" },
  "lugbe": { zone: "Lugbe", state: "FCT Abuja" },
  
  // Kaduna
  "kaduna": { state: "Kaduna" },
  "kaduna-north": { zone: "Kaduna City", state: "Kaduna" },
  "kaduna-south": { zone: "Kaduna City", state: "Kaduna" },
  "zaria": { zone: "Zaria", state: "Kaduna" },
  "kafanchan": { zone: "Kafanchan", state: "Kaduna" },
  
  // Kano
  "kano": { state: "Kano" },
  "kano-municipal": { zone: "Kano City", state: "Kano" },
  
  // Rivers
  "port-harcourt": { state: "Rivers" },
  "ph": { state: "Rivers" },
  "rivers": { state: "Rivers" },
  "obio-akpor": { zone: "Port Harcourt", state: "Rivers" },
  "trans-amadi": { zone: "Port Harcourt", state: "Rivers" },
  "gra-ph": { zone: "Port Harcourt", state: "Rivers" },
  
  // Oyo
  "ibadan": { state: "Oyo" },
  "ibadan-north": { zone: "Ibadan", state: "Oyo" },
  "ibadan-south": { zone: "Ibadan", state: "Oyo" },
  "bodija": { zone: "Ibadan", state: "Oyo" },
  "challenge": { zone: "Ibadan", state: "Oyo" },
  "oyo": { state: "Oyo" },
  
  // Edo
  "benin": { state: "Edo" },
  "benin-city": { state: "Edo" },
  "edo": { state: "Edo" },
  "gra-benin": { zone: "Benin City", state: "Edo" },
  
  // Delta
  "warri": { state: "Delta" },
  "asaba": { state: "Delta" },
  "delta": { state: "Delta" },
  "effurun": { zone: "Warri", state: "Delta" },
  
  // Enugu
  "enugu": { state: "Enugu" },
  "nsukka": { zone: "Nsukka", state: "Enugu" },
  "independence-layout": { zone: "Enugu", state: "Enugu" },
  "gra-enugu": { zone: "Enugu", state: "Enugu" },
  
  // Anambra
  "onitsha": { state: "Anambra" },
  "awka": { state: "Anambra" },
  "nnewi": { zone: "Nnewi", state: "Anambra" },
  
  // Ogun
  "abeokuta": { state: "Ogun" },
  "ota": { zone: "Ota-Sango", state: "Ogun" },
  "sango-ota": { zone: "Ota-Sango", state: "Ogun" },
  "ijebu-ode": { zone: "Ijebu", state: "Ogun" },
  
  // Ondo
  "akure": { state: "Ondo" },
  "ondo": { state: "Ondo" },
  
  // Kwara
  "ilorin": { state: "Kwara" },
  
  // Kogi
  "lokoja": { state: "Kogi" },
  
  // Plateau
  "jos": { state: "Plateau" },
  "jos-north": { zone: "Jos", state: "Plateau" },
  "jos-south": { zone: "Jos", state: "Plateau" },
  
  // Borno
  "maiduguri": { state: "Borno" },
  
  // Niger
  "minna": { state: "Niger" },
  
  // Nasarawa
  "lafia": { state: "Nasarawa" },
  
  // Benue
  "makurdi": { state: "Benue" },
  
  // Cross River
  "calabar": { state: "Cross River" },
  
  // Akwa Ibom
  "uyo": { state: "Akwa Ibom" },
  
  // Imo
  "owerri": { state: "Imo" },
  
  // Abia
  "aba": { state: "Abia" },
  "umuahia": { state: "Abia" },
  
  // Bayelsa
  "yenagoa": { state: "Bayelsa" },
  
  // Ekiti
  "ado-ekiti": { state: "Ekiti" },
  
  // Osun
  "osogbo": { state: "Osun" },
  "ife": { zone: "Ile-Ife", state: "Osun" },
  "ile-ife": { zone: "Ile-Ife", state: "Osun" },
}

// Get state hierarchy from location ID
export function getAreaHierarchy(locationId: string): AreaHierarchy | null {
  const normalized = locationId.toLowerCase().trim().replace(/\s+/g, '-')
  
  // Direct match
  if (AREA_TO_STATE[normalized]) {
    return AREA_TO_STATE[normalized]
  }
  
  // Try without dashes
  const noDashes = normalized.replace(/-/g, '')
  for (const [key, value] of Object.entries(AREA_TO_STATE)) {
    if (key.replace(/-/g, '') === noDashes) {
      return value
    }
  }
  
  return null
}

// Get display name for state
export function getStateDisplayName(stateId: string): string {
  const stateNames: Record<string, string> = {
    "lagos": "Lagos",
    "fct": "FCT Abuja",
    "fct-abuja": "FCT Abuja",
    "kaduna": "Kaduna",
    "kano": "Kano",
    "rivers": "Rivers",
    "oyo": "Oyo",
    "edo": "Edo",
    "delta": "Delta",
    "enugu": "Enugu",
    "anambra": "Anambra",
    "ogun": "Ogun",
    "ondo": "Ondo",
    "kwara": "Kwara",
    "kogi": "Kogi",
    "plateau": "Plateau",
    "borno": "Borno",
    "niger": "Niger",
    "nasarawa": "Nasarawa",
    "benue": "Benue",
    "cross-river": "Cross River",
    "akwa-ibom": "Akwa Ibom",
    "imo": "Imo",
    "abia": "Abia",
    "bayelsa": "Bayelsa",
    "ekiti": "Ekiti",
    "osun": "Osun",
    "zamfara": "Zamfara",
    "katsina": "Katsina",
    "sokoto": "Sokoto",
    "kebbi": "Kebbi",
    "jigawa": "Jigawa",
    "bauchi": "Bauchi",
    "gombe": "Gombe",
    "yobe": "Yobe",
    "adamawa": "Adamawa",
    "taraba": "Taraba",
    "ebonyi": "Ebonyi",
  }
  
  return stateNames[stateId.toLowerCase()] || stateId
}



