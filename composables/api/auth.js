// composables/api/auth.js
// Authentication related API functions

// Get auth token using proper Nuxt 3 pattern
const getAuthToken = () => {
  // Use the useAuth composable for proper token management
  const { getToken } = useAuth()
  const token = getToken()

  if (token) {
    console.log('🔑 Using token from useAuth composable')
    console.log('📝 Token preview:', token.substring(0, 50) + '...')
    console.log('📏 Token length:', token.length)

    // Decode JWT to see user info (for debugging)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const userInfo = {
        username: payload.preferred_username,
        name: payload.name,
        exp: new Date(payload.exp * 1000).toISOString()
      }
      console.log('👤 Current user:', userInfo)

      // Check token expiration
      if (new Date() > new Date(userInfo.exp)) {
        console.log('⚠️ Token is expired!')
        return null
      }

    } catch (e) {
      console.log('⚠️ Could not decode token payload')
    }

    return token
  } else {
    console.log('❌ No token found in auth state')
    return null
  }
}

// Create authenticated fetch headers
const createAuthHeaders = (includeContentType = true) => {
  const headers = {}

  if (includeContentType) {
    headers['Content-Type'] = 'application/json'
  }

  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
    console.log('✅ Auth token added to request')
  } else {
    console.warn('⚠️ No authentication token available for API request')
    throw new Error('Authentication required. Please login again.')
  }

  return headers
}

// Login API
export async function login(identifier, password) {
  const config = useRuntimeConfig()
  const API_BASE_URL = config.public.apiBaseUrl

  if (!API_BASE_URL) {
    throw new Error('API base URL is not configured.')
  }

  try {
    console.log('Attempting login with:', { identifier, API_BASE_URL })

    const response = await $fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      body: { identifier, password },
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('Login response:', response)
    return response
  } catch (error) {
    console.error('Login error:', error)
    throw new Error(error.data?.message || error.message || 'Login failed')
  }
}

// Fetch user info
export async function fetchUserInfo() {
  const config = useRuntimeConfig()
  const API_BASE_URL = config.public.apiBaseUrl

  if (!API_BASE_URL) {
    throw new Error('API base URL is not configured.')
  }

  try {
    console.log('Fetching user info from:', `${API_BASE_URL}/info`)

    const response = await $fetch(`${API_BASE_URL}/info`, {
      method: 'GET',
      headers: createAuthHeaders(),
    })

    console.log('User info response:', response)
    return response
  } catch (error) {
    console.error('Fetch user info error:', error)
    throw new Error(error.data?.message || error.message || 'Failed to fetch user info')
  }
}

// Export helper functions for other modules
export { getAuthToken, createAuthHeaders }