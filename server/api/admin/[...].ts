// server/api/admin/[...].ts - Catch-all proxy for admin API endpoints
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  try {
    // Get the path after /api/admin/
    const path = event.context.params?._ || ''
    const method = getMethod(event)
    
    console.log(`Server-side admin API request: ${method} /admin/${path}`)

    // Use runtime config instead of hardcoded URLs
    const externalApiUrl = config.public.apiAdminBaseUrl.replace('/admin', '')

    const fullUrl = `${externalApiUrl}/admin/${path}`
    console.log('Server-side admin API URL from config:', fullUrl)
    console.log('🔗 Environment:', config.public.environment)

    // Get authorization header from the request (try multiple formats)
    const allHeaders = getHeaders(event)
    let authHeader = getHeader(event, 'authorization') || getHeader(event, 'Authorization')
    
    if (!authHeader) {
      for (const [key, value] of Object.entries(allHeaders)) {
        if (key.toLowerCase() === 'authorization') {
          authHeader = value as string
          break
        }
      }
    }
    
    if (!authHeader) {
      console.error('❌ No authorization header found in catch-all handler')
      throw createError({
        statusCode: 401,
        statusMessage: 'Authorization header required'
      })
    }

    // Ensure Bearer format
    if (!authHeader.startsWith('Bearer ')) {
      authHeader = `Bearer ${authHeader}`
    }


    // Prepare headers
    const headers: Record<string, string> = {
      'Authorization': authHeader,
      'Accept': 'application/json'
    }

    // Handle request body and content type
    let body = undefined
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const contentType = getHeader(event, 'content-type')
      
      if (contentType?.includes('multipart/form-data')) {
        // For FormData, we need to handle it properly
        
        // Get the raw body as FormData
        const formData = await readMultipartFormData(event)
        
        if (formData) {
          // Create a new FormData object for the external API
          const newFormData = new FormData()
          
          for (const field of formData) {
            if (field.filename) {
              // This is a file field - convert Buffer to Uint8Array for Blob
              const uint8Array = new Uint8Array(field.data)
              const blob = new Blob([uint8Array], { type: field.type || 'application/octet-stream' })
              newFormData.append(field.name || 'file', blob, field.filename)

            } else {
              // This is a text field
              const value = field.data.toString()
              newFormData.append(field.name || 'field', value)
              
              // Special logging for chair data
              if (field.name && field.name.includes('chairs[')) {
               
              } else {
              
              }
            }
          }
          
          // Log all FormData entries for debugging
          for (const [key, value] of newFormData.entries()) {
            if (typeof value === 'object' && value !== null && 'size' in value) {
              const fileValue = value as any
            } else {
            }
          }
          
          body = newFormData
          // Don't set Content-Type for FormData - let the browser set it with boundary
          delete headers['Content-Type']
        } else {
          console.warn('⚠️ No FormData found in multipart request')
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
    const currentMethod = getMethod(event)
    const currentPath = event.context.params?._ || ''
    
    console.error(`❌ Server-side admin API error for ${currentMethod} /admin/${currentPath}:`, {
      status: error.statusCode || error.status,
      message: error.message,
      data: error.data
    })
    
    // Forward the exact error from the external API
    throw createError({
      statusCode: error.statusCode || error.status || 500,
      statusMessage: error.statusMessage || error.message || 'Admin API request failed',
      data: error.data
    })
  }
})