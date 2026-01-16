'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { setIsOnline } = useAppStore()
  const { isOnline } = useNetworkStatus()

  useEffect(() => {
    setIsOnline(isOnline)
  }, [isOnline, setIsOnline])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 text-sm z-50">
          You&apos;re offline. Some features may be limited.
        </div>
      )}
      {children}

      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  )
}
