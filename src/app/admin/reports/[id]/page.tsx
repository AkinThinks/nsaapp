'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow, format } from 'date-fns'
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  CheckCircle,
  XCircle,
  ExternalLink,
  Loader2,
  AlertTriangle,
  Shield,
  Navigation,
  ThumbsUp,
  ThumbsDown,
  FileText,
  X,
} from 'lucide-react'
import { maskPhone } from '@/lib/admin-auth-client'
import { INCIDENT_TYPES } from '@/types'
import { Badge, StatusBadge } from '@/components/admin/ui'

interface Report {
  id: string
  incident_type: string
  landmark: string | null
  description: string | null
  area_name: string
  state: string
  latitude: number
  longitude: number
  status: string
  moderation_status: string
  removal_reason: string | null
  confirmation_count: number
  denial_count: number
  created_at: string
  moderated_at: string | null
  users: {
    id: string
    phone: string | null
    trust_score: number
  } | null
  moderated_by_admin: {
    full_name: string
    email: string
  } | null
}

interface Confirmation {
  id: string
  confirmation_type: string
  distance_km: number
  created_at: string
}

const REMOVAL_REASONS = [
  'False/inaccurate report',
  'Duplicate report',
  'Spam or test submission',
  'Inappropriate content',
  'Insufficient information',
  'Other',
]

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [report, setReport] = useState<Report | null>(null)
  const [confirmations, setConfirmations] = useState<Confirmation[]>([])
  const [loading, setLoading] = useState(true)
  const [moderating, setModerating] = useState(false)
  const [error, setError] = useState('')
  const [showRemoveModal, setShowRemoveModal] = useState(false)

  const [removalReason, setRemovalReason] = useState('')
  const [internalNotes, setInternalNotes] = useState('')

  useEffect(() => {
    async function fetchReport() {
      try {
        const response = await fetch(`/api/admin/reports/${id}`)
        const data = await response.json()

        if (response.ok) {
          setReport(data.report)
          setConfirmations(data.confirmations || [])
        } else {
          setError(data.error || 'Failed to load report')
        }
      } catch {
        setError('Failed to load report')
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [id])

  const handleModerate = async (action: 'approve' | 'remove') => {
    if (action === 'remove' && !removalReason) {
      setError('Please select a reason for removal')
      return
    }

    setModerating(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/reports/${id}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          reason: removalReason,
          internalNotes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to moderate report')
      }

      router.refresh()
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to moderate report')
    } finally {
      setModerating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading report details...</p>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Report not found</h3>
        <p className="text-sm text-gray-500 mt-1">{error || 'The report you\'re looking for doesn\'t exist.'}</p>
        <Link
          href="/admin/reports"
          className="inline-flex items-center gap-2 mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to reports
        </Link>
      </motion.div>
    )
  }

  const typeConfig = INCIDENT_TYPES.find((t) => t.type === report.incident_type)
  const confirmCount = confirmations.filter((c) => c.confirmation_type === 'confirm').length
  const denyCount = confirmations.filter((c) => c.confirmation_type === 'deny').length
  const totalResponses = confirmCount + denyCount
  const confirmPercentage = totalResponses > 0 ? (confirmCount / totalResponses) * 100 : 0

  const getModerationBadgeVariant = () => {
    switch (report.moderation_status) {
      case 'approved': return 'success'
      case 'removed': return 'danger'
      default: return 'warning'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Back Link */}
      <Link
        href="/admin/reports"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to reports
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
              {typeConfig?.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 capitalize">
                {report.incident_type.replace('_', ' ')}
              </h1>
              <p className="text-gray-500 mt-1 font-mono text-sm">ID: {report.id.slice(0, 8)}...</p>
            </div>
          </div>

          <Badge variant={getModerationBadgeVariant()}>
            {report.moderation_status === 'pending' && 'Pending Review'}
            {report.moderation_status === 'approved' && 'Approved'}
            {report.moderation_status === 'removed' && 'Removed'}
          </Badge>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
          >
            <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Report Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" /> Location
                </div>
                <p className="font-medium text-gray-900">{report.area_name}</p>
                {report.landmark && <p className="text-sm text-gray-600">{report.landmark}</p>}
                <p className="text-sm text-gray-500">{report.state}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" /> Time Reported
                </div>
                <p className="font-medium text-gray-900">
                  {format(new Date(report.created_at), 'PPp')}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User className="w-4 h-4" /> Reporter
                </div>
                <p className="font-medium text-gray-900">
                  {maskPhone(report.users?.phone || null)}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Trust Score:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min(report.users?.trust_score || 0, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{report.users?.trust_score || 0}</span>
                  </div>
                </div>
                {report.users?.id && (
                  <Link
                    href={`/admin/users/${report.users.id}`}
                    className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    View profile <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              <div className="space-y-1">
                <div className="text-sm text-gray-500">Report Status</div>
                <StatusBadge status={report.status} />
              </div>
            </div>

            {/* Description */}
            {report.description && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{report.description}</p>
              </div>
            )}

            {/* Map Link */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <a
                href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <Navigation className="w-4 h-4" />
                View on Google Maps
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </motion.div>

          {/* Confirmations */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
          >
            <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              Community Verification
            </h2>

            {/* Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <ThumbsUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">{confirmCount}</p>
                  <p className="text-sm text-gray-500">Confirmed</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <ThumbsDown className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{denyCount}</p>
                  <p className="text-sm text-gray-500">Denied</p>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            {totalResponses > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500">Confidence meter</span>
                  <span className="font-medium text-gray-700">{Math.round(confirmPercentage)}% positive</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${confirmPercentage}%` }}
                  />
                  <div
                    className="h-full bg-red-500 transition-all"
                    style={{ width: `${100 - confirmPercentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Confirmation list */}
            {confirmations.length > 0 ? (
              <div className="space-y-2">
                {confirmations.map((c, index) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {c.confirmation_type === 'confirm' ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="font-medium text-gray-900 capitalize">{c.confirmation_type}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {c.distance_km.toFixed(1)}km away • {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Shield className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p>No community confirmations yet</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar - Moderation */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm sticky top-20"
          >
            <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              Moderation
            </h2>

            {report.moderation_status !== 'pending' ? (
              <div
                className={`p-5 rounded-xl ${
                  report.moderation_status === 'approved'
                    ? 'bg-emerald-50 border border-emerald-100'
                    : 'bg-red-50 border border-red-100'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {report.moderation_status === 'approved' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <p className="font-semibold text-gray-900">
                    {report.moderation_status === 'approved'
                      ? 'Report Approved'
                      : 'Report Removed'}
                  </p>
                </div>
                {report.removal_reason && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Reason:</span> {report.removal_reason}
                  </p>
                )}
                {report.moderated_by_admin && (
                  <p className="text-sm text-gray-500">
                    By {report.moderated_by_admin.full_name}
                  </p>
                )}
                {report.moderated_at && (
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(report.moderated_at), { addSuffix: true })}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex items-start gap-3"
                  >
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Quick Approve */}
                <button
                  onClick={() => handleModerate('approve')}
                  disabled={moderating}
                  className="w-full py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  {moderating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  Approve Report
                </button>

                {/* Remove with reason */}
                <button
                  onClick={() => setShowRemoveModal(true)}
                  disabled={moderating}
                  className="w-full py-3 bg-white border border-red-300 text-red-600 font-medium rounded-xl hover:bg-red-50 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                  Remove Report
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Remove Modal */}
      <AnimatePresence>
        {showRemoveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowRemoveModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Remove Report</h3>
                <button
                  onClick={() => setShowRemoveModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for removal
                  </label>
                  <select
                    value={removalReason}
                    onChange={(e) => setRemovalReason(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  >
                    <option value="">Select a reason...</option>
                    {REMOVAL_REASONS.map((reason) => (
                      <option key={reason} value={reason}>{reason}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Internal notes (optional)
                  </label>
                  <textarea
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
                    placeholder="Notes for other admins..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowRemoveModal(false)}
                  className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleModerate('remove')}
                  disabled={moderating || !removalReason}
                  className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  {moderating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Remove Report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
