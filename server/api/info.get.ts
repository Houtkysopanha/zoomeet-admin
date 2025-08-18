// server/api/info.get.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  try {
    console.log('Server-side user info request')

    // Use the actual external API URL, not the proxy URL
    const externalApiUrl = process.env.NODE_ENV === 'development' 
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

    const response = await $fetch(`${externalApiUrl}/info`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    })

    console.log('Server-side user info response:', response)
    return response
  } catch (error: any) {
    console.error('Server-side user info error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.data?.message || error.message || 'Failed to fetch user info'
    })
  }
})