import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { BRIEFING_SYSTEM_PROMPT, ROUTE_BRIEFING_SYSTEM_PROMPT } from '@/lib/llm-prompts'

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

// Timeout for LLM calls (8 seconds)
const LLM_TIMEOUT = 8000

// Rate limiting cache
const briefingCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 2 * 60 * 60 * 1000 // 2 hours
const MAX_CACHE_SIZE = 200

function cleanupCache() {
  if (briefingCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(briefingCache.entries())
    entries.sort((a, b) => b[1].timestamp - a[1].timestamp)
    entries.slice(MAX_CACHE_SIZE).forEach(([key]) => briefingCache.delete(key))
  }
}

export async function POST(request: NextRequest) {
  // Check if OpenAI is configured
  if (!openai) {
    return NextResponse.json(
      { briefing: null, error: 'LLM service not configured' },
      { status: 503 }
    )
  }

  try {
    const body = await request.json()
    const { 
      type,  // 'area' or 'route'
      location,
      incidents,
      riskScore,
      staticProfile,
      dynamicRisk,  // NEW: Dynamic risk adjustment data
      routeStateIds,  // For routes
    } = body

    // Input validation
    if (!location || typeof location !== 'string') {
      return NextResponse.json({ 
        briefing: null, 
        error: 'Invalid location' 
      }, { status: 400 })
    }

    if (!incidents || !Array.isArray(incidents)) {
      return NextResponse.json({ 
        briefing: null, 
        error: 'Invalid incidents array' 
      }, { status: 400 })
    }

    // Create cache key
    const incidentsHash = incidents.length > 0 
      ? incidents.map((i: any) => i.notification || i.headline).join('|').slice(0, 200)
      : 'empty'
    const cacheKey = `briefing-${type || 'area'}-${location.toLowerCase()}-${incidents.length}-${riskScore?.score || 0}-${Buffer.from(incidentsHash).toString('base64').slice(0, 50)}`
    
    const cached = briefingCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({ 
        briefing: cached.data,
        cached: true
      })
    }

    // Use different prompts and grouping based on type
    const isRoute = type === 'route'
    const systemPrompt = isRoute ? ROUTE_BRIEFING_SYSTEM_PROMPT : BRIEFING_SYSTEM_PROMPT

    // Group incidents by relevance zone (different for routes vs areas)
    let userMessage: string
    
    if (isRoute) {
      // Route-specific grouping
      const onRoute = incidents?.filter((i: any) => i.relevance?.zone === 'on_route') || []
      const routeState = incidents?.filter((i: any) => i.relevance?.zone === 'route_state') || []
      const offRoute = incidents?.filter((i: any) => i.relevance?.zone === 'off_route') || []
      const routeStateIds = body.routeStateIds || []

      userMessage = `
ROUTE: ${location}

HISTORICAL CONTEXT & RECENT TRENDS:
${dynamicRisk ? `
- Static (Historical) Risk Level: ${dynamicRisk.staticRisk}
  * This risk level is based on months of historical security data for this route
  * Route passes through: ${routeStateIds.join(' → ')}
  * Known for: ${staticProfile?.dangerousRoads?.map((r: any) => r.name).join(', ') || 'security challenges along route'}
- Adjusted (Current) Risk Level: ${dynamicRisk.adjustedRisk}
  * Days since last incident on route: ${dynamicRisk.daysSinceLastIncident !== null ? dynamicRisk.daysSinceLastIncident : 'Unknown'}
  * Recent trend: ${dynamicRisk.trend}
  * Risk adjustment reasoning: ${dynamicRisk.reasoning}
${dynamicRisk.staticRisk !== dynamicRisk.adjustedRisk ? `
- IMPORTANT: Route risk has been ${dynamicRisk.adjustedRisk < dynamicRisk.staticRisk ? 'downgraded' : 'upgraded'} from ${dynamicRisk.staticRisk} to ${dynamicRisk.adjustedRisk} based on recent incident data.
` : `
- Route risk level unchanged: ${dynamicRisk.staticRisk} (historical pattern confirmed by recent data)
`}
` : `
- Static Route Risk Level: ${staticProfile?.overallRisk || staticProfile?.riskLevel || 'MODERATE'}
- Route passes through: ${routeStateIds.join(' → ')}
- Known dangerous roads: ${staticProfile?.dangerousRoads?.map((r: any) => r.name).join(', ') || 'None specified'}
- No dynamic risk data available (using static risk only)
`}

INCIDENTS BY ROUTE RELEVANCE:

ON THIS ROUTE (most critical): ${onRoute.length} incidents
${onRoute.length > 0 
  ? onRoute.map((i: any) => `- ${i.notification || i.headline} at ${i.location_extracted || 'on route'} [${i.severity || 'unknown'}]`).join('\n')
  : '- None'}

IN ROUTE STATES (but may not be on route): ${routeState.length} incidents
${routeState.length > 0 
  ? routeState.map((i: any) => `- ${i.notification || i.headline} at ${i.location_extracted || 'route state'} [${i.severity || 'unknown'}]`).join('\n')
  : '- None'}

OFF ROUTE (not relevant): ${offRoute.length} incidents
${offRoute.length > 0 ? `- ${offRoute.length} incidents elsewhere (not shown)` : '- None'}

ROUTE STATES: ${routeStateIds.join(' → ')}

RISK SCORE: ${riskScore?.score || 'N/A'}/10 (${riskScore?.level || 'unknown'})

ROUTE PROFILE:
- Overall risk level: ${staticProfile?.overallRisk || staticProfile?.riskLevel || 'MODERATE'}
- Known dangerous roads: ${staticProfile?.dangerousRoads?.map((r: any) => r.name).join(', ') || 'None specified'}
- Recommendations: ${staticProfile?.recommendations?.primary || 'Standard travel precautions'}

Generate a helpful route briefing.

CRITICAL INSTRUCTIONS:
${dynamicRisk && dynamicRisk.staticRisk !== dynamicRisk.adjustedRisk ? `
1. MENTION HISTORICAL CONTEXT: "This route (${location}) historically passes through [high-risk areas/states] known for [${staticProfile?.dangerousRoads?.map((r: any) => r.name).join(', ') || 'security challenges'}] based on months of security data."

2. MENTION RECENT CALM PERIOD: "However, the route has been calm in the last ${dynamicRisk.daysSinceLastIncident} days with no incidents on the actual route corridor."

3. PROVIDE NUANCED ADVICE: Balance historical route risk with recent calm. Don't just say "good to travel" - be specific:
   - If risk was downgraded: "While this route has a history of [threats], the recent calm period suggests it may be safer than usual, though travelers should still exercise [appropriate level] caution, travel during [specific times], and [specific precautions]."
   - If risk was upgraded: "Recent incidents confirm the historical risk pattern. The route remains [risk level] and travelers should [specific advice based on threat type and route segments]."

4. BE SEGMENT-SPECIFIC: Mention which route segments are historically risky vs recently calm.

5. BE TRANSPARENT: Explain why the route risk was adjusted and what it means for travelers.
` : dynamicRisk ? `
1. MENTION HISTORICAL CONTEXT: "This route (${location}) historically passes through [states/areas] known for [security challenges] based on months of security data."

2. MENTION RECENT CONFIRMATION: "Recent activity confirms this historical risk pattern along the route."

3. PROVIDE BALANCED ADVICE: Reference both historical context and current situation for each route segment.
` : `
1. Prioritize on_route incidents in your summary.
2. If most incidents are off-route, lead with route safety.
3. Be specific about which route segments have issues.
4. Provide travel timing advice and alternatives if needed.
`}
`
    } else {
      // Area-specific grouping (existing logic)
      const immediate = incidents?.filter((i: any) => i.relevance?.zone === 'immediate') || []
      const nearby = incidents?.filter((i: any) => i.relevance?.zone === 'nearby') || []
      const regional = incidents?.filter((i: any) => i.relevance?.zone === 'same_region') || []
      const stateWide = incidents?.filter((i: any) => i.relevance?.zone === 'same_state') || []

      userMessage = `
USER SEARCHED: ${location}

INCIDENTS BY RELEVANCE TO USER'S SEARCH:

IN ${location.toUpperCase()} (immediate): ${immediate.length} incidents
${immediate.length > 0 
  ? immediate.map((i: any) => `- ${i.notification || i.headline} [${i.severity || 'unknown'}]`).join('\n')
  : '- None'}

NEARBY (~15km): ${nearby.length} incidents
${nearby.length > 0 
  ? nearby.map((i: any) => `- ${i.notification || i.headline} at ${i.location_extracted || 'nearby'} [${i.severity || 'unknown'}]`).join('\n')
  : '- None'}

SAME REGION (~30km): ${regional.length} incidents
${regional.length > 0 
  ? regional.map((i: any) => `- ${i.notification || i.headline} at ${i.location_extracted || 'region'} [${i.severity || 'unknown'}]`).join('\n')
  : '- None'}

ELSEWHERE IN STATE (far, less relevant): ${stateWide.length} incidents
${stateWide.length > 0 ? `- ${stateWide.length} incidents in distant areas` : '- None'}

RISK SCORE: ${riskScore?.score || 'N/A'}/10 (${riskScore?.level || 'unknown'})

AREA PROFILE:
- Overall risk level: ${staticProfile?.riskLevel || 'MODERATE'}
- Known factors: ${staticProfile?.keyThreats?.join(', ') || 'None specific'}
- Safer zones: ${staticProfile?.saferZones?.join(', ') || 'Not specified'}
- Danger zones: ${staticProfile?.dangerZones?.join(', ') || 'Not specified'}
- Best travel times: ${staticProfile?.travelWindow || 'Daytime recommended'}

Generate a helpful briefing for this location. Remember: if immediate area is calm, lead with that even if state has incidents elsewhere.`
    }

    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), LLM_TIMEOUT)

    try {
      const response = await openai.chat.completions.create(
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.3, // Slightly higher for natural language
          response_format: { type: 'json_object' },
          max_tokens: 1500,
        },
        { signal: controller.signal as any }
      )

      clearTimeout(timeoutId)

      const content = response.choices[0]?.message?.content

      if (!content) {
        return NextResponse.json({ 
          briefing: null, 
          error: 'No response from LLM' 
        }, { status: 500 })
      }

      // Parse JSON response
      let briefing: any
      try {
        briefing = JSON.parse(content)
      } catch (parseError) {
        console.error('Failed to parse briefing response:', parseError)
        return NextResponse.json({ 
          briefing: null, 
          error: 'Invalid LLM response format' 
        }, { status: 500 })
      }

      // Validate briefing structure
      if (!briefing.summary || !briefing.for_travelers || !briefing.for_residents) {
        return NextResponse.json({ 
          briefing: null, 
          error: 'Incomplete briefing structure' 
        }, { status: 500 })
      }

      // Cache the result
      briefingCache.set(cacheKey, {
        data: briefing,
        timestamp: Date.now()
      })

      // Cleanup cache
      cleanupCache()

      return NextResponse.json({ briefing })

    } catch (error: any) {
      clearTimeout(timeoutId)
      
      if (error.name === 'AbortError' || error.message?.includes('timeout')) {
        return NextResponse.json({ 
          briefing: null, 
          error: 'Briefing generation timeout' 
        }, { status: 504 })
      }

      // Handle OpenAI API errors
      if (error.status === 429) {
        return NextResponse.json({ 
          briefing: null, 
          error: 'Rate limit exceeded' 
        }, { status: 429 })
      }

      if (error.status === 401 || error.status === 403) {
        return NextResponse.json({ 
          briefing: null, 
          error: 'LLM service authentication failed' 
        }, { status: 503 })
      }

      throw error
    }

  } catch (error: any) {
    console.error('Briefing generation error:', error)
    
    return NextResponse.json({ 
      briefing: null, 
      error: 'Briefing generation failed' 
    }, { status: 500 })
  }
}

