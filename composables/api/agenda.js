// Agenda API functions for CRUD operations
import { useRuntimeConfig } from '#app'
import { useAuth } from '~/composables/useAuth'

// Get auth token using proper Nuxt 3 pattern
const getAuthToken = () => {
  const { getToken, isTokenExpired } = useAuth()
  const token = getToken()

  if (!token) {
    console.log('❌ No token found in auth state')
    return null
  }

  if (isTokenExpired()) {
    console.warn('⚠️ Token is expired')
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
    console.log('✅ Auth headers created for agenda API')
  } else {
    console.warn('⚠️ Failed to create auth headers - no valid token')
    throw new Error('Authentication required')
  }

  return headers
}

// Helper function to validate UUID
function validateUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid?.toString())
}

// List Agenda: GET /events/:events_id/agendas
export async function getEventAgendas(eventId) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!eventId) {
    throw new Error('Event ID is required')
  }

  if (!validateUUID(eventId)) {
    throw new Error('Invalid event ID format. Expected UUID format.')
  }

  try {
    console.log('📅 Fetching agendas for event:', eventId)
    
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/agendas`, {
      method: 'GET',
      headers: createAuthHeaders()
    })

    console.log('✅ Event agendas fetched:', response)
    return response
  } catch (error) {
    console.error('❌ Failed to fetch event agendas:', error)
    
    if (error.status === 404) {
      return { success: true, data: [] } // Return empty array if no agendas found
    }
    
    throw error
  }
}

// Agenda detail: GET /events/:events_id/agendas/:agenda_id
export async function getAgendaDetails(eventId, agendaId) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!eventId || !agendaId) {
    throw new Error('Event ID and Agenda ID are required')
  }

  if (!validateUUID(eventId)) {
    throw new Error('Invalid event ID format. Expected UUID format.')
  }

  try {
    console.log('📅 Fetching agenda details:', { eventId, agendaId })
    
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/agendas/${agendaId}`, {
      method: 'GET',
      headers: createAuthHeaders()
    })

    console.log('✅ Agenda details fetched:', response)
    return response
  } catch (error) {
    console.error('❌ Failed to fetch agenda details:', error)
    
    if (error.status === 404) {
      throw new Error('Agenda not found')
    }
    
    throw error
  }
}

// Create New Agenda: POST /events/:events_id/agendas
export async function createAgenda(eventId, agendaData) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!eventId || !agendaData) {
    throw new Error('Event ID and agenda data are required')
  }

  if (!validateUUID(eventId)) {
    throw new Error('Invalid event ID format. Expected UUID format.')
  }

  try {
    // Validate required fields
    const requiredFields = ['date', 'time_start', 'time_end', 'title']
    const missingFields = requiredFields.filter(field => {
      const value = agendaData[field]
      return !value || (typeof value === 'string' && value.trim() === '')
    })

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
    }

    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(agendaData.time_start)) {
      throw new Error('Invalid start time format. Use HH:MM format.')
    }
    if (!timeRegex.test(agendaData.time_end)) {
      throw new Error('Invalid end time format. Use HH:MM format.')
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(agendaData.date)) {
      throw new Error('Invalid date format. Use YYYY-MM-DD format.')
    }

    console.log('📅 Creating agenda for event:', eventId)
    console.log('📝 Agenda data:', agendaData)

    // Prepare form data
    const formData = new FormData()
    
    // Add required fields
    formData.append('date', agendaData.date)
    formData.append('time_start', agendaData.time_start)
    formData.append('time_end', agendaData.time_end)
    formData.append('title', agendaData.title.trim())
    
    // Add optional fields
    if (agendaData.description) {
      formData.append('description', agendaData.description.trim())
    }
    if (agendaData.venue) {
      formData.append('venue', agendaData.venue.trim())
    }
    if (agendaData.room_no) {
      formData.append('room_no', agendaData.room_no.trim())
    }
    if (agendaData.speaker_name) {
      formData.append('speaker_name', agendaData.speaker_name.trim())
    }
    if (agendaData.speaker_description) {
      formData.append('speaker_description', agendaData.speaker_description.trim())
    }
    
    // Handle speaker image file
    if (agendaData.speaker_image instanceof File) {
      // Validate file type
      if (!agendaData.speaker_image.type.startsWith('image/')) {
        throw new Error('Speaker image must be an image file')
      }
      // Validate file size (max 5MB)
      if (agendaData.speaker_image.size > 5 * 1024 * 1024) {
        throw new Error('Speaker image file size exceeds 5MB limit')
      }
      formData.append('speaker_image', agendaData.speaker_image)
    }
    
    // Add is_break flag
    formData.append('is_break', agendaData.is_break ? '1' : '0')

    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/agendas`, {
      method: 'POST',
      body: formData,
      headers: createAuthHeaders(false) // Don't include Content-Type for FormData
    })

    console.log('✅ Agenda created:', response)
    return response
  } catch (error) {
    console.error('❌ Failed to create agenda:', error)
    
    if (error.status === 422) {
      console.error('Validation errors:', error.data)
      throw new Error(error.data?.message || 'Validation failed. Please check all required fields.')
    }
    
    throw error
  }
}

// Update Agenda: PUT /events/:events_id/agendas/:agenda_id
export async function updateAgenda(eventId, agendaId, agendaData) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!eventId || !agendaId || !agendaData) {
    throw new Error('Event ID, Agenda ID, and agenda data are required')
  }

  if (!validateUUID(eventId)) {
    throw new Error('Invalid event ID format. Expected UUID format.')
  }

  try {
    console.log('📅 Updating agenda:', { eventId, agendaId })
    console.log('📝 Updated agenda data:', agendaData)

    // Prepare form data
    const formData = new FormData()
    
    // Add event_id and agenda_id as required by API
    formData.append('event_id', eventId)
    formData.append('agenda_id', agendaId)
    
    // Add all agenda data fields
    Object.entries(agendaData).forEach(([key, value]) => {
      if (value instanceof File) {
        // Handle file uploads
        if (key === 'speaker_image') {
          // Validate file type and size
          if (!value.type.startsWith('image/')) {
            throw new Error('Speaker image must be an image file')
          }
          if (value.size > 5 * 1024 * 1024) {
            throw new Error('Speaker image file size exceeds 5MB limit')
          }
        }
        formData.append(key, value)
      } else if (value !== null && value !== undefined && value !== '') {
        // Handle regular fields
        if (key === 'is_break') {
          formData.append(key, value ? '1' : '0')
        } else {
          formData.append(key, typeof value === 'string' ? value.trim() : value)
        }
      }
    })

    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/agendas/${agendaId}`, {
      method: 'PUT',
      body: formData,
      headers: createAuthHeaders(false) // Don't include Content-Type for FormData
    })

    console.log('✅ Agenda updated:', response)
    return response
  } catch (error) {
    console.error('❌ Failed to update agenda:', error)
    
    if (error.status === 404) {
      throw new Error('Agenda not found')
    } else if (error.status === 422) {
      console.error('Validation errors:', error.data)
      throw new Error(error.data?.message || 'Validation failed. Please check all required fields.')
    }
    
    throw error
  }
}

// Delete Agenda: DELETE /events/:event_id/agendas/:agenda_id
export async function deleteAgenda(eventId, agendaId) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!eventId || !agendaId) {
    throw new Error('Event ID and Agenda ID are required')
  }

  if (!validateUUID(eventId)) {
    throw new Error('Invalid event ID format. Expected UUID format.')
  }

  try {
    console.log('🗑️ Deleting agenda:', { eventId, agendaId })

    // Send event_id and agenda_id as required by API
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/agendas/${agendaId}`, {
      method: 'DELETE',
      body: {
        event_id: eventId,
        agenda_id: agendaId
      },
      headers: createAuthHeaders()
    })

    console.log('✅ Agenda deleted:', response)
    return response
  } catch (error) {
    console.error('❌ Failed to delete agenda:', error)
    
    if (error.status === 404) {
      throw new Error('Agenda not found or already deleted')
    } else if (error.status === 403) {
      throw new Error('You do not have permission to delete this agenda')
    } else if (error.status === 409) {
      throw new Error('Cannot delete agenda with existing dependencies')
    }
    
    throw error
  }
}

// Bulk operations for agendas
export async function createMultipleAgendas(eventId, agendasData) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!eventId || !Array.isArray(agendasData) || agendasData.length === 0) {
    throw new Error('Event ID and array of agenda data are required')
  }

  if (!validateUUID(eventId)) {
    throw new Error('Invalid event ID format. Expected UUID format.')
  }

  try {
    console.log('📅 Creating multiple agendas for event:', eventId)
    console.log('📝 Number of agendas:', agendasData.length)

    const results = []
    const errors = []

    // Create agendas one by one to handle individual errors
    for (let i = 0; i < agendasData.length; i++) {
      try {
        const result = await createAgenda(eventId, agendasData[i])
        results.push(result)
        console.log(`✅ Agenda ${i + 1} created successfully`)
      } catch (error) {
        console.error(`❌ Failed to create agenda ${i + 1}:`, error)
        errors.push({ index: i, error: error.message })
      }
    }

    return {
      success: results.length > 0,
      created: results.length,
      failed: errors.length,
      results,
      errors
    }
  } catch (error) {
    console.error('❌ Failed to create multiple agendas:', error)
    throw error
  }
}

// Get agendas by date range
export async function getAgendasByDateRange(eventId, startDate, endDate) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!eventId || !startDate || !endDate) {
    throw new Error('Event ID, start date, and end date are required')
  }

  if (!validateUUID(eventId)) {
    throw new Error('Invalid event ID format. Expected UUID format.')
  }

  try {
    console.log('📅 Fetching agendas by date range:', { eventId, startDate, endDate })
    
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/agendas`, {
      method: 'GET',
      query: {
        start_date: startDate,
        end_date: endDate
      },
      headers: createAuthHeaders()
    })

    console.log('✅ Agendas by date range fetched:', response)
    return response
  } catch (error) {
    console.error('❌ Failed to fetch agendas by date range:', error)
    throw error
  }
}