'use client'

import { MapPin, ChevronRight } from 'lucide-react'

interface LocationPillProps {
  areaName: string
  onClick?: () => void
}

export function LocationPill({ areaName, onClick }: LocationPillProps) {
  return (
    <div className="max-w-lg mx-auto px-4 pb-3">
      <button
        onClick={onClick}
        className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-sm text-emerald-800 hover:bg-emerald-100 transition-colors touch-target"
      >
        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
        <span className="font-medium">Near {areaName}</span>
        <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
      </button>
    </div>
  )
}
