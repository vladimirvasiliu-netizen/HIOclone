/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bolt: {
          DEFAULT: '#00B14F',
          dark: '#00893D',
        },
        glovo: {
          DEFAULT: '#FFC244',
          dark: '#F2A900',
        },
      },
    },
  },
  plugins: [],
};
