<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
    <div class="text-center">
      <div class="inline-block w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      <div class="mt-4 font-medium text-purple-700 text-lg">
        Redirecting...
      </div>
    </div>
  </div>
</template>

<script setup>
// Set page meta
definePageMeta({
  layout: false
})

// Handle redirect logic
onMounted(async () => {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated.value) {
    await navigateTo('/admin/dashboard')
  } else {
    await navigateTo('/login')
  }
})
</script>

<style scoped>
.border-3 {
  border-width: 3px;
}
</style>
