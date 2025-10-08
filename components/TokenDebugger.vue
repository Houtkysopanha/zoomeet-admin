<template>
      <!-- Enhanced Debug Panel -->
    <div v-if="showDebug" class="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-xl p-4 text-sm max-w-sm z-50">
      <div class="flex items-center justify-between mb-3">
        <span class="font-semibold text-gray-700">Token Monitor</span>
        <button @click="showDebug = false" class="text-gray-400 hover:text-gray-600">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
      
      <div class="space-y-3">
        <!-- Status Indicator -->
        <div class="flex items-center gap-2">
          <div :class="getStatusColor(tokenHealth.status)" class="w-3 h-3 rounded-full animate-pulse"></div>
          <span class="text-gray-600 text-xs">{{ tokenHealth.message }}</span>
        </div>
        
        <!-- Token Details -->
        <div v-if="tokenHealth.details" class="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <div v-if="tokenHealth.details.accessTokenMinutes !== undefined" class="flex justify-between">
            <span>Access:</span>
            <span class="font-mono">{{ tokenHealth.details.accessTokenMinutes }}m</span>
          </div>
          <div v-if="tokenHealth.details.refreshTokenMinutes !== undefined" class="flex justify-between">
            <span>Refresh:</span>
            <span class="font-mono">{{ Math.floor(tokenHealth.details.refreshTokenMinutes / 60) }}h</span>
          </div>
        </div>
        
        <!-- Monitoring Status -->
        <div v-if="isMonitoring" class="text-xs text-green-600 bg-green-50 p-2 rounded flex items-center gap-1">
          <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Auto-monitoring active</span>
        </div>
        
        <!-- Actions -->
        <div class="flex gap-1">
          <button 
            @click="checkToken" 
            class="flex-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
          >
            Check
          </button>
          <button 
            @click="testRefresh" 
            :disabled="isRefreshing"
            class="flex-1 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            {{ isRefreshing ? 'Refreshing...' : 'Refresh' }}
          </button>
          <button 
            @click="clearTokens" 
            class="flex-1 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
          >
            Clear
          </button>
        </div>
        
        <!-- Refresh Attempts -->
        <div v-if="refreshAttempts > 0" class="text-xs text-orange-600 bg-orange-50 p-1 rounded">
          Refresh attempts: {{ refreshAttempts }}
        </div>
      </div>
    </div>
    
    <!-- Floating Toggle Button -->
    <button 
      @click="showDebug = true"
      v-if="!showDebug && isDevelopment"
      class="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 z-40 transition-colors"
      title="Show token debug info"
    >
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
      </svg>
    </button>
</template>

<script setup>
const showDebug = ref(false)
const isDevelopment = process.env.NODE_ENV === 'development'

// Composables
const { 
  isAuthenticated, 
  refreshToken, 
  clearAuth, 
  isRefreshing 
} = useAuth()

const { 
  getTokenHealth, 
  checkAndRefreshToken, 
  isMonitoring, 
  refreshAttempts 
} = useTokenManager()

// Reactive token health
const tokenHealth = ref({ status: 'unknown', message: 'Checking...' })

// Update token health
const updateTokenHealth = () => {
  if (isAuthenticated.value) {
    tokenHealth.value = getTokenHealth()
  } else {
    tokenHealth.value = { status: 'unauthenticated', message: 'Not logged in' }
  }
}

// Manual token check
const checkToken = async () => {
  await checkAndRefreshToken()
  updateTokenHealth()
}

// Test refresh functionality
const testRefresh = async () => {
  try {
    const success = await refreshToken()
    if (success) {
    } else {
      console.warn('⚠️ Manual refresh failed')
    }
  } catch (error) {
    console.error('❌ Manual refresh error:', error)
  } finally {
    updateTokenHealth()
  }
}

// Clear tokens
const clearTokens = () => {
  clearAuth()
  updateTokenHealth()
  showDebug.value = false
}

// Get status indicator color
const getStatusColor = (status) => {
  const colors = {
    healthy: 'bg-green-500',
    warning: 'bg-yellow-500', 
    needs_refresh: 'bg-orange-500',
    expired: 'bg-red-500',
    refresh_expired: 'bg-red-700',
    unauthenticated: 'bg-gray-400'
  }
  return colors[status] || 'bg-gray-500'
}

// Setup periodic updates
onMounted(() => {
  updateTokenHealth()
  const interval = setInterval(updateTokenHealth, 10000) // Update every 10 seconds
  
  onUnmounted(() => {
    clearInterval(interval)
  })
})

// Watch authentication state changes
watch(isAuthenticated, updateTokenHealth)
</script>