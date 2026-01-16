'use client'

import { HeroSection } from '@/components/landing/HeroSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { IncidentTypesSection } from '@/components/landing/IncidentTypesSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { FAQSection } from '@/components/landing/FAQSection'
import { CTASection } from '@/components/landing/CTASection'
import { Footer } from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection />
      <HowItWorksSection />
      <IncidentTypesSection />
      <TestimonialsSection />
      <FeaturesSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  )
}
