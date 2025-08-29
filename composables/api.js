// Auto-imported by Nuxt: useRuntimeConfig, $fetch
import axios from 'axios'
// Get auth token using proper Nuxt 3 pattern with automatic refresh
const getAuthToken = async (autoRefresh = true) => {
  try {
    const { getToken, isTokenExpired, shouldRefreshToken, ensureValidToken } = useAuth()
    
    // First, get the current token
    let token = getToken()

    // If auto-refresh is enabled and we have a token, ensure it's valid
    if (autoRefresh && token) {
      try {
        const isValid = await ensureValidToken()
        if (!isValid) {
          console.warn('⚠️ Failed to ensure valid token, but continuing with existing token for compatibility')
          // Don't return null immediately - let the API call fail if token is actually invalid
        }
      } catch (refreshError) {
        console.warn('⚠️ Token refresh failed, continuing with existing token:', refreshError.message)
        // Continue with existing token - server will return 401 if truly invalid
      }
    }
    
    // Re-get token after potential refresh
    token = getToken()

    // If no token from composable, try direct storage access as fallback
    if (!token && process.client) {
      
      // Try localStorage first
      const stored = localStorage.getItem('auth')
      if (stored) {
        try {
          const authData = JSON.parse(stored)
          token = authData?.token
          
          // Only validate expiration if explicitly set - some tokens don't have expiry
          if (token && authData.expiresAt) {
            const expiry = new Date(authData.expiresAt)
            if (expiry <= new Date()) {
              // Token expired, clear storage
              console.log('🔒 Local token expired, clearing storage')
              localStorage.removeItem('auth')
              sessionStorage.removeItem('auth')
              return null
            }
          }
        } catch (e) {
          console.warn('Failed to parse localStorage auth:', e)
          localStorage.removeItem('auth') // Clear corrupted data
        }
      }
      
      // Try sessionStorage as backup
      if (!token) {
        const sessionStored = sessionStorage.getItem('auth')
        if (sessionStored) {
          try {
            const authData = JSON.parse(sessionStored)
            token = authData?.token
            
            // Only validate expiration if explicitly set
            if (token && authData.expiresAt) {
              const expiry = new Date(authData.expiresAt)
              if (expiry <= new Date()) {
                console.log('🔒 Session token expired, clearing storage')
                sessionStorage.removeItem('auth')
                return null
              }
            }
          } catch (e) {
            console.warn('Failed to parse sessionStorage auth:', e)
            sessionStorage.removeItem('auth') // Clear corrupted data
          }
        }
      }
    }

    // Basic validation - ensure token exists and is properly formatted
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      console.log('🔒 No valid token found')
      return null
    }

    // Basic JWT format check (should have 3 parts separated by dots)
    const tokenParts = token.split('.')
    if (tokenParts.length !== 3) {
      console.warn('🔒 Invalid JWT format, clearing storage')
      if (process.client) {
        localStorage.removeItem('auth')
        sessionStorage.removeItem('auth')
      }
      return null
    }

    return token.trim()
  } catch (error) {
    console.error('❌ Error in getAuthToken:', error)
    return null
  }
}

// Create authenticated fetch headers with automatic token refresh
const createAuthHeaders = async (includeContentType = true, autoRefresh = true) => {
  const headers = {}

  if (includeContentType) {
    headers['Content-Type'] = 'application/json'
  }

  const token = await getAuthToken(autoRefresh)
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  } else {
    console.warn('⚠️ No authentication token available')
    // Don't redirect immediately - let the API call fail with proper error handling
    return null
  }

  return headers
}

// Helper function to handle auth redirects
const handleAuthRedirect = () => {
  if (process.client) {
    const router = useRouter()
    const currentPath = router.currentRoute.value.fullPath
    if (currentPath !== '/login') {
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
// Refresh token endpoint - dedicated refresh function
export async function refreshToken(refreshToken) {
  try {
    const config = useRuntimeConfig()
    
    // Try form data format first (as suggested by curl --form)
    const formData = new FormData()
    formData.append('refreshToken', refreshToken)
    
    const response = await $fetch('/refresh-token', {
      method: 'POST',
      body: formData,
      baseURL: config.public.apiBaseUrl
    })
    
    return {
      success: true,
      data: response
    }
  } catch (error) {
    console.error('Token refresh failed:', error)
    
    // If form data fails, try JSON format as fallback
    try {
      console.log('Retrying with JSON format...')
      const config = useRuntimeConfig()
      const response = await $fetch('/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: { refreshToken },
        baseURL: config.public.apiBaseUrl
      })
      
      return {
        success: true,
        data: response
      }
    } catch (jsonError) {
      console.error('JSON format also failed:', jsonError)
      return {
        success: false,
        error: jsonError.response?.data || jsonError.message
      }
    }
  }
}

export async function login(identifier, password) {
  try {
    // Use Nuxt server proxy for login to avoid CORS issues
    const response = await $fetch('/api/login', {
      method: 'POST',
      body: { identifier, password },
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response
  } catch (error) {
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
  
  // Use server proxy route to avoid CORS issues
  const eventsUrl = '/api/admin/events'

  try {
    
    // Create headers with authenticated token using async refresh
    const headers = await createAuthHeaders()
    if (!headers) {
      return { status: 401, data: { success: false, data: [], message: 'Authentication required' } }
    }

    const response = await $fetch(eventsUrl, {
      method: 'GET',
      headers: headers,
    })

    // Validate and log each event ID
    if (response && Array.isArray(response.data)) {
      response.data.forEach((event, index) => {
        const eventId = event.id?.toString()
        if (!eventId || !eventId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        } else {
        }
      })
    }


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
    
    // Handle authentication errors specifically
    if (error.status === 401) {
      const { clearAuth } = useAuth()
      clearAuth()
      handleAuthRedirect()
      
      return {
        status: 401,
        data: {
          success: false,
          data: [],
          message: 'Session expired. Please login again.'
        }
      }
    }
    
    // Don't expose technical details to users
    let userMessage = 'Failed to load events. Please try again.'
    if (error.status === 403) {
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
// Fetch user info via server proxy
export async function fetchUserInfo() {
  try {
    // Use Nuxt server proxy for user info to avoid CORS issues
    const headers = await createAuthHeaders()
    
    const response = await $fetch('/api/info', {
      method: 'GET',
      headers,
    })

    return response
  } catch (error) {
    
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
  if (!eventId) {
    throw new Error('Event ID is required')
  }

  // Clean and validate UUID
  const cleanUUID = eventId.toString().trim()
  if (!validateUUID(cleanUUID)) {
    throw new Error('Invalid event ID format. Expected UUID format.')
  }

  // Store current event ID in session for debugging
  if (process.client) {
    sessionStorage.setItem('currentEventId', cleanUUID)
  }

  try {
    const serverUrl = `/api/admin/events/${cleanUUID}`
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(serverUrl, {
      method: 'GET',
      headers
    })

    if (!response) {
      throw new Error('Empty response from server')
    }

    // Enhanced response validation
    let eventData = null
    if (response.data) {
      eventData = response.data
    } else if (response.id) {
      eventData = response
    } else {
      throw new Error('Invalid response structure from server')
    }

    // Validate that returned event ID matches requested ID
    if (eventData.id.toString() !== cleanUUID) {
      throw new Error('Event ID mismatch in response')
    }

    return {
      success: true,
      message: 'Event retrieved successfully',
      data: eventData
    }
  } catch (error) {
    
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
  
  // Use server proxy route to avoid CORS issues
  const createEventUrl = '/api/admin/events'

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
    })
    
    // Add optional text fields if they have values
    const optionalFields = ['map_url', 'company', 'organizer', 'online_link_meeting']
    optionalFields.forEach(key => {
      if (eventData[key] !== null && eventData[key] !== undefined && eventData[key] !== '') {
        const value = eventData[key]?.trim()
        if (value) {
          formData.append(key, value)
        }
      }
    })
    
    // Handle chairs array - API expects individual FormData fields format
if (eventData.chairs && Array.isArray(eventData.chairs)) {
  // Filter out chairs with missing required fields
  const validChairs = eventData.chairs.filter(chair => {
    const hasValidName = chair.name && chair.name.trim().length > 0;
    const hasValidPosition = chair.position && chair.position.trim().length > 0;
    const hasValidCompany = chair.company && chair.company.trim().length > 0;
    return hasValidName && hasValidPosition && hasValidCompany;
  });

  validChairs.forEach((chair, index) => {
    const chairName = chair.name.trim();
    const chairPosition = chair.position.trim();
    const chairCompany = chair.company.trim();
    const chairSortOrder = chair.sort_order || (index + 1);

    // Only include real IDs (from server). Skip client-only keys.
    if (chair.id) {
      formData.append(`chairs[${index}][id]`, chair.id);
    }
    if (chair.event_id) {
      formData.append(`chairs[${index}][event_id]`, chair.event_id);
    }

    formData.append(`chairs[${index}][name]`, chairName);
    formData.append(`chairs[${index}][position]`, chairPosition);
    formData.append(`chairs[${index}][company]`, chairCompany);
    formData.append(`chairs[${index}][sort_order]`, chairSortOrder);

    // --- Profile image handling ---
    if (chair.profile_image instanceof File) {

      formData.append(`chairs[${index}][profile_image]`, chair.profile_image);
    } else if (chair.profile_image_url) {
      // Preserve existing server URL (so backend doesn’t overwrite with null)
      formData.append(`chairs[${index}][profile_image_url]`, chair.profile_image_url);
    }
  });
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
      }
    })
    
    // Add chair profile images to total file size calculation
    if (eventData.chairs && Array.isArray(eventData.chairs)) {
      eventData.chairs.forEach((chair, index) => {
        if (chair.profile_image instanceof File) {
          const file = chair.profile_image
          
          // Validate individual chair image file size (max 2MB per file)
          if (file.size > 2 * 1024 * 1024) {
            throw new Error(`Chair ${index + 1} profile image file size exceeds 2MB limit. Please compress the image.`)
          }
          
          // Track total payload size including chair images
          totalFileSize += file.size
          
          // Validate file type
          if (!file.type.startsWith('image/')) {
            throw new Error(`Chair ${index + 1} profile image must be an image file`)
          }
          
          // Validate file format (only allow common web formats)
          const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
          if (!allowedTypes.includes(file.type.toLowerCase())) {
            throw new Error(`Chair ${index + 1} profile image must be in JPEG, PNG, or WebP format`)
          }
        }
      })
    }
    
    // Validate total payload size (max 10MB total to accommodate chair images)
    if (totalFileSize > 10 * 1024 * 1024) {
      throw new Error(`Total file size exceeds 10MB limit. Current size: ${(totalFileSize / 1024 / 1024).toFixed(2)}MB. Please compress your images.`)
    }
    

    // Set published state and status correctly
    const isPublishingNow = !isDraft
    formData.append('is_published', isPublishingNow ? '1' : '0')
    formData.append('status', isPublishingNow ? 'active' : 'draft')
    
    // Log FormData contents for debugging
    const formDataEntries = {}
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        formDataEntries[key] = `[File] ${value.name} (${value.size} bytes)`
      } else {
        formDataEntries[key] = value
      }
    }
    
    // Log complete FormData structure
    
    // Special validation for required fields (removed optional fields)
    const requiredFieldsCheck = [
      'name', 'category_id', 'description', 'start_date', 'end_date',
      'location', 'event_slug'
    ]
    
    requiredFieldsCheck.forEach(field => {
      const hasField = formDataEntries.hasOwnProperty(field) && formDataEntries[field] !== null && formDataEntries[field] !== undefined && formDataEntries[field] !== ''
    })

    // Use server proxy route to avoid CORS issues
    try {
      const headers = await createAuthHeaders(false) // Don't include Content-Type for FormData
      const response = await $fetch(createEventUrl, {
        method: 'POST',
        body: formData,
        headers: {
          ...headers,
        },
      })

      // Only return success if we get a valid response
      if (!response || typeof response !== 'object') {
        return {
          success: false,
          message: 'Invalid response from server',
          error: new Error('Invalid response format')
        }
      }

      
      // Return normalized response
      return {
        success: true,
        message: 'Event created successfully',
        data: response.data || response
      }
    } catch (error) {
      // Log the network error but return a structured response
      
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
        return {
          success: false,
          message: 'Request too large. Please reduce image file sizes and try again. Maximum total size: 5MB.',
          error: sanitizeError(error),
          errorType: 'FILE_TOO_LARGE'
        }
      }
      
      if (error.status === 422) {
        
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
      
      // Handle CORS and network errors
      if (error.message?.includes('CORS') || error.message?.includes('Failed to fetch') || error.message?.includes('fetch')) {
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
    return {
      success: false,
      message: error.message || 'Failed to validate event data',
      error: error
    }
  }
}

// Update event
export async function updateEvent(eventId, eventData) {
  
  // Use server proxy route to avoid CORS issues
  const updateEventUrl = `/api/admin/events/${eventId}`

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
  if (Array.isArray(value)) {
    // Filter out chairs with missing required fields
    const validChairs = value.filter(chair => {
      const hasValidName = chair.name && chair.name.trim().length > 0;
      const hasValidPosition = chair.position && chair.position.trim().length > 0;
      const hasValidCompany = chair.company && chair.company.trim().length > 0;
      return hasValidName && hasValidPosition && hasValidCompany;
    });

    if (validChairs.length > 0) {
      validChairs.forEach((chair, index) => {
        const chairName = chair.name.trim();
        const chairPosition = chair.position.trim();
        const chairCompany = chair.company.trim();
        const chairSortOrder = chair.sort_order || (index + 1);

        // ✅ Keep server-provided IDs so backend updates instead of inserts
        if (chair.id) {
          formData.append(`chairs[${index}][id]`, chair.id);
        }
        if (chair.event_id) {
          formData.append(`chairs[${index}][event_id]`, chair.event_id);
        }

        formData.append(`chairs[${index}][name]`, chairName);
        formData.append(`chairs[${index}][position]`, chairPosition);
        formData.append(`chairs[${index}][company]`, chairCompany);
        formData.append(`chairs[${index}][sort_order]`, chairSortOrder);

        // --- Profile image handling ---
        if (chair.profile_image instanceof File) {
          const file = chair.profile_image;

          // Validate file size (max 2MB)
          if (file.size > 2 * 1024 * 1024) {
            throw new Error(
              `Chair ${index + 1} profile image file size exceeds 2MB limit. Please compress the image.`
            );
          }

          // Validate file type
          if (!file.type.startsWith('image/')) {
            throw new Error(
              `Chair ${index + 1} profile image must be an image file`
            );
          }

          // Allow only common formats
          const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
          if (!allowedTypes.includes(file.type.toLowerCase())) {
            throw new Error(
              `Chair ${index + 1} profile image must be in JPEG, PNG, or WebP format`
            );
          }

          formData.append(`chairs[${index}][profile_image]`, file);
        } else if (chair.profile_image_url && chair.profile_image_url.trim() !== '') {
          // ✅ Preserve existing server image URL
       
          formData.append(`chairs[${index}][profile_image_url]`, chair.profile_image_url);
        } else if (chair.profile_image) {

        }
      });
    }
  }
  break;

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

    // Use server proxy route to avoid CORS issues
    const headers = await createAuthHeaders(false) // Don't include Content-Type for FormData
    if (!headers) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(updateEventUrl, {
      method: 'POST',
      body: formData,
      headers,
    })

    // Validate response
    if (!response || typeof response !== 'object') {
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


// Update ticket type - UPDATED: Match exact API specification
export async function updateTicketType(eventId, ticketTypeId, ticketData) {
  if (!eventId || !ticketTypeId) {
    throw new Error('Event ID and Ticket Type ID are required')
  }

  // Validate UUID format
  if (!validateUUID(eventId)) {
    throw new Error('Invalid event ID format')
  }

  try {
    // Validate and normalize ticket data to match API specification
    const normalizedData = {
      name: String(ticketData.name || '').trim(),
      price: parseFloat(ticketData.price || 0),
      total: parseInt(ticketData.total || ticketData.quantity || 0),
      tag: String(ticketData.tag || ticketData.description || '').trim()
    }

    // Validate required fields
    if (!normalizedData.name) throw new Error('Ticket name is required')
    if (isNaN(normalizedData.price) || normalizedData.price < 0) throw new Error('Price must be 0 or greater')
    if (isNaN(normalizedData.total) || normalizedData.total < 1) throw new Error('Quantity must be at least 1')
    
    // Use server proxy endpoint for ticket type update
    const serverUrl = `/api/admin/events/${eventId}/ticket-types/${ticketTypeId}`
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(serverUrl, {
      method: 'PUT',
      body: normalizedData,
      headers // Use JSON Content-Type
    })

    return response
  } catch (error) {
    console.error('❌ Ticket update error:', error)
    
    // Enhanced error handling
    if (error.status === 404) {
      throw new Error('Ticket type not found')
    } else if (error.status === 422) {
      throw new Error('Invalid ticket data provided')
    }
    
    throw error
  }
}

// Create ticket types
export async function createTicketTypes(eventId, ticketTypesData) {
  if (!eventId || !ticketTypesData) {
    throw new Error('Event ID and ticket types data are required')
  }

  // Validate event ID format
  if (!validateUUID(eventId)) {
    throw new Error('Invalid event ID format')
  }

  try {
    
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


    // Wrap tickets in proper structure that API expects
    const requestBody = {
      ticket_types: normalizedTickets
    }


    // Send tickets in proper structure to server proxy endpoint
    const serverUrl = `/api/admin/events/${eventId}/ticket-types`
    const headers = await createAuthHeaders()
    const response = await $fetch(serverUrl, {
      method: 'POST',
      body: requestBody,
      headers: {
        ...headers,
        'Accept': 'application/json'
      }
    })

    return response
  } catch (error) {
    if (error.status === 422) {
      
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

// Get event ticket types - UPDATED: Use server proxy to avoid CORS
export async function getEventTicketTypes(eventId) {
  if (!eventId) {
    throw new Error('Event ID is required')
  }

  if (!validateUUID(eventId)) {
    throw new Error('Invalid event ID format')
  }

  try {
    // Use Nuxt server API proxy to avoid CORS issues
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(`/api/admin/events/${eventId}/ticket-types`, {
      method: 'GET',
      headers
    })

    return response
  } catch (error) {
    console.error('❌ Failed to get ticket types:', error)
    throw error
  }
}

// Get single ticket type details - UPDATED: Use server proxy to avoid CORS
export async function getTicketTypeDetails(eventId, ticketTypeId) {
  if (!eventId || !ticketTypeId) {
    throw new Error('Event ID and Ticket Type ID are required')
  }

  if (!validateUUID(eventId)) {
    throw new Error('Invalid event ID format')
  }

  try {
    // Use Nuxt server API proxy to avoid CORS issues
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(`/api/admin/events/${eventId}/ticket-types/${ticketTypeId}`, {
      method: 'GET',
      headers
    })


    return response
  } catch (error) {
    console.error('❌ Failed to get ticket type details:', error)
    if (error.status === 404) {
      throw new Error('Ticket type not found')
    }
    throw error
  }
}

// Delete event - ENHANCED WITH CONFIRMATION
export async function deleteEvent(eventId) {
  if (!eventId) {
    throw new Error('Event ID is required')
  }

  // Validate UUID format
  if (!validateUUID(eventId)) {
    throw new Error('Invalid event ID format. Expected UUID format.')
  }

  try {
    const serverUrl = `/api/admin/events/${eventId}`
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(serverUrl, {
      method: 'DELETE',
      headers
    })

    return response
  } catch (error) {
    
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

// Delete ticket type - UPDATED: Match exact API specification
export async function deleteTicketType(eventId, ticketTypeId) {
  if (!eventId || !ticketTypeId) {
    throw new Error('Event ID and Ticket Type ID are required')
  }

  // Validate UUID format for event ID
  if (!validateUUID(eventId)) {
    throw new Error('Invalid event ID format. Expected UUID format.')
  }

  try {
    // Use server proxy endpoint for ticket type deletion
    const serverUrl = `/api/admin/events/${eventId}/ticket-types/${ticketTypeId}`
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(serverUrl, {
      method: 'DELETE',
      headers
    })

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

// Duplicate function removed - keeping the one at line 1173 which has better logging

// Create agenda items - Use server proxy to avoid CORS
export async function createAgendaItems(eventId, agendaData) {
  if (!eventId || !agendaData) {
    throw new Error('Event ID and agenda data are required')
  }

  try {
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(`/api/admin/events/${eventId}/agendas`, {
      method: 'POST',
      body: agendaData,
      headers
    })

    return response
  } catch (error) {
    throw error
  }
}

// Update agenda item - Use server proxy to avoid CORS
export async function updateAgendaItem(eventId, agendaId, agendaData) {
  if (!eventId || !agendaId || !agendaData) {
    throw new Error('Event ID, agenda ID, and agenda data are required')
  }

  try {
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(`/api/admin/events/${eventId}/agendas/${agendaId}`, {
      method: 'PUT',
      body: agendaData,
      headers
    })

    return response
  } catch (error) {
    console.error('❌ Failed to update agenda item:', error)
    throw error
  }
}

// Get event agenda - Use server proxy to avoid CORS
export async function getEventAgenda(eventId) {
  if (!eventId) {
    throw new Error('Event ID is required')
  }

  try {
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(`/api/admin/events/${eventId}/agendas`, {
      method: 'GET',
      headers
    })

    return response
  } catch (error) {
    throw error
  }
}

// Delete agenda - Use server proxy to avoid CORS
export async function deleteAgenda(eventId, agendaId) {
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
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(`/api/admin/events/${eventId}/agendas/${agendaId}`, {
      method: 'DELETE',
      headers
    })

    return response
  } catch (error) {
    
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
    
    // CRITICAL FIX: Get current event data from both API and local state to preserve chair File objects
    const { getEventDetails } = await import('@/composables/api')
    let currentEventData = null
    let localChairFiles = new Map() // Store File objects from local state
    
    // Get local state from event store to preserve File objects
    if (process.client) {
      const { useEventStore } = await import('~/composables/useEventStore')
      const eventStore = useEventStore()
      
      if (eventStore.currentEvent && eventStore.currentEvent.chairs) {
        eventStore.currentEvent.chairs.forEach((chair, index) => {
          if (chair.profile_image instanceof File) {
            localChairFiles.set(chair.name, chair.profile_image)
          }
        })
      }
      
      // Also check tab store for unsaved chair File objects
      const { useEventTabsStore } = await import('~/composables/useEventTabs')
      const tabsStore = useEventTabsStore()
      const basicInfoData = tabsStore.getTabData(0)
      
      if (basicInfoData.chairs) {
        basicInfoData.chairs.forEach((chair) => {
          if (chair.profile_image instanceof File) {
            localChairFiles.set(chair.name, chair.profile_image)
          }
        })
      }
    }
    
    try {
      const eventResponse = await getEventDetails(eventId)
      currentEventData = eventResponse.data
    } catch (error) {
      console.warn('Failed to get current event data for publishing:', error)
    }
    
    // CRITICAL FIX: Use FormData approach but preserve File objects
    if (!currentEventData) {
      throw new Error('Cannot publish event: Unable to retrieve current event data')
    }
    
    // Create FormData for Laravel PUT method override
    const formData = new FormData()
    formData.append('_method', 'PUT')
    formData.append('is_published', '1')
    formData.append('status', 'active')
    
    // FIXED: Preserve chairs data with File objects taking priority
    if (currentEventData?.chairs && Array.isArray(currentEventData.chairs)) {
      
     currentEventData.chairs.forEach((chair, index) => {
  if (chair.name && chair.position && chair.company) {
    // ✅ Preserve IDs so backend knows which chair to update
    if (chair.id) {
      formData.append(`chairs[${index}][id]`, chair.id)
    }
    if (chair.event_id) {
      formData.append(`chairs[${index}][event_id]`, chair.event_id)
    }

    formData.append(`chairs[${index}][name]`, chair.name)
    formData.append(`chairs[${index}][position]`, chair.position)
    formData.append(`chairs[${index}][company]`, chair.company)
    formData.append(`chairs[${index}][sort_order]`, chair.sort_order || (index + 1))

    // 🔥 Priority system for images
    if (localChairFiles.has(chair.name)) {
      const fileObject = localChairFiles.get(chair.name)
      formData.append(`chairs[${index}][profile_image]`, fileObject)
    } else if (chair.profile_image_url && chair.profile_image_url.trim() !== '') {
      formData.append(`chairs[${index}][profile_image_url]`, chair.profile_image_url)
    } else if (chair.profile_image instanceof File) {
      formData.append(`chairs[${index}][profile_image]`, chair.profile_image)
    } else {
    }
  }
})

    }
    
    const headers = await createAuthHeaders(false) // Don't include Content-Type for FormData
    if (!headers) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(`/api/admin/events/${eventId}`, {
      method: 'POST',
      body: formData,
      headers
    })
    
    return response
    
  } catch (error) {
    console.error('❌ Publish event error:', error)
    throw error
  }
}

// Unpublish event - Use server proxy to avoid CORS
export async function unpublishEvent(eventId) {
  if (!eventId) {
    throw new Error('Event ID is required')
  }

  // Validate UUID format
  if (!validateUUID(eventId)) {
    throw new Error('Invalid event ID format. Expected UUID format.')
  }

  try {
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(`/api/admin/events/${eventId}/unpublish`, {
      method: 'POST',
      headers
    })

    return response
  } catch (error) {
    throw error
  }
}

// Fetch categories via server proxy
export async function fetchCategories() {
  try {
    // Use Nuxt server proxy for categories to avoid CORS issues
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }

    const response = await $fetch('/api/events/categories', {
      method: 'GET',
      headers,
    })

    return response
  } catch (error) {
    
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

// Check if event slug is available
export async function checkSlugAvailability(slug, currentEventId = null) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!slug) {
    throw new Error('Slug is required')
  }

  try {
    // Normalize the slug format
    const normalizedSlug = slug.toLowerCase().trim()
    
    // Add current event ID if we're editing (to ignore current event's slug)
    const queryParams = new URLSearchParams()
    if (currentEventId) {
      queryParams.append('current_event_id', currentEventId)
    }
    queryParams.append('slug', normalizedSlug)

    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(`/api/admin/events/check-slug?${queryParams}`, {
      method: 'GET',
      headers
    })

    return {
      success: true,
      isAvailable: response?.available ?? false,
      message: response?.message ?? 'Slug availability checked successfully'
    }
  } catch (error) {
    console.error('Slug check error:', error)
    
    // Return structured response for better error handling
    return {
      success: false,
      isAvailable: false,
      message: error.message || 'Failed to check slug availability'
    }
  }
}
// Fetch List organizer
export async function fetchEventOrganizers(eventId) {
  if (!eventId) {
    throw new Error('Event ID is required')
  }

  try {
    // Use Nuxt server API proxy to avoid CORS issues
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(`/api/admin/events/${eventId}/organizer`, {
      method: 'GET',
      headers
    })

    if (response && response.success && Array.isArray(response.data)) {
      return {
        status: 200,
        data: {
          success: true,
          data: response.data,
          message: response.message || 'Organizers retrieved successfully'
        }
      }
    } else {
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
    console.error('❌ Failed to fetch event organizers:', error)

    if (error.status === 401) {
      const { clearAuth } = useAuth()
      clearAuth()
      handleAuthRedirect()
      return {
        status: 401,
        data: { success: false, data: [], message: 'Session expired. Please login again.' }
      }
    }

    if (error.status === 404) {
      return {
        status: 404,
        data: { success: false, data: [], message: 'Event not found or no organizers assigned' }
      }
    }

    if (error.status === 403) {
      return {
        status: 403,
        data: { success: false, data: [], message: 'Access denied. Please check your permissions.' }
      }
    }

    return {
      status: error?.status || 500,
      data: { success: false, data: [], message: 'Failed to load team members. Please try again.' }
    }
  }
}

//fetch role permission from api
export const fetchOrganizerPermissions = async () => {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl
  try {
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }
    
    const response = await axios.get(`/api/admin/events/permission/organizer`, {
      method: 'GET',
      headers
    })
    return { status: response.status, data: response.data }
  } catch (error) {
    console.error('❌ API Error (fetchOrganizerPermissions):', error)
    return {
      status: error.response?.status || 500,
      data: error.response?.data || { success: false, message: error.message }
    }
  }
}

// composables/api.js
//seearch user
export const searchUsers = async (keyword) => {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!keyword || keyword.length < 1) {
    return []
  }

  try {
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }
    
    const response = await axios.get(
      `/api/admin/users/search`,
      {
        params: { keyword },
        method: 'GET',
        headers
      }
    )

    if (response.status === 200 && response.data.success) {
      return response.data.data
    }
    return []
  } catch (error) {
    console.error("❌ Failed to search users:", error)
    return []
  }
}


export const inviteUserAPI = async ({ eventId, selectedUsers, permissions, token }) => {
  if (!selectedUsers || selectedUsers.length === 0) {
    throw new Error('Please select at least one user')
  }

  const enabledRoles = Object.entries(permissions)
    .filter(([category, perm]) => perm.enabled)
    .map(([category, perm]) => ({
      role_name: category,
      permissions: perm.items
    }))

  if (enabledRoles.length === 0) {
    throw new Error('Please select at least one permission for the user')
  }

  const userIds = selectedUsers.map(u => u.id)
  const payload = {
    user_ids: userIds,
    roles: enabledRoles,
    note: selectedUsers[0]?.note || null

  }

  try {
    const config = useRuntimeConfig()
    const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl
    
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }

    const response = await axios.post(
      `/api/admin/events/${eventId}/organizer/invite/user`,
      payload,
      {
        method: 'POST',
        headers
      }
    )

    return response.data
  } catch (error) {
    console.error('❌ Invite API Error:', error)
    throw error
  }
}


export const fetchUserRoles = async ({ eventId, userId, token }) => {
  try {
    const config = useRuntimeConfig()
    const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl
    
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }

    const response = await axios.get(
      `/api/admin/events/${eventId}/organizer/${userId}/detail`,
      {
        method: 'GET',
        headers
      }
    )

    if (response.status === 200 && response.data.success) {
      return response.data.data
    } else {
      throw new Error(response.data.message || 'Failed to fetch user roles')
    }
  } catch (error) {
    console.error('❌ Fetch User Roles Error:', error)
    throw error
  }
}



export const updateOrganizerPermissions = async ({ eventId, userId, roles, token }) => {
  const url = `/api/admin/events/${eventId}/organizer/update`
  const headers = await createAuthHeaders()
  if (!headers) {
    throw new Error('Authentication required')
  }

  const { data, status } = await axios.post(
    url,
    {
      user_id: userId,
      roles
    },
    {
      method: 'POST',
      headers
    }
  )

  return { data, status }
}


export const disableEventOrganizer = async (eventId, userId, token) => {
  const config = useRuntimeConfig()
  
  const headers = await createAuthHeaders()
  if (!headers) {
    throw new Error('Authentication required')
  }
  
  return await axios.post(
    `/api/admin/events/${eventId}/organizer/disable`,
    { user_id: userId },
    {
      method: 'POST',
      headers
    }
  )
}

export const removeOrganizer = async ({ eventId, userId, token }) => {
  const config = useRuntimeConfig()
  
  const headers = await createAuthHeaders()
  if (!headers) {
    throw new Error('Authentication required')
  }
  
  return await axios.post(
    `/api/admin/events/${eventId}/organizer/remove`,
    { user_id: userId },
    {
      method: 'POST',
      headers
    }
  )
}

export const getEventDetail = async (eventId) => {
  try {
    const config = useRuntimeConfig()
    const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl
    
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }

    const response = await axios.get(
      `/api/admin/events/${eventId}`,
      { headers }
    )

    if (response.status === 200 && response.data.success) {
      return response.data.data
    } else {
      throw new Error(response.data.message || 'Failed to fetch event details')
    }
  } catch (error) {
    console.error('❌ Fetch Event Detail Error:', error)
    throw error
  }
}

// Create promotion (Buy X Get Y)
export async function createPromotion(eventId, promotionData) {
  if (!eventId) {
    throw new Error('Event ID is required')
  }

  if (!promotionData) {
    throw new Error('Promotion data is required')
  }

  // Validate UUID format
  if (!validateUUID(eventId)) {
    throw new Error('Invalid event ID format. Expected UUID format.')
  }

  try {
    const config = useRuntimeConfig()
    const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

    // Validate required fields
    const requiredFields = ['ticket_type_id', 'free_ticket_type_id', 'name', 'description', 'buy_quantity', 'free_quantity']
    const missingFields = requiredFields.filter(field => {
      const value = promotionData[field]
      return value === null || value === undefined || value === '' || 
             (typeof value === 'string' && value.trim() === '')
    })
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
    }

    // 📅 IMPORTANT: Ensure dates are in correct YYYY-MM-DD format for server  
    const formatDateForServer = (dateInput) => {
      if (!dateInput) return new Date().toISOString().split('T')[0]
      
      // If it's already a string in YYYY-MM-DD format, return as-is
      if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        return dateInput
      }
      
      // Convert Date object or other formats to YYYY-MM-DD
      const date = new Date(dateInput)
      if (isNaN(date.getTime())) {
        console.warn('⚠️ Invalid date in create API, using today:', dateInput)
        return new Date().toISOString().split('T')[0]
      }
      
      return date.toISOString().split('T')[0]
    }

    // Prepare promotion data according to API specification
    const requestData = {
      event_id: eventId,
      ticket_type_id: promotionData.ticket_type_id,
      free_ticket_type_id: promotionData.free_ticket_type_id,
      name: promotionData.name.trim(),
      description: promotionData.description.trim(),
      buy_quantity: parseInt(promotionData.buy_quantity),
      free_quantity: parseInt(promotionData.free_quantity),
      is_active: promotionData.is_active !== undefined ? promotionData.is_active : true,
      start_date: formatDateForServer(promotionData.start_date),
      end_date: formatDateForServer(promotionData.end_date)
    }

    // 📅 Validate dates
    const startDateObj = new Date(requestData.start_date)
    const endDateObj = new Date(requestData.end_date)
    
    if (endDateObj <= startDateObj) {
      throw new Error('End date must be after start date')
    }

    // Validate quantities
    if (isNaN(requestData.buy_quantity) || requestData.buy_quantity < 1) {
      throw new Error('Buy quantity must be at least 1')
    }
    if (isNaN(requestData.free_quantity) || requestData.free_quantity < 1) {
      throw new Error('Free quantity must be at least 1')
    }
    
    console.log('📅 Create - Formatted dates - Start:', requestData.start_date, 'End:', requestData.end_date)

    console.log('🎯 Creating promotion:', requestData)

    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(`/api/admin/promotions/events/${eventId}`, {
      method: 'POST',
      body: requestData,
      headers
    })

    console.log('✅ Promotion created successfully:', response)

    return {
      success: true,
      message: 'Promotion created successfully',
      data: response.data || response
    }
  } catch (error) {
    console.error('❌ Failed to create promotion:', error)
    
    // Handle specific error cases
    if (error.status === 422) {
      let detailedMessage = 'Validation failed:'
      if (error.data?.errors) {
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
      
      throw new Error(detailedMessage)
    }
    
    if (error.status === 404) {
      throw new Error('Event or ticket type not found')
    }
    
    if (error.status === 403) {
      throw new Error('You do not have permission to create promotions for this event')
    }
    
    throw new Error(error.message || 'Failed to create promotion')
  }
}

// Get promotions for an event
export async function getEventPromotions(eventId) {
  if (!eventId) {
    throw new Error('Event ID is required')
  }

  // Validate UUID format
  if (!validateUUID(eventId)) {
    throw new Error('Invalid event ID format. Expected UUID format.')
  }

  try {
    const config = useRuntimeConfig()
    const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(`/api/admin/promotions/events/${eventId}`, {
      method: 'GET',
      headers
    })

    return {
      success: true,
      data: response.data || response
    }
  } catch (error) {
    console.error('❌ Failed to fetch promotions:', error)
    
    if (error.status === 404) {
      return {
        success: true,
        data: []
      }
    }
    
    throw new Error(error.message || 'Failed to fetch promotions')
  }
}

// Update promotion
export async function updatePromotion(eventId, promotionId, promotionData) {
  if (!eventId || !promotionId) {
    throw new Error('Event ID and Promotion ID are required')
  }

  if (!validateUUID(eventId)) {
    throw new Error('Invalid event ID format. Expected UUID format.')
  }
  if (!validateUUID(promotionId)) {
    throw new Error('Invalid promotion ID format. Expected UUID format.')
  }

  try {
    const config = useRuntimeConfig()
    const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl
    const headers = await createAuthHeaders()
    if (!headers) throw new Error('Authentication required')

    // 🔑 Build requestData same as in createPromotion
    const requestData = {
      ticket_type_id: promotionData.ticket_type_id,
      free_ticket_type_id: promotionData.free_ticket_type_id,
      name: promotionData.name?.trim(),
      description: promotionData.description?.trim(),
      buy_quantity: parseInt(promotionData.buy_quantity),
      free_quantity: parseInt(promotionData.free_quantity),
      is_active: promotionData.is_active !== undefined ? promotionData.is_active : true,
      start_date: promotionData.start_date,
      end_date: promotionData.end_date
    }

    const response = await $fetch(`/api/admin/promotions/events/${eventId}/${promotionId}`, {
      method: 'PUT',
      headers,
      body: requestData
    })

    return {
      success: true,
      message: 'Promotion updated successfully',
      data: response.data || response
    }
  } catch (error) {
    console.error('❌ Failed to update promotion:', error)
    if (error.status === 404) {
      throw new Error('Promotion not found')
    }
    if (error.status === 403) {
      throw new Error('You do not have permission to update this promotion')
    }
    throw new Error(error.message || 'Failed to update promotion')
  }
}

export async function deletePromotion(eventId, promotionId) {
  if (!eventId || !promotionId) {
    throw new Error('Event ID and Promotion ID are required')
  }

  const headers = await createAuthHeaders()
  if (!headers) throw new Error('Authentication required')

  // Try multiple endpoint patterns for delete via server proxy
  const attempts = [
    // Try 1: DELETE to current endpoint
    {
      method: 'DELETE',
      url: `/api/admin/promotions/events/${eventId}/${promotionId}`,
      description: 'DELETE to /promotions/events/{eventId}/{promotionId}'
    },
    // Try 2: DELETE to alternative pattern
    {
      method: 'DELETE',
      url: `/api/admin/events/${eventId}/promotions/${promotionId}`,
      description: 'DELETE to /events/{eventId}/promotions/{promotionId}'
    },
    // Try 3: POST with _method=DELETE
    {
      method: 'POST',
      url: `/api/admin/promotions/events/${eventId}/${promotionId}`,
      description: 'POST with _method=DELETE to /promotions/events/{eventId}/{promotionId}',
      body: { _method: 'DELETE' }
    }
  ]

  let lastError = null
  
  for (const attempt of attempts) {
    try {
      console.log(`🗑️ Trying: ${attempt.description}`)
      
      const response = await $fetch(attempt.url, {
        method: attempt.method,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        ...(attempt.body && { body: attempt.body })
      })
      
      console.log(`✅ Delete success with: ${attempt.description}`)
      return {
        success: true,
        message: `Promotion deleted successfully using ${attempt.description}`,
        data: response.data || response
      }
      
    } catch (error) {
      console.log(`❌ Delete failed: ${attempt.description} - ${error.status} ${error.message}`)
      lastError = error
      
      // Continue trying other patterns
      continue
    }
  }
  
  // If all attempts failed
  console.error('❌ All delete attempts failed')
  throw new Error(`Delete failed. Last error: ${lastError?.message || 'Unknown error'}`)
}

// ============= VOUCHER/COUPON API FUNCTIONS =============

// Create voucher/coupon
export async function createCoupon(eventId, couponData) {
  if (!eventId) {
    throw new Error('Event ID is required')
  }

  if (!couponData) {
    throw new Error('Coupon data is required')
  }

  // Validate UUID format
  if (!validateUUID(eventId)) {
    throw new Error('Invalid event ID format')
  }

  try {
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }

    console.log('🎫 Creating coupon with data:', couponData)

    // Use server proxy route to avoid CORS issues
    const response = await $fetch('/api/admin/coupons/', {
      method: 'POST',
      headers,
      body: couponData
    })

    console.log('✅ Coupon created successfully:', response)

    return {
      success: true,
      data: response,
      message: 'Coupon created successfully'
    }
  } catch (error) {
    console.error('❌ Failed to create coupon:', error)
    
    let userMessage = 'Failed to create coupon. Please try again.'
    if (error.status === 400) {
      userMessage = 'Invalid coupon data. Please check your inputs.'
    } else if (error.status === 401) {
      userMessage = 'Authentication required. Please log in again.'
    } else if (error.status === 403) {
      userMessage = 'You don\'t have permission to create coupons.'
    } else if (error.status === 422) {
      // Handle validation errors
      if (error.data?.errors) {
        const errorMessages = []
        Object.entries(error.data.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            errorMessages.push(`${field}: ${messages.join(', ')}`)
          } else {
            errorMessages.push(`${field}: ${messages}`)
          }
        })
        userMessage = `Validation failed:\n${errorMessages.join('\n')}`
      } else if (error.data?.message) {
        userMessage = error.data.message
      }
    }

    throw new Error(userMessage)
  }
}

// Get coupons list for an event
export async function getCoupons(eventId) {
  if (!eventId) {
    throw new Error('Event ID is required')
  }

  // Validate UUID format
  if (!validateUUID(eventId)) {
    throw new Error('Invalid event ID format')
  }

  try {
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }

    console.log('🎫 Fetching coupons for event:', eventId)

    // Try multiple endpoint patterns to find the working one
    const attempts = [
      // Pattern 1: Query parameter approach
      {
        url: '/api/admin/coupons/',
        query: { event_id: eventId },
        description: 'GET /coupons/ with event_id query'
      },
      // Pattern 2: Path parameter approach
      {
        url: `/api/admin/coupons/event/${eventId}`,
        query: {},
        description: 'GET /coupons/event/{eventId}'
      },
      // Pattern 3: Events nested approach
      {
        url: `/api/admin/events/${eventId}/coupons`,
        query: {},
        description: 'GET /events/{eventId}/coupons'
      },
      // Pattern 4: Alternative query format
      {
        url: '/api/admin/coupons',
        query: { event_id: eventId },
        description: 'GET /coupons with event_id query (no trailing slash)'
      }
    ]

    let lastError = null

    for (const attempt of attempts) {
      try {
        console.log(`🔄 Trying: ${attempt.description}`)
        
        const response = await $fetch(attempt.url, {
          method: 'GET',
          headers,
          query: attempt.query
        })

        console.log(`✅ Success with: ${attempt.description}`, response)

        return {
          success: true,
          data: response.data || response,
          message: 'Coupons loaded successfully'
        }
      } catch (error) {
        console.warn(`❌ Failed: ${attempt.description} - ${error.status} ${error.message}`)
        lastError = error
        continue
      }
    }

    // If all attempts failed, check if it's a 404 (no coupons)
    if (lastError?.status === 404) {
      console.log('ℹ️ No coupons found (404), returning empty array')
      return {
        success: true,
        data: [],
        message: 'No coupons found for this event.'
      }
    }

    // If we get here, all attempts failed with non-404 errors
    throw lastError || new Error('All endpoint attempts failed')

  } catch (error) {
    console.error('❌ Failed to fetch coupons after all attempts:', error)
    
    let userMessage = 'Failed to load coupons. Please try again.'
    if (error.status === 401) {
      userMessage = 'Authentication required. Please log in again.'
    } else if (error.status === 403) {
      userMessage = 'You don\'t have permission to view coupons.'
    } else if (error.status === 404) {
      // Return empty array for 404 (no coupons found)
      return {
        success: true,
        data: [],
        message: 'No coupons found for this event.'
      }
    }

    return {
      success: false,
      data: [],
      message: userMessage
    }
  }
}
