export default defineEventHandler(async (event) => {
  try {
    // Get the request body
    const body = await readBody(event)
    
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

    // Handle file upload with FormData
    let requestOptions: any = {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
      }
    }

    // Check if this is a FormData request (file upload)
    const contentType = getHeader(event, 'content-type')
    if (contentType && contentType.includes('multipart/form-data')) {
      // For FormData, we need to pass the raw body and let fetch handle the boundary
      requestOptions.body = body
    } else {
      // For JSON requests
      requestOptions.headers['Content-Type'] = 'application/json'
      requestOptions.headers['Accept'] = 'application/json'
      requestOptions.body = JSON.stringify(body)
    }

    // Forward the request to the external API
    const response = await $fetch(`${externalApiUrl}/tickets`, requestOptions)

    // Return the response from the external API
    return response

  } catch (error: any) {
    console.error('Error in ticket creation proxy:', error)
    
    // Handle different error types
    if (error.status || error.statusCode) {
      throw createError({
        statusCode: error.status || error.statusCode,
        statusMessage: error.message || error.statusMessage || 'Ticket creation failed'
      })
    }

    // Generic server error
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error during ticket creation'
    })
  }
})
