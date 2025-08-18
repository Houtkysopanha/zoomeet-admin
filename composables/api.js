// Auto-imported by Nuxt: useRuntimeConfig, $fetch

// Get auth token using proper Nuxt 3 pattern
const getAuthToken = () => {
  try {
    // Use the useAuth composable consistently for token management
    const { getToken, isTokenExpired } = useAuth()
    let token = getToken()

    // If no token from composable, try direct storage access as fallback
    if (!token && process.client) {
      console.log('🔍 No token from composable, trying direct storage access...')
      
      // Try localStorage first
      const stored = localStorage.getItem('auth')
      if (stored) {
        try {
          const authData = JSON.parse(stored)
          token = authData?.token
          console.log('📍 Found token in localStorage')
        } catch (e) {
          console.error('❌ Failed to parse localStorage auth data:', e)
        }
      }
      
      // Try sessionStorage as backup
      if (!token) {
        const sessionStored = sessionStorage.getItem('auth')
        if (sessionStored) {
          try {
            const authData = JSON.parse(sessionStored)
            token = authData?.token
            console.log('📍 Found token in sessionStorage')
          } catch (e) {
            console.error('❌ Failed to parse sessionStorage auth data:', e)
          }
        }
      }
    }

    if (!token) {
      console.log('❌ No token found in auth state or storage')
      return null
    }

    // Check if token is expired
    if (isTokenExpired && isTokenExpired()) {
      console.warn('⚠️ Token is expired')
      return null
    }

    // Log token info without sensitive data
    console.log('🔑 Token found:', {
      length: token.length,
      preview: token.substring(0, 20) + '...',
      source: getToken() ? 'composable' : 'direct_storage'
    })

    return token
  } catch (error) {
    console.error('❌ Error getting auth token:', error)
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

// Helper function to normalize API URLs
const normalizeApiUrl = (baseUrl, endpoint) => {
  if (!baseUrl) return endpoint
  
  // Remove trailing slash from baseUrl and leading slash from endpoint
  const cleanBaseUrl = baseUrl.replace(/\/$/, '')
  const cleanEndpoint = endpoint.replace(/^\//, '')
  
  return `${cleanBaseUrl}/${cleanEndpoint}`
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

    const loginUrl = normalizeApiUrl(API_BASE_URL, 'login')
    console.log('🔗 Login URL:', loginUrl)

    const response = await $fetch(loginUrl, {
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
    // Don't expose API endpoints or technical details in user-facing errors
    let userMessage = 'Login failed. Please check your credentials and try again.'
    
    if (error.status === 401) {
      userMessage = 'Invalid email or password. Please try again.'
    } else if (error.status === 429) {
      userMessage = 'Too many login attempts. Please wait a moment and try again.'
    } else if (error.status === 500) {
      userMessage = 'Server error. Please try again later.'
    } else if (error.data?.message && !error.data.message.includes('http') && !error.data.message.includes('api')) {
      // Only use server message if it doesn't contain technical details
      userMessage = error.data.message
    }
    
    throw new Error(userMessage)
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
    const eventsUrl = normalizeApiUrl(API_ADMIN_BASE_URL, 'events')
    console.log('🔍 Fetching events from:', eventsUrl)
    console.log('🌍 Environment:', {
      nodeEnv: process.env.NODE_ENV,
      apiUrl: API_ADMIN_BASE_URL
    })
    
    // Use consistent token handling
    const token = getAuthToken()
    if (!token) {
      console.error('❌ No auth token available for events fetch')
      return { status: 401, data: { success: false, data: [], message: 'Authentication required' } }
    }

    // Create headers with the token
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
    
    console.log('📨 Request prepared:', {
      url: eventsUrl,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 10)}...` : 'none'
    })

    const response = await $fetch(eventsUrl, {
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
    
    // Don't expose technical details to users
    let userMessage = 'Failed to load events. Please try again.'
    if (error.status === 401) {
      userMessage = 'Session expired. Please login again.'
    } else if (error.status === 403) {
      userMessage = 'Access denied. Please check your permissions.'
    } else if (error.status === 500) {
      userMessage = 'Server error. Please try again later.'
    }
    
    return {
      status: error?.status || 500,
      data: {
        success: false,
        data: [],
        message: userMessage
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
    const userInfoUrl = normalizeApiUrl(API_BASE_URL, 'info')
    console.log('Fetching user info from:', userInfoUrl)
    const response = await $fetch(userInfoUrl, {
      method: 'GET',
      headers: createAuthHeaders(),
    })

    console.log('User info response:', response)
    return response
  } catch (error) {
    console.error('Fetch user info error:', error)
    
    // Don't expose technical details
    let userMessage = 'Failed to load user information.'
    if (error.status === 401) {
      userMessage = 'Session expired. Please login again.'
    } else if (error.status === 403) {
      userMessage = 'Access denied.'
    }
    
    throw new Error(userMessage)
  }
}

// Helper function to validate UUID
function validateUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid?.toString())
}

// Get event details - Enhanced for any UUID
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

  // Store current event ID in session for debugging
  if (process.client) {
    sessionStorage.setItem('currentEventId', cleanUUID)
    console.log('📝 Stored event ID in session:', cleanUUID)
  }

  try {
    const eventDetailsUrl = normalizeApiUrl(API_ADMIN_BASE_URL, `events/${cleanUUID}`)
    console.log('🔍 Fetching event details for UUID:', cleanUUID)
    console.log('🔗 Event details URL:', eventDetailsUrl)
    const response = await $fetch(eventDetailsUrl, {
      method: 'GET',
      headers: createAuthHeaders()
    })

    if (!response) {
      throw new Error('Empty response from server')
    }

    // Enhanced response validation
    let eventData = null
    if (response.data) {
      eventData = response.data
      console.log('✅ Event details fetched (wrapped response):', {
        id: eventData.id,
        name: eventData.name,
        category: eventData.category_name
      })
    } else if (response.id) {
      eventData = response
      console.log('✅ Event details fetched (direct response):', {
        id: eventData.id,
        name: eventData.name,
        category: eventData.category_name
      })
    } else {
      throw new Error('Invalid response structure from server')
    }

    // Validate that returned event ID matches requested ID
    if (eventData.id.toString() !== cleanUUID) {
      console.error('❌ Event ID mismatch:', {
        requested: cleanUUID,
        received: eventData.id.toString()
      })
      throw new Error('Event ID mismatch in response')
    }

    return {
      success: true,
      message: 'Event retrieved successfully',
      data: eventData
    }
  } catch (error) {
    console.error('❌ Failed to fetch event details for UUID:', cleanUUID, error)
    
    // Enhanced error handling
    if (error.status === 404) {
      throw new Error(`Event with ID ${cleanUUID} not found`)
    } else if (error.status === 401) {
      throw new Error('Authentication required. Please login again.')
    } else if (error.status === 403) {
      throw new Error('You do not have permission to access this event')
    }
    
    throw error
  }
}

// Create event
export async function createEvent(eventData, isDraft = true) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!API_ADMIN_BASE_URL) {
    return {
      success: false,
      message: 'API admin base URL is not configured.',
      error: new Error('Missing API configuration')
    }
  }

  if (!eventData) {
    return {
      success: false,
      message: 'Event data is required',
      error: new Error('Missing event data')
    }
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
    // Validate required fields strictly
    const mandatoryFields = ['name', 'category_id', 'description', 'start_date', 'end_date', 'location', 'event_slug']
    const missingFields = mandatoryFields.filter(field => {
      const value = eventData[field]
      return value === null || value === undefined || value === '' || 
             (typeof value === 'string' && value.trim() === '')
    })
    
    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields)
      return {
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        error: new Error('Missing required fields')
      }
    }
    
    // Validate dates strictly
    const startDate = new Date(eventData.start_date)
    const endDate = new Date(eventData.end_date)
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return {
        success: false,
        message: 'Invalid date format. Please provide dates in YYYY-MM-DD HH:mm:ss format.',
        error: new Error('Invalid date format')
      }
    }
    
    if (endDate <= startDate) {
      return {
        success: false,
        message: 'End date must be after start date',
        error: new Error('Invalid date range')
      }
    }
    
    // Validate category_id is a number
    if (isNaN(Number(eventData.category_id))) {
      return {
        success: false,
        message: 'Invalid category ID. Must be a number.',
        error: new Error('Invalid category ID')
      }
    }
    
    // Validate event_slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    if (!slugRegex.test(eventData.event_slug)) {
      return {
        success: false,
        message: 'Invalid event slug format. Use only lowercase letters, numbers, and hyphens.',
        error: new Error('Invalid slug format')
      }
    }
    
    // Log the data being sent
    console.log('🎯 Creating event:', {
      isDraft,
      name: eventData.name,
      category_id: Number(eventData.category_id),
      start_date: eventData.start_date,
      end_date: eventData.end_date,
      event_slug: eventData.event_slug,
      has_cover_image: !!eventData.cover_image,
      has_card_background: !!eventData.card_background,
      has_event_background: !!eventData.event_background,
    })
    const formData = new FormData()
    
    // Add required text fields first, ensuring they exist
    const requiredFields = [
      'name', 'category_id', 'description', 'start_date', 'end_date',
      'location', 'event_slug'
    ]
    
    requiredFields.forEach(key => {
      let value = eventData[key]
      // Format category_id as number
      if (key === 'category_id') {
        value = Number(value)
      }
      formData.append(key, value)
      console.log(`📝 Adding required field: ${key} = ${value}`)
    })
    
    // Add optional text fields if they have values
    const optionalFields = ['map_url', 'company', 'organizer', 'online_link_meeting']
    optionalFields.forEach(key => {
      if (eventData[key] !== null && eventData[key] !== undefined && eventData[key] !== '') {
        const value = eventData[key]?.trim()
        if (value) {
          formData.append(key, value)
          console.log(`📝 Adding optional field: ${key} = ${value}`)
        }
      }
    })
    
    // Handle chairs array - API expects individual FormData fields format
    if (eventData.chairs && Array.isArray(eventData.chairs)) {
      console.log('🪑 Processing chairs for API submission:', {
        chairCount: eventData.chairs.length,
        chairs: eventData.chairs.map((chair, index) => ({
          index,
          id: chair.id,
          name: chair.name,
          position: chair.position,
          company: chair.company,
          sort_order: chair.sort_order,
          hasProfileImage: chair.profile_image instanceof File,
          hasAvatar: !!chair.avatar
        }))
      })
      
      // Filter out chairs with empty required fields
      const validChairs = eventData.chairs.filter(chair => {
        const hasValidName = chair.name && chair.name.trim().length > 0
        const hasValidPosition = chair.position && chair.position.trim().length > 0
        const hasValidCompany = chair.company && chair.company.trim().length > 0
        
        if (!hasValidName || !hasValidPosition || !hasValidCompany) {
          console.warn('🪑 Skipping invalid chair:', {
            id: chair.id,
            name: chair.name,
            position: chair.position,
            company: chair.company,
            hasValidName,
            hasValidPosition,
            hasValidCompany
          })
          return false
        }
        return true
      })
      
      console.log(`🪑 Filtered chairs: ${eventData.chairs.length} -> ${validChairs.length} valid chairs`)
      
      if (validChairs.length > 0) {
        // Send individual FormData fields (the format the API actually expects)
        validChairs.forEach((chair, index) => {
          const chairName = chair.name.trim()
          const chairPosition = chair.position.trim()
          const chairCompany = chair.company.trim()
          const chairSortOrder = chair.sort_order || (index + 1)
          
          formData.append(`chairs[${index}][name]`, chairName)
          formData.append(`chairs[${index}][position]`, chairPosition)
          formData.append(`chairs[${index}][company]`, chairCompany)
          formData.append(`chairs[${index}][sort_order]`, chairSortOrder)
          
          console.log(`🪑 Added chair ${index}:`, {
            name: chairName,
            position: chairPosition,
            company: chairCompany,
            sort_order: chairSortOrder
          })
          
          // Handle profile image file separately
          if (chair.profile_image instanceof File) {
            formData.append(`chairs[${index}][profile_image]`, chair.profile_image)
            console.log(`📎 Adding chair ${index} profile image: ${chair.profile_image.name} (${chair.profile_image.size} bytes)`)
          }
        })
        
        console.log(`🪑 Successfully added ${validChairs.length} valid chairs to FormData`)
      } else {
        console.log('🪑 No valid chairs to send - all chairs have missing required fields')
      }
    } else {
      console.log('🪑 No chairs to process:', {
        hasChairs: !!eventData.chairs,
        isArray: Array.isArray(eventData.chairs),
        chairsValue: eventData.chairs
      })
    }
    
    // Add file fields separately with enhanced validation
    const fileFields = ['cover_image', 'event_background', 'card_background']
    let totalFileSize = 0
    
    fileFields.forEach(key => {
      if (eventData[key] instanceof File) {
        const file = eventData[key]
        
        // Validate individual file size (max 2MB per file to prevent 413)
        if (file.size > 2 * 1024 * 1024) {
          throw new Error(`${key} file size exceeds 2MB limit. Please compress the image.`)
        }
        
        // Track total payload size
        totalFileSize += file.size
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${key} must be an image file`)
        }
        
        // Validate file format (only allow common web formats)
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type.toLowerCase())) {
          throw new Error(`${key} must be in JPEG, PNG, or WebP format`)
        }
        
        formData.append(key, file)
        console.log(`📎 Adding file: ${key} = ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
      }
    })
    
    // Validate total payload size (max 5MB total to prevent 413)
    if (totalFileSize > 5 * 1024 * 1024) {
      throw new Error(`Total file size exceeds 5MB limit. Current size: ${(totalFileSize / 1024 / 1024).toFixed(2)}MB. Please compress your images.`)
    }
    
    console.log(`📊 Total file payload: ${(totalFileSize / 1024 / 1024).toFixed(2)}MB`)

    // Set published state and status correctly
    const isPublishingNow = !isDraft
    formData.append('is_published', isPublishingNow ? '1' : '0')
    formData.append('status', isPublishingNow ? 'active' : 'draft')
    console.log(`📝 Setting event state: is_published=${isPublishingNow ? '1' : '0'}, status=${isPublishingNow ? 'active' : 'draft'}`)
    
    // Log FormData contents for debugging
    console.log('📋 FormData contents:')
    const formDataEntries = {}
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: [File] ${value.name} (${value.size} bytes, type: ${value.type})`)
        formDataEntries[key] = `[File] ${value.name} (${value.size} bytes)`
      } else {
        console.log(`${key}: ${value}`)
        formDataEntries[key] = value
      }
    }
    
    // Log complete FormData structure
    console.log('📋 Complete FormData structure:', formDataEntries)
    
    // Special validation for required fields (removed optional fields)
    const requiredFieldsCheck = [
      'name', 'category_id', 'description', 'start_date', 'end_date',
      'location', 'event_slug'
    ]
    
    console.log('🔍 Required fields validation:')
    requiredFieldsCheck.forEach(field => {
      const hasField = formDataEntries.hasOwnProperty(field) && formDataEntries[field] !== null && formDataEntries[field] !== undefined && formDataEntries[field] !== ''
      console.log(`${hasField ? '✅' : '❌'} ${field}: ${hasField ? formDataEntries[field] : 'MISSING OR EMPTY'}`)
    })

    // Use the correct API endpoint without duplicate admin prefix
    // Make the actual API call
    try {
      const createEventUrl = normalizeApiUrl(API_ADMIN_BASE_URL, 'events')
      console.log('🔗 Create event URL:', createEventUrl)
      const response = await $fetch(createEventUrl, {
        method: 'POST',
        body: formData,
        headers: {
          ...createAuthHeaders(false), // Don't include Content-Type for FormData
        },
      })

      // Only return success if we get a valid response
      if (!response || typeof response !== 'object') {
        console.error('❌ Invalid response format:', response)
        return {
          success: false,
          message: 'Invalid response from server',
          error: new Error('Invalid response format')
        }
      }

      console.log('✅ Event created:', response)
      
      // Return normalized response
      return {
        success: true,
        message: 'Event created successfully',
        data: response.data || response
      }
    } catch (error) {
      // Log the network error but return a structured response
      console.error('🚨 Create event network error:', error)
      
      // Hide technical details in production
      const isProduction = process.env.NODE_ENV === 'production'
      const sanitizeError = (err) => {
        if (!isProduction) return err
        // Remove sensitive information in production
        const sanitized = { ...err }
        delete sanitized.config
        delete sanitized.request
        delete sanitized.response
        if (sanitized.message) {
          // Remove API URLs from error messages
          sanitized.message = sanitized.message.replace(/https?:\/\/[^\s]+/g, '[API_ENDPOINT]')
        }
        return sanitized
      }
      
      // Enhanced error handling for specific HTTP status codes
      if (error.status === 413) {
        console.error('🚨 Request too large (413):', isProduction ? '[HIDDEN]' : error)
        return {
          success: false,
          message: 'Request too large. Please reduce image file sizes and try again. Maximum total size: 5MB.',
          error: sanitizeError(error),
          errorType: 'FILE_TOO_LARGE'
        }
      }
      
      if (error.status === 422) {
        console.error('🚨 Validation errors from server:', error.data)
        console.error('🚨 Full error object:', error)
        
        let detailedMessage = 'Validation failed:'
        let validationErrors = {}
        
        if (error.data?.errors) {
          validationErrors = error.data.errors
          const errorMessages = []
          Object.entries(error.data.errors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              errorMessages.push(`${field}: ${messages.join(', ')}`)
            } else {
              errorMessages.push(`${field}: ${messages}`)
            }
          })
          detailedMessage = `Validation failed:\n${errorMessages.join('\n')}`
        } else if (error.data?.message) {
          detailedMessage = error.data.message
        }
        
        console.error('🚨 Processed validation errors:', {
          detailedMessage,
          validationErrors
        })
        
        return {
          success: false,
          message: detailedMessage,
          error: sanitizeError(error),
          validationErrors: validationErrors,
          errorType: 'VALIDATION_ERROR'
        }
      }
      
      // Handle CORS and network errors
      if (error.message?.includes('CORS') || error.message?.includes('Failed to fetch') || error.message?.includes('fetch')) {
        console.error('🚨 CORS or network error:', isProduction ? '[HIDDEN]' : error)
        return {
          success: false,
          message: 'Network connection error. This might be a CORS issue. Please check your internet connection and try again.',
          error: sanitizeError(error),
          errorType: 'NETWORK_ERROR'
        }
      }
      
      // Handle authentication errors
      if (error.status === 401) {
        return {
          success: false,
          message: 'Authentication failed. Please login again.',
          error: sanitizeError(error),
          errorType: 'AUTH_ERROR'
        }
      }
      
      // Handle server errors
      if (error.status >= 500) {
        return {
          success: false,
          message: 'Server error. Please try again later.',
          error: sanitizeError(error),
          errorType: 'SERVER_ERROR'
        }
      }
      
      return {
        success: false,
        message: isProduction ? 'Failed to create event' : (error.message || 'Failed to create event'),
        error: sanitizeError(error)
      }
    }
  } catch (error) {
    console.error('Create event validation error:', error)
    return {
      success: false,
      message: error.message || 'Failed to validate event data',
      error: error
    }
  }
}

// Update event
export async function updateEvent(eventId, eventData) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!eventId || !eventData) {
    return {
      success: false,
      message: 'Event ID and data are required',
      error: new Error('Missing required data')
    }
  }

  // Validate UUID format
  if (!validateUUID(eventId)) {
    return {
      success: false,
      message: 'Invalid event ID format. Expected UUID format.',
      error: new Error('Invalid UUID')
    }
  }

  try {
    // Prepare FormData for Laravel update with _method approach
    const formData = new FormData()
    
    // Add Laravel method override for PUT request
    formData.append('_method', 'PUT')
    
    // Add all event data to FormData
    for (const [key, value] of Object.entries(eventData)) {
      try {
        if (value instanceof File) {
          formData.append(key, value)
          console.log(`📎 Adding file: ${key} = ${value.name} (${value.size} bytes)`)
        } else if (value !== null && value !== undefined) {
          // Special handling for certain fields
          switch (key) {
            case 'is_published':
              // Convert boolean/number is_published to proper format
              const isPublished = String(value) === '1' || value === true || value === 1;
              formData.append('is_published', isPublished ? '1' : '0');
              formData.append('status', isPublished ? 'active' : 'draft');
              break;
              
            case 'category_id':
              // Ensure category_id is a number
              formData.append(key, Number(value));
              break;
              
            case 'start_date':
            case 'end_date':
              const testDate = new Date(value);
              if (isNaN(testDate.getTime())) {
                return {
                  success: false,
                  message: `Invalid ${key} format. Must be YYYY-MM-DD HH:mm:ss`,
                  error: new Error('Invalid date format')
                }
              }
              formData.append(key, value);
              break;
              
            case 'chairs':
              // Handle chairs array - API expects individual FormData fields format
              if (Array.isArray(value)) {
                // Filter out chairs with empty required fields
                const validChairs = value.filter(chair => {
                  const hasValidName = chair.name && chair.name.trim().length > 0
                  const hasValidPosition = chair.position && chair.position.trim().length > 0
                  const hasValidCompany = chair.company && chair.company.trim().length > 0
                  
                  return hasValidName && hasValidPosition && hasValidCompany
                })
                
                if (validChairs.length > 0) {
                  // Send individual FormData fields (the format the API actually expects)
                  validChairs.forEach((chair, index) => {
                    const chairName = chair.name.trim()
                    const chairPosition = chair.position.trim()
                    const chairCompany = chair.company.trim()
                    const chairSortOrder = chair.sort_order || (index + 1)
                    
                    formData.append(`chairs[${index}][name]`, chairName)
                    formData.append(`chairs[${index}][position]`, chairPosition)
                    formData.append(`chairs[${index}][company]`, chairCompany)
                    formData.append(`chairs[${index}][sort_order]`, chairSortOrder)
                    
                    // Handle profile image file separately
                    if (chair.profile_image instanceof File) {
                      formData.append(`chairs[${index}][profile_image]`, chair.profile_image)
                    }
                  })
                }
              }
              break;
              
            default:
              // Regular string fields
              formData.append(key, typeof value === 'string' ? value.trim() : value);
          }
        }
      } catch (fieldError) {
        return {
          success: false,
          message: `Error processing field ${key}: ${fieldError.message}`,
          error: fieldError
        }
      }
    }

    const updateEventUrl = normalizeApiUrl(API_ADMIN_BASE_URL, `events/${eventId}`)
    
    // Use POST method with _method override for Laravel compatibility
    const response = await $fetch(updateEventUrl, {
      method: 'POST',
      body: formData,
      headers: {
        ...createAuthHeaders(false), // Don't include Content-Type for FormData
      },
    })

    // Validate response
    if (!response || typeof response !== 'object') {
      console.error('❌ Invalid response format:', response)
      return {
        success: false,
        message: 'Invalid response from server',
        error: new Error('Invalid response format')
      }
    }

    // Return normalized success response
    return {
      success: true,
      message: 'Event updated successfully',
      data: response.data || response
    }

  } catch (error) {
    console.error('❌ Failed to update event:', error)
    
    // Hide technical details in production
    const isProduction = process.env.NODE_ENV === 'production'
    const sanitizeError = (err) => {
      if (!isProduction) return err
      const sanitized = { ...err }
      delete sanitized.config
      delete sanitized.request
      delete sanitized.response
      if (sanitized.message) {
        sanitized.message = sanitized.message.replace(/https?:\/\/[^\s]+/g, '[API_ENDPOINT]')
      }
      return sanitized
    }
    
    // Handle specific error cases with enhanced error handling
    if (error.status === 422) {
      console.error('🚨 Validation errors:', isProduction ? '[HIDDEN]' : error.data)
      
      let detailedMessage = 'Validation failed:'
      let validationErrors = {}
      
      if (error.data?.errors) {
        validationErrors = error.data.errors
        const errorMessages = []
        Object.entries(error.data.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            errorMessages.push(`${field}: ${messages.join(', ')}`)
          } else {
            errorMessages.push(`${field}: ${messages}`)
          }
        })
        detailedMessage = `Validation failed:\n${errorMessages.join('\n')}`
      } else if (error.data?.message) {
        detailedMessage = error.data.message
      }
      
      return {
        success: false,
        message: detailedMessage,
        error: sanitizeError(error),
        validationErrors: validationErrors,
        errorType: 'VALIDATION_ERROR'
      }
    }
    
    if (error.status === 404) {
      return {
        success: false,
        message: 'Event not found',
        error: sanitizeError(error),
        errorType: 'NOT_FOUND'
      }
    }
    
    if (error.status === 403) {
      return {
        success: false,
        message: 'You do not have permission to update this event',
        error: sanitizeError(error),
        errorType: 'PERMISSION_DENIED'
      }
    }
    
    if (error.status === 413) {
      return {
        success: false,
        message: 'Request too large. Please reduce image file sizes and try again.',
        error: sanitizeError(error),
        errorType: 'FILE_TOO_LARGE'
      }
    }
    
    // Generic error case
    return {
      success: false,
      message: isProduction ? 'Failed to update event' : (error.message || 'Failed to update event'),
      error: sanitizeError(error)
    }
  }
}

// Update ticket type

// Update ticket type
export async function updateTicketType(eventId, ticketTypeId, ticketData) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!eventId || !ticketTypeId) {
    throw new Error('Event ID and Ticket Type ID are required')
  }

  try {
    console.log('🎫 Updating ticket type:', { eventId, ticketTypeId })
    
    // Create FormData for Laravel PUT method override
    const formData = new FormData()
    formData.append('_method', 'PUT')
    
    // Add ticket data to FormData
    for (const [key, value] of Object.entries(ticketData)) {
      if (value !== null && value !== undefined) {
        formData.append(key, value)
      }
    }
    
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/ticket-types/${ticketTypeId}`, {
      method: 'POST',
      body: formData,
      headers: createAuthHeaders(false) // Don't include Content-Type for FormData
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

  // Validate event ID format
  if (!validateUUID(eventId)) {
    throw new Error('Invalid event ID format')
  }

  try {
    console.log('🎫 Creating ticket types for event:', eventId)
    
    // Ensure ticketTypesData is an array
    const ticketsArray = Array.isArray(ticketTypesData) ? ticketTypesData : [ticketTypesData]
    
    // Validate and normalize each ticket with proper API format
    const normalizedTickets = ticketsArray.map((ticket, index) => {
      // Convert and validate each field
      const name = String(ticket.name || '').trim()
      const price = parseFloat(ticket.price || 0)
      const total = parseInt(ticket.quantity || ticket.total || 0)
      const description = String(ticket.description || ticket.tag || '').trim()

      // Validate required fields
      if (!name) throw new Error(`Ticket ${index + 1}: Name is required`)
      if (isNaN(price)) throw new Error(`Ticket ${index + 1}: Price must be a valid number`)
      if (price < 0) throw new Error(`Ticket ${index + 1}: Price cannot be negative`)
      if (isNaN(total)) throw new Error(`Ticket ${index + 1}: Quantity must be a valid number`)
      if (total < 1) throw new Error(`Ticket ${index + 1}: Quantity must be at least 1`)
      if (!description) throw new Error(`Ticket ${index + 1}: Description is required`)

      // Return in exact API format expected by the backend
      return {
        name: name,
        price: parseFloat(price.toFixed(2)), // Ensure proper decimal format
        total: total, // API expects 'total' not 'total_quantity'
        tag: description, // API expects 'tag' not 'description'
        sort_order: index + 1,
        is_active: 1 // Send as integer, not boolean
      }
    })

    console.log('📝 Normalized ticket data for API:', {
      eventId,
      ticketCount: normalizedTickets.length,
      tickets: normalizedTickets
    })

    // Wrap tickets in proper structure that API expects
    const requestBody = {
      ticket_types: normalizedTickets
    }

    console.log('📤 Sending request body:', requestBody)

    // Send tickets in proper structure to admin endpoint
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
      
      // Extract detailed validation errors if available
      let errorMessage = 'The given data was invalid.'
      
      if (error.data?.errors) {
        const validationErrors = []
        Object.entries(error.data.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            validationErrors.push(`${field}: ${messages.join(', ')}`)
          } else {
            validationErrors.push(`${field}: ${messages}`)
          }
        })
        errorMessage = `Validation failed:\n${validationErrors.join('\n')}`
      } else if (error.data?.message) {
        errorMessage = error.data.message
      }
      
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

  if (!validateUUID(eventId)) {
    throw new Error('Invalid event ID format')
  }

  try {
    console.log('🎫 Fetching ticket types for event:', eventId)
    console.log('Using admin URL:', API_ADMIN_BASE_URL)
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

// Delete event - ENHANCED WITH CONFIRMATION
export async function deleteEvent(eventId) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!eventId) {
    throw new Error('Event ID is required')
  }

  // Validate UUID format
  if (!validateUUID(eventId)) {
    throw new Error('Invalid event ID format. Expected UUID format.')
  }

  try {
    console.log('🗑️ Deleting event:', eventId)
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}`, {
      method: 'DELETE',
      headers: createAuthHeaders()
    })

    console.log('✅ Event deleted:', response)
    return response
  } catch (error) {
    console.error('❌ Failed to delete event:', error)
    
    // Enhanced error handling
    if (error.status === 404) {
      throw new Error('Event not found or already deleted')
    } else if (error.status === 403) {
      throw new Error('You do not have permission to delete this event')
    } else if (error.status === 409) {
      throw new Error('Cannot delete event with existing bookings')
    }
    
    throw error
  }
}

// Delete ticket type - ENHANCED WITH VALIDATION
export async function deleteTicketType(eventId, ticketTypeId) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!eventId || !ticketTypeId) {
    throw new Error('Event ID and Ticket Type ID are required')
  }

  // Validate UUID format for event ID
  if (!validateUUID(eventId)) {
    throw new Error('Invalid event ID format. Expected UUID format.')
  }

  try {
    console.log('🗑️ Deleting ticket type:', { eventId, ticketTypeId })
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/ticket-types/${ticketTypeId}`, {
      method: 'DELETE',
      headers: createAuthHeaders()
    })

    console.log('✅ Ticket type deleted:', response)
    return response
  } catch (error) {
    console.error('❌ Failed to delete ticket type:', error)
    
    // Enhanced error handling
    if (error.status === 404) {
      throw new Error('Ticket type not found or already deleted')
    } else if (error.status === 403) {
      throw new Error('You do not have permission to delete this ticket type')
    } else if (error.status === 409) {
      throw new Error('Cannot delete ticket type with existing bookings')
    }
    
    throw error
  }
}

// Get ticket type details
export async function getTicketTypeDetails(eventId, ticketTypeId) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!eventId || !ticketTypeId) {
    throw new Error('Event ID and Ticket Type ID are required')
  }

  // Validate UUID format for event ID
  if (!validateUUID(eventId)) {
    throw new Error('Invalid event ID format. Expected UUID format.')
  }

  try {
    console.log('🎫 Fetching ticket type details:', { eventId, ticketTypeId })
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/ticket-types/${ticketTypeId}`, {
      method: 'GET',
      headers: createAuthHeaders()
    })

    console.log('✅ Ticket type details fetched:', response)
    return response
  } catch (error) {
    console.error('❌ Failed to fetch ticket type details:', error)
    
    if (error.status === 404) {
      throw new Error('Ticket type not found')
    }
    
    throw error
  }
}

// Create agenda items
export async function createAgendaItems(eventId, agendaData) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!eventId || !agendaData) {
    throw new Error('Event ID and agenda data are required')
  }

  try {
    console.log('📅 Creating agenda items for event:', eventId)
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/agendas`, {
      method: 'POST',
      body: agendaData,
      headers: createAuthHeaders()
    })

    console.log('✅ Agenda items created:', response)
    return response
  } catch (error) {
    console.error('❌ Failed to create agenda items:', error)
    throw error
  }
}

// Update agenda item
export async function updateAgendaItem(eventId, agendaId, agendaData) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!eventId || !agendaId || !agendaData) {
    throw new Error('Event ID, agenda ID, and agenda data are required')
  }

  try {
    console.log('📅 Updating agenda item:', { eventId, agendaId })
    
    // Create FormData for Laravel PUT method override
    const formData = new FormData()
    formData.append('_method', 'PUT')
    
    // Add agenda data to FormData
    for (const [key, value] of Object.entries(agendaData)) {
      if (value !== null && value !== undefined) {
        formData.append(key, value)
      }
    }
    
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/agendas/${agendaId}`, {
      method: 'POST',
      body: formData,
      headers: createAuthHeaders(false) // Don't include Content-Type for FormData
    })

    console.log('✅ Agenda item updated:', response)
    return response
  } catch (error) {
    console.error('❌ Failed to update agenda item:', error)
    throw error
  }
}

// Get event agenda
export async function getEventAgenda(eventId) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!eventId) {
    throw new Error('Event ID is required')
  }

  try {
    console.log('📅 Fetching agenda for event:', eventId)
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/agendas`, {
      method: 'GET',
      headers: createAuthHeaders()
    })

    console.log('✅ Event agenda fetched:', response)
    return response
  } catch (error) {
    console.error('❌ Failed to fetch event agenda:', error)
    throw error
  }
}

// Delete agenda
export async function deleteAgenda(eventId, agendaId) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!eventId) {
    throw new Error('Event ID is required')
  }

  if (!agendaId) {
    throw new Error('Agenda ID is required')
  }

  // Validate UUID format
  if (!validateUUID(eventId)) {
    throw new Error('Invalid event ID format. Expected UUID format.')
  }

  try {
    console.log('🗑️ Deleting agenda:', agendaId)
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/agendas/${agendaId}`, {
      method: 'DELETE',
      headers: createAuthHeaders()
    })

    console.log('✅ Agenda deleted:', response)
    return response
  } catch (error) {
    console.error('❌ Failed to delete agenda:', error)
    
    // Enhanced error handling
    if (error.status === 404) {
      throw new Error('Agenda not found or already deleted')
    } else if (error.status === 403) {
      throw new Error('You do not have permission to delete this agenda')
    } else if (error.status === 409) {
      throw new Error('Cannot delete agenda with existing in event')
    }
    
    throw error
  }
}

// Publish event by updating is_published field
export async function publishEvent(eventId) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!eventId) {
    throw new Error('Event ID is required')
  }

  // Validate UUID format
  if (!validateUUID(eventId)) {
    throw new Error('Invalid event ID format. Expected UUID format.')
  }

  try {
    console.log('🚀 Publishing event:', eventId)
    
    // Create FormData for Laravel PUT method override
    const formData = new FormData()
    formData.append('_method', 'PUT')
    formData.append('is_published', '1')
    formData.append('status', 'active')
    
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}`, {
      method: 'POST',
      body: formData,
      headers: createAuthHeaders(false) // Don't include Content-Type for FormData
    })

    console.log('✅ Event published:', response)
    return response
  } catch (error) {
    console.error('❌ Failed to publish event:', error)
    throw error
  }
}

// Unpublish event
export async function unpublishEvent(eventId) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!eventId) {
    throw new Error('Event ID is required')
  }

  // Validate UUID format
  if (!validateUUID(eventId)) {
    throw new Error('Invalid event ID format. Expected UUID format.')
  }

  try {
    console.log('📤 Unpublishing event:', eventId)
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/unpublish`, {
      method: 'POST',
      headers: createAuthHeaders()
    })

    console.log('✅ Event unpublished:', response)
    return response
  } catch (error) {
    console.error('❌ Failed to unpublish event:', error)
    throw error
  }
}

// Fetch categories
export async function fetchCategories() {
  const config = useRuntimeConfig()
  const API_BASE_URL = config.public.apiBaseUrl

  if (!API_BASE_URL) {
    throw new Error('API admin base URL is not configured.')
  }

  try {
    const categoriesUrl = normalizeApiUrl(API_BASE_URL, 'events/categories')
    console.log('🏷️ Fetching categories from:', categoriesUrl)
    
    // Use the same authentication pattern as other admin API calls
    const token = getAuthToken()
    if (!token) {
      console.error('❌ No auth token available for categories fetch')
      throw new Error('Authentication required')
    }

    const response = await $fetch(categoriesUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    })

    console.log('✅ Categories fetched:', response)
    return response
  } catch (error) {
    console.error('❌ Failed to fetch categories:', error)
    
    // Don't expose technical details
    let userMessage = 'Failed to load categories. Please try again.'
    if (error.status === 401) {
      userMessage = 'Session expired. Please login again.'
    } else if (error.status === 403) {
      userMessage = 'Access denied. Please check your permissions.'
    } else if (error.status === 500) {
      userMessage = 'Server error. Please try again later.'
    }
    
    throw new Error(userMessage)
  }
}

// Alias for fetchEventById - used by PreviewEvent component
export async function fetchEventById(eventId) {
  return await getEventDetails(eventId)
}
