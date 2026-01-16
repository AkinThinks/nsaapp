'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react'

interface StatusBannerProps {
  status: 'safe' | 'alert'
  alertCount?: number
  lastChecked?: string
  onClick?: () => void
}

export function StatusBanner({
  status,
  alertCount = 0,
  lastChecked = 'just now',
  onClick,
}: StatusBannerProps) {
  return (
    <AnimatePresence mode="wait">
      {status === 'alert' ? (
        <motion.div
          key="alert"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          onClick={onClick}
          className="bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 rounded-2xl p-4 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {alertCount} active alert{alertCount !== 1 ? 's' : ''} nearby
              </h3>
              <p className="text-sm text-gray-600">
                Tap to see details and stay safe
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="safe"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">All quiet in your areas</h3>
              <p className="text-sm text-gray-600">
                Last checked: {lastChecked}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
