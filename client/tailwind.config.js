/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        brand: ['Italiana', 'serif'],
      },
      colors: {
        'sand': '#f8f5f2',
        'sand-dark': '#efeae4',
        'charcoal': '#2c2c2c',
        'charcoal-light': '#4a4a4a',
        'accent': '#d97706', // Muted amber/orange
      }
    },
  },
  plugins: [],
}

