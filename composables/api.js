// Auto-imported by Nuxt: useRuntimeConfig, $fetch

// Get auth token from localStorage (client-side only)
const getAuthToken = () => {
  if (import.meta.client) {
    const auth = localStorage.getItem('auth')
    if (auth) {
      try {
        const parsed = JSON.parse(auth)
        return parsed.token
      } catch (e) {
        return null
      }
    }
  }
  return null
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

// Fetch events list
export async function fetchEvents() {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!API_ADMIN_BASE_URL) {
    throw new Error('API admin base URL is not configured.')
  }

  try {
    console.log('Fetching events from:', `${API_ADMIN_BASE_URL}/events`)

    const response = await $fetch(`${API_ADMIN_BASE_URL}/events`, {
      method: 'GET',
      headers: createAuthHeaders(),
    })

    console.log('Events response:', response)
    return response
  } catch (error) {
    console.error('Fetch events error:', error)
    throw new Error(error.data?.message || error.message || 'Failed to fetch events')
  }
}

// Create event API
export async function createEvent(eventData) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!API_ADMIN_BASE_URL) {
    throw new Error('API admin base URL is not configured.')
  }

  // Create FormData for file uploads
  const formData = new FormData()

  // Add all event data to FormData
  Object.keys(eventData).forEach(key => {
    if (eventData[key] !== null && eventData[key] !== undefined) {
      if (eventData[key] instanceof File) {
        formData.append(key, eventData[key])
      } else {
        formData.append(key, eventData[key])
      }
    }
  })

  const token = getAuthToken()
  if (!token) {
    throw new Error('No authentication token found')
  }

  try {
    console.log('Creating event at:', `${API_ADMIN_BASE_URL}/events/create`)

    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/create`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData, let the browser set it
      },
    })

    console.log('Create event response:', response)
    return response
  } catch (error) {
    console.error('Create event error:', error)
    throw new Error(error.data?.message || error.message || 'Failed to create event')
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
