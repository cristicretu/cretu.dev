const { spacing, fontFamily } = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

const mono = [
  'ui-monospace',
  'SFMono-Regular',
  'Menlo',
  'Monaco',
  'Consolas',
  'Liberation Mono',
  'monospace',
]

module.exports = {
  mode: 'jit',
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        white: '#fff',
        green: colors.emerald,
        yellow: colors.amber,
        purple: colors.violet,
        gray: colors.neutral,
        'gray-150': '#EEEFF2',
        'gray-1000': '#050505',
        black: '#050505',
        'design-details': '#458886',
        'design-details-light': '#EEF3F3',
        'design-details-dark': '#273F3F',
        'hacker-news': '#FF965A',
        twitter: '#479BEA',
        current: 'currentColor',
      },
      fontFamily: {
        sans: [...mono, 'system-ui'],
      },
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
  variants: {
    typography: ['dark'],
  },
  plugins: [require('@tailwindcss/typography')],
}
