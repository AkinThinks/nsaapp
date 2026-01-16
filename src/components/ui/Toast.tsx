'use client'

import { useEffect, useState, createContext, useContext, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  const toast = {
    success: (title: string, description?: string) =>
      context.addToast({ type: 'success', title, description, duration: 4000 }),
    error: (title: string, description?: string) =>
      context.addToast({ type: 'error', title, description, duration: 5000 }),
    warning: (title: string, description?: string) =>
      context.addToast({ type: 'warning', title, description, duration: 4000 }),
    info: (title: string, description?: string) =>
      context.addToast({ type: 'info', title, description, duration: 4000 }),
  }

  return { toast, addToast: context.addToast, removeToast: context.removeToast }
}

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[]
  removeToast: (id: string) => void
}) {
  return (
    <div className="fixed bottom-0 right-0 z-[100] p-4 space-y-2 pointer-events-none max-w-md w-full">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, toast.duration || 4000)

    return () => clearTimeout(timer)
  }, [toast.duration, onClose])

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-safety-green" />,
    error: <AlertCircle className="w-5 h-5 text-safety-red" />,
    warning: <AlertTriangle className="w-5 h-5 text-safety-amber" />,
    info: <Info className="w-5 h-5 text-primary" />,
  }

  const backgrounds = {
    success: 'bg-safety-green-light border-safety-green/20',
    error: 'bg-safety-red-light border-safety-red/20',
    warning: 'bg-safety-amber-light border-safety-amber/20',
    info: 'bg-primary-light border-primary/20',
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={cn(
        'pointer-events-auto rounded-xl border p-4 shadow-lg',
        'flex items-start gap-3',
        backgrounds[toast.type]
      )}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground">{toast.title}</p>
        {toast.description && (
          <p className="mt-1 text-sm text-foreground-muted">{toast.description}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 -m-1 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

// Standalone toast function for simple usage
let toastFn: ((type: ToastType, title: string, description?: string) => void) | null = null

export function setToastHandler(handler: typeof toastFn) {
  toastFn = handler
}

export function showToast(type: ToastType, title: string, description?: string) {
  if (toastFn) {
    toastFn(type, title, description)
  } else {
    console.warn('Toast handler not initialized. Wrap your app with ToastProvider.')
  }
}
