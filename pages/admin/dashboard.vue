<template>
  <div class="p-6 bg-[#F8F8FF]">
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-[#7A49C9] mb-2">Dashboard Overview</h1>
        </div>
        <div class="date-range-picker flex items-center space-x-4">
          <Calendar
            v-model="dateRange"
            selectionMode="range"
            :manualInput="false"
            :showIcon="true"
            :showButtonBar="true"
            :dateFormat="'dd MM, yy'"
            class="w-full max-w-xs p-inputtext-lg rounded-xl border border-gray-200 p-3 text-center text-blue-950 font-medium text-lg bg-transparent focus:ring-0 focus:outline-none"
            placeholder="Select Date Range"
            @date-select="updateDisplay"
          />
          <i v-badge.danger class="pi pi-bell" style="font-size: 1.5rem" />
          <div class="flex items-center space-x-4">
            <div class="relative">
              <button
                @click="toggleUserMenu"
                class="flex items-center space-x-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div class="w-14 h-14 bg-[#E6F2FF] rounded-full flex items-center justify-center">
                  <Icon name="i-heroicons-user" class="text-white text-sm" />
                </div>
                <div class="text-left hidden md:block">
                  <div class="text-sm font-medium text-gray-800">Admin User</div>
                  <div class="text-xs text-gray-500">Administrator</div>
                </div>
                <Icon name="i-heroicons-chevron-down" class="text-gray-600 text-sm" />
              </button>

              <!-- User Dropdown -->
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
                <hr class="my-2 border-gray-200" />
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
        </div>
      </div>
      <div class="border border-gray-200 my-10">{{  }}</div>
    </div>

    <!-- Event Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <CardCommon
        v-for="(stat, index) in eventStats"
        :key="index"
        :title="stat.title"
        :count="stat.count"
        :icon="stat.icon"
        :weekChange="stat.weekChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Calendar from 'primevue/calendar'
import CardCommon from '~/components/common/CardCommon.vue'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const eventStats = [
  { title: 'Total Events', count: '28', icon: 'i-heroicons-calendar', weekChange: '2' },
  { title: 'Complete Event', count: '23', icon: 'i-heroicons-check-circle', weekChange: '2' },
  { title: 'Ongoing', count: '5', icon: 'i-heroicons-play', weekChange: '2' },
  { title: 'Draft', count: '24', icon: 'i-heroicons-pencil', weekChange: '2' },
]

const dateRange = ref(null)
const showUserMenu = ref(false)
const currentDate = ref('')
const currentTime = ref('')

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    showUserMenu.value = false
  }
}

const logoutWithToast = () => {
  showUserMenu.value = false
  toast.add({
    severity: 'info',
    summary: 'Logged out',
    detail: 'You have been logged out successfully.',
    life: 3000,
  })
  localStorage.removeItem('auth')
  setTimeout(() => router.push('/login'), 1500)
}

const updateDisplay = () => {
  const [start, end] = dateRange.value || []
  if (start && end) {
    const formattedStart = start.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
    const formattedEnd = end.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
    console.log(`Selected range: ${formattedStart} - ${formattedEnd}`)
  }
}

const updateDateTime = () => {
  const now = new Date()
  currentDate.value = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  currentTime.value = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

onMounted(() => {
  updateDateTime()
  document.addEventListener('click', handleClickOutside)
  const interval = setInterval(updateDateTime, 1000)
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    clearInterval(interval)
  })
})

definePageMeta({
  middleware: 'auth',
  layout: 'admin',
})
</script>