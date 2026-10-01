/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0a0a0a',
        secondary: '#111111',
        card: '#161616',
        accent: '#8B1A10',
        'accent-light': '#a52116',
        'accent-dim': 'rgba(139,26,16,0.15)',
        border: '#1f1f1f',
        'text-muted': '#666666',
        'text-secondary': '#aaaaaa',
        'light-bg': '#f4f4f2',
        'light-text': '#0a0a0a',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
