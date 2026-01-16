'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MapPin, Clock, Share2, ChevronRight, CheckCircle2, XCircle } from 'lucide-react'
import {
  RobberyIcon,
  AttackIcon,
  GunshotsIcon,
  KidnappingIcon,
  CheckpointIcon,
  FireIcon,
  AccidentIcon,
  TrafficIcon,
  SuspiciousIcon,
} from '@/components/landing/IncidentIcons'
import type { Alert } from '@/types'

interface IncidentCardProps {
  alert: Alert
  onShare?: () => void
  index?: number
}

// Map incident types to icons
const incidentIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  robbery: RobberyIcon,
  attack: AttackIcon,
  gunshots: GunshotsIcon,
  kidnapping: KidnappingIcon,
  checkpoint: CheckpointIcon,
  fire: FireIcon,
  accident: AccidentIcon,
  traffic: TrafficIcon,
  suspicious: SuspiciousIcon,
}

// Map incident types to labels
const incidentLabels: Record<string, string> = {
  robbery: 'ROBBERY',
  attack: 'ATTACK',
  gunshots: 'GUNSHOTS',
  kidnapping: 'KIDNAPPING',
  checkpoint: 'CHECKPOINT',
  fire: 'FIRE',
  accident: 'ACCIDENT',
  traffic: 'TRAFFIC',
  suspicious: 'SUSPICIOUS',
  other: 'ALERT',
}

// Risk level colors
const riskColors: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  high: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  moderate: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  low: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
}

export function IncidentCard({ alert, onShare, index = 0 }: IncidentCardProps) {
  const router = useRouter()
  const IconComponent = incidentIcons[alert.incident_type] || SuspiciousIcon
  const label = incidentLabels[alert.incident_type] || 'ALERT'
  const riskStyle = riskColors[alert.risk_level?.toLowerCase() || 'moderate'] || riskColors.moderate

  const isHighRisk = ['robbery', 'kidnapping', 'gunshots', 'attack'].includes(alert.incident_type)

  const handleClick = () => {
    router.push(`/app/alert/${alert.id}`)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    onShare?.()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={handleClick}
      className={`bg-white rounded-2xl p-4 cursor-pointer border transition-all hover:shadow-md active:scale-[0.98] ${
        isHighRisk ? 'border-red-200 hover:border-red-300' : 'border-gray-100 hover:border-gray-200'
      }`}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <IconComponent className="w-12 h-12" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${riskStyle.bg} ${riskStyle.text}`}>
              {alert.risk_level?.toUpperCase() || 'ALERT'}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {alert.time_ago}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 mb-0.5">
            {label} — {alert.area_name}
          </h3>

          {/* Landmark */}
          {alert.landmark && (
            <p className="text-sm text-gray-500 line-clamp-1 mb-2">
              Near {alert.landmark}
            </p>
          )}

          {/* Meta Row */}
          <div className="flex items-center gap-4">
            {/* Distance */}
            {alert.distance_km !== undefined && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {formatDistance(alert.distance_km)}
              </span>
            )}

            {/* Confirmations */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs text-emerald-600 font-medium">
                  {alert.confirmation_count}
                </span>
              </div>
              {alert.denial_count > 0 && (
                <div className="flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-xs text-red-500">
                    {alert.denial_count}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end justify-between">
          <button
            onClick={handleShare}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-target"
            aria-label="Share alert"
          >
            <Share2 className="w-4 h-4 text-gray-400" />
          </button>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </div>
      </div>
    </motion.div>
  )
}

// Loading skeleton
export function IncidentCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100">
      <div className="flex gap-3">
        <div className="w-12 h-12 bg-gray-100 rounded-full animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse" />
          <div className="h-5 bg-gray-100 rounded w-2/3 animate-pulse" />
          <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m away`
  return `${km.toFixed(1)}km away`
}
