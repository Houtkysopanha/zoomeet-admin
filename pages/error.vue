<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
    <div class="text-center px-6 py-12 max-w-lg mx-auto">
      <!-- Animated 404 Icon -->
      <div class="mb-8">
        <div class="relative inline-block">
          <Icon 
            name="heroicons:exclamation-triangle" 
            class="text-8xl text-purple-500 animate-bounce"
          />
          <div class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      <!-- Error Code -->
      <h1 class="text-6xl font-bold text-gray-800 mb-4 animate-pulse">
        {{ error?.statusCode || '404' }}
      </h1>

      <!-- Error Message -->
      <h2 class="text-2xl font-semibold text-gray-700 mb-4">
        {{ getErrorTitle() }}
      </h2>

      <p class="text-gray-600 mb-8 leading-relaxed">
        {{ getErrorMessage() }}
      </p>

      <!-- Action Buttons -->
      <div class="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
        <button
          @click="goHome"
          class="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          <Icon name="heroicons:home" class="inline-block w-5 h-5 mr-2" />
          Go Home
        </button>

        <button
          @click="goBack"
          class="w-full sm:w-auto px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          <Icon name="heroicons:arrow-left" class="inline-block w-5 h-5 mr-2" />
          Go Back
        </button>

        <button
          @click="refresh"
          class="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          <Icon name="heroicons:arrow-path" class="inline-block w-5 h-5 mr-2" />
          Refresh
        </button>
      </div>

      <!-- Additional Help -->
      <div class="mt-12 p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20">
        <h3 class="text-lg font-semibold text-gray-800 mb-3">Need Help?</h3>
        <p class="text-gray-600 text-sm">
          If you continue to experience issues, please contact our support team or try accessing the page again later.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Define page meta
definePageMeta({
  layout: false
})

// Get error from route params or default
const route = useRoute()
const error = route.params.error || { statusCode: 404 }

// Helper functions
const getErrorTitle = () => {
  const statusCode = error?.statusCode || 404
  
  switch (statusCode) {
    case 404:
      return 'Page Not Found'
    case 403:
      return 'Access Forbidden'
    case 500:
      return 'Server Error'
    case 401:
      return 'Unauthorized'
    default:
      return 'Something Went Wrong'
  }
}

const getErrorMessage = () => {
  const statusCode = error?.statusCode || 404
  
  switch (statusCode) {
    case 404:
      return "The page you're looking for doesn't exist or has been moved. Please check the URL and try again."
    case 403:
      return "You don't have permission to access this resource. Please contact an administrator if you believe this is an error."
    case 500:
      return "We're experiencing technical difficulties. Our team has been notified and is working to resolve the issue."
    case 401:
      return "You need to be logged in to access this page. Please sign in and try again."
    default:
      return "An unexpected error occurred. Please try refreshing the page or contact support if the problem persists."
  }
}

// Navigation functions
const goHome = () => {
  const { isAuthenticated } = useAuth()
  
  if (isAuthenticated.value) {
    navigateTo('/admin/dashboard')
  } else {
    navigateTo('/login')
  }
}

const goBack = () => {
  if (process.client && window.history.length > 1) {
    window.history.back()
  } else {
    goHome()
  }
}

const refresh = () => {
  if (process.client) {
    window.location.reload()
  }
}

// Set page title
useHead({
  title: `${error?.statusCode || '404'} - ${getErrorTitle()}`,
  meta: [
    { name: 'description', content: getErrorMessage() }
  ]
})
</script>

<style scoped>
/* Additional animations */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* Gradient background animation */
.bg-gradient-to-br {
  background-size: 400% 400%;
  animation: gradientShift 8s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style>
