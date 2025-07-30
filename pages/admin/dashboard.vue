<template>
  <div class="p-6">
    <!-- Welcome Section -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Welcome back, Admin!</h1>
          <p class="text-gray-600">Here's what's happening with your application today.</p>
        </div>
        <div class="text-right">
          <div class="text-sm text-gray-500">{{ currentDate }}</div>
          <div class="text-lg font-semibold text-gray-900">{{ currentTime }}</div>
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
import { ref, onMounted } from "vue"

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

// System metrics data
const systemMetrics = ref([
  {
    name: 'Server Status',
    value: 'Online',
    label: 'All systems operational',
    status: 'good'
  },
  {
    name: 'CPU Usage',
    value: '45%',
    label: 'Normal load',
    status: 'good'
  },
  {
    name: 'Memory Usage',
    value: '78%',
    label: 'High usage',
    status: 'warning'
  },
  {
    name: 'Disk Space',
    value: '23GB',
    label: 'Available',
    status: 'good'
  }
])

// Recent users data
const recentUsers = ref([
  {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    joinedAt: '2h ago'
  },
  {
    id: 2,
    name: 'Bob Smith',
    email: 'bob@example.com',
    joinedAt: '4h ago'
  },
  {
    id: 3,
    name: 'Carol Davis',
    email: 'carol@example.com',
    joinedAt: '6h ago'
  },
  {
    id: 4,
    name: 'David Wilson',
    email: 'david@example.com',
    joinedAt: '8h ago'
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
