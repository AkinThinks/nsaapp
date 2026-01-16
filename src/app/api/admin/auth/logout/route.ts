import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  getSessionFromCookie,
  clearSessionCookie,
  invalidateSession,
  logAdminAction,
} from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookie()

    if (session) {
      // Get token from cookie to invalidate
      const cookieStore = await cookies()
      const token = cookieStore.get('admin_session')?.value

      if (token) {
        await invalidateSession(token)
      }

      // Log logout action
      await logAdminAction(session.adminId, session.email, 'logout', {
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      })
    }

    // Clear cookie
    await clearSessionCookie()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    // Still clear cookie even on error
    await clearSessionCookie()
    return NextResponse.json({ success: true })
  }
}
