/**
 * Share utilities for SafetyAlerts
 * WhatsApp is the primary sharing method in Nigeria
 */

import type { Alert, Report } from '@/types'

interface ShareContent {
  title: string
  text: string
  url: string
}

/**
 * Share an alert via WhatsApp
 */
export function shareToWhatsApp(alert: Alert | Report, customMessage?: string) {
  const incidentLabels: Record<string, string> = {
    robbery: 'ROBBERY',
    attack: 'ATTACK',
    gunshots: 'GUNSHOTS',
    kidnapping: 'KIDNAPPING',
    checkpoint: 'CHECKPOINT',
    fire: 'FIRE',
    accident: 'ACCIDENT',
    traffic: 'TRAFFIC',
    suspicious: 'SUSPICIOUS ACTIVITY',
    other: 'ALERT',
  }

  const incidentType = incidentLabels[alert.incident_type] || 'ALERT'
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  const message = customMessage || `
*SafetyAlerts: ${incidentType}*
${alert.area_name}, ${alert.state}
${alert.landmark ? `Near: ${alert.landmark}` : ''}
${alert.description ? `\n${alert.description}` : ''}

View details: ${baseUrl}/app/alert/${alert.id}

Stay safe! Download SafetyAlerts: ${baseUrl}
`.trim()

  const encoded = encodeURIComponent(message)
  window.open(`https://wa.me/?text=${encoded}`, '_blank')
}

/**
 * Share alert to a specific WhatsApp contact
 */
export function shareToWhatsAppContact(phoneNumber: string, alert: Alert | Report) {
  const formattedPhone = phoneNumber.replace(/\D/g, '')
  const incidentType = alert.incident_type.toUpperCase()
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  const message = `
*SafetyAlerts: ${incidentType}*
${alert.area_name}
${baseUrl}/app/alert/${alert.id}
`.trim()

  const encoded = encodeURIComponent(message)
  window.open(`https://wa.me/${formattedPhone}?text=${encoded}`, '_blank')
}

/**
 * Share using Web Share API (with WhatsApp fallback)
 */
export async function shareAlert(alert: Alert | Report): Promise<boolean> {
  const incidentType = alert.incident_type.toUpperCase()
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  const shareData: ShareContent = {
    title: `SafetyAlerts: ${incidentType} near ${alert.area_name}`,
    text: `${incidentType} reported near ${alert.area_name}${alert.landmark ? ` - ${alert.landmark}` : ''}`,
    url: `${baseUrl}/app/alert/${alert.id}`,
  }

  // Try Web Share API first (better mobile experience)
  if (navigator.share && navigator.canShare?.(shareData)) {
    try {
      await navigator.share(shareData)
      return true
    } catch (err) {
      // User cancelled or error - fall back to WhatsApp
      if ((err as Error).name !== 'AbortError') {
        shareToWhatsApp(alert)
      }
      return false
    }
  }

  // Fallback to WhatsApp
  shareToWhatsApp(alert)
  return true
}

/**
 * Copy alert link to clipboard
 */
export async function copyAlertLink(alertId: string): Promise<boolean> {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const url = `${baseUrl}/app/alert/${alertId}`

  try {
    await navigator.clipboard.writeText(url)
    return true
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = url
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.select()

    try {
      document.execCommand('copy')
      return true
    } catch {
      return false
    } finally {
      document.body.removeChild(textArea)
    }
  }
}

/**
 * Share app invitation
 */
export function shareAppInvite(referrerName?: string) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  const message = referrerName
    ? `${referrerName} invited you to join SafetyAlerts - get real-time safety alerts from your community.

Download now: ${baseUrl}

Stay informed, stay safe!`
    : `Join SafetyAlerts - get real-time safety alerts from your community.

Download now: ${baseUrl}

Stay informed, stay safe!`

  const encoded = encodeURIComponent(message)
  window.open(`https://wa.me/?text=${encoded}`, '_blank')
}

/**
 * Generate share message for specific contexts
 */
export function generateShareMessage(
  type: 'alert' | 'invite' | 'safety-tip',
  data?: { alert?: Alert | Report; tip?: string }
): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  switch (type) {
    case 'alert':
      if (!data?.alert) return ''
      return `SafetyAlerts: ${data.alert.incident_type.toUpperCase()} near ${data.alert.area_name}. Stay safe! ${baseUrl}/app/alert/${data.alert.id}`

    case 'invite':
      return `Join SafetyAlerts and stay informed about safety incidents in your area. Download: ${baseUrl}`

    case 'safety-tip':
      return `Safety Tip from SafetyAlerts: ${data?.tip || 'Stay alert and aware of your surroundings.'} Get alerts: ${baseUrl}`

    default:
      return ''
  }
}
