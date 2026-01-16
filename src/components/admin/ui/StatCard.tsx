'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

type IconColor = 'emerald' | 'blue' | 'amber' | 'red' | 'purple' | 'gray'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  iconColor?: IconColor
  trend?: {
    value: number
    label: string
  }
  className?: string
}

const iconColorStyles: Record<IconColor, string> = {
  emerald: 'bg-emerald-100 text-emerald-600',
  blue: 'bg-blue-100 text-blue-600',
  amber: 'bg-amber-100 text-amber-600',
  red: 'bg-red-100 text-red-600',
  purple: 'bg-purple-100 text-purple-600',
  gray: 'bg-gray-100 text-gray-600',
}

export function StatCard({ title, value, icon, iconColor = 'emerald', trend, className }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'bg-white rounded-xl border border-gray-200 p-6',
        'hover:shadow-md transition-shadow duration-200',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', iconColorStyles[iconColor])}>
          {icon}
        </div>
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium',
              trend.value >= 0 ? 'text-green-600' : 'text-red-600'
            )}
          >
            {trend.value >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{title}</p>
      </div>
      {trend && <p className="text-xs text-gray-400 mt-2">{trend.label}</p>}
    </motion.div>
  )
}

// Skeleton version for loading state
export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-xl bg-gray-200" />
      </div>
      <div className="mt-4">
        <div className="h-8 w-20 bg-gray-200 rounded" />
        <div className="h-4 w-32 bg-gray-200 rounded mt-2" />
      </div>
    </div>
  )
}
