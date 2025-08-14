// composables/api/tickets/index.js
// Tickets CRUD operations

import { getAuthToken, createAuthHeaders } from '../auth.js'

// CREATE - Create new ticket
export async function createTicket(ticketData) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!API_ADMIN_BASE_URL) {
    throw new Error('API admin base URL is not configured.')
  }

  const token = getAuthToken()
  if (!token) {
    console.error('❌ No authentication token found for ticket creation')
    throw new Error('Authentication required. Please login again.')
  }

  try {
    console.log('🎫 Creating ticket:', ticketData)

    const response = await $fetch(`${API_ADMIN_BASE_URL}/tickets`, {
      method: 'POST',
      body: ticketData,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    })

    console.log('✅ Create ticket response:', response)
    return response
  } catch (error) {
    console.error('❌ Create ticket error:', error)
    
    // Handle specific error cases
    if (error.status === 401 || error.statusCode === 401) {
      const { clearAuth } = useAuth()
      clearAuth()
      throw new Error('Authentication failed. Please login again.')
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

// READ - Fetch all tickets for an event
export async function fetchEventTickets(eventId, params = {}) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiBaseUrl

  if (!API_ADMIN_BASE_URL) {
    throw new Error('API base URL is not configured.')
  }

  if (!eventId) {
    throw new Error('Event ID is required.')
  }

  try {
    console.log('🎫 Fetching tickets for event:', eventId)
    console.log('📋 Query params:', params)

    // Build query string from params
    const queryParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })

    const queryString = queryParams.toString()
    const url = `${API_ADMIN_BASE_URL}/api/v1/admin/events/${eventId}/ticket-types${queryString ? `?${queryString}` : ''}`

    console.log('🌐 Requesting URL:', url)
    const response = await $fetch(url, {
      method: 'GET',
      headers: createAuthHeaders(),
    })

    console.log('✅ Event tickets fetched:', response)
    return response
  } catch (error) {
    console.error('❌ Failed to fetch event tickets:', error)
    
    // Handle specific error cases
    if (error.status === 401 || error.statusCode === 401) {
      const { clearAuth } = useAuth()
      clearAuth()
      throw new Error('Authentication failed. Please login again.')
    }

    if (error.status === 404 || error.statusCode === 404) {
      throw new Error('Event not found or no tickets available.')
    }

    throw new Error(error.data?.message || error.message || 'Failed to fetch event tickets')
  }
}

// READ - Fetch single ticket by ID
export async function fetchTicketById(ticketId) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!API_ADMIN_BASE_URL) {
    throw new Error('API admin base URL is not configured.')
  }

  if (!ticketId) {
    throw new Error('Ticket ID is required.')
  }

  try {
    console.log('🎫 Fetching ticket by ID:', ticketId)

    const response = await $fetch(`${API_ADMIN_BASE_URL}/tickets/${ticketId}`, {
      method: 'GET',
      headers: createAuthHeaders(),
    })

    console.log('✅ Ticket fetched:', response)
    return response
  } catch (error) {
    console.error('❌ Failed to fetch ticket:', error)
    
    if (error.status === 404 || error.statusCode === 404) {
      throw new Error('Ticket not found.')
    }

    throw new Error(error.data?.message || error.message || 'Failed to fetch ticket details')
  }
}

// READ - Get ticket statistics for an event
export async function getTicketStats(eventId) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!API_ADMIN_BASE_URL) {
    throw new Error('API admin base URL is not configured.')
  }

  if (!eventId) {
    throw new Error('Event ID is required.')
  }

  try {
    console.log('📊 Fetching ticket stats for event:', eventId)

    const response = await $fetch(`${API_ADMIN_BASE_URL}/events/${eventId}/ticket-stats`, {
      method: 'GET',
      headers: createAuthHeaders(),
    })

    console.log('✅ Ticket stats fetched:', response)
    return response
  } catch (error) {
    console.error('❌ Failed to fetch ticket stats:', error)
    throw new Error(error.data?.message || error.message || 'Failed to fetch ticket statistics')
  }
}

// UPDATE - Update ticket information
export async function updateTicket(ticketId, ticketData) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!API_ADMIN_BASE_URL) {
    throw new Error('API admin base URL is not configured.')
  }

  if (!ticketId) {
    throw new Error('Ticket ID is required.')
  }

  const token = getAuthToken()
  if (!token) {
    console.error('❌ No authentication token found for ticket update')
    throw new Error('Authentication required. Please login again.')
  }

  try {
    console.log('📝 Updating ticket:', ticketId)
    console.log('📋 Update data:', ticketData)

    const response = await $fetch(`${API_ADMIN_BASE_URL}/tickets/${ticketId}`, {
      method: 'PUT',
      body: ticketData,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('✅ Ticket updated successfully:', response)
    return response
  } catch (error) {
    console.error('❌ Failed to update ticket:', error)
    
    // Handle specific error cases
    if (error.status === 401 || error.statusCode === 401) {
      const { clearAuth } = useAuth()
      clearAuth()
      throw new Error('Authentication failed. Please login again.')
    }

    if (error.status === 404 || error.statusCode === 404) {
      throw new Error('Ticket not found.')
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

// UPDATE - Update ticket check-in status
export async function updateTicketCheckIn(ticketId, checkInStatus) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!API_ADMIN_BASE_URL) {
    throw new Error('API admin base URL is not configured.')
  }

  if (!ticketId) {
    throw new Error('Ticket ID is required.')
  }

  try {
    console.log('�� Updating ticket check-in status:', { ticketId, checkInStatus })

    const response = await $fetch(`${API_ADMIN_BASE_URL}/tickets/${ticketId}/check-in`, {
      method: 'PUT',
      body: { check_in_status: checkInStatus },
      headers: createAuthHeaders()
    })

    console.log('✅ Ticket check-in status updated:', response)
    return response
  } catch (error) {
    console.error('❌ Failed to update ticket check-in status:', error)
    
    if (error.status === 404 || error.statusCode === 404) {
      throw new Error('Ticket not found.')
    }

    throw error
  }
}

// UPDATE - Bulk update tickets
export async function bulkUpdateTickets(ticketIds, updateData) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!API_ADMIN_BASE_URL) {
    throw new Error('API admin base URL is not configured.')
  }

  if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
    throw new Error('Ticket IDs array is required.')
  }

  try {
    console.log('📝 Bulk updating tickets:', { ticketIds, updateData })

    const response = await $fetch(`${API_ADMIN_BASE_URL}/tickets/bulk-update`, {
      method: 'PUT',
      body: { ticket_ids: ticketIds, ...updateData },
      headers: createAuthHeaders()
    })

    console.log('✅ Tickets bulk updated:', response)
    return response
  } catch (error) {
    console.error('❌ Failed to bulk update tickets:', error)
    throw error
  }
}

// DELETE - Delete ticket
export async function deleteTicket(ticketId) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!API_ADMIN_BASE_URL) {
    throw new Error('API admin base URL is not configured.')
  }

  if (!ticketId) {
    throw new Error('Ticket ID is required.')
  }

  const token = getAuthToken()
  if (!token) {
    console.error('❌ No authentication token found for ticket deletion')
    throw new Error('Authentication required. Please login again.')
  }

  try {
    console.log('🗑️ Deleting ticket:', ticketId)

    const response = await $fetch(`${API_ADMIN_BASE_URL}/tickets/${ticketId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('✅ Ticket deleted successfully:', response)
    return response
  } catch (error) {
    console.error('❌ Failed to delete ticket:', error)
    
    // Handle specific error cases
    if (error.status === 401 || error.statusCode === 401) {
      const { clearAuth } = useAuth()
      clearAuth()
      throw new Error('Authentication failed. Please login again.')
    }

    if (error.status === 404 || error.statusCode === 404) {
      throw new Error('Ticket not found. It may have already been deleted.')
    }

    if (error.status === 409 || error.statusCode === 409) {
      throw new Error('Cannot delete ticket. It may be associated with active bookings.')
    }

    throw error
  }
}

// DELETE - Bulk delete tickets
export async function bulkDeleteTickets(ticketIds) {
  const config = useRuntimeConfig()
  const API_ADMIN_BASE_URL = config.public.apiAdminBaseUrl

  if (!API_ADMIN_BASE_URL) {
    throw new Error('API admin base URL is not configured.')
  }

  if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
    throw new Error('Ticket IDs array is required.')
  }

  const token = getAuthToken()
  if (!token) {
    console.error('❌ No authentication token found for ticket deletion')
    throw new Error('Authentication required. Please login again.')
  }

  try {
    console.log('🗑️ Bulk deleting tickets:', ticketIds)

    const response = await $fetch(`${API_ADMIN_BASE_URL}/tickets/bulk-delete`, {
      method: 'DELETE',
      body: { ticket_ids: ticketIds },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('✅ Tickets bulk deleted successfully:', response)
    return response
  } catch (error) {
    console.error('❌ Failed to bulk delete tickets:', error)
    
    if (error.status === 401 || error.statusCode === 401) {
      const { clearAuth } = useAuth()
      clearAuth()
      throw new Error('Authentication failed. Please login again.')
    }

    throw error
  }
}