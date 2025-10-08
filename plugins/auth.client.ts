// Enhanced authentication initialization plugin
export default defineNuxtPlugin(async (nuxtApp) => {
  // Only run on client side
  if (process.server) return

  console.log('🔒 Initializing authentication system...')

  try {
    // Initialize auth from storage
    const { initAuth, isAuthenticated } = useAuth()
    initAuth()

    // Always start token monitoring (it will handle authentication checks internally)
    console.log('🔄 Starting token monitoring system')
    const { startTokenMonitoring } = useTokenManager()
    startTokenMonitoring()

    if (isAuthenticated.value) {
    } else {
      console.log('ℹ️ User not authenticated, monitoring will activate on login')
    }

  } catch (error) {
    console.error('❌ Failed to initialize authentication system:', error)
    // Don't throw error to avoid breaking the app
  }
})
