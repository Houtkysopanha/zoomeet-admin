<template>
  <div class="p-8 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">🔍 Token Debug Dashboard</h1>
    
    <!-- Current Token Status -->
    <div class="bg-white shadow rounded-lg p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Current Token Status</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="text-center p-4 bg-gray-50 rounded">
          <div class="text-2xl font-bold" :class="isAuthenticated ? 'text-green-600' : 'text-red-600'">
            {{ isAuthenticated ? '✅' : '❌' }}
          </div>
          <div class="text-sm">Authenticated</div>
        </div>
        
        <div class="text-center p-4 bg-gray-50 rounded">
          <div class="text-2xl font-bold" :class="hasAccessToken ? 'text-green-600' : 'text-red-600'">
            {{ hasAccessToken ? '✅' : '❌' }}
          </div>
          <div class="text-sm">Access Token</div>
        </div>
        
        <div class="text-center p-4 bg-gray-50 rounded">
          <div class="text-2xl font-bold" :class="hasRefreshToken ? 'text-green-600' : 'text-red-600'">
            {{ hasRefreshToken ? '✅' : '❌' }}
          </div>
          <div class="text-sm">Refresh Token</div>
        </div>
        
        <div class="text-center p-4 bg-gray-50 rounded">
          <div class="text-2xl font-bold" :class="getStatusColor(tokenStatus)">
            {{ getStatusIcon(tokenStatus) }}
          </div>
          <div class="text-sm">{{ tokenStatus }}</div>
        </div>
      </div>
    </div>

    <!-- Token Timing -->
    <div class="bg-white shadow rounded-lg p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Token Timing</h2>
      <div class="space-y-4">
        <div class="flex justify-between items-center p-3 bg-blue-50 rounded">
          <span>Access Token Expires In:</span>
          <span class="font-mono text-lg" :class="accessTimeLeft < 5 * 60 * 1000 ? 'text-red-600' : 'text-green-600'">
            {{ formatTime(accessTimeLeft) }}
          </span>
        </div>
        
        <div class="flex justify-between items-center p-3 bg-green-50 rounded">
          <span>Refresh Token Expires In:</span>
          <span class="font-mono text-lg text-green-600">
            {{ formatTime(refreshTimeLeft) }}
          </span>
        </div>
        
        <div class="flex justify-between items-center p-3 bg-yellow-50 rounded">
          <span>Should Refresh Token:</span>
          <span class="font-bold" :class="shouldRefresh ? 'text-orange-600' : 'text-green-600'">
            {{ shouldRefresh ? 'YES' : 'NO' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="bg-white shadow rounded-lg p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Actions</h2>
      <div class="flex flex-wrap gap-3">
        <button 
          @click="checkTokenState" 
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          🔍 Check State
        </button>
        
        <button 
          @click="testRefresh" 
          :disabled="isRefreshing"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {{ isRefreshing ? '🔄 Refreshing...' : '🔄 Test Refresh' }}
        </button>
        
        <button 
          @click="forceRefresh" 
          class="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          ⚡ Force Refresh
        </button>
        
        <button 
          @click="clearAuth" 
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          🗑️ Clear Auth
        </button>
      </div>
    </div>

    <!-- Debug Logs -->
    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-xl font-semibold mb-4">Debug Logs</h2>
      <div class="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
        <div v-for="(log, index) in logs" :key="index" class="mb-1">
          {{ log }}
        </div>
      </div>
      <button @click="clearLogs" class="mt-2 px-3 py-1 bg-gray-500 text-white rounded text-sm">
        Clear Logs
      </button>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin'
})

const logs = ref([])
const isRefreshing = ref(false)

// Auth composable
const { 
  isAuthenticated,
  getToken,
  getRefreshToken,
  isTokenExpired,
  isRefreshTokenExpired,
  shouldRefreshToken,
  refreshToken,
  clearAuth: clearAuthData,
  getTimeUntilExpiry,
  getTimeUntilRefreshExpiry,
  getTokenStatus
} = useAuth()

// Computed properties
const hasAccessToken = computed(() => !!getToken())
const hasRefreshToken = computed(() => !!getRefreshToken())
const tokenStatus = computed(() => getTokenStatus())
const accessTimeLeft = computed(() => getTimeUntilExpiry() || 0)
const refreshTimeLeft = computed(() => getTimeUntilRefreshExpiry() || 0)
const shouldRefresh = computed(() => shouldRefreshToken())

// Logging function
const addLog = (message) => {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.push(`[${timestamp}] ${message}`)
  console.log(message)
}

// Actions
const checkTokenState = () => {
  addLog('🔍 Checking token state...')
  addLog(`- Authenticated: ${isAuthenticated.value}`)
  addLog(`- Access Token: ${hasAccessToken.value ? 'Present' : 'Missing'}`)
  addLog(`- Refresh Token: ${hasRefreshToken.value ? 'Present' : 'Missing'}`)
  addLog(`- Access Expired: ${isTokenExpired()}`)
  addLog(`- Refresh Expired: ${isRefreshTokenExpired()}`)
  addLog(`- Should Refresh: ${shouldRefresh.value}`)
  addLog(`- Token Status: ${tokenStatus.value}`)
}

const testRefresh = async () => {
  isRefreshing.value = true
  addLog('🔄 Testing token refresh...')
  
  try {
    const success = await refreshToken()
    if (success) {
      addLog('✅ Token refresh successful!')
    } else {
      addLog('❌ Token refresh failed!')
    }
  } catch (error) {
    addLog(`❌ Token refresh error: ${error.message}`)
  } finally {
    isRefreshing.value = false
  }
}

const forceRefresh = async () => {
  addLog('⚡ Forcing token refresh regardless of expiry...')
  
  // Simulate expired token for testing
  const { setAuth } = useAuth()
  const currentAuth = JSON.parse(localStorage.getItem('zoomeet_auth') || '{}')
  
  if (currentAuth.access_token) {
    // Set expiry to past date to force refresh
    currentAuth.accessTokenExpiresAt = new Date(Date.now() - 1000).toISOString()
    localStorage.setItem('zoomeet_auth', JSON.stringify(currentAuth))
    
    addLog('⚡ Token expiry set to past date')
    await testRefresh()
  } else {
    addLog('❌ No token to expire')
  }
}

const clearAuth = () => {
  addLog('🗑️ Clearing authentication...')
  clearAuthData()
  addLog('✅ Authentication cleared')
}

const clearLogs = () => {
  logs.value = []
}

// Helper functions
const formatTime = (ms) => {
  if (!ms || ms < 0) return '00:00'
  
  const hours = Math.floor(ms / (60 * 60 * 1000))
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000))
  const seconds = Math.floor((ms % (60 * 1000)) / 1000)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m ${seconds}s`
  }
}

const getStatusColor = (status) => {
  const colors = {
    valid: 'text-green-600',
    needs_refresh: 'text-orange-600',
    expired: 'text-red-600',
    refresh_expired: 'text-red-700',
    missing: 'text-gray-500'
  }
  return colors[status] || 'text-gray-500'
}

const getStatusIcon = (status) => {
  const icons = {
    valid: '✅',
    needs_refresh: '⚠️',
    expired: '❌',
    refresh_expired: '💀',
    missing: '❓'
  }
  return icons[status] || '❓'
}

// Auto-update every second
onMounted(() => {
  addLog('🚀 Token Debug Dashboard mounted')
  checkTokenState()
  
  const interval = setInterval(() => {
    // Trigger reactivity update
  }, 1000)
  
  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>