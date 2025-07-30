<template>
  <div class="p-6">
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Roles & Permissions</h1>
          <p class="text-gray-600">Manage user roles and access permissions</p>
        </div>
        <button class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2">
          <Icon name="i-heroicons-plus" />
          <span>Add Role</span>
        </button>
      </div>
    </div>

    <!-- Roles Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="role in roles" :key="role.id" class="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3" :class="role.color">
              <Icon :name="role.icon" class="text-white text-lg" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ role.name }}</h3>
              <p class="text-sm text-gray-500">{{ role.userCount }} users</p>
            </div>
          </div>
          <div class="flex space-x-2">
            <button class="text-indigo-600 hover:text-indigo-900">
              <Icon name="i-heroicons-pencil" class="w-4 h-4" />
            </button>
            <button class="text-red-600 hover:text-red-900">
              <Icon name="i-heroicons-trash" class="w-4 h-4" />
            </button>
          </div>
        </div>
        <p class="text-gray-600 mb-4">{{ role.description }}</p>
        <div class="space-y-2">
          <h4 class="text-sm font-medium text-gray-900">Permissions:</h4>
          <div class="flex flex-wrap gap-1">
            <span v-for="permission in role.permissions" :key="permission" class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
              {{ permission }}
            </span>
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

const roles = ref([
  {
    id: 1,
    name: 'Administrator',
    description: 'Full system access with all permissions',
    userCount: 2,
    icon: 'i-heroicons-shield-check',
    color: 'bg-red-500',
    permissions: ['Create', 'Read', 'Update', 'Delete', 'Manage Users', 'System Settings']
  },
  {
    id: 2,
    name: 'Editor',
    description: 'Can create and edit content',
    userCount: 8,
    icon: 'i-heroicons-pencil',
    color: 'bg-blue-500',
    permissions: ['Create', 'Read', 'Update', 'Manage Content']
  },
  {
    id: 3,
    name: 'Author',
    description: 'Can create and manage own content',
    userCount: 15,
    icon: 'i-heroicons-user-circle',
    color: 'bg-green-500',
    permissions: ['Create', 'Read', 'Update Own']
  },
  {
    id: 4,
    name: 'Viewer',
    description: 'Read-only access to content',
    userCount: 45,
    icon: 'i-heroicons-eye',
    color: 'bg-gray-500',
    permissions: ['Read']
  }
])
</script>
