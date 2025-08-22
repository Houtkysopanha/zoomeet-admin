<template>
  <div class="p-4 bg-[#F8F8FF] min-h-screen">
    <!-- Header with breadcrumb and save button -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <Breadcrumb
            :items="[
              { text: 'Event', to: '/admin/event' },
              { text: 'Manage Team', to: '/admin/role/ManageTeam' },
              { text: 'Edit Permission' }
            ]"
            class="mb-2"
          />
        </div>
        <IconnButton 
          label="Save Edit" 
          icon="mdi:content-save" 
          @click="savePermissions"
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

        <div class="space-y-4">
          <div class="bg-white shadow-xl p-4 rounded-2xl ">
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-gray-800">Event Management</span>
              <InputSwitch v-model="permissions.eventManagement.enabled" />
            </div>
            <div class="border border-1 border-gray-200 my-5"></div>
             <p class="text-sm font-semibold text-gray-800">Permission</p>
            <div  class="flex flex-wrap gap-2 mt-3 ml-1">
              <span class="text-xs font-medium text-blue-900 bg-gray-100 px-3 py-1 rounded-full">Manage Event</span>
              <span class="text-xs font-medium text-blue-900 bg-gray-100 px-3 py-1 rounded-full">Manage Ticket</span>
              <span class="text-xs font-medium text-blue-900 bg-gray-100 px-3 py-1 rounded-full">Refund</span>
            </div>
          </div>

         <div class="bg-white shadow-xl p-4 rounded-2xl ">
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-gray-800">Booking</span>
              <InputSwitch v-model="permissions.booking.enabled" />
            </div>
            <div class="border border-1 border-gray-200 my-5"></div>
             <p class="text-sm font-semibold text-gray-800">Permission</p>
            <div  class="flex flex-wrap gap-2 mt-3 ml-1">
              <span class="text-xs font-medium text-blue-900 bg-gray-100 px-3 py-1 rounded-full">Staff Support Booking</span>
              <span class="text-xs font-medium text-blue-900 bg-gray-100 px-3 py-1 rounded-full">Cash Payment</span>
            
            </div>
          </div>

        <div class="bg-white shadow-xl p-4 rounded-2xl ">
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-gray-800">Check-In</span>
              <InputSwitch v-model="permissions.checkIn.enabled" />
            </div>
            <div class="border border-1 border-gray-200 my-5"></div>
             <p class="text-sm font-semibold text-gray-800">Permission</p>
            <div  class="flex flex-wrap gap-2 mt-3 ml-1">
              <span class="text-xs font-medium text-blue-900 bg-gray-100 px-3 py-1 rounded-full">Check-In Service</span>
            </div>
          </div>

          <div class="bg-white shadow-xl p-4 rounded-2xl ">
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-gray-800">Report</span>
              <InputSwitch v-model="permissions.report.enabled" />
            </div>
            <div class="border border-1 border-gray-200 my-5"></div>
             <p class="text-sm font-semibold text-gray-800">Permission</p>
            <div  class="flex flex-wrap gap-2 mt-3 ml-1">
              <span class="text-xs font-medium text-blue-900 bg-gray-100 px-3 py-1 rounded-full">Financial Report</span>
              <span class="text-xs font-medium text-blue-900 bg-gray-100 px-3 py-1 rounded-full">Business Insight</span>
              <span class="text-xs font-medium text-blue-900 bg-gray-100 px-3 py-1 rounded-full">Audit Log</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import IconnButton from '~/components/ui/IconnButton.vue'
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import InputSwitch from 'primevue/inputswitch';
const router = useRouter()
const toast = useToast()
import img1 from '@/assets/image/poster-manage-booking.png'

// User information (this would typically come from route params or API)
const userInfo = ref({
  name: 'Kate Morrison',
  avatar: img1,
  email: 'katemorrison@gmail.com',
  phone: '012485674',
  inviteDate: '22-10-2024',
  updateDate: '22-10-2024',
  services: ['Check-in Service', 'Booking Service']
})

// Permissions state
const permissions = ref({
  eventManagement: {
    enabled: false,
    items: ['Manage Event', 'Manage Ticket', 'Refund']
  },
  booking: {
    enabled: true,
    items: ['Staff Support Booking', 'Cash Payment']
  },
  checkIn: {
    enabled: true,
    items: ['Check-In Service']
  },
  report: {
    enabled: false,
    items: ['Financial Report', 'Business Insight', 'Audit Log']
  }
})

// Save permissions function
const savePermissions = () => {
  // Here you would typically send the permissions to an API
  console.log('Saving permissions:', permissions.value)
  
  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Permissions updated successfully',
    life: 3000
  })
  
  // Navigate back to manage team page
  router.push('/admin/role/ManageTeam')
}

// Get user data from route query or params if available
onMounted(() => {
  const route = useRoute()
  if (route.query.userId) {
    // Load user data based on userId
    // This is where you'd fetch actual user data from API
    console.log('Loading user data for ID:', route.query.userId)
  }
})

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
