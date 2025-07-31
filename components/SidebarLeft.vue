<template>
  <div class="flex flex-col h-full">
    <div class="p-5">
      <!-- Navigation Menu -->
      <nav class="flex-1 p-5 space-y-2 overflow-y-auto bg-white rounded-3xl shadow-xl min-h-screen">
        <!-- Logo Section -->
        <div class="p-6">
          <div class="items-center mx-auto">
            <img :src="logo" alt="ZoomMeet logo" class="w-52" />
          </div>
        </div>

        <!-- Main Navigation -->
        <NuxtLink
          v-for="(item, index) in navLinks"
          :key="index"
          :to="item.to"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-gray-100 text-black"
          :class="{ 'bg-[#E6F2FF]': isActive(item.to) }"
        >
          <Icon :name="`i-heroicons-${item.icon}`" class="text-lg" />
          <span class="font-medium">{{ item.text }}</span>
          <span v-if="item.count" class="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{{ item.count }}</span>
        </NuxtLink>

        <!-- Settings Dropdown -->
        <div class="relative">
          <button
            @click="toggleSettingsDropdown"
            class="w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 hover:bg-gray-100 text-black"
            :class="{ 'bg-[#E6F2FF]': showSettingsDropdown }"
          >
            <div class="flex items-center space-x-3">
              <Icon name="i-heroicons-cog-6-tooth" class="text-lg" />
              <span class="font-medium">Settings</span>
            </div>
            <Icon
              name="i-heroicons-chevron-down"
              class="text-sm transition-transform duration-200"
              :class="{ 'rotate-180': showSettingsDropdown }"
            />
          </button>

          <!-- Settings Items -->
          <div
            v-show="showSettingsDropdown"
            class="mt-2 ml-4 space-y-1 border-l-2 border-gray-600 pl-4"
          >
            <NuxtLink
              v-for="(setting, index) in settingsLinks"
              :key="index"
              :to="setting.to"
              class="flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-gray-100 text-gray-400 text-sm"
              :class="{ 'bg-[#E6F2FF]': isActive(setting.to) }"
            >
              <Icon :name="`i-heroicons-${setting.icon}`" class="text-base" />
              <span class="font-medium">{{ setting.text }}</span>
            </NuxtLink>
          </div>
        </div>
        
      </nav>
    </div>
  </div>
</template>

<script setup>
import logo from '@/assets/image/logo.png'
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const showSettingsDropdown = ref(false)
const showUserMenu = ref(false)

const navLinks = [
  { to: "/admin/dashboard", icon: "home", text: "Dashboard", activeClass: "bg-[#E6F2FF]" },
  { to: "/admin/event", icon: "calendar-days", text: "Event", count: 26, activeClass: "bg-[#E6F2FF]" },
  { to: "/admin/booking", icon: "clipboard-document-check", text: "Booking", count: 26, activeClass: "bg-[#E6F2FF]" },
  { to: "/admin/check-in", icon: "check-circle", text: "Check-in Service", activeClass: "bg-[#E6F2FF]" },
]

const settingsLinks = [
  { to: "/admin/settings/roles", icon: "users", text: "Manage Role and Staff", activeClass: "bg-[#E6F2FF]" },
  { to: "/admin/settings/audit", icon: "document-text", text: "Audit Logs", activeClass: "bg-[#E6F2FF]" },
  { to: "/admin/settings/report", icon: "chart-bar", text: "Report", activeClass: "bg-[#E6F2FF]" },
]

function toggleSettingsDropdown() {
  showSettingsDropdown.value = !showSettingsDropdown.value
}

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

function handleClickOutside(event) {
  if (!event.target.closest('.relative')) {
    showUserMenu.value = false
    showSettingsDropdown.value = false
  }
}

function isActive(path) {
  return route.path === path
}

function logoutWithToast() {
  showUserMenu.value = false
  toast.add({
    severity: "info",
    summary: "Logged out",
    detail: "You have been logged out successfully.",
    life: 3000,
  })
  localStorage.removeItem("auth")
  setTimeout(() => router.push("/login"), 1500)
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Add any additional scoped styles if needed */
</style>