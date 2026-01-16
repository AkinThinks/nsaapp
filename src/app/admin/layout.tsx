import { getSessionFromCookie } from '@/lib/admin-auth'
import { AdminLayoutClient } from './AdminLayoutClient'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get session from cookie
  const session = await getSessionFromCookie()

  // If no session, render children directly (login page or redirect happens via middleware)
  if (!session) {
    return <>{children}</>
  }

  // Authenticated admin - show dashboard layout
  return (
    <AdminLayoutClient
      admin={{
        full_name: session.fullName,
        email: session.email,
        role: session.role,
      }}
    >
      {children}
    </AdminLayoutClient>
  )
}
