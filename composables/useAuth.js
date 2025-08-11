
const AUTH_COOKIE = 'auth'

export function useAuth() {
  const cookie = useCookie(AUTH_COOKIE, {
    default: () => null,
    serialize: JSON.stringify,
    deserialize: JSON.parse,
    httpOnly: false,
    secure: true,
    sameSite: 'strict'
  })

  // Reactive user state
  const user = ref(cookie.value)

  // Check if user is authenticated
  const isAuthenticated = computed(() => {
    return !!(user.value?.token)
  })

  // Set authentication data
  function setAuth(authData) {
    try {
      // Add timestamp and expiration if not present
      const enhancedAuthData = {
        ...authData,
        loginTime: authData.loginTime || new Date().toISOString(),
        expiresAt: authData.expiresAt || getTokenExpiration(authData.token)
      }

      cookie.value = enhancedAuthData
      user.value = enhancedAuthData

      // Also set in localStorage for client-side access
      if (import.meta.client) {
        localStorage.setItem('auth', JSON.stringify(enhancedAuthData))
      }
    } catch (e) {
      console.error('Failed to set auth data:', e)
      clearAuth()
    }
  }

  // Clear authentication data
  function clearAuth() {
    cookie.value = null
    user.value = null

    // Also clear from localStorage
    if (import.meta.client) {
      localStorage.removeItem('auth')
    }
  }

  // Get current user token
  function getToken() {
    return user.value?.token || null
  }

  // Get current user info
  function getUser() {
    return user.value?.user || null
  }

  // Initialize auth state from localStorage on client-side
  function initAuth() {
    if (import.meta.client) {
      const stored = localStorage.getItem('auth')
      if (stored && !user.value) {
        try {
          const parsed = JSON.parse(stored)
          user.value = parsed
          cookie.value = parsed
        } catch (e) {
          console.error('Failed to parse stored auth data:', e)
          clearAuth()
        }
      }
    }
  }

  // Check if token is expired
  function isTokenExpired() {
    if (!user.value?.expiresAt) return false
    return new Date() > new Date(user.value.expiresAt)
  }

  // Get time until token expires
  function getTimeUntilExpiry() {
    if (!user.value?.expiresAt) return null
    const expiryTime = new Date(user.value.expiresAt)
    const now = new Date()
    return Math.max(0, expiryTime.getTime() - now.getTime())
  }

  return {
    user: readonly(user),
    isAuthenticated,
    setAuth,
    clearAuth,
    getToken,
    getUser,
    initAuth,
    isTokenExpired,
    getTimeUntilExpiry
  }
}

// Helper function to extract expiration from JWT token
function getTokenExpiration(token) {
  if (!token) return null

  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(atob(parts[1]))
    if (payload.exp) {
      return new Date(payload.exp * 1000).toISOString()
    }
  } catch (e) {
    console.error('Failed to parse token expiration:', e)
  }

  // Default to 24 hours if no expiration found
  const defaultExpiry = new Date()
  defaultExpiry.setHours(defaultExpiry.getHours() + 24)
  return defaultExpiry.toISOString()
}
