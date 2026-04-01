/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#013D5B',
          secondary: '#005f87',
          accent: '#00a8e8',
          dark: '#012a3e',
          light: '#f0f9ff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['Cairo', 'Almarai', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
