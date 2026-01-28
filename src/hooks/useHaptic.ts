'use client'

import { useCallback } from 'react'
import { useAppStore } from '@/lib/store'

/**
 * Haptic feedback patterns for different interactions
 * Works on devices that support vibration API
 */
type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' | 'selection'

// Vibration patterns in milliseconds
const patterns: Record<HapticPattern, number | number[]> = {
  light: 10,           // Quick tap - for selections, toggles
  medium: 20,          // Standard tap - for button presses
  heavy: 40,           // Strong tap - for confirmations
  success: [10, 50, 20], // Double pulse - for successful actions
  error: [30, 50, 30, 50, 30], // Triple pulse - for errors
  warning: [20, 30, 20], // Alert pattern
  selection: 5,        // Micro tap - for UI selections
}

/**
 * Custom hook for haptic feedback
 * Respects user's vibration preference setting
 */
export function useHaptic() {
  const vibrationEnabled = useAppStore((state) => state.vibrationEnabled)

  /**
   * Trigger haptic feedback
   * @param pattern - The type of haptic feedback
   */
  const haptic = useCallback((pattern: HapticPattern = 'light') => {
    // Check if vibration is enabled in user settings
    if (!vibrationEnabled) return

    // Check if vibration API is supported
    if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return

    try {
      const vibrationPattern = patterns[pattern]
      navigator.vibrate(vibrationPattern)
    } catch (e) {
      // Silently fail - vibration is a nice-to-have
    }
  }, [vibrationEnabled])

  /**
   * Light tap - for selections, toggles, minor interactions
   */
  const tapLight = useCallback(() => haptic('light'), [haptic])

  /**
   * Medium tap - for button presses, standard interactions
   */
  const tapMedium = useCallback(() => haptic('medium'), [haptic])

  /**
   * Heavy tap - for important confirmations
   */
  const tapHeavy = useCallback(() => haptic('heavy'), [haptic])

  /**
   * Success feedback - for completed actions
   */
  const success = useCallback(() => haptic('success'), [haptic])

  /**
   * Error feedback - for failed actions
   */
  const error = useCallback(() => haptic('error'), [haptic])

  /**
   * Warning feedback - for alerts
   */
  const warning = useCallback(() => haptic('warning'), [haptic])

  /**
   * Selection feedback - ultra-light for UI selections
   */
  const selection = useCallback(() => haptic('selection'), [haptic])

  return {
    haptic,
    tapLight,
    tapMedium,
    tapHeavy,
    success,
    error,
    warning,
    selection,
  }
}

/**
 * Standalone haptic function for use outside React components
 * Note: This doesn't respect user settings - use the hook when possible
 */
export function triggerHaptic(pattern: HapticPattern = 'light') {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return

  try {
    const vibrationPattern = patterns[pattern]
    navigator.vibrate(vibrationPattern)
  } catch (e) {
    // Silently fail
  }
}
