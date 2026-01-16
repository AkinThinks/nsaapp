'use client'

export function NigerianShield({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 80"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shield shape with clip */}
      <defs>
        <clipPath id="shieldClip">
          <path d="M32 0C32 0 0 8 0 16V44C0 60 32 80 32 80C32 80 64 60 64 44V16C64 8 32 0 32 0Z" />
        </clipPath>
      </defs>

      {/* Nigerian flag stripes inside shield */}
      <g clipPath="url(#shieldClip)">
        {/* Left green stripe */}
        <rect x="0" y="0" width="21.33" height="80" fill="#008751" />
        {/* Middle white stripe */}
        <rect x="21.33" y="0" width="21.34" height="80" fill="#FFFFFF" />
        {/* Right green stripe */}
        <rect x="42.67" y="0" width="21.33" height="80" fill="#008751" />
      </g>

      {/* Shield outline for definition */}
      <path
        d="M32 2C32 2 2 9.5 2 17V44C2 58.5 32 77.5 32 77.5C32 77.5 62 58.5 62 44V17C62 9.5 32 2 32 2Z"
        stroke="#0A5C36"
        strokeWidth="2"
        fill="none"
      />

      {/* Inner subtle shine */}
      <path
        d="M32 6C32 6 8 12 8 18V42C8 54 32 70 32 70"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  )
}
