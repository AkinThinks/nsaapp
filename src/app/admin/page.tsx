import { createServerClient } from '@/lib/supabase'
import { getSessionFromCookie } from '@/lib/admin-auth'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import {
  FileText,
  AlertTriangle,
  Users,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  MapPin,
} from 'lucide-react'
import { DashboardClient } from './DashboardClient'

// Format date for display
function formatDate(): string {
  return new Date().toLocaleDateString('en-NG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function AdminDashboardPage() {
  const session = await getSessionFromCookie()
  const supabase = createServerClient()

  // Get first name
  const firstName = session?.fullName.split(' ')[0] || 'Admin'

  // Fetch stats
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // Reports today
  const { count: reportsToday } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString())

  // Reports yesterday (for comparison)
  const { count: reportsYesterday } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', yesterday.toISOString())
    .lt('created_at', today.toISOString())

  // Active alerts
  const { count: activeAlerts } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // Total users
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  // New users today
  const { count: newUsersToday } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString())

  // Pending moderation
  const { count: pendingModeration } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('moderation_status', 'pending')

  // Recent reports
  const { data: recentReports } = await supabase
    .from('reports')
    .select('id, incident_type, area_name, created_at, status, confirmations, denials')
    .order('created_at', { ascending: false })
    .limit(5)

  // Reports by type (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: reportsByType } = await supabase
    .from('reports')
    .select('incident_type')
    .gte('created_at', sevenDaysAgo.toISOString())

  // Count by type
  const typeCounts: Record<string, number> = {}
  reportsByType?.forEach((r) => {
    typeCounts[r.incident_type] = (typeCounts[r.incident_type] || 0) + 1
  })
  const totalReports = reportsByType?.length || 1

  // Calculate change percentage
  const reportsChange = reportsYesterday
    ? Math.round(((reportsToday || 0) - reportsYesterday) / reportsYesterday * 100)
    : 0

  // Type colors for visual variety
  const typeColors: Record<string, string> = {
    robbery: 'bg-red-500',
    accident: 'bg-amber-500',
    fire: 'bg-orange-500',
    flood: 'bg-blue-500',
    protest: 'bg-purple-500',
    kidnapping: 'bg-red-600',
    assault: 'bg-pink-500',
    suspicious_activity: 'bg-yellow-500',
  }

  return (
    <DashboardClient firstName={firstName}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">{formatDate()}</p>
          </div>
        </div>

        {/* Alert banner for pending moderation */}
        {(pendingModeration || 0) > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-amber-900">
                  {pendingModeration} report{pendingModeration !== 1 ? 's' : ''} pending moderation
                </p>
                <p className="text-sm text-amber-700">Review and approve or remove reports to keep the community safe</p>
              </div>
            </div>
            <Link
              href="/admin/reports?status=pending"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors text-sm shadow-sm whitespace-nowrap"
            >
              Review Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Reports Today */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              {reportsChange !== 0 && (
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${reportsChange > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {reportsChange > 0 ? '+' : ''}{reportsChange}%
                </div>
              )}
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900">{reportsToday || 0}</p>
              <p className="text-sm text-gray-500">Reports Today</p>
            </div>
          </div>

          {/* Active Alerts */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900">{activeAlerts || 0}</p>
              <p className="text-sm text-gray-500">Active Alerts</p>
            </div>
          </div>

          {/* Total Users */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              {(newUsersToday || 0) > 0 && (
                <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                  +{newUsersToday} today
                </div>
              )}
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900">{totalUsers?.toLocaleString() || 0}</p>
              <p className="text-sm text-gray-500">Total Users</p>
            </div>
          </div>

          {/* Pending Moderation */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900">{pendingModeration || 0}</p>
              <p className="text-sm text-gray-500">Pending Review</p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Reports - Takes 2 columns */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="font-semibold text-gray-900">Recent Reports</h2>
                <p className="text-sm text-gray-500">Latest activity from the community</p>
              </div>
              <Link
                href="/admin/reports"
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentReports?.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No reports yet</p>
                  <p className="text-sm text-gray-400">Reports will appear here when submitted</p>
                </div>
              ) : (
                recentReports?.map((report) => (
                  <Link
                    key={report.id}
                    href={`/admin/reports/${report.id}`}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${report.status === 'active' ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
                      <div>
                        <p className="font-medium text-gray-900 capitalize">
                          {report.incident_type.replace('_', ' ')}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="w-3 h-3" />
                          {report.area_name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          {report.confirmations || 0}
                        </span>
                        <span className="flex items-center gap-1 text-red-600">
                          <XCircle className="w-4 h-4" />
                          {report.denials || 0}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Reports by Type */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Reports by Type</h2>
              <p className="text-sm text-gray-500">Last 7 days</p>
            </div>
            <div className="p-5 space-y-4">
              {Object.entries(typeCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
                .map(([type, count]) => {
                  const percentage = Math.round((count / totalReports) * 100)
                  const bgColor = typeColors[type] || 'bg-gray-500'
                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {type.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-gray-500 font-medium">{count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${bgColor} rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              {Object.keys(typeCounts).length === 0 && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No data available</p>
                  <p className="text-sm text-gray-400">Reports will be categorized here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardClient>
  )
}
