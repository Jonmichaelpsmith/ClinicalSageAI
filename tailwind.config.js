/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        glass: {
          light: 'rgba(255, 255, 255, 0.7)',
          dark: 'rgba(15, 23, 42, 0.7)'
        },
        regulatory: {
          50:  "#f5f0ff",
          100: "#ede4ff",
          200: "#d9c8ff",
          300: "#c5abff",
          400: "#9d72ff",
          500: "#7549ff",
          600: "#5b30e6",
          700: "#4524b3",
          800: "#2e1780",
          900: "#190b4d",
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      fontFamily: {
        sans: ['Inter var', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'glass-dark': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}