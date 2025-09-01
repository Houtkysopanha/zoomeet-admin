// Token debugging script - run in browser console
console.log('🔍 Checking token validity...')

const authData = localStorage.getItem('auth')
if (!authData) {
  console.log('❌ No auth data found')
} else {
  try {
    const parsed = JSON.parse(authData)
    const token = parsed.token
    
    if (token) {
      console.log('🔑 Token found, length:', token.length)
      
      // Decode JWT payload to check expiration
      try {
        const parts = token.split('.')
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]))
          
          console.log('📋 Token payload:', {
            iat: payload.iat ? new Date(payload.iat * 1000).toISOString() : 'N/A',
            exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'N/A',
            sub: payload.sub || 'N/A',
            iss: payload.iss || 'N/A'
          })
          
          if (payload.exp) {
            const now = Date.now() / 1000
            const isExpired = now >= payload.exp
            const timeLeft = payload.exp - now
            
            console.log('⏰ Token status:')
            console.log('  - Current time:', new Date().toISOString())
            console.log('  - Expires at:', new Date(payload.exp * 1000).toISOString())
            console.log('  - Is expired:', isExpired)
            console.log('  - Time left:', isExpired ? 'EXPIRED' : `${Math.floor(timeLeft / 3600)}h ${Math.floor((timeLeft % 3600) / 60)}m`)
            
            if (isExpired) {
              console.log('🚨 TOKEN IS EXPIRED - Need to login again!')
            }
          }
        }
      } catch (e) {
        console.error('❌ Failed to decode token:', e)
      }
      
      // Test the token with a direct API call
      console.log('🧪 Testing token with external API...')
      fetch('https://api-ticket.etickets.asia/api/v1/admin/events', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      .then(response => {
        console.log('📡 Direct API test result:', response.status, response.statusText)
        if (response.status === 401) {
          console.log('🚨 CONFIRMED: Token is invalid/expired on external API')
        }
        return response.text()
      })
      .then(text => {
        console.log('📡 Response body:', text.substring(0, 200))
      })
      .catch(error => {
        console.error('❌ Direct API test error:', error)
      })
    }
  } catch (e) {
    console.error('❌ Failed to parse auth data:', e)
  }
}

// Also check login time
const loginTime = parsed?.loginTime
if (loginTime) {
  const loginDate = new Date(loginTime)
  const now = new Date()
  const hoursSinceLogin = (now - loginDate) / (1000 * 60 * 60)
  
  console.log('📅 Login info:')
  console.log('  - Login time:', loginDate.toISOString())
  console.log('  - Hours since login:', hoursSinceLogin.toFixed(1))
  console.log('  - Login was:', hoursSinceLogin > 24 ? 'MORE than 24 hours ago' : 'within 24 hours')
}
