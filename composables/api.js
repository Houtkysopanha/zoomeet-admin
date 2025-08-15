// Auto-imported by Nuxt: useRuntimeConfig, $fetch

// Get auth token using proper Nuxt 3 pattern
const getAuthToken = () => {
  // First check localStorage
  let token = null;
  if (process.client) {
    const stored = localStorage.getItem('auth')
    if (stored) {
      try {
        const authData = JSON.parse(stored)
        token = authData.token
      } catch (e) {
        console.error('Failed to parse stored auth:', e)
      }
    }
  }

  // If no token in localStorage, try useAuth
  if (!token) {
    const { getToken } = useAuth()
    token = getToken()
  }

  if (!token) {
    console.log('❌ No token found in any storage')
    return null
  }

  // Validate token structure and expiration
  try {
    const [headerB64, payloadB64] = token.split('.')
    if (!headerB64 || !payloadB64) {
      console.error('❌ Invalid token format')
      return null
    }

    const payload = JSON.parse(atob(payloadB64))
    const expiry = new Date(payload.exp * 1000)
    const now = new Date()

    // Log token info without sensitive data
    console.log('🔑 Token found:', { 
      length: token.length,
      expiresAt: expiry.toISOString(),
      isExpired: now > expiry,
      preview: token.substring(0, 20) + '...'
    })

    if (now > expiry) {
      console.warn('⚠️ Token is expired')
      return null
    }

  } catch (e) {
    console.error('❌ Token validation error:', e)
    return null
  }

  return token
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
    console.log('✅ Auth headers created')
  } else {
    console.warn('⚠️ Failed to create auth headers - no valid token')
    handleAuthRedirect()
  }

  return headers
}

// Helper function to handle auth redirects
const handleAuthRedirect = () => {
  if (process.client) {
    const router = useRouter()
    const currentPath = router.currentRoute.value.fullPath
    if (currentPath !== '/login') {
      console.log('🔄 Auth failed - redirecting to login')
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
    }
  }
}

// Login API
export async function login(identifier, password) {
  const config = useRuntimeConfig()
  const API_BASE_URL = config.public.apiBaseUrl

  if (!API_BASE_URL) {
    console.error('API Configuration Error:', {
      apiBaseUrl: API_BASE_URL,
      environment: config.public.environment,
      nodeEnv: process.env.NODE_ENV
    })
    throw new Error(`API base URL is not configured for ${process.env.NODE_ENV} environment.`)
  }

  try {
    console.log('🔐 Login attempt:', { 
      identifier,
      apiUrl: API_BASE_URL,
      env: process.env.NODE_ENV,
      environment: config.public.environment
    })

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
    console.log('🔍 Fetching events from:', `${API_ADMIN_BASE_URL}/events`)
    console.log('🌍 Environment:', {
      nodeEnv: process.env.NODE_ENV,
      apiUrl: API_ADMIN_BASE_URL
    })
    
    // First try to get token from localStorage
    let token = null
    if (process.client) {
      const stored = localStorage.getItem('auth')
      if (stored) {
        try {
          const authData = JSON.parse(stored)
          token = authData.token
        } catch (e) {
          console.error('Failed to parse stored auth:', e)
        }
      }
    }

    // If no token in localStorage, try useAuth
    if (!token) {
      const { getToken, initAuth } = useAuth()
      // Try to initialize auth first
      await initAuth()
      token = getToken()
    }
    
    if (!token) {
      console.error('❌ No auth token available for events fetch')
      if (process.client) {
        const router = useRouter()
        const currentPath = router.currentRoute.value.fullPath
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
      }
      return { status: 401, data: { success: false, data: [], message: 'Authentication required' } }
    }

    // Create headers with the token we found
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'  // Ensure we get JSON responses
    }
    
    console.log('📨 Request prepared:', {
      url: `${API_ADMIN_BASE_URL}/events`,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 10)}...` : 'none'
    })

    const response = await $fetch(`${API_ADMIN_BASE_URL}/events`, {
      method: 'GET',
      headers: headers,
    })

    // Validate and log each event ID
    if (response && Array.isArray(response.data)) {
      response.data.forEach((event, index) => {
        const eventId = event.id?.toString()
        if (!eventId || !eventId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          console.error(`❌ Invalid UUID for event at index ${index}:`, event)
        } else {
          console.log(`✅ Valid event UUID: ${eventId} - ${event.name}`)
        }
      })
    }

    console.log('📊 Events API response:', response)

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

// Helper function to validate UUID
function validateUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid?.toString())
}

// Get event details
export async function getEventDetails(eventId) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!eventId) {
    throw new Error('Event ID is required')
  }

  // Clean and validate UUID
  const cleanUUID = eventId.toString().trim()
  if (!validateUUID(cleanUUID)) {
    console.error('❌ Invalid UUID format:', eventId)
    throw new Error('Invalid event ID format. Expected UUID format.')
  }

  // Store current event ID in session
  if (process.client) {
    sessionStorage.setItem('currentEventId', cleanUUID)
  }

  try {
    console.log('🔍 Fetching event details for:', eventId)
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}`, {
      method: 'GET',
      headers: createAuthHeaders()
    })

    if (!response) {
      throw new Error('Empty response from server')
    }

    // Normalize response structure
    if (response.data) {
      console.log('✅ Event details fetched:', {
        id: response.data.id,
        name: response.data.name
      })
      return response
    } else if (response.id) {
      // If response is direct event data
      console.log('✅ Event details fetched (direct):', {
        id: response.id,
        name: response.name
      })
      return {
        success: true,
        message: 'Event retrieved successfully',
        data: response
      }
    }

    throw new Error('Invalid response structure from server')
  } catch (error) {
    console.error('❌ Failed to fetch event details:', error)
    
    if (error.status === 404) {
      throw new Error('Event not found')
    } else if (error.status === 401) {
      throw new Error('Authentication required. Please login again.')
    }
    
    throw error
  }
}

// Create event
export async function createEvent(eventData, isDraft = true) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!API_ADMIN_BASE_URL) {
    throw new Error('API admin base URL is not configured.')
  }

  if (!eventData) {
    throw new Error('Event data is required')
  }

  // Clear any lingering event state from localStorage to prevent conflicts
  if (process.client) {
    const currentEvent = localStorage.getItem('currentEvent')
    if (currentEvent) {
      console.log('🧹 Clearing lingering event state from localStorage')
      localStorage.removeItem('currentEvent')
    }
  }

  try {
    // Validate required fields
    const requiredFields = ['name', 'category_id', 'description', 'start_date', 'end_date', 'location', 'event_slug']
    const missingFields = requiredFields.filter(field => !eventData[field])
    
    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields)
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
    }
    
    // Validate dates
    const startDate = new Date(eventData.start_date)
    const endDate = new Date(eventData.end_date)
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid date format')
    }
    
    if (endDate < startDate) {
      throw new Error('End date must be after start date')
    }
    
    // Log the data being sent
    console.log('🎯 Creating event:', {
      isDraft,
      name: eventData.name,
      category_id: eventData.category_id,
      start_date: eventData.start_date,
      end_date: eventData.end_date,
      event_slug: eventData.event_slug,
      has_cover_image: !!eventData.cover_image
    })

    // Prepare request data
    const formData = new FormData()
    
    // Add all event data to FormData
    Object.entries(eventData).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value)
        console.log(`📎 Adding file: ${key} = ${value.name} (${value.size} bytes)`)
      } else if (value !== null && value !== undefined) {
        formData.append(key, value)
      }
    })

    // If is_published is not explicitly set in eventData, use isDraft
    if (!('is_published' in eventData)) {
      formData.append('is_published', isDraft ? 0 : 1);
      formData.append('status', isDraft ? 'draft' : 'active');
    }

    const response = await $fetch(`${API_ADMIN_BASE_URL}/events`, {
      method: 'POST',
      body: formData,
      headers: {
        ...createAuthHeaders(false), // Don't include Content-Type for FormData
      },
    })

    console.log('✅ Event created:', response)
    return response

  } catch (error) {
    console.error('❌ Failed to create event:', error)
    if (error.status === 422) {
      console.error('Validation errors:', error.data)
    }
    throw error
  }
}

// Update event
export async function updateEvent(eventId, eventData) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!eventId || !eventData) {
    throw new Error('Event ID and data are required')
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(eventId)) {
    throw new Error('Invalid event ID format. Expected UUID format.')
  }

  try {
    console.log('📝 Updating event:', {
      id: eventId,
      name: eventData.name,
      fields: Object.keys(eventData)
    })

    // Prepare request data
    const formData = new FormData()
    
    // Add all event data to FormData
    Object.entries(eventData).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value)
        console.log(`📎 Adding file: ${key} = ${value.name} (${value.size} bytes)`)
      } else if (value !== null && value !== undefined) {
        // Convert boolean/number is_published to proper format
        if (key === 'is_published') {
          formData.append(key, value ? 1 : 0)
          // Also set status when is_published changes
          formData.append('status', value ? 'active' : 'draft')
        } else {
          formData.append(key, value)
        }
      }
    })

    // Log the FormData for debugging
    console.log('📝 FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}`, {
      method: 'PUT',
      body: formData,
      headers: {
        ...createAuthHeaders(false), // Don't include Content-Type for FormData
      },
    })

    console.log('✅ Event updated:', response)
    return response
  } catch (error) {
    console.error('❌ Failed to update event:', error)
    if (error.status === 422) {
      console.error('Validation errors:', error.data)
    }
    throw error
  }
}

// Update ticket type
export async function updateTicketType(eventId, ticketTypeId, ticketData) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!eventId || !ticketTypeId) {
    throw new Error('Event ID and Ticket Type ID are required')
  }

  try {
    console.log('🎫 Updating ticket type:', { eventId, ticketTypeId })
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

// Create ticket types
export async function createTicketTypes(eventId, ticketTypesData) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!eventId || !ticketTypesData) {
    throw new Error('Event ID and ticket types data are required')
  }

  try {
    console.log('🎫 Creating ticket types for event:', eventId)
    
    // Ensure ticketTypesData is an array
    const ticketsArray = Array.isArray(ticketTypesData) ? ticketTypesData : [ticketTypesData]
    
    // Validate and normalize each ticket
    const normalizedTickets = ticketsArray.map(ticket => {
      // Convert and validate each field
      const name = String(ticket.name || '').trim()
      const price = parseFloat(ticket.price)
      const total = parseInt(ticket.quantity || ticket.total)
      const tag = String(ticket.description || ticket.tag || '').trim()

      // Validate required fields
      if (!name) throw new Error('Ticket name is required')
      if (isNaN(price) || price < 0) throw new Error('Ticket price must be a valid number ≥ 0')
      if (isNaN(total) || total < 1) throw new Error('Ticket quantity must be a valid number ≥ 1')
      if (!tag) throw new Error('Ticket description/tag is required')

      return {
        name,
        price,
        total,
        tag,
        sort_order: parseInt(ticket.sort_order) || 1,
        is_active: 1
      }
    })

    // Prepare the request body in the format the API expects
    const requestBody = { ticket_types: normalizedTickets }

    console.log('📝 Normalized ticket data:', {
      eventId,
      ticketCount: normalizedTickets.length,
      tickets: normalizedTickets
    })

    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/ticket-types`, {
      method: 'POST',
      body: requestBody,
      headers: {
        ...createAuthHeaders(),
        'Accept': 'application/json'
      }
    })

    console.log('✅ Ticket types created:', response)
    return response
  } catch (error) {
    console.error('❌ Failed to create ticket types:', error)
    if (error.status === 422) {
      console.error('Validation errors:', error.data)
      const errorMessage = error.data?.message || 
                          'Invalid ticket data. Please check all required fields:\n' +
                          '- Name (required)\n' +
                          '- Price (must be ≥ 0)\n' +
                          '- Quantity (must be ≥ 1)\n' +
                          '- Description (required)'
      throw new Error(errorMessage)
    }
    throw error
  }
}

// Get event ticket types
export async function getEventTicketTypes(eventId) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

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
