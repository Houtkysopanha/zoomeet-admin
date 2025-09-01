// server/utils/api-config.ts
export function getExternalApiConfig() {
  const config = useRuntimeConfig()
  
  // Get base URL without /admin suffix
  const externalApiUrl = config.public.apiAdminBaseUrl.replace('/admin', '')
  
  return {
    baseUrl: externalApiUrl,
    adminUrl: config.public.apiAdminBaseUrl,
    environment: config.public.environment
  }
}

export function getAuthHeaders(event: any) {
  const allHeaders = getHeaders(event)
  
  // Get auth token from headers (try multiple header formats)
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
    throw createError({
      statusCode: 401,
      statusMessage: 'Authorization token required'
    })
  }

  // Ensure Bearer format
  if (!authHeader.startsWith('Bearer ')) {
    authHeader = `Bearer ${authHeader}`
  }

  return {
    'Authorization': authHeader,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
}
