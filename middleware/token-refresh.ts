// Auto refresh middleware - automatically refreshes tokens when needed
export default defineNuxtRouteMiddleware(async (to, from) => {
  // Only run on client side
  if (process.server) return

  const { 
    isAuthenticated, 
    shouldRefreshToken, 
    refreshToken,
    getTimeUntilExpiry,
    isTokenExpired
  } = useAuth()

  // Skip if not authenticated
  if (!isAuthenticated.value) return

  // Check if token is expired
  if (isTokenExpired()) {
    console.warn('⚠️ Token expired, clearing auth')
    const { clearAuth } = useAuth()
    clearAuth()
    return navigateTo('/login?session_expired=true&reason=token_expired')
  }

  // Check if we should refresh the token (less than 5 minutes remaining)
  if (shouldRefreshToken()) {
    console.log('🔄 Token refresh needed, attempting refresh...')
    
    try {
      const refreshSuccess = await refreshToken()
      
      if (refreshSuccess) {
      } else {
        console.error('❌ Token refresh failed in middleware')
        return navigateTo('/login?session_expired=true&reason=refresh_failed')
      }
    } catch (error) {
      console.error('❌ Token refresh error in middleware:', error)
      return navigateTo('/login?session_expired=true&reason=refresh_error')
    }
  }
})
