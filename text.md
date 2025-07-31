<template>
  <div class="p-6">
    <!-- Welcome Section -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        </div>
        <div class="text-right">
          <!-- <div class="text-sm text-gray-500">{{ currentDate }}</div>
          <div class="text-lg font-semibold text-gray-900">{{ currentTime }}</div> -->
          <!-- User Menu -->
        <div class="flex items-center justify-center p-4 space-x-4 mt-auto">
          <div class="relative">
            <button
              @click="toggleUserMenu"
              class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div class="w-8 h-8 bg-[#E6F2FF] rounded-full flex items-center justify-center">
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
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div v-for="stat in quickStats" :key="stat.title" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="stat.bgColor">
              <Icon :name="stat.icon" class="text-white text-xl" />
            </div>
          </div>
          <div class="ml-4 flex-1">
            <p class="text-sm font-medium text-gray-600">{{ stat.title }}</p>
            <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
            <p class="text-sm" :class="stat.trend === 'up' ? 'text-green-600' : 'text-red-600'">
              <Icon :name="stat.trend === 'up' ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-arrow-trending-down'" class="inline w-4 h-4 mr-1" />
              {{ stat.change }} from last month
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- Recent Activity -->
      <div class="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div v-for="activity in recentActivity" :key="activity.id" class="flex items-start space-x-3">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 rounded-full flex items-center justify-center" :class="activity.bgColor">
                  <Icon :name="activity.icon" class="text-white text-sm" />
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900">{{ activity.title }}</p>
                <p class="text-sm text-gray-500">{{ activity.description }}</p>
                <p class="text-xs text-gray-400 mt-1">{{ activity.time }}</p>
              </div>
            </div>
          </div>
          <div class="mt-6">
            <NuxtLink to="/admin/report" class="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              View all activity →
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div class="p-6">
          <div class="space-y-3">
            <NuxtLink
              v-for="action in quickActions"
              :key="action.title"
              :to="action.link"
              class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div class="flex-shrink-0">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center" :class="action.bgColor">
                  <Icon :name="action.icon" class="text-white text-sm" />
                </div>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900 group-hover:text-indigo-600">{{ action.title }}</p>
                <p class="text-xs text-gray-500">{{ action.description }}</p>
              </div>
              <Icon name="i-heroicons-chevron-right" class="text-gray-400 group-hover:text-indigo-600" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- System Status -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- System Health -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">System Health</h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div v-for="metric in systemMetrics" :key="metric.name" class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 rounded-full" :class="metric.status === 'good' ? 'bg-green-500' : metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'"></div>
                <span class="text-sm font-medium text-gray-900">{{ metric.name }}</span>
              </div>
              <div class="text-right">
                <div class="text-sm font-semibold text-gray-900">{{ metric.value }}</div>
                <div class="text-xs text-gray-500">{{ metric.label }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Users -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Recent Users</h3>
            <NuxtLink to="/admin/users" class="text-sm text-indigo-600 hover:text-indigo-800">View all</NuxtLink>
          </div>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div v-for="user in recentUsers" :key="user.id" class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                  <span class="text-white font-medium text-sm">{{ user.name.charAt(0) }}</span>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ user.name }}</p>
                <p class="text-sm text-gray-500 truncate">{{ user.email }}</p>
              </div>
              <div class="text-xs text-gray-400">{{ user.joinedAt }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- PrimeVue Toast container -->
    <Toast />
  </div>
</template>

<script setup>
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

definePageMeta({
  middleware: "auth",
  layout: "admin",
})

// Reactive data
const currentDate = ref('')
const currentTime = ref('')

// Quick stats data
const quickStats = ref([
  {
    title: 'Total Users',
    value: '2,651',
    change: '+12%',
    trend: 'up',
    icon: 'i-heroicons-users',
    bgColor: 'bg-blue-500'
  },
  {
    title: 'Active Sessions',
    value: '1,423',
    change: '+8%',
    trend: 'up',
    icon: 'i-heroicons-globe-alt',
    bgColor: 'bg-green-500'
  },
  {
    title: 'Revenue',
    value: '$45,231',
    change: '+15%',
    trend: 'up',
    icon: 'i-heroicons-currency-dollar',
    bgColor: 'bg-yellow-500'
  },
  {
    title: 'Support Tickets',
    value: '23',
    change: '-5%',
    trend: 'down',
    icon: 'i-heroicons-ticket',
    bgColor: 'bg-red-500'
  }
])

// Recent activity data
const recentActivity = ref([
  {
    id: 1,
    title: 'New user registered',
    description: 'John Doe joined the platform',
    time: '2 minutes ago',
    icon: 'i-heroicons-user-plus',
    bgColor: 'bg-green-500'
  },
  {
    id: 2,
    title: 'Order completed',
    description: 'Order #1234 has been processed',
    time: '15 minutes ago',
    icon: 'i-heroicons-check-circle',
    bgColor: 'bg-blue-500'
  },
  {
    id: 3,
    title: 'System backup',
    description: 'Daily backup completed successfully',
    time: '1 hour ago',
    icon: 'i-heroicons-server',
    bgColor: 'bg-purple-500'
  },
  {
    id: 4,
    title: 'Security alert',
    description: 'Failed login attempt detected',
    time: '2 hours ago',
    icon: 'i-heroicons-shield-exclamation',
    bgColor: 'bg-red-500'
  }
])

// Quick actions data
const quickActions = ref([
  {
    title: 'Add New User',
    description: 'Create a new user account',
    icon: 'i-heroicons-user-plus',
    bgColor: 'bg-blue-500',
    link: '/admin/users'
  },
  {
    title: 'View Reports',
    description: 'Check analytics and reports',
    icon: 'i-heroicons-chart-bar',
    bgColor: 'bg-green-500',
    link: '/admin/report'
  },
  {
    title: 'System Settings',
    description: 'Configure application settings',
    icon: 'i-heroicons-cog-6-tooth',
    bgColor: 'bg-purple-500',
    link: '/admin/settings'
  },
  {
    title: 'Backup Data',
    description: 'Create system backup',
    icon: 'i-heroicons-server',
    bgColor: 'bg-yellow-500',
    link: '#'
  }
])



// Update current date and time
function updateDateTime() {
  const now = new Date()
  currentDate.value = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  currentTime.value = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}



// Lifecycle hooks
onMounted(() => {
  updateDateTime()
  setInterval(updateDateTime, 1000)
})
</script>
