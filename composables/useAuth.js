
const AUTH_COOKIE = 'auth'

export function useAuth() {
  const cookie = useCookie(AUTH_COOKIE, {
    default: () => null,
    serialize: JSON.stringify,
    deserialize: JSON.parse,
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production' && !process.dev,
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
        // Validate required token
        if (!authData?.token) {
          throw new Error('Token is required for authentication')
        }

        // Add timestamp and expiration if not present
        const enhancedAuthData = {
          ...authData,
          loginTime: authData.loginTime || new Date().toISOString(),
          expiresAt: authData.expiresAt || getTokenExpiration(authData.token)
        }

        // Store in all available storage mechanisms
        if (process.client) {
          // First, clear any existing auth data
          localStorage.removeItem('auth')
          sessionStorage.removeItem('auth')
          cookie.value = null
          user.value = null

          // Then set new auth data in all storages
          const authString = JSON.stringify(enhancedAuthData)
          localStorage.setItem('auth', authString)
          sessionStorage.setItem('auth', authString)
          cookie.value = enhancedAuthData
          user.value = enhancedAuthData

          // Verify storage
          const stored = localStorage.getItem('auth')
          const parsed = stored ? JSON.parse(stored) : null
          if (!parsed?.token) {
            throw new Error('Failed to verify token storage')
          }

          console.log('✅ Auth data stored successfully:', {
            token: parsed.token ? 'present' : 'missing',
            storage: 'all',
            loginTime: enhancedAuthData.loginTime
          })
        }
        
        console.log('✅ Auth data set successfully', {
          token: authData.token ? 'present' : 'missing',
          loginTime: enhancedAuthData.loginTime,
          expiresAt: enhancedAuthData.expiresAt
        })
    } catch (e) {
      console.error('❌ Failed to set auth data:', e)
      clearAuth()
      throw e
    }
  }

  // Clear authentication data
  function clearAuth() {
    console.log('🗑️ Clearing auth data...')
    
    // Clear reactive state
    cookie.value = null
    user.value = null

    // Clear all storage locations
    if (process.client) {
      try {
        localStorage.removeItem('auth')
        sessionStorage.removeItem('auth')
        document.cookie = `${AUTH_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
        console.log('✅ Auth data cleared from all storage locations')
      } catch (e) {
        console.error('❌ Error clearing auth data:', e)
      }
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

  // Initialize auth state from storage
  function initAuth() {
    if (process.client) {
      console.log('🔄 Initializing auth state...')
      let authData = null

      // Try getting from localStorage first (most reliable)
      const stored = localStorage.getItem('auth')
      if (stored) {
        console.log('📍 Found auth data in localStorage')
        try {
          authData = JSON.parse(stored)
          // Immediately set in all storages to ensure consistency
          if (authData?.token) {
            localStorage.setItem('auth', stored)
            sessionStorage.setItem('auth', stored)
            cookie.value = authData
            user.value = authData
            console.log('✅ Auth data restored and synchronized')
            return
          }
        } catch (e) {
          console.error('❌ Failed to parse localStorage auth data:', e)
        }
      }

      // Try cookie as backup
      if (!authData?.token && cookie.value?.token) {
        console.log('📍 Found auth data in cookie')
        authData = cookie.value
      }

      // Finally try sessionStorage
      if (!authData?.token) {
        const sessionStored = sessionStorage.getItem('auth')
        if (sessionStored) {
          console.log('📍 Found auth data in sessionStorage')
          try {
            authData = JSON.parse(sessionStored)
          } catch (e) {
            console.error('❌ Failed to parse sessionStorage auth data:', e)
          }
        }
      }

      // If we found valid auth data, set it
      if (authData?.token) {
        try {
          // Check if token is expired
          const expiresAt = authData.expiresAt || getTokenExpiration(authData.token)
          if (expiresAt && new Date() > new Date(expiresAt)) {
            console.warn('⚠️ Stored token is expired')
            clearAuth()
            return
          }

          user.value = authData
          cookie.value = authData
          console.log('✅ Auth state initialized successfully')
        } catch (e) {
          console.error('❌ Failed to initialize auth state:', e)
          clearAuth()
        }
      } else {
        console.log('ℹ️ No valid auth data found during initialization')
        clearAuth()
      }
    }
  }

  

  // Check if token is expired
  function isTokenExpired() {
    if (!user.value?.token) return true
    
    // If we have expiresAt, use it
    if (user.value.expiresAt) {
      const now = new Date()
      const expiry = new Date(user.value.expiresAt)
      const isExpired = now >= expiry
      
      if (isExpired) {
        console.warn('⚠️ Token expired:', {
          now: now.toISOString(),
          expiry: expiry.toISOString(),
          expired: isExpired
        })
      }
      
      return isExpired
    }
    
    // Fallback: parse JWT token directly
    try {
      const token = user.value.token
      const parts = token.split('.')
      if (parts.length !== 3) return true
      
      const payload = JSON.parse(atob(parts[1]))
      if (payload.exp) {
        const now = Math.floor(Date.now() / 1000)
        const isExpired = now >= payload.exp
        
        if (isExpired) {
          console.warn('⚠️ JWT token expired:', {
            now: now,
            exp: payload.exp,
            expired: isExpired
          })
        }
        
        return isExpired
      }
    } catch (e) {
      console.error('❌ Failed to parse JWT token for expiration check:', e)
      return true
    }
    
    return false
  }

  // Get time until token expires
  function getTimeUntilExpiry() {
    if (!user.value?.expiresAt) return null
    const expiryTime = new Date(user.value.expiresAt)
    const now = new Date()
    return Math.max(0, expiryTime.getTime() - now.getTime())
  }

  // Check if token should be refreshed (less than 5 minutes remaining)
  function shouldRefreshToken() {
    const timeUntilExpiry = getTimeUntilExpiry()
    return timeUntilExpiry !== null && timeUntilExpiry < 5 * 60 * 1000 // 5 minutes in milliseconds
  }

  // Refresh token (placeholder for actual refresh logic)
  async function refreshToken() {
    try {
      // For now, this is a placeholder
      // In a real app, you would call your refresh token endpoint here
      console.log('🔄 Token refresh not implemented yet')
      return false
    } catch (error) {
      console.error('❌ Failed to refresh token:', error)
      return false
    }
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
    getTimeUntilExpiry,
    shouldRefreshToken,
    refreshToken
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