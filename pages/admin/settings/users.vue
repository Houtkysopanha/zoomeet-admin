<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">User Management Settings</h1>
      <p class="text-gray-600">Configure user registration and management options</p>
    </div>

    <div class="bg-white rounded-lg shadow border border-gray-200">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">User Settings</h3>
      </div>
      <div class="p-6 space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-sm font-medium text-gray-900">Allow User Registration</h4>
            <p class="text-sm text-gray-500">Allow new users to register accounts</p>
          </div>
          <button class="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600 transition-colors">
            <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
          </button>
        </div>
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-sm font-medium text-gray-900">Email Verification Required</h4>
            <p class="text-sm text-gray-500">Require email verification for new accounts</p>
          </div>
          <button class="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600 transition-colors">
            <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
          </button>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Default User Role</label>
          <select class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            <option>User</option>
            <option>Editor</option>
            <option>Author</option>
          </select>
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
