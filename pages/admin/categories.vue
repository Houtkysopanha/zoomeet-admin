<template>
  <div class="p-6">
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Categories</h1>
          <p class="text-gray-600">Organize your content with categories and tags</p>
        </div>
        <button class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2">
          <Icon name="i-heroicons-plus" />
          <span>Add Category</span>
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Add New Category Form -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Add New Category</h3>
          <form class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                placeholder="Category name"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Slug</label>
              <input
                type="text"
                placeholder="category-slug"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Parent Category</label>
              <select class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">None</option>
                <option>Technology</option>
                <option>Business</option>
                <option>Lifestyle</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows="3"
                placeholder="Category description"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              ></textarea>
            </div>
            <button type="submit" class="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              Add Category
            </button>
          </form>
        </div>
      </div>

      <!-- Categories List -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900">All Categories</h3>
              <div class="relative">
                <Icon name="i-heroicons-magnifying-glass" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posts</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="category in categories" :key="category.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="w-8 h-8 rounded-lg flex items-center justify-center mr-3" :class="category.color">
                        <Icon :name="category.icon" class="text-white text-sm" />
                      </div>
                      <div>
                        <div class="text-sm font-medium text-gray-900">{{ category.name }}</div>
                        <div class="text-sm text-gray-500">{{ category.description }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <code class="text-sm bg-gray-100 px-2 py-1 rounded">{{ category.slug }}</code>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {{ category.postCount }} posts
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ category.parent || '—' }}
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

const categories = ref([
  {
    id: 1,
    name: 'Technology',
    slug: 'technology',
    description: 'Tech news and tutorials',
    postCount: 45,
    parent: null,
    icon: 'i-heroicons-cpu-chip',
    color: 'bg-blue-500'
  },
  {
    id: 2,
    name: 'Web Development',
    slug: 'web-development',
    description: 'Frontend and backend development',
    postCount: 23,
    parent: 'Technology',
    icon: 'i-heroicons-code-bracket',
    color: 'bg-green-500'
  },
  {
    id: 3,
    name: 'Business',
    slug: 'business',
    description: 'Business strategies and insights',
    postCount: 18,
    parent: null,
    icon: 'i-heroicons-briefcase',
    color: 'bg-yellow-500'
  },
  {
    id: 4,
    name: 'Design',
    slug: 'design',
    description: 'UI/UX and graphic design',
    postCount: 32,
    parent: null,
    icon: 'i-heroicons-paint-brush',
    color: 'bg-purple-500'
  },
  {
    id: 5,
    name: 'Lifestyle',
    slug: 'lifestyle',
    description: 'Life tips and personal development',
    postCount: 12,
    parent: null,
    icon: 'i-heroicons-heart',
    color: 'bg-pink-500'
  }
])
</script>
