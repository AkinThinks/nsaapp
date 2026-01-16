'use client'

import { motion } from 'framer-motion'
import {
  Shield,
  MapPin,
  Bell,
  Search,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Users
} from 'lucide-react'
import { cn } from '@/lib/utils'

type EmptyStateType =
  | 'no-alerts'
  | 'no-areas'
  | 'no-results'
  | 'no-notifications'
  | 'no-reports'
  | 'all-safe'
  | 'error'
  | 'no-activity'

interface EmptyStateProps {
  type: EmptyStateType
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const emptyStateConfig: Record<EmptyStateType, {
  icon: React.ReactNode
  defaultTitle: string
  defaultDescription: string
  color: string
}> = {
  'no-alerts': {
    icon: <Shield className="w-12 h-12" />,
    defaultTitle: 'No alerts yet',
    defaultDescription: 'When there are incidents in your areas, they\'ll appear here.',
    color: 'text-muted-foreground',
  },
  'no-areas': {
    icon: <MapPin className="w-12 h-12" />,
    defaultTitle: 'No areas added',
    defaultDescription: 'Add areas to start receiving safety alerts for locations that matter to you.',
    color: 'text-primary',
  },
  'no-results': {
    icon: <Search className="w-12 h-12" />,
    defaultTitle: 'No results found',
    defaultDescription: 'Try searching with different keywords or check your spelling.',
    color: 'text-muted-foreground',
  },
  'no-notifications': {
    icon: <Bell className="w-12 h-12" />,
    defaultTitle: 'Notifications disabled',
    defaultDescription: 'Enable notifications to get instant alerts about incidents near you.',
    color: 'text-safety-amber',
  },
  'no-reports': {
    icon: <FileText className="w-12 h-12" />,
    defaultTitle: 'No reports yet',
    defaultDescription: 'You haven\'t submitted any incident reports. Help your community by reporting incidents you witness.',
    color: 'text-muted-foreground',
  },
  'all-safe': {
    icon: <CheckCircle2 className="w-12 h-12" />,
    defaultTitle: 'All clear!',
    defaultDescription: 'No active incidents reported in your areas. Stay safe out there!',
    color: 'text-safety-green',
  },
  'error': {
    icon: <AlertTriangle className="w-12 h-12" />,
    defaultTitle: 'Something went wrong',
    defaultDescription: 'We couldn\'t load this content. Please try again.',
    color: 'text-safety-red',
  },
  'no-activity': {
    icon: <Users className="w-12 h-12" />,
    defaultTitle: 'No activity yet',
    defaultDescription: 'Your confirmations and community activity will appear here.',
    color: 'text-muted-foreground',
  },
}

export function EmptyState({
  type,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const config = emptyStateConfig[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-6',
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className={cn(
          'w-20 h-20 rounded-full flex items-center justify-center mb-4',
          type === 'all-safe' && 'bg-safety-green-light',
          type === 'error' && 'bg-safety-red-light',
          type === 'no-notifications' && 'bg-safety-amber-light',
          type === 'no-areas' && 'bg-primary-light',
          !['all-safe', 'error', 'no-notifications', 'no-areas'].includes(type) && 'bg-muted'
        )}
      >
        <span className={config.color}>{config.icon}</span>
      </motion.div>

      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title || config.defaultTitle}
      </h3>

      <p className="text-muted-foreground max-w-xs mb-6">
        {description || config.defaultDescription}
      </p>

      {action && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={action.onClick}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary-hover transition-colors"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  )
}

// Inline empty state for smaller contexts
interface InlineEmptyStateProps {
  icon?: React.ReactNode
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function InlineEmptyState({
  icon,
  message,
  action,
  className,
}: InlineEmptyStateProps) {
  return (
    <div className={cn(
      'flex items-center justify-center gap-2 py-8 text-muted-foreground',
      className
    )}>
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <span className="text-sm">{message}</span>
      {action && (
        <button
          onClick={action.onClick}
          className="text-sm text-primary hover:underline font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
