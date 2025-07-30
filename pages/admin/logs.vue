<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Activity Logs</h1>
      <p class="text-gray-600">Monitor system activities and user actions</p>
    </div>

    <!-- Filters -->
    <div class="mb-6 flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <div class="relative">
          <Icon name="i-heroicons-magnifying-glass" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search logs..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
      <div class="flex gap-2">
        <select class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          <option>All Types</option>
          <option>Login</option>
          <option>Create</option>
          <option>Update</option>
          <option>Delete</option>
          <option>Error</option>
        </select>
        <input type="date" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
      </div>
    </div>

    <!-- Logs Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ log.timestamp }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-8 w-8">
                  <div class="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                    <span class="text-white text-xs font-medium">{{ log.user.charAt(0) }}</span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ log.user }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <Icon :name="log.icon" :class="log.iconColor" class="mr-2" />
                <span class="text-sm text-gray-900">{{ log.action }}</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ log.resource }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ log.ipAddress }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="getStatusClass(log.status)">
                {{ log.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between mt-6">
      <div class="text-sm text-gray-700">
        Showing <span class="font-medium">1</span> to <span class="font-medium">10</span> of <span class="font-medium">2,547</span> results
      </div>
      <div class="flex space-x-2">
        <button class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Previous</button>
        <button class="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg">1</button>
        <button class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">2</button>
        <button class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">3</button>
        <button class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Next</button>
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

const logs = ref([
  {
    id: 1,
    timestamp: '2024-01-15 14:30:25',
    user: 'Admin User',
    action: 'User Login',
    resource: '/admin/dashboard',
    ipAddress: '192.168.1.100',
    status: 'Success',
    icon: 'i-heroicons-arrow-right-on-rectangle',
    iconColor: 'text-green-500'
  },
  {
    id: 2,
    timestamp: '2024-01-15 14:25:12',
    user: 'John Doe',
    action: 'Create Post',
    resource: '/admin/posts',
    ipAddress: '192.168.1.101',
    status: 'Success',
    icon: 'i-heroicons-plus-circle',
    iconColor: 'text-blue-500'
  },
  {
    id: 3,
    timestamp: '2024-01-15 14:20:45',
    user: 'Jane Smith',
    action: 'Update User',
    resource: '/admin/users/123',
    ipAddress: '192.168.1.102',
    status: 'Success',
    icon: 'i-heroicons-pencil',
    iconColor: 'text-yellow-500'
  },
  {
    id: 4,
    timestamp: '2024-01-15 14:15:33',
    user: 'Mike Johnson',
    action: 'Failed Login',
    resource: '/login',
    ipAddress: '192.168.1.103',
    status: 'Failed',
    icon: 'i-heroicons-x-circle',
    iconColor: 'text-red-500'
  },
  {
    id: 5,
    timestamp: '2024-01-15 14:10:18',
    user: 'Admin User',
    action: 'Delete Product',
    resource: '/admin/products/456',
    ipAddress: '192.168.1.100',
    status: 'Success',
    icon: 'i-heroicons-trash',
    iconColor: 'text-red-500'
  }
])

function getStatusClass(status) {
  const classes = {
    'Success': 'bg-green-100 text-green-800',
    'Failed': 'bg-red-100 text-red-800',
    'Warning': 'bg-yellow-100 text-yellow-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}
</script>
