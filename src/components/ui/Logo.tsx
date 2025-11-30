'use client'

import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'
import { useState, useEffect } from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'location' | 'context'
  locationName?: string
  userContext?: 'resident' | 'visitor' | 'transit'
  riskLevel?: 'EXTREME' | 'VERY HIGH' | 'HIGH' | 'MODERATE' | 'LOW'
  className?: string
}

const sizeMap = {
  sm: { container: 'w-8 h-8', icon: 'w-4 h-4' },
  md: { container: 'w-10 h-10', icon: 'w-5 h-5' },
  lg: { container: 'w-12 h-12 sm:w-14 sm:h-14', icon: 'w-6 h-6 sm:w-7 sm:h-7' },
}

const riskColors = {
  EXTREME: 'bg-[#DC2626]',
  'VERY HIGH': 'bg-[#EA580C]',
  HIGH: 'bg-[#CA8A04]',
  MODERATE: 'bg-[#10b981]',
  LOW: 'bg-[#22c55e]',
}

export function Logo({ 
  size = 'lg', 
  variant = 'default',
  locationName,
  userContext,
  riskLevel,
  className = ''
}: LogoProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    // Try to load the image
    const img = new window.Image()
    img.onload = () => setImageLoaded(true)
    img.onerror = () => setImageError(true)
    img.src = '/images/logo.png'
  }, [])

  const sizes = sizeMap[size]
  const showImage = imageLoaded && !imageError

  // Dynamic styling based on context
  const getLogoStyle = () => {
    if (variant === 'location' && riskLevel) {
      return riskColors[riskLevel] || riskColors.MODERATE
    }
    if (variant === 'context' && userContext === 'resident') {
      return 'bg-green-600'
    }
    if (variant === 'context' && userContext === 'visitor') {
      return 'bg-blue-600'
    }
    if (variant === 'context' && userContext === 'transit') {
      return 'bg-amber-600'
    }
    return 'bg-primary'
  }

  return (
    <div className={`relative ${sizes.container} flex items-center justify-center flex-shrink-0 ${className}`}>
      {showImage ? (
        <motion.img
          src="/images/logo.png"
          alt="Nigeria Security Alert"
          className="object-contain w-full h-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          onError={() => setImageError(true)}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className={`${sizes.container} ${getLogoStyle()} rounded-lg flex items-center justify-center shadow-md`}
        >
          <Shield className={`${sizes.icon} text-white`} />
        </motion.div>
      )}
    </div>
  )
}

