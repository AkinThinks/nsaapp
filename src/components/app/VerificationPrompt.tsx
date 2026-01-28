'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Phone, Users, X, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PhoneAuthModal } from '@/components/auth/PhoneAuthModal'
import { useAppStore } from '@/lib/store'

interface VerificationPromptProps {
  isOpen: boolean
  onClose: () => void
  onVerified: () => void
  context?: 'report' | 'confirm' | 'general'
}

/**
 * Contextual Verification Prompt
 *
 * Shows when an unverified user tries to perform an action that requires verification.
 * Designed to be helpful, not punitive - explains WHY and makes verification easy.
 */
export function VerificationPrompt({
  isOpen,
  onClose,
  onVerified,
  context = 'report',
}: VerificationPromptProps) {
  const [showPhoneAuth, setShowPhoneAuth] = useState(false)
  const { setUser, user } = useAppStore()

  const handleVerificationSuccess = (verifiedUser: { id: string; phone: string }) => {
    // Update user in store with verified status
    setUser({
      ...user,
      id: verifiedUser.id,
      phone: verifiedUser.phone,
      phone_verified: true,
      trust_score: user?.trust_score || 0,
      created_at: user?.created_at || new Date().toISOString(),
      last_active: new Date().toISOString(),
    })

    setShowPhoneAuth(false)
    onVerified()
  }

  const contextMessages = {
    report: {
      title: 'Verify to Report',
      subtitle: 'Help keep your community safe',
      reason: 'Verified reports are trusted by your neighbors and help prevent false alarms that could put people at risk.',
    },
    confirm: {
      title: 'Verify to Confirm',
      subtitle: 'Your confirmation matters',
      reason: 'Verified confirmations help the community know which reports are accurate.',
    },
    general: {
      title: 'Verify Your Phone',
      subtitle: 'Join the trusted community',
      reason: 'Phone verification helps us maintain a trusted network of neighbors looking out for each other.',
    },
  }

  const message = contextMessages[context]

  if (!isOpen) return null

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative px-6 pt-6 pb-4">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-50 rounded-2xl mb-4">
                  <AlertTriangle className="w-8 h-8 text-amber-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{message.title}</h2>
                <p className="text-gray-500 mt-1">{message.subtitle}</p>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
              {/* Why verification matters */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {message.reason}
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Your reports get priority</p>
                    <p className="text-xs text-gray-500">Verified reports alert neighbors faster</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Build your trust score</p>
                    <p className="text-xs text-gray-500">Earn reputation in your community</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">SMS backup alerts</p>
                    <p className="text-xs text-gray-500">Get critical alerts even without internet</p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <Button
                onClick={() => setShowPhoneAuth(true)}
                className="w-full btn-primary mb-3"
                size="lg"
              >
                <Phone className="w-5 h-5 mr-2" />
                Verify Now — Takes 30 seconds
              </Button>

              <button
                onClick={onClose}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Phone Auth Modal */}
      <PhoneAuthModal
        isOpen={showPhoneAuth}
        onClose={() => setShowPhoneAuth(false)}
        onSuccess={handleVerificationSuccess}
      />
    </>
  )
}

/**
 * Verification Status Badge
 * Small indicator showing user's verification status
 */
export function VerificationBadge({
  verified,
  compact = false
}: {
  verified: boolean
  compact?: boolean
}) {
  if (compact) {
    return verified ? (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
        <CheckCircle2 className="w-3 h-3" />
        Verified
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-xs text-amber-600">
        <AlertTriangle className="w-3 h-3" />
        Unverified
      </span>
    )
  }

  return verified ? (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
      <CheckCircle2 className="w-3.5 h-3.5" />
      Verified
    </div>
  ) : (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
      <AlertTriangle className="w-3.5 h-3.5" />
      Unverified
    </div>
  )
}
