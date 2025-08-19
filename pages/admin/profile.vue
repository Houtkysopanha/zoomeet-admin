<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
      <p class="text-gray-600">Manage your personal information and account settings</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Profile Picture Section -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div class="text-center">
            <div class="mx-auto h-32 w-32 rounded-full bg-indigo-600 flex items-center justify-center mb-4">
              <span class="text-white text-4xl font-bold">A</span>
            </div>
            <h3 class="text-lg font-medium text-gray-900">{{ userName }}</h3>
            <p class="text-sm text-gray-500">Administrator</p>
            <div class="mt-4 space-y-2">
              <button class="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                Change Photo
              </button>
              <button class="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                Remove Photo
              </button>
            </div>
          </div>
        </div>

        <!-- Account Stats -->
        <div class="bg-white rounded-lg shadow p-6 border border-gray-200 mt-6">
          <h4 class="text-lg font-medium text-gray-900 mb-4">Account Statistics</h4>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Member since</span>
              <span class="text-sm font-medium text-gray-900">Jan 2024</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Last login</span>
              <span class="text-sm font-medium text-gray-900">2 hours ago</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Total sessions</span>
              <span class="text-sm font-medium text-gray-900">1,247</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Account status</span>
              <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Form -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow border border-gray-200">
          <!-- Personal Information -->
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Personal Information</h3>
          </div>
          <div class="p-6">
            <form class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    v-model="profile.firstName"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    v-model="profile.lastName"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  v-model="profile.email"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  v-model="profile.phone"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  v-model="profile.bio"
                  rows="4"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Tell us about yourself..."
                ></textarea>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                  <select
                    v-model="profile.timezone"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    v-model="profile.language"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </div>
            </form>
          </div>

          <!-- Security Settings -->
          <div class="px-6 py-4 border-t border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Security Settings</h3>
          </div>
          <div class="p-6">
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter current password"
                />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <div class="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div class="flex items-center">
                  <Icon name="i-heroicons-shield-check" class="text-yellow-600 mr-3" />
                  <div>
                    <p class="text-sm font-medium text-yellow-800">Two-Factor Authentication</p>
                    <p class="text-xs text-yellow-600">Add an extra layer of security</p>
                  </div>
                </div>
                <button class="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm">
                  Enable 2FA
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
                @click="saveProfile"
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
const config = useRuntimeConfig() // add this at the top of script setup


definePageMeta({
  layout: "admin",
})

const toast = useToast()

const profile = ref({
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@example.com',
  phone: '+1 (555) 123-4567',
  bio: 'System administrator with expertise in web development and database management.',
  timezone: 'UTC',
  language: 'en'
})

function saveProfile() {
  toast.add({
    severity: "success",
    summary: "Profile Updated",
    detail: "Your profile has been updated successfully.",
    life: 3000,
  })
}

async function fetchUserInfo() {
  try {
    const auth = JSON.parse(localStorage.getItem('auth'))
    const token = auth?.token
    if (!token) throw new Error('No token found in localStorage')

    const res = await fetch(`${config.public.apiBaseUrl}/info`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error('Failed to fetch user info')
    }

    const data = await res.json()
    userName.value = data.name || data.preferred_username || 'No Name'
    userRole.value = data.role || 'No Role'
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Unable to fetch user info',
      life: 3000,
    })
    userName.value = 'Unknown User'
  }
}
</script>
