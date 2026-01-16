'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Bell, ChevronDown, LogOut, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type AdminRole } from '@/lib/admin-auth-client'
import { RoleBadge } from './ui/Badge'

interface AdminHeaderProps {
  admin: {
    full_name: string
    email: string
    role: AdminRole
  }
  onMenuClick: () => void
}

export function AdminHeader({ admin, onMenuClick }: AdminHeaderProps) {
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' })
      router.push('/admin/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoggingOut(false)
    }
  }

  // Get first name for greeting
  const firstName = admin.full_name.split(' ')[0]

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  // Get initials for avatar
  const initials = admin.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left: Menu button (mobile) */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">SafetyAlerts</span>
          </div>

          {/* Desktop Greeting */}
          <div className="hidden lg:block">
            <span className="text-gray-600">{getGreeting()}, </span>
            <span className="font-semibold text-gray-900">{firstName}</span>
          </div>
        </div>

        {/* Right: Notifications & Profile */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            {/* Notification dot - uncomment when needed */}
            {/* <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" /> */}
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={cn(
                'flex items-center gap-3 p-1.5 rounded-lg transition-colors',
                'hover:bg-gray-100',
                showDropdown && 'bg-gray-100'
              )}
            >
              <div className="w-9 h-9 bg-gray-900 text-white rounded-lg flex items-center justify-center text-sm font-medium shadow-sm">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium text-gray-900">{admin.full_name}</div>
                <div className="text-xs text-gray-500">{admin.email}</div>
              </div>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-gray-400 hidden sm:block transition-transform duration-200',
                  showDropdown && 'rotate-180'
                )}
              />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 overflow-hidden"
                >
                  {/* Mobile user info */}
                  <div className="px-4 py-3 border-b border-gray-100 sm:hidden">
                    <div className="font-medium text-gray-900">{admin.full_name}</div>
                    <div className="text-sm text-gray-500 truncate">{admin.email}</div>
                  </div>

                  {/* Role badge */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="text-xs text-gray-500 mb-2">Role</div>
                    <RoleBadge role={admin.role} />
                  </div>

                  {/* Sign out */}
                  <div className="px-2 pt-2">
                    <button
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className={cn(
                        'w-full px-3 py-2.5 text-left text-sm rounded-lg flex items-center gap-3',
                        'text-red-600 hover:bg-red-50 transition-colors',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                      )}
                    >
                      <LogOut className="w-4 h-4" />
                      {loggingOut ? 'Signing out...' : 'Sign out'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}
