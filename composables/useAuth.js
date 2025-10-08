// ~/composables/useAuth.js
const AUTH_STORAGE_KEY = 'zoomeet_auth'
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000 // 5 minutes before expiry

export function useAuth() {
  const state = useState('auth', () => null)
  const cookie = useCookie(AUTH_STORAGE_KEY, { 
    sameSite: 'strict', 
    path: '/',
    maxAge: 60 * 60 * 24 * 10, // 10 days to match refresh token
    secure: process.env.NODE_ENV === 'production'
  })

  const user = computed(() => state.value?.user || null)
  const isAuthenticated = computed(() => Boolean(state.value?.access_token))
  const isRefreshing = ref(false)

  function setAuth(authData) {
    if (!authData?.access_token) {
      throw new Error('Missing access token')
    }

    // Calculate precise expiration times
    const now = Date.now()
    
    // Access token expiration (from server response)
    let accessTokenExpiresAt
    if (authData.expires_in) {
      accessTokenExpiresAt = new Date(now + (authData.expires_in * 1000)).toISOString()
    } else if (authData.expiresAt) {
      accessTokenExpiresAt = authData.expiresAt
    } else {
      accessTokenExpiresAt = getTokenExpirationFromJWT(authData.access_token)
    }

    // Refresh token expiration (from server response)
    let refreshTokenExpiresAt = null
    if (authData.refresh_expires_in) {
      refreshTokenExpiresAt = new Date(now + (authData.refresh_expires_in * 1000)).toISOString()
    } else if (authData.refreshExpiresAt) {
      refreshTokenExpiresAt = authData.refreshExpiresAt
    }

    // Extract user info from ID token if available
    let userInfo = authData.user || null
    if (!userInfo && authData.id_token) {
      userInfo = extractUserFromIdToken(authData.id_token)
    }

    const tokenData = {
      access_token: authData.access_token,
      refresh_token: authData.refresh_token,
      id_token: authData.id_token,
      token_type: authData.token_type || 'Bearer',
      expires_in: authData.expires_in,
      refresh_expires_in: authData.refresh_expires_in,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
      loginTime: authData.loginTime || new Date().toISOString(),
      user: userInfo,
      scope: authData.scope
    }

    // Update state and storage
    state.value = tokenData
    
    if (process.client) {
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(tokenData))
        cookie.value = tokenData
      } catch (error) {
        console.error('❌ Failed to save auth data:', error)
      }
    }
  }

  function clearAuth() {
    state.value = null
    cookie.value = null
    isRefreshing.value = false
    
    if (process.client) {
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY)
        sessionStorage.removeItem(AUTH_STORAGE_KEY)
      } catch (error) {
        console.error('❌ Failed to clear auth data:', error)
      }
    }
  }

  // Token getters
  const getToken = () => state.value?.access_token || null
  const getRefreshToken = () => state.value?.refresh_token || null
  const getIdToken = () => state.value?.id_token || null

  // Token expiration checks
  const isTokenExpired = () => {
    if (!state.value?.accessTokenExpiresAt) return true
    return new Date() >= new Date(state.value.accessTokenExpiresAt)
  }

  const isRefreshTokenExpired = () => {
    if (!state.value?.refreshTokenExpiresAt) return false
    return new Date() >= new Date(state.value.refreshTokenExpiresAt)
  }

  const shouldRefreshToken = () => {
    if (!state.value?.accessTokenExpiresAt) return false
    const timeUntilExpiry = new Date(state.value.accessTokenExpiresAt).getTime() - Date.now()
    const shouldRefresh = timeUntilExpiry <= TOKEN_REFRESH_THRESHOLD
    
    // Debug logging
    if (process.client && window.location.pathname.startsWith('/admin')) {
    }
    
    return shouldRefresh
  }

  // Enhanced token refresh with retry logic
  async function refreshToken() {
    if (isRefreshing.value) {
      // Wait for ongoing refresh to complete
      while (isRefreshing.value) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      return !isTokenExpired()
    }

    try {
      isRefreshing.value = true
      
      const currentRefreshToken = getRefreshToken()
      if (!currentRefreshToken) {
        console.warn('⚠️ No refresh token available')
        return false
      }

      if (isRefreshTokenExpired()) {
        console.warn('⚠️ Refresh token has expired')
        clearAuth()
        return false
      }
      
      const { refreshAccessToken } = await import('@/composables/api')
      const result = await refreshAccessToken(currentRefreshToken)
      
      if (!result.success || !result.data?.tokens) {
        console.error('❌ Token refresh failed:', result)
        return false
      }

      const newTokens = result.data.tokens
      
      // Preserve existing data and update with new tokens
      const updatedAuth = {
        ...state.value,
        access_token: newTokens.access_token,
        refresh_token: newTokens.refresh_token || currentRefreshToken,
        expires_in: newTokens.expires_in,
        refresh_expires_in: newTokens.refresh_expires_in,
        id_token: newTokens.id_token || state.value?.id_token,
        token_type: newTokens.token_type || 'Bearer'
      }

      setAuth(updatedAuth)
      return true

    } catch (error) {
      console.error('❌ Token refresh error:', error)
      // Don't clear auth on network errors, only on auth failures
      if (error.status === 401 || error.status === 403) {
        clearAuth()
      }
      return false
    } finally {
      isRefreshing.value = false
    }
  }

  // Initialize auth from storage
  function initAuth() {
    if (!process.client) return

    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY)
      if (!stored) return

      const authData = JSON.parse(stored)
      if (!authData?.access_token) return

      // Check if refresh token is expired
      if (authData.refreshTokenExpiresAt && new Date() >= new Date(authData.refreshTokenExpiresAt)) {
        console.log('⚠️ Stored refresh token expired, clearing auth')
        clearAuth()
        return
      }

      // Load stored auth data
      state.value = authData
      cookie.value = authData

      // If access token is expired but refresh token is valid, try to refresh
      if (isTokenExpired() && !isRefreshTokenExpired()) {
        console.log('⚠️ Stored access token expired, attempting refresh...')
        refreshToken()
      } 

    } catch (error) {
      console.error('❌ Failed to initialize auth:', error)
      clearAuth()
    }
  }

  // Utility functions
  const getTimeUntilExpiry = () => {
    if (!state.value?.accessTokenExpiresAt) return null
    return Math.max(0, new Date(state.value.accessTokenExpiresAt).getTime() - Date.now())
  }

  const getTimeUntilRefreshExpiry = () => {
    if (!state.value?.refreshTokenExpiresAt) return null
    return Math.max(0, new Date(state.value.refreshTokenExpiresAt).getTime() - Date.now())
  }

  const getTokenStatus = () => {
    if (!state.value?.access_token) return 'missing'
    if (isRefreshTokenExpired()) return 'refresh_expired'
    if (isTokenExpired()) return 'expired'
    if (shouldRefreshToken()) return 'needs_refresh'
    return 'valid'
  }

  return {
    // State
    user,
    isAuthenticated,
    isRefreshing: readonly(isRefreshing),
    
    // Core methods
    setAuth,
    clearAuth,
    refreshToken,
    initAuth,
    
    // Token getters
    getToken,
    getRefreshToken,
    getIdToken,
    
    // Status checks
    isTokenExpired,
    isRefreshTokenExpired,
    shouldRefreshToken,
    getTokenStatus,
    
    // Utilities
    getTimeUntilExpiry,
    getTimeUntilRefreshExpiry
  }
}

// Helper function to extract expiration from JWT token
function getTokenExpirationFromJWT(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.exp) {
      return new Date(payload.exp * 1000).toISOString()
    }
  } catch (error) {
    console.warn('⚠️ Could not parse JWT expiration:', error)
  }
  
  // Fallback: assume token expires in 20 minutes (typical for access tokens)
  return new Date(Date.now() + 20 * 60 * 1000).toISOString()
}

// Helper function to extract user info from ID token
function extractUserFromIdToken(idToken) {
  try {
    const payload = JSON.parse(atob(idToken.split('.')[1]))
    return {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      phone: payload.preferred_username,
      firstName: payload.given_name,
      lastName: payload.family_name,
      emailVerified: payload.email_verified,
      loginType: payload.login_type
    }
  } catch (error) {
    console.warn('⚠️ Could not parse ID token:', error)
    return null
  }
}
