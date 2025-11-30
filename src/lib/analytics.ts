// Analytics utility for custom event tracking

export const trackEvent = (
  eventName: string,
  eventParams?: {
    [key: string]: string | number | boolean | undefined
  }
) => {
  // SSR safety check
  if (typeof window === 'undefined') return

  try {
    // Google Analytics 4
    if (window.gtag && typeof window.gtag === 'function') {
      window.gtag('event', eventName, eventParams)
    }
  } catch (error) {
    // Silently fail analytics tracking to prevent breaking user experience
    // In development, you can uncomment the next line for debugging
    // console.warn('Analytics tracking error:', error)
  }
}

// Predefined event helpers
export const analytics = {
  // Location search
  trackLocationSearch: (query: string, resultCount: number) => {
    trackEvent('location_search', {
      search_query: query,
      results_count: resultCount,
    })
  },

  // Location view
  trackLocationView: (locationId: string, locationName: string, riskLevel: string, userContext: string) => {
    trackEvent('location_view', {
      location_id: locationId,
      location_name: locationName,
      risk_level: riskLevel,
      user_context: userContext,
    })
  },

  // Route check
  trackRouteCheck: (from: string, to: string, riskLevel: string) => {
    trackEvent('route_check', {
      route_from: from,
      route_to: to,
      route_risk: riskLevel,
    })
  },

  // Share action
  trackShare: (platform: string, locationId?: string) => {
    trackEvent('share', {
      share_platform: platform,
      location_id: locationId,
    })
  },

  // Emergency contact click
  trackEmergencyContact: (contactType: string, locationId?: string) => {
    trackEvent('emergency_contact_click', {
      contact_type: contactType,
      location_id: locationId,
    })
  },

  // Context change
  trackContextChange: (context: string, locationId?: string) => {
    trackEvent('context_change', {
      user_context: context,
      location_id: locationId,
    })
  },
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: { [key: string]: any }
    ) => void
    dataLayer?: any[]
  }
}

