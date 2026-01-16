import { NextRequest, NextResponse } from 'next/server'
import { searchLocations, toAreaSearchResult } from '@/lib/locations'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q') || ''
  const limit = parseInt(searchParams.get('limit') || '10')

  if (query.length < 2) {
    return NextResponse.json({ locations: [] })
  }

  const locations = searchLocations(query, limit)

  return NextResponse.json({
    locations: locations.map(toAreaSearchResult),
  })
}
