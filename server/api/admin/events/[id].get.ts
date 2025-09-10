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

    // Use runtime config instead of hardcoded URLs
    const externalApiUrl = config.public.apiAdminBaseUrl.replace('/admin', '')
    

    // Get all headers to debug
    const allHeaders = getHeaders(event)


    // Get auth token from headers (try multiple header formats)
    let authHeader = getHeader(event, 'authorization') || getHeader(event, 'Authorization')
    
    // Also try getting from all headers directly
    if (!authHeader) {
      for (const [key, value] of Object.entries(allHeaders)) {
        if (key.toLowerCase() === 'authorization') {
          authHeader = value
          break
        }
      }
    }
    
    if (!authHeader) {
      console.error('❌ No authorization header found in request')

      throw createError({
        statusCode: 401,
        statusMessage: 'Authorization token required'
      })
    }

    // Ensure Bearer format
    if (!authHeader.startsWith('Bearer ')) {
      authHeader = `Bearer ${authHeader}`
    }

    // Forward the request to external API
    const response = await $fetch(`${externalApiUrl}/admin/events/${eventId}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    return response

  } catch (error: any) {
    console.error('❌ Server-side get event error:', error)
    
    // If it's a 401 from the external API, pass it through
    if (error.statusCode === 401 || error.status === 401) {

      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication failed - please login again'
      })
    }

    if (error.statusCode === 404 || error.status === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Event not found'
      })
    }

    // For other errors, provide more details
    throw createError({
      statusCode: error.statusCode || error.status || 500,
      statusMessage: error.data?.message || error.message || 'Failed to retrieve event'
    })
  }
})
