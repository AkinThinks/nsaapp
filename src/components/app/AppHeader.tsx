'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Bell, Settings, MoreHorizontal, Share2 } from 'lucide-react'
import { NigerianShield } from '@/components/landing/NigerianShield'

interface AppHeaderProps {
  title?: string
  showBack?: boolean
  showLogo?: boolean
  showBell?: boolean
  showSettings?: boolean
  showShare?: boolean
  showMore?: boolean
  hasNotification?: boolean
  onShare?: () => void
  onMore?: () => void
  children?: React.ReactNode
}

export function AppHeader({
  title,
  showBack = false,
  showLogo = false,
  showBell = false,
  showSettings = false,
  showShare = false,
  showMore = false,
  hasNotification = false,
  onShare,
  onMore,
  children,
}: AppHeaderProps) {
  const router = useRouter()

  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-40">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center">
        {/* Left */}
        {showBack ? (
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors touch-target"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </button>
        ) : showLogo ? (
          <Link href="/app" className="flex items-center gap-2">
            <NigerianShield className="w-8 h-8" />
            <span className="font-bold text-lg text-gray-900">SafetyAlerts</span>
          </Link>
        ) : (
          <div className="w-10" />
        )}

        {/* Center - Title */}
        {title && (
          <h1 className="font-semibold text-lg flex-1 text-center text-gray-900">
            {title}
          </h1>
        )}

        {/* Spacer if logo but no title */}
        {showLogo && !title && <div className="flex-1" />}

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          {showBell && (
            <Link href="/app/settings">
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative touch-target">
                <Bell className="w-5 h-5 text-gray-500" />
                {hasNotification && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
            </Link>
          )}
          {showSettings && (
            <Link href="/app/settings">
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors touch-target">
                <Settings className="w-5 h-5 text-gray-500" />
              </button>
            </Link>
          )}
          {showShare && onShare && (
            <button
              onClick={onShare}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors touch-target"
            >
              <Share2 className="w-5 h-5 text-gray-500" />
            </button>
          )}
          {showMore && onMore && (
            <button
              onClick={onMore}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors touch-target"
            >
              <MoreHorizontal className="w-5 h-5 text-gray-500" />
            </button>
          )}
          {!showBell && !showSettings && !showShare && !showMore && !title && (
            <div className="w-10" />
          )}
        </div>
      </div>

      {/* Optional children (e.g., location pill, filters) */}
      {children}
    </header>
  )
}
