export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const eventId = getRouterParam(event, 'eventId')
    
    if (!eventId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Event ID is required'
      })
    }

    // Get Authorization header from the request
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authorization header is required'
      })
    }

    // Use runtime config instead of hardcoded URLs
    const externalApiUrl = config.public.apiAdminBaseUrl.replace('/admin', '')
    
    const apiUrl = `${externalApiUrl}/admin/events/${eventId}/organizer`
    console.log('🔗 Organizer API URL from config:', apiUrl)
    console.log('🔗 Environment:', config.public.environment)
    
    const response = await $fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    return response
  } catch (error: any) {
    console.error('❌ Organizer API proxy error:', error)
    
    // Handle specific error cases
    if (error?.status === 401) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - Please login again'
      })
    }
    
    if (error?.status === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Event not found or no organizers assigned'
      })
    }
    
    if (error?.status === 403) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied - Insufficient permissions'
      })
    }

    // Generic server error
    throw createError({
      statusCode: error?.status || 500,
      statusMessage: error?.message || 'Failed to fetch organizers'
    })
  }
})
