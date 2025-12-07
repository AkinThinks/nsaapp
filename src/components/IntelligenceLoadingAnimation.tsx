'use client'

import { RocketLoader } from '@/components/ui/rocket-loader'

interface IntelligenceLoadingAnimationProps {
  locationName?: string
  className?: string
}

export function IntelligenceLoadingAnimation({ 
  locationName,
  className = ''
}: IntelligenceLoadingAnimationProps) {
  return (
    <div className={`w-full h-[400px] sm:h-[500px] md:h-[600px] ${className}`}>
      <RocketLoader locationName={locationName} />
    </div>
  )
}
