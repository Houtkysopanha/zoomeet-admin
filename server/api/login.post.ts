// server/api/login.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  try {
    console.log('Server-side login attempt:', { identifier: body.identifier })

    const response = await $fetch(`${config.public.apiBaseUrl}/login`, {
      method: 'POST',
      body: body,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('Server-side login response:', response)
    return response
  } catch (error: any) {
    console.error('Server-side login error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.data?.message || error.message || 'Login failed'
    })
  }
})
