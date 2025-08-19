// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: process.env.NODE_ENV === 'development' },
  css: [
    '~/assets/css/tailwind.css',
    'primevue/resources/themes/saga-blue/theme.css',
    'primevue/resources/primevue.min.css',
    'primeicons/primeicons.css',
  ],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  build: {
    transpile: ['primevue', 'primeicons']
  },
  modules: [
    'nuxt-primevue',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@pinia/nuxt'
  ],
  // Font optimization - disable in production to reduce bundle size
  fonts: {
    families: [
      // Only load essential fonts
      { name: 'Inter', provider: 'google' }
    ],
    // Disable font loading in production for Khmer support
    defaults: {
      weights: [400, 500, 600, 700],
      styles: ['normal'],
      subsets: process.env.NODE_ENV === 'production' ? ['latin'] : ['latin', 'latin-ext']
    }
  },
  primevue: {
    options: {
      ripple: process.env.NODE_ENV === 'development' // Disable ripple in production for performance
    },
    components: {
      include: ['Toast', 'Badge', 'DataTable', 'Column', 'ColumnGroup', 'Row', 'TabMenu', 'InputText', 'Dropdown', 'Textarea', 'Calendar', 'Sidebar', 'Divider', 'Button', 'InputNumber', 'Dialog', 'Avatar', 'ProgressSpinner', 'TabView', 'TabPanel', 'ConfirmPopup']
    },
    directives: {
      include: ['Badge', 'Tooltip']
    }
  },
  imports: {
    autoImport: true
  },
  icon: {
    serverBundle: {
      collections: ['heroicons', 'mdi', 'ep', 'fluent', 'icon-park-solid']
    },
    clientBundle: {
      scan: true,
      sizeLimitKb: process.env.NODE_ENV === 'production' ? 128 : 256 // Reduce icon bundle size in production
    }
  },
  // Enhanced app configuration
  app: {
    // Global page transitions
    pageTransition: {
      name: 'page',
      mode: 'out-in',
      duration: 300
    },
    // Layout transitions
    layoutTransition: {
      name: 'layout',
      mode: 'out-in',
      duration: 300
    },
    // Global head configuration
    head: {
      title: 'eTicketsAsia',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'eTicketsAsia - Event Management System' }
      ]
    }
  },
  // Enhanced error handling with 404 catch-all
  nitro: {
    // Error handling is now done via pages/[...slug].vue
  },
  ssr: true,
  // Production optimizations
  experimental: {
    payloadExtraction: false // Disable payload extraction for better performance
  },
  // Runtime configuration
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL ||
        (process.env.NODE_ENV === 'development'
          ? 'https://dev-gateway.prestigealliance.co/api/v1'
          : 'https://gateway.etickets.asia/api/v1'),
      apiAdminBaseUrl: process.env.NUXT_PUBLIC_API_ADMIN_BASE_URL ||
        (process.env.NODE_ENV === 'development'
          ? 'https://dev-apiticket.prestigealliance.co/api/v1/admin'
          : 'https://api-ticket.etickets.asia/api/v1/admin'),
      appName: process.env.NUXT_PUBLIC_APP_NAME ||
        (process.env.NODE_ENV === 'development'
          ? 'eTicketsAsia (Dev)'
          : 'eTicketsAsia'),
      appVersion: process.env.NUXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'production'
    },
    proxy: {
    '/api/': {
      target: 'https://api-ticket.etickets.asia/api/v1',
      pathRewrite: { '^/api/': '' },
      changeOrigin: true,
    }
  }
  },
  // Production performance optimizations
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'primevue': ['primevue'],
            'vue-vendor': ['vue', 'vue-router', '@vue/runtime-core'],
            'utils': ['axios', 'pinia']
          }
        }
      }
    },
    optimizeDeps: {
      include: ['primevue', 'primeicons']
    },
    resolve: {
      alias: {
        'primeicons/primeicons.css': 'primeicons/primeicons.css'
      }
    }
  }
})