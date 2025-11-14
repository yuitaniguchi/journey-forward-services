/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: '#295C4D',
        'brand-dark': '#16352C',
        'brand-light': '#E8F4EF',
        'brand-yellow': '#F5C64C',
        'brand-gray': '#F3F4F6',
      },
    },
  },
  plugins: [],
};
