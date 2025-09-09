// ~/composables/useAuth.js
const AUTH_COOKIE = 'auth'

export function useAuth() {
  // Global reactive state (persists across components)
  const state = useState(AUTH_COOKIE, () => null)

  const cookie = useCookie(AUTH_COOKIE, {
    default: () => null,
    httpOnly: false,
    secure: process.dev ? false : true,
    sameSite: 'strict',
    path: '/'
  })

  // Derived helpers
  const user = computed(() => state.value?.user || null)
  const isAuthenticated = computed(() => Boolean(state.value?.access_token))

  function setAuth(authData) {
    try {
      if (!authData?.access_token) {
        throw new Error('Access token is required for authentication')
      }

      const expiresAt =
        authData.expiresAt || getTokenExpirationSafe(authData.access_token)

      const enhanced = {
        ...authData,
        loginTime: authData.loginTime || new Date().toISOString(),
        expiresAt
      }

      state.value = enhanced

      if (process.client) {
        const json = JSON.stringify(enhanced)
        localStorage.setItem(AUTH_COOKIE, json)
        sessionStorage.setItem(AUTH_COOKIE, json)
        cookie.value = enhanced


      }
    } catch (e) {
      console.error('❌ Failed to set auth data:', e)
      clearAuth()
      throw e
    }
  }

  function clearAuth() {
    state.value = null
    cookie.value = null

    if (process.client) {
      try {
        localStorage.removeItem(AUTH_COOKIE)
        sessionStorage.removeItem(AUTH_COOKIE)
        document.cookie = `${AUTH_COOKIE}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
      } catch (e) {
        console.error('❌ Error clearing auth data:', e)
      }
    }
  }

  function getToken() {
    return state.value?.access_token || null
  }

  function getRefreshToken() {
    return state.value?.refresh_token || null
  }

  function getUser() {
    return state.value?.user || null
  }

  function initAuth() {
    if (!process.client) return
    let auth = null

    const ls = localStorage.getItem(AUTH_COOKIE)
    if (ls) {
      try {
        auth = JSON.parse(ls)
      } catch {}
    }

    if (!auth?.access_token && cookie.value?.access_token) {
      auth = cookie.value
    }

    if (!auth?.access_token) {
      const ss = sessionStorage.getItem(AUTH_COOKIE)
      if (ss) {
        try {
          auth = JSON.parse(ss)
          console.log('📍 Found auth in sessionStorage')
        } catch {}
      }
    }

    if (auth?.access_token) {
      const expiresAt =
        auth.expiresAt || getTokenExpirationSafe(auth.access_token)
      if (expiresAt && new Date() > new Date(expiresAt)) {
        console.warn('⚠️ Token expired; clearing')
        clearAuth()
        return
      }

      state.value = { ...auth, expiresAt }
      localStorage.setItem(AUTH_COOKIE, JSON.stringify(state.value))
      sessionStorage.setItem(AUTH_COOKIE, JSON.stringify(state.value))
      cookie.value = state.value
    } else {
      console.log('ℹ️ No valid auth found; clearing')
      clearAuth()
    }
  }

  function isTokenExpired() {
    if (!state.value?.access_token) return true
    if (state.value.expiresAt) {
      return new Date() >= new Date(state.value.expiresAt)
    }
    if (!process.client) return true
    try {
      const payload = parseJwt(state.value.access_token)
      if (payload?.exp) {
        const now = Math.floor(Date.now() / 1000)
        return now >= payload.exp
      }
    } catch (e) {
      console.error('❌ Expiry parse error:', e)
    }
    return true
  }

  function getTimeUntilExpiry() {
    if (!state.value?.expiresAt) return null
    const now = Date.now()
    const exp = new Date(state.value.expiresAt).getTime()
    return Math.max(0, exp - now)
  }

  function shouldRefreshToken() {
    const ms = getTimeUntilExpiry()
    return ms !== null && ms < 5 * 60 * 1000
  }

  async function refreshToken() {
    try {
      console.log('🔄 Starting token refresh...')
      
      const currentRefreshToken = getRefreshToken()
      if (!currentRefreshToken) {
        console.warn('⚠️ No refresh token available')
        return false
      }

      // Use the dedicated refresh token API function
      const { refreshAccessToken } = await import('@/composables/api')
      const result = await refreshAccessToken(currentRefreshToken)

      if (!result.success || !result.data?.tokens?.access_token) {
        throw new Error('Invalid refresh response')
      }

      const tokens = result.data.tokens
      const expiresIn = tokens.expires_in || 518400 // Default to 6 days if not provided
      const expiresAt = new Date(Date.now() + (expiresIn * 1000)).toISOString()

      // Update auth state with new tokens, preserving existing user data
      const refreshedAuthData = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        user: state.value?.user, // Preserve existing user data
        loginTime: state.value?.loginTime || new Date().toISOString(),
        expiresAt: expiresAt
      }

      setAuth(refreshedAuthData)
      console.log('✅ Token refreshed successfully', {
        newTokenLength: tokens.access_token?.length,
        expiresAt: expiresAt
      })
      
      return true

    } catch (error) {
      console.error('❌ Token refresh failed:', error)
      
      // Handle specific error cases
      if (error.message?.includes('expired') || error.message?.includes('invalid')) {
        console.warn('🔒 Refresh token expired or invalid, clearing auth')
        clearAuth()
        if (process.client) {
          window.location.href = '/login?session_expired=true&reason=refresh_token_expired'
        }
      } else if (error.message?.includes('Too many')) {
        console.warn('⚠️ Too many refresh attempts, temporary cooldown')
        // Don't clear auth immediately for rate limiting
      } else {
        console.error('❌ Unexpected refresh error:', error.message)
      }
      
      return false
    }
  }

  function logout() {
    clearAuth()
    if (process.client) {
      return navigateTo('/login')
    }
  }

  return {
    // state
    user,
    isAuthenticated,

    // actions
    setAuth,
    clearAuth,
    initAuth,
    refreshToken,
    logout,

    // getters
    getToken,
    getRefreshToken,
    getUser,
    isTokenExpired,
    getTimeUntilExpiry,
    shouldRefreshToken
  }
}

/* -------------------- helpers -------------------- */
function getTokenExpirationSafe(token) {
  if (!process.client) {
    const d = new Date()
    d.setHours(d.getHours() + 24)
    return d.toISOString()
  }
  try {
    const payload = parseJwt(token)
    if (payload?.exp) return new Date(payload.exp * 1000).toISOString()
  } catch {}
  const d = new Date()
  d.setHours(d.getHours() + 24)
  return d.toISOString()
}

function parseJwt(jwt) {
  const parts = String(jwt).split('.')
  if (parts.length !== 3) throw new Error('Invalid JWT format')
  const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
  const json = decodeURIComponent(
    atob(b64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  )
  return JSON.parse(json)
}
