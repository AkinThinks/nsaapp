// Risk-based time window configuration for GDELT queries
// Longer windows for chronic conflict zones provide better trend analysis
// Based on research: 30-90 days for persistent risks, 7-14 days for normal areas

export type RiskLevel = 'EXTREME' | 'VERY HIGH' | 'HIGH' | 'MODERATE' | 'LOW'

/**
 * Time window configuration based on risk level
 * - EXTREME: 30 days (chronic conflict zones need longer trend analysis)
 * - VERY HIGH: 21 days (high-risk areas need comprehensive data)
 * - HIGH: 14 days (moderate-high risk areas)
 * - MODERATE/LOW: 7 days (normal areas, standard window)
 */
export const RISK_TIME_WINDOWS: Record<RiskLevel, string> = {
  EXTREME: '30d',
  'VERY HIGH': '21d',
  HIGH: '14d',
  MODERATE: '7d',
  LOW: '7d',
}

/**
 * Get appropriate time window for a risk level
 * Falls back to 7d if risk level is unknown
 */
export function getTimeWindowForRisk(riskLevel: string | undefined | null): string {
  if (!riskLevel) return '7d'
  
  const normalized = riskLevel.toUpperCase().trim() as RiskLevel
  return RISK_TIME_WINDOWS[normalized] || '7d'
}

/**
 * Maximum articles to fetch per query based on risk level
 * Higher risk areas may have more incidents, but we still limit for performance
 */
export const MAX_ARTICLES_BY_RISK: Record<RiskLevel, number> = {
  EXTREME: 100,      // More articles for chronic zones (but still limited)
  'VERY HIGH': 80,   // High-risk areas
  HIGH: 60,          // Moderate-high risk
  MODERATE: 50,      // Standard limit
  LOW: 50,           // Standard limit
}

/**
 * Get maximum articles to fetch for a risk level
 */
export function getMaxArticlesForRisk(riskLevel: string | undefined | null): number {
  if (!riskLevel) return 50
  
  const normalized = riskLevel.toUpperCase().trim() as RiskLevel
  return MAX_ARTICLES_BY_RISK[normalized] || 50
}

/**
 * Check if a risk level requires extended time window analysis
 */
export function requiresExtendedWindow(riskLevel: string | undefined | null): boolean {
  if (!riskLevel) return false
  const normalized = riskLevel.toUpperCase().trim()
  return normalized === 'EXTREME' || normalized === 'VERY HIGH'
}



