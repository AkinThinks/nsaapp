'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow, format } from 'date-fns'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  LogIn,
  LogOut,
  CheckCircle,
  XCircle,
  AlertTriangle,
  UserPlus,
  UserMinus,
  Shield,
  History,
  Filter,
  Calendar,
  Globe,
  ExternalLink,
  Clock,
} from 'lucide-react'
import { Badge } from '@/components/admin/ui'
import { TableSkeleton, CardListSkeleton } from '@/components/admin/ui/Skeleton'

interface AuditLog {
  id: string
  admin_id: string
  admin_email: string
  action: string
  entity_type: string | null
  entity_id: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

const ACTION_FILTERS = [
  { value: '', label: 'All Actions' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'approve', label: 'Approve' },
  { value: 'remove', label: 'Remove' },
  { value: 'warn', label: 'Warn' },
  { value: 'ban', label: 'Ban' },
  { value: 'create', label: 'Create' },
]

export default function AdminAuditLogPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const page = parseInt(searchParams.get('page') || '1')
  const actionFilter = searchParams.get('action') || ''

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      if (actionFilter) params.set('action', actionFilter)

      const response = await fetch(`/api/admin/audit-log?${params}`)
      const data = await response.json()

      if (response.ok) {
        setLogs(data.logs || [])
        setTotalPages(data.totalPages || 1)
        setTotal(data.total || 0)
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }, [page, actionFilter])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    if (!updates.page) {
      params.set('page', '1')
    }
    router.push(`/admin/audit-log?${params}`)
  }

  const getActionIcon = (action: string) => {
    if (action === 'login') return <LogIn className="w-4 h-4" />
    if (action === 'logout') return <LogOut className="w-4 h-4" />
    if (action.includes('approve')) return <CheckCircle className="w-4 h-4" />
    if (action.includes('remove')) return <XCircle className="w-4 h-4" />
    if (action.includes('warn')) return <AlertTriangle className="w-4 h-4" />
    if (action.includes('ban') || action.includes('suspend')) return <UserMinus className="w-4 h-4" />
    if (action.includes('unban')) return <UserPlus className="w-4 h-4" />
    if (action.includes('create')) return <UserPlus className="w-4 h-4" />
    if (action.includes('deactivate')) return <UserMinus className="w-4 h-4" />
    return <Shield className="w-4 h-4" />
  }

  const getActionVariant = (action: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' => {
    if (action === 'login') return 'success'
    if (action === 'logout') return 'neutral'
    if (action.includes('approve')) return 'success'
    if (action.includes('remove')) return 'danger'
    if (action.includes('warn')) return 'warning'
    if (action.includes('ban') || action.includes('suspend')) return 'danger'
    if (action.includes('unban')) return 'success'
    if (action.includes('create')) return 'info'
    if (action.includes('deactivate')) return 'neutral'
    return 'neutral'
  }

  const formatAction = (action: string) => {
    return action
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const getEntityLink = (log: AuditLog) => {
    if (!log.entity_type || !log.entity_id) return null

    switch (log.entity_type) {
      case 'report':
        return `/admin/reports/${log.entity_id}`
      case 'user':
        return `/admin/users/${log.entity_id}`
      case 'admin':
        return `/admin/team`
      default:
        return null
    }
  }

  const getInitials = (email: string) => email.charAt(0).toUpperCase()

  const exportCSV = () => {
    const headers = ['Time', 'Admin', 'Action', 'Entity', 'Details', 'IP Address']
    const rows = logs.map((log) => [
      new Date(log.created_at).toISOString(),
      log.admin_email,
      log.action,
      log.entity_type ? `${log.entity_type}:${log.entity_id?.slice(0, 8)}` : '',
      log.details ? JSON.stringify(log.details) : '',
      log.ip_address || '',
    ])

    const csv = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-sm text-gray-500 mt-1">
            {total.toLocaleString()} total {total === 1 ? 'entry' : 'entries'}
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={actionFilter}
            onChange={(e) => updateFilters({ action: e.target.value })}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors min-w-[160px]"
          >
            {ACTION_FILTERS.map((filter) => (
              <option key={filter.value} value={filter.value}>{filter.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <>
          <div className="hidden md:block"><TableSkeleton rows={10} cols={4} /></div>
          <div className="md:hidden"><CardListSkeleton count={5} /></div>
        </>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <History className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No audit logs</h3>
          <p className="text-sm text-gray-500 mt-1">
            {actionFilter ? 'Try adjusting your filters.' : 'Activity will appear here once admins take actions.'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Timeline View */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="divide-y divide-gray-100">
              <AnimatePresence mode="popLayout">
                {logs.map((log, index) => {
                  const entityLink = getEntityLink(log)
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className="p-5 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* Admin Avatar */}
                        <div className="w-10 h-10 bg-gray-900 text-white rounded-lg flex items-center justify-center text-sm font-medium flex-shrink-0">
                          {getInitials(log.admin_email)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-medium text-gray-900">{log.admin_email}</span>
                            <Badge variant={getActionVariant(log.action)}>
                              {getActionIcon(log.action)}
                              <span className="ml-1">{formatAction(log.action)}</span>
                            </Badge>
                          </div>

                          {/* Entity Link */}
                          {entityLink && (
                            <Link
                              href={entityLink}
                              className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 mt-2 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              View {log.entity_type} {log.entity_id?.slice(0, 8)}...
                            </Link>
                          )}

                          {/* Details */}
                          {log.details && Object.keys(log.details).length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {Object.entries(log.details)
                                .filter(([key]) => key !== 'userAgent')
                                .map(([key, value]) => (
                                  <span
                                    key={key}
                                    className="inline-flex items-center px-2 py-1 bg-gray-100 rounded text-xs text-gray-600"
                                  >
                                    <span className="text-gray-400 mr-1">{key}:</span>
                                    <span className="font-medium text-gray-700">{String(value)}</span>
                                  </span>
                                ))}
                            </div>
                          )}
                        </div>

                        {/* Time and IP */}
                        <div className="text-right flex-shrink-0">
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                          </div>
                          {log.ip_address && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1 justify-end">
                              <Globe className="w-3 h-3" />
                              {log.ip_address}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-500">
                  Page <span className="font-medium text-gray-900">{page}</span> of{' '}
                  <span className="font-medium text-gray-900">{totalPages}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateFilters({ page: String(page - 1) })}
                    disabled={page <= 1}
                    className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <button
                    onClick={() => updateFilters({ page: String(page + 1) })}
                    disabled={page >= totalPages}
                    className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {logs.map((log, index) => {
              const entityLink = getEntityLink(log)
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-900 text-white rounded-lg flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {getInitials(log.admin_email)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{log.admin_email}</div>
                      <div className="mt-1">
                        <Badge variant={getActionVariant(log.action)}>
                          {getActionIcon(log.action)}
                          <span className="ml-1">{formatAction(log.action)}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {entityLink && (
                    <Link
                      href={entityLink}
                      className="inline-flex items-center gap-1 text-sm text-emerald-600 mt-3"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View {log.entity_type}
                    </Link>
                  )}

                  {log.details && Object.keys(log.details).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Object.entries(log.details)
                        .filter(([key]) => key !== 'userAgent')
                        .slice(0, 3)
                        .map(([key, value]) => (
                          <span
                            key={key}
                            className="inline-flex items-center px-2 py-1 bg-gray-100 rounded text-xs text-gray-600"
                          >
                            <span className="text-gray-400 mr-1">{key}:</span>
                            <span className="font-medium text-gray-700">{String(value).slice(0, 20)}</span>
                          </span>
                        ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(new Date(log.created_at), 'MMM d, HH:mm')}
                    </div>
                    {log.ip_address && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Globe className="w-3 h-3" />
                        {log.ip_address}
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}

            {/* Mobile Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => updateFilters({ page: String(page - 1) })}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <span className="text-sm text-gray-500">{page} / {totalPages}</span>
                <button
                  onClick={() => updateFilters({ page: String(page + 1) })}
                  disabled={page >= totalPages}
                  className="inline-flex items-center gap-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  )
}
