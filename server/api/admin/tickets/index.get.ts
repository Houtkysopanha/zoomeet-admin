export default defineEventHandler(async (event) => {
  try {
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

    // Forward the GET request to the external API
    const response = await $fetch(`${externalApiUrl}/tickets`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    // Return the response from the external API
    return response

  } catch (error: any) {
    console.error('Error in tickets listing proxy:', error)
    
    // Handle different error types
    if (error.status || error.statusCode) {
      throw createError({
        statusCode: error.status || error.statusCode,
        statusMessage: error.message || error.statusMessage || 'Tickets listing failed'
      })
    }

    // Generic server error
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error during tickets listing'
    })
  }
})
