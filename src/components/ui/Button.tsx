'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { forwardRef, useCallback } from 'react'
import { useHaptic } from '@/hooks/useHaptic'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  hapticFeedback?: boolean
  children: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', hapticFeedback = true, className = '', children, onClick, ...props }, ref) => {
    const { tapLight } = useHaptic()

    const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      if (hapticFeedback) {
        tapLight()
      }
      onClick?.(e)
    }, [hapticFeedback, tapLight, onClick])

    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none touch-manipulation select-none min-h-[44px] min-w-[44px] tap-highlight'

    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg active:shadow-sm',
      secondary: 'bg-muted text-foreground border border-border hover:bg-muted/80 hover:border-border/60 shadow-sm hover:shadow-md active:shadow-none',
      ghost: 'text-muted-foreground hover:text-foreground hover:bg-muted/50 active:bg-muted/70',
      danger: 'bg-risk-extreme text-white hover:bg-risk-extreme/90 shadow-md hover:shadow-lg active:shadow-sm',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm min-h-[36px]',
      md: 'px-4 py-2 text-sm min-h-[44px]',
      lg: 'px-6 py-3 text-base min-h-[48px]',
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        onClick={handleClick}
        {...props}
      >
        {children}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

