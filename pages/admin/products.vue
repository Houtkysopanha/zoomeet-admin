<template>
  <div class="p-6">
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Product Management</h1>
          <p class="text-gray-600">Manage your product catalog and inventory</p>
        </div>
        <div class="flex space-x-3">
          <button class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
            <Icon name="i-heroicons-arrow-down-tray" />
            <span>Import</span>
          </button>
          <button class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2">
            <Icon name="i-heroicons-plus" />
            <span>Add Product</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
              <Icon name="i-heroicons-cube" class="text-white" />
            </div>
          </div>
          <div class="ml-5">
            <p class="text-sm font-medium text-gray-500">Total Products</p>
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
            <p class="text-sm font-medium text-gray-500">In Stock</p>
            <p class="text-2xl font-semibold text-gray-900">1,089</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
              <Icon name="i-heroicons-exclamation-triangle" class="text-white" />
            </div>
          </div>
          <div class="ml-5">
            <p class="text-sm font-medium text-gray-500">Low Stock</p>
            <p class="text-2xl font-semibold text-gray-900">23</p>
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
            <p class="text-sm font-medium text-gray-500">Out of Stock</p>
            <p class="text-2xl font-semibold text-gray-900">135</p>
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
            placeholder="Search products..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
      <div class="flex gap-2">
        <select class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          <option>All Categories</option>
          <option>Electronics</option>
          <option>Clothing</option>
          <option>Books</option>
          <option>Home & Garden</option>
        </select>
        <select class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          <option>All Status</option>
          <option>Active</option>
          <option>Inactive</option>
          <option>Draft</option>
        </select>
      </div>
    </div>

    <!-- Products Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="product in products" :key="product.id" class="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
        <div class="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
          <img :src="product.image" :alt="product.name" class="w-full h-48 object-cover">
        </div>
        <div class="p-4">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="text-sm font-medium text-gray-900 mb-1">{{ product.name }}</h3>
              <p class="text-sm text-gray-500 mb-2">{{ product.category }}</p>
              <div class="flex items-center space-x-2 mb-2">
                <span class="text-lg font-bold text-gray-900">${{ product.price }}</span>
                <span v-if="product.originalPrice" class="text-sm text-gray-500 line-through">${{ product.originalPrice }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="getStockClass(product.stock)">
                  {{ getStockStatus(product.stock) }}
                </span>
                <span class="text-xs text-gray-500">{{ product.stock }} in stock</span>
              </div>
            </div>
          </div>
          <div class="mt-4 flex space-x-2">
            <button class="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-md text-sm hover:bg-indigo-700 transition-colors">
              Edit
            </button>
            <button class="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors">
              <Icon name="i-heroicons-eye" class="w-4 h-4" />
            </button>
            <button class="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors">
              <Icon name="i-heroicons-ellipsis-vertical" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between mt-8">
      <div class="text-sm text-gray-700">
        Showing <span class="font-medium">1</span> to <span class="font-medium">12</span> of <span class="font-medium">1,247</span> results
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

const products = ref([
  {
    id: 1,
    name: 'Wireless Bluetooth Headphones',
    category: 'Electronics',
    price: 99.99,
    originalPrice: 129.99,
    stock: 45,
    image: 'https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Headphones'
  },
  {
    id: 2,
    name: 'Premium Cotton T-Shirt',
    category: 'Clothing',
    price: 29.99,
    stock: 120,
    image: 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=T-Shirt'
  },
  {
    id: 3,
    name: 'JavaScript Programming Book',
    category: 'Books',
    price: 39.99,
    stock: 8,
    image: 'https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Book'
  },
  {
    id: 4,
    name: 'Smart Home Speaker',
    category: 'Electronics',
    price: 149.99,
    stock: 0,
    image: 'https://via.placeholder.com/300x200/EF4444/FFFFFF?text=Speaker'
  },
  {
    id: 5,
    name: 'Garden Plant Pot Set',
    category: 'Home & Garden',
    price: 24.99,
    stock: 67,
    image: 'https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=Pots'
  },
  {
    id: 6,
    name: 'Laptop Stand Adjustable',
    category: 'Electronics',
    price: 79.99,
    stock: 15,
    image: 'https://via.placeholder.com/300x200/06B6D4/FFFFFF?text=Stand'
  }
])

function getStockClass(stock) {
  if (stock === 0) return 'bg-red-100 text-red-800'
  if (stock < 20) return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

function getStockStatus(stock) {
  if (stock === 0) return 'Out of Stock'
  if (stock < 20) return 'Low Stock'
  return 'In Stock'
}
</script>
