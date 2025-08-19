export default defineNuxtRouteMiddleware((to, from) => {
  // Skip middleware for server-side rendering of public pages
  if (import.meta.server && !to.path.startsWith('/admin')) {
    return
  }

  // Enhanced route protection for admin routes
  if (import.meta.client && to.path.startsWith('/admin')) {
    const auth = localStorage.getItem('auth')

    if (!auth) {
      return navigateTo('/login?redirect=' + encodeURIComponent(to.fullPath))
    }

    try {
      const parsed = JSON.parse(auth)
      if (!parsed.token) {
        localStorage.removeItem('auth')
        return navigateTo('/login?redirect=' + encodeURIComponent(to.fullPath))
      }

      // Check token expiration if available
      if (parsed.expiresAt && new Date() > new Date(parsed.expiresAt)) {
        localStorage.removeItem('auth')
        return navigateTo('/login?redirect=' + encodeURIComponent(to.fullPath))
      }

      // Validate token format (basic JWT check)
      if (parsed.token && !isValidJWT(parsed.token)) {
        localStorage.removeItem('auth')
        return navigateTo('/login?redirect=' + encodeURIComponent(to.fullPath))
      }

    } catch (e) {
      console.error('Auth parsing error:', e)
      localStorage.removeItem('auth')
      return navigateTo('/login?redirect=' + encodeURIComponent(to.fullPath))
    }
  }

  // Enhanced redirect for authenticated users away from login page
  if (import.meta.client && to.path === '/login') {
    const auth = localStorage.getItem('auth')
    if (auth) {
      try {
        const parsed = JSON.parse(auth)
        if (parsed.token && isValidJWT(parsed.token)) {
          // Check for redirect parameter
          const redirectTo = to.query.redirect as string
          if (redirectTo && redirectTo.startsWith('/admin')) {
            return navigateTo(redirectTo)
          }
          return navigateTo('/admin/dashboard')
        }
      } catch (e) {
        localStorage.removeItem('auth')
      }
    }
  }

  // Handle root path redirect
  if (to.path === '/') {
    if (import.meta.client) {
      const auth = localStorage.getItem('auth')
      if (auth) {
        try {
          const parsed = JSON.parse(auth)
          if (parsed.token && isValidJWT(parsed.token)) {
            return navigateTo('/admin/dashboard')
          }
        } catch (e) {
          localStorage.removeItem('auth')
        }
      }
    }
    return navigateTo('/login')
  }
})

// Helper function to validate JWT format
function isValidJWT(token: string): boolean {
  if (!token || typeof token !== 'string') return false

  const parts = token.split('.')
  if (parts.length !== 3) return false

  try {
    // Try to decode the header and payload
    const header = JSON.parse(atob(parts[0]))
    const payload = JSON.parse(atob(parts[1]))

    // Basic validation
    return !!(header && payload && payload.exp)
  } catch (e) {
    return false
  }
}
