'use client'

const testimonials = [
  {
    quote: 'I was about to drive through Lekki Phase 1 when I got an alert about a robbery operation. I took another route and got home safely. This app is a lifesaver.',
    name: 'Chidinma O.',
    location: 'Lekki, Lagos',
    avatar: 'CO',
  },
  {
    quote: 'As a parent, knowing about incidents near my children\'s school before they close gives me peace of mind. The checkpoint alerts also save me hours in traffic.',
    name: 'Olumide A.',
    location: 'Ikeja, Lagos',
    avatar: 'OA',
  },
  {
    quote: 'Finally, an app made for Nigerians by people who understand our reality. The community verification means I can trust the alerts I receive.',
    name: 'Fatima B.',
    location: 'Abuja',
    avatar: 'FB',
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Trusted by Thousands
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Real stories from Nigerians keeping each other safe
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-gray-50 rounded-2xl p-6 md:p-8"
            >
              {/* Quote */}
              <div className="text-4xl text-emerald-300 mb-4">&ldquo;</div>
              <p className="text-gray-700 leading-relaxed mb-6">
                {testimonial.quote}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-700 font-semibold">
                    {testimonial.avatar}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {testimonial.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
