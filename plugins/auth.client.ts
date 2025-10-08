export default defineNuxtPlugin(async (nuxtApp) => {
  
  try {
    // Import useAuth from the composables
    const { initAuth, shouldRefreshToken, refreshToken, clearAuth, isTokenExpired, getToken } = useAuth()
    
    // Initialize auth state
    initAuth();
    
    // Verify auth state
    const token = getToken(); // Now properly imported
    if (token) {
      
      // Start token monitoring for production
      if (process.client) {
        startTokenMonitoring();
      }
    } else {
      console.log('ℹ️ No token found during initialization');
    }

  } catch (error) {
    console.error('❌ Auth plugin initialization error:', error);
    // Don't throw, just log - we don't want to break the app if auth init fails
  }
});

function startTokenMonitoring() {
  let tokenCheckInterval: NodeJS.Timeout | null = null
  let userWarned = false

  const checkIntervalMs =
    process.env.NODE_ENV === 'production' ? 60 * 60 * 1000 : 10 * 60 * 1000 // Reduced dev interval from 30min to 10min

  tokenCheckInterval = setInterval(async () => {
    const { getTimeUntilExpiry, isTokenExpired, shouldRefreshToken, refreshToken, clearAuth } = useAuth()

    try {
      // Case 1: Token already expired → try refresh immediately
      if (isTokenExpired()) {
        const refreshed = await refreshToken()
        if (!refreshed) {
          clearAuth()
          if (tokenCheckInterval) clearInterval(tokenCheckInterval)
          navigateTo('/login?session_expired=true&reason=token_expired')
        }
        return
      }

      // Case 2: Token close to expiry → refresh proactively
      if (shouldRefreshToken()) {
        console.log('🔄 Token expiring soon, attempting refresh...')
        const refreshed = await refreshToken()
        if (!refreshed) {
          clearAuth()
          if (tokenCheckInterval) clearInterval(tokenCheckInterval)
          navigateTo('/login?session_expired=true&reason=refresh_failed')
          return
        }
      }

      // Case 3: Just show warnings
      const timeUntilExpiry = getTimeUntilExpiry()
      if (timeUntilExpiry) {
        const hoursLeft = Math.floor(timeUntilExpiry / (60 * 60 * 1000))
        const minutesLeft = Math.floor(
          (timeUntilExpiry % (60 * 60 * 1000)) / (60 * 1000)
        )

        if (hoursLeft <= 3 && !userWarned) {
          userWarned = true
          console.warn(`⚠️ Token expires in: ${hoursLeft}h ${minutesLeft}m`)
        }
      }
    } catch (error) {
      console.error('❌ Token monitoring error:', error)
    }
  }, checkIntervalMs)

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      if (tokenCheckInterval) clearInterval(tokenCheckInterval)
    })
  }
}


// Show user-friendly expiration warning for 24-hour sessions
function showExpirationWarning(hoursLeft: number, minutesLeft: number = 0) {
  // You can customize this notification based on your UI framework
  console.log(`🔔 Session expires in ${hoursLeft} hours, ${minutesLeft} minutes. Please save your work.`);
  
  // Optional: Show toast notification if you have a toast system
  // toast.warn(`Session expires in ${hoursLeft} hours, ${minutesLeft} minutes`);
  
  // Optional: Show modal dialog for critical operations (only when less than 1 hour)
  if (hoursLeft === 0 && minutesLeft <= 30) {
    const shouldStay = confirm(`Your session will expire in ${minutesLeft} minutes. Would you like to extend your session?`);
    
    if (shouldStay) {
      // Here you could implement token refresh logic
      // refreshToken(); // Implement this if you have refresh token functionality
    }
  }
}
