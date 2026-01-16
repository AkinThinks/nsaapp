import { NextRequest, NextResponse } from 'next/server'
import { reverseGeocode } from '@/lib/reverse-geocode'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = parseFloat(searchParams.get('lat') || '0')
  const lng = parseFloat(searchParams.get('lng') || '0')

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 })
  }

  const result = await reverseGeocode(lat, lng)

  return NextResponse.json(result)
}
