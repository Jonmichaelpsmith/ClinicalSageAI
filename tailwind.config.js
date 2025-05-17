/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        msblue: {
          DEFAULT: '#0078d4',
          light: '#c7e0f4',
          dark: '#005a9e',
        },
      },
    },
  },
  plugins: [],
}