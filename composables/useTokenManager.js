// Token monitoring and auto-refresh system for production
export function useTokenManager() {
  let tokenCheckInterval = null
  let refreshAttempts = 0
  const MAX_REFRESH_ATTEMPTS = 3
  
  // Start token monitoring for production
  function startTokenMonitoring() {
    if (process.client && !tokenCheckInterval) {
      console.log('🔒 Starting token monitoring for production')
      
      // Check token every 5 minutes
      tokenCheckInterval = setInterval(() => {
        checkAndRefreshToken()
      }, 5 * 60 * 1000) // 5 minutes
      
      // Check immediately on start
      setTimeout(() => checkAndRefreshToken(), 1000)
    }
  }
  
  // Stop token monitoring
  function stopTokenMonitoring() {
    if (tokenCheckInterval) {
      clearInterval(tokenCheckInterval)
      tokenCheckInterval = null
      console.log('🔒 Token monitoring stopped')
    }
  }
  
  // Check token and refresh if needed
  async function checkAndRefreshToken() {
    const { isTokenExpired, getTimeUntilExpiry, clearAuth, user } = useAuth()
    
    if (!user.value?.token) {
      return
    }
    
    try {
      const timeUntilExpiry = getTimeUntilExpiry()
      
      // If token expires in less than 10 minutes, try to refresh
      if (timeUntilExpiry && timeUntilExpiry < (10 * 60 * 1000)) {
        console.log('⚠️ Token expires soon, attempting refresh', {
          timeUntilExpiry: Math.floor(timeUntilExpiry / 1000) + ' seconds',
          refreshAttempts
        })
        
        await attemptTokenRefresh()
      }
      
      // If token is already expired, clear auth
      if (isTokenExpired()) {
        console.warn('🔒 Token expired, clearing authentication')
        clearAuth()
        // Redirect to login in production
        if (process.client) {
          window.location.href = '/login?expired=true'
        }
      }
      
    } catch (error) {
      console.error('❌ Token check failed:', error)
    }
  }
  
  // Attempt to refresh token
  async function attemptTokenRefresh() {
    if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
      console.error('❌ Max refresh attempts reached, forcing logout')
      const { clearAuth } = useAuth()
      clearAuth()
      if (process.client) {
        window.location.href = '/login?session_expired=true'
      }
      return
    }
    
    refreshAttempts++
    
    try {
      // You would implement your token refresh logic here
      // For now, we'll just log and reset attempts on success
      refreshAttempts = 0
      
    } catch (error) {
      console.error('❌ Token refresh failed:', error)
      
      if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
        const { clearAuth } = useAuth()
        clearAuth()
        if (process.client) {
          window.location.href = '/login?refresh_failed=true'
        }
      }
    }
  }
  
  // Get token health status
  function getTokenHealth() {
    const { user, isTokenExpired, getTimeUntilExpiry } = useAuth()
    
    if (!user.value?.token) {
      return { status: 'missing', message: 'No token found' }
    }
    
    if (isTokenExpired()) {
      return { status: 'expired', message: 'Token has expired' }
    }
    
    const timeUntilExpiry = getTimeUntilExpiry()
    if (timeUntilExpiry) {
      const minutes = Math.floor(timeUntilExpiry / (60 * 1000))
      
      if (minutes < 5) {
        return { status: 'critical', message: `Token expires in ${minutes} minutes` }
      } else if (minutes < 30) {
        return { status: 'warning', message: `Token expires in ${minutes} minutes` }
      } else {
        return { status: 'healthy', message: `Token valid for ${minutes} minutes` }
      }
    }
    
    return { status: 'unknown', message: 'Cannot determine token expiry' }
  }
  
  // Initialize monitoring on mount
  onMounted(() => {
    if (process.client) {
      startTokenMonitoring()
    }
  })
  
  // Cleanup on unmount
  onUnmounted(() => {
    stopTokenMonitoring()
  })
  
  return {
    startTokenMonitoring,
    stopTokenMonitoring,
    checkAndRefreshToken,
    getTokenHealth,
    refreshAttempts: readonly(ref(refreshAttempts))
  }
}
