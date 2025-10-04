// ~/plugins/api.js
export default defineNuxtPlugin(() => {
  const { refreshToken, clearAuth, getToken } = useAuth()
  const originalFetch = $fetch

  globalThis.$fetch = async (url, options = {}) => {
    // Routes that should skip automatic token injection
    const skipTokenRoutes = ['/register']
    const shouldSkipToken = skipTokenRoutes.some(route => url.includes(route))
    
    // Check if this request explicitly wants to skip auth
    const skipAuth = options.skipAuth === true
    
    // Automatically inject token for API requests (unless explicitly skipped)
    const token = getToken()
    if (token && !options.headers?.Authorization && !shouldSkipToken && !skipAuth) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    }

    // Remove skipAuth from options to avoid sending it to server
    if (options.skipAuth) {
      delete options.skipAuth
    }

    try {
      return await originalFetch(url, options)
    } catch (err) {
      if (err?.status === 401 && !shouldSkipToken && !skipAuth) {
        console.log('🔄 Got 401, attempting token refresh...')
        const refreshed = await refreshToken()
        if (refreshed) {
          // Retry with new token
          const newToken = getToken()
          if (newToken) {
            options.headers = {
              ...options.headers,
              'Authorization': `Bearer ${newToken}`
            }
          }
          return await originalFetch(url, options) // retry once
        } else {
          console.log('❌ Token refresh failed, redirecting to login')
          clearAuth()
          return navigateTo('/login?session_expired=true')
        }
      }
      throw err
    }
  }
})
