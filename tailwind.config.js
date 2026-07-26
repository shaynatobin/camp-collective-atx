/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-forest': '#3B6E52',
        'brand-forest-dark': '#274A38',
        'brand-coral': '#E8794A',
        'brand-coral-dark': '#C25E33',
        'brand-sun': '#F2C14E',
        'brand-ink': '#26241F',
        'brand-ink-soft': '#6B6558',
        'brand-cream': '#F3ECDD',
        'brand-paper': '#FAF6EF',
        'brand-border': '#EAE1CC',
      },
      fontFamily: {
        display: ['"Fredoka"', 'system-ui', 'sans-serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
