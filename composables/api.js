// Auto-imported by Nuxt: useRuntimeConfig, $fetch
import axios from 'axios'
// Get fresh auth token with automatic refresh
const getAuthToken = async () => {
  try {
    const auth = useAuth()
    const { 
      getToken, 
      getRefreshToken,
      isTokenExpired, 
      isRefreshTokenExpired,
      shouldRefreshToken, 
      refreshToken, 
      clearAuth,
      isRefreshing 
    } = auth

    let token = getToken()

    // If no token exists, return null
    if (!token) {
      console.log('❌ No access token found')
      return null
    }

    // Check if refresh token is expired first
    if (isRefreshTokenExpired()) {
      console.log('❌ Refresh token expired, clearing auth')
      clearAuth()
      return null
    }

    // If token is expired, try to refresh it
    if (isTokenExpired()) {
      
      // Check if we have refresh token
      const refreshTokenValue = getRefreshToken()
      if (!refreshTokenValue) {
        console.log('❌ No refresh token available')
        clearAuth()
        return null
      }
      
      const refreshSuccess = await refreshToken()
      if (refreshSuccess) {
        token = getToken()
      } else {
        console.error('❌ Token refresh failed in API layer, clearing auth')
        clearAuth()
        return null
      }
    }
    // If token expires soon and not already refreshing, proactively refresh
    else if (shouldRefreshToken() && !isRefreshing.value) {
      console.log('⚠️ Token expires soon, proactively refreshing in API layer...')
      
      // For proactive refresh, don't wait - let it happen in background
      refreshToken().then(success => {
        if (success) {
        } else {
          console.warn('⚠️ Proactive token refresh failed in API layer')
        }
      }).catch(error => {
        console.error('❌ Proactive token refresh error in API layer:', error)
      })
    }

    return token
  } catch (error) {
    console.error('❌ Error getting auth token:', error)
    return null
  }
}


// Create authenticated fetch headers with automatic token refresh
const createAuthHeaders = async (includeContentType = true) => {
  const headers = {}

  if (includeContentType) {
    headers['Content-Type'] = 'application/json'
  }

  const token = await getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  } else {
    console.error('❌ No valid token available, redirecting to login')
    handleAuthRedirect()
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


// Refresh access token using refresh token
export async function refreshAccessToken(refreshToken) {
  const config = useRuntimeConfig()
  const API_BASE_URL = config.public.apiBaseUrl

  if (!API_BASE_URL) {
    throw new Error('API base URL is not configured.')
  }

  if (!refreshToken) {
    throw new Error('Refresh token is required')
  }

  try {
    
    // Create FormData to match the curl format: --form 'refresh_token="..."'
    const formData = new FormData()
    formData.append('refresh_token', refreshToken)

    const refreshUrl = normalizeApiUrl(API_BASE_URL, 'refresh-token')
    
    const response = await $fetch(refreshUrl, {
      method: 'POST',
      body: formData,
      // Don't include Authorization header for refresh token endpoint
    })


    // Debug the actual response structure

    // Handle different possible response structures
    let tokens = null
    
    if (response && response.tokens) {
      // Structure: { tokens: { access_token: "...", refresh_token: "..." } }
      tokens = response.tokens
    } else if (response && response.access_token) {
      // Structure: { access_token: "...", refresh_token: "..." }  
      tokens = response
    } else if (response && response.data && response.data.tokens) {
      // Structure: { data: { tokens: { access_token: "..." } } }
      tokens = response.data.tokens
    } else if (response && response.data && response.data.access_token) {
      // Structure: { data: { access_token: "..." } }
      tokens = response.data
    }

    if (!tokens || !tokens.access_token) {
      console.error('❌ Invalid refresh response structure:', {
        hasResponse: !!response,
        hasTokens: !!(response && response.tokens),
        hasAccessToken: !!(response && response.tokens && response.tokens.access_token),
        hasDirectAccessToken: !!(response && response.access_token),
        responseKeys: response ? Object.keys(response) : [],
        actualResponse: response
      })
      throw new Error('Invalid refresh response structure: missing access_token')
    }

    return {
      success: true,
      data: {
        tokens: tokens
      }
    }

  } catch (error) {
    console.error('❌ Refresh token API error:', error)
    
    // Enhanced error handling for refresh token specific errors
    if (error.status === 401) {
      throw new Error('Refresh token has expired. Please login again.')
    } else if (error.status === 422) {
      throw new Error('Invalid refresh token format. Please login again.')
    } else if (error.status === 429) {
      throw new Error('Too many refresh attempts. Please wait a moment and try again.')
    } else if (error.status === 500) {
      throw new Error('Server error during token refresh. Please try again later.')
    }
    
    // Don't expose technical details
    throw new Error(error.message || 'Failed to refresh access token. Please login again.')
  }
}


// Login API
export async function login(identifier, password) {
  const config = useRuntimeConfig()
  const API_BASE_URL = config.public.apiBaseUrl

  if (!API_BASE_URL) {
    throw new Error(`API base URL is not configured for ${process.env.NODE_ENV} environment.`)
  }

  try {

    const loginUrl = normalizeApiUrl(API_BASE_URL, 'login')

    const response = await $fetch(loginUrl, {
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
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl


  try {
    
    // Create headers with authenticated token using async refresh
    const headers = await createAuthHeaders()
    if (!headers) {
      console.log('❌ fetchEvents - No auth headers available')
      return { status: 401, data: { success: false, data: [], message: 'Authentication required' } }
    }


    const url = `${API_ADMIN_BASE_URL}/events`


    const response = await $fetch(url, {
      method: 'GET',
      headers
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
// Fetch user info
export async function fetchUserInfo() {
  const config = useRuntimeConfig()
  const API_BASE_URL = config.public.apiBaseUrl

  if (!API_BASE_URL) {
    throw new Error('API base URL is not configured.')
  }

  try {
    const userInfoUrl = normalizeApiUrl(API_BASE_URL, 'info')
    const headers = await createAuthHeaders()
    
    const response = await $fetch(userInfoUrl, {
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
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl
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
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${cleanUUID}`, {
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
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl
  
  // Use server proxy route to avoid CORS issues

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
    const optionalFields = ['map_url', 'company', 'organizer', 'online_link_meeting', 'chair_label']
    optionalFields.forEach(key => {
      if (eventData[key] !== null && eventData[key] !== undefined && eventData[key] !== '') {
        const value = eventData[key]?.trim()
        if (value) {
          formData.append(key, value)
        }
      }
    })
    
    // Add tags array if provided
    if (eventData.tags && Array.isArray(eventData.tags) && eventData.tags.length > 0) {
      const filteredTags = eventData.tags.filter(tag => tag && tag.trim().length > 0)
      if (filteredTags.length > 0) {
        filteredTags.forEach((tag, index) => {
          formData.append(`tags[${index}]`, tag.trim())
        })
      }
    }
    
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
    } else {
      // Explicitly signal image removal by sending empty string
      formData.append(`chairs[${index}][profile_image_url]`, '');
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
      const response = await $fetch(`${API_ADMIN_BASE_URL}/events`, {
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

      
      // Auto-assign creator as owner with all permissions (non-blocking)
      const eventId = response.data?.id || response.id
      if (eventId) {
        try {
          const ownerAssignment = await assignEventCreatorAsOwner(eventId)
          if (ownerAssignment.success) {
         
          } else {
            console.warn('⚠️ Failed to assign creator as owner:', ownerAssignment.message)
          }
        } catch (ownerError) {
          console.warn('⚠️ Non-blocking error in owner assignment:', ownerError)
          // Don't fail event creation due to owner assignment issues
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
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

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
        } else {
          // Explicitly signal image removal by sending empty string
          formData.append(`chairs[${index}][profile_image_url]`, '');
        }
      });
    }
  }
  break;

              case 'tags':
                // Handle tags array
                if (Array.isArray(value) && value.length > 0) {
                  const filteredTags = value.filter(tag => tag && tag.trim().length > 0);
                  if (filteredTags.length > 0) {
                    filteredTags.forEach((tag, index) => {
                      formData.append(`tags[${index}]`, tag.trim());
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
    
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}`, {
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
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

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
      tag: String(ticketData.tag || ticketData.description || '').trim(),
      is_active: ticketData.is_active !== undefined ? (ticketData.is_active ? 1 : 0) : 1,
      is_private: ticketData.is_private !== undefined ? (ticketData.is_private ? 1 : 0) : 0
    }

    // Validate required fields
    if (!normalizedData.name) throw new Error('Ticket name is required')
    if (isNaN(normalizedData.price) || normalizedData.price < 0) throw new Error('Price must be 0 or greater')
    if (isNaN(normalizedData.total) || normalizedData.total < 1) throw new Error('Quantity must be at least 1')
    
    
    // Use server proxy endpoint for ticket type update
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/ticket-types/${ticketTypeId}`, {
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
        is_active: 1, // Send as integer, not boolean
        is_private: ticket.is_private !== undefined ? (ticket.is_private ? 1 : 0) : 0 // Ensure proper boolean to integer conversion
      }
    })

    // Debug logging for is_private field in create
    console.log('🔧 createTicketTypes - Sending tickets:', normalizedTickets.map(ticket => ({
      name: ticket.name,
      is_active: ticket.is_active,
      is_private: ticket.is_private
    })))

    // Wrap tickets in proper structure that API expects
    const requestBody = {
      ticket_types: normalizedTickets
    }


    // Send tickets in proper structure to server proxy endpoint
    const serverUrl = `/api/admin/events/${eventId}/ticket-types`
    const headers = await createAuthHeaders()
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/ticket-types`, {
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

// Get event ticket types - UPDATED: Match exact API specification
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
    // API: GET /admin/events/:event_id/ticket-types
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/ticket-types`, {
      method: 'GET',
      headers
    })

    return response
  } catch (error) {
    console.error('❌ Failed to get ticket types:', error)
    throw error
  }
}

// Get single ticket type details - UPDATED: Match exact API specification
export async function getTicketTypeDetails(eventId, ticketTypeId) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!eventId || !ticketTypeId) {
    throw new Error('Event ID and Ticket Type ID are required')
  }

  if (!validateUUID(eventId)) {
    throw new Error('Invalid event ID format')
  }

  try {
    // API: GET /admin/events/:event_id/ticket-types/:ticket_type_id
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/ticket-types/${ticketTypeId}`, {
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
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}`, {
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
    // Use server proxy endpoint for ticket type deletion
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/ticket-types/${ticketTypeId}`, {
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

// Create agenda items
export async function createAgendaItems(eventId, agendaData) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!eventId || !agendaData) {
    throw new Error('Event ID and agenda data are required')
  }

  try {
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/agendas`, {
      method: 'POST',
      body: agendaData,
      headers
    })

    return response
  } catch (error) {
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
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/agendas/${agendaId}`, {
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

// Get event agenda
export async function getEventAgenda(eventId) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!eventId) {
    throw new Error('Event ID is required')
  }

  try {
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/agendas`, {
      method: 'GET',
      headers
    })

    return response
  } catch (error) {
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
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/agendas/${agendaId}`, {
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
      // Explicitly signal image removal by sending empty string
      formData.append(`chairs[${index}][profile_image_url]`, '');
    }
  }
})

    }
    
    const headers = await createAuthHeaders(false) // Don't include Content-Type for FormData
    if (!headers) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}`, {
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
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/unpublish`, {
      method: 'POST',
      headers
    })

    return response
  } catch (error) {
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
    
    // Use async headers with token refresh
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }

    const response = await $fetch(categoriesUrl, {
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
    
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/check-slug?${queryParams}`, {
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

// Fetch dashboard data
export async function fetchDashboardData() {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!API_ADMIN_BASE_URL) {
    console.error('❌ API Admin Base URL is not configured')
    throw new Error('API Admin Base URL is not configured')
  }

  try {
    const headers = await createAuthHeaders()
    if (!headers) {
      console.warn('⚠️ No auth headers available')
      handleAuthRedirect()
      return null
    }

    const url = normalizeApiUrl(API_ADMIN_BASE_URL, '/dashboard')
    
    
    const response = await $fetch(url, {
      headers,
      method: 'GET'
    })

    
    // Validate response structure
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid response format: not an object')
    }
    
    if (!response.success) {
      throw new Error(`API returned success=false: ${response.message || 'Unknown error'}`)
    }
    
    if (!response.data) {
      throw new Error('API response missing data field')
    }

    return response

  } catch (error) {
    console.error('❌ Dashboard data fetch failed:', error)
    
    if (error.status === 401 || error.statusCode === 401) {
      console.log('🔒 Authentication failed, redirecting to login')
      handleAuthRedirect()
      return null
    }
    
    // Enhanced error information
    const errorInfo = {
      message: error.message || 'Failed to fetch dashboard data',
      status: error.status || error.statusCode || 500,
      url: error.request?.responseURL || 'unknown',
      data: error.data || null
    }
    
    throw errorInfo
  }
}

// Fetch List organizer
export async function fetchEventOrganizers(eventId) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl
  if (!eventId) {
    throw new Error('Event ID is required')
  }

  try {
    // Build API URL using env base
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/organizer`, {
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
    
    const response = await axios.get(`${API_ADMIN_BASE_URL}/events/permission/organizer`, {
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
      `${API_ADMIN_BASE_URL}/users/search`,
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


export const inviteUserAPI = async ({ eventId, selectedUsers, permissions, hasPermissions, token }) => {
  if (!selectedUsers || selectedUsers.length === 0) {
    throw new Error('Please select at least one user')
  }

  // Allow empty roles for users who will be assigned permissions later
  let enabledRoles = []
  if (hasPermissions) {
    enabledRoles = Object.entries(permissions)
      .filter(([category, perm]) => perm.enabled)
      .map(([category, perm]) => ({
        role_name: category,
        permissions: perm.items
      }))
  }

  const userIds = selectedUsers.map(u => u.id)
  const payload = {
    user_ids: userIds,
    roles: enabledRoles, // Can be empty array
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
      `${API_ADMIN_BASE_URL}/events/${eventId}/organizer/invite/user`,
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
      `${API_ADMIN_BASE_URL}/events/${eventId}/organizer/${userId}/detail`,
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
  const url = `${useRuntimeConfig().public.apiAdminBaseUrl}/events/${eventId}/organizer/update`
  
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
    `${config.public.apiAdminBaseUrl}/events/${eventId}/organizer/disable`,
    { user_id: userId },
    {
      method: 'POST',
      headers
    }
  )
}

// Auto-assign event creator as owner with all permissions
export const assignEventCreatorAsOwner = async (eventId) => {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl
  
  try {
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }

    // Get all available permissions first
    const permissionsResponse = await fetchOrganizerPermissions()
    if (permissionsResponse.status !== 200 || !permissionsResponse.data.success) {
      throw new Error('Failed to fetch available permissions')
    }

    // Create owner role with all permissions
    const allPermissions = permissionsResponse.data.data
    const ownerRoles = Object.entries(allPermissions).map(([category, permissions]) => ({
      role_name: category,
      permissions: permissions
    }))

    const response = await axios.post(
      `${API_ADMIN_BASE_URL}/events/${eventId}/organizer/assign-creator-as-owner`,
      { roles: ownerRoles },
      { headers }
    )

    return response.data
  } catch (error) {
    console.error('❌ Failed to assign creator as owner:', error)
    // Don't throw error to prevent blocking event creation
    return { success: false, message: error.message }
  }
}

export const removeOrganizer = async ({ eventId, userId, token }) => {
  const config = useRuntimeConfig()
  
  const headers = await createAuthHeaders()
  if (!headers) {
    throw new Error('Authentication required')
  }
  
  return await axios.post(
    `${config.public.apiAdminBaseUrl}/events/${eventId}/organizer/remove`,
    { user_id: userId },
    {
      method: 'POST',
      headers
    }
  )
}

// Delete chair from event
export async function deleteChair(eventId, chairId) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!eventId) {
    throw new Error('Event ID is required')
  }

  if (!chairId) {
    throw new Error('Chair ID is required')
  }

  // Validate UUID format for event ID
  if (!validateUUID(eventId)) {
    throw new Error('Invalid event ID format. Expected UUID format.')
  }

  try {
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/chairs/${chairId}`, {
      method: 'DELETE',
      headers
    })

    return response
  } catch (error) {
    console.error('❌ Failed to delete chair:', error)
    
    // Enhanced error handling
    if (error.status === 404) {
      throw new Error('Chair not found or already deleted')
    } else if (error.status === 403) {
      throw new Error('You do not have permission to delete this chair')
    } else if (error.status === 409) {
      throw new Error('Cannot delete chair that is currently in use')
    }
    
    throw error
  }
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
      `${API_ADMIN_BASE_URL}/events/${eventId}`,
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

// Get event settings
export async function getEventSettings(eventId) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!eventId) {
    throw new Error('Event ID is required')
  }

  if (!validateUUID(eventId)) {
    throw new Error('Invalid event ID format')
  }

  try {
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/settings`, {
      method: 'GET',
      headers
    })

    return response
  } catch (error) {
    console.error('❌ Failed to get event settings:', error)
    
    // If settings don't exist (404), return default structure
    if (error.status === 404) {
      return {
        success: true,
        data: {
          registration_dateline: null,
          qrcode_available_hours: 48,
          max_ticket_per_person: 5,
          refund_policy_id: null,
          ticket_transfer_deadline: null,
          terms_and_condition: '',
          special_instructions: '',
          is_accept_cash_payment: 0,
          is_required_registration_before_checkin: 0,
          is_required_age_verification: 0,
          maximum_age: null,
          required_identity_document: [],
          provide_special_assistance: []
        }
      }
    }
    
    throw error
  }
}

// Create or update event settings
export async function saveEventSettings(eventId, settingsData) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!eventId) {
    throw new Error('Event ID is required')
  }

  if (!settingsData) {
    throw new Error('Settings data is required')
  }

  if (!validateUUID(eventId)) {
    throw new Error('Invalid event ID format')
  }

  try {
    // Validate and normalize settings data to match API specification
   // Build normalizedData
const normalizedData = {
  registration_dateline: settingsData.registration_dateline || settingsData.registrationDeadline || null,
  qrcode_available_hours: parseInt(settingsData.qrcode_available_hours || 48),
  max_ticket_per_person: parseInt(settingsData.max_ticket_per_person || 5),
  refund_policy_id: settingsData.refund_policy_id || (settingsData.refundPolicy === 'Full Refund' ? 1 : settingsData.refundPolicy === 'Not Refund' ? 2 : null),
  ticket_transfer_deadline: settingsData.ticket_transfer_deadline || null,
  is_allow_ticket_transfer: settingsData.is_allow_ticket_transfer !== undefined ? 
    (settingsData.is_allow_ticket_transfer ? 1 : 0) : 
    (settingsData.allowTicketTransfer ? 1 : 0),
  is_required_terms_condition: settingsData.is_required_terms_condition !== undefined ? 
    (settingsData.is_required_terms_condition ? 1 : 0) : 
    (settingsData.requireTermsConditions ? 1 : 0),
  terms_and_condition: settingsData.terms_and_condition || settingsData.termsAndConditions || '',
  is_accept_cash_payment: settingsData.is_accept_cash_payment !== undefined ? 
    (settingsData.is_accept_cash_payment ? 1 : 0) : 
    (settingsData.acceptCashPayment ? 1 : 0),
  is_required_registration_before_checkin: settingsData.is_required_registration_before_checkin !== undefined ? 
    (settingsData.is_required_registration_before_checkin ? 1 : 0) : 
    (settingsData.requireRegistrationBeforeCheckin ? 1 : 0),
  is_required_age_verification: settingsData.is_required_age_verification !== undefined ? 
    (settingsData.is_required_age_verification ? 1 : 0) : 
    (settingsData.requireAgeVerification ? 1 : 0),
  maximum_age: settingsData.maximum_age || (settingsData.minimumAge ? parseInt(settingsData.minimumAge.replace(/\D/g, '')) : null)
}

// ✅ Fix required_identity_document handling here - send as array
if (Array.isArray(settingsData.required_identity_document)) {
  normalizedData.required_identity_document = settingsData.required_identity_document
    .filter(doc => ['driver_license', 'national_id_card', 'passport', 'student_card'].includes(doc))
} else if (Array.isArray(settingsData.requiredIdentityDocuments)) {
  normalizedData.required_identity_document = settingsData.requiredIdentityDocuments
    .filter(doc => ['driver_license', 'national_id_card', 'passport', 'student_card'].includes(doc))
} else if (typeof settingsData.required_identity_document === 'string' && settingsData.required_identity_document.trim()) {
  // Handle comma-separated string input
  normalizedData.required_identity_document = settingsData.required_identity_document
    .split(',')
    .map(doc => doc.trim())
    .filter(doc => ['driver_license', 'national_id_card', 'passport', 'student_card'].includes(doc))
} else {
  normalizedData.required_identity_document = []
}

// ✅ Fix provide_special_assistance handling here - send as array
if (Array.isArray(settingsData.provide_special_assistance)) {
  normalizedData.provide_special_assistance = settingsData.provide_special_assistance
    .filter(assistance => ['wheelchair', 'pregnancy', 'family_with_kids', 'disability'].includes(assistance))
} else if (Array.isArray(settingsData.provideSpecialAssistance)) {
  normalizedData.provide_special_assistance = settingsData.provideSpecialAssistance
    .filter(assistance => ['wheelchair', 'pregnancy', 'family_with_kids', 'disability'].includes(assistance))
} else if (typeof settingsData.provide_special_assistance === 'string' && settingsData.provide_special_assistance.trim()) {
  // Handle comma-separated string input
  normalizedData.provide_special_assistance = settingsData.provide_special_assistance
    .split(',')
    .map(assistance => assistance.trim())
    .filter(assistance => ['wheelchair', 'pregnancy', 'family_with_kids', 'disability'].includes(assistance))
} else {
  normalizedData.provide_special_assistance = []
}

    // Email and SMS reminder fields
    normalizedData.is_send_email_reminder = settingsData.is_send_email_reminder !== undefined ? 
      (settingsData.is_send_email_reminder ? 1 : 0) : 
      (settingsData.isSendEmailReminder ? 1 : 0);
    
    normalizedData.email_reminder_date = settingsData.email_reminder_date || settingsData.emailReminderDate || null;
    
    normalizedData.is_send_sms_reminder = settingsData.is_send_sms_reminder !== undefined ? 
      (settingsData.is_send_sms_reminder ? 1 : 0) : 
      (settingsData.isSendSmsReminder ? 1 : 0);
    
    normalizedData.sms_reminder_date = settingsData.sms_reminder_date || settingsData.smsReminderDate || null;

    // Ensure maximum_age is null when age verification is disabled
    if (normalizedData.is_required_age_verification === 0) {
      normalizedData.maximum_age = null
    }

    // Format dates properly for API
    if (normalizedData.registration_dateline) {
      if (normalizedData.registration_dateline instanceof Date) {
        normalizedData.registration_dateline = normalizedData.registration_dateline.toISOString().slice(0, 19).replace('T', ' ')
      }
    }

    if (normalizedData.ticket_transfer_deadline) {
      if (normalizedData.ticket_transfer_deadline instanceof Date) {
        normalizedData.ticket_transfer_deadline = normalizedData.ticket_transfer_deadline.toISOString().slice(0, 19).replace('T', ' ')
      }
    }

    // Format email reminder date properly for API
    if (normalizedData.email_reminder_date) {
      if (normalizedData.email_reminder_date instanceof Date) {
        normalizedData.email_reminder_date = normalizedData.email_reminder_date.toISOString().slice(0, 19).replace('T', ' ')
      }
    }

    // Format SMS reminder date properly for API
    if (normalizedData.sms_reminder_date) {
      if (normalizedData.sms_reminder_date instanceof Date) {
        normalizedData.sms_reminder_date = normalizedData.sms_reminder_date.toISOString().slice(0, 19).replace('T', ' ')
      }
    }



    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }

    // Debug: Log the normalized data being sent to API
    console.log('🔍 API normalizedData being sent:', normalizedData);
    console.log('📧 Email reminder in normalizedData:', {
      is_send_email_reminder: normalizedData.is_send_email_reminder,
      email_reminder_date: normalizedData.email_reminder_date
    });
    console.log('📱 SMS reminder in normalizedData:', {
      is_send_sms_reminder: normalizedData.is_send_sms_reminder,
      sms_reminder_date: normalizedData.sms_reminder_date
    });
    
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/settings`, {
      method: 'POST',
      body: normalizedData,
      headers
    })


    return response
  } catch (error) {
    console.error('❌ Failed to save event settings:', error)
    
    // Enhanced error handling
    if (error.status === 422) {
      let detailedMessage = 'Settings validation failed:'
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
        detailedMessage = `Settings validation failed:\n${errorMessages.join('\n')}`
      } else if (error.data?.message) {
        detailedMessage = error.data.message
      }
      
      throw new Error(detailedMessage)
    }
    
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
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(`${API_ADMIN_BASE_URL}/promotions/events/${eventId}`, {
      method: 'POST',
      body: requestData,
      headers
    })


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
    
    const response = await $fetch(`${API_ADMIN_BASE_URL}/promotions/events/${eventId}`, {
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

    const response = await $fetch(`${API_ADMIN_BASE_URL}/promotions/events/${eventId}/${promotionId}`, {
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
// ============= PROMOTION API FUNCTIONS =============
// Delete promotion
export async function deletePromotion(eventId, promotionId) {
  if (!eventId || !promotionId) {
    throw new Error('Event ID and Promotion ID are required')
  }

  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl
  const headers = await createAuthHeaders()
  if (!headers) throw new Error('Authentication required')

  try {
    const response = await $fetch(
      `${API_ADMIN_BASE_URL}/events/${eventId}/promotions/${promotionId}`,
      {
        method: 'DELETE',
        headers
      }
    )


    return {
      success: true,
      message: 'Promotion deleted successfully',
      data: response.data || response
    }
  } catch (error) {
    console.error('❌ Failed to delete promotion:', error)

    let userMessage = 'Failed to delete promotion. Please try again.'
    if (error.status === 401) {
      userMessage = 'Authentication required. Please log in again.'
    } else if (error.status === 403) {
      userMessage = 'You don’t have permission to delete promotions.'
    } else if (error.status === 404) {
      userMessage = 'Promotion not found.'
    }

    throw new Error(userMessage)
  }
}

// ============= VOUCHER/COUPON API FUNCTIONS =============

// Create voucher/coupon
export async function createCoupon(eventId, couponData) {
  if (!eventId) throw new Error('Event ID is required')
  if (!couponData) throw new Error('Coupon data is required')
  if (!validateUUID(eventId)) throw new Error('Invalid event ID format')

  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  try {
    const headers = await createAuthHeaders()
    if (!headers) throw new Error('Authentication required')

    const response = await $fetch(`${API_ADMIN_BASE_URL}/coupons`, {
      method: 'POST',
      headers,
      body: couponData
    })

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
      userMessage = 'You don’t have permission to create coupons.'
    } else if (error.status === 422) {
      if (error.data?.errors) {
        const errorMessages = []
        Object.entries(error.data.errors).forEach(([field, messages]) => {
          errorMessages.push(`${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
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
  if (!eventId) throw new Error('Event ID is required')
  if (!validateUUID(eventId)) throw new Error('Invalid event ID format')

  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  try {
    const headers = await createAuthHeaders()
    if (!headers) throw new Error('Authentication required')


    const response = await $fetch(`${API_ADMIN_BASE_URL}/coupons?event_id=${eventId}`, {
      method: 'GET',
      headers
    })



    return {
      success: true,
      data: response.data || response,
      message: 'Coupons loaded successfully'
    }
  } catch (error) {
    console.error('❌ Failed to fetch coupons:', error)

    if (error.status === 404) {
      return {
        success: true,
        data: [],
        message: 'No coupons found for this event.'
      }
    }

    let userMessage = 'Failed to load coupons. Please try again.'
    if (error.status === 401) {
      userMessage = 'Authentication required. Please log in again.'
    } else if (error.status === 403) {
      userMessage = 'You don’t have permission to view coupons.'
    }

    return {
      success: false,
      data: [],
      message: userMessage
    }
  }
}

// Update voucher/coupon
export async function updateCoupon(couponId, couponData) {
  if (!couponId) throw new Error('Coupon ID is required')
  if (!couponData) throw new Error('Coupon data is required')

  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  try {
    const headers = await createAuthHeaders()
    if (!headers) throw new Error('Authentication required')



    const response = await $fetch(`${API_ADMIN_BASE_URL}/coupons/${couponId}`, {
      method: 'PUT',
      headers,
      body: couponData
    })



    return {
      success: true,
      data: response,
      message: 'Voucher updated successfully'
    }
  } catch (error) {
    console.error('❌ Failed to update coupon:', error)

    let userMessage = 'Failed to update voucher. Please try again.'
    if (error.status === 400) {
      userMessage = 'Invalid voucher data. Please check your inputs.'
    } else if (error.status === 401) {
      userMessage = 'Authentication required. Please log in again.'
    } else if (error.status === 403) {
      userMessage = 'You don\'t have permission to update vouchers.'
    } else if (error.status === 404) {
      userMessage = 'Voucher not found. It may have been deleted.'
    } else if (error.status === 422) {
      if (error.data?.errors) {
        const errorMessages = []
        Object.entries(error.data.errors).forEach(([field, messages]) => {
          errorMessages.push(`${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
        })
        userMessage = `Validation failed:\n${errorMessages.join('\n')}`
      } else if (error.data?.message) {
        userMessage = error.data.message
      }
    }

    throw new Error(userMessage)
  }
}

// Delete voucher/coupon
export async function deleteCoupon(couponId) {
  if (!couponId) throw new Error('Coupon ID is required')

  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  try {
    const headers = await createAuthHeaders()
    if (!headers) throw new Error('Authentication required')


    const response = await $fetch(`${API_ADMIN_BASE_URL}/coupons/${couponId}`, {
      method: 'DELETE',
      headers
    })


    return {
      success: true,
      data: response,
      message: 'Voucher deleted successfully'
    }
  } catch (error) {
    console.error('❌ Failed to delete coupon:', error)

    let userMessage = 'Failed to delete voucher. Please try again.'
    if (error.status === 401) {
      userMessage = 'Authentication required. Please log in again.'
    } else if (error.status === 403) {
      userMessage = 'You don\'t have permission to delete vouchers.'
    } else if (error.status === 404) {
      userMessage = 'Voucher not found. It may have already been deleted.'
    } else if (error.status === 409) {
      userMessage = 'Cannot delete voucher as it has been used by customers.'
    }

    throw new Error(userMessage)
  }
}

// Search check-ins for identity verification
export async function searchCheckIns(searchParams, page = 1, perPage = 20) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!searchParams || typeof searchParams !== 'object') {
    throw new Error('Search parameters are required')
  }

  try {
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }

    // Build query parameters
    const queryParams = new URLSearchParams()
    
    if (searchParams.phone_number) queryParams.append('phone_number', searchParams.phone_number)
    if (searchParams.email) queryParams.append('email', searchParams.email)
    if (searchParams.ticket_no) queryParams.append('ticket_no', searchParams.ticket_no)
    if (searchParams.order_number) queryParams.append('order_number', searchParams.order_number)
    
    // Add pagination parameters
    queryParams.append('page', page.toString())
    queryParams.append('per_page', perPage.toString())

    const response = await $fetch(`${API_ADMIN_BASE_URL}/check-ins?${queryParams.toString()}`, {
      method: 'GET',
      headers
    })


    // Ensure consistent response structure with pagination
    if (response && response.data && Array.isArray(response.data)) {
      return {
        success: true,
        data: response.data,
        meta: response.meta || {
          current_page: 1,
          last_page: 1,
          per_page: perPage,
          total: response.data.length
        },
        message: 'Check-ins retrieved successfully'
      }
    } else if (response && Array.isArray(response)) {
      return {
        success: true,
        data: response,
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: perPage,
          total: response.length
        },
        message: 'Check-ins retrieved successfully'
      }
    } else {
      return {
        success: false,
        data: [],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: perPage,
          total: 0
        },
        message: 'No check-ins found'
      }
    }

  } catch (error) {
    console.error('❌ Failed to search check-ins:', error)
    
    // Handle authentication errors
    if (error.status === 401) {
      handleAuthRedirect()
      throw new Error('Authentication required. Please log in again.')
    }
    
    if (error.status === 403) {
      throw new Error('You do not have permission to access check-ins.')
    }
    
    // Handle validation errors
    if (error.status === 422) {
      throw new Error('Invalid search parameters. Please check your input and try again.')
    }
    
    // Handle not found
    if (error.status === 404) {
      return {
        success: false,
        data: [],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: perPage,
          total: 0
        },
        message: 'No tickets found matching your search criteria.'
      }
    }
    
    // Don't expose technical details to users
    let userMessage = 'Failed to search check-ins. Please try again.'
    if (error.status >= 500) {
      userMessage = 'Server error. Please try again later.'
    }
    
    throw new Error(userMessage)
  }
}

// Assign ticket to a holder
export async function assignTicket(assignmentId, formData) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!assignmentId) {
    throw new Error('Assignment ID is required')
  }

  if (!formData || typeof formData !== 'object') {
    throw new Error('Form data is required')
  }

  try {
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }

    // Create FormData for the request
    const requestFormData = new FormData()
    
    // Add required fields to FormData
    if (formData.name) {
      requestFormData.append('name', formData.name.trim())
    }
    if (formData.email) {
      requestFormData.append('email', formData.email.trim())
    }
    if (formData.phone_number) {
      requestFormData.append('phone_number', formData.phone_number.trim())
    }

    // Optional fields
    if (formData.id_card_no) {
      requestFormData.append('id_card_no', formData.id_card_no.trim())
    }
    if (formData.passport_no) {
      requestFormData.append('passport_no', formData.passport_no.trim())
    }



    // Remove Content-Type from headers to let browser set it for FormData
    const formDataHeaders = { ...headers }
    delete formDataHeaders['Content-Type']

    const response = await $fetch(`${API_ADMIN_BASE_URL}/check-ins/${assignmentId}/assign`, {
      method: 'POST',
      body: requestFormData,
      headers: formDataHeaders
    })


    return {
      success: true,
      data: response.data || response,
      message: response.message || 'Ticket assigned successfully'
    }

  } catch (error) {
    console.error('❌ Failed to assign ticket:', error)
    
    // Handle authentication errors
    if (error.status === 401) {
      handleAuthRedirect()
      throw new Error('Authentication required. Please log in again.')
    }
    
    if (error.status === 403) {
      throw new Error('You do not have permission to assign tickets.')
    }
    
    // Handle validation errors
    if (error.status === 422) {
      let errorMessage = 'Invalid form data. Please check your input and try again.'
      
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
    
    // Handle not found
    if (error.status === 404) {
      throw new Error('Ticket not found or assignment ID is invalid.')
    }
    
    // Handle conflict (already assigned)
    if (error.status === 409) {
      throw new Error('This ticket has already been assigned to someone else.')
    }
    
    // Don't expose technical details to users
    let userMessage = 'Failed to assign ticket. Please try again.'
    if (error.status >= 500) {
      userMessage = 'Server error. Please try again later.'
    }
    
    throw new Error(userMessage)
  }
}

// Fetch orders with pagination and filters
export async function fetchOrders(params = {}) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  try {
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }

    // Build query parameters
    const queryParams = new URLSearchParams()
    
    // Default pagination
    queryParams.append('per_page', params.per_page || '10')
    queryParams.append('page', params.page || '1')
    
    // Optional filters
    if (params.event_id) queryParams.append('event_id', params.event_id)
    if (params.status) queryParams.append('status', params.status)
    if (params.search) queryParams.append('search', params.search)

    const response = await $fetch(`${API_ADMIN_BASE_URL}/orders?${queryParams.toString()}`, {
      method: 'GET',
      headers
    })

    // Ensure consistent response structure
    if (response && response.success) {
      return {
        success: true,
        data: response.data || [],
        pagination: response.pagination || null,
        links: response.links || null,
        meta: response.meta || null,
        message: response.message || 'Orders retrieved successfully'
      }
    } else {
      return {
        success: false,
        data: [],
        message: 'No orders found'
      }
    }

  } catch (error) {
    console.error('❌ Failed to fetch orders:', error)
    
    // Handle authentication errors
    if (error.status === 401) {
      handleAuthRedirect()
      throw new Error('Authentication required. Please log in again.')
    }
    
    if (error.status === 403) {
      throw new Error('You do not have permission to access orders.')
    }
    
    // Handle not found
    if (error.status === 404) {
      return {
        success: false,
        data: [],
        message: 'No orders found matching your criteria.'
      }
    }
    
    // Don't expose technical details to users
    let userMessage = 'Failed to load orders. Please try again.'
    if (error.status >= 500) {
      userMessage = 'Server error. Please try again later.'
    }
    
    throw new Error(userMessage)
  }
}

// Create order reservation (for customer booking)
export async function createOrderReservation(orderData) {
  const config = useRuntimeConfig()
  // Use the ticket API endpoint for order operations
  const API_BASE_URL = config.public.apiTicketBaseUrl
  if (!API_BASE_URL) {
    throw new Error('API base URL is not configured')
  }

  if (!orderData) {
    throw new Error('Order data is required')
  }

  // Validate required fields
  if (!orderData.event_id) {
    throw new Error('Event ID is required')
  }

  if (!orderData.ticket_types || !Array.isArray(orderData.ticket_types) || orderData.ticket_types.length === 0) {
    throw new Error('At least one ticket type is required')
  }

  if (!orderData.payment_method) {
    throw new Error('Payment method is required')
  }

  // Validate payment method is one of the allowed values
  const allowedPaymentMethods = ['offline', 'abapay']
  if (!allowedPaymentMethods.includes(orderData.payment_method)) {
    throw new Error('Payment method must be either "offline" or "abapay"')
  }

  // Validate transaction ID for abapay
  if (orderData.payment_method === 'abapay' && (!orderData.transaction_id || !orderData.transaction_id.toString().trim())) {
    throw new Error('Transaction ID is required for ABA Pay payments')
  }

  // Ensure either phone_number or email is provided (for customer identification)
  if (!orderData.phone_number && !orderData.email) {
    throw new Error('Either phone number or email is required for customer identification')
  }

  if (!orderData.full_name) {
    throw new Error('Full name is required')
  }

  // Validate customer_id if provided (to avoid user confusion)
  if (orderData.customer_id && !validateUUID(orderData.customer_id)) {
    throw new Error('Invalid customer ID format')
  }

  try {
    // Format phone number to 855 format if provided
    let formattedPhone = null
    if (orderData.phone_number) {
      // Remove any non-digit characters first
      let cleanPhone = orderData.phone_number.replace(/\D/g, '')
      
      // Convert to 855 format
      if (cleanPhone.startsWith('855')) {
        // Already in correct format, don't add another 855
        formattedPhone = cleanPhone
      } else if (cleanPhone.startsWith('0')) {
        // Remove leading 0 and add 855
        formattedPhone = '855' + cleanPhone.substring(1)
      } else if (cleanPhone.length >= 8 && cleanPhone.length <= 9 && !cleanPhone.startsWith('855')) {
        // Assume it's a local number, add 855 only if it doesn't already start with 855
        formattedPhone = '855' + cleanPhone
      } else {
        // Use as is if doesn't match expected formats
        formattedPhone = cleanPhone
      }
      
    }
    
    const payload = {
      event_id: orderData.event_id, // CRITICAL: Include event_id
      coupon: orderData.coupon || null,
      ticket_types: orderData.ticket_types.map(ticket => ({
        ticket_type_id: ticket.ticket_type_id,
        quantity: ticket.quantity
      })),
      payment_method: orderData.payment_method,
      phone_number: formattedPhone,
      email: orderData.email || null,
      full_name: orderData.full_name,
      customer_id: orderData.customer_id || null // Always include customer_id field
    }

    // FIXED: Only include transaction_id field if payment method is abapay
    if (orderData.payment_method === 'abapay') {
      payload.transaction_id = orderData.transaction_id || null
    }
    // For offline payments, completely omit the transaction_id field

    // Try to include authentication headers - API now requires auth
    const headers = await createAuthHeaders()
    
    const response = await $fetch(`${API_BASE_URL}/orders/reserve`, {
      method: 'POST',
      headers: headers,
      body: payload
    })


    // Validate reservation response
    if (!response.success) {
      throw new Error(response.message || 'Order reservation failed')
    }

    const reservationData = response.data || response
    const orderId = reservationData.id || response.id
    const customerId = reservationData.customer_id || response.customer_id

    if (!orderId) {
      console.error('❌ No order ID in reservation response:', response)
      throw new Error('Invalid reservation response: missing order ID')
    }


    return {
      success: true,
      data: reservationData,
      message: response.message || 'Order reservation created successfully',
      order_id: orderId,
      customer_id: customerId
    }
  } catch (error) {
    console.error('❌ Failed to create order reservation:', error)

    // Handle authentication errors  
    if (error.status === 401) {
      throw new Error('Authentication required. Please log in again.')
    }
    
    if (error.status === 403) {
      throw new Error('You do not have permission to create orders.')
    }
    
    // Handle validation errors
    if (error.status === 422) {
      let errorMessage = 'Invalid order data. Please check your information.'
      
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
    
    // Handle not found
    if (error.status === 404) {
      throw new Error('Event or ticket type not found.')
    }
    
    // Handle insufficient inventory
    if (error.status === 400 && error.data?.message?.includes('insufficient')) {
      throw new Error(error.data.message)
    }

    // Don't expose technical details to users
    let userMessage = 'Failed to create order reservation. Please try again.'
    if (error?.data?.message) {
      userMessage = error.data.message
    } else if (error?.message) {
      userMessage = error.message
    }
    
    if (error.status >= 500) {
      userMessage = 'Server error. Please try again later.'
    }
    
    throw new Error(userMessage)
  }
}

// Check if customer exists and return customer details including customer_id
export async function checkCustomerExists(identifier, loginType = 'phone') {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!API_ADMIN_BASE_URL) {
    throw new Error('API base URL is not configured')
  }

  if (!identifier || !identifier.trim()) {
    throw new Error('Phone number or email is required')
  }

  // Determine type based on loginType parameter
  const type = loginType === 'email' ? 'email' : 'phone_number'
  let value = identifier.trim()
  
  // Format phone number to 855 format if it's a phone number
  if (type === 'phone_number') {
    // Remove any non-digit characters first
    value = value.replace(/\D/g, '')
    
    // Convert to 855 format
    if (value.startsWith('855')) {
      // Already in correct format, don't add another 855
      value = value
    } else if (value.startsWith('0')) {
      // Remove leading 0 and add 855
      value = '855' + value.substring(1)
    } else if (value.length >= 8 && value.length <= 9 && !value.startsWith('855')) {
      // Assume it's a local number, add 855 only if it doesn't already start with 855
      value = '855' + value
    }

  }

  try {
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Failed to create authentication headers')
    }

    const response = await $fetch(`${API_ADMIN_BASE_URL}/orders/check-user-info`, {
      method: 'POST',
      headers,
      body: {
        type,
        value
      }
    })


    // Check if user was found - API returns success: true but data could be empty array or null
    if (response.success && response.data && Array.isArray(response.data) && response.data.length > 0) {
      // User found - data array contains user info
      const userInfo = response.data[0]; // Get first user from array
      const userData = {
        exists: true,
        customer_id: userInfo.id, // Map id to customer_id
        id: userInfo.id,
        name: userInfo.name,
        full_name: userInfo.name,
        email: userInfo.email,
        phone_number: userInfo.phone_number,
        identifier: identifier,
        loginType: loginType,
        userData: userInfo, // Include complete user data
        originalResponse: response // Include full API response for debugging
      }

      return userData
    } else if (response.success && response.data && !Array.isArray(response.data) && typeof response.data === 'object') {
      // Handle case where data is directly an object (not array)
      const userData = {
        exists: true,
        customer_id: response.data.id, // Map id to customer_id
        id: response.data.id,
        name: response.data.name,
        full_name: response.data.name,
        email: response.data.email,
        phone_number: response.data.phone_number,
        identifier: identifier,
        loginType: loginType,
        userData: response.data, // Include complete user data
        originalResponse: response // Include full API response for debugging
      }
      return userData
    } else {
      // User not found - API returns success: true but empty data array or message indicates not found
      console.log('❌ User not found - API response:', response)
      return {
        exists: false,
        customer_id: null,
        full_name: null,
        phone_number: loginType === 'phone' ? identifier : null,
        email: loginType === 'email' ? identifier : null,
        identifier: identifier,
        loginType: loginType,
        message: response.message || 'User not found'
      }
    }
  } catch (error) {
    console.error('❌ Error checking user info:', error)
    
    // Handle specific error cases
    if (error.status === 404 || error.statusCode === 404) {
      return {
        exists: false,
        customer_id: null,
        full_name: null,
        phone_number: loginType === 'phone' ? identifier : null,
        email: loginType === 'email' ? identifier : null,
        identifier: identifier,
        loginType: loginType,
        message: 'User not found'
      }
    }
    
    if (error.status === 401 || error.statusCode === 401) {
      handleAuthRedirect()
      throw new Error('Authentication required. Please log in again.')
    }
    
    throw new Error(error.message || 'Failed to check user information')
  }
}

// Reset password for existing customer
export async function resetPassword(identifier, newPassword, confirmPassword) {
  const config = useRuntimeConfig()
  // Use the gateway API endpoint for authentication operations
  const API_BASE_URL = config.public.apiBaseUrl

  if (!API_BASE_URL) {
    throw new Error('API base URL is not configured')
  }

  if (!identifier) {
    throw new Error('Identifier is required')
  }

  if (!newPassword) {
    throw new Error('New password is required')
  }

  if (!confirmPassword) {
    throw new Error('Password confirmation is required')
  }

  if (newPassword !== confirmPassword) {
    throw new Error('Passwords do not match')
  }

  if (newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters long')
  }

  try {
    const url = normalizeApiUrl(API_BASE_URL, '/reset-password')
    
    // Create form data as expected by the API
    const formData = new FormData()
    formData.append('identifier', identifier)
    formData.append('new_password', newPassword)
    formData.append('new_password_confirmation', confirmPassword)
    const response = await $fetch(url, {
      method: 'POST',
      body: formData
    })

    return {
      success: true,
      message: response.message || 'Password reset successfully',
      data: response.data || null
    }

  } catch (error) {
    console.error('❌ Reset password failed:', error)

    // Handle different error types
    if (error.response?.status === 404) {
      throw new Error('Customer not found')
    } else if (error.response?.status === 422) {
      const validationErrors = error.response.data?.errors || {}
      const errorMessages = Object.values(validationErrors).flat()
      throw new Error(errorMessages.join(', ') || 'Validation failed')
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'Invalid request')
    } else {
      throw new Error(error.response?.data?.message || error.message || 'Reset password failed')
    }
  }
}

// Reset password with authentication token (for authenticated reset flow)
export async function resetPasswordWithToken(identifier, newPassword, confirmPassword, idToken) {
  const config = useRuntimeConfig()
  // Use the gateway API endpoint for authentication operations
  const API_BASE_URL = config.public.apiBaseUrl

  if (!API_BASE_URL) {
    throw new Error('API base URL is not configured')
  }

  if (!identifier) {
    throw new Error('Identifier is required')
  }

  if (!newPassword) {
    throw new Error('New password is required')
  }

  if (!confirmPassword) {
    throw new Error('Password confirmation is required')
  }

  if (!idToken) {
    throw new Error('Authentication token is required')
  }

  if (newPassword !== confirmPassword) {
    throw new Error('Passwords do not match')
  }

  if (newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters long')
  }

  try {
    const url = normalizeApiUrl(API_BASE_URL, '/reset-password')
    
    // Create form data as expected by the API
    const formData = new FormData()
    formData.append('identifier', identifier)
    formData.append('new_password', newPassword)
    formData.append('new_password_confirmation', confirmPassword)


    const response = await $fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`
      },
      body: formData
    })


    return {
      success: true,
      message: response.message || 'Password reset successfully',
      data: response.data || null
    }

  } catch (error) {
    console.error('❌ Authenticated reset password failed:', error)

    // Handle different error types
    if (error.response?.status === 404) {
      throw new Error('Customer not found')
    } else if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please verify your identity again.')
    } else if (error.response?.status === 400) {
      const message = error.response?.data?.message || error.data?.message || 'Invalid request'
      throw new Error(message)
    } else if (error.response?.status === 422) {
      const errors = error.response?.data?.errors || error.data?.errors
      if (errors) {
        const firstError = Object.values(errors)[0]
        throw new Error(Array.isArray(firstError) ? firstError[0] : firstError)
      }
      throw new Error('Validation failed')
    }

    throw new Error(error.message || 'Reset password failed. Please try again.')
  }
}

// Fetch upcoming events with start date parameter
export async function fetchUpcomingEvents(selectedDate = null) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!API_ADMIN_BASE_URL) {
    throw new Error('API admin base URL is not configured.')
  }

  try {
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Unable to create authentication headers')
    }

    // Use provided selectedDate or default to today
    const dateToUse = selectedDate || new Date()

    
    // Ensure we never request past dates - use actual current date as minimum
    const actualToday = new Date() // Actual current date - dynamic
    const todayDateOnly = new Date(actualToday.getFullYear(), actualToday.getMonth(), actualToday.getDate())
    const requestDateOnly = new Date(dateToUse.getFullYear(), dateToUse.getMonth(), dateToUse.getDate())
    
    const requestDate = requestDateOnly < todayDateOnly ? todayDateOnly : dateToUse
    

    // Format selected date as YYYY-MM-DD (avoid timezone issues)
    const year = requestDate.getFullYear()
    const month = String(requestDate.getMonth() + 1).padStart(2, '0')
    const day = String(requestDate.getDate()).padStart(2, '0')
    const formattedDate = `${year}-${month}-${day}`
    

    // Build the API URL with required start_date parameter
    const params = new URLSearchParams()
    params.append('start_date', formattedDate)
    
    const url = `${API_ADMIN_BASE_URL}/dashboard/up-comming-event?${params.toString()}`


    const response = await $fetch(url, {
      method: 'GET',
      headers
    })



    // Validate and return response
    if (response && response.success && Array.isArray(response.data)) {
      
      // The API now returns events based on start_date parameter
      // But we still need to check if multi-day events should be shown
      const selectedDateTime = new Date(requestDate.getFullYear(), requestDate.getMonth(), requestDate.getDate())

      
      // Get all upcoming events to check for multi-day events that might span to our selected date
      const allEventsUrl = `${API_ADMIN_BASE_URL}/dashboard/up-comming-event`
      
      let allEventsResponse
      try {
        allEventsResponse = await $fetch(allEventsUrl, {
          method: 'GET',
          headers
        })
      } catch (error) {
        allEventsResponse = { success: false, data: [] }
      }
      
      // Combine events from specific date API call with multi-day events
      let combinedEvents = [...response.data]
      
      if (allEventsResponse && allEventsResponse.success && Array.isArray(allEventsResponse.data)) {
        
        allEventsResponse.data.forEach(event => {
          try {
            const eventStartDate = new Date(event.start_date)
            const eventEndDate = new Date(event.end_date)
            
            if (isNaN(eventStartDate.getTime()) || isNaN(eventEndDate.getTime())) {
              return // Skip invalid dates
            }
            
            const startDateOnly = new Date(eventStartDate.getFullYear(), eventStartDate.getMonth(), eventStartDate.getDate())
            const endDateOnly = new Date(eventEndDate.getFullYear(), eventEndDate.getMonth(), eventEndDate.getDate())
            
            // Check if selected date falls within this event's range
            const isWithinRange = selectedDateTime.getTime() >= startDateOnly.getTime() && selectedDateTime.getTime() <= endDateOnly.getTime()
            
            // Check if event hasn't ended yet
            const actualToday = new Date() // Actual current date - dynamic
            const todayEndOfDay = new Date(actualToday.getFullYear(), actualToday.getMonth(), actualToday.getDate(), 23, 59, 59, 999)
            const eventEndOfDay = new Date(endDateOnly.getFullYear(), endDateOnly.getMonth(), endDateOnly.getDate(), 23, 59, 59, 999)
            const hasntEnded = eventEndOfDay >= todayEndOfDay
            
            if (isWithinRange && hasntEnded) {
              // Check if this event is already in our combined list
              const alreadyExists = combinedEvents.some(existingEvent => existingEvent.id === event.id)
              if (!alreadyExists) {
                combinedEvents.push(event)
              }
            }
          } catch (parseError) {
            console.warn(`⚠️ Error processing event "${event.name}":`, parseError)
          }
        })
      }
      
      // Remove duplicates based on event ID
      const uniqueEvents = combinedEvents.filter((event, index, self) => 
        index === self.findIndex(e => e.id === event.id)
      )
            
      // Log which events are being returned
      uniqueEvents.forEach(event => {
      })

      return {
        success: true,
        message: response.message || 'Upcoming events retrieved successfully',
        data: uniqueEvents
      }
    } else {
      console.warn('⚠️ Unexpected response structure:', response)
      return {
        success: false,
        message: 'Invalid response format',
        data: []
      }
    }

  } catch (error) {
    console.error('❌ Fetch upcoming events error:', error)
    
    // Handle authentication errors specifically
    if (error.status === 401) {
      console.error('❌ Authentication failed, redirecting to login')
      handleAuthRedirect()
      throw new Error('Authentication required')
    }
    
    // Don't expose technical details to users
    let userMessage = 'Failed to load upcoming events. Please try again.'
    if (error.status === 403) {
      userMessage = 'You do not have permission to view upcoming events.'
    } else if (error.status === 500) {
      userMessage = 'Server error occurred. Please try again later.'
    }
    
    return {
      status: error?.status || 500,
      success: false,
      message: userMessage,
      data: []
    }
  }
}

// Fetch recent events with dashboard data
export async function fetchRecentEvents() {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!API_ADMIN_BASE_URL) {
    throw new Error('API admin base URL is not configured.')
  }

  try {
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Unable to create authentication headers')
    }


    const response = await $fetch(`${API_ADMIN_BASE_URL}/dashboard`, {
      method: 'GET',
      headers
    })

    // Validate and return response
    if (response && response.success && response.data && Array.isArray(response.data.recently_event)) {
      return {
        success: true,
        message: response.message || 'Recent events retrieved successfully',
        data: response.data.recently_event,
        summary: response.data.summary || null
      }
    } else {
      console.warn('⚠️ Unexpected response structure:', response)
      return {
        success: false,
        message: 'Invalid response format',
        data: [],
        summary: null
      }
    }

  } catch (error) {
    console.error('❌ Fetch recent events error:', error)
    
    // Handle authentication errors specifically
    if (error.status === 401) {
      console.error('❌ Authentication failed, redirecting to login')
      handleAuthRedirect()
      throw new Error('Authentication required')
    }
    
    // Don't expose technical details to users
    let userMessage = 'Failed to load recent events. Please try again.'
    if (error.status === 403) {
      userMessage = 'You do not have permission to view recent events.'
    } else if (error.status === 500) {
      userMessage = 'Server error occurred. Please try again later.'
    }
    
    return {
      status: error?.status || 500,
      success: false,
      message: userMessage,
      data: [],
      summary: null
    }
  }
}

// Update order status (for completing cash payments)
export async function updateOrderStatus(orderId, status, paymentMethod = null, ticketTypes = null, remark = null) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!orderId) {
    throw new Error('Order ID is required')
  }

  if (!status) {
    throw new Error('Status is required')
  }

  try {
    const headers = await createAuthHeaders()
    if (!headers) {
      throw new Error('Authentication required')
    }

    const requestBody = {
      status: status
    }

    if (paymentMethod) {
      requestBody.payment_method = paymentMethod
    }

    if (ticketTypes && Array.isArray(ticketTypes) && ticketTypes.length > 0) {
      requestBody.ticket_types = ticketTypes
    }

    // Add remark field - auto-generate if not provided
    if (remark) {
      requestBody.remark = remark
    } else if (paymentMethod === 'cash') {
      requestBody.remark = 'cash payment'
    } else if (paymentMethod) {
      requestBody.remark = `${paymentMethod} payment`
    } else {
      requestBody.remark = 'payment processed'
    }

    const response = await $fetch(`${API_ADMIN_BASE_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      body: requestBody,
      headers
    })

    return {
      success: true,
      data: response.data || response,
      message: response.message || 'Order status updated successfully'
    }

  } catch (error) {
    console.error('❌ Failed to update order status:', error)
    
    // Handle authentication errors
    if (error.status === 401) {
      handleAuthRedirect()
      throw new Error('Authentication required. Please log in again.')
    }
    
    if (error.status === 403) {
      throw new Error('You do not have permission to update this order.')
    }
    
    // Handle validation errors
    if (error.status === 422) {
      let errorMessage = 'Invalid status data. Please try again.'
      
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
    
    // Handle not found
    if (error.status === 404) {
      throw new Error('Order not found.')
    }
    
    // Don't expose technical details to users
    let userMessage = 'Failed to update order status. Please try again.'
    if (error.status >= 500) {
      userMessage = 'Server error. Please try again later.'
    }
    
    throw new Error(userMessage)
  }
}

// ============= SALES REPORT API FUNCTIONS =============

// Fetch sales report overtime data for a specific event
export async function fetchSalesOvertimeReport(eventId) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!eventId) {
    throw new Error('Event ID is required')
  }

  if (!validateUUID(eventId)) {
    throw new Error('Invalid event ID format')
  }

  try {
    const headers = await createAuthHeaders()
    if (!headers) {
      handleAuthRedirect()
      return null
    }

    const response = await $fetch(`${API_ADMIN_BASE_URL}/report/sale-report/${eventId}`, {
      method: 'GET',
      headers
    })

    return response
  } catch (error) {
    console.error('Error fetching sales overtime report:', error)
    throw error
  }
}

// Fetch sales report list data for a specific event
export async function fetchSalesReportList(eventId, page = 1, perPage = 10) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!eventId) {
    throw new Error('Event ID is required')
  }

  if (!validateUUID(eventId)) {
    throw new Error('Invalid event ID format')
  }

  try {
    const headers = await createAuthHeaders()
    if (!headers) {
      handleAuthRedirect()
      return null
    }

    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString()
    })

    const response = await $fetch(`${API_ADMIN_BASE_URL}/report/sale-report/${eventId}/list?${params}`, {
      method: 'GET',
      headers
    })

    return response
  } catch (error) {
    console.error('Error fetching sales report list:', error)
    throw error
  }
}
