'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { type AdminRole } from '@/lib/admin-auth-client'

interface AdminLayoutClientProps {
  admin: {
    full_name: string
    email: string
    role: AdminRole
  }
  children: React.ReactNode
}

export function AdminLayoutClient({ admin, children }: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  // Fetch pending moderation count
  useEffect(() => {
    async function fetchPendingCount() {
      try {
        const response = await fetch('/api/admin/reports?status=pending&limit=1')
        const data = await response.json()
        if (data.total !== undefined) {
          setPendingCount(data.total)
        }
      } catch (error) {
        console.error('Failed to fetch pending count:', error)
      }
    }

    fetchPendingCount()
    // Refresh every 60 seconds
    const interval = setInterval(fetchPendingCount, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar
        role={admin.role}
        pendingCount={pendingCount}
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        adminName={admin.full_name}
        adminEmail={admin.email}
      />

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Header */}
        <AdminHeader
          admin={admin}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
