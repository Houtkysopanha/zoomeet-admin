<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Environment Configuration Debug</h1>
    
    <div class="space-y-4">
      <div class="bg-blue-100 p-4 rounded">
        <h2 class="font-semibold mb-2">Runtime Configuration</h2>
        <div class="text-sm space-y-1">
          <p><strong>Environment:</strong> {{ config.public.environment }}</p>
          <p><strong>API Base URL:</strong> {{ config.public.apiBaseUrl }}</p>
          <p><strong>API Admin Base URL:</strong> {{ config.public.apiAdminBaseUrl }}</p>
          <p><strong>App Name:</strong> {{ config.public.appName }}</p>
          <p><strong>App Version:</strong> {{ config.public.appVersion }}</p>
        </div>
      </div>
      
      <div class="bg-green-100 p-4 rounded">
        <h2 class="font-semibold mb-2">Process Environment</h2>
        <div class="text-sm space-y-1">
          <p><strong>NODE_ENV:</strong> {{ nodeEnv }}</p>
          <p><strong>Process Client:</strong> {{ processClient }}</p>
          <p><strong>Process Server:</strong> {{ processServer }}</p>
        </div>
      </div>
      
      <div class="bg-yellow-100 p-4 rounded">
        <h2 class="font-semibold mb-2">API Endpoint Test</h2>
        <button @click="testEndpoints" class="bg-blue-500 text-white px-4 py-2 rounded mr-2">
          Test API Endpoints
        </button>
        <div v-if="endpointTests.length > 0" class="mt-4">
          <h3 class="font-semibold mb-2">Test Results:</h3>
          <div v-for="test in endpointTests" :key="test.url" class="text-sm mb-2">
            <span :class="test.status === 'success' ? 'text-green-600' : test.status === 'error' ? 'text-red-600' : 'text-yellow-600'">
              {{ test.status.toUpperCase() }}
            </span>
            - {{ test.url }}: {{ test.message }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin'
})

const config = useRuntimeConfig()
const endpointTests = ref([])

// Process environment info
const nodeEnv = process.env.NODE_ENV || 'unknown'
const processClient = process.client
const processServer = process.server

const testEndpoints = async () => {
  endpointTests.value = []
  
  const endpoints = [
    { name: 'API Base', url: config.public.apiBaseUrl },
    { name: 'API Admin Base', url: config.public.apiAdminBaseUrl },
    { name: 'Server Events Proxy', url: '/api/admin/events' }
  ]
  
  for (const endpoint of endpoints) {
    try {
      endpointTests.value.push({
        name: endpoint.name,
        url: endpoint.url,
        status: 'testing',
        message: 'Testing connection...'
      })
      
      if (endpoint.url.startsWith('/')) {
        // Test internal proxy endpoint
        const response = await fetch(endpoint.url, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer test-token-for-endpoint-check'
          }
        })
        
        const lastIndex = endpointTests.value.length - 1
        if (response.status === 401) {
          endpointTests.value[lastIndex] = {
            ...endpointTests.value[lastIndex],
            status: 'success',
            message: `Endpoint reachable (401 expected without valid token)`
          }
        } else {
          endpointTests.value[lastIndex] = {
            ...endpointTests.value[lastIndex],
            status: 'warning',
            message: `Unexpected status: ${response.status}`
          }
        }
      } else {
        // Test external endpoint connectivity (without auth)
        const response = await fetch(endpoint.url.replace('/admin', '') + '/health', {
          method: 'GET',
          mode: 'cors'
        }).catch(() => null)
        
        const lastIndex = endpointTests.value.length - 1
        if (response) {
          endpointTests.value[lastIndex] = {
            ...endpointTests.value[lastIndex],
            status: 'success',
            message: `External API reachable`
          }
        } else {
          endpointTests.value[lastIndex] = {
            ...endpointTests.value[lastIndex],
            status: 'warning',
            message: `CORS/Network issue (may be normal for external APIs)`
          }
        }
      }
    } catch (error) {
      const lastIndex = endpointTests.value.length - 1
      endpointTests.value[lastIndex] = {
        ...endpointTests.value[lastIndex],
        status: 'error',
        message: error.message
      }
    }
  }
}
</script>
