<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
      <p class="text-gray-600">View detailed reports and analytics for your application</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div v-for="stat in stats" :key="stat.title" class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 rounded-md flex items-center justify-center" :class="stat.iconBg">
              <Icon :name="stat.icon" class="text-white" />
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">{{ stat.title }}</dt>
              <dd class="flex items-baseline">
                <div class="text-2xl font-semibold text-gray-900">{{ stat.value }}</div>
                <div class="ml-2 flex items-baseline text-sm font-semibold" :class="stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'">
                  <Icon :name="stat.changeType === 'increase' ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-arrow-trending-down'" class="self-center flex-shrink-0 h-4 w-4" />
                  <span class="sr-only">{{ stat.changeType === 'increase' ? 'Increased' : 'Decreased' }} by</span>
                  {{ stat.change }}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Chart 1 -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">User Activity</h3>
          <select class="text-sm border border-gray-300 rounded-md px-3 py-1">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 3 months</option>
          </select>
        </div>
        <div class="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div class="text-center">
            <Icon name="i-heroicons-chart-bar" class="text-4xl text-gray-400 mb-2" />
            <p class="text-gray-500">Chart visualization would go here</p>
          </div>
        </div>
      </div>

      <!-- Chart 2 -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Revenue Trends</h3>
          <select class="text-sm border border-gray-300 rounded-md px-3 py-1">
            <option>This month</option>
            <option>Last month</option>
            <option>This year</option>
          </select>
        </div>
        <div class="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div class="text-center">
            <Icon name="i-heroicons-chart-pie" class="text-4xl text-gray-400 mb-2" />
            <p class="text-gray-500">Chart visualization would go here</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity Table -->
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <button class="text-sm text-indigo-600 hover:text-indigo-800">View all</button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="activity in recentActivities" :key="activity.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-8 w-8">
                    <div class="h-8 w-8 rounded-full flex items-center justify-center" :class="activity.iconBg">
                      <Icon :name="activity.icon" class="text-white text-sm" />
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ activity.action }}</div>
                    <div class="text-sm text-gray-500">{{ activity.description }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ activity.user }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ activity.date }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="getStatusClass(activity.status)">
                  {{ activity.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

definePageMeta({
  middleware: "auth",
  layout: "admin",
})

// Stats data
const stats = ref([
  {
    title: 'Total Users',
    value: '2,651',
    change: '12%',
    changeType: 'increase',
    icon: 'i-heroicons-users',
    iconBg: 'bg-blue-500'
  },
  {
    title: 'Revenue',
    value: '$45,231',
    change: '8%',
    changeType: 'increase',
    icon: 'i-heroicons-currency-dollar',
    iconBg: 'bg-green-500'
  },
  {
    title: 'Orders',
    value: '1,423',
    change: '3%',
    changeType: 'decrease',
    icon: 'i-heroicons-shopping-cart',
    iconBg: 'bg-yellow-500'
  },
  {
    title: 'Conversion Rate',
    value: '3.24%',
    change: '5%',
    changeType: 'increase',
    icon: 'i-heroicons-chart-bar',
    iconBg: 'bg-purple-500'
  }
])

// Recent activities data
const recentActivities = ref([
  {
    id: 1,
    action: 'User Registration',
    description: 'New user signed up',
    user: 'John Doe',
    date: '2 hours ago',
    status: 'Completed',
    icon: 'i-heroicons-user-plus',
    iconBg: 'bg-green-500'
  },
  {
    id: 2,
    action: 'Order Placed',
    description: 'New order received',
    user: 'Jane Smith',
    date: '4 hours ago',
    status: 'Processing',
    icon: 'i-heroicons-shopping-bag',
    iconBg: 'bg-blue-500'
  },
  {
    id: 3,
    action: 'Payment Failed',
    description: 'Payment processing failed',
    user: 'Mike Johnson',
    date: '6 hours ago',
    status: 'Failed',
    icon: 'i-heroicons-exclamation-triangle',
    iconBg: 'bg-red-500'
  },
  {
    id: 4,
    action: 'Profile Updated',
    description: 'User updated profile information',
    user: 'Sarah Wilson',
    date: '8 hours ago',
    status: 'Completed',
    icon: 'i-heroicons-pencil',
    iconBg: 'bg-yellow-500'
  }
])

// Helper function for status styling
function getStatusClass(status) {
  const classes = {
    'Completed': 'bg-green-100 text-green-800',
    'Processing': 'bg-blue-100 text-blue-800',
    'Failed': 'bg-red-100 text-red-800',
    'Pending': 'bg-yellow-100 text-yellow-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}
</script>
