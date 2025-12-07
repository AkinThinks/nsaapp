'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Shield, Globe, Radar, Zap, Activity } from 'lucide-react'

// Rotating feedback messages
const loadingMessages = [
  { text: 'Establishing secure connection...', icon: Globe, short: 'Connecting...', emoji: '🌐' },
  { text: 'Scanning satellite imagery...', icon: Radar, short: 'Scanning...', emoji: '📡' },
  { text: 'Analyzing regional security reports...', icon: Search, short: 'Analyzing...', emoji: '🔍' },
  { text: 'Processing incident data...', icon: Activity, short: 'Processing...', emoji: '⚡' },
  { text: 'Calculating risk vectors...', icon: Shield, short: 'Calculating...', emoji: '🛡️' },
  { text: 'Synthesizing intelligence briefing...', icon: Zap, short: 'Synthesizing...', emoji: '✨' },
]

// Accurate Nigeria SVG Path
const NIGERIA_PATH = "M144.5,350.5l-14-17l-15-7l-8-12l-18-2l-16,5l-18-9l-11,2l-6-9l-19-4l-9-13l3-16l-8-11l-2-12l10-15l5-19l19-14l12,1l15-9l18-3l12,6l18-5l16-16l15,2l19-8l15,3l16,11l13-2l9,8l18,2l16-6l12,5l15,16l-2,15l-11,14l-5,16l4,15l-6,14l-14,8l-5,15l-15,6l-8,14l-18,6l-14,14l-16,3l-15-5l-14,6l-11,14L144.5,350.5z"

// Major cities coordinates (approximate relative to the path viewbox)
const CITIES = [
  { x: 140, y: 300, name: 'Lagos' }, // Lagos
  { x: 250, y: 180, name: 'Abuja' }, // Abuja
  { x: 300, y: 100, name: 'Kano' },  // Kano
  { x: 360, y: 150, name: 'Maiduguri' }, // Maiduguri
  { x: 120, y: 220, name: 'Ibadan' }, // Ibadan
  { x: 220, y: 280, name: 'Benin City' }, // Benin City
  { x: 280, y: 250, name: 'Enugu' }, // Enugu
  { x: 260, y: 320, name: 'Port Harcourt' }, // PH
]

interface IntelligenceLoadingAnimationProps {
  locationName?: string
}

export function IntelligenceLoadingAnimation({ locationName }: IntelligenceLoadingAnimationProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [activeCity, setActiveCity] = useState<number | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // Randomly activate cities
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCity(Math.floor(Math.random() * CITIES.length))
    }, 800)
    return () => clearInterval(interval)
  }, [])

  const currentMessage = loadingMessages[currentMessageIndex]
  const CurrentIcon = currentMessage.icon

  return (
    <div className="relative w-full h-[400px] sm:h-[500px] flex items-center justify-center overflow-hidden bg-black/95 rounded-xl border border-blue-900/30">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,50,100,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,50,100,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />
      
      {/* Radial Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-transparent to-blue-900/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)]" />

      {/* Main Map Container */}
      <div className="relative w-full h-full max-w-[600px] max-h-[600px] flex items-center justify-center p-8">
        <svg
          viewBox="0 0 500 400"
          className="w-full h-full filter drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Defs for gradients/masks */}
          <defs>
            <linearGradient id="scanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0)" />
              <stop offset="50%" stopColor="rgba(59, 130, 246, 0.5)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
            </linearGradient>
            <mask id="mapMask">
              <path d={NIGERIA_PATH} fill="white" />
            </mask>
            <pattern id="gridPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* Base Map Outline */}
          <path
            d={NIGERIA_PATH}
            fill="rgba(30, 58, 138, 0.3)"
            stroke="rgba(59, 130, 246, 0.6)"
            strokeWidth="2"
            className="transition-all duration-1000"
          />

          {/* Grid Overlay on Map */}
          <rect width="100%" height="100%" fill="url(#gridPattern)" mask="url(#mapMask)" opacity="0.5" />

          {/* Scanning Effect - Masked to Map */}
          <g mask="url(#mapMask)">
            <motion.rect
              x="0"
              y="-100"
              width="100%"
              height="100"
              fill="url(#scanGradient)"
              animate={{
                y: [0, 400],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </g>

          {/* Cities / Data Points */}
          {CITIES.map((city, index) => (
            <g key={city.name} transform={`translate(${city.x}, ${city.y})`}>
              <motion.circle
                r="3"
                fill="#60A5FA"
                animate={{
                  scale: activeCity === index ? [1, 2, 1] : 1,
                  opacity: activeCity === index ? [0.5, 1, 0.5] : 0.5,
                }}
                transition={{ duration: 0.5 }}
              />
              {activeCity === index && (
                <>
                  <motion.circle
                    r="8"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="1"
                    initial={{ scale: 0.5, opacity: 1 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 1 }}
                  />
                  {/* City Name Label (Holographic look) */}
                  <motion.text
                    x="10"
                    y="4"
                    fill="#93C5FD"
                    fontSize="10"
                    fontFamily="monospace"
                    initial={{ opacity: 0, x: 0 }}
                    animate={{ opacity: 1, x: 10 }}
                    className="select-none pointer-events-none"
                  >
                    {city.name.toUpperCase()}
                  </motion.text>
                </>
              )}
            </g>
          ))}

          {/* Current Target Location Marker (if locationName provided) */}
          {locationName && (
             <g transform="translate(250, 200)"> {/* Centered for general context or could be specific */}
               <motion.circle
                 r="20"
                 fill="none"
                 stroke="#EF4444"
                 strokeWidth="1.5"
                 strokeDasharray="5,5"
                 animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                 transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
               />
               <motion.circle
                 r="15"
                 fill="none"
                 stroke="#EF4444"
                 strokeWidth="1"
                 animate={{ rotate: -360 }}
                 transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
               />
             </g>
          )}
        </svg>

        {/* Orbiting Ring 1 */}
        <motion.div
          className="absolute w-[80%] h-[60%] rounded-full border border-blue-500/20"
          style={{ transformStyle: 'preserve-3d', transform: 'rotateX(60deg)' }}
          animate={{ rotateZ: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Orbiting Ring 2 */}
        <motion.div
          className="absolute w-[90%] h-[70%] rounded-full border border-dashed border-blue-400/10"
          style={{ transformStyle: 'preserve-3d', transform: 'rotateX(60deg) rotateY(10deg)' }}
          animate={{ rotateZ: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Status Panel - Holographic UI */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md">
        <div className="backdrop-blur-md bg-blue-950/40 border border-blue-500/30 rounded-lg p-4 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
          <div className="flex items-center gap-4">
            {/* Animated Icon */}
            <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 border border-blue-400/30">
              <CurrentIcon className="w-6 h-6 text-blue-400" />
              <motion.div
                className="absolute inset-0 rounded-full border-t-2 border-blue-400"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </div>
            
            {/* Text Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-blue-200 text-xs font-mono tracking-wider">SYSTEM STATUS</span>
                <span className="text-blue-400 text-xs font-mono">{currentMessage.emoji}</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMessageIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-sm sm:text-base font-semibold text-white truncate"
                >
                  {currentMessage.text}
                </motion.div>
              </AnimatePresence>
              
              {/* Progress Bar */}
              <div className="mt-2 h-1 w-full bg-blue-900/50 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-blue-500"
                  initial={{ width: "0%" }}
                  animate={{ width: `${((currentMessageIndex + 1) / loadingMessages.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
          
          {/* Decorative Corners */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-blue-400" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-blue-400" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-blue-400" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-blue-400" />
        </div>
        
        {/* Analyzing specific location indicator */}
        {locationName && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-center"
          >
            <span className="text-[10px] text-blue-400/70 font-mono tracking-[0.2em] uppercase">
              Target: {locationName}
            </span>
          </motion.div>
        )}
      </div>
    </div>
  )
}
