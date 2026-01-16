'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Activity, Settings, Plus } from 'lucide-react'
import { NigerianShield } from '@/components/landing/NigerianShield'

interface BottomNavProps {
  hasActiveAlerts?: boolean
}

export function BottomNav({ hasActiveAlerts = false }: BottomNavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/app',
      icon: Home,
      label: 'Feed',
      isActive: pathname === '/app',
    },
    {
      href: '/app/activity',
      icon: Activity,
      label: 'Activity',
      isActive: pathname === '/app/activity',
    },
    {
      href: '/app/settings',
      icon: Settings,
      label: 'Settings',
      isActive: pathname === '/app/settings',
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 z-40 safe-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-3 px-6 min-w-[80px] transition-colors touch-target ${
                item.isActive
                  ? 'text-emerald-700'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className="relative">
                {item.href === '/app' ? (
                  <NigerianShield className={`w-6 h-6 ${!item.isActive && 'opacity-50'}`} />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
                {item.href === '/app' && hasActiveAlerts && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                )}
              </div>
              <span className={`text-xs mt-1 ${item.isActive ? 'font-medium' : ''}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// Floating Report Button - separate component for flexibility
export function ReportFAB() {
  return (
    <Link href="/app/report">
      <button className="fixed bottom-24 right-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl px-5 py-3.5 shadow-lg hover:shadow-xl transition-all z-50 flex items-center gap-2 touch-target">
        <Plus className="w-5 h-5" />
        <span className="font-semibold">Report</span>
      </button>
    </Link>
  )
}
