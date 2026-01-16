'use client'

import Link from 'next/link'
import { NigerianShield } from './NigerianShield'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <NigerianShield className="w-10 h-10" />
              <span className="font-semibold text-lg text-white">SafetyAlerts</span>
            </div>
            <p className="text-sm leading-relaxed max-w-md">
              Real-time safety alerts from people in your neighborhood.
              Built by Nigerians, for Nigerians. Keeping our communities safe, together.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">App</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/app" className="hover:text-white transition-colors">
                  Open App
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a href="mailto:support@safetyalerts.ng" className="hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">
            © {new Date().getFullYear()} SafetyAlerts. Made with ❤️ in Nigeria.
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span>Protecting Nigerian communities</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
