'use client'

// Custom SVG Icons (clean, professional, not emoji-like)

export function RobberyIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="24" cy="24" r="20" fill="#FEE2E2" />
      <circle cx="24" cy="24" r="12" fill="#DC2626" />
      <path d="M20 22h8M20 26h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function AttackIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="24" cy="24" r="20" fill="#FEE2E2" />
      <path
        d="M24 14L28 24L24 34L20 24L24 14Z"
        fill="#DC2626"
        stroke="#DC2626"
        strokeWidth="2"
      />
      <circle cx="24" cy="24" r="3" fill="white" />
    </svg>
  )
}

export function GunshotsIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="24" cy="24" r="20" fill="#FEE2E2" />
      <path
        d="M15 24h18M24 15v18M18 18l12 12M30 18L18 30"
        stroke="#DC2626"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function KidnappingIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="24" cy="24" r="20" fill="#FEE2E2" />
      <path
        d="M24 16v4M20 18h8M17 26c0 4 3 6 7 6s7-2 7-6"
        stroke="#DC2626"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="24" cy="24" r="8" stroke="#DC2626" strokeWidth="2" fill="none" />
    </svg>
  )
}

export function CheckpointIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="24" cy="24" r="20" fill="#FEF3C7" />
      <rect x="18" y="14" width="12" height="20" rx="2" fill="#F59E0B" />
      <rect x="20" y="16" width="8" height="4" rx="1" fill="white" />
      <rect x="20" y="22" width="8" height="4" rx="1" fill="white" />
      <rect x="20" y="28" width="8" height="4" rx="1" fill="white" />
    </svg>
  )
}

export function FireIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="24" cy="24" r="20" fill="#FFEDD5" />
      <path
        d="M24 12c0 8-8 10-8 18 0 4.5 3.5 8 8 8s8-3.5 8-8c0-8-8-10-8-18z"
        fill="#F97316"
      />
      <path
        d="M24 22c0 4-4 5-4 9 0 2.2 1.8 4 4 4s4-1.8 4-4c0-4-4-5-4-9z"
        fill="#FED7AA"
      />
    </svg>
  )
}

export function AccidentIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="24" cy="24" r="20" fill="#FFEDD5" />
      <rect x="14" y="20" width="20" height="10" rx="2" fill="#F97316" />
      <circle cx="18" cy="32" r="3" fill="#F97316" />
      <circle cx="30" cy="32" r="3" fill="#F97316" />
      <rect x="20" y="22" width="8" height="4" rx="1" fill="white" />
    </svg>
  )
}

export function TrafficIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="24" cy="24" r="20" fill="#FEF9C3" />
      <rect x="16" y="12" width="16" height="24" rx="2" fill="#EAB308" />
      <rect x="12" y="18" width="4" height="3" fill="#EAB308" />
      <rect x="32" y="18" width="4" height="3" fill="#EAB308" />
      <rect x="12" y="27" width="4" height="3" fill="#EAB308" />
      <rect x="32" y="27" width="4" height="3" fill="#EAB308" />
    </svg>
  )
}

export function SuspiciousIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="24" cy="24" r="20" fill="#FEF3C7" />
      <circle cx="18" cy="22" r="3" fill="#F59E0B" />
      <circle cx="30" cy="22" r="3" fill="#F59E0B" />
      <path
        d="M18 30c0-2 3-4 6-4s6 2 6 4"
        stroke="#F59E0B"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
