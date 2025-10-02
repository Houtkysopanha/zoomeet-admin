// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  // Skip middleware for server-side rendering on non-admin routes
  if (import.meta.server && !to.path.startsWith('/admin')) {
    return
  }

  const { getToken, isTokenExpired, clearAuth } = useAuth()

  // Protect /admin routes (except public booking routes)
  if (import.meta.client && to.path.startsWith('/admin')) {
    // Allow public access to booking routes for customers
    const publicBookingRoutes = ['/admin/booking']
    const isPublicBookingRoute = publicBookingRoutes.some(route => to.path.startsWith(route))
    
    if (!isPublicBookingRoute) {
      const token = getToken()

      if (!token || isTokenExpired()) {
        console.log('❌ No valid token found, redirecting to login')
        clearAuth()
        return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
      }
    }
  }

  // Redirect authenticated users away from /login
  if (import.meta.client && to.path === '/login') {
    const token = getToken()
    if (token && !isTokenExpired()) {
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
      const token = getToken()
      if (token && !isTokenExpired()) {
        return navigateTo('/admin/dashboard')
      }
    }
    return navigateTo('/login')
  }
})
