<template>
  <div class="p-6">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Refresh Token Test</h1>
      
      <!-- Auth Status Display -->
      <div class="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 class="text-lg font-semibold mb-3">Authentication Status</h2>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Token Status:</strong> 
            <span :class="isAuthenticated ? 'text-green-600' : 'text-red-600'">
              {{ isAuthenticated ? 'Valid' : 'Invalid/Missing' }}
            </span>
          </div>
          <div>
            <strong>Token Expires:</strong> 
            <span :class="expirationColor">{{ formattedExpiration }}</span>
          </div>
          <div>
            <strong>Should Refresh:</strong> 
            <span :class="shouldRefresh ? 'text-yellow-600' : 'text-green-600'">
              {{ shouldRefresh ? 'Yes' : 'No' }}
            </span>
          </div>
          <div>
            <strong>Refresh Token:</strong> 
            <span :class="hasRefreshToken ? 'text-green-600' : 'text-red-600'">
              {{ hasRefreshToken ? 'Available' : 'Missing' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Test Controls -->
      <div class="bg-white border rounded-lg p-4 mb-6">
        <h2 class="text-lg font-semibold mb-3">Test Controls</h2>
        <div class="flex gap-4 flex-wrap">
          <button 
            @click="testTokenRefresh" 
            :disabled="refreshing"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {{ refreshing ? 'Refreshing...' : 'Test Token Refresh' }}
          </button>
          
          <button 
            @click="testAPICall" 
            :disabled="testing"
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {{ testing ? 'Testing...' : 'Test API Call' }}
          </button>
          
          <button 
            @click="clearAuth" 
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear Auth
          </button>
          
          <button 
            @click="refreshData" 
            class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Refresh Data
          </button>
        </div>
      </div>

      <!-- Test Results -->
      <div class="bg-white border rounded-lg p-4 mb-6">
        <h2 class="text-lg font-semibold mb-3">Test Results</h2>
        <div class="space-y-2 max-h-96 overflow-y-auto">
          <div 
            v-for="(log, index) in testLogs" 
            :key="index"
            :class="getLogClass(log.type)"
            class="p-2 rounded text-sm"
          >
            <span class="font-mono text-xs text-gray-500">{{ log.timestamp }}</span>
            <br>
            <span class="font-semibold">{{ log.type.toUpperCase() }}:</span> {{ log.message }}
            <pre v-if="log.data" class="mt-1 text-xs">{{ JSON.stringify(log.data, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- Token Details (Debug) -->
      <div class="bg-gray-50 border rounded-lg p-4">
        <h2 class="text-lg font-semibold mb-3">Token Details (Debug)</h2>
        <pre class="text-xs overflow-x-auto">{{ JSON.stringify(debugInfo, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

// Reactive data
const refreshing = ref(false)
const testing = ref(false)
const testLogs = ref([])

// Auth composable
const { 
  isAuthenticated, 
  getTimeUntilExpiry, 
  shouldRefreshToken, 
  refreshToken, 
  clearAuth: authClearAuth,
  getToken,
  getRefreshToken,
  user,
  isTokenExpired
} = useAuth()

// API composable  
const { fetchUserInfo } = $api

// Computed properties
const hasRefreshToken = computed(() => !!getRefreshToken())
const shouldRefresh = computed(() => shouldRefreshToken())

const formattedExpiration = computed(() => {
  const timeInfo = getTimeUntilExpiry()
  if (!timeInfo || isTokenExpired()) return 'Expired'
  
  const seconds = Math.max(0, timeInfo.secondsUntilExpiry)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  return `${minutes}m ${remainingSeconds}s`
})

const expirationColor = computed(() => {
  if (isTokenExpired()) return 'text-red-600'
  
  const timeInfo = getTimeUntilExpiry()
  if (!timeInfo) return 'text-red-600'
  
  const seconds = timeInfo.secondsUntilExpiry
  if (seconds < 300) return 'text-yellow-600' // Less than 5 minutes
  return 'text-green-600'
})

const debugInfo = computed(() => ({
  token: getToken() ? getToken().substring(0, 20) + '...' : null,
  refreshToken: getRefreshToken() ? getRefreshToken().substring(0, 20) + '...' : null,
  user: user.value ? {
    id: user.value.id,
    email: user.value.email,
    loginTime: user.value.loginTime,
    expiresAt: user.value.expiresAt
  } : null,
  timeUntilExpiry: getTimeUntilExpiry(),
  isExpired: isTokenExpired()
}))

// Helper functions
const addLog = (type, message, data = null) => {
  testLogs.value.unshift({
    type,
    message,
    data,
    timestamp: new Date().toISOString().split('T')[1].split('.')[0]
  })
  
  // Keep only last 50 logs
  if (testLogs.value.length > 50) {
    testLogs.value = testLogs.value.slice(0, 50)
  }
}

const getLogClass = (type) => {
  switch (type) {
    case 'success': return 'bg-green-100 border-green-300'
    case 'error': return 'bg-red-100 border-red-300'
    case 'warning': return 'bg-yellow-100 border-yellow-300'
    default: return 'bg-blue-100 border-blue-300'
  }
}

// Test functions
const testTokenRefresh = async () => {
  refreshing.value = true
  addLog('info', 'Starting token refresh test...')
  
  try {
    const result = await refreshToken()
    
    if (result) {
      addLog('success', 'Token refresh successful!')
    } else {
      addLog('error', 'Token refresh failed')
    }
  } catch (error) {
    addLog('error', 'Token refresh error', { error: error.message })
  } finally {
    refreshing.value = false
  }
}

const testAPICall = async () => {
  testing.value = true
  addLog('info', 'Testing API call with current token...')
  
  try {
    const userInfo = await fetchUserInfo()
    addLog('success', 'API call successful', { userInfo })
  } catch (error) {
    addLog('error', 'API call failed', { error: error.message })
  } finally {
    testing.value = false
  }
}

const clearAuth = () => {
  authClearAuth()
  addLog('warning', 'Authentication cleared')
}

const refreshData = () => {
  // Force reactivity update
  user.value = { ...user.value }
  addLog('info', 'Data refreshed')
}

// Lifecycle
onMounted(() => {
  addLog('info', 'Refresh token test page loaded')
  addLog('info', `Authentication status: ${isAuthenticated.value ? 'Authenticated' : 'Not authenticated'}`)
})
</script>
