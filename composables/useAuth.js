const AUTH_COOKIE = 'auth'

export function useAuth() {
  const config = useRuntimeConfig()
  
  const cookie = useCookie(AUTH_COOKIE, {
    default: () => null,
    serialize: JSON.stringify,
    deserialize: JSON.parse,
    httpOnly: false,
    secure: config.public.auth?.secureCookies ?? (process.env.NODE_ENV === 'production'),
    sameSite: 'strict',
    domain: config.public.auth?.cookieDomain,
    maxAge: 60 * 60 * 24 * 30 // 30 days for refresh token
  })

  // Reactive user state
  const user = ref(cookie.value)

  // Track refresh attempts to prevent infinite loops
  const refreshAttempts = ref(0)
  const maxRefreshAttempts = 3
  const isRefreshing = ref(false)

  // Check if user is authenticated
  const isAuthenticated = computed(() => {
    return !!(user.value?.token)
  })

  // Set authentication data with enhanced production reliability and refresh token support
  function setAuth(authData) {
    try {
      // Validate required token
      if (!authData?.token) {
        throw new Error('Token is required for authentication')
      }

      // Enhanced token validation for production
      const tokenParts = authData.token.split('.')
      if (tokenParts.length !== 3) {
        throw new Error('Invalid JWT token format')
      }

      // Parse and validate token expiration
      let tokenExpiry = null
      try {
        const payload = JSON.parse(atob(tokenParts[1]))
        if (payload.exp) {
          tokenExpiry = new Date(payload.exp * 1000)
          // Check if token is already expired
          if (tokenExpiry <= new Date()) {
            throw new Error('Token is already expired')
          }
        }
      } catch (e) {
        console.warn('⚠️ Could not parse token expiration, using default')
      }

      // Add timestamp and expiration with refresh token support
      const enhancedAuthData = {
        ...authData,
        loginTime: authData.loginTime || new Date().toISOString(),
        // Use server expiration or default to reasonable time (2-4 hours for access token)
        expiresAt: authData.expiresAt || getTokenExpiration(authData.token, false),
        // Store refresh token if provided
        refreshToken: authData.refreshToken || authData.refresh_token,
        // Add production-specific metadata
        environment: process.env.NODE_ENV || 'development',
        userAgent: process.client ? navigator.userAgent : 'server',
        timestamp: Date.now(),
        // Reset refresh attempts on successful auth
        refreshAttempts: 0
      }

      // Store in all available storage mechanisms with error handling
      if (process.client) {
        // First, clear any existing auth data
        localStorage.removeItem('auth')
        sessionStorage.removeItem('auth')
        cookie.value = null
        user.value = null

        // Then set new auth data in all storages with validation
        const authString = JSON.stringify(enhancedAuthData)
        
        try {
          localStorage.setItem('auth', authString)
          
          // Verify localStorage write was successful
          const verification = localStorage.getItem('auth')
          if (!verification) {
            throw new Error('localStorage write verification failed')
          }
        } catch (e) {
          console.warn('⚠️ localStorage unavailable, using alternatives:', e.message)
        }

        try {
          sessionStorage.setItem('auth', authString)
        } catch (e) {
          console.warn('⚠️ sessionStorage unavailable:', e.message)
        }

        // Set cookie and reactive state
        cookie.value = enhancedAuthData
        user.value = enhancedAuthData

        // Final verification
        if (!user.value?.token) {
          throw new Error('Failed to set authentication state')
        }

        console.log('✅ Authentication set successfully', {
          hasToken: !!enhancedAuthData.token,
          expiresAt: enhancedAuthData.expiresAt,
          environment: enhancedAuthData.environment,
          sessionDuration: '24 hours',
          nextCheck: 'in 30 minutes'
        })
      }
        
    } catch (e) {
      console.error('❌ Failed to set auth data:', e)
      clearAuth()
      throw e
    }
  }

  // Clear authentication data
  function clearAuth() {
    
    // Clear reactive state
    cookie.value = null
    user.value = null

    // Clear all storage locations
    if (process.client) {
      try {
        localStorage.removeItem('auth')
        sessionStorage.removeItem('auth')
        document.cookie = `${AUTH_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
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
      let authData = null

      // Try getting from localStorage first (most reliable)
      const stored = localStorage.getItem('auth')
      if (stored) {
        try {
          authData = JSON.parse(stored)
          // Immediately set in all storages to ensure consistency
          if (authData?.token) {
            localStorage.setItem('auth', stored)
            sessionStorage.setItem('auth', stored)
            cookie.value = authData
            user.value = authData

            return
          }
        } catch (e) {
          console.error('❌ Failed to parse localStorage auth data:', e)
        }
      }

      // Try cookie as backup
      if (!authData?.token && cookie.value?.token) {
        authData = cookie.value
      }

      // Finally try sessionStorage
      if (!authData?.token) {
        const sessionStored = sessionStorage.getItem('auth')
        if (sessionStored) {
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
            clearAuth()
            return
          }

          user.value = authData
          cookie.value = authData
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

  // Check if token is expired with enhanced production reliability
  function isTokenExpired() {
    if (!user.value?.token) return true
    
    const currentTime = new Date()
    
    // Primary check: Use stored expiresAt if available
    if (user.value.expiresAt) {
      const expiry = new Date(user.value.expiresAt)
      const isExpired = currentTime >= expiry
      
      if (isExpired) {
        console.warn('⚠️ Token expired (stored expiry):', {
          now: currentTime.toISOString(),
          expiry: expiry.toISOString(),
          expired: isExpired
        })
        // Auto-cleanup expired token
        clearAuth()
        return true
      }
      
      return false
    }
    
    // Fallback: Parse JWT token directly for expiration
    try {
      const token = user.value.token
      const parts = token.split('.')
      if (parts.length !== 3) {
        console.warn('⚠️ Invalid JWT format, considering expired')
        clearAuth()
        return true
      }
      
      const payload = JSON.parse(atob(parts[1]))
      if (payload.exp) {
        const now = Math.floor(Date.now() / 1000)
        const isExpired = now >= payload.exp
        
        if (isExpired) {
          console.warn('⚠️ JWT token expired (payload check):', {
            now: now,
            exp: payload.exp,
            expired: isExpired,
            timeUntilExpiry: payload.exp - now
          })
          // Auto-cleanup expired token
          clearAuth()
          return true
        }
        
        // If expiry is very soon (less than 5 minutes), consider refreshing
        const timeUntilExpiry = payload.exp - now
        if (timeUntilExpiry < 300) { // 5 minutes
          console.warn('⚠️ Token expires soon:', {
            secondsUntilExpiry: timeUntilExpiry,
            shouldRefresh: timeUntilExpiry < 300
          })
        }
        
        return false
      }
    } catch (e) {
      console.error('❌ Failed to parse JWT token for expiration check:', e)
      clearAuth()
      return true
    }
    
    // If no expiration info found, consider token suspicious
    console.warn('⚠️ No expiration info found in token, considering expired')
    return true
  }

  // Get time until token expires with enhanced accuracy
  function getTimeUntilExpiry() {
    if (!user.value?.expiresAt) {
      // Try to get from JWT token directly
      if (user.value?.token) {
        try {
          const parts = user.value.token.split('.')
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]))
            if (payload.exp) {
              const expiryTime = new Date(payload.exp * 1000)
              const now = new Date()
              return Math.max(0, expiryTime.getTime() - now.getTime())
            }
          }
        } catch (e) {
          console.error('Failed to parse token for expiry calculation:', e)
        }
      }
      return null
    }
    
    const expiryTime = new Date(user.value.expiresAt)
    const now = new Date()
    return Math.max(0, expiryTime.getTime() - now.getTime())
  }

  // Refresh access token using refresh token
  async function refreshToken() {
    if (isRefreshing.value) {
      console.log('🔄 Refresh already in progress, waiting...')
      return false
    }

    if (refreshAttempts.value >= maxRefreshAttempts) {
      console.error('❌ Max refresh attempts reached, forcing logout')
      clearAuth()
      return false
    }

    const currentRefreshToken = user.value?.refreshToken
    if (!currentRefreshToken) {
      console.warn('⚠️ No refresh token available')
      clearAuth()
      return false
    }

    isRefreshing.value = true
    refreshAttempts.value++

    try {
      console.log('🔄 Attempting to refresh token...', {
        attempt: refreshAttempts.value,
        maxAttempts: maxRefreshAttempts
      })

      // Import the refresh API function
      const { refreshToken: refreshTokenAPI } = await import('~/composables/api.js')
      
      const result = await refreshTokenAPI(currentRefreshToken)

      if (result.success && result.data?.access_token) {
        const { access_token, refresh_token, expires_in, user: userData } = result.data
        const newRefreshToken = refresh_token || currentRefreshToken

        // Update auth data with new tokens
        const updatedAuthData = {
          ...user.value,
          token: access_token,
          refreshToken: newRefreshToken,
          loginTime: user.value.loginTime, // Keep original login time
          expiresAt: getTokenExpiration(access_token, false),
          timestamp: Date.now(),
          refreshAttempts: 0 // Reset on successful refresh
        }

        setAuth(updatedAuthData)
        
        console.log('✅ Token refreshed successfully')
        return true
      } else {
        throw new Error(`Token refresh failed: ${result.error || 'Invalid response format'}`)
      }

    } catch (error) {
      console.error('❌ Token refresh failed:', error)
      
      // If refresh fails and we've exhausted attempts, clear auth
      if (refreshAttempts.value >= maxRefreshAttempts) {
        console.error('❌ Max refresh attempts exhausted, clearing auth')
        clearAuth()
        
        // Redirect to login in production
        if (process.client) {
          window.location.href = '/login?session_expired=true&reason=refresh_failed'
        }
      }
      
      return false
    } finally {
      isRefreshing.value = false
    }
  }

  // Check if token needs refresh (within 10 minutes of expiry)
  function shouldRefreshToken() {
    const timeUntilExpiry = getTimeUntilExpiry()
    if (!timeUntilExpiry) return false
    
    // Refresh if token expires in less than 10 minutes (600000 ms)
    return timeUntilExpiry < 600000
  }

  // Auto-refresh token if needed
  async function ensureValidToken() {
    if (isTokenExpired()) {
      console.log('🔄 Token expired, attempting refresh...')
      return await refreshToken()
    }
    
    if (shouldRefreshToken()) {
      console.log('🔄 Token expires soon, refreshing preemptively...')
      return await refreshToken()
    }
    
    return true
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
    refreshToken,
    shouldRefreshToken,
    ensureValidToken,
    isRefreshing: readonly(isRefreshing)
  }
}

// Helper function to extract expiration from JWT token
function getTokenExpiration(token, force24Hours = false) {
  if (!token) return null

  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(atob(parts[1]))
    
    // If force24Hours is true (for special cases), ignore server expiration
    if (force24Hours) {
      const twentyFourHoursFromNow = new Date()
      twentyFourHoursFromNow.setHours(twentyFourHoursFromNow.getHours() + 24)
      console.log('🔒 Forcing 24-hour token expiration:', twentyFourHoursFromNow.toISOString())
      return twentyFourHoursFromNow.toISOString()
    }
    
    // Use server expiration if available
    if (payload.exp) {
      const serverExpiry = new Date(payload.exp * 1000)
      console.log('🔒 Using server token expiration:', serverExpiry.toISOString())
      return serverExpiry.toISOString()
    }
  } catch (e) {
    console.error('Failed to parse token expiration:', e)
  }

  // Default to 2 hours if no expiration found (reasonable for access tokens)
  const defaultExpiry = new Date()
  defaultExpiry.setHours(defaultExpiry.getHours() + 2)
  console.log('🔒 Using default 2-hour expiration:', defaultExpiry.toISOString())
  return defaultExpiry.toISOString()
}
