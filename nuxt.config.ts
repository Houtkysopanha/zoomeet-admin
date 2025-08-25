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
  // Alternative font loading using head configuration
  app: {
    head: {
      title: 'eTicketsAsia',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'eTicketsAsia - Event Management System' }
      ],
      link: [
        // Google Fonts - replace @nuxt/fonts functionality
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com'
        },
        {
          rel: 'preconnect', 
          href: 'https://fonts.gstatic.com',
          crossorigin: ''
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
        }
      ]
    },
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
    }
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  build: {
    transpile: ['primevue']
  },
  modules: [
    'nuxt-primevue',
    // '@nuxt/fonts', // Disabled due to dependency issues - using CSS imports instead
    '@nuxt/icon',
    '@pinia/nuxt'
  ],
  primevue: {
    options: {
      ripple: true
    },
    components: {
      include: ['Toast', 'Badge', 'DataTable', 'Column', 'ColumnGroup', 'Row', 'TabMenu', 'InputText', 'Dropdown', 'Textarea', 'Calendar', 'Sidebar', 'Divider', 'Button', 'InputNumber', 'Dialog', 'Avatar', 'ProgressSpinner', 'TabView', 'TabPanel', 'ConfirmPopup', 'Toggleswitch']
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
      collections: ['heroicons', 'mdi', 'ep', 'fluent', 'icon-park-solid'] // include collections you actually use
    },
    clientBundle: {
      scan: true,
      sizeLimitKb: 256
    }
  },
  // ...existing code...
  // Enhanced error handling with 404 catch-all
  nitro: {
    // Error handling is now done via pages/[...slug].vue
  },
  ssr: true,
  runtimeConfig: {
    // Private keys (only available on server-side)
    tokenSecret: process.env.TOKEN_SECRET || 'fallback-secret-key',
    // Public keys (exposed to client-side)
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
      environment: process.env.NODE_ENV || 'production',
      // Enhanced token configuration for 24-hour sessions
      auth: {
        tokenExpiryWarning: 7200000, // 2 hours in milliseconds (warn 2h before expiry)
        tokenCheckInterval: 1800000,  // 30 minutes in milliseconds (check every 30min)
        maxRefreshAttempts: 3,
        autoRefreshEnabled: true,
        secureCookies: process.env.NODE_ENV === 'production',
        cookieDomain: process.env.NODE_ENV === 'production' ? '.etickets.asia' : 'localhost',
        sessionDuration: 86400000 // 24 hours in milliseconds
      }
    },
    proxy: {
    '/api/': {
      target: 'https://api-ticket.etickets.asia/api/v1',
      pathRewrite: { '^/api/': '' },
      changeOrigin: true,
    }
  }
  },
})