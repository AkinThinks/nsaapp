import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata: Metadata = {
  title: 'SafetyAlerts | Real-time Community Safety Alerts for Nigeria',
  description: 'Get real-time safety alerts from your community. Report incidents, receive notifications, and stay informed about security in your area.',
  keywords: 'safety alerts Nigeria, community alerts, security notifications, incident reporting, Lagos safety, Abuja safety',
  authors: [{ name: 'SafetyAlerts Nigeria' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192.png',
    shortcut: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SafetyAlerts',
  },
  openGraph: {
    title: 'SafetyAlerts Nigeria',
    description: 'Real-time safety alerts from your community',
    url: 'https://safetyalerts.ng',
    siteName: 'SafetyAlerts',
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SafetyAlerts Nigeria',
    description: 'Real-time safety alerts from your community',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'format-detection': 'telephone=no',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#008751',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <head>
        <link rel="icon" href="/icons/icon-192.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-screen bg-white antialiased overflow-x-hidden w-full">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
