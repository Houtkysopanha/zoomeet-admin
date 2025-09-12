// ~/composables/useAuth.js
const AUTH_COOKIE = 'auth'

export function useAuth() {
  const state = useState(AUTH_COOKIE, () => null)
  const cookie = useCookie(AUTH_COOKIE, { sameSite: 'strict', path: '/' })

  const user = computed(() => state.value?.user || null)
  const isAuthenticated = computed(() => Boolean(state.value?.access_token))

  function setAuth(authData) {
    if (!authData?.access_token) throw new Error('Missing access token')

    const expiresAt = authData.expiresAt || getTokenExpirationSafe(authData.access_token)
    const enhanced = { ...authData, expiresAt, loginTime: authData.loginTime || new Date().toISOString() }

    state.value = enhanced
    if (process.client) {
      const json = JSON.stringify(enhanced)
      localStorage.setItem(AUTH_COOKIE, json)
      cookie.value = enhanced
    }
  }

  function clearAuth() {
    state.value = null
    cookie.value = null
    if (process.client) {
      localStorage.removeItem(AUTH_COOKIE)
      sessionStorage.removeItem(AUTH_COOKIE)
    }
  }

  function getToken() {
    return state.value?.access_token || null
  }
  function getRefreshToken() {
    return state.value?.refresh_token || null
  }
  function isTokenExpired() {
    if (!state.value?.expiresAt) return true
    return new Date() >= new Date(state.value.expiresAt)
  }
  function shouldRefreshToken() {
    if (!state.value?.expiresAt) return false
    return new Date(state.value.expiresAt) - Date.now() < 5 * 60 * 1000
  }

  async function refreshToken() {
    try {
      const currentRefresh = getRefreshToken()
      if (!currentRefresh) return false

      const { refreshAccessToken } = await import('@/composables/api')
      const result = await refreshAccessToken(currentRefresh)

      if (!result.success) return false

      const tokens = result.data.tokens
      const expiresIn = tokens.expires_in || 3600
      const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

      setAuth({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || currentRefresh,
        user: state.value?.user,
        expiresAt
      })

      return true
    } catch (err) {
      console.error('❌ refreshToken failed:', err)
      clearAuth()
      return false
    }
  }

  // Initialize auth from localStorage
  function initAuth() {
    if (process.client) {
      try {
        const stored = localStorage.getItem(AUTH_COOKIE)
        if (stored) {
          const authData = JSON.parse(stored)
          if (authData?.access_token && !isTokenExpiredCheck(authData)) {
            state.value = authData
            cookie.value = authData
            console.log('✅ Auth initialized from localStorage')
          } else {
            console.log('⚠️ Stored token expired, clearing auth')
            clearAuth()
          }
        }
      } catch (error) {
        console.error('❌ Failed to initialize auth:', error)
        clearAuth()
      }
    }
  }

  // Get time until token expiry in milliseconds
  function getTimeUntilExpiry() {
    if (!state.value?.expiresAt) return null
    const expiryTime = new Date(state.value.expiresAt).getTime()
    const currentTime = Date.now()
    return Math.max(0, expiryTime - currentTime)
  }

  // Helper function to check if token data is expired
  function isTokenExpiredCheck(authData) {
    if (!authData?.expiresAt) return true
    return new Date() >= new Date(authData.expiresAt)
  }

  return { 
    user, 
    isAuthenticated, 
    setAuth, 
    clearAuth, 
    getToken, 
    getRefreshToken, 
    refreshToken, 
    isTokenExpired, 
    shouldRefreshToken,
    initAuth,           // ← Add this
    getTimeUntilExpiry  // ← Add this
  }
}

// helpers
function getTokenExpirationSafe(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.exp) return new Date(payload.exp * 1000).toISOString()
  } catch {}
  return new Date(Date.now() + 3600 * 1000).toISOString()
}
