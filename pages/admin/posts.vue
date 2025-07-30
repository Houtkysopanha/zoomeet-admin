<template>
  <div class="p-6">
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Posts Management</h1>
          <p class="text-gray-600">Create, edit, and manage your blog posts and articles</p>
        </div>
        <button class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2">
          <Icon name="i-heroicons-plus" />
          <span>New Post</span>
        </button>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="mb-6 flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <div class="relative">
          <Icon name="i-heroicons-magnifying-glass" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search posts..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
      <div class="flex gap-2">
        <select class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          <option>All Status</option>
          <option>Published</option>
          <option>Draft</option>
          <option>Archived</option>
        </select>
        <select class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          <option>All Categories</option>
          <option>Technology</option>
          <option>Business</option>
          <option>Lifestyle</option>
        </select>
      </div>
    </div>

    <!-- Posts Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input type="checkbox" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="post in posts" :key="post.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <input type="checkbox" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-12 w-12">
                  <img class="h-12 w-12 rounded-lg object-cover" :src="post.image" :alt="post.title">
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ post.title }}</div>
                  <div class="text-sm text-gray-500">{{ post.excerpt }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-8 w-8">
                  <div class="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                    <span class="text-white text-xs font-medium">{{ post.author.charAt(0) }}</span>
                  </div>
                </div>
                <div class="ml-3">
                  <div class="text-sm font-medium text-gray-900">{{ post.author }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {{ post.category }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="getStatusClass(post.status)">
                {{ post.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ post.date }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="flex space-x-2">
                <button class="text-indigo-600 hover:text-indigo-900">
                  <Icon name="i-heroicons-pencil" class="w-4 h-4" />
                </button>
                <button class="text-green-600 hover:text-green-900">
                  <Icon name="i-heroicons-eye" class="w-4 h-4" />
                </button>
                <button class="text-red-600 hover:text-red-900">
                  <Icon name="i-heroicons-trash" class="w-4 h-4" />
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
        Showing <span class="font-medium">1</span> to <span class="font-medium">10</span> of <span class="font-medium">47</span> results
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

const posts = ref([
  {
    id: 1,
    title: 'Getting Started with Vue 3',
    excerpt: 'Learn the basics of Vue 3 and its new features...',
    author: 'John Doe',
    category: 'Technology',
    status: 'Published',
    date: '2024-01-15',
    image: 'https://via.placeholder.com/48x48/3B82F6/FFFFFF?text=V3'
  },
  {
    id: 2,
    title: 'Building Modern Web Applications',
    excerpt: 'Best practices for creating scalable web apps...',
    author: 'Jane Smith',
    category: 'Development',
    status: 'Draft',
    date: '2024-01-14',
    image: 'https://via.placeholder.com/48x48/10B981/FFFFFF?text=WA'
  },
  {
    id: 3,
    title: 'The Future of JavaScript',
    excerpt: 'Exploring upcoming features and trends...',
    author: 'Mike Johnson',
    category: 'Technology',
    status: 'Published',
    date: '2024-01-13',
    image: 'https://via.placeholder.com/48x48/F59E0B/FFFFFF?text=JS'
  },
  {
    id: 4,
    title: 'UI/UX Design Principles',
    excerpt: 'Creating user-friendly interfaces...',
    author: 'Sarah Wilson',
    category: 'Design',
    status: 'Published',
    date: '2024-01-12',
    image: 'https://via.placeholder.com/48x48/EF4444/FFFFFF?text=UI'
  },
  {
    id: 5,
    title: 'Database Optimization Tips',
    excerpt: 'Improve your database performance...',
    author: 'David Brown',
    category: 'Backend',
    status: 'Archived',
    date: '2024-01-11',
    image: 'https://via.placeholder.com/48x48/8B5CF6/FFFFFF?text=DB'
  }
])

function getStatusClass(status) {
  const classes = {
    'Published': 'bg-green-100 text-green-800',
    'Draft': 'bg-yellow-100 text-yellow-800',
    'Archived': 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}
</script>
