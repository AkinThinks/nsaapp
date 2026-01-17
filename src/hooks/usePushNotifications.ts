'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  isPushSupported,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  getNotificationPermission,
  subscriptionToJSON,
} from '@/lib/push'
import { useAppStore } from '@/lib/store'
import { getSupabase } from '@/lib/supabase'

// Check if Supabase is configured
function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

interface UsePushNotificationsReturn {
  isSupported: boolean
  permission: NotificationPermission
  isEnabled: boolean
  isLoading: boolean
  enable: () => Promise<boolean>
  disable: () => Promise<boolean>
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const { user, isPushEnabled, setIsPushEnabled } = useAppStore()
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsSupported(isPushSupported())
    setPermission(getNotificationPermission())
  }, [])

  const enable = useCallback(async (): Promise<boolean> => {
    // Allow enabling push even without user authentication
    if (!isSupported) return false

    setIsLoading(true)
    try {
      // Request permission
      const perm = await requestNotificationPermission()
      setPermission(perm)

      if (perm !== 'granted') {
        setIsLoading(false)
        return false
      }

      // Subscribe to push
      const subscription = await subscribeToPush()
      if (!subscription) {
        setIsLoading(false)
        return false
      }

      // Save subscription to database only if user is authenticated and Supabase is configured
      if (user && isSupabaseConfigured()) {
        const supabase = getSupabase()
        const subscriptionData = subscriptionToJSON(subscription)
        const { error } = await supabase.from('push_subscriptions').upsert(
          {
            user_id: user.id,
            endpoint: subscriptionData.endpoint,
            keys: subscriptionData.keys,
          },
          { onConflict: 'endpoint' }
        )

        if (error) {
          console.warn('Failed to save push subscription to database:', error)
          // Continue anyway - local push will still work
        }
      }

      setIsPushEnabled(true)
      setIsLoading(false)
      return true
    } catch (error) {
      console.error('Enable push failed:', error)
      setIsLoading(false)
      return false
    }
  }, [user, isSupported, setIsPushEnabled])

  const disable = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)
    try {
      await unsubscribeFromPush()

      if (user && isSupabaseConfigured()) {
        const supabase = getSupabase()
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user.id)
      }

      setIsPushEnabled(false)
      setIsLoading(false)
      return true
    } catch (error) {
      console.error('Disable push failed:', error)
      setIsLoading(false)
      return false
    }
  }, [user, setIsPushEnabled])

  return {
    isSupported,
    permission,
    isEnabled: isPushEnabled,
    isLoading,
    enable,
    disable,
  }
}

/**
 * Show a local notification (for testing or fallback)
 */
export function showLocalNotification(
  title: string,
  body: string,
  options?: NotificationOptions
) {
  if (!isPushSupported()) return

  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      ...options,
    })
  }
}
