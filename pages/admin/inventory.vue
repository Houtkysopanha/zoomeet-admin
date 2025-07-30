<template>
  <div class="p-6">
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
          <p class="text-gray-600">Track and manage your product inventory</p>
        </div>
        <button class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2">
          <Icon name="i-heroicons-plus" />
          <span>Add Stock</span>
        </button>
      </div>
    </div>

    <!-- Coming Soon -->
    <div class="bg-white rounded-lg shadow p-12 text-center">
      <Icon name="i-heroicons-archive-box" class="text-6xl text-gray-400 mb-4" />
      <h3 class="text-xl font-semibold text-gray-900 mb-2">Inventory Management</h3>
      <p class="text-gray-600">Inventory tracking features are coming soon.</p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: "auth",
  layout: "admin",
})
</script>
