// debug-auth.js - Run this to test auth token
console.log('🔍 Debug: Checking authentication state...')

if (typeof window !== 'undefined') {
  // Check localStorage
  const authLS = localStorage.getItem('auth')
  console.log('📱 LocalStorage auth:', authLS ? 'exists' : 'missing')
  
  if (authLS) {
    try {
      const parsed = JSON.parse(authLS)
      console.log('🔑 Token exists:', parsed.token ? 'YES' : 'NO')
      console.log('🔑 Token length:', parsed.token ? parsed.token.length : 0)
      console.log('🔑 Token start:', parsed.token ? parsed.token.substring(0, 20) : 'N/A')
      console.log('👤 User:', parsed.user ? parsed.user.email || parsed.user.name : 'N/A')
      console.log('⏰ Login time:', parsed.loginTime || 'N/A')
    } catch (e) {
      console.error('❌ Failed to parse auth data:', e)
    }
  }
  
  // Check sessionStorage
  const authSS = sessionStorage.getItem('auth')
  console.log('💾 SessionStorage auth:', authSS ? 'exists' : 'missing')
  
  // Check cookies
  const cookies = document.cookie
  console.log('🍪 Cookies contain auth:', cookies.includes('auth') ? 'YES' : 'NO')
} else {
  console.log('🔸 Running on server side')
}

// Test making a direct request to the API endpoint
if (typeof fetch !== 'undefined') {
  console.log('🧪 Testing direct API call...')
  
  const authData = localStorage.getItem('auth')
  if (authData) {
    try {
      const parsed = JSON.parse(authData)
      const token = parsed.token
      
      fetch('/api/admin/events', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        console.log('📡 API Response status:', response.status)
        console.log('📡 API Response ok:', response.ok)
        return response.text()
      })
      .then(text => {
        console.log('📡 API Response body:', text.substring(0, 200))
      })
      .catch(error => {
        console.error('❌ API Error:', error)
      })
    } catch (e) {
      console.error('❌ Failed to parse auth for test:', e)
    }
  } else {
    console.log('❌ No auth data found for API test')
  }
}
