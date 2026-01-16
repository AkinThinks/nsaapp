// Location aliases and variations for enhanced GDELT query coverage
// Helps capture incidents reported with different naming conventions

export interface LocationAliases {
  primary: string
  aliases: string[]
  lga?: string  // Local Government Area
  variations?: string[]  // Common spelling/format variations
}

/**
 * Comprehensive location aliases mapping
 * Covers major areas, common variations, and LGA names
 */
export const LOCATION_ALIASES: Record<string, LocationAliases> = {
  // Lagos areas
  "lekki": {
    primary: "lekki",
    aliases: ["lekki peninsula", "lekki phase 1", "lekki phase 2", "lekki toll gate", "lekki-ajah", "lekki ajah"],
    lga: "Eti-Osa",
    variations: ["lekki", "lekki peninsula"]
  },
  "victoria-island": {
    primary: "victoria island",
    aliases: ["vi", "v.i", "victoria-island", "v.i lagos"],
    lga: "Eti-Osa",
    variations: ["victoria island", "vi"]
  },
  "ikoyi": {
    primary: "ikoyi",
    aliases: ["ikoyi lagos", "ikoyi island"],
    lga: "Lagos Island",
    variations: ["ikoyi"]
  },
  "ajah": {
    primary: "ajah",
    aliases: ["ajah lagos", "ajah lekki"],
    lga: "Eti-Osa",
    variations: ["ajah"]
  },
  "ikeja": {
    primary: "ikeja",
    aliases: ["ikeja lagos", "ikeja airport", "murtala muhammed airport"],
    lga: "Ikeja",
    variations: ["ikeja"]
  },
  "yaba": {
    primary: "yaba",
    aliases: ["yaba lagos", "yaba mainland"],
    lga: "Lagos Mainland",
    variations: ["yaba"]
  },
  "surulere": {
    primary: "surulere",
    aliases: ["surulere lagos", "surulere mainland"],
    lga: "Surulere",
    variations: ["surulere"]
  },
  "ikorodu": {
    primary: "ikorodu",
    aliases: ["ikorodu lagos", "ikorodu town"],
    lga: "Ikorodu",
    variations: ["ikorodu"]
  },
  "badagry": {
    primary: "badagry",
    aliases: ["badagry lagos", "badagry town"],
    lga: "Badagry",
    variations: ["badagry"]
  },
  "apapa": {
    primary: "apapa",
    aliases: ["apapa lagos", "apapa port", "apapa wharf"],
    lga: "Apapa",
    variations: ["apapa"]
  },
  "festac": {
    primary: "festac",
    aliases: ["festac town", "festac lagos", "festac amuwo"],
    lga: "Amuwo-Odofin",
    variations: ["festac", "festac town"]
  },
  "amuwo-odofin": {
    primary: "amuwo odofin",
    aliases: ["amuwo-odofin", "amuwo odofin", "amuwo"],
    lga: "Amuwo-Odofin",
    variations: ["amuwo odofin"]
  },
  "agege": {
    primary: "agege",
    aliases: ["agege lagos", "agege town"],
    lga: "Agege",
    variations: ["agege"]
  },
  "mushin": {
    primary: "mushin",
    aliases: ["mushin lagos", "mushin town"],
    lga: "Mushin",
    variations: ["mushin"]
  },
  "oshodi": {
    primary: "oshodi",
    aliases: ["oshodi lagos", "oshodi isolo"],
    lga: "Oshodi-Isolo",
    variations: ["oshodi"]
  },
  
  // FCT Abuja
  "abuja": {
    primary: "abuja",
    aliases: ["fct", "federal capital territory", "abuja city", "fct abuja"],
    lga: "Abuja Municipal",
    variations: ["abuja", "fct"]
  },
  "wuse": {
    primary: "wuse",
    aliases: ["wuse zone", "wuse 2", "wuse abuja"],
    lga: "Abuja Municipal",
    variations: ["wuse"]
  },
  "garki": {
    primary: "garki",
    aliases: ["garki abuja", "garki area"],
    lga: "Abuja Municipal",
    variations: ["garki"]
  },
  "maitama": {
    primary: "maitama",
    aliases: ["maitama abuja", "maitama district"],
    lga: "Abuja Municipal",
    variations: ["maitama"]
  },
  "asokoro": {
    primary: "asokoro",
    aliases: ["asokoro abuja", "asokoro district"],
    lga: "Abuja Municipal",
    variations: ["asokoro"]
  },
  "gwarinpa": {
    primary: "gwarinpa",
    aliases: ["gwarinpa abuja", "gwarinpa estate"],
    lga: "Bwari",
    variations: ["gwarinpa"]
  },
  "kubwa": {
    primary: "kubwa",
    aliases: ["kubwa abuja", "kubwa town"],
    lga: "Bwari",
    variations: ["kubwa"]
  },
  "nyanya": {
    primary: "nyanya",
    aliases: ["nyanya abuja", "nyanya karu"],
    lga: "Abuja Municipal",
    variations: ["nyanya"]
  },
  "karu": {
    primary: "karu",
    aliases: ["karu abuja", "karu nyanya"],
    lga: "Abuja Municipal",
    variations: ["karu"]
  },
  
  // Kaduna
  "kaduna": {
    primary: "kaduna",
    aliases: ["kaduna state", "kaduna city", "kaduna town"],
    lga: "Kaduna North",
    variations: ["kaduna"]
  },
  "zaria": {
    primary: "zaria",
    aliases: ["zaria kaduna", "zaria city", "zaria town"],
    lga: "Zaria",
    variations: ["zaria"]
  },
  "birnin-gwari": {
    primary: "birnin gwari",
    aliases: ["birnin-gwari", "birnin gwari", "birnin gwari kaduna"],
    lga: "Birnin-Gwari",
    variations: ["birnin gwari"]
  },
  
  // Kano
  "kano": {
    primary: "kano",
    aliases: ["kano state", "kano city", "kano town"],
    lga: "Kano Municipal",
    variations: ["kano"]
  },
  
  // Rivers
  "port-harcourt": {
    primary: "port harcourt",
    aliases: ["ph", "p-h", "port-harcourt", "port harcourt city", "ph city"],
    lga: "Port Harcourt",
    variations: ["port harcourt", "ph", "port-harcourt"]
  },
  "rivers": {
    primary: "rivers",
    aliases: ["rivers state", "rivers nigeria"],
    variations: ["rivers"]
  },
  
  // Oyo
  "ibadan": {
    primary: "ibadan",
    aliases: ["ibadan oyo", "ibadan city", "ibadan town"],
    lga: "Ibadan North",
    variations: ["ibadan"]
  },
  "oyo": {
    primary: "oyo",
    aliases: ["oyo state", "oyo town"],
    variations: ["oyo"]
  },
  
  // Edo
  "benin": {
    primary: "benin",
    aliases: ["benin city", "benin edo", "benin town"],
    lga: "Oredo",
    variations: ["benin", "benin city"]
  },
  "edo": {
    primary: "edo",
    aliases: ["edo state", "edo nigeria"],
    variations: ["edo"]
  },
  
  // Delta
  "warri": {
    primary: "warri",
    aliases: ["warri delta", "warri city", "warri town"],
    lga: "Warri South",
    variations: ["warri"]
  },
  "asaba": {
    primary: "asaba",
    aliases: ["asaba delta", "asaba capital"],
    lga: "Oshimili South",
    variations: ["asaba"]
  },
  "delta": {
    primary: "delta",
    aliases: ["delta state", "delta nigeria"],
    variations: ["delta"]
  },
  
  // Enugu
  "enugu": {
    primary: "enugu",
    aliases: ["enugu state", "enugu city", "enugu town"],
    lga: "Enugu North",
    variations: ["enugu"]
  },
  "nsukka": {
    primary: "nsukka",
    aliases: ["nsukka enugu", "nsukka town", "unn nsukka"],
    lga: "Nsukka",
    variations: ["nsukka"]
  },
  
  // Anambra
  "onitsha": {
    primary: "onitsha",
    aliases: ["onitsha anambra", "onitsha city", "onitsha town"],
    lga: "Onitsha North",
    variations: ["onitsha"]
  },
  "awka": {
    primary: "awka",
    aliases: ["awka anambra", "awka capital", "awka town"],
    lga: "Awka South",
    variations: ["awka"]
  },
  "anambra": {
    primary: "anambra",
    aliases: ["anambra state", "anambra nigeria"],
    variations: ["anambra"]
  },
  
  // Ogun
  "abeokuta": {
    primary: "abeokuta",
    aliases: ["abeokuta ogun", "abeokuta capital", "abeokuta town"],
    lga: "Abeokuta North",
    variations: ["abeokuta"]
  },
  "ota": {
    primary: "ota",
    aliases: ["ota ogun", "sango ota", "sango-ota"],
    lga: "Ado-Odo/Ota",
    variations: ["ota", "sango ota"]
  },
  "ogun": {
    primary: "ogun",
    aliases: ["ogun state", "ogun nigeria"],
    variations: ["ogun"]
  },
  
  // Ondo
  "akure": {
    primary: "akure",
    aliases: ["akure ondo", "akure capital", "akure town"],
    lga: "Akure South",
    variations: ["akure"]
  },
  "ondo": {
    primary: "ondo",
    aliases: ["ondo state", "ondo nigeria"],
    variations: ["ondo"]
  },
  
  // Kwara
  "ilorin": {
    primary: "ilorin",
    aliases: ["ilorin kwara", "ilorin capital", "ilorin town"],
    lga: "Ilorin South",
    variations: ["ilorin"]
  },
  "kwara": {
    primary: "kwara",
    aliases: ["kwara state", "kwara nigeria"],
    variations: ["kwara"]
  },
  
  // Kogi
  "lokoja": {
    primary: "lokoja",
    aliases: ["lokoja kogi", "lokoja capital", "lokoja town"],
    lga: "Lokoja",
    variations: ["lokoja"]
  },
  "kogi": {
    primary: "kogi",
    aliases: ["kogi state", "kogi nigeria"],
    variations: ["kogi"]
  },
  
  // Plateau
  "jos": {
    primary: "jos",
    aliases: ["jos plateau", "jos city", "jos town"],
    lga: "Jos North",
    variations: ["jos"]
  },
  "plateau": {
    primary: "plateau",
    aliases: ["plateau state", "plateau nigeria"],
    variations: ["plateau"]
  },
  
  // Borno
  "maiduguri": {
    primary: "maiduguri",
    aliases: ["maiduguri borno", "maiduguri capital", "maiduguri town"],
    lga: "Maiduguri",
    variations: ["maiduguri"]
  },
  "borno": {
    primary: "borno",
    aliases: ["borno state", "borno nigeria"],
    variations: ["borno"]
  },
  
  // Niger
  "minna": {
    primary: "minna",
    aliases: ["minna niger", "minna capital", "minna town"],
    lga: "Chanchaga",
    variations: ["minna"]
  },
  "niger": {
    primary: "niger",
    aliases: ["niger state", "niger nigeria"],
    variations: ["niger"]
  },
  
  // Nasarawa
  "lafia": {
    primary: "lafia",
    aliases: ["lafia nasarawa", "lafia capital", "lafia town"],
    lga: "Lafia",
    variations: ["lafia"]
  },
  "nasarawa": {
    primary: "nasarawa",
    aliases: ["nasarawa state", "nasarawa nigeria"],
    variations: ["nasarawa"]
  },
  
  // Benue
  "makurdi": {
    primary: "makurdi",
    aliases: ["makurdi benue", "makurdi capital", "makurdi town"],
    lga: "Makurdi",
    variations: ["makurdi"]
  },
  "benue": {
    primary: "benue",
    aliases: ["benue state", "benue nigeria"],
    variations: ["benue"]
  },
  
  // Cross River
  "calabar": {
    primary: "calabar",
    aliases: ["calabar cross river", "calabar capital", "calabar town"],
    lga: "Calabar Municipal",
    variations: ["calabar"]
  },
  "cross-river": {
    primary: "cross river",
    aliases: ["cross-river", "cross river state"],
    variations: ["cross river"]
  },
  
  // Akwa Ibom
  "uyo": {
    primary: "uyo",
    aliases: ["uyo akwa ibom", "uyo capital", "uyo town"],
    lga: "Uyo",
    variations: ["uyo"]
  },
  "akwa-ibom": {
    primary: "akwa ibom",
    aliases: ["akwa-ibom", "akwa ibom state"],
    variations: ["akwa ibom"]
  },
  
  // Imo
  "owerri": {
    primary: "owerri",
    aliases: ["owerri imo", "owerri capital", "owerri town"],
    lga: "Owerri Municipal",
    variations: ["owerri"]
  },
  "imo": {
    primary: "imo",
    aliases: ["imo state", "imo nigeria"],
    variations: ["imo"]
  },
  
  // Abia
  "aba": {
    primary: "aba",
    aliases: ["aba abia", "aba city", "aba town"],
    lga: "Aba North",
    variations: ["aba"]
  },
  "umuahia": {
    primary: "umuahia",
    aliases: ["umuahia abia", "umuahia capital", "umuahia town"],
    lga: "Umuahia North",
    variations: ["umuahia"]
  },
  "abia": {
    primary: "abia",
    aliases: ["abia state", "abia nigeria"],
    variations: ["abia"]
  },
  
  // Bayelsa
  "yenagoa": {
    primary: "yenagoa",
    aliases: ["yenagoa bayelsa", "yenagoa capital", "yenagoa town"],
    lga: "Yenagoa",
    variations: ["yenagoa"]
  },
  "bayelsa": {
    primary: "bayelsa",
    aliases: ["bayelsa state", "bayelsa nigeria"],
    variations: ["bayelsa"]
  },
  
  // Ekiti
  "ado-ekiti": {
    primary: "ado ekiti",
    aliases: ["ado-ekiti", "ado ekiti", "ekiti capital"],
    lga: "Ado-Ekiti",
    variations: ["ado ekiti"]
  },
  "ekiti": {
    primary: "ekiti",
    aliases: ["ekiti state", "ekiti nigeria"],
    variations: ["ekiti"]
  },
  
  // Osun
  "osogbo": {
    primary: "osogbo",
    aliases: ["osogbo osun", "osogbo capital", "osogbo town"],
    lga: "Osogbo",
    variations: ["osogbo"]
  },
  "osun": {
    primary: "osun",
    aliases: ["osun state", "osun nigeria"],
    variations: ["osun"]
  },
  
  // Zamfara
  "zamfara": {
    primary: "zamfara",
    aliases: ["zamfara state", "zamfara nigeria"],
    variations: ["zamfara"]
  },
  "gusau": {
    primary: "gusau",
    aliases: ["gusau zamfara", "gusau capital", "gusau town"],
    lga: "Gusau",
    variations: ["gusau"]
  },
  
  // Katsina
  "katsina": {
    primary: "katsina",
    aliases: ["katsina state", "katsina city", "katsina town"],
    lga: "Katsina",
    variations: ["katsina"]
  },
  
  // Sokoto
  "sokoto": {
    primary: "sokoto",
    aliases: ["sokoto state", "sokoto city", "sokoto town"],
    lga: "Sokoto North",
    variations: ["sokoto"]
  },
  
  // Kebbi
  "kebbi": {
    primary: "kebbi",
    aliases: ["kebbi state", "kebbi nigeria"],
    variations: ["kebbi"]
  },
  "birnin-kebbi": {
    primary: "birnin kebbi",
    aliases: ["birnin-kebbi", "birnin kebbi", "kebbi capital"],
    lga: "Birnin-Kebbi",
    variations: ["birnin kebbi"]
  },
  
  // Jigawa
  "jigawa": {
    primary: "jigawa",
    aliases: ["jigawa state", "jigawa nigeria"],
    variations: ["jigawa"]
  },
  "dutse": {
    primary: "dutse",
    aliases: ["dutse jigawa", "dutse capital", "dutse town"],
    lga: "Dutse",
    variations: ["dutse"]
  },
  
  // Bauchi
  "bauchi": {
    primary: "bauchi",
    aliases: ["bauchi state", "bauchi city", "bauchi town"],
    lga: "Bauchi",
    variations: ["bauchi"]
  },
  
  // Gombe
  "gombe": {
    primary: "gombe",
    aliases: ["gombe state", "gombe city", "gombe town"],
    lga: "Gombe",
    variations: ["gombe"]
  },
  
  // Yobe
  "yobe": {
    primary: "yobe",
    aliases: ["yobe state", "yobe nigeria"],
    variations: ["yobe"]
  },
  "damaturu": {
    primary: "damaturu",
    aliases: ["damaturu yobe", "damaturu capital", "damaturu town"],
    lga: "Damaturu",
    variations: ["damaturu"]
  },
  
  // Adamawa
  "adamawa": {
    primary: "adamawa",
    aliases: ["adamawa state", "adamawa nigeria"],
    variations: ["adamawa"]
  },
  "yola": {
    primary: "yola",
    aliases: ["yola adamawa", "yola capital", "yola town"],
    lga: "Yola North",
    variations: ["yola"]
  },
  
  // Taraba
  "taraba": {
    primary: "taraba",
    aliases: ["taraba state", "taraba nigeria"],
    variations: ["taraba"]
  },
  "jalingo": {
    primary: "jalingo",
    aliases: ["jalingo taraba", "jalingo capital", "jalingo town"],
    lga: "Jalingo",
    variations: ["jalingo"]
  },
  
  // Ebonyi
  "ebonyi": {
    primary: "ebonyi",
    aliases: ["ebonyi state", "ebonyi nigeria"],
    variations: ["ebonyi"]
  },
  "abakaliki": {
    primary: "abakaliki",
    aliases: ["abakaliki ebonyi", "abakaliki capital", "abakaliki town"],
    lga: "Abakaliki",
    variations: ["abakaliki"]
  },
}

/**
 * Get all query terms for a location (primary + aliases + variations)
 */
export function getLocationQueryTerms(locationId: string): string[] {
  const normalized = locationId.toLowerCase().trim().replace(/\s+/g, '-')
  const alias = LOCATION_ALIASES[normalized]
  
  if (!alias) {
    // Return location as-is if no alias found
    return [locationId]
  }
  
  // Combine primary, aliases, and variations
  const terms = new Set<string>()
  terms.add(alias.primary)
  alias.aliases.forEach(a => terms.add(a))
  if (alias.variations) {
    alias.variations.forEach(v => terms.add(v))
  }
  
  return Array.from(terms)
}

/**
 * Get LGA name for a location (if available)
 */
export function getLGAForLocation(locationId: string): string | null {
  const normalized = locationId.toLowerCase().trim().replace(/\s+/g, '-')
  const alias = LOCATION_ALIASES[normalized]
  return alias?.lga || null
}

/**
 * Get all aliases for a location
 */
export function getLocationAliases(locationId: string): string[] {
  const normalized = locationId.toLowerCase().trim().replace(/\s+/g, '-')
  const alias = LOCATION_ALIASES[normalized]
  return alias ? [alias.primary, ...alias.aliases] : [locationId]
}



