// Enhanced token monitoring and auto-refresh system
export function useTokenManager() {
  let tokenCheckInterval = null
  let refreshTimeoutId = null
  let refreshAttempts = 0
  const MAX_REFRESH_ATTEMPTS = 3
  const CHECK_INTERVAL = 30 * 1000 // Check every 30 seconds for more aggressive monitoring
  const REFRESH_BUFFER = 5 * 60 * 1000 // Refresh 5 minutes before expiry
  
  const isMonitoring = ref(false)
  const lastRefreshAttempt = ref(null)
  
  // Start intelligent token monitoring
  function startTokenMonitoring() {
    if (!process.client || tokenCheckInterval) return
    
    isMonitoring.value = true
    
    // Initial check after 1 second
    setTimeout(() => checkAndRefreshToken(), 1000)
    
    // Set up periodic checking
    tokenCheckInterval = setInterval(() => {
      checkAndRefreshToken()
    }, CHECK_INTERVAL)
    
    // Listen for visibility changes to check token when user returns
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Listen for focus events to check token when window regains focus
    window.addEventListener('focus', handleWindowFocus)
  }
  
  // Stop token monitoring
  function stopTokenMonitoring() {
    if (tokenCheckInterval) {
      clearInterval(tokenCheckInterval)
      tokenCheckInterval = null
    }
    
    if (refreshTimeoutId) {
      clearTimeout(refreshTimeoutId)
      refreshTimeoutId = null
    }
    
    if (process.client) {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleWindowFocus)
    }
    
    isMonitoring.value = false

  }
  
  // Handle when page becomes visible
  function handleVisibilityChange() {
    if (!document.hidden && isMonitoring.value) {
      setTimeout(() => checkAndRefreshToken(), 500)
    }
  }
  
  // Handle when window regains focus
  function handleWindowFocus() {
    if (isMonitoring.value) {
      setTimeout(() => checkAndRefreshToken(), 500)
    }
  }
  
  // Intelligent token checking and refreshing
  async function checkAndRefreshToken() {
    const auth = useAuth()
    const { 
      isAuthenticated, 
      isTokenExpired, 
      isRefreshTokenExpired, 
      shouldRefreshToken,
      getTimeUntilExpiry,
      getTimeUntilRefreshExpiry,
      getTokenStatus,
      clearAuth,
      isRefreshing
    } = auth
    
    // Skip if not authenticated
    if (!isAuthenticated.value) {
      return
    }
    
    // Skip if already refreshing
    if (isRefreshing.value) {
      return
    }
    
    try {
      const tokenStatus = getTokenStatus()
      const timeUntilExpiry = getTimeUntilExpiry()
      const timeUntilRefreshExpiry = getTimeUntilRefreshExpiry()
      
      
      // Handle different token states
      switch (tokenStatus) {
        case 'refresh_expired':
          clearAuth()
          await navigateToLogin('refresh_expired')
          break
          
        case 'expired':
          await attemptTokenRefresh()
          break
          
        case 'needs_refresh':
          await attemptTokenRefresh()
          break
          
        case 'valid':
          // Schedule next refresh check based on token expiry
          scheduleNextRefreshCheck(timeUntilExpiry)
          refreshAttempts = 0 // Reset attempts on valid token
          break
          
        case 'missing':
          // No action needed for missing token
          break
      }
      
    } catch (error) {
      console.error('❌ Token check failed:', error)
    }
  }
  
  // Schedule the next refresh check based on token expiry
  function scheduleNextRefreshCheck(timeUntilExpiry) {
    if (refreshTimeoutId) {
      clearTimeout(refreshTimeoutId)
    }
    
    if (!timeUntilExpiry) return
    
    // Schedule refresh 5 minutes before expiry, but at least 1 minute from now
    const refreshIn = Math.max(60 * 1000, timeUntilExpiry - REFRESH_BUFFER)
    
    refreshTimeoutId = setTimeout(() => {
      checkAndRefreshToken()
    }, refreshIn)
    
  }
  
  // Attempt token refresh with exponential backoff
  async function attemptTokenRefresh() {
    if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
      console.error('❌ Max refresh attempts reached, forcing logout')
      const { clearAuth } = useAuth()
      clearAuth()
      await navigateToLogin('max_refresh_attempts')
      return false
    }
    
    refreshAttempts++
    lastRefreshAttempt.value = new Date().toISOString()
    
    try {
      const { refreshToken } = useAuth()
      
      
      const success = await refreshToken()
      
      if (success) {
        refreshAttempts = 0
        return true
      } else {
        console.warn(`⚠️ Token refresh attempt ${refreshAttempts} failed`)
        
        if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
          const { clearAuth } = useAuth()
          clearAuth()
          await navigateToLogin('refresh_failed')
        } else {
          // Exponential backoff for next attempt
          const backoffDelay = Math.min(1000 * Math.pow(2, refreshAttempts - 1), 30000)
          setTimeout(() => attemptTokenRefresh(), backoffDelay)
        }
        return false
      }
      
    } catch (error) {
      console.error(`❌ Token refresh attempt ${refreshAttempts} error:`, error)
      
      if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
        const { clearAuth } = useAuth()
        clearAuth()
        await navigateToLogin('refresh_error')
      }
      return false
    }
  }
  
  // Navigate to login with reason
  async function navigateToLogin(reason) {
    if (!process.client) return
    
    const router = useRouter()
    const currentPath = router.currentRoute.value.fullPath
    
    // Avoid infinite redirects
    if (currentPath !== '/login') {
      await router.push(`/login?reason=${reason}&redirect=${encodeURIComponent(currentPath)}`)
    }
  }
  
  // Get comprehensive token health information
  function getTokenHealth() {
    const auth = useAuth()
    const { 
      isAuthenticated, 
      getTokenStatus, 
      getTimeUntilExpiry, 
      getTimeUntilRefreshExpiry 
    } = auth
    
    if (!isAuthenticated.value) {
      return { 
        status: 'unauthenticated', 
        message: 'User not authenticated',
        color: 'gray'
      }
    }
    
    const tokenStatus = getTokenStatus()
    const timeUntilExpiry = getTimeUntilExpiry()
    const timeUntilRefreshExpiry = getTimeUntilRefreshExpiry()
    
    const minutes = timeUntilExpiry ? Math.floor(timeUntilExpiry / (60 * 1000)) : 0
    const refreshMinutes = timeUntilRefreshExpiry ? Math.floor(timeUntilRefreshExpiry / (60 * 1000)) : 0
    
    switch (tokenStatus) {
      case 'valid':
        if (minutes > 10) {
          return { 
            status: 'healthy', 
            message: `Token valid for ${minutes} minutes`,
            color: 'green',
            details: { accessTokenMinutes: minutes, refreshTokenMinutes: refreshMinutes }
          }
        } else {
          return { 
            status: 'warning', 
            message: `Token expires in ${minutes} minutes`,
            color: 'yellow',
            details: { accessTokenMinutes: minutes, refreshTokenMinutes: refreshMinutes }
          }
        }
        
      case 'needs_refresh':
        return { 
          status: 'needs_refresh', 
          message: `Token needs refresh (${minutes} minutes left)`,
          color: 'orange',
          details: { accessTokenMinutes: minutes, refreshTokenMinutes: refreshMinutes }
        }
        
      case 'expired':
        return { 
          status: 'expired', 
          message: 'Access token expired',
          color: 'red',
          details: { accessTokenMinutes: minutes, refreshTokenMinutes: refreshMinutes }
        }
        
      case 'refresh_expired':
        return { 
          status: 'refresh_expired', 
          message: 'Refresh token expired',
          color: 'red',
          details: { accessTokenMinutes: minutes, refreshTokenMinutes: refreshMinutes }
        }
        
      default:
        return { 
          status: 'unknown', 
          message: 'Token status unknown',
          color: 'gray'
        }
    }
  }
  
  // Auto-start monitoring when component mounts
  onMounted(() => {
    if (process.client) {
      startTokenMonitoring()
    }
  })
  
  // Auto-stop monitoring when component unmounts
  onUnmounted(() => {
    stopTokenMonitoring()
  })
  
  return {
    // Control methods
    startTokenMonitoring,
    stopTokenMonitoring,
    checkAndRefreshToken,
    
    // Status methods
    getTokenHealth,
    
    // State
    isMonitoring: readonly(isMonitoring),
    refreshAttempts: readonly(ref(refreshAttempts)),
    lastRefreshAttempt: readonly(lastRefreshAttempt)
  }
}
