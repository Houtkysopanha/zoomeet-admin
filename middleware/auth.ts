

export default defineNuxtRouteMiddleware(async (to) => {
  if (process.client) {
    const { isAuthenticated, isTokenExpired, isRefreshTokenExpired, refreshToken, clearAuth } = useAuth()
    
    // Check if user is trying to access admin routes
    if (to.path.startsWith("/admin")) {
      // If not authenticated, redirect to login
      if (!isAuthenticated.value) {
        return navigateTo("/login")
      }
      
      // If refresh token is expired, clear auth and redirect
      if (isRefreshTokenExpired()) {
        clearAuth()
        return navigateTo("/login?reason=session_expired")
      }
      
      // If access token is expired, try to refresh
      if (isTokenExpired()) {
        const refreshSuccess = await refreshToken()
        if (!refreshSuccess) {
          clearAuth()
          return navigateTo("/login?reason=refresh_failed")
        }
      }
    }
    
    // If authenticated user tries to access login page, redirect to dashboard
    if (isAuthenticated.value && to.path === "/login" && !isRefreshTokenExpired()) {
      return navigateTo("/admin/dashboard")
    }
  }
});
