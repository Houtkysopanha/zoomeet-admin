import { useFetch, useRuntimeConfig } from '#app'

export async function login(identifier, password) {
  const config = useRuntimeConfig()
  const API_BASE_URL = config.public.apiBaseUrl

  if (!API_BASE_URL) {
    throw new Error('API base URL is not configured.')
  }

  const { data, error } = await useFetch(`${API_BASE_URL}/login`, {
  method: 'POST',
  body: JSON.stringify({ identifier, password }),
  headers: {
    'Content-Type': 'application/json',
  },
})


  if (error.value) {
    throw new Error(error.value.data?.message || error.value.statusMessage)
  }

  return data.value
}
