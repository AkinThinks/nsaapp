import { NextResponse } from 'next/server'
import { getSessionFromCookie, getAdminById } from '@/lib/admin-auth'

export async function GET() {
  try {
    const session = await getSessionFromCookie()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get fresh admin data from database
    const admin = await getAdminById(session.adminId)

    if (!admin || !admin.is_active) {
      return NextResponse.json(
        { error: 'Account not found or deactivated' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      admin: {
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role,
        last_login: admin.last_login,
      },
    })
  } catch (error) {
    console.error('Get admin error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}
