// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: process.env.NODE_ENV === 'production' },
  css: [
    '~/assets/css/tailwind.css',
    '~/assets/css/quill-global.css',
    'primevue/resources/themes/saga-blue/theme.css',
    'primevue/resources/primevue.min.css',
    'primeicons/primeicons.css',
  ],
  plugins: ["~/plugins/firebase.client.js"],
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
      collections: ['heroicons', 'mdi', 'ep', 'fluent', 'icon-park-solid', 'ic', 'clarity', 'material-symbols-light', 'lets-icons', 'mingcute', 'mynaui', 'bxs', 'lsicon', 'mage', 'majesticons'],
      // Ensure collections are properly resolved
      remote: false
    },
    clientBundle: {
      scan: true,
      sizeLimitKb: 256
    },
    // Add provider configuration
    provider: 'iconify',
    // Disable CDN fallback in production
    fallbackToApi: false
  },
  // ...existing code...
  // Enhanced error handling with 404 catch-all
  nitro: {
    // Error handling is now done via pages/[...slug].vue
    experimental: {
      wasm: true
    }
  },
  ssr: true,
   runtimeConfig: {
    public: {
      // Gateway API (for authentication, general operations)
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL ||
        (process.env.NODE_ENV === 'production'
          ? 'https://gateway.etickets.asia/api/v1'
          : 'https://dev-gateway.prestigealliance.co/api/v1'),
      
      // Admin API (for admin operations)
      apiAdminBaseUrl: process.env.NUXT_PUBLIC_API_ADMIN_BASE_URL ||
        (process.env.NODE_ENV === 'production'
          ? 'https://api-ticket.etickets.asia/api/v1/admin'
          : 'https://dev-apiticket.prestigealliance.co/api/v1/admin'),
      
      // Ticket API (for ticket operations, booking, orders)
      apiTicketBaseUrl: process.env.NUXT_PUBLIC_API_TICKET_BASE_URL ||
        (process.env.NODE_ENV === 'production'
          ? 'https://api-ticket.etickets.asia/api/v1'
          : 'https://dev-apiticket.prestigealliance.co/api/v1'),
      
      appName: process.env.NUXT_PUBLIC_APP_NAME ||
        (process.env.NODE_ENV === 'production'
          ? 'eTicketsAsia'
          : 'eTicketsAsia (production)'),
      appVersion: process.env.NUXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'production',
      //firebase
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
      firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID
    },
   proxy: {
  '/api/': {
    target: process.env.API_BASE_URL, // use env variable
    pathRewrite: { '^/api/': '' },
    changeOrigin: true,
  }
}
  },
})