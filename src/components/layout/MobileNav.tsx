'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  Route, 
  Phone, 
  Menu, 
  X, 
  Info, 
  Map, 
  Heart,
  BookOpen
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

const mainNavItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/roads', label: 'Roads', icon: Route },
  { href: '/emergency', label: 'Emergency', icon: Phone },
]

const drawerLinks = [
  { href: '/about', label: 'About', icon: Info },
  { href: '/roadmap', label: 'Our Roadmap', icon: Map },
  { href: '/support', label: 'Support', icon: Heart },
  { href: '/guide/kidnapping', label: 'Safety Guide', icon: BookOpen },
]

export function MobileNav() {
  const pathname = usePathname()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <>
      {/* Bottom Navigation Bar - Always Fixed at Bottom of Viewport */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-background/98 backdrop-blur-xl border-t border-border/50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] mobile-nav"
        style={{
          paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
          paddingLeft: 'max(0.5rem, env(safe-area-inset-left))',
          paddingRight: 'max(0.5rem, env(safe-area-inset-right))',
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-around h-[64px] px-1">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className="flex-1 flex flex-col items-center justify-center min-h-[56px] min-w-[56px] rounded-lg transition-all duration-200 active:scale-95 touch-manipulation"
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <div
                  className={`
                    flex flex-col items-center justify-center gap-1 w-full h-full rounded-lg transition-colors duration-200
                    ${isActive 
                      ? 'text-accent bg-accent/10' 
                      : 'text-muted-foreground active:bg-muted/50'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  <span className="text-[10px] font-medium leading-tight">{item.label}</span>
                </div>
              </Link>
            )
          })}
          
          {/* Menu Button */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex-1 flex flex-col items-center justify-center min-h-[56px] min-w-[56px] rounded-lg transition-all duration-200 active:scale-95 touch-manipulation"
            aria-label="Open menu"
            aria-expanded={isDrawerOpen}
            aria-controls="mobile-drawer"
          >
            <div className="flex flex-col items-center justify-center gap-1 w-full h-full rounded-lg text-muted-foreground active:bg-muted/50 transition-colors duration-200">
              <Menu className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span className="text-[10px] font-medium leading-tight">Menu</span>
            </div>
          </button>
        </div>
      </nav>

      {/* Drawer Overlay */}
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
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              id="mobile-drawer"
              className="md:hidden fixed top-8 right-0 bottom-0 z-[70] w-72 bg-background border-l border-border shadow-2xl safe-top safe-bottom safe-right overflow-hidden"
              style={{
                paddingTop: 'max(0px, env(safe-area-inset-top))',
                paddingBottom: 'max(64px, calc(64px + env(safe-area-inset-bottom)))',
                paddingRight: 'max(0px, env(safe-area-inset-right))',
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
                    className="p-2 rounded-lg hover:bg-muted transition-colors touch-target min-h-[44px] min-w-[44px]"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" aria-hidden="true" />
                  </motion.button>
                </div>

                {/* Drawer Links */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ minHeight: 0 }}>
                  {Array.isArray(drawerLinks) && drawerLinks.length > 0 ? (
                    drawerLinks.map((link, index) => {
                      if (!link || typeof link !== 'object' || !link.href || !link.label) {
                        return null
                      }
                      const Icon = link.icon
                      const isActive = pathname === link.href
                      return (
                        <motion.div
                          key={`drawer-link-${link.href}-${index}`}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05, duration: 0.2 }}
                          style={{ display: 'block', visibility: 'visible' }}
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
                            style={{ display: 'flex', visibility: 'visible', opacity: 1 }}
                          >
                            {Icon && <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" style={{ display: 'block', visibility: 'visible' }} />}
                            <span className="font-medium" style={{ display: 'block', visibility: 'visible' }}>{link.label}</span>
                          </Link>
                        </motion.div>
                      )
                    })
                  ) : (
                    <div className="text-center text-muted-foreground py-8" style={{ display: 'block', visibility: 'visible' }}>
                      <p>No menu items available</p>
                    </div>
                  )}
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


