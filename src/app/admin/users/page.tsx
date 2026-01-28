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
  AlertTriangle,
  Ban,
  Clock,
  Users,
  ArrowRight,
  Phone,
  ShieldCheck,
  ShieldX,
} from 'lucide-react'
import { maskPhone } from '@/lib/admin-auth-client'
import { Badge } from '@/components/admin/ui'
import { TableSkeleton, CardListSkeleton } from '@/components/admin/ui/Skeleton'

interface User {
  id: string
  phone: string | null
  phone_verified: boolean
  status: string
  trust_score: number
  warning_count: number
  created_at: string
  last_active: string
  report_count: number
}

export default function AdminUsersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const page = parseInt(searchParams.get('page') || '1')
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      if (search) params.set('search', search)
      if (status) params.set('status', status)

      const response = await fetch(`/api/admin/users?${params}`)
      const data = await response.json()

      if (response.ok) {
        setUsers(data.users || [])
        setTotalPages(data.totalPages || 1)
        setTotal(data.total || 0)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }, [page, search, status])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

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
    router.push(`/admin/users?${params}`)
  }

  const getStatusBadge = (userStatus: string) => {
    switch (userStatus) {
      case 'active':
        return <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1" />Active</Badge>
      case 'warned':
        return <Badge variant="warning"><AlertTriangle className="w-3 h-3 mr-1" />Warned</Badge>
      case 'suspended':
        return <Badge variant="warning"><Clock className="w-3 h-3 mr-1" />Suspended</Badge>
      case 'banned':
        return <Badge variant="danger"><Ban className="w-3 h-3 mr-1" />Banned</Badge>
      default:
        return <Badge variant="neutral">{userStatus}</Badge>
    }
  }

  const getTrustColor = (score: number) => {
    if (score >= 70) return 'bg-emerald-500'
    if (score >= 40) return 'bg-amber-500'
    return 'bg-red-500'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-1">
          {total.toLocaleString()} registered user{total !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by phone number..."
              defaultValue={search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
          <select
            value={status}
            onChange={(e) => updateFilters({ status: e.target.value })}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors min-w-[140px]"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="warned">Warned</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Verified: {users.filter(u => u.phone_verified).length}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <ShieldX className="w-4 h-4 text-gray-400" />
            <span>Unverified: {users.filter(u => !u.phone_verified).length}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <>
          <div className="hidden md:block"><TableSkeleton rows={8} cols={5} /></div>
          <div className="md:hidden"><CardListSkeleton count={5} /></div>
        </>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No users found</h3>
          <p className="text-sm text-gray-500 mt-1">
            {search || status ? 'Try adjusting your filters.' : 'Users will appear here when they sign up.'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trust Score</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reports</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{maskPhone(user.phone)}</span>
                        {user.phone_verified ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded">
                            <ShieldCheck className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-500 rounded">
                            <ShieldX className="w-3 h-3" />
                            Unverified
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Last active: {user.last_active ? formatDistanceToNow(new Date(user.last_active), { addSuffix: true }) : 'Never'}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(user.status || 'active')}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${getTrustColor(user.trust_score)} rounded-full transition-all`} style={{ width: `${Math.min(user.trust_score, 100)}%` }} />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{user.trust_score}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">{user.report_count}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/users/${user.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />View
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-500">Page <span className="font-medium text-gray-900">{page}</span> of <span className="font-medium text-gray-900">{totalPages}</span></div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateFilters({ page: String(page - 1) })} disabled={page <= 1} className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <ChevronLeft className="w-4 h-4" />Previous
                  </button>
                  <button onClick={() => updateFilters({ page: String(page + 1) })} disabled={page >= totalPages} className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    Next<ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {users.map((user, index) => (
              <motion.div key={user.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: index * 0.05 }}>
                <Link href={`/admin/users/${user.id}`} className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-medium text-gray-900">{maskPhone(user.phone)}</div>
                      <div className="flex items-center gap-1 mt-1">
                        {user.phone_verified ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                            <ShieldCheck className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                            <ShieldX className="w-3 h-3" />
                            Unverified
                          </span>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(user.status || 'active')}
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">Trust Score</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${getTrustColor(user.trust_score)} rounded-full`} style={{ width: `${Math.min(user.trust_score, 100)}%` }} />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{user.trust_score}</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Reports</div>
                      <div className="text-lg font-bold text-gray-900">{user.report_count}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500">Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</div>
                    <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium">View<ArrowRight className="w-4 h-4" /></span>
                  </div>
                </Link>
              </motion.div>
            ))}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <button onClick={() => updateFilters({ page: String(page - 1) })} disabled={page <= 1} className="inline-flex items-center gap-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft className="w-4 h-4" />Previous
                </button>
                <span className="text-sm text-gray-500">{page} / {totalPages}</span>
                <button onClick={() => updateFilters({ page: String(page + 1) })} disabled={page >= totalPages} className="inline-flex items-center gap-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  Next<ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  )
}
