'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  FileText,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react'
import { maskPhone } from '@/lib/admin-auth-client'
import { INCIDENT_TYPES } from '@/types'
import { Badge, StatusBadge } from '@/components/admin/ui'
import { TableSkeleton, CardListSkeleton } from '@/components/admin/ui/Skeleton'

interface Report {
  id: string
  incident_type: string
  landmark: string | null
  area_name: string
  status: string
  moderation_status: string
  image_moderation_status?: string
  text_moderation_status?: string
  photo_url?: string
  photo_thumb_url?: string
  confirmation_count: number
  denial_count: number
  created_at: string
  users: {
    phone: string | null
    trust_score: number
  } | null
}

export default function AdminReportsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Filters from URL
  const page = parseInt(searchParams.get('page') || '1')
  const search = searchParams.get('search') || ''
  const type = searchParams.get('type') || ''
  const status = searchParams.get('status') || ''

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      if (search) params.set('search', search)
      if (type) params.set('type', type)
      if (status) params.set('moderation_status', status)

      const response = await fetch(`/api/admin/reports?${params}`)
      const data = await response.json()

      if (response.ok) {
        setReports(data.reports || [])
        setTotalPages(data.totalPages || 1)
        setTotal(data.total || 0)
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }, [page, search, type, status])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  // Update URL params
  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    // Reset to page 1 when filters change
    if (!updates.page) {
      params.set('page', '1')
    }
    router.push(`/admin/reports?${params}`)
  }

  const getTypeBadge = (incidentType: string) => {
    const config = INCIDENT_TYPES.find((t) => t.type === incidentType)
    const variant = config?.color === 'red' ? 'danger' : config?.color === 'orange' ? 'warning' : 'neutral'

    return (
      <Badge variant={variant as 'danger' | 'warning' | 'neutral'}>
        {config?.icon} {config?.label || incidentType}
      </Badge>
    )
  }

  const getModerationBadge = (moderationStatus: string) => {
    switch (moderationStatus) {
      case 'pending':
        return (
          <Badge variant="warning">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case 'flagged':
        return (
          <Badge variant="danger">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Flagged
          </Badge>
        )
      case 'approved':
        return (
          <Badge variant="success">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        )
      case 'removed':
        return (
          <Badge variant="danger">
            <XCircle className="w-3 h-3 mr-1" />
            Removed
          </Badge>
        )
      default:
        return <Badge variant="neutral">{moderationStatus}</Badge>
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">
            {total.toLocaleString()} total report{total !== 1 ? 's' : ''} from the community
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by area name or landmark..."
              defaultValue={search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Type Filter */}
          <select
            value={type}
            onChange={(e) => updateFilters({ type: e.target.value })}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors min-w-[140px]"
          >
            <option value="">All Types</option>
            {INCIDENT_TYPES.map((t) => (
              <option key={t.type} value={t.type}>
                {t.icon} {t.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => updateFilters({ status: e.target.value })}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors min-w-[140px]"
          >
            <option value="">All Status</option>
            <option value="needs_review">Needs Review</option>
            <option value="pending">Pending</option>
            <option value="flagged">Flagged</option>
            <option value="approved">Approved</option>
            <option value="removed">Removed</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <>
          {/* Desktop Skeleton */}
          <div className="hidden md:block">
            <TableSkeleton rows={8} cols={6} />
          </div>
          {/* Mobile Skeleton */}
          <div className="md:hidden">
            <CardListSkeleton count={5} />
          </div>
        </>
      ) : reports.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No reports found</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            {search || type || status
              ? 'Try adjusting your filters to find what you are looking for.'
              : 'Reports will appear here when community members submit them.'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reporter
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Responses
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reports.map((report, index) => (
                    <motion.tr
                      key={report.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTypeBadge(report.incident_type)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{report.area_name}</div>
                        {report.landmark && (
                          <div className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {report.landmark}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {maskPhone(report.users?.phone || null)}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Trust Score: {report.users?.trust_score || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getModerationBadge(report.moderation_status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 text-sm">
                          <span className="flex items-center gap-1 text-green-600 font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            {report.confirmation_count}
                          </span>
                          <span className="flex items-center gap-1 text-red-600 font-medium">
                            <XCircle className="w-4 h-4" />
                            {report.denial_count}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/reports/${report.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-500">
                  Showing page <span className="font-medium text-gray-900">{page}</span> of{' '}
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
            {reports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Link
                  href={`/admin/reports/${report.id}`}
                  className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      {report.status === 'active' && (
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                      )}
                      {getTypeBadge(report.incident_type)}
                    </div>
                    {getModerationBadge(report.moderation_status)}
                  </div>

                  {/* Location */}
                  <div className="mb-3">
                    <p className="font-medium text-gray-900">{report.area_name}</p>
                    {report.landmark && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {report.landmark}
                      </p>
                    )}
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-green-600 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        {report.confirmation_count}
                      </span>
                      <span className="flex items-center gap-1 text-red-600 font-medium">
                        <XCircle className="w-4 h-4" />
                        {report.denial_count}
                      </span>
                    </div>
                    <span className="text-gray-400 text-xs">
                      {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                    </span>
                  </div>

                  {/* Reporter Info */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {maskPhone(report.users?.phone || null)} • Trust: {report.users?.trust_score || 0}
                    </div>
                    <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                      View
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}

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
                <span className="text-sm text-gray-500">
                  {page} / {totalPages}
                </span>
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
