const { spacing, fontFamily } = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

module.exports = {
  mode: 'jit',
  content: [
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    colors: {
      white: '#fff',
      gray: {
        100: '#f9f6f3',
        200: '#e4e2e0',
        300: '#cbc5c2',
        400: '#b2aaa3',
        500: '#9b8e85',
        600: '#81756c',
        700: '#665d56',
        800: '#4d4540',
        900: '#342f2c',
        1000: '#1e1b19',
      },
      brand: {
        light: '#3824EA',
        dark: '#24AFEA',
      },
      red: {
        light: '#ff3b30',
        dark: '#ff453a',
      },
      yellow: {
        light: '#ffcc00',
        dark: '#ffd60a',
      },
      blue: {
        light: '#007aff',
        dark: '#0a84ff',
      },
      twitter: '#479BEA',
      current: 'currentColor',
      transparent: 'transparent',
    },
    extend: {
      spacing: {
        128: '32rem',
      },
      fontFamily: {
        sans: ['Switzer', ...fontFamily.sans],
      },
      keyframes: {
        'slide-in': {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'slide-out': {
          '0%': { opacity: 1, transform: 'translateY(0px)' },
          '100%': { opacity: 0, transform: 'translateY(16px)' },
        },
        'text-shimmer': {
          from: { backgroundPosition: '0 0' },
          to: { backgroundPosition: '-200% 0' },
        },
        tilt: {
          '0%, 50%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(0.5deg)' },
          '75%': { transform: 'rotate(-0.5deg)' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.1s ease-out',
        'slide-out': 'slide-out 0.1s ease',
        'text-shimmer': 'text-shimmer 2s ease-out infinite alternate',
        tilt: 'tilt 10s infinite linear',
      },
      typography: theme => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.700'),
            a: {
              color: theme('colors.blue.500'),
              '&:hover': {
                color: theme('colors.blue.700'),
              },
              code: { color: theme('colors.blue.400') },
            },
            'h2,h3,h4': {
              'scroll-margin-top': spacing[32],
            },
            code: { color: theme('colors.pink.500') },
            'blockquote p:first-of-type::before': false,
            'blockquote p:last-of-type::after': false,
          },
        },
        dark: {
          css: {
            color: theme('colors.gray.300'),
            a: {
              color: theme('colors.blue.400'),
              '&:hover': {
                color: theme('colors.blue.600'),
              },
              code: { color: theme('colors.blue.400') },
            },
            blockquote: {
              borderLeftColor: theme('colors.gray.700'),
              color: theme('colors.gray.300'),
            },
            'h2,h3,h4': {
              color: theme('colors.gray.100'),
              'scroll-margin-top': spacing[32],
            },
            hr: { borderColor: theme('colors.gray.700') },
            ol: {
              li: {
                '&:before': { color: theme('colors.gray.500') },
              },
            },
            ul: {
              li: {
                '&:before': { backgroundColor: theme('colors.gray.500') },
              },
            },
            strong: { color: theme('colors.gray.300') },
            thead: {
              color: theme('colors.gray.100'),
            },
            tbody: {
              tr: {
                borderBottomColor: theme('colors.gray.700'),
              },
            },
          },
        },
      }),
    },
  },
  variants: {
    typography: ['dark'],
  },
  plugins: [require('@tailwindcss/typography')],
}
