// Enhanced global auth middleware with automatic token refresh
export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip middleware for server-side rendering on non-admin routes
  if (import.meta.server && !to.path.startsWith('/admin')) {
    return
  }

  const { 
    isAuthenticated, 
    getToken, 
    isTokenExpired, 
    isRefreshTokenExpired,
    shouldRefreshToken,
    refreshToken,
    clearAuth 
  } = useAuth()

  // Protect /admin routes (except public booking routes)
  if (import.meta.client && to.path.startsWith('/admin')) {
    // Allow public access to booking routes for customers
    const publicBookingRoutes = ['/admin/booking']
    const isPublicBookingRoute = publicBookingRoutes.some(route => to.path.startsWith(route))
    
    if (!isPublicBookingRoute) {
      // Check if user is authenticated
      if (!isAuthenticated.value) {
        console.log('❌ User not authenticated, redirecting to login')
        return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
      }

      // If refresh token is expired, clear auth and redirect
      if (isRefreshTokenExpired()) {
        console.log('❌ Refresh token expired, clearing auth')
        clearAuth()
        return navigateTo(`/login?reason=session_expired&redirect=${encodeURIComponent(to.fullPath)}`)
      }

      // If access token is expired, try to refresh it
      if (isTokenExpired()) {        
        // First check if we have a valid refresh token
        if (isRefreshTokenExpired()) {
          console.log('❌ Refresh token also expired, clearing auth')
          clearAuth()
          return navigateTo(`/login?reason=session_expired&redirect=${encodeURIComponent(to.fullPath)}`)
        }
        
        const refreshSuccess = await refreshToken()
        if (!refreshSuccess) {
          console.log('❌ Token refresh failed in middleware, clearing auth')
          clearAuth()
          return navigateTo(`/login?reason=refresh_failed&redirect=${encodeURIComponent(to.fullPath)}`)
        }
      }
      
      // Proactive refresh if token expires soon
      else if (shouldRefreshToken()) {
        console.log('⚠️ Token expires soon, proactively refreshing in middleware...')
        // Don't await this, let it happen in background
        refreshToken().catch(error => {
          console.error('❌ Proactive refresh failed in middleware:', error)
        })
      }
    }
  }

  // Redirect authenticated users away from /login
  if (import.meta.client && to.path === '/login') {
    if (isAuthenticated.value && !isRefreshTokenExpired()) {
      const redirectTo = to.query.redirect as string
      if (redirectTo && redirectTo.startsWith('/admin')) {
        return navigateTo(redirectTo)
      }
      return navigateTo('/admin/dashboard')
    }
  }

  // Root path handling
  if (to.path === '/') {
    if (import.meta.client) {
      if (isAuthenticated.value && !isRefreshTokenExpired()) {
        return navigateTo('/admin/dashboard')
      }
    }
    return navigateTo('/login')
  }
})
