// ~/plugins/api.js
export default defineNuxtPlugin(() => {
  const { refreshToken, clearAuth, getToken } = useAuth()
  const originalFetch = $fetch

  globalThis.$fetch = async (url, options = {}) => {
    // Automatically inject token for API requests
    const token = getToken()
    if (token && !options.headers?.Authorization) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    }

    try {
      return await originalFetch(url, options)
    } catch (err) {
      if (err?.status === 401) {
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
