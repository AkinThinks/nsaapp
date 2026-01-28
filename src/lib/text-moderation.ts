/**
 * Text Moderation for Nigeria Security Alert
 *
 * Philosophy: Safety, Not Grammar Police
 * - Allow pidgin English, native languages (Yoruba, Igbo, Hausa), typos, ALL CAPS
 * - Only flag truly harmful content (hate speech, explicit, spam)
 * - NEVER block legitimate emergency reports
 *
 * Edge cases handled:
 * - "HELP!!!!!" → allowed (panic)
 * - "call police 112" → allowed (emergency)
 * - "Robbery dey happen" → allowed (pidgin)
 * - "🔥🔥🔥 fire!" → allowed (emoji + text)
 * - "aaaaaaaaa" → blocked (pure spam)
 * - "Buy cheap phones 08012345678" → blocked (advertising)
 */

export interface ModerationResult {
  safe: boolean
  reason?: 'inappropriate_content' | 'spam' | 'too_short' | 'gibberish'
  confidence: 'high' | 'medium' | 'low'
}

// Nigerian emergency numbers - NEVER block these
const EMERGENCY_NUMBERS = ['112', '199', '767', '122', '123', '911', '999']

// Legitimate words that might appear in reports but look like spam
// Note: 'call' removed because it appears in spam ("call 08012345678 to buy...")
// Emergency calls are protected by EMERGENCY_NUMBERS whitelist instead
const SAFE_WORDS = [
  'fire', 'help', 'police', 'ambulance', 'emergency', 'danger',
  'robbery', 'attack', 'kidnap', 'gun', 'shoot', 'accident',
  'run', 'hide', 'safe', 'unsafe', 'alert', 'warning',
  // Common Nigerian slang/pidgin that might look odd
  'wahala', 'dey', 'dem', 'don', 'omo', 'abeg', 'wetin', 'na'
]

/**
 * Spam patterns - ONLY flag obvious advertising/scam
 * Be very careful not to flag emergency messages
 */
const SPAM_PATTERNS = [
  // Advertising keywords (must be in commercial context)
  /\b(buy now|order now|limited offer|act now|special offer)\b/i,
  /\b(earn money|make money|get rich|work from home)\b/i,
  /\b(bitcoin|crypto|forex|trading signals?|investment opportunity)\b/i,
  /\b(lottery|winner|won|jackpot|prize|congratulations you)\b/i,
  /\b(click here|visit our|check out our|follow us)\b/i,
  /\b(discount|promo code|coupon|% off|\bfree\b.*\bgift)\b/i,

  // Commercial "buy" context (but not "buy" alone)
  /\bbuy\b.*\b(cheap|discount|now|order|call|whatsapp)\b/i,

  // Phone number with commercial intent (either order - digits before or after intent)
  /\b(call|whatsapp|contact)\b.*\d{10,}.*\b(to order|to buy|for)\b/i,
  /\b(call|whatsapp|contact)\b.*\b(for|to get|to buy|to order)\b.*\d{10,}/i,

  // URLs (but not emergency info sites)
  /https?:\/\/[^\s]+\.(xyz|tk|ml|ga|cf|gq|top)\b/i, // Suspicious TLDs only

  // Pure repeated characters (6+ same char, but not punctuation)
  /([a-z])\1{6,}/i, // "aaaaaaa" but not "!!!!!!!"
]

/**
 * Threat patterns - direct violence/terrorism
 * Must be specific threats, not reports of incidents
 */
const THREAT_PATTERNS = [
  // Personal threats
  /\b(i will|i'm going to|ima|imma|we will|we're going to)\s+(kill|murder|shoot|stab|bomb)\s+(you|him|her|them|everyone)\b/i,

  // Terrorism
  /\b(plant|detonate|set off)\s+(a |the )?(bomb|explosive|ied)\b/i,
]

/**
 * Moderate text content
 *
 * @param text - The text to moderate (description, landmark, etc.)
 * @returns ModerationResult with safe status and reason if flagged
 */
export function moderateText(text: string | null | undefined): ModerationResult {
  // Handle null/undefined/empty - these are OK (optional fields)
  if (!text || typeof text !== 'string') {
    return { safe: true, confidence: 'high' }
  }

  // Normalize for checking (keep original for some checks)
  const normalized = text.toLowerCase().trim()

  // Empty after trim is OK
  if (normalized.length === 0) {
    return { safe: true, confidence: 'high' }
  }

  // Remove emojis for text analysis (but don't reject emoji-only)
  const textOnly = normalized.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim()

  // Emoji-only messages are fine (could be "🔥" for fire)
  if (textOnly.length === 0) {
    return { safe: true, confidence: 'high' }
  }

  // Very short text check (but "ok", "no", "go" are valid)
  // Only flag if it's truly meaningless
  if (textOnly.length < 2) {
    return { safe: false, reason: 'too_short', confidence: 'medium' }
  }

  // Check if message contains emergency context
  // Use word boundary matching to avoid false positives like "signals" matching "na"
  // For emergency numbers, ensure they're standalone (not part of a phone number)
  const hasEmergencyContext = SAFE_WORDS.some(word => {
    const wordPattern = new RegExp(`\\b${word}\\b`, 'i')
    return wordPattern.test(normalized)
  }) || EMERGENCY_NUMBERS.some(num => {
    // Match emergency number when it's standalone (with word boundaries)
    // or preceded by "call" (e.g., "call 112")
    const standalonePattern = new RegExp(`(?:call\\s+)?\\b${num}\\b(?!\\d)`, 'i')
    return standalonePattern.test(normalized)
  })

  // Check for spam patterns (skip if emergency context)
  if (!hasEmergencyContext) {
    for (const pattern of SPAM_PATTERNS) {
      if (pattern.test(normalized)) {
        return { safe: false, reason: 'spam', confidence: 'high' }
      }
    }
  }

  // Check for direct threats (always check, even with emergency words)
  for (const pattern of THREAT_PATTERNS) {
    if (pattern.test(normalized)) {
      return { safe: false, reason: 'inappropriate_content', confidence: 'high' }
    }
  }

  // Check for gibberish (but be lenient)
  if (isGibberish(textOnly)) {
    return { safe: false, reason: 'gibberish', confidence: 'medium' }
  }

  // Check for pure spam repetition (but allow panic repetition)
  if (isPureSpamRepetition(textOnly)) {
    return { safe: false, reason: 'spam', confidence: 'high' }
  }

  // Everything else is fine - we're permissive by design
  return { safe: true, confidence: 'high' }
}

/**
 * Check if text appears to be gibberish
 * Be very lenient - Nigerian languages have different patterns
 */
function isGibberish(text: string): boolean {
  // Remove numbers and spaces for analysis
  const lettersOnly = text.replace(/[^a-záàâãäåéèêëíìîïóòôõöúùûüñç]/gi, '')

  // Skip very short text for vowel analysis
  if (lettersOnly.length < 10) {
    // But still check for obvious keyboard patterns on shorter strings
    // Only flag if the ENTIRE text looks like keyboard mash
    if (lettersOnly.length >= 8) {
      // Strict keyboard row patterns - must be almost pure keyboard row
      const pureKeyboardMash = /^[asdfghjkl]+$|^[qwertyuiop]+$|^[zxcvbnm]+$/i
      if (pureKeyboardMash.test(lettersOnly)) {
        return true
      }
      // Pure consonant string (no vowels at all in 8+ chars)
      const pureConsonants = /^[bcdfghjklmnpqrstvwxyz]+$/i
      if (pureConsonants.test(lettersOnly) && lettersOnly.length >= 10) {
        return true
      }
    }
    return false
  }

  // Count vowels (including accented vowels common in Nigerian languages)
  const vowelPattern = /[aeiouàáâãäåèéêëìíîïòóôõöùúûüæœ]/gi
  const vowelCount = (lettersOnly.match(vowelPattern) || []).length
  const vowelRatio = vowelCount / lettersOnly.length

  // If less than 8% vowels in text longer than 20 chars, likely gibberish
  // Nigerian languages typically have good vowel ratios
  if (lettersOnly.length > 20 && vowelRatio < 0.08) {
    return true
  }

  // Check for keyboard mashing - but require longer sequences (8+) to avoid
  // false positives with words like "wahala" which contain [asdfghjkl] chars
  const keyboardMash = /[asdfghjkl]{8,}|[qwertyuiop]{8,}|[zxcvbnm]{8,}/i
  if (keyboardMash.test(lettersOnly)) {
    return true
  }

  // Check for random consonant clusters unlikely in any language (8+ consonants)
  const impossibleClusters = /[bcdfghjklmnpqrstvwxz]{8,}/i
  if (impossibleClusters.test(lettersOnly)) {
    return true
  }

  return false
}

/**
 * Check for pure spam repetition
 * Allow: "help help help", "FIRE! FIRE! FIRE!"
 * Block: "asdasdasdasd", "xxxxxxxxxxx"
 */
function isPureSpamRepetition(text: string): boolean {
  // Skip if contains safe words (panic repetition is OK)
  const hasSafeWords = SAFE_WORDS.some(word => text.includes(word))
  if (hasSafeWords) return false

  // Check if entire text is just one pattern repeated
  // "ab" repeated = "ababab" (length 6, pattern length 2, repeats 3+)
  for (let patternLen = 1; patternLen <= 4; patternLen++) {
    const pattern = text.slice(0, patternLen)
    const repeated = pattern.repeat(Math.ceil(text.length / patternLen)).slice(0, text.length)
    if (repeated === text && text.length >= patternLen * 4) {
      return true // Same pattern repeated 4+ times
    }
  }

  return false
}

/**
 * Moderate landmark text (more permissive)
 * Landmarks are short and can be in any language
 * Examples: "Near Shoprite", "Opposite UBA", "Junction by bridge"
 */
export function moderateLandmark(text: string | null | undefined): ModerationResult {
  if (!text || typeof text !== 'string') {
    return { safe: true, confidence: 'high' }
  }

  const normalized = text.toLowerCase().trim()

  if (normalized.length === 0) {
    return { safe: true, confidence: 'high' }
  }

  // Landmarks can be very short ("UBA", "MTN", "GTB") - that's OK
  // Only check for obvious spam patterns
  const landmarkSpamPatterns = [
    /\b(buy|sell|order|promo|discount)\b/i,
    /\b(bitcoin|crypto|forex)\b/i,
    /https?:\/\//i,
  ]

  for (const pattern of landmarkSpamPatterns) {
    if (pattern.test(normalized)) {
      return { safe: false, reason: 'spam', confidence: 'high' }
    }
  }

  return { safe: true, confidence: 'high' }
}

/**
 * Combined moderation for a report
 */
export function moderateReportContent(
  description: string | null | undefined,
  landmark: string | null | undefined
): ModerationResult {
  // Check description
  const descResult = moderateText(description)
  if (!descResult.safe) {
    return descResult
  }

  // Check landmark
  const landmarkResult = moderateLandmark(landmark)
  if (!landmarkResult.safe) {
    return landmarkResult
  }

  return { safe: true, confidence: 'high' }
}

/**
 * Test helper - verify moderation works correctly
 * Run: import { runModerationTests } from '@/lib/text-moderation'
 */
export function runModerationTests(): { passed: number; failed: number; results: string[] } {
  const tests = [
    // Should PASS (safe: true)
    { text: 'Robbery dey happen for junction', expected: true, desc: 'Pidgin English' },
    { text: 'Dem don kidnap person!', expected: true, desc: 'Pidgin report' },
    { text: 'FIRE FIRE!! NA FIRE O!!', expected: true, desc: 'ALL CAPS emergency' },
    { text: 'suspecious pple near d bridge', expected: true, desc: 'Typos' },
    { text: 'Wahala dey this area', expected: true, desc: 'Informal Nigerian' },
    { text: 'Omo this place no safe at all', expected: true, desc: 'Slang' },
    { text: 'help help help!!!', expected: true, desc: 'Panic repetition' },
    { text: 'call police 112', expected: true, desc: 'Emergency number 112' },
    { text: 'call ambulance 767', expected: true, desc: 'Emergency number 767' },
    { text: '🔥🔥🔥', expected: true, desc: 'Emoji only' },
    { text: 'Fire! 🔥 Run!', expected: true, desc: 'Emoji + text' },
    { text: 'Near Shoprite', expected: true, desc: 'Landmark' },
    { text: 'GTB junction', expected: true, desc: 'Short landmark' },
    { text: 'Ẹ jọ̀wọ́ ẹ ṣàánú', expected: true, desc: 'Yoruba' },
    { text: 'Biko nyere m aka', expected: true, desc: 'Igbo' },
    { text: 'ok', expected: true, desc: 'Very short valid' },
    { text: '', expected: true, desc: 'Empty' },
    { text: null, expected: true, desc: 'Null' },

    // Should FAIL (safe: false)
    { text: 'aaaaaaaaaa', expected: false, desc: 'Repeated chars' },
    { text: 'asdasdasdasd', expected: false, desc: 'Pattern repetition' },
    { text: 'Buy cheap phones now! Call 08012345678 to order', expected: false, desc: 'Advertising' },
    { text: 'Earn money from home! Bitcoin trading signals', expected: false, desc: 'Scam' },
    { text: 'Congratulations you won lottery!', expected: false, desc: 'Lottery scam' },
    { text: 'asdfghjkl', expected: false, desc: 'Keyboard mash (home row)' },
    { text: 'qwertyuiop', expected: false, desc: 'Keyboard mash (top row)' },
    { text: 'bcdfghjklmnpqrst', expected: false, desc: 'Consonant cluster' },
    { text: 'I will kill you', expected: false, desc: 'Direct threat' },
    { text: 'x', expected: false, desc: 'Too short' },
  ]

  const results: string[] = []
  let passed = 0
  let failed = 0

  for (const test of tests) {
    const result = moderateText(test.text as string)
    const actualSafe = result.safe
    const success = actualSafe === test.expected

    if (success) {
      passed++
      results.push(`✅ PASS: "${test.text}" - ${test.desc}`)
    } else {
      failed++
      results.push(`❌ FAIL: "${test.text}" - ${test.desc} (expected ${test.expected}, got ${actualSafe}, reason: ${result.reason})`)
    }
  }

  return { passed, failed, results }
}
