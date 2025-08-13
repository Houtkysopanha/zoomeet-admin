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
    console.log('✅ Auth token added to request')
  } else {
    console.warn('⚠️ No authentication token available for API request')
    // Redirect to login if no token
    const router = useRouter()
    router.push('/login')
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
    return { status: 500, data: { success: false, data: [], message: 'API admin base URL is not configured.' } }
  }

  try {
    console.log('Fetching events from:', `${API_ADMIN_BASE_URL}/events`)
    
    const headers = createAuthHeaders()
    console.log('Request headers:', headers)

    const response = await $fetch(`${API_ADMIN_BASE_URL}/events`, {
      method: 'GET',
      headers: headers,
    })

    console.log('Events API response:', response)

    // Ensure the response structure is always predictable
    if (response && response.data && Array.isArray(response.data)) {
      return {
        status: 200,
        data: {
          success: true,
          data: response.data
        }
      }
    } else if (response && Array.isArray(response)) {
      return {
        status: 200,
        data: {
          success: true,
          data: response
        }
      }
    } else {
      console.warn('Unexpected API response structure:', response)
      return {
        status: 200,
        data: {
          success: false,
          data: [],
          message: 'Unexpected API response format'
        }
      }
    }
  } catch (error) {
    console.error('Fetch events error:', error)
    return {
      status: error?.status || 500,
      data: {
        success: false,
        data: [],
        message: error?.data?.message || error?.message || 'Failed to fetch events'
      }
    }
  }
}

// Fetch single event by ID
export async function fetchEventById(eventId) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!API_ADMIN_BASE_URL) {
    throw new Error('API admin base URL is not configured.')
  }

  if (!eventId) {
    throw new Error('Event ID is required.')
  }

  try {
    console.log('Fetching event by ID:', eventId)

    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}`, {
      method: 'GET',
      headers: createAuthHeaders(),
    })

    console.log('Event by ID response:', response)
    return response
  } catch (error) {
    console.error('Fetch event by ID error:', error)
    throw new Error(error.data?.message || error.message || 'Failed to fetch event details')
  }
}

// Create event API
export async function createEvent(eventData, isDraft = true) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl || 'https://dev-apiticket.prestigealliance.co/api/v1/admin'

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

  try {
    console.log('Creating event at:', `${API_ADMIN_BASE_URL}/events`)
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

    const response = await $fetch(`${API_ADMIN_BASE_URL}/events`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData, let the browser set it
      },
    })

    console.log('✅ Create event response:', response)
    
    // Normalize response structure - handle different API response formats
    let normalizedResponse = {
      success: false,
      data: null,
      message: 'Unknown response format'
    }

    // Handle different response structures from the API
    if (response) {
      // Case 1: Direct response with data property
      if (response.data && response.data.id) {
        normalizedResponse = {
          success: true,
          data: response.data,
          message: response.message || 'Event created successfully'
        }
      }
      // Case 2: Response with success flag and nested data
      else if (response.success !== undefined) {
        normalizedResponse = {
          success: response.success,
          data: response.data,
          message: response.message || (response.success ? 'Event created successfully' : 'Event creation failed')
        }
      }
      // Case 3: Direct event data (API returns event object directly)
      else if (response.id) {
        normalizedResponse = {
          success: true,
          data: response,
          message: 'Event created successfully'
        }
      }
      // Case 4: Response with status and data structure
      else if (response.status && response.data) {
        normalizedResponse = {
          success: response.status >= 200 && response.status < 300,
          data: response.data.data || response.data,
          message: response.data.message || response.message || 'Event processed'
        }
      }
    }

    console.log('📊 Normalized response:', normalizedResponse)
    return normalizedResponse
    
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
      if (error.data && error.data.errors) {
        const errors = error.data.errors
        console.error('🔍 Specific validation errors:')
        Object.keys(errors).forEach(field => {
          const fieldErrors = Array.isArray(errors[field]) ? errors[field] : [errors[field]]
          console.error(`  - ${field}: ${fieldErrors.join(', ')}`)
        })

        // Create user-friendly error message
        const errorMessages = Object.keys(errors).map(field => {
          const fieldErrors = Array.isArray(errors[field]) ? errors[field] : [errors[field]]
          return `${field}: ${fieldErrors.join(', ')}`
        }).join('\n')

        throw new Error(`Validation failed:\n${errorMessages}`)
      }

      // Check for nested error structure
      if (error.data && error.data.data && error.data.data.errors) {
        const errors = error.data.data.errors
        console.error('🔍 Nested validation errors:')
        Object.keys(errors).forEach(field => {
          const fieldErrors = Array.isArray(errors[field]) ? errors[field] : [errors[field]]
          console.error(`  - ${field}: ${fieldErrors.join(', ')}`)
        })

        const errorMessages = Object.keys(errors).map(field => {
          const fieldErrors = Array.isArray(errors[field]) ? errors[field] : [errors[field]]
          return `${field}: ${fieldErrors.join(', ')}`
        }).join('\n')

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

    // For other errors, try to extract meaningful message
    let errorMessage = 'Failed to create event'
    
    if (error.data && error.data.message) {
      errorMessage = error.data.message
    } else if (error.message) {
      errorMessage = error.message
    }

    throw new Error(errorMessage)
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

// Fetch event details
export async function getEventDetails(eventId) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl || 'https://dev-apiticket.prestigealliance.co/api/v1/admin'

  if (!eventId) {
    throw new Error('Event ID is required')
  }

  try {
    console.log('🔍 Fetching event details for:', eventId)
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}`, {
      method: 'GET',
      headers: createAuthHeaders()
    })

    console.log('✅ Event details fetched:', response)
    return response
  } catch (error) {
    console.error('❌ Failed to fetch event details:', error)
    throw error
  }
}

// Update event
export async function updateEvent(eventId, eventData) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl || 'https://dev-apiticket.prestigealliance.co/api/v1/admin'

  if (!eventId) {
    throw new Error('Event ID is required')
  }

  const token = getAuthToken()
  if (!token) {
    console.error('❌ No authentication token found for event update')
    throw new Error('Authentication required. Please login again.')
  }

  try {
    console.log('📝 Updating event:', eventId)
    console.log('📋 Update data:', eventData)

    // Check if we have files to upload
    const hasFiles = Object.values(eventData).some(value => value instanceof File)
    
    let body, headers
    
    if (hasFiles) {
      // Use FormData for file uploads
      const formData = new FormData()
      
      Object.keys(eventData).forEach(key => {
        const value = eventData[key]
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value)
          if (value instanceof File) {
            console.log(`📎 Adding file for update: ${key} = ${value.name} (${value.size} bytes)`)
          }
        }
      })
      
      body = formData
      headers = {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData, let the browser set it
      }
    } else {
      // Use JSON for regular updates
      body = eventData
      headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }

    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}`, {
      method: 'PUT',
      body: body,
      headers: headers
    })

    console.log('✅ Event updated successfully:', response)
    
    // Normalize response structure
    let normalizedResponse = {
      success: false,
      data: null,
      message: 'Unknown response format'
    }

    if (response) {
      // Case 1: Direct response with data property
      if (response.data && response.data.id) {
        normalizedResponse = {
          success: true,
          data: response.data,
          message: response.message || 'Event updated successfully'
        }
      }
      // Case 2: Response with success flag
      else if (response.success !== undefined) {
        normalizedResponse = {
          success: response.success,
          data: response.data,
          message: response.message || (response.success ? 'Event updated successfully' : 'Event update failed')
        }
      }
      // Case 3: Direct event data
      else if (response.id) {
        normalizedResponse = {
          success: true,
          data: response,
          message: 'Event updated successfully'
        }
      }
    }

    return normalizedResponse
  } catch (error) {
    console.error('❌ Failed to update event:', error)
    
    // Handle specific error cases
    if (error.status === 401 || error.statusCode === 401) {
      console.error('🚫 Authentication failed for event update')
      const { clearAuth } = useAuth()
      clearAuth()
      throw new Error('Authentication failed. Please login again.')
    }

    if (error.status === 404 || error.statusCode === 404) {
      console.error('🚫 Event not found for update')
      throw new Error('Event not found. Please make sure the event exists.')
    }

    if (error.status === 422 || error.statusCode === 422) {
      console.error('🚫 Event update validation error')
      
      // Extract validation errors
      if (error.data && error.data.errors) {
        const errors = error.data.errors
        const errorMessages = Object.keys(errors).map(field => {
          const fieldErrors = Array.isArray(errors[field]) ? errors[field] : [errors[field]]
          return `${field}: ${fieldErrors.join(', ')}`
        }).join('\n')
        throw new Error(`Validation failed:\n${errorMessages}`)
      }
      
      throw new Error('Validation failed. Please check your input data.')
    }

    // For other errors, try to extract meaningful message
    let errorMessage = 'Failed to update event'
    if (error.data && error.data.message) {
      errorMessage = error.data.message
    } else if (error.message) {
      errorMessage = error.message
    }

    throw new Error(errorMessage)
  }
}

// Update ticket type
export async function updateTicketType(eventId, ticketTypeId, ticketData) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl || 'https://dev-apiticket.prestigealliance.co/api/v1/admin'

  if (!eventId || !ticketTypeId) {
    throw new Error('Event ID and Ticket Type ID are required')
  }

  try {
    console.log('🎫 Updating ticket type:', { eventId, ticketTypeId, ticketData })
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/ticket-types/${ticketTypeId}`, {
      method: 'PUT',
      body: ticketData,
      headers: createAuthHeaders()
    })

    console.log('✅ Ticket type updated:', response)
    return response
  } catch (error) {
    console.error('❌ Failed to update ticket type:', error)
    throw error
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
    console.log('🔗 API URL:', `${API_ADMIN_BASE_URL}/events/${eventId}/ticket-types`)

    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/ticket-types`, {
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
// Fetch event ticket types
export async function getEventTicketTypes(eventId) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl || 'https://dev-apiticket.prestigealliance.co/api/v1/admin'

  if (!eventId) {
    throw new Error('Event ID is required')
  }

  try {
    console.log('🎫 Fetching ticket types for event:', eventId)
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/ticket-types`, {
      method: 'GET',
      headers: createAuthHeaders()
    })

    console.log('✅ Event ticket types fetched:', response)
    return response
  } catch (error) {
    console.error('❌ Failed to fetch event ticket types:', error)
    throw error
  }
}
