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
        404
      </h1>

      <!-- Error Message -->
      <h2 class="text-2xl font-semibold text-gray-700 mb-4">
        Page Not Found
      </h2>

      <p class="text-gray-600 mb-4 leading-relaxed">
        The page you're looking for doesn't exist or has been moved.
      </p>

      <!-- Show the attempted URL -->
      <div class="mb-8 p-4 bg-gray-100 rounded-lg">
        <p class="text-sm text-gray-600">
          <strong>Attempted URL:</strong> 
          <code class="bg-gray-200 px-2 py-1 rounded text-xs">{{ route.fullPath }}</code>
        </p>
      </div>

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
          @click="searchSuggestions"
          class="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          <Icon name="heroicons:magnifying-glass" class="inline-block w-5 h-5 mr-2" />
          Search
        </button>
      </div>

      <!-- Suggested Pages -->
      <div class="mt-12 p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Try these pages instead:</h3>
        <div class="space-y-2">
          <NuxtLink 
            to="/admin/dashboard" 
            class="block text-purple-600 hover:text-purple-800 hover:underline transition-colors"
          >
            📊 Dashboard
          </NuxtLink>
          <NuxtLink 
            to="/admin/event" 
            class="block text-purple-600 hover:text-purple-800 hover:underline transition-colors"
          >
            🎫 Events
          </NuxtLink>
          <NuxtLink 
            to="/admin/CreateEvent" 
            class="block text-purple-600 hover:text-purple-800 hover:underline transition-colors"
          >
            ➕ Create Event
          </NuxtLink>
          <NuxtLink 
            to="/admin/booking" 
            class="block text-purple-600 hover:text-purple-800 hover:underline transition-colors"
          >
            📋 Bookings
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Define page meta
definePageMeta({
  layout: false
})

// Get current route
const route = useRoute()

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

const searchSuggestions = () => {
  // Simple search logic - redirect to dashboard for now
  // In a real app, you might implement actual search
  goHome()
}

// Set page title and meta
useHead({
  title: '404 - Page Not Found',
  meta: [
    { name: 'description', content: 'The page you are looking for could not be found.' },
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})

// Set status code for SSR
if (process.server) {
  setResponseStatus(404)
}
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

/* Code styling */
code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
</style>
