// ~/composables/useAuth.js
const AUTH_COOKIE = 'auth'

export function useAuth() {
  const state = useState(AUTH_COOKIE, () => null)
  const cookie = useCookie(AUTH_COOKIE, { sameSite: 'strict', path: '/' })

  const user = computed(() => state.value?.user || null)
  const isAuthenticated = computed(() => Boolean(state.value?.access_token))

  function setAuth(authData) {
    if (!authData?.access_token) throw new Error('Missing access token')

    // Expiration handling
    let expiresAt
    if (authData.expires_in) {
      expiresAt = new Date(Date.now() + authData.expires_in * 1000).toISOString()
    } else if (authData.expiresAt) {
      expiresAt = authData.expiresAt
    } else {
      expiresAt = getTokenExpirationSafe(authData.access_token)
    }

    // Refresh expiration
    let refreshExpiresAt = null
    if (authData.refresh_expires_in) {
      refreshExpiresAt = new Date(Date.now() + authData.refresh_expires_in * 1000).toISOString()
    }

    const enhanced = { 
      ...authData, 
      expiresAt, 
      refreshExpiresAt,
      loginTime: authData.loginTime || new Date().toISOString() 
    }

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

  const getToken = () => state.value?.access_token || null
  const getRefreshToken = () => state.value?.refresh_token || null

  const isTokenExpired = () =>
    !state.value?.expiresAt || new Date() >= new Date(state.value.expiresAt)

  const isRefreshTokenExpired = () =>
    !state.value?.refreshExpiresAt || new Date() >= new Date(state.value.refreshExpiresAt)

  const shouldRefreshToken = () =>
    state.value?.expiresAt &&
    new Date(state.value.expiresAt).getTime() - Date.now() < 5 * 60 * 1000

  async function refreshToken() {
    try {
      const currentRefresh = getRefreshToken()
      if (!currentRefresh) return false
      if (isRefreshTokenExpired()) {
        clearAuth()
        return false
      }

      const { refreshAccessToken } = await import('@/composables/api')
      const result = await refreshAccessToken(currentRefresh)
      if (!result.success) return false

      const tokens = result.data.tokens

      setAuth({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || currentRefresh,
        expires_in: tokens.expires_in,
        refresh_expires_in: tokens.refresh_expires_in,
        user: state.value?.user
      })

      return true
    } catch (err) {
      console.error('❌ refreshToken failed:', err)
      clearAuth()
      return false
    }
  }

  // Auto-load on client
  function initAuth() {
    if (!process.client) return
    try {
      const stored = localStorage.getItem(AUTH_COOKIE)
      if (stored) {
        const authData = JSON.parse(stored)
        if (authData?.access_token) {
          if (new Date() >= new Date(authData.expiresAt)) {
            // Try to refresh immediately if expired
            console.log('⚠️ Stored token expired, attempting refresh...')
            state.value = authData
            refreshToken()
          } else {
            state.value = authData
            cookie.value = authData
          }
        }
      }
    } catch (error) {
      console.error('❌ Failed to initialize auth:', error)
      clearAuth()
    }
  }

  const getTimeUntilExpiry = () =>
    state.value?.expiresAt
      ? Math.max(0, new Date(state.value.expiresAt).getTime() - Date.now())
      : null

  return { 
    user, 
    isAuthenticated, 
    setAuth, 
    clearAuth, 
    getToken, 
    getRefreshToken, 
    refreshToken, 
    isTokenExpired, 
    isRefreshTokenExpired,
    shouldRefreshToken,
    initAuth,           
    getTimeUntilExpiry  
  }
}

// Safe JWT expiry parser
function getTokenExpirationSafe(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.exp) return new Date(payload.exp * 1000).toISOString()
  } catch {}
  console.warn('⚠️ Could not parse JWT expiration, using 24-hour fallback')
  return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
}
