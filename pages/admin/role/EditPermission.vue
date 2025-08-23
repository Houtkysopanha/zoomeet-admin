<template>
  <div class="p-4 bg-[#F8F8FF] min-h-screen">
    <!-- Header with breadcrumb and save button -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <Breadcrumb
            :items="[
              { text: 'Event', to: '/admin/event' },
              { text: 'Manage Team', to: `/admin/role/ManageTeam?eventId=${eventId}` },
              { text: 'Edit Permission' }
            ]"
            class="mb-2"
          />
        </div>
        <IconnButton 
          label="Save Edit" 
          icon="mdi:content-save" 
          @click="savePermissions"
          :loading="loading"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Left Column - User Info -->
      <div class="bg-white rounded-2xl p-10 shadow-sm">
        <!-- User Profile -->
        <div class="flex flex-col items-center mb-6">
          <div class="relative mb-4">
            <img 
              :src="userInfo.avatar" 
              :alt="userInfo.name"
              class="w-24 h-24 rounded-full object-cover"
            />
            <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <h2 class="text-xl font-semibold text-gray-900 my-4">{{ userInfo.name }}</h2>
          <div class="flex space-x-4 text-sm">
            <span 
              v-for="(service, idx) in userInfo.services" 
              :key="idx"
              class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
            >
              {{ service }}
            </span>
          </div>
        </div>
        <div class="border border-1 border-gray-200 my-10"></div>

        <!-- User Details -->
        <div class="space-y-4">
          <div class="flex items-center space-x-3 border border-1 border-gray-300 rounded-2xl p-4">
            <div class="bg-purple-100 p-4 w-16 h-16 rounded-full">
              <Icon name="mdi:email" class="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <p class="text-sm text-gray-500">Email</p>
              <p class="text-gray-900">{{ userInfo.email }}</p>
            </div>
          </div>

          <div class="flex items-center space-x-3 border border-1 border-gray-300 rounded-2xl p-4">
            <div class="bg-purple-100 p-4 w-16 h-16 rounded-full">
              <Icon name="ic:baseline-phone" class="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <p class="text-sm text-gray-500">Phone Number</p>
              <p class="text-gray-900">{{ userInfo.phone }}</p>
            </div>
          </div>

          <div class="flex items-center space-x-3 border border-1 border-gray-300 rounded-2xl p-4">
            <div class="bg-purple-100 p-4 w-16 h-16 rounded-full">
              <Icon name="uil:calender" class="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <p class="text-sm text-gray-500">Invite Date</p>
              <p class="text-gray-900">{{ formatDate(userInfo.inviteDate) }}</p>
            </div>
          </div>

          <div class="flex items-center space-x-3 border border-1 border-gray-300 rounded-2xl p-4">
            <div class="bg-purple-100 p-4 w-16 h-16 rounded-full">
              <Icon name="uil:calender" class="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <p class="text-sm text-gray-500">Update Date</p>
            <p class="text-gray-900">{{ formatDate(userInfo.updateDate) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column - Role Assignment -->
      <div class="bg-white rounded-2xl p-10">
        <h2 class="text-xl font-semibold mb-2">Role Assignment</h2>
        <p class="text-sm text-gray-500 mb-6">Pick a permission for the team to access the team coordinator.</p>

        <div v-if="permissionsLoading" class="flex justify-center items-center py-8">
          <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          <span class="ml-2 text-gray-600">Loading permissions...</span>
        </div>

        <div v-else class="space-y-4">
         <template v-if="Object.keys(permissions).length">
  <div 
    v-for="(categoryPermissions, category) in availablePermissions" 
    :key="category"
  >
    <div class="bg-white shadow-xl p-4 rounded-2xl">
      <div class="flex items-center justify-between">
        <span class="text-sm font-semibold text-gray-800">{{ formatCategoryName(category) }}</span>
        <InputSwitch v-model="permissions[category].enabled" />
      </div>
      <div class="border border-1 border-gray-200 my-5"></div>
      <p class="text-sm font-semibold text-gray-800">Permissions</p>
      <div class="flex flex-wrap gap-2 mt-3 ml-1">
        <span 
          v-for="permission in categoryPermissions" 
          :key="permission"
          class="text-xs font-medium text-blue-900 bg-gray-100 px-3 py-1 rounded-full"
        >
          {{ formatPermissionName(permission) }}
        </span>
      </div>
    </div>
  </div>
</template>


          <div v-if="Object.keys(availablePermissions).length === 0" class="text-center py-8">
            <p class="text-gray-500">No permissions available</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import IconnButton from '~/components/ui/IconnButton.vue'
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import InputSwitch from 'primevue/inputswitch'
import { fetchOrganizerPermissions } from '@/composables/api'
import { fetchUserRoles } from '@/composables/api'
import img1 from '@/assets/image/poster-manage-booking.png'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const eventId = ref(route.query.eventId)
const userId = ref(route.query.userId)
const userName = ref(route.query.userName)

if (!eventId.value || !userId.value) {
  toast.add({
    severity: 'error',
    summary: 'Error',
    detail: 'Missing required information. Please go back to Manage Team.',
    life: 5000
  })
  router.push('/admin/event')
}

const loading = ref(false)
const permissionsLoading = ref(false)

const userInfo = ref({
  name: userName.value || '',
  avatar: img1,
  email: '',
  phone: '',
  inviteDate: '',
  updateDate: '',
  services: []
})

const availablePermissions = ref({})
const permissions = ref({})

const loadPermissions = async () => {
  permissionsLoading.value = true
  try {
    const { status, data } = await fetchOrganizerPermissions()
    if (status === 200 && data.success && data.data) {
      availablePermissions.value = data.data

      // Initialize permission structure
      permissions.value = {}
     Object.keys(availablePermissions.value).forEach(category => {
  permissions.value[category] = { enabled: false, items: availablePermissions.value[category] || [] }
})

    } else {
      throw new Error(data.message || 'Failed to fetch permissions')
    }
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 4000 })
  } finally {
    permissionsLoading.value = false
  }
}

const loadUserData = async () => {
  const token = localStorage.getItem('token')
  try {
    const userData = await fetchUserRoles({ eventId: eventId.value, userId: userId.value, token })

    userInfo.value = {
      name: userData.name,
      avatar: img1,
      email: userData.email,
      phone: userData.phone_number,
      inviteDate: userData.created_at,
      updateDate: userData.updated_at,
      services: userData.roles.map(formatCategoryName)
    }

    // Enable permissions based on user roles
    Object.keys(permissions.value).forEach(category => {
      permissions.value[category].enabled = userData.roles.includes(category)
    })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 4000 })
  }
}

const savePermissions = async () => {
  loading.value = true
  const token = localStorage.getItem('token')

  const enabledRoles = Object.entries(permissions.value)
    .filter(([_, perm]) => perm.enabled)
    .map(([category, perm]) => ({ role_name: category, permissions: perm.items }))

  try {
    const response = await axios.put(
      `${useRuntimeConfig().public.apiAdminBaseUrl}/events/${eventId.value}/organizer/${userId.value}/update`,
      { roles: enabledRoles },
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (response.status === 200 && response.data.success) {
      toast.add({ severity: 'success', summary: 'Success', detail: 'Permissions updated successfully', life: 3000 })
      router.push({ path: '/admin/role/ManageTeam', query: { eventId: eventId.value } })
    } else {
      throw new Error(response.data.message || 'Failed to update permissions')
    }
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || error.message, life: 4000 })
  } finally {
    loading.value = false
  }
}

const formatPermissionName = (permission) =>
  permission.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

const formatCategoryName = (category) => {
  const map = { event: 'Event Management', booking: 'Booking', 'check-in': 'Check-In', report: 'Report' }
  return map[category] || category.charAt(0).toUpperCase() + category.slice(1)
}

const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('en-GB') : '-'

onMounted(async () => {
  await loadPermissions()
  await loadUserData()
})
definePageMeta({ layout: 'admin' })
</script>

<style scoped>
:deep(.p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-slider) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
:deep(.p-toggleswitch .p-toggleswitch-slider) { background: #e5e7eb; }
:deep(.p-toggleswitch .p-toggleswitch-slider:before) {
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.border:hover { border-color: #8b5cf6; transition: border-color 0.2s ease; }
.p-toggleswitch { transition: all 0.2s ease; }
</style>
