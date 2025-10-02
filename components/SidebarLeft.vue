<template>
  <div class="flex flex-col h-full">
    <div class="p-3 lg:p-5 h-full">
      <!-- Navigation Menu -->
      <nav class="flex-1 p-3 lg:p-5 space-y-2 overflow-y-auto bg-white rounded-3xl shadow-xl min-h-full relative">
        <!-- Close button for mobile -->
        <button
          @click="$emit('close-mobile')"
          class="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100"
        >
          <Icon name="heroicons:x-mark" class="w-5 h-5 text-gray-600" />
        </button>

        <!-- Logo Section -->
        <div class="p-2 mt-5 mb-6 lg:mb-8">
          <div class="items-center mx-auto">
            <img
              :src="logo1"
              alt="ZoomMeet logo"
              class="w-full lg:w-52 lg:max-w-none mx-auto mb-5"
            />
          </div>
        </div>

        <!-- Main Navigation -->
        <div
          v-for="(item, index) in navLinks"
          :key="index"
          :class="[
            'flex items-center px-3 lg:px-4 py-3 rounded-lg transition-all duration-200',
            item.disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100',
            isActive(item.to) ? 'bg-[#E6F2FF]' : ''
          ]"
        >
          <template v-if="!item.disabled">
            <NuxtLink :to="item.to" class="flex items-center space-x-3 w-full">
              <Icon
                :name="item.icon"
                class="text-lg flex-shrink-0"
                :class="isActive(item.to) ? 'bg-gradient-to-r from-[#4D66A6] to-[#B61EEB] ' : 'text-black'"
              />
              <span
                class="font-bold text-sm lg:text-base truncate"
                :class="isActive(item.to) ? 'bg-gradient-to-r from-[#4D66A6] to-[#B61EEB] bg-clip-text text-transparent font-bold' : 'text-black font-medium'"
              >
                {{ item.text }}
              </span>
              <span
                v-if="item.count"
                class="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full flex-shrink-0"
              >
                {{ item.count }}
              </span>
            </NuxtLink>
          </template>
          <template v-else>
            <div class="flex items-center space-x-3 w-full">
              <Icon
                :name="item.icon"
                class="text-lg flex-shrink-0 text-black"
              />
              <span class="font-medium text-sm lg:text-base truncate text-black">
                {{ item.text }}
              </span>
              <span
                v-if="item.count"
                class="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full flex-shrink-0 opacity-50"
              >
                {{ item.count }}
              </span>
            </div>
          </template>
        </div>
        
        <!-- Settings Dropdown -->
        <div class="relative">
          <button
            @click="toggleSettingsDropdown"
            class="w-full flex items-center justify-between px-3 lg:px-4 py-3 rounded-lg transition-all duration-200 hover:bg-gray-100 text-black"
            :class="{ 'bg-[#E6F2FF]': showSettingsDropdown }"
          >
            <div class="flex items-center space-x-3">
              <Icon
                name="lets-icons:setting-fill"
                class="text-lg flex-shrink-0"
              />
              <span class="font-medium text-sm lg:text-base truncate">Settings</span>
            </div>
            <Icon
              name="i-heroicons-chevron-up"
              class="text-sm transition-transform duration-200 flex-shrink-0"
              :class="{ 'rotate-180': showSettingsDropdown }"
            />
          </button>

          <!-- Settings Items -->
          <div
            v-show="showSettingsDropdown"
            class="mt-2 ml-3 lg:ml-4 space-y-1 border-l-2 border-gray-600 pl-3 lg:pl-4"
          >
            <div
              v-for="(setting, index) in settingsLinks"
              :key="index"
              :class="[
                'flex items-center space-x-3 px-2 py-2 rounded-lg transition-all duration-200 text-xs lg:text-sm',
                setting.disabled ? 'cursor-not-allowed opacity-50 text-gray-400' : 'hover:bg-gray-100 text-gray-400',
                isActive(setting.to) ? 'bg-[#E6F2FF]' : ''
              ]"
            >
              <template v-if="!setting.disabled">
                <NuxtLink :to="setting.to" class="flex items-center space-x-3 w-full">
                  <Icon :name="`${setting.icon}`" class="text-base flex-shrink-0" />
                  <span class="font-medium truncate">{{ setting.text }}</span>
                </NuxtLink>
              </template>
              <template v-else>
                <div class="flex items-center space-x-3 w-full">
                  <Icon :name="`${setting.icon}`" class="text-base flex-shrink-0" />
                  <span class="font-medium truncate">{{ setting.text }}</span>
                </div>
              </template>
            </div>
          </div>
        </div>
      </nav>
    </div>
  </div>
</template>

<script setup>
import logo1 from '@/assets/image/finalize-logo.jpg'
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useGlobalEventCount } from '@/composables/useEventCount.js'

defineEmits(['close-mobile'])

const route = useRoute()
const showSettingsDropdown = ref(false)

// Use the global event count composable
const { totalEventCount, loadEventCount, loading, error } = useGlobalEventCount()

// Computed nav links with dynamic event count
const navLinks = computed(() => [
  { to: "/admin/dashboard", icon: "ic:round-dashboard", text: "Dashboard", activeClass: "bg-[#E6F2FF]", disabled: false },
  { to: "/admin/event", icon: "clarity:event-solid", text: "Event", count: totalEventCount.value, activeClass: "bg-[#E6F2FF]", disabled: false },
  { to: "/admin/booking", icon: "material-symbols-light:receipt-rounded", text: "Booking", count: 0, activeClass: "bg-[#E6F2FF]", disabled: true},
  { to: "/admin/checkIn", icon: "mdi:invoice-text-check", text: "Check-in Service", activeClass: "bg-[#E6F2FF]", disabled: false },
])

const settingsLinks = [
  { to: "", icon: "mingcute:user-setting-fill", text: "Manage Role and Staff", activeClass: "bg-[#E6F2FF]", disabled: true },
  { to: "", icon: "mynaui:activity-square-solid", text: "Audit Logs", activeClass: "bg-[#E6F2FF]", disabled: true },
  { to: "", icon: "bxs:report", text: "Report", activeClass: "bg-[#E6F2FF]", disabled: true },
]

function toggleSettingsDropdown() {
  showSettingsDropdown.value = !showSettingsDropdown.value
}

function handleClickOutside(event) {
  if (!event.target.closest('.relative')) {
    showSettingsDropdown.value = false
  }
}

function isActive(path) {
  if (!path) return false
  
  // Exact match for dashboard and other simple routes
  if (route.path === path) {
    return true
  }
  
  // For Event menu item, check if current route is event-related
  if (path === '/admin/event') {
    return route.path.startsWith('/admin/event') || 
           route.path.includes('/admin/CreateEvent') ||
           route.path.includes('/admin/RecentEvent') ||
           route.path.includes('/admin/ComingEvent') ||
           route.path.includes('/admin/manage-booking') ||
           route.path.includes('/admin/manage-tickets') ||
           route.path.includes('/admin/promotion') ||
           route.path.includes('/admin/role')
  }
  
  // For Booking menu item, check if current route is booking-related
  if (path === '/admin/booking') {
    return route.path.startsWith('/admin/booking') 
  }
  
  // For Check-in menu item, check if current route is check-in related
  if (path === '/admin/checkIn') {
    return route.path.startsWith('/admin/checkIn') ||route.path.startsWith('/admin/print-tickets')
  }
  
  // Default: check if current path starts with the menu path
  return route.path.startsWith(path)
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  // Load event count when component mounts
  loadEventCount()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Add any additional scoped styles if needed */
</style>
