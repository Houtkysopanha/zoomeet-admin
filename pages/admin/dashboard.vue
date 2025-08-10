<template>
  <div class="p-4 bg-[#F8F8FF]">
    <div class="">
     <div class="flex flex-wrap items-center justify-between gap-4">
  <!-- Left: Title -->
  <div class="">
    <h1 class="text-3xl font-bold text-[#7A49C9] mb-0">Dashboard Overview</h1>
  </div>

  <!-- Right: Controls -->
  <div class="flex items-center gap-6 flex-wrap">
    <!-- Calendar -->
    <Calendar
      v-model="dateRange"
      selectionMode="range"
      :manualInput="false"
      :showIcon="true"
      :showButtonBar="true"
      :dateFormat="'dd MM, yy'"
      class="max-w-xs p-inputtext-lg  rounded-xl border border-gray-200 p-3 text-center text-blue-950 font-medium text-lg focus:ring-0 focus:outline-none"
      placeholder="Select Date Range"
      @date-select="updateDisplay"
    />

    <!-- Bell Icon -->
     <Icon name="mage:notification-bell-pending-fill" class=" text-3xl bg-gradient-to-t from-blue-900 to-purple-800 " />
    <!-- <i v-badge.danger class="pi pi-bell bg-custom-gradient bg-clip-text text-transparent text-xl text-gray-600" /> -->

    <!-- User Menu -->
    <div class="relative">
      <button
        @click="toggleUserMenu"
        class="flex items-center space-x-3 rounded-lg hover:bg-gray-100 transition-colors p-1"
      >
        <div class="w-12 h-12 bg-[#E6F2FF] rounded-full flex items-center justify-center">
          <Icon name="i-heroicons-user" class="text-black text-base" />
        </div>
        <div class="text-left hidden md:block">
          <div class="text-sm font-medium text-gray-800">{{ userName }}</div>
          <div class="text-xs text-gray-500">Administrator</div>
        </div>
        <Icon name="i-heroicons-chevron-down" class="text-gray-600 text-sm" />
      </button>

      <!-- Dropdown -->
      <div
        v-if="showUserMenu"
        class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
      >
      <NuxtLink
  to="/admin/profile"
  class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
>
  <Icon name="i-heroicons-user-circle" class="mr-3 text-gray-400" />
  Profile
</NuxtLink>

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

      <div class="border border-gray-200 mt-5 mb-10">{{  }}</div>
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
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 mt-5">
  <div class="col-span-2"><RecentEvent /></div>
  <div ><ComingEvent /></div>
</div>



  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Calendar from 'primevue/calendar'
import CardCommon from '~/components/common/CardCommon.vue'
import { useToast } from 'primevue/usetoast'
import RecentEvent from './RecentEvent.vue'
import ComingEvent from './ComingEvent.vue'
const config = useRuntimeConfig() // add this at the top of script setup

const router = useRouter()
const route = useRoute()
const toast = useToast()

const eventStats = [
  { title: 'Total Revenue', count: '28', icon: 'lsicon:amount-dollar-filled', weekChange: '+20.1% from last month' },
  { title: 'Complete Event', count: '23', icon: 'material-symbols-light:order-approve', weekChange: 'Need registration' },
  { title: 'Ongoing', count: '5', icon: 'majesticons:ticket', weekChange: '+180 from last week' },
  { title: 'Draft', count: '24', icon: 'mdi:invoice-text-check', weekChange: '2 everning running' },
]


const dateRange = ref(null)
const showUserMenu = ref(false)
const currentDate = ref('')
const currentTime = ref('')

const userName = ref('Loading...')
const userRole = ref('Administrator') // or default role string

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
const API_BASE_URL = import.meta.env.NUXT_PUBLIC_API_BASE_URL

async function fetchUserInfo() {
  try {
    const auth = JSON.parse(localStorage.getItem('auth'))
    const token = auth?.token
    if (!token) throw new Error('No token found in localStorage')

    console.log('Using token:', token)
    const res = await fetch(`${config.public.apiBaseUrl}/info`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    console.log('Fetch response status:', res.status)
    if (!res.ok) {
      const errorText = await res.text()
      console.error('Fetch error:', errorText)
      throw new Error('Failed to fetch user info')
    }

    const data = await res.json()
    console.log('User info:', data)
    userName.value = data.name || data.preferred_username || 'No Name'
    userRole.value = 'User'
  } catch (error) {
    console.error(error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Unable to fetch user info',
      life: 3000,
    })
    userName.value = 'Unknown User'
  }
}

onMounted(() => {
  fetchUserInfo()
})

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

<style scoped>
.faded-row {
  opacity: 0.4;
  background: linear-gradient(to right, rgba(96, 165, 250, 0.1), transparent);
  transition: opacity 0.3s;
}
.p-inputtext-lg {
  background: transparent !important;
}
:deep(.p-calendar) {
  background: transparent !important;
}

:deep(.p-calendar .p-inputtext) {
  background: transparent !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

:deep(.p-calendar .p-inputtext:focus) {
  outline: none !important;
  box-shadow: none !important;
  border: none !important;
}

</style>