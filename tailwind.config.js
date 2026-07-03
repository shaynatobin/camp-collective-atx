/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-terracotta': '#C96A3A',
        'brand-cream': '#FAF4E8',
        'brand-sage': '#6B8F6A',
        'brand-navy': '#1E2B3A',
        'brand-gold': '#E8B84B',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
