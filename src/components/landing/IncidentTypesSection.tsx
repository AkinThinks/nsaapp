'use client'

import {
  RobberyIcon,
  CheckpointIcon,
  TrafficIcon,
  FireIcon,
  AccidentIcon,
  SuspiciousIcon,
  GunshotsIcon,
  KidnappingIcon,
} from './IncidentIcons'

const incidentTypes = [
  {
    icon: RobberyIcon,
    label: 'Robbery',
    color: 'bg-red-50 border-red-100',
  },
  {
    icon: GunshotsIcon,
    label: 'Gunshots',
    color: 'bg-red-50 border-red-100',
  },
  {
    icon: KidnappingIcon,
    label: 'Kidnapping',
    color: 'bg-red-50 border-red-100',
  },
  {
    icon: CheckpointIcon,
    label: 'Checkpoint',
    color: 'bg-yellow-50 border-yellow-100',
  },
  {
    icon: TrafficIcon,
    label: 'Traffic',
    color: 'bg-yellow-50 border-yellow-100',
  },
  {
    icon: SuspiciousIcon,
    label: 'Suspicious',
    color: 'bg-yellow-50 border-yellow-100',
  },
  {
    icon: FireIcon,
    label: 'Fire',
    color: 'bg-orange-50 border-orange-100',
  },
  {
    icon: AccidentIcon,
    label: 'Accident',
    color: 'bg-orange-50 border-orange-100',
  },
]

export function IncidentTypesSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Stay Informed About
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Real-time alerts for the incidents that matter most
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
          {incidentTypes.map((type) => (
            <div
              key={type.label}
              className={`${type.color} border rounded-2xl p-6 text-center transition-transform hover:scale-105`}
            >
              <type.icon className="w-12 h-12 mx-auto mb-3" />
              <span className="font-medium text-gray-900">{type.label}</span>
            </div>
          ))}
        </div>

        <p className="text-center mt-8 text-gray-500">
          Plus protests, flooding, power outages, and more
        </p>
      </div>
    </section>
  )
}
