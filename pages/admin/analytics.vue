<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
      <p class="text-gray-600">Comprehensive analytics and insights for your application</p>
    </div>

    <!-- Time Range Selector -->
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <select v-model="selectedTimeRange" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
        <button class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Icon name="i-heroicons-arrow-path" class="inline mr-2" />
          Refresh Data
        </button>
      </div>
      <button class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
        <Icon name="i-heroicons-arrow-down-tray" class="inline mr-2" />
        Export Report
      </button>
    </div>

    <!-- Key Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div v-for="metric in keyMetrics" :key="metric.title" class="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">{{ metric.title }}</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">{{ metric.value }}</p>
            <div class="flex items-center mt-2">
              <Icon 
                :name="metric.trend === 'up' ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-arrow-trending-down'" 
                :class="metric.trend === 'up' ? 'text-green-500' : 'text-red-500'"
                class="w-4 h-4 mr-1"
              />
              <span :class="metric.trend === 'up' ? 'text-green-600' : 'text-red-600'" class="text-sm font-medium">
                {{ metric.change }}
              </span>
              <span class="text-gray-500 text-sm ml-1">vs last period</span>
            </div>
          </div>
          <div class="w-12 h-12 rounded-lg flex items-center justify-center" :class="metric.bgColor">
            <Icon :name="metric.icon" class="text-white text-xl" />
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Traffic Overview -->
      <div class="bg-white rounded-lg shadow border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Traffic Overview</h3>
        </div>
        <div class="p-6">
          <div class="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
            <div class="text-center">
              <Icon name="i-heroicons-chart-bar" class="text-6xl text-gray-400 mb-4" />
              <p class="text-gray-500 text-lg">Traffic Chart</p>
              <p class="text-gray-400 text-sm">Chart visualization would be integrated here</p>
            </div>
          </div>
        </div>
      </div>

      <!-- User Engagement -->
      <div class="bg-white rounded-lg shadow border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">User Engagement</h3>
        </div>
        <div class="p-6">
          <div class="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
            <div class="text-center">
              <Icon name="i-heroicons-chart-pie" class="text-6xl text-gray-400 mb-4" />
              <p class="text-gray-500 text-lg">Engagement Chart</p>
              <p class="text-gray-400 text-sm">Pie chart showing user engagement metrics</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Analytics Tables -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Top Pages -->
      <div class="bg-white rounded-lg shadow border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Top Pages</h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div v-for="page in topPages" :key="page.path" class="flex items-center justify-between">
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">{{ page.title }}</p>
                <p class="text-xs text-gray-500">{{ page.path }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold text-gray-900">{{ page.views }}</p>
                <p class="text-xs text-gray-500">views</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Traffic Sources -->
      <div class="bg-white rounded-lg shadow border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Traffic Sources</h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div v-for="source in trafficSources" :key="source.name" class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: source.color }"></div>
                <span class="text-sm font-medium text-gray-900">{{ source.name }}</span>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold text-gray-900">{{ source.percentage }}%</p>
                <p class="text-xs text-gray-500">{{ source.visitors }} visitors</p>
              </div>
            </div>
          </div>
        </div>
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

const selectedTimeRange = ref('30d')

const keyMetrics = ref([
  {
    title: 'Total Visitors',
    value: '24,567',
    change: '+12.5%',
    trend: 'up',
    icon: 'i-heroicons-users',
    bgColor: 'bg-blue-500'
  },
  {
    title: 'Page Views',
    value: '89,432',
    change: '+8.2%',
    trend: 'up',
    icon: 'i-heroicons-eye',
    bgColor: 'bg-green-500'
  },
  {
    title: 'Bounce Rate',
    value: '34.2%',
    change: '-2.1%',
    trend: 'up',
    icon: 'i-heroicons-arrow-uturn-left',
    bgColor: 'bg-yellow-500'
  },
  {
    title: 'Avg. Session',
    value: '4m 32s',
    change: '+15.3%',
    trend: 'up',
    icon: 'i-heroicons-clock',
    bgColor: 'bg-purple-500'
  }
])

const topPages = ref([
  { title: 'Homepage', path: '/', views: '12,543' },
  { title: 'About Us', path: '/about', views: '8,921' },
  { title: 'Products', path: '/products', views: '7,654' },
  { title: 'Contact', path: '/contact', views: '5,432' },
  { title: 'Blog', path: '/blog', views: '4,321' }
])

const trafficSources = ref([
  { name: 'Direct', percentage: 45, visitors: '11,056', color: '#3B82F6' },
  { name: 'Google Search', percentage: 32, visitors: '7,862', color: '#10B981' },
  { name: 'Social Media', percentage: 15, visitors: '3,685', color: '#F59E0B' },
  { name: 'Referrals', percentage: 8, visitors: '1,965', color: '#EF4444' }
])
</script>
