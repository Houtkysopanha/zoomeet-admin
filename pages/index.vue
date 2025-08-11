<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
    <div class="text-center">
      <LoadingSpinner
        size="lg"
        color="purple"
        text="Redirecting..."
        :show-text="true"
      />
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
