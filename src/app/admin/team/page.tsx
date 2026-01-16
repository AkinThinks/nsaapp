'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { UserPlus, Trash2, Loader2, X, Eye, EyeOff, Users, Shield, Mail, Lock, User } from 'lucide-react'
import { type AdminRole } from '@/lib/admin-auth-client'
import { Badge, RoleBadge } from '@/components/admin/ui'
import { TableSkeleton } from '@/components/admin/ui/Skeleton'

interface AdminUser {
  id: string
  email: string
  full_name: string
  role: AdminRole
  is_active: boolean
  last_login: string | null
  created_at: string
}

const ROLES: { value: AdminRole; label: string; description: string }[] = [
  { value: 'admin', label: 'Admin', description: 'Full access except system settings' },
  { value: 'moderator', label: 'Moderator', description: 'Review reports and warn users' },
  { value: 'analyst', label: 'Analyst', description: 'View analytics and export data' },
  { value: 'support', label: 'Support', description: 'View users and handle appeals' },
]

export default function AdminTeamPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  const [inviteForm, setInviteForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'moderator' as AdminRole,
  })
  const [showPassword, setShowPassword] = useState(false)

  const fetchTeam = async () => {
    try {
      const response = await fetch('/api/admin/team')
      const data = await response.json()
      if (response.ok) {
        setAdmins(data.admins || [])
      }
    } catch (error) {
      console.error('Failed to fetch team:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeam()
  }, [])

  const handleInvite = async () => {
    if (!inviteForm.fullName || !inviteForm.email || !inviteForm.password) {
      setError('All fields are required')
      return
    }
    if (inviteForm.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setActionLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to create admin')

      setShowInviteModal(false)
      setInviteForm({ fullName: '', email: '', password: '', role: 'moderator' })
      fetchTeam()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create admin')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeactivate = async (adminId: string, adminName: string) => {
    if (!confirm(`Are you sure you want to deactivate ${adminName}?`)) return

    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/team/${adminId}`, { method: 'DELETE' })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to deactivate admin')
      }
      fetchTeam()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to deactivate admin')
    } finally {
      setActionLoading(false)
    }
  }

  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="text-sm text-gray-500 mt-1">Manage admin users and permissions</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Invite Admin
        </button>
      </div>

      {/* Team Table / Cards */}
      {loading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : admins.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No team members</h3>
          <p className="text-sm text-gray-500 mt-1">Invite your first admin to get started.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {admins.map((admin, index) => (
                    <motion.tr key={admin.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: index * 0.05 }} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-900 text-white rounded-lg flex items-center justify-center text-sm font-medium">{getInitials(admin.full_name)}</div>
                          <div>
                            <div className="font-medium text-gray-900">{admin.full_name}</div>
                            <div className="text-sm text-gray-500">{admin.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><RoleBadge role={admin.role} /></td>
                      <td className="px-6 py-4">{admin.is_active ? <Badge variant="success">Active</Badge> : <Badge variant="neutral">Inactive</Badge>}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{admin.last_login ? formatDistanceToNow(new Date(admin.last_login), { addSuffix: true }) : 'Never'}</td>
                      <td className="px-6 py-4 text-right">
                        {admin.is_active && admin.role !== 'super_admin' && (
                          <button onClick={() => handleDeactivate(admin.id, admin.full_name)} disabled={actionLoading} className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors" title="Deactivate">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {admins.map((admin, index) => (
              <motion.div
                key={admin.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center text-sm font-medium">
                      {getInitials(admin.full_name)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{admin.full_name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-[180px]">{admin.email}</div>
                    </div>
                  </div>
                  {admin.is_active && admin.role !== 'super_admin' && (
                    <button
                      onClick={() => handleDeactivate(admin.id, admin.full_name)}
                      disabled={actionLoading}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <RoleBadge role={admin.role} />
                  {admin.is_active ? <Badge variant="success">Active</Badge> : <Badge variant="neutral">Inactive</Badge>}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  Last login: {admin.last_login ? formatDistanceToNow(new Date(admin.last_login), { addSuffix: true }) : 'Never'}
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Role Permissions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-600" />
          Role Permissions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ROLES.map((role) => (
            <div key={role.value} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <RoleBadge role={role.value} />
              <p className="mt-3 text-sm text-gray-600">{role.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowInviteModal(false); setError('') }} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Invite Admin</h3>
                <button onClick={() => { setShowInviteModal(false); setError('') }} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
                  {error}
                </motion.div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <input type="text" value={inviteForm.fullName} onChange={(e) => setInviteForm({ ...inviteForm, fullName: e.target.value })} className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 focus:bg-white" placeholder="John Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4 text-gray-500" />
                    </div>
                    <input type="email" value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 focus:bg-white" placeholder="john@example.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Temporary Password</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Lock className="w-4 h-4 text-gray-500" />
                    </div>
                    <input type={showPassword ? 'text' : 'password'} value={inviteForm.password} onChange={(e) => setInviteForm({ ...inviteForm, password: e.target.value })} className="w-full pl-14 pr-14 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 focus:bg-white" placeholder="Min 8 characters" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">User should change this after first login</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select value={inviteForm.role} onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as AdminRole })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 focus:bg-white">
                    {ROLES.map((role) => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => { setShowInviteModal(false); setError('') }} className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleInvite} disabled={actionLoading} className="flex-1 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Admin
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
