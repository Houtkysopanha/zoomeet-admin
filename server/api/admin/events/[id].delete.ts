export default defineEventHandler(async (event) => {
  try {
    // Get the event ID from the route parameters
    const eventId = getRouterParam(event, 'id')
    
    if (!eventId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Event ID is required'
      })
    }

    // Get the authorization header from the incoming request
    const authHeader = getHeader(event, 'authorization')
    
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authorization header is required'
      })
    }

    // Get runtime config for external API URL
    const config = useRuntimeConfig()
    const externalApiUrl = config.public.apiAdminBaseUrl

    if (!externalApiUrl) {
      throw createError({
        statusCode: 500,
        statusMessage: 'External API URL not configured'
      })
    }

    // Forward the DELETE request to the external API
    const response = await $fetch(`${externalApiUrl}/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    // Return the response from the external API
    return response

  } catch (error: any) {
    console.error('Error in event deletion proxy:', error)
    
    // Handle different error types
    if (error.status || error.statusCode) {
      throw createError({
        statusCode: error.status || error.statusCode,
        statusMessage: error.message || error.statusMessage || 'Event deletion failed'
      })
    }

    // Generic server error
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error during event deletion'
    })
  }
})
