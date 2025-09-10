// server/api/events/categories.get.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  try {
    console.log('Server-side categories request')

    // Use the actual external API URL, not the proxy URL - FIXED: Remove /admin for categories
    const externalApiUrl = process.env.NODE_ENV === 'production' 
      ? 'https://dev-gateway.prestigealliance.co/api/v1'
      : 'https://gateway.etickets.asia/api/v1'

    console.log('Server-side API URL:', externalApiUrl)

    // Get authorization header from the request
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authorization header required'
      })
    }

    const response = await $fetch(`${externalApiUrl}/events/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': authHeader,
      },
    })

    console.log('Server-side categories response:', response)
    return response
  } catch (error: any) {
    console.error('Server-side categories error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.data?.message || error.message || 'Failed to fetch categories'
    })
  }
})