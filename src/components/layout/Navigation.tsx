'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Route, Phone, Info, Heart, Home, Map, Users, Menu, X, BookOpen } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/emergency', label: 'Emergency', icon: Phone },
  { href: '/roadmap', label: 'Our Roadmap', icon: Map },
  { href: '/about', label: 'About', icon: Info },
]

const mobileNavLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/roads', label: 'Route Checker', icon: Route },
  { href: '/emergency', label: 'Emergency', icon: Phone },
  { href: '/about', label: 'About', icon: Info },
  { href: '/roadmap', label: 'Our Roadmap', icon: Map },
  { href: '/support', label: 'Support', icon: Heart },
  { href: '/guide/kidnapping', label: 'Safety Guide', icon: BookOpen },
]

export function Navigation() {
  const pathname = usePathname()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-8 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border shadow-sm w-full overflow-x-hidden safe-left safe-right"
        style={{
          paddingLeft: 'max(0px, env(safe-area-inset-left))',
          paddingRight: 'max(0px, env(safe-area-inset-right))',
          top: 'calc(2rem + max(0px, env(safe-area-inset-top)))',
        }}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2"
              >
                <Logo size="lg" variant="default" />
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link key={link.href} href={link.href}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-colors
                        ${isActive 
                          ? 'bg-muted text-foreground' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }
                      `}
                    >
                      {link.label}
                    </motion.div>
                  </Link>
                )
              })}
            </div>

            {/* Right Side: Badge + Support Button + Mobile Menu */}
            <div className="flex items-center gap-2 md:gap-3">
            {/* Community Reporting Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              {/* Mobile: Compact badge */}
              <div className="md:hidden">
                <Link href="/roadmap">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg overflow-hidden backdrop-blur-md border border-white/30 dark:border-zinc-700/50 shadow-lg cursor-pointer"
                  >
                  {/* Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-emerald-500/15 to-green-600/20 dark:from-green-600/20 dark:via-emerald-600/15 dark:to-green-700/20" />
                  <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80" />
                  
                  {/* Content */}
                  <div className="relative flex items-center gap-1.5">
                    <div className="relative">
                      <Users className="w-3.5 h-3.5 text-green-600 dark:text-emerald-400" />
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.6, 1, 0.6]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-0.5 -right-0.5"
                      >
                        <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-lg shadow-emerald-500/50" />
                      </motion.div>
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="text-[9px] font-semibold text-foreground whitespace-nowrap">
                        Real time alerts
                      </span>
                      <span className="text-[8px] font-semibold text-green-600 dark:text-emerald-500 mt-0.5">
                        and reporting coming soon
                      </span>
                    </div>
                  </div>
                </motion.div>
                </Link>
              </div>

              {/* Desktop: Full badge */}
              <div className="hidden md:flex items-center">
                <Link href="/roadmap">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl overflow-hidden backdrop-blur-md border border-white/30 dark:border-zinc-700/50 shadow-lg cursor-pointer"
                  >
                  {/* Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/25 via-emerald-500/20 to-green-600/25 dark:from-green-600/25 dark:via-emerald-600/20 dark:to-green-700/25" />
                  <div className="absolute inset-0 bg-white/85 dark:bg-zinc-900/85" />
                  
                  {/* Animated gradient overlay */}
                  <motion.div
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/10 to-transparent bg-[length:200%_100%]"
                  />
                  
                  {/* Content */}
                  <div className="relative flex items-center gap-2.5">
                          <div className="relative">
                            <Users className="w-4 h-4 text-green-600 dark:text-emerald-400" />
                            <motion.div
                              animate={{ 
                                scale: [1, 1.3, 1],
                                opacity: [0.6, 1, 0.6]
                              }}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                              className="absolute -top-0.5 -right-0.5"
                            >
                              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-lg shadow-emerald-500/50" />
                            </motion.div>
                          </div>
                    <div className="flex flex-col leading-tight">
                      <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                        Real time alerts
                      </span>
                      <span className="text-[10px] font-semibold bg-gradient-to-r from-green-600 to-emerald-500 dark:from-emerald-400 dark:to-emerald-300 bg-clip-text text-transparent mt-0.5">
                        and reporting coming soon
                      </span>
                    </div>
                  </div>
                </motion.div>
                </Link>
              </div>
            </motion.div>

            {/* Support Button */}
            <Link href="/support" className="hidden md:block">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Heart className="w-4 h-4" />
                Support
              </motion.button>
            </Link>

            {/* Mobile Hamburger Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDrawerOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors touch-target min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Open menu"
              aria-expanded={isDrawerOpen}
            >
              <Menu className="w-6 h-6 text-foreground" aria-hidden="true" />
            </motion.button>
          </div>
        </div>
      </nav>
    </motion.header>

    {/* Mobile Drawer */}
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDrawerOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsDrawerOpen(false)
              }
            }}
            className="md:hidden fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            role="button"
            tabIndex={0}
            aria-label="Close drawer"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="md:hidden fixed top-8 right-0 bottom-0 z-[100] w-80 bg-background border-l border-border shadow-2xl safe-top safe-bottom safe-right"
            style={{
              paddingTop: 'max(0px, env(safe-area-inset-top))',
              paddingBottom: 'max(0px, env(safe-area-inset-bottom))',
              paddingRight: 'max(0px, env(safe-area-inset-right))',
              top: 'calc(2rem + 4rem + max(0px, env(safe-area-inset-top)))',
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="flex flex-col h-full">
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Logo size="md" variant="default" />
                  <span className="font-bold">Menu</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors touch-target min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </motion.button>
              </div>

              {/* Drawer Links */}
              <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                {mobileNavLinks.map((link, index) => {
                  const Icon = link.icon
                  const isActive = pathname === link.href
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsDrawerOpen(false)}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-xl transition-colors touch-target min-h-[44px]
                          ${isActive 
                            ? 'bg-muted text-foreground' 
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }
                        `}
                        aria-label={link.label}
                      >
                        <Icon className="w-5 h-5" aria-hidden="true" />
                        <span className="font-medium">{link.label}</span>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  A Thinknodes Innovation Lab Project
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  )
}

