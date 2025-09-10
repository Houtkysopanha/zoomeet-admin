// server/api/[...].ts - Generic catch-all proxy for remaining API endpoints
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  try {
    // Get the path after /api/
    const path = event.context.params?._ || ''
    const method = getMethod(event)
    
    console.log(`Server-side generic API request: ${method} /${path}`)

    // Skip if this is already handled by specific handlers
    if (path.startsWith('login') || path.startsWith('info') || 
        path.startsWith('admin/') || path.startsWith('events/categories')) {
      // Let the specific handlers handle these
      return
    }

    // Use the appropriate external API URL based on the path
    let externalApiUrl
    if (path.startsWith('admin/') || path.includes('/admin/')) {
      // Admin endpoints
      externalApiUrl = process.env.NODE_ENV === 'production' 
        ? 'https://dev-apiticket.prestigealliance.co/api/v1'
        : 'https://api-ticket.etickets.asia/api/v1'
    } else {
      // Regular API endpoints
      externalApiUrl = process.env.NODE_ENV === 'production' 
        ? 'https://dev-gateway.prestigealliance.co/api/v1'
        : 'https://gateway.etickets.asia/api/v1'
    }

    const fullUrl = `${externalApiUrl}/${path}`
    console.log('Server-side generic API URL:', fullUrl)

    // Get authorization header from the request
    const authHeader = getHeader(event, 'authorization')
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Accept': 'application/json'
    }

    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    // Handle request body and content type
    let body = undefined
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const contentType = getHeader(event, 'content-type')
      
      if (contentType?.includes('multipart/form-data')) {
        // For FormData, get the raw body and preserve content-type
        body = await readRawBody(event)
        if (contentType) {
          headers['Content-Type'] = contentType
        }
      } else {
        // For JSON data
        body = await readBody(event)
        headers['Content-Type'] = 'application/json'
      }
    }

    // Get query parameters
    const query = getQuery(event)
    const queryString = Object.keys(query).length > 0 
      ? '?' + new URLSearchParams(query as Record<string, string>).toString()
      : ''

    const response = await $fetch(`${fullUrl}${queryString}`, {
      method: method as any,
      body: body,
      headers: headers,
    })


    return response
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.data?.message || error.message || 'API request failed'
    })
  }
})