'use client'

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  success?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, success, hint, leftIcon, rightIcon, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          <input
            type={isPassword && showPassword ? 'text' : type}
            className={cn(
              'w-full rounded-lg border bg-background-elevated px-4 py-3',
              'text-foreground placeholder:text-muted-foreground',
              'transition-all duration-fast',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              leftIcon && 'pl-10',
              (rightIcon || isPassword) && 'pr-10',
              error && 'border-safety-red focus:ring-safety-red/20 focus:border-safety-red',
              success && 'border-safety-green focus:ring-safety-green/20 focus:border-safety-green',
              !error && !success && 'border-border hover:border-border/80',
              className
            )}
            ref={ref}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
          {rightIcon && !isPassword && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-1.5 text-sm text-safety-red flex items-center gap-1"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.p>
          )}
          {success && !error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-1.5 text-sm text-safety-green flex items-center gap-1"
            >
              <CheckCircle2 className="w-4 h-4" />
              {success}
            </motion.p>
          )}
          {hint && !error && !success && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-1.5 text-sm text-muted-foreground"
            >
              {hint}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

Input.displayName = 'Input'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  maxLength?: number
  showCount?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, maxLength, showCount, value, ...props }, ref) => {
    const charCount = typeof value === 'string' ? value.length : 0

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            className={cn(
              'w-full rounded-lg border bg-background-elevated px-4 py-3',
              'text-foreground placeholder:text-muted-foreground',
              'transition-all duration-fast resize-none',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-safety-red focus:ring-safety-red/20 focus:border-safety-red',
              !error && 'border-border hover:border-border/80',
              className
            )}
            ref={ref}
            value={value}
            maxLength={maxLength}
            {...props}
          />
          {showCount && maxLength && (
            <div className="absolute bottom-2 right-3 text-xs text-muted-foreground">
              {charCount}/{maxLength}
            </div>
          )}
        </div>
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-1.5 text-sm text-safety-red flex items-center gap-1"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.p>
          )}
          {hint && !error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-1.5 text-sm text-muted-foreground"
            >
              {hint}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
