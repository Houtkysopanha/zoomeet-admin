<template>
  <div>
    <!-- Global Toast -->
    <Toast />

    <!-- Global Classic Loading Overlay -->
    <GlobalClassicLoader />

    <!-- Main App Layout -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
// Global app configuration
useHead({
  titleTemplate: '%s - Event Management System',
  meta: [
    { name: 'description', content: 'eTicketsAsia - Event Management System' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ]
})

// Handle global errors
onErrorCaptured((error) => {
  console.error('Global error captured:', error)
  return false
})
</script>