'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow, format } from 'date-fns'
import {
  ArrowLeft,
  MapPin,
  FileText,
  CheckCircle,
  Target,
  AlertTriangle,
  Loader2,
  Ban,
  Clock,
  User,
  Shield,
  X,
  History,
  ExternalLink,
  Phone,
  Calendar,
} from 'lucide-react'
import { maskPhone } from '@/lib/admin-auth-client'
import { Badge, StatusBadge } from '@/components/admin/ui'
import { StatCard } from '@/components/admin/ui/StatCard'

interface UserData {
  id: string
  phone: string | null
  status: string
  status_reason: string | null
  status_until: string | null
  trust_score: number
  warning_count: number
  created_at: string
  last_active: string
}

interface Location {
  id: string
  area_name: string
  state: string
  is_primary: boolean
}

interface Report {
  id: string
  incident_type: string
  area_name: string
  status: string
  created_at: string
}

interface ModerationAction {
  id: string
  action: string
  reason: string | null
  created_at: string
  admin_users: { full_name: string } | null
}

interface Stats {
  reportCount: number
  confirmationCount: number
  accuracy: number
  warningCount: number
}

const WARNING_REASONS = [
  'False report submitted',
  'Spam or duplicate reports',
  'Inappropriate content',
  'Misuse of platform',
  'Other',
]

const BAN_REASONS = [
  'Repeated false reports',
  'Harassment of other users',
  'Severe policy violation',
  'Fraudulent activity',
  'Other',
]

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [user, setUser] = useState<UserData | null>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [moderationHistory, setModerationHistory] = useState<ModerationAction[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  const [showWarnModal, setShowWarnModal] = useState(false)
  const [showBanModal, setShowBanModal] = useState(false)
  const [actionReason, setActionReason] = useState('')
  const [banDuration, setBanDuration] = useState<number | null>(7)

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(`/api/admin/users/${id}`)
        const data = await response.json()

        if (response.ok) {
          setUser(data.user)
          setLocations(data.locations)
          setReports(data.reports)
          setModerationHistory(data.moderationHistory)
          setStats(data.stats)
        } else {
          setError(data.error || 'Failed to load user')
        }
      } catch {
        setError('Failed to load user')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [id])

  const handleWarn = async () => {
    if (!actionReason) {
      setError('Please select a reason')
      return
    }

    setActionLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/users/${id}/warn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: actionReason }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to warn user')
      }

      setShowWarnModal(false)
      setActionReason('')
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to warn user')
    } finally {
      setActionLoading(false)
    }
  }

  const handleBan = async () => {
    if (!actionReason) {
      setError('Please select a reason')
      return
    }

    setActionLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/users/${id}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: actionReason, duration: banDuration }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to ban user')
      }

      setShowBanModal(false)
      setActionReason('')
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to ban user')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnban = async () => {
    setActionLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/users/${id}/ban`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to unban user')
      }

      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unban user')
    } finally {
      setActionLoading(false)
    }
  }

  const getTrustColor = (score: number) => {
    if (score >= 70) return 'bg-emerald-500'
    if (score >= 40) return 'bg-amber-500'
    return 'bg-red-500'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading user details...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">User not found</h3>
        <p className="text-sm text-gray-500 mt-1">{error || 'The user you\'re looking for doesn\'t exist.'}</p>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to users
        </Link>
      </motion.div>
    )
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
        href="/admin/users"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to users
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
            <div className="w-14 h-14 bg-gray-900 text-white rounded-xl flex items-center justify-center text-xl font-medium flex-shrink-0">
              {user.phone ? user.phone.slice(-2) : '??'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <h1 className="text-2xl font-bold text-gray-900">{maskPhone(user.phone)}</h1>
              </div>
              <p className="text-gray-500 mt-1 font-mono text-sm">ID: {user.id.slice(0, 8)}...</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {format(new Date(user.created_at), 'MMM d, yyyy')}
                </span>
                <span>•</span>
                <span>
                  Last active {user.last_active ? formatDistanceToNow(new Date(user.last_active), { addSuffix: true }) : 'Never'}
                </span>
              </div>
            </div>
          </div>
          <StatusBadge status={user.status || 'active'} />
        </div>

        {/* Status reason if exists */}
        {user.status_reason && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl"
          >
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Status reason:</span> {user.status_reason}
            </p>
            {user.status_until && (
              <p className="text-sm text-amber-700 mt-1">
                Until: {format(new Date(user.status_until), 'PPp')}
              </p>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Reports Submitted"
          value={stats?.reportCount || 0}
          icon={<FileText className="w-5 h-5" />}
          iconColor="blue"
        />
        <StatCard
          title="Confirmations"
          value={stats?.confirmationCount || 0}
          icon={<CheckCircle className="w-5 h-5" />}
          iconColor="emerald"
        />
        <StatCard
          title="Accuracy"
          value={`${stats?.accuracy || 0}%`}
          icon={<Target className="w-5 h-5" />}
          iconColor="purple"
        />
        <StatCard
          title="Warnings"
          value={stats?.warningCount || 0}
          icon={<AlertTriangle className="w-5 h-5" />}
          iconColor="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Monitored Areas */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
          >
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              Monitored Areas
            </h2>
            {locations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p>No areas monitored</p>
              </div>
            ) : (
              <div className="space-y-2">
                {locations.map((loc, index) => (
                  <motion.div
                    key={loc.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="flex items-center gap-3 py-3 px-4 bg-gray-50 rounded-lg"
                  >
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{loc.area_name}</span>
                    <span className="text-sm text-gray-500">{loc.state}</span>
                    {loc.is_primary && (
                      <Badge variant="success" className="ml-auto">Primary</Badge>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Report History */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
          >
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Recent Reports
            </h2>
            {reports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p>No reports submitted</p>
              </div>
            ) : (
              <div className="space-y-2">
                {reports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <Link
                      href={`/admin/reports/${report.id}`}
                      className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900 capitalize">
                          {report.incident_type.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-gray-500">{report.area_name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                        </span>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Moderation History */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
          >
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-600" />
              Moderation History
            </h2>
            {moderationHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Shield className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p>No moderation actions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {moderationHistory.map((action, index) => (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="py-4 px-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={
                          action.action === 'banned'
                            ? 'danger'
                            : action.action === 'warned'
                              ? 'warning'
                              : action.action === 'unbanned'
                                ? 'success'
                                : 'neutral'
                        }
                      >
                        {action.action}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        by {action.admin_users?.full_name || 'Admin'}
                      </span>
                    </div>
                    {action.reason && (
                      <p className="text-sm text-gray-600 mt-1">{action.reason}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {formatDistanceToNow(new Date(action.created_at), { addSuffix: true })}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar - Actions */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm sticky top-20"
          >
            <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              Actions
            </h2>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex items-start gap-3"
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="space-y-3">
              {user.status !== 'banned' && user.status !== 'suspended' ? (
                <>
                  <button
                    onClick={() => setShowWarnModal(true)}
                    className="w-full py-3 bg-amber-600 text-white font-medium rounded-xl hover:bg-amber-700 flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <AlertTriangle className="w-5 h-5" />
                    Issue Warning
                  </button>
                  <button
                    onClick={() => {
                      setBanDuration(7)
                      setShowBanModal(true)
                    }}
                    className="w-full py-3 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700 flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <Clock className="w-5 h-5" />
                    Suspend (7 days)
                  </button>
                  <button
                    onClick={() => {
                      setBanDuration(null)
                      setShowBanModal(true)
                    }}
                    className="w-full py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <Ban className="w-5 h-5" />
                    Ban User
                  </button>
                </>
              ) : (
                <button
                  onClick={handleUnban}
                  disabled={actionLoading}
                  className="w-full py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {actionLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  Unban User
                </button>
              )}
            </div>

            {/* Trust Score */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Trust Score</span>
                <span className="text-lg font-bold text-gray-900">{user.trust_score}</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(user.trust_score, 100)}%` }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className={`h-full rounded-full ${getTrustColor(user.trust_score)}`}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {user.trust_score >= 70
                  ? 'High trust - Reliable contributor'
                  : user.trust_score >= 40
                    ? 'Moderate trust - Monitor activity'
                    : 'Low trust - Review reports carefully'}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Warn Modal */}
      <AnimatePresence>
        {showWarnModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowWarnModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Issue Warning</h3>
                <button
                  onClick={() => setShowWarnModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for warning
                </label>
                <select
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                >
                  <option value="">Select a reason...</option>
                  {WARNING_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowWarnModal(false)
                    setActionReason('')
                  }}
                  className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWarn}
                  disabled={actionLoading || !actionReason}
                  className="flex-1 py-2.5 bg-amber-600 text-white font-medium rounded-xl hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Issue Warning
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ban Modal */}
      <AnimatePresence>
        {showBanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowBanModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {banDuration ? `Suspend User (${banDuration} days)` : 'Ban User Permanently'}
                </h3>
                <button
                  onClick={() => setShowBanModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <select
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                >
                  <option value="">Select a reason...</option>
                  {BAN_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowBanModal(false)
                    setActionReason('')
                  }}
                  className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBan}
                  disabled={actionLoading || !actionReason}
                  className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {banDuration ? 'Suspend' : 'Ban'} User
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
