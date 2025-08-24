// Auto-imported by Nuxt: useRuntimeConfig, $fetch
import axios from 'axios'
// Get auth token using proper Nuxt 3 pattern with improved reliability
const getAuthToken = () => {
  try {
    // Primary: Use the useAuth composable for token management
    const { getToken, isTokenExpired, user } = useAuth()
    let token = getToken()

    // If token exists but is expired, clear all storage and return null
    if (token && isTokenExpired()) {
      if (process.client) {
        localStorage.removeItem('auth')
        sessionStorage.removeItem('auth')
        // Clear cookie through useAuth
        const { clearAuth } = useAuth()
        clearAuth()
      }
      return null
    }

    // If no token from composable, try direct storage access as fallback
    if (!token && process.client) {
      
      // Try localStorage first
      const stored = localStorage.getItem('auth')
      if (stored) {
        try {
          const authData = JSON.parse(stored)
          token = authData?.token
          
          // Validate token format and expiration
          if (token && authData.expiresAt) {
            const expiry = new Date(authData.expiresAt)
            if (expiry <= new Date()) {
              // Token expired, clear storage
              localStorage.removeItem('auth')
              sessionStorage.removeItem('auth')
              return null
            }
          }
        } catch (e) {
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
            
            // Validate token format and expiration
            if (token && authData.expiresAt) {
              const expiry = new Date(authData.expiresAt)
              if (expiry <= new Date()) {
                // Token expired, clear storage
                sessionStorage.removeItem('auth')
                return null
              }
            }
          } catch (e) {
            sessionStorage.removeItem('auth') // Clear corrupted data
          }
        }
      }
    }

    // Final validation - ensure token exists and is properly formatted
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return null
    }

    // Basic JWT format check (should have 3 parts separated by dots)
    const tokenParts = token.split('.')
    if (tokenParts.length !== 3) {
      // Invalid JWT format, clear all storage
      if (process.client) {
        localStorage.removeItem('auth')
        sessionStorage.removeItem('auth')
      }
      return null
    }

    return token.trim()
  } catch (error) {
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
  
  // Use server proxy route to avoid CORS issues
  const eventsUrl = '/api/admin/events'

  try {
    
    // Use consistent token handling
    const token = getAuthToken()
    if (!token) {
      return { status: 401, data: { success: false, data: [], message: 'Authentication required' } }
    }

    // Create headers with the token
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
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
// Fetch user info
export async function fetchUserInfo() {
  const config = useRuntimeConfig()
  const API_BASE_URL = config.public.apiBaseUrl

  if (!API_BASE_URL) {
    throw new Error('API base URL is not configured.')
  }

  try {
    const userInfoUrl = normalizeApiUrl(API_BASE_URL, 'info')
    const response = await $fetch(userInfoUrl, {
      method: 'GET',
      headers: createAuthHeaders(),
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
    const response = await $fetch(serverUrl, {
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
      const response = await $fetch(createEventUrl, {
        method: 'POST',
        body: formData,
        headers: {
          ...createAuthHeaders(false), // Don't include Content-Type for FormData
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
    const response = await $fetch(updateEventUrl, {
      method: 'POST',
      body: formData,
      headers: {
        ...createAuthHeaders(false), // Don't include Content-Type for FormData
      },
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
    const response = await $fetch(serverUrl, {
      method: 'PUT',
      body: normalizedData,
      headers: createAuthHeaders() // Use JSON Content-Type
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
    const response = await $fetch(serverUrl, {
      method: 'POST',
      body: requestBody,
      headers: {
        ...createAuthHeaders(),
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
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/ticket-types`, {
      method: 'GET',
      headers: createAuthHeaders()
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
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/ticket-types/${ticketTypeId}`, {
      method: 'GET',
      headers: createAuthHeaders()
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
    const response = await $fetch(serverUrl, {
      method: 'DELETE',
      headers: createAuthHeaders()
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
    const response = await $fetch(serverUrl, {
      method: 'DELETE',
      headers: createAuthHeaders()
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
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/agendas`, {
      method: 'POST',
      body: agendaData,
      headers: createAuthHeaders()
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
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/agendas/${agendaId}`, {
      method: 'PUT',
      body: agendaData,
      headers: createAuthHeaders()
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
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/agendas`, {
      method: 'GET',
      headers: createAuthHeaders()
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
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/agendas/${agendaId}`, {
      method: 'DELETE',
      headers: createAuthHeaders()
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
    
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}`, {
      method: 'POST',
      body: formData,
      headers: createAuthHeaders(false) // Don't include Content-Type for FormData
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
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/unpublish`, {
      method: 'POST',
      headers: createAuthHeaders()
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
    
    // Use the same authentication pattern as other admin API calls
    const token = getAuthToken()
    if (!token) {
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

    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/check-slug?${queryParams}`, {
      method: 'GET',
      headers: createAuthHeaders()
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
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl
  if (!eventId) {
    throw new Error('Event ID is required')
  }

  try {
    // Build API URL using env base
      const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/organizer`, {

      method: 'GET',
      headers: createAuthHeaders()
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
   const response = await axios.get(`${API_ADMIN_BASE_URL}/events/permission/organizer`, {
      method: 'GET',
      headers: createAuthHeaders()
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
  const token = localStorage.getItem("token")

  if (!keyword || keyword.length < 1) {
    return []
  }

  try {
    const response = await axios.get(
      `${API_ADMIN_BASE_URL}/users/search`,
      {
        params: { keyword },
         method: 'GET',
        headers: createAuthHeaders()
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
    roles: enabledRoles
  }

  try {
    const config = useRuntimeConfig()
    const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

    const response = await axios.post(
      `${API_ADMIN_BASE_URL}/events/${eventId}/organizer/invite/user`,
      payload,
      {
      method: 'POST',
      headers: createAuthHeaders()
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

    const response = await axios.get(
      `${API_ADMIN_BASE_URL}/events/${eventId}/organizer/${userId}/detail`,
      {
      method: 'GET',
      headers: createAuthHeaders()
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

  const { data, status } = await axios.post(
    url,
    {
      user_id: userId,
      roles
    },
    {
      method: 'POST',
      headers: createAuthHeaders()
    }
  )

  return { data, status }
}