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
            <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">{{ userInfo.services[0] }}</span>
            <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">{{ userInfo.services[1] }}</span>
          </div>
        </div>
        <div class="border border-1 border-gray-200 my-10"></div>

        <!-- User Details -->
        <div class="space-y-4 ">
          <div class="flex items-center space-x-3 border border-1 border-gray-300 rounded-2xl p-4">
            <div class="bg-purple-100 p-4 w-16 h-16 rounded-full">
              <Icon name="mdi:email" class="w-8 h-8 text-purple-600  " />
            </div>
            <div>
              <p class="text-sm text-gray-500">Email</p>
              <p class="text-gray-900">{{ userInfo.email }}</p>
            </div>
          </div>

         <div class="flex items-center space-x-3 border border-1 border-gray-300 rounded-2xl p-4">
            <div class="bg-purple-100 p-4 w-16 h-16 rounded-full">
              <Icon name="ic:baseline-phone" class="w-8 h-8 text-purple-600  " />
            </div>
            <div>
              <p class="text-sm text-gray-500">Phone Number</p>
              <p class="text-gray-900">{{ userInfo.email }}</p>
            </div>
          </div>

           <div class="flex items-center space-x-3 border border-1 border-gray-300 rounded-2xl p-4">
            <div class="bg-purple-100 p-4 w-16 h-16 rounded-full">
              <Icon name="uil:calender" class="w-8 h-8 text-purple-600  " />
            </div>
            <div>
              <p class="text-sm text-gray-500">Invite Date</p>
              <p class="text-gray-900">{{ userInfo.email }}</p>
            </div>
          </div>

 <div class="flex items-center space-x-3 border border-1 border-gray-300 rounded-2xl p-4">
            <div class="bg-purple-100 p-4 w-16 h-16 rounded-full">
              <Icon name="uil:calender" class="w-8 h-8 text-purple-600  " />
            </div>
            <div>
              <p class="text-sm text-gray-500">Update Date</p>
              <p class="text-gray-900">{{ userInfo.email }}</p>
            </div>
          </div>


        </div>
      </div>

      <!-- Right Column - Role Assignment -->
       <div class="bg-white rounded-2xl p-10">
        <h2 class="text-xl font-semibold mb-2">Role Assignment</h2>
        <p class="text-sm text-gray-500 mb-6">Pick a permission for the team to access the team coordinator.</p>

        <!-- Loading state for permissions -->
        <div v-if="permissionsLoading" class="flex justify-center items-center py-8">
          <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          <span class="ml-2 text-gray-600">Loading permissions...</span>
        </div>

        <!-- Dynamic permission categories -->
        <div v-else class="space-y-4">
          <div 
            v-for="(categoryPermissions, category) in availablePermissions" 
            :key="category"
            class="bg-white shadow-xl p-4 rounded-2xl"
          >
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

          <!-- Empty state when no permissions loaded -->
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
import InputSwitch from 'primevue/inputswitch';
import { fetchOrganizerPermissions } from '@/composables/api'
import img1 from '@/assets/image/poster-manage-booking.png'

const router = useRouter()
const route = useRoute()
const toast = useToast()

// Get data from route query
const eventId = ref(route.query.eventId)
const userId = ref(route.query.userId)
const userName = ref(route.query.userName)

// Redirect if missing required data
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

// User information (this would typically come from API based on userId)
const userInfo = ref({
  name: userName.value || 'Kate Morrison',
  avatar: img1,
  email: 'katemorrison@gmail.com',
  phone: '012485674',
  inviteDate: '22-10-2024',
  updateDate: '22-10-2024',
  services: ['Check-in Service', 'Booking Service']
})

// Dynamic permissions structure from API
const availablePermissions = ref({})
const permissions = ref({})

// Load permissions from API
const loadPermissions = async () => {
  permissionsLoading.value = true
  try {
    const { status, data } = await fetchOrganizerPermissions()
    
    if (status === 200 && data.success && data.data) {
      availablePermissions.value = data.data
      
      // Initialize permissions structure based on API response
      permissions.value = {}
      Object.keys(data.data).forEach(category => {
        permissions.value[category] = {
          enabled: false, // TODO: Load user's current permissions from API
          items: data.data[category] || []
        }
      })
      
      // TODO: Load user's actual current permissions and set enabled states
      // For now, setting some default values for demo
      if (permissions.value.booking) {
        permissions.value.booking.enabled = true
      }
      if (permissions.value['check-in']) {
        permissions.value['check-in'].enabled = true
      }
      
      console.log('Loaded permissions:', availablePermissions.value)
    } else {
      console.error('API Error Response:', data)
      toast.add({
        severity: 'error',
        summary: 'API Error',
        detail: data.message || 'Failed to fetch permissions',
        life: 4000
      })
    }
  } catch (error) {
    console.error('❌ Error loading permissions:', error)
    toast.add({
      severity: 'error',
      summary: 'Fetch Error',
      detail: error.message || 'Failed to load permissions',
      life: 4000
    })
  } finally {
    permissionsLoading.value = false
  }
}

// Save permissions function
const savePermissions = () => {
  loading.value = true
  
  // TODO: Here you would typically send the permissions to an API
  console.log('Saving permissions for:', {
    eventId: eventId.value,
    userId: userId.value,
    permissions: permissions.value
  })
  
  // Simulate API call delay
  setTimeout(() => {
    loading.value = false
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Permissions updated successfully',
      life: 3000
    })
    
    // Navigate back to manage team page with eventId
    router.push({
      path: '/admin/role/ManageTeam',
      query: { eventId: eventId.value }
    })
  }, 1000)
}

// Load permissions when component mounts
onMounted(() => {
  loadPermissions()
  
  if (userId.value) {
    // TODO: Load actual user data and permissions from API
    console.log('Loading user data for ID:', userId.value, 'in event:', eventId.value)
  }
})

// Helper function to format permission names
const formatPermissionName = (permission) => {
  return permission.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

// Helper function to format category names
const formatCategoryName = (category) => {
  const categoryMap = {
    'event': 'Event Management',
    'booking': 'Booking',
    'check-in': 'Check-In',
    'report': 'Report'
  }
  return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1)
}

definePageMeta({
  layout: 'admin'
})
</script>

<style scoped>
/* Custom toggle switch styling */
:deep(.p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-slider) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

:deep(.p-toggleswitch .p-toggleswitch-slider) {
  background: #e5e7eb;
}

:deep(.p-toggleswitch .p-toggleswitch-slider:before) {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Custom card hover effects */
.border:hover {
  border-color: #8b5cf6;
  transition: border-color 0.2s ease;
}

/* Smooth transitions for toggles */
.p-toggleswitch {
  transition: all 0.2s ease;
}
</style>
