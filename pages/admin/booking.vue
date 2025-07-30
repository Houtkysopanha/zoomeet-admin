<template>
  <div class="p-6">
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Booking Management</h1>
          <p class="text-gray-600">Manage event bookings and reservations</p>
        </div>
        <button class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2">
          <Icon name="i-heroicons-plus" />
          <span>New Booking</span>
        </button>
      </div>
    </div>

    <!-- Booking Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
              <Icon name="i-heroicons-clipboard-document-check" class="text-white" />
            </div>
          </div>
          <div class="ml-5">
            <p class="text-sm font-medium text-gray-500">Total Bookings</p>
            <p class="text-2xl font-semibold text-gray-900">1,247</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
              <Icon name="i-heroicons-check-circle" class="text-white" />
            </div>
          </div>
          <div class="ml-5">
            <p class="text-sm font-medium text-gray-500">Confirmed</p>
            <p class="text-2xl font-semibold text-gray-900">1,089</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
              <Icon name="i-heroicons-clock" class="text-white" />
            </div>
          </div>
          <div class="ml-5">
            <p class="text-sm font-medium text-gray-500">Pending</p>
            <p class="text-2xl font-semibold text-gray-900">123</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
              <Icon name="i-heroicons-x-circle" class="text-white" />
            </div>
          </div>
          <div class="ml-5">
            <p class="text-sm font-medium text-gray-500">Cancelled</p>
            <p class="text-2xl font-semibold text-gray-900">35</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="mb-6 flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <div class="relative">
          <Icon name="i-heroicons-magnifying-glass" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search bookings..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
      <div class="flex gap-2">
        <select class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          <option>All Status</option>
          <option>Confirmed</option>
          <option>Pending</option>
          <option>Cancelled</option>
        </select>
        <input type="date" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
      </div>
    </div>

    <!-- Bookings Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="booking in bookings" :key="booking.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">#{{ booking.id }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-8 w-8">
                  <div class="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                    <span class="text-white text-xs font-medium">{{ booking.customer.name.charAt(0) }}</span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ booking.customer.name }}</div>
                  <div class="text-sm text-gray-500">{{ booking.customer.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm font-medium text-gray-900">{{ booking.event.title }}</div>
              <div class="text-sm text-gray-500">{{ booking.event.date }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ booking.bookingDate }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ booking.tickets }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">${{ booking.total }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="getStatusClass(booking.status)">
                {{ booking.status }}
              </span>
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
        Showing <span class="font-medium">1</span> to <span class="font-medium">10</span> of <span class="font-medium">1,247</span> results
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

const bookings = ref([
  {
    id: 'BK001',
    customer: {
      name: 'John Doe',
      email: 'john@example.com'
    },
    event: {
      title: 'Tech Conference 2024',
      date: 'March 15, 2024'
    },
    bookingDate: '2024-01-15',
    tickets: 2,
    total: '299.98',
    status: 'Confirmed'
  },
  {
    id: 'BK002',
    customer: {
      name: 'Jane Smith',
      email: 'jane@example.com'
    },
    event: {
      title: 'Web Development Workshop',
      date: 'March 20, 2024'
    },
    bookingDate: '2024-01-14',
    tickets: 1,
    total: '79.99',
    status: 'Confirmed'
  },
  {
    id: 'BK003',
    customer: {
      name: 'Mike Johnson',
      email: 'mike@example.com'
    },
    event: {
      title: 'Business Strategy Seminar',
      date: 'March 25, 2024'
    },
    bookingDate: '2024-01-13',
    tickets: 3,
    total: '149.97',
    status: 'Pending'
  },
  {
    id: 'BK004',
    customer: {
      name: 'Sarah Wilson',
      email: 'sarah@example.com'
    },
    event: {
      title: 'Design Thinking Workshop',
      date: 'February 28, 2024'
    },
    bookingDate: '2024-01-12',
    tickets: 1,
    total: '99.99',
    status: 'Confirmed'
  },
  {
    id: 'BK005',
    customer: {
      name: 'David Brown',
      email: 'david@example.com'
    },
    event: {
      title: 'Digital Marketing Webinar',
      date: 'April 5, 2024'
    },
    bookingDate: '2024-01-11',
    tickets: 2,
    total: '59.98',
    status: 'Cancelled'
  }
])

function getStatusClass(status) {
  const classes = {
    'Confirmed': 'bg-green-100 text-green-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Cancelled': 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}
</script>
