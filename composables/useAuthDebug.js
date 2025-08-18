// Authentication debugging utility
export function useAuthDebug() {
  const debugAuth = () => {
    if (!process.client) return
    
    console.log('🔍 Auth Debug Report:')
    console.log('==================')
    
    // Check localStorage
    const localAuth = localStorage.getItem('auth')
    console.log('📦 localStorage auth:', localAuth ? 'exists' : 'missing')
    if (localAuth) {
      try {
        const parsed = JSON.parse(localAuth)
        console.log('  - Token exists:', !!parsed.token)
        console.log('  - Token length:', parsed.token?.length || 0)
        console.log('  - Login time:', parsed.loginTime)
        console.log('  - Expires at:', parsed.expiresAt)
        
        // Check if expired
        if (parsed.expiresAt) {
          const now = new Date()
          const expiry = new Date(parsed.expiresAt)
          console.log('  - Current time:', now.toISOString())
          console.log('  - Expiry time:', expiry.toISOString())
          console.log('  - Is expired:', now >= expiry)
        }
        
        // Parse JWT token
        if (parsed.token) {
          try {
            const parts = parsed.token.split('.')
            if (parts.length === 3) {
              const payload = JSON.parse(atob(parts[1]))
              console.log('  - JWT exp:', payload.exp)
              console.log('  - JWT exp date:', new Date(payload.exp * 1000).toISOString())
              console.log('  - JWT is expired:', Math.floor(Date.now() / 1000) >= payload.exp)
            }
          } catch (e) {
            console.log('  - JWT parse error:', e.message)
          }
        }
      } catch (e) {
        console.log('  - Parse error:', e.message)
      }
    }
    
    // Check sessionStorage
    const sessionAuth = sessionStorage.getItem('auth')
    console.log('📦 sessionStorage auth:', sessionAuth ? 'exists' : 'missing')
    
    // Check useAuth composable
    const { getToken, isTokenExpired, getUser } = useAuth()
    console.log('🔧 useAuth composable:')
    console.log('  - getToken():', getToken() ? 'exists' : 'missing')
    console.log('  - isTokenExpired():', isTokenExpired())
    console.log('  - getUser():', getUser() ? 'exists' : 'missing')
    
    // Check runtime config
    const config = useRuntimeConfig()
    console.log('⚙️ Runtime config:')
    console.log('  - apiBaseUrl:', config.public.apiBaseUrl)
    console.log('  - apiAdminBaseUrl:', config.public.apiAdminBaseUrl)
    console.log('  - environment:', config.public.environment)
    console.log('  - NODE_ENV:', process.env.NODE_ENV)
    
    console.log('==================')
  }
  
  const testApiCall = async () => {
    console.log('🧪 Testing API call...')
    
    try {
      const { fetchEvents } = await import('@/composables/api')
      const result = await fetchEvents()
      console.log('✅ API test result:', result)
    } catch (error) {
      console.error('❌ API test failed:', error)
    }
  }
  
  return {
    debugAuth,
    testApiCall
  }
}