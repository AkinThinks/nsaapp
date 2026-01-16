'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}
    >
      <div className="text-gray-300 mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1 max-w-sm">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="mt-6">
          {action.label}
        </Button>
      )}
    </motion.div>
  )
}
