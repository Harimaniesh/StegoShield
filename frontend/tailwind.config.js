/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0a0d14',
          card: '#121824',
          border: '#1e293b',
          accent: '#06b6d4',
          glow: '#00f0ff',
          neon: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          muted: '#64748b'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'cyber-grid': "radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.05) 0%, transparent 80%), linear-gradient(rgba(15, 23, 42, 0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 23, 42, 0.8) 1px, transparent 1px)",
      }
    },
  },
  plugins: [],
}
