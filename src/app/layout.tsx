import type { Metadata } from 'next'
import './globals.css'
import { Navigation } from '@/components/layout/Navigation'
import { MobileNav } from '@/components/layout/MobileNav'
import { PageTransition } from '@/components/animations/PageTransition'
import { TopBanner } from '@/components/layout/TopBanner'
import { BrowserCompatProvider } from '@/components/providers/BrowserCompatProvider'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics'

export const metadata: Metadata = {
  title: 'Nigeria Security Alert | Real-time Safety Intelligence',
  description: 'Verified security intelligence for Nigeria. Check road safety, emergency contacts, and stay informed about security situations across all 36 states.',
  keywords: 'Nigeria security, safety alerts, road safety Nigeria, emergency contacts Nigeria, kidnapping prevention, travel safety Nigeria',
  authors: [{ name: 'Thinknodes Innovation Lab' }],
  icons: {
    icon: '/images/logo.png',
    shortcut: '/images/logo.png',
    apple: '/images/logo.png',
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Nigeria Security Alert',
  },
  openGraph: {
    title: 'Nigeria Security Alert',
    description: 'Verified intelligence. Community safety.',
    url: 'https://safe.thinknodes.com',
    siteName: 'Nigeria Security Alert',
    locale: 'en_NG',
    type: 'website',
    images: [
      {
        url: 'https://safe.thinknodes.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Nigeria Security Alert Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nigeria Security Alert',
    description: 'Verified intelligence. Community safety.',
    images: ['https://safe.thinknodes.com/images/logo.png'],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'format-detection': 'telephone=no', // Prevent auto-linking phone numbers
    'x-ua-compatible': 'IE=edge', // For older browsers
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover' as const,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/images/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/logo.png" />
        <link rel="shortcut icon" href="/images/logo.png" type="image/png" />
        
        {/* Open Graph / Social Media Preview Images */}
        <meta property="og:image" content="https://safe.thinknodes.com/images/logo.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Nigeria Security Alert Logo" />
        <meta property="og:image:type" content="image/png" />
        
        {/* Twitter Card Image */}
        <meta name="twitter:image" content="https://safe.thinknodes.com/images/logo.png" />
        <meta name="twitter:image:alt" content="Nigeria Security Alert Logo" />
        
        {/* Additional meta tags for mobile compatibility */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="HandheldFriendly" content="true" />
        <meta name="MobileOptimized" content="320" />
        <GoogleAnalytics />
      </head>
      <body className="min-h-screen bg-background antialiased overflow-x-hidden w-full">
        <BrowserCompatProvider>
          <TopBanner />
          <Navigation />
          <main className="pt-24 pb-8 md:pb-0 w-full overflow-x-hidden">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
          <MobileNav />
        </BrowserCompatProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

