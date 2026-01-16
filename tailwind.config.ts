import type { Config } from 'tailwindcss'

const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: 'var(--background)',
          elevated: 'var(--background-elevated)',
        },
        foreground: {
          DEFAULT: 'var(--foreground)',
          muted: 'var(--foreground-muted)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        border: {
          DEFAULT: 'var(--border)',
          light: 'var(--border-light)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          light: 'var(--primary-light)',
          foreground: 'var(--primary-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          foreground: 'var(--accent-foreground)',
        },
        safety: {
          red: {
            DEFAULT: 'var(--safety-red)',
            light: 'var(--safety-red-light)',
            hover: 'var(--safety-red-hover)',
          },
          green: {
            DEFAULT: 'var(--safety-green)',
            light: 'var(--safety-green-light)',
            hover: 'var(--safety-green-hover)',
          },
          amber: {
            DEFAULT: 'var(--safety-amber)',
            light: 'var(--safety-amber-light)',
            hover: 'var(--safety-amber-hover)',
          },
          orange: {
            DEFAULT: 'var(--safety-orange)',
            light: 'var(--safety-orange-light)',
          },
        },
        nigerian: {
          green: {
            DEFAULT: 'var(--nigerian-green)',
            light: 'var(--nigerian-green-light)',
          },
        },
        risk: {
          extreme: 'var(--risk-extreme)',
          'extreme-bg': 'var(--risk-extreme-bg)',
          'extreme-border': 'var(--risk-extreme-border)',
          'very-high': 'var(--risk-very-high)',
          'very-high-bg': 'var(--risk-very-high-bg)',
          'very-high-border': 'var(--risk-very-high-border)',
          high: 'var(--risk-high)',
          'high-bg': 'var(--risk-high-bg)',
          'high-border': 'var(--risk-high-border)',
          moderate: 'var(--risk-moderate)',
          'moderate-bg': 'var(--risk-moderate-bg)',
          'moderate-border': 'var(--risk-moderate-border)',
          low: 'var(--risk-low)',
          'low-bg': 'var(--risk-low-bg)',
          'low-border': 'var(--risk-low-border)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        inter: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        'full': 'var(--radius-full)',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        'glow-green': '0 0 20px rgba(22, 163, 74, 0.3)',
        'glow-red': '0 0 20px rgba(220, 38, 38, 0.3)',
        'glow-blue': '0 0 20px rgba(37, 99, 235, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'aurora': 'aurora 60s linear infinite',
        'fade-in-up': 'fadeInUp 0.3s ease-out forwards',
        'scale-in': 'scaleIn 0.2s ease-out forwards',
        'success': 'successBounce 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
        'gentle-pulse': 'gentlePulse 2s ease-in-out infinite',
        'safe-status': 'safeBreathing 3s ease-in-out infinite',
        'alert-pulse': 'alertPulse 2s ease-in-out infinite',
        'slide-in': 'slideInRight 0.3s ease-out forwards',
        'slide-out': 'slideOutRight 0.3s ease-out forwards',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        aurora: {
          from: { backgroundPosition: '50% 50%, 50% 50%' },
          to: { backgroundPosition: '350% 50%, 350% 50%' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        successBounce: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        gentlePulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        safeBreathing: {
          '0%, 100%': { backgroundColor: 'var(--safety-green-light)' },
          '50%': { backgroundColor: '#dcfce7' },
        },
        alertPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(220, 38, 38, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(220, 38, 38, 0)' },
        },
        slideInRight: {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        slideOutRight: {
          from: { transform: 'translateX(0)', opacity: '1' },
          to: { transform: 'translateX(100%)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '200ms',
        'slow': '300ms',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
    },
  },
  plugins: [addVariablesForColors],
}
export default config

