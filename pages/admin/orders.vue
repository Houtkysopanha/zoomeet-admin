<template>
  <div class="p-6">
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
          <p class="text-gray-600">Track and manage customer orders</p>
        </div>
        <button class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2">
          <Icon name="i-heroicons-arrow-down-tray" />
          <span>Export Orders</span>
        </button>
      </div>
    </div>

    <!-- Order Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div v-for="stat in orderStats" :key="stat.title" class="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 rounded-md flex items-center justify-center" :class="stat.bgColor">
              <Icon :name="stat.icon" class="text-white" />
            </div>
          </div>
          <div class="ml-5">
            <p class="text-sm font-medium text-gray-500">{{ stat.title }}</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stat.value }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="mb-6 flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <div class="relative">
          <Icon name="i-heroicons-magnifying-glass" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
      <div class="flex gap-2">
        <select class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          <option>All Status</option>
          <option>Pending</option>
          <option>Processing</option>
          <option>Shipped</option>
          <option>Delivered</option>
          <option>Cancelled</option>
        </select>
        <input type="date" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
      </div>
    </div>

    <!-- Orders Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">#{{ order.id }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-8 w-8">
                  <div class="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                    <span class="text-white text-xs font-medium">{{ order.customer.name.charAt(0) }}</span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ order.customer.name }}</div>
                  <div class="text-sm text-gray-500">{{ order.customer.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-900">{{ order.itemCount }} items</div>
              <div class="text-sm text-gray-500">{{ order.products.join(', ') }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">${{ order.total }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="getStatusClass(order.status)">
                {{ order.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ order.date }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="flex space-x-2">
                <button class="text-indigo-600 hover:text-indigo-900">
                  <Icon name="i-heroicons-eye" class="w-4 h-4" />
                </button>
                <button class="text-green-600 hover:text-green-900">
                  <Icon name="i-heroicons-pencil" class="w-4 h-4" />
                </button>
                <button class="text-gray-600 hover:text-gray-900">
                  <Icon name="i-heroicons-printer" class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between mt-6">
      <div class="text-sm text-gray-700">
        Showing <span class="font-medium">1</span> to <span class="font-medium">10</span> of <span class="font-medium">156</span> results
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

const orderStats = ref([
  {
    title: 'Total Orders',
    value: '1,247',
    icon: 'i-heroicons-shopping-bag',
    bgColor: 'bg-blue-500'
  },
  {
    title: 'Pending',
    value: '23',
    icon: 'i-heroicons-clock',
    bgColor: 'bg-yellow-500'
  },
  {
    title: 'Processing',
    value: '45',
    icon: 'i-heroicons-cog-6-tooth',
    bgColor: 'bg-blue-500'
  },
  {
    title: 'Completed',
    value: '1,179',
    icon: 'i-heroicons-check-circle',
    bgColor: 'bg-green-500'
  }
])

const orders = ref([
  {
    id: '10001',
    customer: {
      name: 'John Doe',
      email: 'john@example.com'
    },
    itemCount: 3,
    products: ['Wireless Headphones', 'Phone Case'],
    total: '299.97',
    status: 'Delivered',
    date: '2024-01-15'
  },
  {
    id: '10002',
    customer: {
      name: 'Jane Smith',
      email: 'jane@example.com'
    },
    itemCount: 1,
    products: ['Laptop Stand'],
    total: '79.99',
    status: 'Shipped',
    date: '2024-01-14'
  },
  {
    id: '10003',
    customer: {
      name: 'Mike Johnson',
      email: 'mike@example.com'
    },
    itemCount: 2,
    products: ['T-Shirt', 'Jeans'],
    total: '89.98',
    status: 'Processing',
    date: '2024-01-13'
  },
  {
    id: '10004',
    customer: {
      name: 'Sarah Wilson',
      email: 'sarah@example.com'
    },
    itemCount: 4,
    products: ['Books', 'Notebook'],
    total: '156.96',
    status: 'Pending',
    date: '2024-01-12'
  },
  {
    id: '10005',
    customer: {
      name: 'David Brown',
      email: 'david@example.com'
    },
    itemCount: 1,
    products: ['Smart Speaker'],
    total: '149.99',
    status: 'Cancelled',
    date: '2024-01-11'
  }
])

function getStatusClass(status) {
  const classes = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Processing': 'bg-blue-100 text-blue-800',
    'Shipped': 'bg-purple-100 text-purple-800',
    'Delivered': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}
</script>
