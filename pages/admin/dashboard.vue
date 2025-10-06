<template>
  <div class="p-3 lg:p-4 bg-[#F8F8FF]">
    <!-- Disabled Dashboard Content -->
    <div class="">
    <div class="">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <!-- Left: Title -->
        <div class="">
          <Breadcrumb
            :items="[
              { text: 'Dashboard' }
            ]"
            class="mb-2"
          />
        </div>

        <!-- Right: Controls -->
        <div class="flex items-start sm:items-center gap-3 lg:gap-6 ">
          <!-- Calendar -->
          <Calendar
            v-model="dateRange"
            selectionMode="range"
            :manualInput="false"
            :showIcon="true"
            :showButtonBar="true"
            :dateFormat="'dd MM, yy'"
            class="w-full border border-gray-200 rounded-2xl sm:max-w-xs"
            inputClass="input-standard text-start text-blue-950 font-medium text-sm lg:text-lg"
            placeholder="Select Date Range"
            @date-select="updateDisplay"
          />

          <!-- Bell Icon -->
          <Icon
            name="mage:notification-bell-pending-fill"
            class="text-xl lg:text-4xl lg:w-16 bg-gradient-to-t from-blue-900 to-purple-800 hidden sm:block"
          />

          <!-- User Menu -->
          <div class="relative w-full sm:w-auto">
            <button
              @click="toggleUserMenu"
              class="flex items-center space-x-3 rounded-lg hover:bg-gray-100 transition-colors p-1 w-full sm:w-auto"
            >
              <div class="w-10 h-10 lg:w-12 lg:h-12 bg-[#E6F2FF] rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="i-heroicons-user" class="text-black text-sm lg:text-base" />
              </div>
              <div class="text-left flex-1 sm:hidden lg:block">
                <div class="text-sm font-medium text-gray-800 truncate">{{ userName }}</div>
                <div class="text-xs text-gray-500">{{ userRole }}</div>
              </div>
              <Icon name="i-heroicons-chevron-down" class="text-gray-600 text-sm flex-shrink-0" />
            </button>

            <!-- Dropdown -->
            <div
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
            >
              <NuxtLink
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

      <div class="border border-gray-200 mt-4 lg:mt-5 mb-6 lg:mb-10"></div>
       <!-- <div class="mb-6 p-6 bg-[#E6F2FF] border border-purple-600 rounded-2xl">
      <div class="flex items-center">
        <Icon name="heroicons:exclamation-triangle" class="w-8 h-8 text-yellow-600 mr-4" />
        <div>
          <h3 class="text-lg font-semibold text-purple-600 mb-2">Dashboard Temporarily Unavailable</h3>
          <p class="text-purple-600">The dashboard feature is currently under development and will be available soon. Please use other sections of the admin panel.</p>
          <div class="mt-4">
            <NuxtLink to="/admin/event" class="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <Icon name="heroicons:calendar" class="w-4 h-4 mr-2" />
              Go to Events
            </NuxtLink>
          </div>
        </div>
      </div>
    </div> -->
       <!-- Dashboard Disabled Notice -->
      <!-- <div class="opacity-30 pointer-events-none"> -->
        <div>


    <!-- Event Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      <CardCommon
        v-for="(stat, index) in eventStats"
        :key="index"
        :title="stat.title"
        :count="stat.count"
        :icon="stat.icon"
        :weekChange="stat.weekChange"
      />
    </div>

    <!-- Recent and Coming Events -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 lg:mb-8 mt-4 lg:mt-5">
      <div class="lg:col-span-2">
        <RecentEvent />
      </div>
      <div class="lg:col-span-1">
        <ComingEvent />
      </div>
    </div>

    </div>
   </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Calendar from 'primevue/calendar'
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import CardCommon from '~/components/common/CardCommon.vue'
import { useToast } from 'primevue/usetoast'
import RecentEvent from './RecentEvent.vue'
import ComingEvent from './ComingEvent.vue'
const { clearAuth } = useAuth()
const config = useRuntimeConfig() // add this at the top of script setup

const router = useRouter()
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
const userRole = ref('') // or default role string

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const logoutWithToast = () => {
  showUserMenu.value = false

  // Clear auth from all storage (cookie, localStorage, sessionStorage)
  clearAuth()

  // Show toast
  toast.add({
    severity: 'info',
    summary: 'Logged out',
    detail: 'You have been logged out successfully.',
    life: 2000,
  })

  // Redirect immediately
  router.push('/login')
}

const updateDisplay = () => {
  const [start, end] = dateRange.value || []
  if (start && end) {
    const formattedStart = start.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
    const formattedEnd = end.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
  }
}
async function fetchUserInfo() {
  try {
    const { getToken, isTokenExpired, clearAuth, refreshToken } = useAuth()
    let token = getToken()
    
    if (!token) {
      console.log('🔒 No token found, redirecting to login')
      router.push('/login?redirect=/admin/dashboard')
      return
    }

    // Check if token is expired and try to refresh if needed
    if (isTokenExpired()) {
      try {
        const refreshSuccess = await refreshToken()
        if (refreshSuccess) {
          token = getToken() // Get refreshed token
        } else {
          throw new Error('Token refresh failed')
        }
      } catch (refreshError) {
        console.warn('❌ Token refresh failed:', refreshError)
        clearAuth()
        toast.add({
          severity: 'warn',
          summary: 'Session Expired',
          detail: 'Please login again',
          life: 3000,
        })
        router.push('/login?session_expired=true&redirect=/admin/dashboard')
        return
      }
    }

    // Make API call with better error handling
    const res = await fetch(`${config.public.apiBaseUrl}/info`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    })
    
    if (res.status === 401) {
      console.log('🔒 API returned 401, clearing auth and redirecting')
      clearAuth()
      toast.add({
        severity: 'warn',
        summary: 'Session Expired',
        detail: 'Please login again',
        life: 3000,
      })
      router.push('/login?session_expired=true&redirect=/admin/dashboard')
      return
    }
    
    if (!res.ok) {
      const errorText = await res.text()
      console.error(`❌ API Error ${res.status}:`, errorText)
      throw new Error(`HTTP ${res.status}: Failed to fetch user info`)
    }

    const data = await res.json()
    userName.value = data.name || data.preferred_username || data.email || 'No Name'
    userRole.value = data.role || 'Admin'
  } catch (error) {
    console.error('❌ fetchUserInfo error:', error)
    
    // More specific error handling
    if (error.message.includes('fetch')) {
      toast.add({
        severity: 'error',
        summary: 'Connection Error',
        detail: 'Unable to connect to server. Please check your internet connection.',
        life: 5000,
      })
    } else if (!error.message.includes('401')) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Unable to fetch user info. Some features may not work properly.',
        life: 5000,
      })
    }
    
    userName.value = 'Unknown User'
    userRole.value = 'User'
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

// Handle click outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    showUserMenu.value = false
  }
}

// Setup lifecycle hooks
let interval = null

onMounted(async () => {
  await fetchUserInfo()
  updateDateTime()
  interval = setInterval(updateDateTime, 1000)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (interval) {
    clearInterval(interval)
  }
  document.removeEventListener('click', handleClickOutside)
})

definePageMeta({
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