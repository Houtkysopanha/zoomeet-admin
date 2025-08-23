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
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })

  // Reactive user state
  const user = ref(cookie.value)

  // Check if user is authenticated
  const isAuthenticated = computed(() => {
    return !!(user.value?.token)
  })

  // Set authentication data with enhanced production reliability
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

      // Add timestamp and expiration with proper fallback - FORCE 24 HOUR SESSIONS
      const enhancedAuthData = {
        ...authData,
        loginTime: authData.loginTime || new Date().toISOString(),
        // FORCE 24-hour expiration regardless of what server sends
        expiresAt: authData.expiresAt || getTokenExpiration(authData.token, true), // Force 24h
        // Add production-specific metadata
        environment: process.env.NODE_ENV || 'development',
        userAgent: process.client ? navigator.userAgent : 'server',
        timestamp: Date.now()
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
function getTokenExpiration(token, force24Hours = false) {
  if (!token) return null

  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(atob(parts[1]))
    
    // If force24Hours is true, ignore server expiration and set 24 hours
    if (force24Hours) {
      const twentyFourHoursFromNow = new Date()
      twentyFourHoursFromNow.setHours(twentyFourHoursFromNow.getHours() + 24)
      console.log('🔒 Forcing 24-hour token expiration:', twentyFourHoursFromNow.toISOString())
      return twentyFourHoursFromNow.toISOString()
    }
    
    // Check server expiration but ensure minimum 24 hours
    if (payload.exp) {
      const serverExpiry = new Date(payload.exp * 1000)
      const twentyFourHoursFromNow = new Date()
      twentyFourHoursFromNow.setHours(twentyFourHoursFromNow.getHours() + 24)
      
      // Use whichever is longer: server expiry or 24 hours
      const finalExpiry = serverExpiry > twentyFourHoursFromNow ? serverExpiry : twentyFourHoursFromNow
      
      console.log('🔒 Token expiration set to:', finalExpiry.toISOString(), 
                  `(Server: ${serverExpiry.toISOString()}, 24h: ${twentyFourHoursFromNow.toISOString()})`)
      
      return finalExpiry.toISOString()
    }
  } catch (e) {
    console.error('Failed to parse token expiration:', e)
  }

  // Default to 24 hours if no expiration found
  const defaultExpiry = new Date()
  defaultExpiry.setHours(defaultExpiry.getHours() + 24)
  console.log('🔒 Using default 24-hour expiration:', defaultExpiry.toISOString())
  return defaultExpiry.toISOString()
}
