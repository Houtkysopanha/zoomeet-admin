<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
      <p class="text-gray-600">Manage your application settings and preferences</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Settings Navigation -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow p-4">
          <nav class="space-y-2">
            <button
              v-for="tab in settingsTabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              class="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors"
              :class="activeTab === tab.id ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'"
            >
              <Icon :name="tab.icon" class="text-lg" />
              <span class="font-medium">{{ tab.name }}</span>
            </button>
          </nav>
        </div>
      </div>

      <!-- Settings Content -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow">
          <!-- General Settings -->
          <div v-if="activeTab === 'general'" class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Application Name</label>
                <input
                  type="text"
                  v-model="settings.appName"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  v-model="settings.description"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                <select
                  v-model="settings.timezone"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Security Settings -->
          <div v-if="activeTab === 'security'" class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                  <p class="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
                <button
                  @click="settings.twoFactor = !settings.twoFactor"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                  :class="settings.twoFactor ? 'bg-indigo-600' : 'bg-gray-200'"
                >
                  <span
                    class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    :class="settings.twoFactor ? 'translate-x-6' : 'translate-x-1'"
                  ></span>
                </button>
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-sm font-medium text-gray-900">Login Notifications</h4>
                  <p class="text-sm text-gray-500">Get notified when someone logs into your account</p>
                </div>
                <button
                  @click="settings.loginNotifications = !settings.loginNotifications"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                  :class="settings.loginNotifications ? 'bg-indigo-600' : 'bg-gray-200'"
                >
                  <span
                    class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    :class="settings.loginNotifications ? 'translate-x-6' : 'translate-x-1'"
                  ></span>
                </button>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                <input
                  type="number"
                  v-model="settings.sessionTimeout"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <!-- Notifications Settings -->
          <div v-if="activeTab === 'notifications'" class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-sm font-medium text-gray-900">Email Notifications</h4>
                  <p class="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <button
                  @click="settings.emailNotifications = !settings.emailNotifications"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                  :class="settings.emailNotifications ? 'bg-indigo-600' : 'bg-gray-200'"
                >
                  <span
                    class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    :class="settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'"
                  ></span>
                </button>
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-sm font-medium text-gray-900">Push Notifications</h4>
                  <p class="text-sm text-gray-500">Receive push notifications in your browser</p>
                </div>
                <button
                  @click="settings.pushNotifications = !settings.pushNotifications"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                  :class="settings.pushNotifications ? 'bg-indigo-600' : 'bg-gray-200'"
                >
                  <span
                    class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    :class="settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'"
                  ></span>
                </button>
              </div>
            </div>
          </div>

          <!-- Save Button -->
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <div class="flex justify-end space-x-3">
              <button class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button
                @click="saveSettings"
                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'

definePageMeta({
  middleware: "auth",
  layout: "admin",
})

const toast = useToast()

const activeTab = ref('general')

const settingsTabs = [
  { id: 'general', name: 'General', icon: 'i-heroicons-cog-6-tooth' },
  { id: 'security', name: 'Security', icon: 'i-heroicons-shield-check' },
  { id: 'notifications', name: 'Notifications', icon: 'i-heroicons-bell' }
]

const settings = ref({
  appName: 'Admin Panel',
  description: 'A comprehensive admin dashboard for managing your application',
  timezone: 'UTC',
  twoFactor: false,
  loginNotifications: true,
  sessionTimeout: 30,
  emailNotifications: true,
  pushNotifications: false
})

function saveSettings() {
  // Simulate saving settings
  toast.add({
    severity: "success",
    summary: "Settings Saved",
    detail: "Your settings have been updated successfully.",
    life: 3000,
  })
}
</script>
