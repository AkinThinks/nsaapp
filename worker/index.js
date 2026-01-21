/**
 * SafetyAlerts Custom Service Worker
 * Handles push notifications for safety alerts
 */

// Vibration patterns for different alert types
const VIBRATION_PATTERNS = {
  // Emergency: Long urgent pulses
  emergency: [300, 100, 300, 100, 300, 100, 300],
  // High priority (robbery, kidnapping, gunshots, attack)
  high: [200, 100, 200, 100, 200],
  // Normal alerts
  normal: [150, 50, 150],
  // Info/broadcast
  info: [100, 50, 100],
  // No vibration
  none: []
}

// Get vibration pattern based on alert type
function getVibrationPattern(data) {
  // Check if vibration is disabled via data
  if (data.vibrate === false) {
    return VIBRATION_PATTERNS.none
  }

  const type = data.data?.broadcast_type || data.type || 'normal'
  const incidentType = data.data?.incident_type || ''

  // Emergency broadcasts
  if (type === 'emergency') {
    return VIBRATION_PATTERNS.emergency
  }

  // High-risk incidents
  const highRiskTypes = ['robbery', 'kidnapping', 'gunshots', 'attack']
  if (highRiskTypes.includes(incidentType)) {
    return VIBRATION_PATTERNS.high
  }

  // Broadcasts and info
  if (type === 'broadcast' || type === 'info' || type === 'announcement') {
    return VIBRATION_PATTERNS.info
  }

  return VIBRATION_PATTERNS.normal
}

// Push notification received
self.addEventListener('push', (event) => {
  if (!event.data) return

  let data
  try {
    data = event.data.json()
  } catch (e) {
    data = {
      title: 'SafetyAlerts',
      body: event.data.text() || 'New alert in your area'
    }
  }

  const vibrationPattern = getVibrationPattern(data)

  const options = {
    body: data.body || 'New safety alert in your area',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: vibrationPattern,
    tag: data.tag || `safety-alert-${Date.now()}`,
    renotify: true,
    requireInteraction: data.requireInteraction !== false,
    silent: vibrationPattern.length === 0, // Silent if no vibration
    data: {
      url: data.url || '/app',
      alertId: data.alertId,
      type: data.type || 'alert'
    },
    actions: [
      {
        action: 'view',
        title: 'View Alert'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'SafetyAlerts', options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const action = event.action
  const data = event.notification.data || {}
  const url = data.url || '/app'

  // Handle different actions
  if (action === 'dismiss') {
    return
  }

  // Focus or open app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to focus existing window
      for (const client of clientList) {
        if (client.url.includes('/app') && 'focus' in client) {
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            alertId: data.alertId
          })
          return client.focus()
        }
      }

      // Open new window if none exists
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})

// Notification close handler
self.addEventListener('notificationclose', (event) => {
  // Track notification dismissals if needed
  console.log('Notification dismissed:', event.notification.tag)
})

// Handle background sync for offline report submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-reports') {
    event.waitUntil(syncPendingReports())
  }
})

async function syncPendingReports() {
  // Get pending reports from IndexedDB and submit them
  // This would be implemented with actual IndexedDB logic
  console.log('Syncing pending reports...')
}

// Handle app updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

console.log('SafetyAlerts service worker loaded')
