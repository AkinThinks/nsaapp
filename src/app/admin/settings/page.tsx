'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Save,
  Loader2,
  Settings,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Info,
  Sliders,
  Shield,
  Bell,
  Clock,
  Database,
} from 'lucide-react'

interface Setting {
  key: string
  value: string | number | boolean
  description: string
  type?: 'text' | 'number' | 'boolean' | 'select'
  options?: string[]
  category?: string
}

const SETTING_ICONS: Record<string, React.ReactNode> = {
  trust: <Shield className="w-5 h-5" />,
  notification: <Bell className="w-5 h-5" />,
  timeout: <Clock className="w-5 h-5" />,
  cache: <Database className="w-5 h-5" />,
  default: <Sliders className="w-5 h-5" />,
}

const getCategoryIcon = (key: string) => {
  for (const [category, icon] of Object.entries(SETTING_ICONS)) {
    if (key.toLowerCase().includes(category)) return icon
  }
  return SETTING_ICONS.default
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/settings')
      const data = await response.json()
      if (response.ok) {
        setSettings(data.settings || [])
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = (key: string, value: string | number | boolean) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s))
    )
    setSuccess('')
    setHasChanges(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save settings')
      }

      setSuccess('Settings saved successfully')
      setHasChanges(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    fetchSettings()
    setHasChanges(false)
    setError('')
    setSuccess('')
  }

  const formatSettingLabel = (key: string) => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase())
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
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure system settings and preferences</p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </motion.button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Messages */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3"
          >
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h4 className="font-medium text-red-900">Error saving settings</h4>
              <p className="text-sm text-red-700 mt-0.5">{error}</p>
            </div>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3"
          >
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-medium text-emerald-900">Settings saved</h4>
              <p className="text-sm text-emerald-700 mt-0.5">{success}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Form */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
            <p className="text-gray-500">Loading settings...</p>
          </div>
        ) : settings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No settings configured</h3>
            <p className="text-sm text-gray-500 mt-1">System settings will appear here once configured.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {settings.map((setting, index) => (
              <motion.div
                key={setting.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Icon and Label */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 text-gray-500">
                      {getCategoryIcon(setting.key)}
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-900">
                        {formatSettingLabel(setting.key)}
                      </label>
                      {setting.description && (
                        <p className="text-sm text-gray-500 mt-1">{setting.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Input */}
                  <div className="lg:w-80">
                    {setting.type === 'boolean' ? (
                      <button
                        type="button"
                        onClick={() => updateSetting(setting.key, !setting.value)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          setting.value ? 'bg-emerald-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                            setting.value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    ) : setting.type === 'select' && setting.options ? (
                      <select
                        value={String(setting.value)}
                        onChange={(e) => updateSetting(setting.key, e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      >
                        {setting.options.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : setting.type === 'number' ? (
                      <input
                        type="number"
                        value={String(setting.value)}
                        onChange={(e) => updateSetting(setting.key, parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      />
                    ) : (
                      <input
                        type="text"
                        value={String(setting.value)}
                        onChange={(e) => updateSetting(setting.key, e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Warning Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-amber-50 border border-amber-200 rounded-xl p-5"
      >
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="font-semibold text-amber-900">Important Notice</h4>
            <p className="text-sm text-amber-800 mt-1">
              Changes to system settings may affect how the application behaves for all users.
              Make sure you understand the impact of each setting before making changes.
              Some changes may require a restart to take effect.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Unsaved Changes Indicator */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium">You have unsaved changes</span>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 rounded-full text-sm font-medium transition-colors"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
