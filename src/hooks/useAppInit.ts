'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'

/**
 * App initialization hook
 * Syncs user data from the database on app load
 * Ensures data persistence across sessions
 */
export function useAppInit() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const {
    user,
    setUser,
    savedLocations,
    setSavedLocations,
    hasCompletedOnboarding,
    setHasCompletedOnboarding,
    setIsPushEnabled,
  } = useAppStore()

  useEffect(() => {
    async function initializeApp() {
      // Skip if no user in store
      if (!user?.id) {
        setIsLoading(false)
        setIsInitialized(true)
        return
      }

      // Skip if user ID looks like a test/local ID
      if (user.id.startsWith('test-') || user.id.startsWith('local-')) {
        setIsLoading(false)
        setIsInitialized(true)
        return
      }

      try {
        // Fetch user data from database
        const userResponse = await fetch(`/api/user/profile?user_id=${user.id}`)

        if (userResponse.ok) {
          const userData = await userResponse.json()
          if (userData.user) {
            // Update user in store with fresh data
            setUser({
              ...user,
              ...userData.user,
            })
          }
        }

        // Fetch user locations from database
        const locationsResponse = await fetch(`/api/user/locations?user_id=${user.id}`)

        if (locationsResponse.ok) {
          const locationsData = await locationsResponse.json()
          const dbLocations = locationsData.locations || []

          // If database has locations, sync them to store
          if (dbLocations.length > 0) {
            setSavedLocations(dbLocations)

            // User has completed onboarding if they have saved locations
            if (!hasCompletedOnboarding) {
              setHasCompletedOnboarding(true)
            }
          } else if (savedLocations.length > 0 && !savedLocations[0].id.startsWith('local-')) {
            // Store has locations but DB doesn't - they might have been deleted
            // Keep the store locations as they may still be valid
          }
        }

        // Check push subscription status
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          try {
            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.getSubscription()

            if (subscription) {
              // User has an active push subscription
              setIsPushEnabled(true)

              // Ensure subscription is saved in database (upsert will handle duplicates)
              const subscriptionJSON = subscription.toJSON()
              await fetch('/api/user/push-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  user_id: user.id,
                  subscription: {
                    endpoint: subscription.endpoint,
                    keys: {
                      p256dh: subscriptionJSON.keys?.p256dh,
                      auth: subscriptionJSON.keys?.auth,
                    },
                  },
                }),
              })
            } else {
              setIsPushEnabled(false)
            }
          } catch (pushError) {
            console.warn('Push subscription check failed:', pushError)
          }
        }
      } catch (error) {
        console.error('App initialization failed:', error)
      } finally {
        setIsLoading(false)
        setIsInitialized(true)
      }
    }

    initializeApp()
  }, []) // Only run once on mount

  return { isInitialized, isLoading }
}
