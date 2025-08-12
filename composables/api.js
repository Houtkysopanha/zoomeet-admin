// Auto-imported by Nuxt: useRuntimeConfig, $fetch

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
  } else {
    console.warn('⚠️ No authentication token available for API request')
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

  const token = getAuthToken()
  if (!token) {
    console.error('❌ No authentication token found for event creation')
    console.log('💡 Please make sure you are logged in with a user that has event creation permissions')
    throw new Error('Authentication required. Please login again.')
  }

  // Always use FormData (like your successful Postman request)
  const formData = new FormData()

  // Required fields that must always be included (even if empty)
  const requiredFields = [
    'name', 'category_id', 'description', 'start_date', 'end_date',
    'location', 'map_url', 'company', 'organizer', 'event_slug', 'is_published'
  ]

  // Add all event data to FormData
  Object.keys(eventData).forEach(key => {
    const value = eventData[key]

    // Always include required fields (even if empty string)
    if (requiredFields.includes(key)) {
      formData.append(key, value || '')
    }
    // For files, only include if they exist and are actual File objects
    else if (value instanceof File) {
      formData.append(key, value)
      console.log(`📎 Adding file: ${key} = ${value.name} (${value.size} bytes)`)
    }
    // For other optional fields, only include if they have values
    else if (value !== null && value !== undefined && value !== '') {
      formData.append(key, value)
    }
  })

  // Special handling for image uploads:
  // - cover_image: REQUIRED (server expects this)
  // - event_background: OPTIONAL
  // - card_background: OPTIONAL

  try {
    console.log('Creating event at:', `${API_ADMIN_BASE_URL}/events/create`)
    console.log('Auth token present:', !!token)
    console.log('Auth token (first 50 chars):', token ? token.substring(0, 50) + '...' : 'No token')

    // Debug: Log FormData contents (matching your Postman format)
    console.log('📋 FormData being sent to API:')
    console.log('=' .repeat(50))

    // Create a summary object for easier debugging
    const formDataSummary = {}
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`✅ ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`)
        formDataSummary[key] = `File(${value.name})`
      } else {
        console.log(`✅ ${key}: "${value}"`)
        formDataSummary[key] = value
      }
    }
    console.log('=' .repeat(50))
    console.log('📊 Summary of all fields:', formDataSummary)

    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/create`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData, let the browser set it
      },
    })

    console.log('✅ Create event response:', response)
    console.log('📊 Response structure:', {
      status: response.status,
      hasData: !!response.data,
      dataSuccess: response.data?.success,
      message: response.data?.message || response.message,
      eventId: response.data?.data?.id
    })
    return response
  } catch (error) {
    console.error('Create event error:', error)
    console.error('Error details:', {
      status: error.status,
      statusCode: error.statusCode,
      statusText: error.statusText,
      data: error.data,
      message: error.message,
      cause: error.cause,
      response: error.response
    })

    // Handle specific error cases
    if (error.status === 401 || error.statusCode === 401) {
      console.error('🚫 Authentication failed - token may be invalid or expired')
      const { clearAuth } = useAuth()
      clearAuth()
      throw new Error('Authentication failed. Please login again.')
    }

    if (error.status === 403 || error.statusCode === 403) {
      console.error('🚫 Permission denied - user may not have event creation permissions')
      throw new Error('Permission denied. You may not have permission to create events.')
    }

    if (error.status === 422 || error.statusCode === 422) {
      console.error('🚫 Validation Error (422) - Server rejected the data')
      console.error('📋 Validation details:', error.data)

      // Extract validation errors if available
      if (error.data && error.data.data && error.data.data.errors) {
        const errors = error.data.data.errors
        console.error('🔍 Specific validation errors:')
        Object.keys(errors).forEach(field => {
          console.error(`  - ${field}: ${errors[field].join(', ')}`)
        })

        // Create user-friendly error message
        const errorMessages = Object.keys(errors).map(field =>
          `${field}: ${errors[field].join(', ')}`
        ).join('\n')

        throw new Error(`Validation failed:\n${errorMessages}`)
      }

      // If no specific errors, show generic message
      throw new Error('Validation failed. Please check your input data and try again.')
    }

    if (error.status === 500 || error.statusCode === 500) {
      console.error('🚫 Server error - check server logs for details')

      // Try to extract more specific error information
      if (error.data && typeof error.data === 'string') {
        // Look for Laravel error patterns
        if (error.data.includes('getPathname')) {
          console.error('💡 File upload error detected - server tried to call getPathname() on null')
          throw new Error('File upload error: The server expects a file but received null. Try uploading a cover image.')
        }

        // Try to extract error from HTML response
        const errorMatch = error.data.match(/<title>(.*?)<\/title>/)
        if (errorMatch) {
          console.error('Server error title:', errorMatch[1])
        }

        // Look for Laravel exception messages
        const exceptionMatch = error.data.match(/class="exception_message"[^>]*>([^<]+)/)
        if (exceptionMatch) {
          console.error('Laravel exception:', exceptionMatch[1])
          throw new Error(`Server error: ${exceptionMatch[1]}`)
        }
      }

      throw new Error('Server error (500). Please check server logs or try again.')
    }

    // Try to get more detailed error information
    if (error.data) {
      console.error('Server error data:', error.data)
    }

    throw error // Throw the original error to preserve all details
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

// Create Ticket Types for an Event
export const createTicketTypes = async (eventId, ticketTypesData) => {
  const token = getAuthToken()
  if (!token) {
    console.error('❌ No authentication token found for ticket creation')
    throw new Error('Authentication required. Please login again.')
  }

  // Get the API base URL from runtime config
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!API_ADMIN_BASE_URL) {
    console.error('❌ API_ADMIN_BASE_URL is not configured')
    throw new Error('API configuration error. Please check your environment settings.')
  }

  try {
    console.log('🎫 Creating ticket types for event:', eventId)
    console.log('📝 Ticket types data:', ticketTypesData)
    console.log('🔗 API URL:', `${API_ADMIN_BASE_URL}/events/ticket-types/create/${eventId}`)

    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/ticket-types/create/${eventId}`, {
      method: 'POST',
      body: ticketTypesData,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    })

    console.log('✅ Create ticket types response:', response)
    console.log('📊 Ticket creation result:', {
      status: response.status,
      success: response.data?.success,
      message: response.data?.message,
      ticketCount: response.data?.data?.length || 0
    })

    return response
  } catch (error) {
    console.error('❌ Create ticket types error:', error)
    console.error('📋 Error details:', {
      status: error.status,
      statusCode: error.statusCode,
      data: error.data,
      message: error.message
    })

    // Handle specific error cases
    if (error.status === 401 || error.statusCode === 401) {
      console.error('🚫 Authentication failed for ticket creation')
      const { clearAuth } = useAuth()
      clearAuth()
      throw new Error('Authentication failed. Please login again.')
    }

    if (error.status === 404 || error.statusCode === 404) {
      console.error('🚫 Event not found for ticket creation')
      throw new Error('Event not found. Please make sure the event exists.')
    }

    if (error.status === 422 || error.statusCode === 422) {
      console.error('🚫 Ticket validation error')
      if (error.data && error.data.data && error.data.data.errors) {
        const errors = error.data.data.errors
        console.error('🔍 Ticket validation errors:', errors)

        const errorMessages = Object.keys(errors).map(field =>
          `${field}: ${errors[field].join(', ')}`
        ).join('\n')

        throw new Error(`Ticket validation failed:\n${errorMessages}`)
      }
      throw new Error('Ticket validation failed. Please check your ticket data.')
    }

    throw error
  }
}
