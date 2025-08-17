export default defineNuxtPlugin(() => {
  console.log('🌐 Initializing API plugin...')
  
  const config = useRuntimeConfig()
  
  // Validate API configuration
  if (!config.public.apiBaseUrl) {
    console.warn('⚠️ API base URL not configured')
  }
  
  if (!config.public.apiAdminBaseUrl) {
    console.warn('⚠️ API admin base URL not configured')
  }
  
  console.log('✅ API plugin initialized', {
    hasApiBaseUrl: !!config.public.apiBaseUrl,
    hasApiAdminBaseUrl: !!config.public.apiAdminBaseUrl,
    environment: config.public.environment || 'development'
  })
})