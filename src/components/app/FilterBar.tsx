'use client'

interface FilterOption {
  value: string
  label: string
  count?: number
}

interface FilterBarProps {
  options: FilterOption[]
  value: string
  onChange: (value: string) => void
}

export function FilterBar({ options, value, onChange }: FilterBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
      {options.map((option) => {
        const isActive = value === option.value
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all touch-target ${
              isActive
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {option.label}
            {option.count !== undefined && option.count > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-red-500 text-white'
              }`}>
                {option.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
