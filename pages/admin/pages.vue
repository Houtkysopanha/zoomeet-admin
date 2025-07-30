<template>
  <div class="p-6">
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Pages Management</h1>
          <p class="text-gray-600">Create and manage static pages for your website</p>
        </div>
        <button class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2">
          <Icon name="i-heroicons-plus" />
          <span>New Page</span>
        </button>
      </div>
    </div>

    <!-- Coming Soon Message -->
    <div class="bg-white rounded-lg shadow p-12 text-center">
      <Icon name="i-heroicons-document-duplicate" class="text-6xl text-gray-400 mb-4" />
      <h3 class="text-xl font-semibold text-gray-900 mb-2">Pages Management</h3>
      <p class="text-gray-600 mb-6">This feature is coming soon. You'll be able to create and manage static pages here.</p>
      <div class="flex justify-center space-x-4">
        <button class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          Learn More
        </button>
        <button class="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          Request Feature
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: "auth",
  layout: "admin",
})
</script>
