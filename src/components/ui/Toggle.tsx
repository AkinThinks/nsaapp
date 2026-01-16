'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  label?: string
  description?: string
  className?: string
}

export function Toggle({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  label,
  description,
  className,
}: ToggleProps) {
  const sizes = {
    sm: { track: 'w-9 h-5', thumb: 'w-4 h-4', translate: 16 },
    md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 20 },
    lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 28 },
  }

  const { track, thumb, translate } = sizes[size]

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex shrink-0 cursor-pointer rounded-full',
          'transition-colors duration-normal ease-in-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          track,
          checked ? 'bg-primary' : 'bg-muted',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <motion.span
          className={cn(
            'pointer-events-none inline-block rounded-full bg-white shadow-lg',
            'ring-0 transition-shadow',
            thumb
          )}
          initial={false}
          animate={{
            x: checked ? translate : 2,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
          style={{ marginTop: 2 }}
        />
      </button>
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className={cn(
              'text-sm font-medium text-foreground',
              disabled && 'opacity-50'
            )}>
              {label}
            </span>
          )}
          {description && (
            <span className={cn(
              'text-xs text-muted-foreground',
              disabled && 'opacity-50'
            )}>
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

interface ToggleGroupProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string; description?: string }[]
  className?: string
}

export function ToggleGroup({ value, onChange, options, className }: ToggleGroupProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'w-full p-4 rounded-xl border text-left transition-all duration-fast',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            value === option.value
              ? 'border-primary bg-primary-light'
              : 'border-border hover:border-primary/50 bg-background-elevated'
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                'transition-colors duration-fast',
                value === option.value
                  ? 'border-primary bg-primary'
                  : 'border-muted-foreground'
              )}
            >
              {value === option.value && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 rounded-full bg-white"
                />
              )}
            </div>
            <div>
              <div className="font-medium text-foreground">{option.label}</div>
              {option.description && (
                <div className="text-sm text-muted-foreground">{option.description}</div>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
