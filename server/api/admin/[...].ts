// server/api/admin/[...].ts - Catch-all proxy for admin API endpoints
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  try {
    // Get the path after /api/admin/
    const path = event.context.params?._ || ''
    const method = getMethod(event)
    
    // console.log(`Server-side admin API request: ${method} /admin/${path}`)

    // Use the actual external admin API URL
    const externalApiUrl = process.env.NODE_ENV === 'development'
      ? 'https://dev-apiticket.prestigealliance.co/api/v1/admin'
      : 'https://api-ticket.etickets.asia/api/v1/admin'

    const fullUrl = `${externalApiUrl}/${path}`
    // console.log('Server-side admin API URL:', fullUrl)

    // Get authorization header from the request
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authorization header required'
      })
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
        console.log('📎 Handling FormData request')
        
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
              // console.log(`📎 Added file field: ${field.name} = ${field.filename} (${field.data.length} bytes)`)
            } else {
              // This is a text field
              const value = field.data.toString()
              newFormData.append(field.name || 'field', value)
              
              // Special logging for chair data
              // if (field.name && field.name.includes('chairs[')) {
              //   console.log(`🪑 Chair field processed: ${field.name} = ${value}`)
              // } else {
              //   console.log(`📝 Added text field: ${field.name} = ${value}`)
              // }
            }
          }
          
          // Log all FormData entries for debugging
          console.log('📋 Complete FormData being sent to external API:')
          for (const [key, value] of newFormData.entries()) {
            if (typeof value === 'object' && value !== null && 'size' in value) {
              const fileValue = value as any
              // console.log(`  ${key}: [File/Blob] ${fileValue.name || 'unnamed'} (${fileValue.size} bytes)`)
            } 
            // else {
            //   console.log(`  ${key}: ${value}`)
            // }
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
        // console.log('📝 Handling JSON request:', body)
      }
    }

    // Get query parameters
    const query = getQuery(event)
    const queryString = Object.keys(query).length > 0
      ? '?' + new URLSearchParams(query as Record<string, string>).toString()
      : ''

    // console.log('📤 Making request to external API:', {
    //   url: `${fullUrl}${queryString}`,
    //   method,
    //   hasBody: !!body,
    //   bodyType: body instanceof FormData ? 'FormData' : typeof body,
    //   headers: Object.keys(headers)
    // })

    const response = await $fetch(`${fullUrl}${queryString}`, {
      method: method as any,
      body: body,
      headers: headers,
    })

    // console.log(`✅ Server-side admin API response for ${method} /admin/${path}:`, response)
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