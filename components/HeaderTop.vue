<template>
  <header class="flex items-center justify-between px-6  bg-white shadow-sm border-b border-gray-200">
    <!-- Left Section - Breadcrumb/Page Title -->
    <div class="flex items-center space-x-4">
      <div class="text-lg font-semibold text-gray-800 capitalize">
        {{ currentPageTitle }}
      </div>
      <div class="text-sm text-gray-500">
        {{ currentTime }}
      </div>
    </div>

    <!-- Right Section - User Menu -->
    <div class="flex items-center space-x-4">
      <!-- Notifications -->
      <button class="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
        <Icon name="i-heroicons-bell" class="text-xl" />
        <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          3
        </span>
      </button>

      <!-- User Profile Dropdown -->
      <div class="relative">
        <button
          @click="toggleUserMenu"
          class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div class="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
            <Icon name="i-heroicons-user" class="text-white text-sm" />
          </div>
          <div class="text-left hidden md:block">
            <div class="text-sm font-medium text-gray-800">Admin User</div>
            <div class="text-xs text-gray-500">Administrator</div>
          </div>
          <Icon name="i-heroicons-chevron-down" class="text-gray-600 text-sm" />
        </button>

        <!-- Dropdown Menu -->
        <div
          v-if="showUserMenu"
          class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
        >
          <a href="#" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <Icon name="i-heroicons-user-circle" class="mr-3 text-gray-400" />
            Profile
          </a>
          <a href="#" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <Icon name="i-heroicons-cog-6-tooth" class="mr-3 text-gray-400" />
            Settings
          </a>
          <hr class="my-2 border-gray-200">
          <button
            @click="logoutWithToast"
            class="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <Icon name="i-heroicons-arrow-right-on-rectangle" class="mr-3 text-red-500" />
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const showUserMenu = ref(false)
const currentTime = ref('')

// Computed property for page title
const currentPageTitle = computed(() => {
  const path = route.path
  if (path.includes('dashboard')) return 'Dashboard'
  if (path.includes('report')) return 'Reports'
  if (path.includes('users')) return 'Users'
  if (path.includes('settings')) return 'Settings'
  return 'Admin Panel'
})

// Toggle user menu
function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

// Close menu when clicking outside
function handleClickOutside(event) {
  if (!event.target.closest('.relative')) {
    showUserMenu.value = false
  }
}

// Update current time
function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

// Logout with toast notification
function logoutWithToast() {
  showUserMenu.value = false

  toast.add({
    severity: "info",
    summary: "Logged out",
    detail: "You have been logged out successfully.",
    life: 3000,
  })

  localStorage.removeItem("auth")

  setTimeout(() => {
    router.push("/login")
  }, 1500)
}

// Lifecycle hooks
onMounted(() => {
  updateTime()
  setInterval(updateTime, 1000)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
