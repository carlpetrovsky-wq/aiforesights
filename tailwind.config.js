/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          sky:    '#0EA5E9',
          skyDark:'#0284C7',
          skyLight:'#38BDF8',
          navy:   '#0F172A',
          navyMid:'#1E293B',
          navyLight:'#334155',
          slate:  '#64748B',
          muted:  '#94A3B8',
          border: '#E2E8F0',
          bg:     '#F8FAFC',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      fontSize: {
        'hero': ['clamp(2rem, 5vw, 2.5rem)', { lineHeight: '1.15', letterSpacing: '-0.03em' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
    },
  },
  plugins: [],
}
