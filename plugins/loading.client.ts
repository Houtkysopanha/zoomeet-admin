export default defineNuxtPlugin(() => {
  const nuxtApp = useNuxtApp()
  
  // Global loading state
  const isLoading = ref(false)
  const loadingText = ref('Loading...')
  const loadingProgress = ref(null)
  
  // Loading functions
  const showLoading = (text = 'Loading...', progress = null) => {
    isLoading.value = true
    loadingText.value = text
    loadingProgress.value = progress
  }
  
  const hideLoading = () => {
    isLoading.value = false
    loadingText.value = 'Loading...'
    loadingProgress.value = null
  }
  
  const updateProgress = (progress) => {
    loadingProgress.value = progress
  }
  
  // Auto-show loading on route changes
  nuxtApp.hook('page:start', () => {
    showLoading('Loading page...')
  })
  
  nuxtApp.hook('page:finish', () => {
    // Add a small delay to prevent flashing
    setTimeout(() => {
      hideLoading()
    }, 100)
  })
  
  // Handle navigation errors
  nuxtApp.hook('vue:error', () => {
    hideLoading()
  })
  
  // Provide loading utilities globally
  return {
    provide: {
      loading: {
        isLoading: readonly(isLoading),
        loadingText: readonly(loadingText),
        loadingProgress: readonly(loadingProgress),
        show: showLoading,
        hide: hideLoading,
        updateProgress
      }
    }
  }
})
