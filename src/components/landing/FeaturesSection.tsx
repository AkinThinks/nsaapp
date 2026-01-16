'use client'

import { MapPin, Shield, Zap, Smartphone, Users, Lock } from 'lucide-react'

const features = [
  {
    icon: MapPin,
    title: 'GPS Verified',
    description: 'Every report is location-verified. No fake alerts from people who aren\'t there.',
  },
  {
    icon: Users,
    title: 'Community Confirmed',
    description: 'Multiple people must confirm before an alert is marked as verified.',
  },
  {
    icon: Zap,
    title: 'Instant Delivery',
    description: 'Alerts reach you in seconds, not minutes. Speed saves lives.',
  },
  {
    icon: Lock,
    title: 'Privacy First',
    description: 'Your exact location is never shared. Report anonymously, stay safe.',
  },
  {
    icon: Smartphone,
    title: 'Works Offline',
    description: 'View cached alerts even without data. Works on any phone.',
  },
  {
    icon: Shield,
    title: 'No App Download',
    description: 'Works in your browser. No storage space needed, always up to date.',
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 bg-emerald-900 text-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Built for Nigerian Reality
          </h2>
          <p className="mt-4 text-lg text-emerald-200">
            Designed to work when and where you need it most
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-emerald-800 rounded-xl flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-emerald-300" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                <p className="text-emerald-200 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
