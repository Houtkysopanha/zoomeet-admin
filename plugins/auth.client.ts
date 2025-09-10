export default defineNuxtPlugin(async (nuxtApp) => {

  
  try {
    // Import useAuth from the composables
    const { initAuth, getToken, isTokenExpired, getTimeUntilExpiry } = useAuth();
    
    // Initialize auth state
    initAuth();
    
    // Verify auth state
    const token = getToken();
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

// Enhanced token monitoring with 24-hour sessions - production optimized
function startTokenMonitoring() {
  let tokenCheckInterval: NodeJS.Timeout | null = null;
  let userWarned = false;
  
  // Check token every 60 minutes for production stability (less aggressive)
  const checkIntervalMs = process.env.NODE_ENV === 'production' ? 60 * 60 * 1000 : 30 * 60 * 1000;
  
  tokenCheckInterval = setInterval(() => {
    const { getTimeUntilExpiry, isTokenExpired, clearAuth } = useAuth();
    
    try {
      if (isTokenExpired()) {
        clearAuth();
        if (tokenCheckInterval) {
          clearInterval(tokenCheckInterval);
        }
        
        // Redirect to login with helpful message
        navigateTo('/login?session_expired=true&reason=token_expired');
        return;
      }
      
      const timeUntilExpiry = getTimeUntilExpiry();
      if (timeUntilExpiry) {
        const hoursLeft = Math.floor(timeUntilExpiry / (60 * 60 * 1000));
        const minutesLeft = Math.floor((timeUntilExpiry % (60 * 60 * 1000)) / (60 * 1000));
        
        // Show warning when 3 hours or less remain (more conservative for production)
        if (hoursLeft <= 3 && !userWarned) {
          userWarned = true;
          console.warn(`⚠️ Token expires in: ${hoursLeft} hours, ${minutesLeft} minutes`);
          
          // Show user-friendly notification only for very short time remaining
          if (hoursLeft <= 1) {
            showExpirationWarning(hoursLeft, minutesLeft);
          }
        }
        
        // Force logout when 30 minutes or less remains (more generous)
        if (hoursLeft === 0 && minutesLeft <= 30) {
          clearAuth();
          if (tokenCheckInterval) {
            clearInterval(tokenCheckInterval);
          }
          
          // Redirect with specific message
          navigateTo('/login?session_expired=true&reason=about_to_expire');
        }
      }
      
    } catch (error) {
      console.error('❌ Token monitoring error:', error);
      // Don't clear auth on monitoring errors - could be temporary network issues
    }
  }, checkIntervalMs);
  
  // Cleanup on page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      if (tokenCheckInterval) {
        clearInterval(tokenCheckInterval);
      }
    });
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
