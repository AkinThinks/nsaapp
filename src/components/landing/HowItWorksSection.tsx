'use client'

import { MapPin, Bell, Users } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: MapPin,
    title: 'Choose Your Areas',
    description: 'Select the neighborhoods you care about — home, work, family locations. We\'ll watch them all.',
  },
  {
    number: '02',
    icon: Bell,
    title: 'Get Instant Alerts',
    description: 'When something happens nearby, you\'ll know within seconds. GPS-verified, community-confirmed.',
  },
  {
    number: '03',
    icon: Users,
    title: 'Help Your Community',
    description: 'See something? Report it. Confirm others\' reports. Together, we keep everyone safer.',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            How SafetyAlerts Works
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Three simple steps to stay informed and help your community
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-emerald-200 to-emerald-100" />
              )}

              <div className="relative bg-white">
                {/* Step number */}
                <div className="text-6xl font-bold text-emerald-100 mb-4">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                  <step.icon className="w-6 h-6 text-emerald-700" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
