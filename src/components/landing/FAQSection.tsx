'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'Is my location shared with other users?',
    answer: 'No. Your exact location is never shared. When you report an incident, other users only see the general area (e.g., "Near Lekki Phase 1"), not your precise location. Your privacy is our priority.',
  },
  {
    question: 'How do I know the alerts are real?',
    answer: 'Every alert goes through multiple verification steps: GPS verification ensures the reporter is actually in the area, and community confirmation means multiple people must verify before an alert is marked as confirmed. Fake reporters are quickly identified and blocked.',
  },
  {
    question: 'Does it work without internet?',
    answer: 'Yes! SafetyAlerts caches recent alerts so you can view them even when offline. When you reconnect, new alerts will automatically sync. The app is designed to work on slow networks too.',
  },
  {
    question: 'How much data does it use?',
    answer: 'Very little. SafetyAlerts is optimized for Nigerian networks. A full day of alerts uses less than 5MB. You can also enable "Low Data Mode" in settings to reduce usage further.',
  },
  {
    question: 'Can I report anonymously?',
    answer: 'Absolutely. Your identity is never shown to other users. Reports appear as "A community member reported..." We only use your account to prevent spam and verify your location.',
  },
  {
    question: 'Is this app free?',
    answer: 'Yes, SafetyAlerts is completely free and will remain free. Community safety shouldn\'t have a price tag. We may introduce optional premium features in the future, but core alerts will always be free.',
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Everything you need to know about SafetyAlerts
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between gap-4"
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
