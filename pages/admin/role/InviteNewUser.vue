<template>
  <div class="p-4 bg-gray-50 min-h-screen font-sans text-gray-700">
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <Breadcrumb
            :items="[
              { text: 'Event', to: '/admin/event' },
              { text: 'Manage Team', to: `/admin/role/ManageTeam?eventId=${eventId}` },
              { text: 'Invite New User' }
            ]"
            class="mb-2"
          />
        </div>
        <IconnButton 
          :disabled="inviting" 
          :label="inviting ? 'Sending...' : 'Send Invitation'" 
          icon="lets-icons:send-fill" 
          @click="inviteUser()" 
        />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-2xl p-10">
        <h2 class="text-xl font-semibold mb-2">Invite a team member</h2>
        <p class="text-sm text-gray-500 mb-6">Search by name or email or phone select a role and send an invitation.</p>
        
        <div class="space-y-6">
          <div>
            <label for="contact" class="block text-sm font-medium text-gray-700 mb-2">Phone Number or Email</label>
            <input
              type="text"
              id="contact"
              v-model="newUser.contact"
              placeholder="Enter phone number or email to search users..."
              class="w-full px-4 py-3 bg-gray-100 border-none rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 ease-in-out transform focus:scale-[1.02]"
              @input="handleSearch"
            />
            <p v-if="contactError" class="text-xs text-red-500 mt-2 animate-fade-in">Type at least 3 characters</p>
            
            <!-- Search loading indicator -->
            <div v-if="searching" class="flex items-center mt-2 text-purple-600">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
              <span class="text-sm">Searching organizers...</span>
            </div>
          </div>

          <div>
            <label for="note" class="block text-sm font-medium text-gray-700 mb-2">Optional Note</label>
            <textarea
              id="note"
              v-model="newUser.note"
              placeholder="Take note"
              rows="4"
              class="w-full px-4 py-3 bg-gray-100 border-none rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
            ></textarea>
          </div>
        </div>

        <!-- Search results counter -->
        <div class="border border-1 border-gray-200 my-3"></div>
        <div v-if="users.length > 0" class="mt-4 mb-2 animate-fade-in">
          <p class="text-sm text-gray-600">
            Found {{ users.length }} organizer{{ users.length !== 1 ? 's' : '' }}
          </p>
        </div>

        <!-- Selected users display -->
        <div v-if="selectedUsers.length > 0" class="mt-4 mb-4 p-4 bg-purple-50 rounded-xl border border-purple-200 animate-fade-in">
          <p class="text-sm font-medium text-purple-800 mb-2">
            Selected ({{ selectedUsers.length }}):
          </p>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="user in selectedUsers" 
              :key="user.id"
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-300 transform transition-all duration-200 hover:scale-105"
            >
              {{ user.name }}
              <button 
                @click.stop="selectUser(user)"
                class="ml-2 text-purple-600 hover:text-purple-800 transition-colors duration-200"
                title="Remove user"
              >
                ×
              </button>
            </span>
          </div>
        </div>

<ul v-if="users.length" class="mt-6 space-y-3">
  <li
    v-for="(u, index) in users"
    :key="u.id"
    @click="selectUser(u)"
    class="flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-300 border transform hover:scale-[1.02] animate-slide-in"
    :class="selectedUsers.some(su => su.id === u.id) ? 'border-purple-500 bg-purple-50 hover:bg-purple-100 shadow-lg' : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50 hover:shadow-md'"
    :title="selectedUsers.some(su => su.id === u.id) ? 'Click to unselect this organizer' : 'Click to select this organizer'"
    :style="{ animationDelay: `${index * 100}ms` }"
  >
    <div class="flex items-center space-x-3">
      <div class="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-600 font-semibold transition-all duration-300 hover:scale-110">
        {{ getInitials(u.name) }}
      </div>
      <div>
        <p class="font-medium text-gray-800 transition-colors duration-200">{{ u.name }}</p>
        <p class="text-sm text-gray-500 transition-colors duration-200">{{ u.email || u.phone_number }}</p>
      </div>
    </div>
    <div v-if="selectedUsers.some(su => su.id === u.id)" class="text-purple-600 transform transition-all duration-300 scale-110">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 animate-bounce-once" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 111.414-1.414L8.414 12.172l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
      </svg>
    </div>
  </li>
</ul>


        <!-- No users found states -->
        <div v-if="newUser.contact.length >= 3 && !searching && users.length === 0" class="flex flex-col items-center justify-center mt-12 mb-4 animate-fade-in">
          <img src="../../../assets/image/not-found.png" alt="Organizer not found" class="w-32 h-32 opacity-70 transition-all duration-300 hover:opacity-90" />
          <p class="text-sm text-gray-500 mt-4 font-medium">Organizer not found</p>
          <p class="text-xs text-gray-400 mt-1">Try different search terms</p>
        </div>

        <div v-else-if="!newUser.contact && !users.length && !searching" class="flex flex-col items-center justify-center mt-12 mb-4 animate-fade-in">
          <img src="../../../assets/image/not-found.png" alt="Search for organizers" class="w-32 h-32 opacity-70 transition-all duration-300 hover:opacity-90" />
          <p class="text-sm text-gray-400 mt-4">Start typing to search for organizers</p>
        </div>
      </div>

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
              <InputSwitch v-model="permissions[category].enabled"   class="toggle-purple"  />
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
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import InputSwitch from 'primevue/inputswitch';
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import IconnButton from '~/components/ui/IconnButton.vue'
import { fetchOrganizerPermissions, searchUsers, inviteUserAPI } from '@/composables/api'
const router = useRouter()
const route = useRoute()
const toast = useToast()
// Debounce timer
let searchTimeout = null

const selectedUsers = ref([])

// Handle selecting/unselecting a user
const selectUser = (user) => {
  const existingIndex = selectedUsers.value.findIndex(u => u.id === user.id)
  
  if (existingIndex !== -1) {
    // User is already selected, so unselect them
    selectedUsers.value.splice(existingIndex, 1)
    // If this was the user whose contact info is shown, clear it or show the last selected user's contact
    if (newUser.value.contact === (user.email || user.phone_number)) {
      if (selectedUsers.value.length > 0) {
        // Show contact of the last remaining selected user
        const lastUser = selectedUsers.value[selectedUsers.value.length - 1]
        newUser.value.contact = lastUser.email || lastUser.phone_number || ""
      } else {
        // No users selected, clear contact field
        newUser.value.contact = ""
      }
    }
  } else {
    // User is not selected, so select them
    selectedUsers.value.push(user)
    newUser.value.contact = user.email || user.phone_number || ""
  }
}

// Helper to get initials from name
const getInitials = (name) => {
  if (!name) return "?"
  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) // only 2 letters max
}

// Get event ID from route query
const eventId = ref(route.query.eventId)

// Redirect if no event ID provided
if (!eventId.value) {
  toast.add({
    severity: 'error',
    summary: 'Error',
    detail: 'No event selected. Please go back to Manage Team.',
    life: 5000
  })
  router.push('/admin/event')
}

const newUser = ref({ contact: '', note: '' });
const contactError = ref(false);
const users = ref([]);
const loading = ref(false);
const searching = ref(false);
const inviting = ref(false);
const permissionsLoading = ref(false);

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
          enabled: false,
          items: data.data[category] || []
        }
      })
      
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

// Load permissions on component mount
onMounted(() => {
  loadPermissions()
})

const validateContact = () => {
  contactError.value = newUser.value.contact.length > 0 && newUser.value.contact.length < 3;
};

const inviteUser = async () => {
  // Prevent multiple submissions
  if (inviting.value) return

  // Validation: Check if users are selected
  if (selectedUsers.value.length === 0) {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Please select at least one user',
      life: 4000
    })
    return
  }

  // Validation: Check if permissions are selected
  const hasPermissions = Object.values(permissions.value).some(perm => perm.enabled)
  if (!hasPermissions) {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Please select at least one permission for the user',
      life: 4000
    })
    return
  }

  inviting.value = true
  try {
    const token = localStorage.getItem('token')
   const data = await inviteUserAPI({
  eventId: eventId.value,
  selectedUsers: selectedUsers.value.map(u => ({
    ...u,
    note: newUser.value.note || null
  })),
  permissions: permissions.value,
  token
})


    if (data.success) {
      toast.add({
        severity: 'success',
        summary: 'Invitation Sent',
        detail: `Invitation sent to ${selectedUsers.value.map(u => u.name).join(', ')}`,
        life: 4000
      })
      // Reset selection
      selectedUsers.value = []
      newUser.value.contact = ''
      Object.keys(permissions.value).forEach(cat => permissions.value[cat].enabled = false)
    } else {
      toast.add({
        severity: 'error',
        summary: 'Failed to Invite',
        detail: data.message || 'Something went wrong',
        life: 4000
      })
    }
  } catch (error) {
    console.error('❌ Error inviting users:', error)
    toast.add({
      severity: 'error',
      summary: 'API Error',
      detail: error.response?.data?.message || error.message,
      life: 4000
    })
  } finally {
    inviting.value = false
  }
}

const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    validateContact()
    if (newUser.value.contact.length >= 3) {
      searching.value = true
      try {
        users.value = await searchUsers(newUser.value.contact)
      } catch (error) {
        console.error('Search error:', error)
        users.value = []
      } finally {
        searching.value = false
      }
    } else {
      users.value = []
      searching.value = false
    }
  }, 400)
}

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


  // Navigate back to Manage Team
//   router.push({
//   path: '/admin/role/ManageTeam',
//   query: { eventId: eventId.value }
// })
definePageMeta({
  layout: "admin",
})
</script>

<style scoped>
/* PrimeVue overrides to match the UI */
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

:deep(.toggle-purple.p-inputswitch.p-inputswitch-checked .p-inputswitch-slider) {
  background: #7a49c9; /* purple */
}

/* Custom animations for smooth UI */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes bounce-once {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-3px);
  }
  60% {
    transform: translateY(-1px);
  }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out forwards;
  opacity: 0;
}

.animate-bounce-once {
  animation: bounce-once 0.6s ease-in-out;
}

/* Smooth hover effects */
.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Focus states */
input:focus, textarea:focus {
  box-shadow: 0 0 0 3px rgba(124, 73, 201, 0.1);
}

/* Loading spinner improvements */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>