// composables/useAuth.ts
export const useAuth = () => {
  const user = useState('user', () => null)
  const token = useState('token', () => null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const login = async (identifier: string, password: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch('https://dev-gateway.prestigealliance.co/api/v1/login', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${useRuntimeConfig().public.baseToken}`, // use public token from nuxt.config
        },
        body: { identifier, password },
      })

    //   token.value = response.token || null
    //   user.value = response.user || null

      // Persist token & user (consider using cookie if you want SSR)
      localStorage.setItem('token', token.value!)
      localStorage.setItem('user', JSON.stringify(user.value))

      return { success: true }
    } catch (err: any) {
      error.value = err?.data?.message || err?.message || 'Login failed'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    token,
    loading,
    error,
    login,
  }
}
