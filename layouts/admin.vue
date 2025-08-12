<template>
  <div class="flex h-screen overflow-hidden bg-[#F8F8FF]">
    <!-- Sidebar -->
    <SidebarLeft class="w-64 md:w-[20rem] fixed h-full z-10 bg-transparent" />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col ml-64 md:ml-[20rem]">
      <!-- Header (optional) -->
      <!-- <HeaderTop class="h-16 fixed top-0 right-0 left-64 bg-white shadow-sm z-20 border-b border-gray-200" /> -->

      <!-- Main Content -->
      <main class="mt-8 flex-1 overflow-y-auto bg-white">
        <div class="h-full">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
// Track page loading state
const pending = ref(false)

// Listen to route changes
const nuxtApp = useNuxtApp()

nuxtApp.hook('page:start', () => {
  pending.value = true
})

nuxtApp.hook('page:finish', () => {
  // Add small delay to prevent flashing
  setTimeout(() => {
    pending.value = false
  }, 100)
})

// Handle errors
nuxtApp.hook('vue:error', () => {
  pending.value = false
})
</script>

<style scoped>
/* Add any additional scoped styles if needed */
</style>
