/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    screens: {
      'xs': '320px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontFamily: {
        'sans': ['Kantumruy', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'khmer': ['Kantumruy', 'sans-serif'],
      },
      backgroundImage: {
        'custom-gradient': 'linear-gradient(79deg, #4D66A6 7.31%, #B61EEB 98.95%)',
      },
      fontSize: {
        // Enhanced responsive typography with better scaling
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.025em' }],
        'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.025em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.025em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em' }],
        '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        '6xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        // Mobile-specific sizes
        'mobile-xs': ['0.6875rem', { lineHeight: '0.875rem' }],
        'mobile-sm': ['0.8125rem', { lineHeight: '1.125rem' }],
        'mobile-base': ['0.9375rem', { lineHeight: '1.375rem' }],
        'mobile-lg': ['1.0625rem', { lineHeight: '1.5rem' }],
        // Tablet-specific sizes
        'tablet-base': ['0.9375rem', { lineHeight: '1.4rem' }],
        'tablet-lg': ['1.0625rem', { lineHeight: '1.6rem' }],
        'tablet-xl': ['1.1875rem', { lineHeight: '1.75rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        // Enhanced responsive spacing
        '15': '3.75rem',
        '17': '4.25rem',
        '19': '4.75rem',
        '21': '5.25rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '38': '9.5rem',
      },
      maxWidth: {
        'xs': '20rem',
        'sm': '24rem',
        'md': '28rem',
        'lg': '32rem',
        'xl': '36rem',
        '2xl': '42rem',
        '3xl': '48rem',
        '4xl': '56rem',
        '5xl': '64rem',
        '6xl': '72rem',
        '7xl': '80rem',
        // Mobile-first responsive containers
        'mobile': '100%',
        'mobile-sm': '95%',
        'tablet': '90%',
        'desktop': '85%',
      },
      minHeight: {
        'screen-mobile': '100vh',
        'screen-tablet': '100vh',
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      // Enhanced responsive breakpoints for better control
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
          xl: '2.5rem',
          '2xl': '3rem',
        },
      }
    },
  },
  plugins: [],
}

