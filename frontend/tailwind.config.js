/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        soc: {
          bg: '#080A0D',
          shell: '#0B0E13',
          card: '#10141C',
          elevated: '#151B25',
          border: '#1E2532',
          'border-muted': '#171D28',
          'border-hover': '#2A3345',
          text: {
            primary: '#E2E8F0',
            secondary: '#94A3B8',
            muted: '#64748B',
            dim: '#475569'
          }
        }
      }
    },
  },
  plugins: [],
}
