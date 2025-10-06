<template>
  <div class="p-4 bg-gray-100 rounded-lg max-w-md">
    <h3 class="text-lg font-semibold mb-4">Token Debug Info</h3>
    
    <div class="space-y-2 text-sm">
      <div>
        <strong>Token Status:</strong> 
        <span :class="tokenHealth.status === 'healthy' ? 'text-green-600' : 
                      tokenHealth.status === 'warning' ? 'text-yellow-600' : 
                      tokenHealth.status === 'critical' ? 'text-red-600' : 'text-gray-600'">
          {{ tokenHealth.status }}
        </span>
      </div>
      
      <div>
        <strong>Message:</strong> {{ tokenHealth.message }}
      </div>
      
      <div>
        <strong>Time Until Expiry:</strong> 
        {{ timeRemaining ? Math.floor(timeRemaining / (60 * 1000)) + ' minutes' : 'Unknown' }}
      </div>
      
      <div>
        <strong>Has Refresh Token:</strong> 
        {{ hasRefreshToken ? 'Yes' : 'No' }}
      </div>
      
      <div>
        <strong>Refresh Attempts:</strong> {{ refreshAttempts }}
      </div>
    </div>
    
    <div class="mt-4 space-x-2">
      <button 
        @click="manualRefresh" 
        :disabled="!hasRefreshToken || isRefreshing"
        class="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {{ isRefreshing ? 'Refreshing...' : 'Manual Refresh' }}
      </button>
      
      <button 
        @click="clearAuth" 
        class="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
      >
        Clear Auth
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const { 
  getTimeUntilExpiry, 
  getRefreshToken, 
  refreshToken, 
  clearAuth 
} = useAuth()

const { getTokenHealth, refreshAttempts } = useTokenManager()

const tokenHealth = ref({ status: 'unknown', message: 'Loading...' })
const timeRemaining = ref(null)
const hasRefreshToken = ref(false)
const isRefreshing = ref(false)

let interval = null

const updateStatus = () => {
  tokenHealth.value = getTokenHealth()
  timeRemaining.value = getTimeUntilExpiry()
  hasRefreshToken.value = !!getRefreshToken()
}

const manualRefresh = async () => {
  isRefreshing.value = true
  try {
    const success = await refreshToken()
    if (success) {
      console.log('✅ Manual token refresh successful')
    } else {
      console.error('❌ Manual token refresh failed')
    }
  } catch (error) {
    console.error('❌ Manual token refresh error:', error)
  } finally {
    isRefreshing.value = false
    updateStatus()
  }
}

onMounted(() => {
  updateStatus()
  // Update every 10 seconds
  interval = setInterval(updateStatus, 10000)
})

onUnmounted(() => {
  if (interval) {
    clearInterval(interval)
  }
})
</script>