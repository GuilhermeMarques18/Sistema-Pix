import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx}',
    './src/pages/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          logo: '#32BCA9',
          element: '#33AA6E',
          button: '#29925F',
        },
        bg: {
          DEFAULT: '#151B1F',
          input: '#23272C',
        },
        text: {
          DEFAULT: '#E6E6E6',
          secondary: '#9EA2A6',
          tertiary: '#4CB277',
          negative: '#C86159',
          warning: '#F59E0B',
        },
        border: '#23272C',
      },
      fontSize: {
        xs: ['11px', { lineHeight: '1.4' }],
        sm: ['13px', { lineHeight: '1.5' }],
        base: ['15px', { lineHeight: '1.6' }],
        title: ['25px', { lineHeight: '1.3' }],
      },
      backgroundColor: {
        DEFAULT: '#151B1F',
      },
    },
  },
  plugins: [],
};

export default config;
