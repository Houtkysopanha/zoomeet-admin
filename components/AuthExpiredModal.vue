<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-8 rounded-lg shadow-xl max-w-md mx-4">
      <div class="text-center">
        <div class="mb-4">
          <Icon name="heroicons:exclamation-triangle" class="w-16 h-16 text-yellow-500 mx-auto" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Session Expired</h2>
        <p class="text-gray-600 mb-6">
          Your session has expired for security reasons. Please log in again to continue.
        </p>
        <div class="space-y-3">
          <button 
            @click="redirectToLogin"
            class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
          <button 
            @click="checkAuth"
            class="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Check Again
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'

const emit = defineEmits(['close'])

const redirectToLogin = () => {
  // Clear any existing auth data
  const { clearAuth } = useAuth()
  clearAuth()
  
  // Redirect to login
  navigateTo('/login?session_expired=true&reason=user_action')
}

const checkAuth = () => {
  const { isTokenExpired } = useAuth()
  
  if (!isTokenExpired()) {
    // Token is valid now, close modal
    emit('close')
  } else {
    // Still expired, redirect
    redirectToLogin()
  }
}
</script>
