import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { ANALYST_SYSTEM_PROMPT } from '@/lib/llm-prompts'

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

// Timeout for LLM calls (8 seconds to leave buffer for Vercel's 10s limit)
const LLM_TIMEOUT = 8000

// Rate limiting (simple in-memory cache - upgrade to Redis in production)
// Using Map for thread-safe operations in serverless environment
const requestCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 2 * 60 * 60 * 1000 // 2 hours

// Cleanup old cache entries periodically
const MAX_CACHE_SIZE = 200
function cleanupCache() {
  if (requestCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(requestCache.entries())
    entries.sort((a, b) => b[1].timestamp - a[1].timestamp)
    entries.slice(MAX_CACHE_SIZE).forEach(([key]) => requestCache.delete(key))
  }
}

export async function POST(request: NextRequest) {
  // Check if OpenAI is configured
  if (!openai) {
    return NextResponse.json(
      { incidents: [], error: 'LLM service not configured' },
      { status: 503 }
    )
  }

  try {
    const body = await request.json()
    const { headlines } = body

    // Input validation
    if (!headlines || !Array.isArray(headlines) || headlines.length === 0) {
      return NextResponse.json({ 
        incidents: [],
        error: 'Invalid input: headlines array required'
      }, { status: 400 })
    }

    // Limit to 20 headlines max (cost + timeout management)
    const limitedHeadlines = headlines.slice(0, 20)

    // Validate headline structure
    const validHeadlines = limitedHeadlines.filter((h: any) => 
      h && typeof h === 'object' && typeof h.title === 'string' && h.title.trim().length > 0
    )

    if (validHeadlines.length === 0) {
      return NextResponse.json({ 
        incidents: [],
        error: 'No valid headlines provided'
      }, { status: 400 })
    }

    // Create cache key from headlines (hash for efficiency)
    const headlinesText = validHeadlines.map((h: any) => h.title).join('|')
    const cacheKey = `analyze-${Buffer.from(headlinesText).toString('base64').slice(0, 100)}`
    const cached = requestCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({ 
        incidents: cached.data.incidents || [],
        cached: true,
        total_analyzed: validHeadlines.length,
        total_valid: cached.data.incidents?.length || 0,
      })
    }

    // Format headlines for analysis
    const headlineList = validHeadlines
      .map((h: { title: string }, i: number) => `${i + 1}. "${h.title}"`)
      .join('\n')

    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), LLM_TIMEOUT)

    try {
      const response = await openai.chat.completions.create(
        {
          model: 'gpt-4o-mini', // Cost-effective, fast
          messages: [
            { role: 'system', content: ANALYST_SYSTEM_PROMPT },
            { 
              role: 'user', 
              content: `Analyze these Nigerian news headlines:\n\n${headlineList}\n\nRespond with JSON only in format: {"incidents": [...]}`
            }
          ],
          temperature: 0.1, // Low temperature for consistency
          response_format: { type: 'json_object' },
          max_tokens: 2000,
        },
        { signal: controller.signal as any }
      )

      clearTimeout(timeoutId)

      const content = response.choices[0]?.message?.content

      if (!content) {
        return NextResponse.json({ 
          incidents: [], 
          error: 'No response from LLM' 
        }, { status: 500 })
      }

      // Parse JSON response
      let parsed: any
      try {
        parsed = JSON.parse(content)
      } catch (parseError) {
        console.error('Failed to parse LLM response:', parseError)
        return NextResponse.json({ 
          incidents: [], 
          error: 'Invalid LLM response format' 
        }, { status: 500 })
      }

      const incidents = Array.isArray(parsed.incidents) ? parsed.incidents : []

      // Merge with original data (URLs, dates)
      const enrichedIncidents = incidents.map((incident: any, index: number) => {
        const original = validHeadlines[index]
        return {
          ...incident,
          url: original?.url || '',
          date: original?.seendate || '',
          original_headline: original?.title || '',
        }
      })

      // Filter to actual incidents with sufficient confidence
      const validIncidents = enrichedIncidents.filter((i: any) => 
        i.is_incident === true && 
        typeof i.confidence === 'number' &&
        i.confidence >= 0.7 &&
        i.notification &&
        typeof i.notification === 'string'
      )

      // Cache the result
      requestCache.set(cacheKey, {
        data: { incidents: validIncidents },
        timestamp: Date.now()
      })

      // Cleanup cache
      cleanupCache()

      return NextResponse.json({ 
        incidents: validIncidents,
        total_analyzed: validHeadlines.length,
        total_valid: validIncidents.length,
      })

    } catch (error: any) {
      clearTimeout(timeoutId)
      
      if (error.name === 'AbortError' || error.message?.includes('timeout')) {
        return NextResponse.json({ 
          incidents: [], 
          error: 'Analysis timeout - too many headlines' 
        }, { status: 504 })
      }

      // Handle OpenAI API errors
      if (error.status === 429) {
        return NextResponse.json({ 
          incidents: [], 
          error: 'Rate limit exceeded' 
        }, { status: 429 })
      }

      if (error.status === 401 || error.status === 403) {
        return NextResponse.json({ 
          incidents: [], 
          error: 'LLM service authentication failed' 
        }, { status: 503 })
      }

      throw error
    }

  } catch (error: any) {
    console.error('Incident analysis error:', error)
    
    // Don't expose internal errors to client
    return NextResponse.json({ 
      incidents: [], 
      error: 'Analysis failed' 
    }, { status: 500 })
  }
}



