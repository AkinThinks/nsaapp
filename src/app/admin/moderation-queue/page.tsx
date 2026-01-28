'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  MessageSquare,
  User,
  MapPin,
  Clock,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Filter,
  Shield,
  AlertOctagon,
} from 'lucide-react'

interface QueueItem {
  id: string
  incident_type: string
  description: string | null
  landmark: string | null
  area_name: string
  state: string
  photo_url: string | null
  photo_thumb_url: string | null
  text_moderation_status: string | null
  image_moderation_status: string | null
  moderation_status: string | null
  moderation_notes: string | null
  created_at: string
  users: {
    id: string
    phone: string | null
    phone_verified: boolean
    trust_score: number
  } | null
}

interface QueueCounts {
  textFlagged: number
  imageFlagged: number
  imagePending: number
  total: number
}

type FilterType = 'all' | 'text' | 'image' | 'low-trust'

export default function ModerationQueuePage() {
  const router = useRouter()
  const [items, setItems] = useState<QueueItem[]>([])
  const [counts, setCounts] = useState<QueueCounts>({ textFlagged: 0, imageFlagged: 0, imagePending: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [processing, setProcessing] = useState(false)

  // Fetch moderation queue
  const fetchQueue = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/admin/moderation-queue?page=${page}&filter=${filter}&limit=20`
      )
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setItems(data.reports)
      setCounts(data.counts)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error('Error fetching queue:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQueue()
  }, [page, filter])

  // Toggle item selection
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  // Select all visible items
  const selectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(items.map((i) => i.id)))
    }
  }

  // Bulk moderation action
  const handleBulkAction = async (action: string) => {
    if (selectedItems.size === 0) return

    setProcessing(true)
    try {
      const response = await fetch('/api/admin/moderation-queue', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportIds: Array.from(selectedItems),
          action,
        }),
      })

      if (!response.ok) throw new Error('Failed to moderate')

      setSelectedItems(new Set())
      fetchQueue()
    } catch (error) {
      console.error('Moderation error:', error)
      alert('Failed to moderate items')
    } finally {
      setProcessing(false)
    }
  }

  // Single item action
  const handleSingleAction = async (id: string, action: string) => {
    setProcessing(true)
    try {
      const response = await fetch('/api/admin/moderation-queue', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportIds: [id],
          action,
        }),
      })

      if (!response.ok) throw new Error('Failed to moderate')
      fetchQueue()
    } catch (error) {
      console.error('Moderation error:', error)
      alert('Failed to moderate item')
    } finally {
      setProcessing(false)
    }
  }

  // Get status badges for an item
  const getStatusBadges = (item: QueueItem) => {
    const badges = []

    if (item.text_moderation_status === 'flagged') {
      badges.push(
        <span key="text" className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
          <MessageSquare className="w-3 h-3" />
          Text Flagged
        </span>
      )
    }

    if (item.image_moderation_status === 'flagged') {
      badges.push(
        <span key="img-flag" className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
          <ImageIcon className="w-3 h-3" />
          Image Flagged
        </span>
      )
    }

    if (item.image_moderation_status === 'pending') {
      badges.push(
        <span key="img-pend" className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
          <ImageIcon className="w-3 h-3" />
          Image Pending
        </span>
      )
    }

    if (item.users && item.users.trust_score < 30) {
      badges.push(
        <span key="trust" className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
          <Shield className="w-3 h-3" />
          Low Trust ({item.users.trust_score})
        </span>
      )
    }

    if (item.users && !item.users.phone_verified) {
      badges.push(
        <span key="unverified" className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
          <User className="w-3 h-3" />
          Unverified
        </span>
      )
    }

    return badges
  }

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <AlertOctagon className="w-6 h-6 text-red-500" />
                  Moderation Queue
                </h1>
                <p className="text-sm text-gray-500">
                  {counts.total} items need review
                </p>
              </div>
            </div>

            <button
              onClick={fetchQueue}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {[
              { key: 'all', label: 'All', count: counts.total },
              { key: 'text', label: 'Text Flagged', count: counts.textFlagged },
              { key: 'image', label: 'Image Issues', count: counts.imageFlagged + counts.imagePending },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setFilter(tab.key as FilterType)
                  setPage(1)
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === tab.key
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-white rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Bulk Actions Bar */}
      {selectedItems.size > 0 && (
        <div className="bg-gray-900 text-white px-4 py-3 sticky top-[120px] z-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="text-sm">
              {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('approve_all')}
                disabled={processing}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 inline mr-1" />
                Approve All
              </button>
              <button
                onClick={() => handleBulkAction('remove')}
                disabled={processing}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4 inline mr-1" />
                Remove
              </button>
              <button
                onClick={() => setSelectedItems(new Set())}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Queue is Clear!
            </h3>
            <p className="text-gray-500">
              No items need moderation right now
            </p>
          </div>
        ) : (
          <>
            {/* Select All */}
            <div className="mb-4 flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedItems.size === items.length}
                  onChange={selectAll}
                  className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                Select all on page
              </label>
            </div>

            {/* Queue Items */}
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl border-2 overflow-hidden transition-colors ${
                    selectedItems.has(item.id)
                      ? 'border-red-500'
                      : 'border-transparent'
                  }`}
                >
                  <div className="p-4">
                    {/* Header Row */}
                    <div className="flex items-start gap-3 mb-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-gray-900 capitalize">
                            {item.incident_type.replace('_', ' ')}
                          </span>
                          {getStatusBadges(item)}
                        </div>

                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {item.area_name}, {item.state}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTimeAgo(item.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="pl-7 space-y-3">
                      {/* Text Content */}
                      {item.description && (
                        <div
                          className={`p-3 rounded-lg ${
                            item.text_moderation_status === 'flagged'
                              ? 'bg-red-50 border border-red-200'
                              : 'bg-gray-50'
                          }`}
                        >
                          <p className="text-sm text-gray-700">{item.description}</p>
                          {item.landmark && (
                            <p className="text-xs text-gray-500 mt-1">
                              Landmark: {item.landmark}
                            </p>
                          )}
                          {item.moderation_notes && (
                            <p className="text-xs text-red-600 mt-2">
                              Flag reason: {item.moderation_notes}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Image */}
                      {item.photo_url && (
                        <div
                          className={`relative rounded-lg overflow-hidden max-w-xs ${
                            item.image_moderation_status === 'flagged'
                              ? 'ring-2 ring-red-500'
                              : item.image_moderation_status === 'pending'
                              ? 'ring-2 ring-amber-500'
                              : ''
                          }`}
                        >
                          {/* Blur flagged images */}
                          <div className={item.image_moderation_status === 'flagged' ? 'blur-lg' : ''}>
                            <Image
                              src={item.photo_thumb_url || item.photo_url}
                              alt="Report image"
                              width={200}
                              height={150}
                              className="object-cover"
                            />
                          </div>
                          {item.image_moderation_status === 'flagged' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">
                                Flagged - Click to reveal
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2">
                        {item.text_moderation_status === 'flagged' && (
                          <button
                            onClick={() => handleSingleAction(item.id, 'approve_text')}
                            disabled={processing}
                            className="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-xs font-medium transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                            Approve Text
                          </button>
                        )}

                        {(item.image_moderation_status === 'flagged' ||
                          item.image_moderation_status === 'pending') && (
                          <button
                            onClick={() => handleSingleAction(item.id, 'approve_image')}
                            disabled={processing}
                            className="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-xs font-medium transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                            Approve Image
                          </button>
                        )}

                        <button
                          onClick={() => handleSingleAction(item.id, 'approve_all')}
                          disabled={processing}
                          className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-xs font-medium transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                          Approve All
                        </button>

                        <button
                          onClick={() => handleSingleAction(item.id, 'remove')}
                          disabled={processing}
                          className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-medium transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                          Remove
                        </button>

                        <button
                          onClick={() => router.push(`/admin/reports/${item.id}`)}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5 inline mr-1" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
