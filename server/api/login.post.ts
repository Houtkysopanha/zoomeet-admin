// server/api/login.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  try {

    // Use the actual external API URL, not the proxy URL
    const externalApiUrl = process.env.NODE_ENV === 'production'
      ? 'https://dev-gateway.prestigealliance.co/api/v1'
      : 'https://gateway.etickets.asia/api/v1'


    // Try multiple possible login endpoints
    const possibleEndpoints = [
      `${externalApiUrl}/auth/login`,
      `${externalApiUrl}/login`,
      `${externalApiUrl}/user/login`,
      `${externalApiUrl}/authentication/login`
    ]

    let response = null
    let lastError = null

    for (const endpoint of possibleEndpoints) {
      try {
        response = await $fetch(endpoint, {
          method: 'POST',
          body: body,
          headers: {
            'Content-Type': 'application/json',
          },
        })
        break
      } catch (error: any) {
        console.log(`❌ Failed with endpoint ${endpoint}:`, error.statusCode || error.status)
        lastError = error
        continue
      }
    }

    if (!response) {
      console.error('❌ All login endpoints failed, using last error:', lastError)
      throw lastError
    }

    console.log('Server-side login response:', response)
    return response
  } catch (error: any) {
    console.error('Server-side login error:', error)
    throw createError({
      statusCode: error.statusCode || error.status || 500,
      statusMessage: error.data?.message || error.message || 'Login failed'
    })
  }
})
