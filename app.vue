<template>
  <div>
    <!-- Global Toast -->
    <Toast />

    <!-- Global Loading Overlay -->
    <div
      v-if="$loading?.isLoading?.value"
      class="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="text-center">
        <div class="inline-block w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <div class="mt-4 font-medium text-purple-700">
          {{ $loading?.loadingText?.value || 'Loading...' }}
        </div>
        <div v-if="$loading?.loadingProgress?.value !== null" class="mt-4 w-48 mx-auto">
          <div class="bg-gray-200 rounded-full h-2">
            <div
              class="bg-purple-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${$loading?.loadingProgress?.value || 0}%` }"
            ></div>
          </div>
          <div class="text-sm text-gray-600 mt-2">{{ $loading?.loadingProgress?.value || 0 }}%</div>
        </div>
      </div>
    </div>

    <!-- Main App Layout -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
// Global app configuration
useHead({
  titleTemplate: '%s - Zoomet Admin',
  meta: [
    { name: 'description', content: 'Zoomet Admin Dashboard - Event Management System' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ]
})

// Handle global errors
onErrorCaptured((error) => {
  console.error('Global error captured:', error)
  return false
})
</script>