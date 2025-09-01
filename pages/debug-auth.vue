<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Authentication Debug</h1>
    
    <div class="space-y-4">
      <div class="bg-gray-100 p-4 rounded">
        <h2 class="font-semibold mb-2">Authentication Status</h2>
        <p><strong>Is Authenticated:</strong> {{ isAuthenticated }}</p>
        <p><strong>Token Exists:</strong> {{ tokenExists }}</p>
        <p><strong>Token Length:</strong> {{ tokenLength }}</p>
        <p><strong>Token Expired:</strong> {{ isTokenExpired }}</p>
        <p><strong>Time Until Expiry:</strong> {{ timeUntilExpiry }}</p>
        <p><strong>User:</strong> {{ userInfo }}</p>
      </div>
      
      <div class="bg-blue-100 p-4 rounded">
        <h2 class="font-semibold mb-2">Storage Check</h2>
        <p><strong>LocalStorage:</strong> {{ localStorageStatus }}</p>
        <p><strong>SessionStorage:</strong> {{ sessionStorageStatus }}</p>
        <p><strong>Cookie:</strong> {{ cookieStatus }}</p>
      </div>
      
      <div class="bg-green-100 p-4 rounded">
        <h2 class="font-semibold mb-2">API Test</h2>
        <button @click="testAPI" class="bg-blue-500 text-white px-4 py-2 rounded mr-2">Test Events API</button>
        <button @click="testDirectAPI" class="bg-green-500 text-white px-4 py-2 rounded">Test Direct API</button>
        <div v-if="apiTestResult" class="mt-2">
          <p><strong>API Test Result:</strong></p>
          <pre class="bg-gray-200 p-2 rounded text-sm">{{ apiTestResult }}</pre>
        </div>
      </div>
      
      <div class="bg-yellow-100 p-4 rounded">
        <h2 class="font-semibold mb-2">Console Logs</h2>
        <div v-for="(log, index) in consoleLogs" :key="index" class="text-sm">
          {{ log }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin'
})

const { user, isAuthenticated, getToken, isTokenExpired, getTimeUntilExpiry } = useAuth()
const consoleLogs = ref([])

// Authentication info
const tokenExists = computed(() => !!getToken())
const tokenLength = computed(() => getToken()?.length || 0)
const userInfo = computed(() => user.value?.user?.email || user.value?.user?.name || 'N/A')
const timeUntilExpiry = computed(() => {
  const time = getTimeUntilExpiry()
  if (!time) return 'Unknown'
  const hours = Math.floor(time / (1000 * 60 * 60))
  const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes}m`
})

// Storage status
const localStorageStatus = ref('checking...')
const sessionStorageStatus = ref('checking...')
const cookieStatus = ref('checking...')
const apiTestResult = ref(null)

// Add log function
const addLog = (message) => {
  consoleLogs.value.push(`${new Date().toLocaleTimeString()}: ${message}`)
  console.log(message)
}

onMounted(() => {
  checkStorageStatus()
  addLog('🔍 Debug page mounted')
})

const checkStorageStatus = () => {
  if (process.client) {
    try {
      // Check localStorage
      const authLS = localStorage.getItem('auth')
      localStorageStatus.value = authLS ? '✅ Present' : '❌ Missing'
      
      // Check sessionStorage
      const authSS = sessionStorage.getItem('auth')
      sessionStorageStatus.value = authSS ? '✅ Present' : '❌ Missing'
      
      // Check cookies
      const cookies = document.cookie
      cookieStatus.value = cookies.includes('auth') ? '✅ Present' : '❌ Missing'
      
      addLog('Storage status checked')
    } catch (error) {
      addLog(`❌ Error checking storage: ${error.message}`)
    }
  }
}

const testAPI = async () => {
  try {
    addLog('🧪 Testing fetchEvents API...')
    const { fetchEvents } = await import('@/composables/api')
    const result = await fetchEvents()
    apiTestResult.value = JSON.stringify(result, null, 2)
    addLog(`✅ API test completed: ${result.status}`)
  } catch (error) {
    addLog(`❌ API test error: ${error.message}`)
    apiTestResult.value = `Error: ${error.message}`
  }
}

const testDirectAPI = async () => {
  try {
    addLog('🧪 Testing direct API call...')
    const token = getToken()
    
    if (!token) {
      addLog('❌ No token found')
      apiTestResult.value = 'Error: No token found'
      return
    }
    
    const response = await fetch('/api/admin/events', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    const text = await response.text()
    addLog(`📡 Direct API response: ${response.status}`)
    
    apiTestResult.value = {
      status: response.status,
      ok: response.ok,
      body: text.substring(0, 500) + (text.length > 500 ? '...' : '')
    }
  } catch (error) {
    addLog(`❌ Direct API error: ${error.message}`)
    apiTestResult.value = `Error: ${error.message}`
  }
}
</script>
