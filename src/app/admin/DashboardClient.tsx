'use client'

import { motion } from 'framer-motion'

interface DashboardClientProps {
  firstName: string
  children: React.ReactNode
}

// Get greeting based on time of day
function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function DashboardClient({ firstName, children }: DashboardClientProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()}, {firstName}
        </h1>
      </div>

      {children}
    </motion.div>
  )
}
