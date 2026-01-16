'use client'

import { cn } from '@/lib/utils'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  neutral: 'bg-gray-100 text-gray-700',
}

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

// Convenience exports for common status badges
export function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { variant: BadgeVariant; label: string }> = {
    active: { variant: 'success', label: 'Active' },
    pending: { variant: 'warning', label: 'Pending' },
    approved: { variant: 'success', label: 'Approved' },
    removed: { variant: 'danger', label: 'Removed' },
    warned: { variant: 'warning', label: 'Warned' },
    suspended: { variant: 'warning', label: 'Suspended' },
    banned: { variant: 'danger', label: 'Banned' },
    ended: { variant: 'neutral', label: 'Ended' },
  }

  const config = statusMap[status.toLowerCase()] || { variant: 'neutral' as BadgeVariant, label: status }

  return <Badge variant={config.variant}>{config.label}</Badge>
}

export function RoleBadge({ role }: { role: string }) {
  const roleMap: Record<string, { variant: BadgeVariant; label: string }> = {
    super_admin: { variant: 'danger', label: 'Super Admin' },
    admin: { variant: 'info', label: 'Admin' },
    moderator: { variant: 'success', label: 'Moderator' },
    analyst: { variant: 'warning', label: 'Analyst' },
    support: { variant: 'neutral', label: 'Support' },
  }

  const config = roleMap[role.toLowerCase()] || { variant: 'neutral' as BadgeVariant, label: role }

  return <Badge variant={config.variant}>{config.label}</Badge>
}

export function RiskBadge({ level }: { level: string }) {
  const riskMap: Record<string, { variant: BadgeVariant; label: string }> = {
    critical: { variant: 'danger', label: 'CRITICAL' },
    high: { variant: 'warning', label: 'HIGH' },
    medium: { variant: 'info', label: 'MEDIUM' },
    low: { variant: 'success', label: 'LOW' },
  }

  const config = riskMap[level.toLowerCase()] || { variant: 'neutral' as BadgeVariant, label: level }

  return <Badge variant={config.variant}>{config.label}</Badge>
}
