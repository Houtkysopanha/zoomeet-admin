// server/api/admin/events/[id].get.ts
export default defineEventHandler(async (event) => {
  try {
    const eventId = getRouterParam(event, 'id')
    const config = useRuntimeConfig()

    if (!eventId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Event ID is required'
      })
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(eventId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid event ID format'
      })
    }

    // Get the external API URL based on environment
    const externalApiUrl = process.env.NODE_ENV === 'development'
      ? 'https://dev-apiticket.prestigealliance.co/api/v1/admin'
      : 'https://api-ticket.etickets.asia/api/v1/admin'


    // Get auth token from headers
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authorization token required'
      })
    }

    // Forward the request to external API
    const response = await $fetch(`${externalApiUrl}/events/${eventId}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json'
      }
    })

    console.log('✅ Event retrieved successfully:', eventId)
    return response

  } catch (error: any) {
    console.error('❌ Server-side get event error:', error)
    
    if (error.statusCode === 404 || error.status === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Event not found'
      })
    }

    if (error.statusCode === 401 || error.status === 401) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    throw createError({
      statusCode: error.statusCode || error.status || 500,
      statusMessage: error.data?.message || error.message || 'Failed to retrieve event'
    })
  }
})
