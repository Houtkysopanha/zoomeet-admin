<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Notification Settings</h1>
      <p class="text-gray-600">Configure how you receive notifications</p>
    </div>

    <div class="bg-white rounded-lg shadow border border-gray-200">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Notification Preferences</h3>
      </div>
      <div class="p-6 space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-sm font-medium text-gray-900">Email Notifications</h4>
            <p class="text-sm text-gray-500">Receive notifications via email</p>
          </div>
          <button class="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600 transition-colors">
            <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
          </button>
        </div>
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-sm font-medium text-gray-900">Push Notifications</h4>
            <p class="text-sm text-gray-500">Receive push notifications in your browser</p>
          </div>
          <button class="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
            <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"></span>
          </button>
        </div>
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-sm font-medium text-gray-900">SMS Notifications</h4>
            <p class="text-sm text-gray-500">Receive important alerts via SMS</p>
          </div>
          <button class="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
            <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"></span>
          </button>
        </div>
      </div>
      <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div class="flex justify-end space-x-3">
          <button class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
            Save Changes
          </button>
        </div>
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
