// server/api/admin/events.post.ts
export default defineEventHandler(async (event) => {
  try {
    const formData = await readFormData(event)
    const config = useRuntimeConfig()

    // Use runtime config instead of hardcoded URLs
    const externalApiUrl = config.public.apiAdminBaseUrl.replace('/admin', '')

    console.log('🚀 Creating event via server proxy:', externalApiUrl)
    console.log('🔗 Environment:', config.public.environment)

    // Get auth token from headers
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authorization token required'
      })
    }

    // Forward the request to external API - FIXED: Include /admin in the path
    const response = await $fetch(`${externalApiUrl}/admin/events`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': authHeader
      }
    })

    console.log('✅ Event created successfully')
    return response

  } catch (error: any) {
    console.error('❌ Server-side event creation error:', error)
    
    // Handle specific error types
    if (error.statusCode === 413 || error.status === 413) {
      throw createError({
        statusCode: 413,
        statusMessage: 'File too large. Please reduce image sizes and try again.'
      })
    }

    if (error.statusCode === 422 || error.status === 422) {
      throw createError({
        statusCode: 422,
        statusMessage: error.data?.message || 'Validation failed',
        data: error.data
      })
    }

    throw createError({
      statusCode: error.statusCode || error.status || 500,
      statusMessage: error.data?.message || error.message || 'Failed to create event'
    })
  }
})
