/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber': {
          cyan: '#00f5ff',
          purple: '#a855f7',
          pink: '#ec4899',
        },
        'slate': {
          950: '#0a0a0f',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      // Animations defined in src/index.css to avoid duplication
    },
  },
  plugins: [],
}
