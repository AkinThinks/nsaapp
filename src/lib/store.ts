import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  User,
  UserLocation,
  Report,
  Coordinates,
  AreaSearchResult,
} from '@/types'

interface AppState {
  // Hydration state
  _hasHydrated: boolean
  setHasHydrated: (value: boolean) => void
  // User
  user: User | null
  setUser: (user: User | null) => void

  // User's saved locations
  savedLocations: UserLocation[]
  setSavedLocations: (locations: UserLocation[]) => void
  addLocation: (location: UserLocation) => void
  removeLocation: (id: string) => void

  // Current GPS location
  currentLocation: Coordinates | null
  currentArea: AreaSearchResult | null
  setCurrentLocation: (
    coords: Coordinates | null,
    area: AreaSearchResult | null
  ) => void

  // Alerts/Reports
  reports: Report[]
  setReports: (reports: Report[]) => void
  addReport: (report: Report) => void
  updateReport: (id: string, updates: Partial<Report>) => void

  // Onboarding
  hasCompletedOnboarding: boolean
  setHasCompletedOnboarding: (value: boolean) => void

  // UI State
  isOnline: boolean
  setIsOnline: (value: boolean) => void
  isPushEnabled: boolean
  setIsPushEnabled: (value: boolean) => void

  // Notification preferences
  vibrationEnabled: boolean
  setVibrationEnabled: (value: boolean) => void

  // Reset
  reset: () => void
}

const initialState = {
  _hasHydrated: false,
  user: null,
  savedLocations: [],
  currentLocation: null,
  currentArea: null,
  reports: [],
  hasCompletedOnboarding: false,
  isOnline: true,
  isPushEnabled: false,
  vibrationEnabled: true, // Vibration on by default
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Hydration
      setHasHydrated: (value) => set({ _hasHydrated: value }),

      // User
      setUser: (user) => set({ user }),

      // Saved locations
      setSavedLocations: (locations) => set({ savedLocations: locations }),
      addLocation: (location) =>
        set((state) => ({
          savedLocations: [...state.savedLocations, location],
        })),
      removeLocation: (id) =>
        set((state) => ({
          savedLocations: state.savedLocations.filter((loc) => loc.id !== id),
        })),

      // Current GPS location
      setCurrentLocation: (coords, area) =>
        set({ currentLocation: coords, currentArea: area }),

      // Reports
      setReports: (reports) => set({ reports }),
      addReport: (report) =>
        set((state) => ({
          reports: [report, ...state.reports],
        })),
      updateReport: (id, updates) =>
        set((state) => ({
          reports: state.reports.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      // Onboarding
      setHasCompletedOnboarding: (value) =>
        set({ hasCompletedOnboarding: value }),

      // UI State
      setIsOnline: (value) => set({ isOnline: value }),
      setIsPushEnabled: (value) => set({ isPushEnabled: value }),

      // Notification preferences
      setVibrationEnabled: (value) => set({ vibrationEnabled: value }),

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: 'safetyalerts-storage',
      partialize: (state) => ({
        user: state.user,
        savedLocations: state.savedLocations,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        isPushEnabled: state.isPushEnabled,
        vibrationEnabled: state.vibrationEnabled,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
