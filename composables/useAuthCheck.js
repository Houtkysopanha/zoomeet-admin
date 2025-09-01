// Auto-redirect for expired tokens - global utility
export function checkAuthAndRedirect() {
  if (process.client) {
    const { isTokenExpired, clearAuth } = useAuth()
    
    if (isTokenExpired()) {
      console.log('🔐 Token expired detected - auto redirecting')
      clearAuth()
      window.location.href = '/login?session_expired=true&reason=auto_detected'
      return false
    }
    
    return true
  }
  
  return true
}

// Call this on any admin page mount
export function useAuthCheck() {
  onMounted(() => {
    checkAuthAndRedirect()
  })
  
  return {
    checkAuthAndRedirect
  }
}
