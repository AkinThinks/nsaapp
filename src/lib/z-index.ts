/**
 * Z-Index Scale System
 * 
 * Centralized z-index values to prevent conflicts
 * Follow this hierarchy:
 * 
 * base: 0 - Default stacking context
 * sticky: 10 - Sticky elements
 * dropdown: 40 - Dropdowns, tooltips
 * fixed: 50 - Fixed navigation, headers
 * overlay: 90 - Overlays, backdrops
 * modal: 100 - Modals, dialogs
 * tooltip: 110 - Tooltips (above modals)
 * max: 9999 - Emergency override (use sparingly)
 */

export const zIndex = {
  base: 0,
  sticky: 10,
  dropdown: 40,
  fixed: 50,
  overlay: 90,
  modal: 100,
  tooltip: 110,
  max: 9999,
} as const

/**
 * Get z-index class name
 */
export function getZIndexClass(level: keyof typeof zIndex): string {
  return `z-[${zIndex[level]}]`
}

/**
 * Get z-index value
 */
export function getZIndexValue(level: keyof typeof zIndex): number {
  return zIndex[level]
}

