'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProgressStepsProps {
  steps: string[]
  currentStep: number
  className?: string
}

export function ProgressSteps({ steps, currentStep, className }: ProgressStepsProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Progress Bar */}
      <div className="relative mb-6">
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep) / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          />
        </div>

        {/* Step Indicators */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between">
          {steps.map((_, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0.8 }}
              animate={{
                scale: index <= currentStep ? 1 : 0.8,
                backgroundColor: index < currentStep
                  ? 'var(--safety-green)'
                  : index === currentStep
                    ? 'var(--primary)'
                    : 'var(--muted)',
              }}
              className={cn(
                'w-3 h-3 rounded-full border-2 border-background-elevated',
                'transition-colors duration-normal'
              )}
            />
          ))}
        </div>
      </div>

      {/* Step Labels (Mobile: Show only current) */}
      <div className="hidden sm:flex justify-between text-xs text-muted-foreground">
        {steps.map((step, index) => (
          <span
            key={index}
            className={cn(
              'transition-colors duration-normal',
              index <= currentStep && 'text-foreground font-medium'
            )}
          >
            {step}
          </span>
        ))}
      </div>

      {/* Mobile: Current step label */}
      <div className="sm:hidden text-center">
        <span className="text-sm font-medium text-foreground">
          Step {currentStep + 1}: {steps[currentStep]}
        </span>
      </div>
    </div>
  )
}

interface VerticalProgressProps {
  steps: {
    title: string
    description?: string
    completed?: boolean
    current?: boolean
  }[]
  className?: string
}

export function VerticalProgress({ steps, className }: VerticalProgressProps) {
  return (
    <div className={cn('space-y-0', className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1

        return (
          <div key={index} className="relative flex gap-4">
            {/* Line and Circle */}
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  'border-2 transition-all duration-normal z-10',
                  step.completed
                    ? 'bg-safety-green border-safety-green text-white'
                    : step.current
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-background-elevated border-border text-muted-foreground'
                )}
              >
                {step.completed ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </motion.div>
              {!isLast && (
                <div
                  className={cn(
                    'w-0.5 h-full min-h-[2rem]',
                    step.completed ? 'bg-safety-green' : 'bg-border'
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className={cn('pb-8', isLast && 'pb-0')}>
              <h4
                className={cn(
                  'font-medium',
                  step.completed || step.current
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {step.title}
              </h4>
              {step.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface StepIndicatorProps {
  total: number
  current: number
  className?: string
}

export function StepIndicator({ total, current, className }: StepIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {Array.from({ length: total }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.05 }}
          className={cn(
            'h-1.5 rounded-full transition-all duration-normal',
            index === current
              ? 'w-6 bg-primary'
              : index < current
                ? 'w-1.5 bg-primary/50'
                : 'w-1.5 bg-muted'
          )}
        />
      ))}
    </div>
  )
}
