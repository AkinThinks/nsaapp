'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'

export function TopBanner() {
  return (
    <div 
      className="fixed top-0 left-0 right-0 z-40 bg-muted/95 backdrop-blur-md border-b border-border/50 h-8 safe-top safe-left safe-right"
      style={{
        paddingTop: 'max(0px, env(safe-area-inset-top))',
        paddingLeft: 'max(0px, env(safe-area-inset-left))',
        paddingRight: 'max(0px, env(safe-area-inset-right))',
        height: 'calc(2rem + max(0px, env(safe-area-inset-top)))',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Heart className="w-3 h-3 text-accent" />
          <span>
            An open, not-for-profit project by{' '}
            <Link 
              href="https://thinknodes.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-accent transition-colors"
            >
              Thinknodes
            </Link>
          </span>
        </div>
      </div>
    </div>
  )
}

