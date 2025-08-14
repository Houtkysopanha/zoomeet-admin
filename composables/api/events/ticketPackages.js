// composables/api/events/ticketPackages.js
// Ticket Packages CRUD operations

import { getAuthToken, createAuthHeaders } from '../auth.js'

// CREATE - Create ticket types for an event
export async function createTicketTypes(eventId, ticketTypesData) {
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

// CREATE - Create single ticket type
export async function createTicketType(eventId, ticketData) {
  const token = getAuthToken()
  if (!token) {
    console.error('❌ No authentication token found for ticket creation')
    throw new Error('Authentication required. Please login again.')
  }

  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!API_ADMIN_BASE_URL) {
    throw new Error('API configuration error. Please check your environment settings.')
  }

  if (!eventId) {
    throw new Error('Event ID is required')
  }

  try {
    console.log('🎫 Creating single ticket type for event:', eventId)
    console.log('📝 Ticket data:', ticketData)

    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/ticket-types`, {
      method: 'POST',
      body: ticketData,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    })

    console.log('✅ Create ticket type response:', response)
    return response
  } catch (error) {
    console.error('❌ Create ticket type error:', error)
    
    // Handle specific error cases
    if (error.status === 401 || error.statusCode === 401) {
      const { clearAuth } = useAuth()
      clearAuth()
      throw new Error('Authentication failed. Please login again.')
    }

    if (error.status === 404 || error.statusCode === 404) {
      throw new Error('Event not found. Please make sure the event exists.')
    }

    if (error.status === 422 || error.statusCode === 422) {
      if (error.data && error.data.errors) {
        const errors = error.data.errors
        const errorMessages = Object.keys(errors).map(field => {
          const fieldErrors = Array.isArray(errors[field]) ? errors[field] : [errors[field]]
          return `${field}: ${fieldErrors.join(', ')}`
        }).join('\n')
        throw new Error(`Validation failed:\n${errorMessages}`)
      }
      throw new Error('Validation failed. Please check your ticket data.')
    }

    throw error
  }
}

// READ - Fetch event ticket types
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

// READ - Fetch single ticket type by ID
export async function getTicketTypeById(eventId, ticketTypeId) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl || 'https://dev-apiticket.prestigealliance.co/api/v1/admin'

  if (!eventId || !ticketTypeId) {
    throw new Error('Event ID and Ticket Type ID are required')
  }

  try {
    console.log('🎫 Fetching ticket type:', { eventId, ticketTypeId })
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/ticket-types/${ticketTypeId}`, {
      method: 'GET',
      headers: createAuthHeaders()
    })

    console.log('✅ Ticket type fetched:', response)
    return response
  } catch (error) {
    console.error('❌ Failed to fetch ticket type:', error)
    throw error
  }
}

// UPDATE - Update ticket type
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
    
    // Handle specific error cases
    if (error.status === 401 || error.statusCode === 401) {
      const { clearAuth } = useAuth()
      clearAuth()
      throw new Error('Authentication failed. Please login again.')
    }

    if (error.status === 404 || error.statusCode === 404) {
      throw new Error('Ticket type not found. Please make sure it exists.')
    }

    if (error.status === 422 || error.statusCode === 422) {
      if (error.data && error.data.errors) {
        const errors = error.data.errors
        const errorMessages = Object.keys(errors).map(field => {
          const fieldErrors = Array.isArray(errors[field]) ? errors[field] : [errors[field]]
          return `${field}: ${fieldErrors.join(', ')}`
        }).join('\n')
        throw new Error(`Validation failed:\n${errorMessages}`)
      }
      throw new Error('Validation failed. Please check your ticket data.')
    }

    throw error
  }
}

// UPDATE - Update multiple ticket types
export async function updateTicketTypes(eventId, ticketTypesData) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl || 'https://dev-apiticket.prestigealliance.co/api/v1/admin'

  if (!eventId) {
    throw new Error('Event ID is required')
  }

  if (!Array.isArray(ticketTypesData) || ticketTypesData.length === 0) {
    throw new Error('Ticket types data must be a non-empty array')
  }

  try {
    console.log('🎫 Updating multiple ticket types for event:', eventId)
    console.log('📝 Ticket types data:', ticketTypesData)

    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/ticket-types/bulk-update`, {
      method: 'PUT',
      body: { ticket_types: ticketTypesData },
      headers: createAuthHeaders()
    })

    console.log('✅ Ticket types updated:', response)
    return response
  } catch (error) {
    console.error('❌ Failed to update ticket types:', error)
    
    // Handle specific error cases
    if (error.status === 401 || error.statusCode === 401) {
      const { clearAuth } = useAuth()
      clearAuth()
      throw new Error('Authentication failed. Please login again.')
    }

    if (error.status === 404 || error.statusCode === 404) {
      throw new Error('Event not found. Please make sure the event exists.')
    }

    if (error.status === 422 || error.statusCode === 422) {
      if (error.data && error.data.errors) {
        const errors = error.data.errors
        const errorMessages = Object.keys(errors).map(field => {
          const fieldErrors = Array.isArray(errors[field]) ? errors[field] : [errors[field]]
          return `${field}: ${fieldErrors.join(', ')}`
        }).join('\n')
        throw new Error(`Validation failed:\n${errorMessages}`)
      }
      throw new Error('Validation failed. Please check your ticket data.')
    }

    throw error
  }
}

// DELETE - Delete ticket type
export async function deleteTicketType(eventId, ticketTypeId) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl || 'https://dev-apiticket.prestigealliance.co/api/v1/admin'

  if (!eventId || !ticketTypeId) {
    throw new Error('Event ID and Ticket Type ID are required')
  }

  const token = getAuthToken()
  if (!token) {
    console.error('❌ No authentication token found for ticket deletion')
    throw new Error('Authentication required. Please login again.')
  }

  try {
    console.log('🗑️ Deleting ticket type:', { eventId, ticketTypeId })
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/ticket-types/${ticketTypeId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('✅ Ticket type deleted successfully:', response)
    
    // Normalize response structure
    let normalizedResponse = {
      success: false,
      data: null,
      message: 'Unknown response format'
    }

    if (response) {
      // Case 1: Response with success flag
      if (response.success !== undefined) {
        normalizedResponse = {
          success: response.success,
          data: response.data,
          message: response.message || (response.success ? 'Ticket type deleted successfully' : 'Ticket type deletion failed')
        }
      }
      // Case 2: Response with message (common for delete operations)
      else if (response.message) {
        normalizedResponse = {
          success: true,
          data: response.data || null,
          message: response.message
        }
      }
      // Case 3: Empty response (successful deletion)
      else if (Object.keys(response).length === 0) {
        normalizedResponse = {
          success: true,
          data: null,
          message: 'Ticket type deleted successfully'
        }
      }
      // Case 4: Response with data
      else {
        normalizedResponse = {
          success: true,
          data: response,
          message: 'Ticket type deleted successfully'
        }
      }
    }

    return normalizedResponse
  } catch (error) {
    console.error('❌ Failed to delete ticket type:', error)
    
    // Handle specific error cases
    if (error.status === 401 || error.statusCode === 401) {
      console.error('🚫 Authentication failed for ticket deletion')
      const { clearAuth } = useAuth()
      clearAuth()
      throw new Error('Authentication failed. Please login again.')
    }

    if (error.status === 404 || error.statusCode === 404) {
      console.error('🚫 Ticket type not found for deletion')
      throw new Error('Ticket type not found. It may have already been deleted.')
    }

    if (error.status === 403 || error.statusCode === 403) {
      console.error('🚫 Permission denied for ticket deletion')
      throw new Error('Permission denied. You may not have permission to delete this ticket type.')
    }

    if (error.status === 409 || error.statusCode === 409) {
      console.error('🚫 Ticket deletion conflict')
      throw new Error('Cannot delete ticket type. It may have associated bookings.')
    }

    // For other errors, try to extract meaningful message
    let errorMessage = 'Failed to delete ticket type'
    if (error.data && error.data.message) {
      errorMessage = error.data.message
    } else if (error.message) {
      errorMessage = error.message
    }

    throw new Error(errorMessage)
  }
}

// DELETE - Delete multiple ticket types
export async function deleteTicketTypes(eventId, ticketTypeIds) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl || 'https://dev-apiticket.prestigealliance.co/api/v1/admin'

  if (!eventId) {
    throw new Error('Event ID is required')
  }

  if (!Array.isArray(ticketTypeIds) || ticketTypeIds.length === 0) {
    throw new Error('Ticket type IDs must be a non-empty array')
  }

  const token = getAuthToken()
  if (!token) {
    console.error('❌ No authentication token found for ticket deletion')
    throw new Error('Authentication required. Please login again.')
  }

  try {
    console.log('🗑️ Deleting multiple ticket types:', { eventId, ticketTypeIds })
    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/ticket-types/bulk-delete`, {
      method: 'DELETE',
      body: { ticket_type_ids: ticketTypeIds },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('✅ Ticket types deleted successfully:', response)
    return response
  } catch (error) {
    console.error('❌ Failed to delete ticket types:', error)
    
    // Handle specific error cases
    if (error.status === 401 || error.statusCode === 401) {
      const { clearAuth } = useAuth()
      clearAuth()
      throw new Error('Authentication failed. Please login again.')
    }

    if (error.status === 404 || error.statusCode === 404) {
      throw new Error('Some ticket types not found. They may have already been deleted.')
    }

    if (error.status === 403 || error.statusCode === 403) {
      throw new Error('Permission denied. You may not have permission to delete these ticket types.')
    }

    if (error.status === 409 || error.statusCode === 409) {
      throw new Error('Cannot delete some ticket types. They may have associated bookings.')
    }

    // For other errors, try to extract meaningful message
    let errorMessage = 'Failed to delete ticket types'
    if (error.data && error.data.message) {
      errorMessage = error.data.message
    } else if (error.message) {
      errorMessage = error.message
    }

    throw new Error(errorMessage)
  }
}