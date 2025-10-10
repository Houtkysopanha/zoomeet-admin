<template>
  <div class="flex h-screen overflow-hidden bg-[#F8F8FF]">
    <!-- Mobile Overlay -->
    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
      @click="closeMobileMenu"
    ></div>

    <!-- Sidebar -->
    <SidebarLeft
      :class="[
        'fixed h-full z-50 bg-transparent transition-transform duration-300 ease-in-out',
        'w-64 lg:w-80',
        // Mobile: slide in from left
        'lg:translate-x-0',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
      @close-mobile="closeMobileMenu"
    />

    <!-- Mobile Menu Button -->
    <button
      @click="toggleMobileMenu"
      class="fixed top-4 left-4 z-60 lg:hidden bg-white rounded-lg p-2 shadow-lg"
    >
      <Icon
        :name="isMobileMenuOpen ? 'heroicons:x-mark' : 'heroicons:bars-3'"
        class="w-6 h-6 text-gray-700"
      />
    </button>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col lg:ml-80 transition-all duration-300 ease-in-out">
      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto bg-[#F8F8FF]">
        <div class="h-full pt-16 lg:pt-8 px-4 lg:px-0">
          <slot />
        </div>
      </main>
    </div>

    <!-- PrimeVue Toast -->
    <Toast />
    
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Toast from 'primevue/toast'

// Track page loading state
const pending = ref(false)

// Mobile menu state
const isMobileMenuOpen = ref(false)



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

// Mobile menu functions
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

// Close mobile menu on route change
const router = useRouter()
router.afterEach(() => {
  closeMobileMenu()
})

// Handle window resize
const handleResize = () => {
  if (window.innerWidth >= 1024) {
    closeMobileMenu()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>

/* Add any additional scoped styles if needed */
</style>
