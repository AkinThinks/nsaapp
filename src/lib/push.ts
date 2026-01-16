/**
 * Web Push utilities
 */

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) return 'denied'
  return Notification.requestPermission()
}

/**
 * Get current notification permission
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isPushSupported()) return 'denied'
  return Notification.permission
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ),
    })
    return subscription
  } catch (error) {
    console.error('Push subscription failed:', error)
    return null
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    if (subscription) {
      await subscription.unsubscribe()
    }
    return true
  } catch (error) {
    console.error('Push unsubscribe failed:', error)
    return false
  }
}

/**
 * Get existing push subscription
 */
export async function getExistingSubscription(): Promise<PushSubscription | null> {
  try {
    const registration = await navigator.serviceWorker.ready
    return await registration.pushManager.getSubscription()
  } catch {
    return null
  }
}

/**
 * Convert VAPID key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray.buffer
}

/**
 * Convert subscription keys to base64 for storage
 */
export function subscriptionToJSON(subscription: PushSubscription): {
  endpoint: string
  keys: { p256dh: string; auth: string }
} {
  const p256dh = subscription.getKey('p256dh')
  const auth = subscription.getKey('auth')

  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: p256dh ? arrayBufferToBase64(p256dh) : '',
      auth: auth ? arrayBufferToBase64(auth) : '',
    },
  }
}

/**
 * Convert ArrayBuffer to base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}
