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
const { initAuth } = useAuth()

// Document head
useHead({
  titleTemplate: '%s - Event Management System',
  meta: [
    { name: 'description', content: 'eTicketsAsia - Event Management System' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ]
})

// Initialize auth once on client mount
onMounted(() => {
  initAuth()
})

// Handle global errors
onErrorCaptured((error) => {
  return false
})
</script>
