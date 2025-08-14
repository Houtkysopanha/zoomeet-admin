<template>
  <div class="flex flex-col h-full">
    <div class="p-3 lg:p-5 h-full">
      <!-- Navigation Menu -->
      <nav class="flex-1 p-3 lg:p-5 space-y-2 overflow-y-auto bg-white rounded-3xl shadow-xl min-h-full">
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
              class="w-full max-w-[200px] lg:max-w-none mx-auto"
            />
          </div>
        </div>

        <!-- Main Navigation -->
        <NuxtLink
          v-for="(item, index) in navLinks"
          :key="index"
          :to="item.to"
          class="flex items-center space-x-3 px-3 lg:px-4 py-3 rounded-lg transition-all duration-200 hover:bg-gray-100 text-black"
          :class="{ 'bg-[#E6F2FF]': isActive(item.to) }"
        >
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
            <NuxtLink
              v-for="(setting, index) in settingsLinks"
              :key="index"
              :to="setting.to"
              class="flex items-center space-x-3 px-2 py-2 rounded-lg transition-all duration-200 hover:bg-gray-100 text-gray-400 text-xs lg:text-sm"
              :class="{ 'bg-[#E6F2FF]': isActive(setting.to) }"
            >
              <Icon :name="`${setting.icon}`" class="text-base flex-shrink-0" />
              <span class="font-medium truncate">{{ setting.text }}</span>
            </NuxtLink>
          </div>
        </div>
        
      </nav>
    </div>
  </div>
</template>

<script setup>
// import logo from '@/assets/image/logo.png'
import logo1 from '@/assets/image/eticketsasia.png'
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

// Define emits
const emit = defineEmits(['close-mobile'])

const route = useRoute()
const showSettingsDropdown = ref(false)

const navLinks = [
  { to: "/admin/dashboard", icon: "ic:round-dashboard", text: "Dashboard", activeClass: "bg-[#E6F2FF]" },
  { to: "/admin/event", icon: "clarity:event-solid", text: "Event", count: 26, activeClass: "bg-[#E6F2FF]" },
  { to: "/admin/booking", icon: "material-symbols-light:receipt-rounded", text: "Booking", count: 26, activeClass: "bg-[#E6F2FF]" },
  { to: "/admin/checkIn", icon: "mdi:invoice-text-check", text: "Check-in Service", activeClass: "bg-[#E6F2FF]" },
]

const settingsLinks = [
  { to: "", icon: "mingcute:user-setting-fill", text: "Manage Role and Staff", activeClass: "bg-[#E6F2FF]" },
  { to: "", icon: "mynaui:activity-square-solid", text: "Audit Logs", activeClass: "bg-[#E6F2FF]" },
  { to: "", icon: "bxs:report", text: "Report", activeClass: "bg-[#E6F2FF]" },
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
  return route.path === path
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