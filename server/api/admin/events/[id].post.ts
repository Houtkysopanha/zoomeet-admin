// server/api/admin/events/[id].post.ts
export default defineEventHandler(async (event) => {
  try {
    const formData = await readFormData(event)
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
    
    console.log('🔄 Updating event via server proxy:', eventId)
    console.log('🔗 External API URL from config:', externalApiUrl)

    // Get all headers to debug
    const allHeaders = getHeaders(event)

    // Get auth token from headers (try multiple header formats)
    let authHeader = getHeader(event, 'authorization') || getHeader(event, 'Authorization')
    
    if (!authHeader) {
      for (const [key, value] of Object.entries(allHeaders)) {
        if (key.toLowerCase() === 'authorization') {
          authHeader = value
          break
        }
      }
    }
    
    if (!authHeader) {
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
      method: 'POST', // Laravel uses POST with _method override
      body: formData,
      headers: {
        'Authorization': authHeader
      }
    })

    console.log('✅ Event updated successfully:', eventId)
    return response

  } catch (error: any) {
    console.error('❌ Server-side event update error:', error)
    
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

    if (error.statusCode === 404 || error.status === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Event not found'
      })
    }

    throw createError({
      statusCode: error.statusCode || error.status || 500,
      statusMessage: error.data?.message || error.message || 'Failed to update event'
    })
  }
})
