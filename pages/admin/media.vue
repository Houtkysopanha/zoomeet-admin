<template>
  <div class="p-6">
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Media Library</h1>
          <p class="text-gray-600">Upload and manage your media files</p>
        </div>
        <button class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2">
          <Icon name="i-heroicons-cloud-arrow-up" />
          <span>Upload Files</span>
        </button>
      </div>
    </div>

    <!-- Upload Area -->
    <div class="bg-white rounded-lg shadow p-8 mb-6 border-2 border-dashed border-gray-300 text-center hover:border-indigo-400 transition-colors">
      <Icon name="i-heroicons-cloud-arrow-up" class="text-4xl text-gray-400 mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">Upload Media Files</h3>
      <p class="text-gray-600 mb-4">Drag and drop files here, or click to browse</p>
      <button class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
        Choose Files
      </button>
    </div>

    <!-- Media Grid -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900">Recent Uploads</h3>
        <div class="flex space-x-2">
          <button class="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Icon name="i-heroicons-squares-2x2" class="w-5 h-5" />
          </button>
          <button class="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Icon name="i-heroicons-list-bullet" class="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div v-for="file in mediaFiles" :key="file.id" class="group relative bg-gray-100 rounded-lg overflow-hidden aspect-square hover:shadow-md transition-shadow">
          <img :src="file.thumbnail" :alt="file.name" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
            <div class="opacity-0 group-hover:opacity-100 transition-opacity space-x-2">
              <button class="p-2 bg-white rounded-full hover:bg-gray-100">
                <Icon name="i-heroicons-eye" class="w-4 h-4" />
              </button>
              <button class="p-2 bg-white rounded-full hover:bg-gray-100">
                <Icon name="i-heroicons-trash" class="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
          <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
            <p class="text-white text-xs truncate">{{ file.name }}</p>
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

const mediaFiles = ref([
  {
    id: 1,
    name: 'hero-image.jpg',
    thumbnail: 'https://via.placeholder.com/200x200/3B82F6/FFFFFF?text=IMG1'
  },
  {
    id: 2,
    name: 'product-photo.png',
    thumbnail: 'https://via.placeholder.com/200x200/10B981/FFFFFF?text=IMG2'
  },
  {
    id: 3,
    name: 'team-photo.jpg',
    thumbnail: 'https://via.placeholder.com/200x200/F59E0B/FFFFFF?text=IMG3'
  },
  {
    id: 4,
    name: 'logo-design.svg',
    thumbnail: 'https://via.placeholder.com/200x200/EF4444/FFFFFF?text=SVG'
  },
  {
    id: 5,
    name: 'banner-ad.jpg',
    thumbnail: 'https://via.placeholder.com/200x200/8B5CF6/FFFFFF?text=IMG4'
  },
  {
    id: 6,
    name: 'profile-pic.png',
    thumbnail: 'https://via.placeholder.com/200x200/06B6D4/FFFFFF?text=IMG5'
  }
])
</script>
