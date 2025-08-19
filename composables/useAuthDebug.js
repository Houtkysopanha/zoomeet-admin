// Authentication debugging utility
export function useAuthDebug() {
  const debugAuth = () => {
    if (!process.client) return
    
    
    // Check localStorage
    const localAuth = localStorage.getItem('auth')
    if (localAuth) {
      try {
        const parsed = JSON.parse(localAuth)
        
        // Check if expired
        if (parsed.expiresAt) {
          const now = new Date()
          const expiry = new Date(parsed.expiresAt)
        }
        
        // Parse JWT token
        if (parsed.token) {
          try {
            const parts = parsed.token.split('.')
            if (parts.length === 3) {
              const payload = JSON.parse(atob(parts[1]))
            }
          } catch (e) {
          }
        }
      } catch (e) {
      }
    }
    
    // Check sessionStorage
    const sessionAuth = sessionStorage.getItem('auth')
    
    // Check useAuth composable
    const { getToken, isTokenExpired, getUser } = useAuth()
    
    // Check runtime config
    const config = useRuntimeConfig()
    
  }
  
  const testApiCall = async () => {
    
    try {
      const { fetchEvents } = await import('@/composables/api')
      const result = await fetchEvents()
    } catch (error) {
    }
  }
  
  return {
    debugAuth,
    testApiCall
  }
}