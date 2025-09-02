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
            <!-- Tab Navigation (similar to login page) -->
            <div class="mb-6 grid grid-cols-2 py-2">
              <button
                @click="currentSearchTab = 'email'" 
                :class="[
                  'py-2 px-1 mr-6 font-semibold transition-colors duration-200 self-stretch text-center justify-start text-lg leading-loose',
                  currentSearchTab === 'email' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'
                ]"
                role="tab"
                :aria-selected="currentSearchTab === 'email'"
              >
                Email
              </button>
              <button
                @click="currentSearchTab = 'phone'"
                :class="[
                  'py-2 px-1 mr-6 font-semibold transition-colors duration-200 self-stretch text-center justify-start text-lg leading-loose',
                  currentSearchTab === 'phone' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'
                ]"
                role="tab"
                :aria-selected="currentSearchTab === 'phone'"
              >
                Phone Number
              </button>
            </div>

            <!-- Email Search Tab -->
            <div v-if="currentSearchTab === 'email'">
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                id="email"
                v-model="searchEmail"
                type="email"
                placeholder="Enter email address to search organizers..."
                class="w-full px-4 py-3 bg-gray-100 border-none rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 ease-in-out transform focus:scale-[1.02]"
                @input="handleEmailSearch"
              />
            </div>

            <!-- Phone Number Search Tab -->
            <div v-if="currentSearchTab === 'phone'">
              <PhoneNumber 
                v-model="searchPhone"
                @input="handlePhoneSearch"
                @change="handlePhoneNumberChange"
                placeholder="Enter phone number to search organizers..."
                class="focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <p v-if="contactError" class="text-xs text-red-500 mt-2 animate-fade-in">Type at least 3 characters</p>
            
            <!-- Search loading indicator -->
            <div v-if="searching" class="flex items-center mt-2 text-purple-600">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
              <span class="text-sm">Searching organizers...</span>
            </div>

            <!-- Protection loading indicator -->
            <div v-if="loadingOrganizers" class="flex items-center mt-2 text-blue-600">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span class="text-sm">Loading protection data...</span>
            </div>

            <!-- Protection status indicator -->
            <div v-if="organizersLoaded && !loadingOrganizers" class="flex items-center mt-2 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span class="text-sm">Member Team : {{ getTotalTeamMembersCount() }} </span>
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
        <div v-if="getFilteredUsers().length > 0 || getAlreadyInvitedUsers().length > 0" class="mt-4 mb-2 animate-fade-in">
          <p class="text-sm text-gray-600">
            <span v-if="getFilteredUsers().length > 0">
              Found {{ getFilteredUsers().length }} available organizer{{ getFilteredUsers().length !== 1 ? 's' : '' }}
            </span>
            <span v-if="getAlreadyInvitedUsers().length > 0" class="text-orange-600 ml-2">
              ({{ getAlreadyInvitedUsers().length }} already invited)
            </span>
          </p>
        </div>

        <!-- Already invited users notice (if any) -->
        <div v-if="getAlreadyInvitedUsers().length > 0" class="mt-4 mb-4 p-4 bg-orange-50 rounded-xl border border-orange-200 animate-fade-in">
          <div class="flex items-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            <p class="text-sm font-medium text-orange-800">
              Already Team Members ({{ getAlreadyInvitedUsers().length }}):
            </p>
          </div>
          <div class="space-y-2">
            <div 
              v-for="user in getAlreadyInvitedUsers()" 
              :key="user.id"
              class="flex items-center justify-between p-3 rounded-lg border"
              :class="getUserStatusClass(user)"
            >
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 flex items-center justify-center rounded-full font-semibold text-sm"
                     :class="getUserAvatarClass(user)">
                  {{ getInitials(user.name) }}
                </div>
                <div>
                  <div class="flex items-center space-x-2">
                    <p class="text-sm font-medium" :class="getUserNameClass(user)">{{ user.name }}</p>
                    <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="getUserStatusBadgeClass(user)">
                      {{ getUserStatus(user) }}
                    </span>
                  </div>
                  <p class="text-xs" :class="getUserContactClass(user)">{{ user.email || user.phone_number }}</p>
                  <!-- Show existing roles if available -->
                  <div v-if="getExistingUserRoles(user).length > 0" class="flex flex-wrap gap-1 mt-1">
                    <span 
                      v-for="role in getExistingUserRoles(user)" 
                      :key="role"
                      class="text-xs px-2 py-0.5 rounded-full" 
                      :class="getUserRoleBadgeClass(user)"
                    >
                      {{ formatCategoryName(role) }}
                    </span>
                  </div>
                </div>
              </div>
              <div :class="getUserIconClass(user)" title="Already has permissions">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>
          <p class="text-xs mt-3 font-medium" :class="getWarningTextClass()">
            ⚠️ These users already have permissions for this event and cannot be invited again.
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

<ul v-if="getFilteredUsers().length" class="mt-6 space-y-3">
  <li
    v-for="(u, index) in getFilteredUsers()"
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
        <div v-if="getCurrentSearchValue().length >= 3 && !searching && getFilteredUsers().length === 0 && getAlreadyInvitedUsers().length === 0" class="flex flex-col items-center justify-center mt-12 mb-4 animate-fade-in">
          <img src="../../../assets/image/not-found.png" alt="Organizer not found" class="w-32 h-32 opacity-70 transition-all duration-300 hover:opacity-90" />
          <p class="text-sm text-gray-500 mt-4 font-medium">Organizer not found</p>
          <p class="text-xs text-gray-400 mt-1">Try different search terms</p>
        </div>

        <div v-else-if="getCurrentSearchValue().length >= 3 && !searching && getFilteredUsers().length === 0 && getAlreadyInvitedUsers().length > 0" class="flex flex-col items-center justify-center mt-12 mb-4 animate-fade-in">
          <img src="../../../assets/image/not-found.png" alt="No new organizers to invite" class="w-32 h-32 opacity-70 transition-all duration-300 hover:opacity-90" />
          <p class="text-sm text-gray-500 mt-4 font-medium">No new organizers to invite</p>
          <p class="text-xs text-gray-400 mt-1">All found users are already part of the team</p>
        </div>

        <div v-else-if="!getCurrentSearchValue() && !users.length && !searching" class="flex flex-col items-center justify-center mt-12 mb-4 animate-fade-in">
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
import { fetchOrganizerPermissions, searchUsers, inviteUserAPI, fetchEventOrganizers } from '@/composables/api'
const router = useRouter()
const route = useRoute()
const toast = useToast()
// Debounce timer
let searchTimeout = null

const selectedUsers = ref([])

// Handle selecting/unselecting a user
const selectUser = (user) => {
  // PROTECTION: Check if user is already invited with enhanced messaging (includes inactive users)
  if (isUserAlreadyInvited(user)) {
    // Find the matching organizer to show more details
    const existingOrganizer = currentOrganizers.value.find(organizer => {
      return (organizer.user_id && user.id && organizer.user_id === user.id) ||
             (organizer.id && user.id && organizer.id === user.id) ||
             (organizer.email && user.email && organizer.email.toLowerCase() === user.email.toLowerCase()) ||
             (organizer.phone_number && user.phone_number && 
              organizer.phone_number.replace(/\s+/g, '') === user.phone_number.replace(/\s+/g, ''))
    })
    
    let detailMessage = `${user.name} is already part of the team for this event`
    
    // Show status (active/inactive)
    if (existingOrganizer) {
      const isActive = existingOrganizer.status === 'active' || existingOrganizer.is_active === true || existingOrganizer.is_active === 1
      const statusText = isActive ? 'active' : 'inactive'
      detailMessage += ` (${statusText})`
      
      if (existingOrganizer.roles && existingOrganizer.roles.length > 0) {
        const roleNames = existingOrganizer.roles.map(role => role.role_name || role.name).join(', ')
        detailMessage += ` with roles: ${roleNames}`
      }
      
      if (!isActive) {
        detailMessage += '. Inactive users cannot be re-invited.'
      }
    }
    
    toast.add({
      severity: 'warn',
      summary: 'User Already Has Permissions',
      detail: detailMessage,
      life: 6000
    })
    return
  }
  
  const existingIndex = selectedUsers.value.findIndex(u => u.id === user.id)
  
  if (existingIndex !== -1) {
    // User is already selected, so unselect them
    selectedUsers.value.splice(existingIndex, 1)
    
    // Update the tab fields based on the remaining selected users
    if (selectedUsers.value.length > 0) {
      // Show contact of the last remaining selected user
      const lastUser = selectedUsers.value[selectedUsers.value.length - 1]
      const contact = lastUser.email || lastUser.phone_number || ""
      newUser.value.contact = contact
      
      // Update the appropriate tab field
      if (lastUser.email) {
        currentSearchTab.value = 'email'
        searchEmail.value = lastUser.email
        searchPhone.value = ''
      } else if (lastUser.phone_number) {
        currentSearchTab.value = 'phone'
        searchPhone.value = lastUser.phone_number
        searchEmail.value = ''
      }
    } else {
      // No users selected, clear all fields
      newUser.value.contact = ""
      searchEmail.value = ""
      searchPhone.value = ""
    }
  } else {
    // User is not selected, so select them
    selectedUsers.value.push(user)
    const contact = user.email || user.phone_number || ""
    newUser.value.contact = contact
    
    // Update the appropriate tab field and switch to the correct tab
    if (user.email) {
      currentSearchTab.value = 'email'
      searchEmail.value = user.email
      searchPhone.value = ''
    } else if (user.phone_number) {
      currentSearchTab.value = 'phone'
      searchPhone.value = user.phone_number
      searchEmail.value = ''
    }
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

// Search form state (tabbed interface like login page)
const currentSearchTab = ref('email'); // 'email' or 'phone'
const searchEmail = ref('');
const searchPhone = ref('');

const newUser = ref({ contact: '', note: '' });
const contactError = ref(false);
const users = ref([]);
const loading = ref(false);
const searching = ref(false);
const inviting = ref(false);
const permissionsLoading = ref(false);

// Protection against duplicate invitations
const currentOrganizers = ref([]);
const loadingOrganizers = ref(false);
const organizersLoaded = ref(false);

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

// Load current event organizers for protection against duplicate invitations
const loadCurrentOrganizers = async () => {
  if (!eventId.value) return
  
  loadingOrganizers.value = true
  try {
    console.log('🔒 Loading ALL team members (active + inactive) for comprehensive protection...')
    const response = await fetchEventOrganizers(eventId.value)
    
    if (response.status === 200 && response.data.success) {
      currentOrganizers.value = response.data.data || []
      organizersLoaded.value = true
      
      const activeCount = getActiveTeamMembersCount()
      const totalCount = getTotalTeamMembersCount()
      const inactiveCount = totalCount - activeCount
      
      console.log('🔒 Protection loaded:')
      console.log(`   - ${activeCount} active team members`)
      console.log(`   - ${inactiveCount} inactive team members`)
      console.log(`   - ${totalCount} total members protected`)
      
      // Log all team members with their status for debugging
      currentOrganizers.value.forEach(org => {
        const status = org.status || (org.is_active ? 'active' : 'inactive') || 'unknown'
        const roles = org.roles?.map(r => r.role_name).join(', ') || 'No roles'
        console.log(`👤 ${org.name || org.email} (${status}): ${roles}`)
      })
    } else {
      console.warn('No team members found or error:', response.data.message)
      currentOrganizers.value = []
      organizersLoaded.value = true
    }
  } catch (error) {
    console.error('❌ Failed to load current team members:', error)
    // Don't show error to user since this is background protection
    currentOrganizers.value = []
    organizersLoaded.value = true
  } finally {
    loadingOrganizers.value = false
  }
}

// Check if a user is already invited/part of the team
const isUserAlreadyInvited = (user) => {
  if (!organizersLoaded.value || !currentOrganizers.value.length) return false
  
  return currentOrganizers.value.some(organizer => {
    // IMPORTANT: Check ALL team members regardless of active/inactive status
    // This prevents re-inviting inactive users who might cause conflicts
    
    // Primary check: user ID match
    if (organizer.user_id && user.id) {
      return organizer.user_id === user.id
    }
    
    // Secondary check: direct ID match (if organizer has id field)
    if (organizer.id && user.id) {
      return organizer.id === user.id
    }
    
    // Tertiary check: email match (case insensitive)
    if (organizer.email && user.email) {
      return organizer.email.toLowerCase().trim() === user.email.toLowerCase().trim()
    }
    
    // Quaternary check: phone number match (enhanced with multiple format checking)
    if (organizer.phone_number && user.phone_number) {
      // Get all possible formats for both numbers
      const organizerFormats = getPhoneSearchFormats(organizer.phone_number)
      const userFormats = getPhoneSearchFormats(user.phone_number)
      
      // Check if any format matches
      const hasMatch = organizerFormats.some(orgFormat => 
        userFormats.some(userFormat => {
          // Clean both for comparison (digits only)
          const cleanOrg = orgFormat.replace(/[^\d]/g, '')
          const cleanUser = userFormat.replace(/[^\d]/g, '')
          
          // Match if same digits, or if one is a suffix of the other (handling country codes)
          return cleanOrg === cleanUser || 
                 (cleanOrg.length > cleanUser.length && cleanOrg.endsWith(cleanUser)) ||
                 (cleanUser.length > cleanOrg.length && cleanUser.endsWith(cleanOrg))
        })
      )
      
      if (hasMatch) return true
    }
    
    // Final fallback: name + contact combination (stricter check)
    if (organizer.name && user.name) {
      const nameMatch = organizer.name.toLowerCase().trim() === user.name.toLowerCase().trim()
      if (nameMatch) {
        // If names match, also check if any contact info matches
        const organizerContact = organizer.email || organizer.phone_number || ''
        const userContact = user.email || user.phone_number || ''
        return organizerContact && userContact && 
               organizerContact.toLowerCase().trim() === userContact.toLowerCase().trim()
      }
    }
    
    return false
  })
}

// Get count of active team members
const getActiveTeamMembersCount = () => {
  if (!organizersLoaded.value) return 0
  return currentOrganizers.value.filter(org => 
    org.status === 'active' || org.is_active === true || org.is_active === 1 || !org.hasOwnProperty('status')
  ).length
}

// Get total count of all team members (active + inactive)
const getTotalTeamMembersCount = () => {
  if (!organizersLoaded.value) return 0
  return currentOrganizers.value.length
}

// Helper functions for user status styling
const getUserStatus = (user) => {
  const organizer = findOrganizerByUser(user)
  if (!organizer) return 'Unknown'
  
  const isActive = organizer.status === 'active' || organizer.is_active === true || organizer.is_active === 1
  return isActive ? 'Active' : 'Inactive'
}

const findOrganizerByUser = (user) => {
  return currentOrganizers.value.find(org => {
    // Primary check: user ID match
    if (org.user_id && user.id && org.user_id === user.id) return true
    if (org.id && user.id && org.id === user.id) return true
    
    // Email match
    if (org.email && user.email && org.email.toLowerCase() === user.email.toLowerCase()) return true
    
    // Enhanced phone number match
    if (org.phone_number && user.phone_number) {
      const organizerFormats = getPhoneSearchFormats(org.phone_number)
      const userFormats = getPhoneSearchFormats(user.phone_number)
      
      return organizerFormats.some(orgFormat => 
        userFormats.some(userFormat => {
          const cleanOrg = orgFormat.replace(/[^\d]/g, '')
          const cleanUser = userFormat.replace(/[^\d]/g, '')
          return cleanOrg === cleanUser || 
                 (cleanOrg.length > cleanUser.length && cleanOrg.endsWith(cleanUser)) ||
                 (cleanUser.length > cleanOrg.length && cleanUser.endsWith(cleanOrg))
        })
      )
    }
    
    return false
  })
}

const isUserActive = (user) => {
  const organizer = findOrganizerByUser(user)
  if (!organizer) return false
  return organizer.status === 'active' || organizer.is_active === true || organizer.is_active === 1
}

const getUserStatusClass = (user) => {
  return isUserActive(user) ? 'bg-orange-100 border-orange-200' : 'bg-gray-100 border-gray-300'
}

const getUserAvatarClass = (user) => {
  return isUserActive(user) ? 'bg-orange-200 text-orange-700' : 'bg-gray-200 text-gray-600'
}

const getUserNameClass = (user) => {
  return isUserActive(user) ? 'text-orange-800' : 'text-gray-700'
}

const getUserContactClass = (user) => {
  return isUserActive(user) ? 'text-orange-600' : 'text-gray-500'
}

const getUserStatusBadgeClass = (user) => {
  return isUserActive(user) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
}

const getUserRoleBadgeClass = (user) => {
  return isUserActive(user) ? 'bg-orange-200 text-orange-700' : 'bg-gray-200 text-gray-600'
}

const getUserIconClass = (user) => {
  return isUserActive(user) ? 'text-orange-600' : 'text-gray-500'
}

const getWarningTextClass = () => {
  return 'text-orange-600'
}

// Filter search results to exclude already invited users
const getFilteredUsers = () => {
  if (!organizersLoaded.value) return users.value
  
  return users.value.filter(user => !isUserAlreadyInvited(user))
}

// Get already invited users from search results (for display)
const getAlreadyInvitedUsers = () => {
  if (!organizersLoaded.value) return []
  
  return users.value.filter(user => isUserAlreadyInvited(user))
}

// Get existing roles for a user who is already invited
const getExistingUserRoles = (user) => {
  if (!organizersLoaded.value || !currentOrganizers.value.length) return []
  
  const organizer = currentOrganizers.value.find(org => {
    // Primary checks
    if (org.user_id && user.id && org.user_id === user.id) return true
    if (org.id && user.id && org.id === user.id) return true
    if (org.email && user.email && org.email.toLowerCase() === user.email.toLowerCase()) return true
    
    // Enhanced phone number matching
    if (org.phone_number && user.phone_number) {
      const organizerFormats = getPhoneSearchFormats(org.phone_number)
      const userFormats = getPhoneSearchFormats(user.phone_number)
      
      return organizerFormats.some(orgFormat => 
        userFormats.some(userFormat => {
          const cleanOrg = orgFormat.replace(/[^\d]/g, '')
          const cleanUser = userFormat.replace(/[^\d]/g, '')
          return cleanOrg === cleanUser || 
                 (cleanOrg.length > cleanUser.length && cleanOrg.endsWith(cleanUser)) ||
                 (cleanUser.length > cleanOrg.length && cleanUser.endsWith(cleanOrg))
        })
      )
    }
    
    return false
  })
  
  if (!organizer || !organizer.roles) return []
  
  return organizer.roles.map(role => role.role_name || role.name || role).filter(Boolean)
}

// Load permissions and organizers on component mount
onMounted(() => {
  loadPermissions()
  loadCurrentOrganizers()
})

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

  // CRITICAL PROTECTION: Double-check that none of the selected users are already invited
  // This is the main protection against duplicate invitations (both active and inactive users)
  const alreadyInvitedUsers = selectedUsers.value.filter(user => isUserAlreadyInvited(user))
  if (alreadyInvitedUsers.length > 0) {
    const userDetails = alreadyInvitedUsers.map(u => {
      const status = getUserStatus(u)
      return `${u.name} (${status})`
    }).join(', ')
    
    toast.add({
      severity: 'error',
      summary: 'Duplicate Invitation Blocked',
      detail: `Cannot invite ${userDetails} - already part of the team with existing permissions`,
      life: 6000
    })
    
    // Remove already invited users from selection automatically
    selectedUsers.value = selectedUsers.value.filter(user => !isUserAlreadyInvited(user))
    
    // If no users left after filtering, show additional message
    if (selectedUsers.value.length === 0) {
      toast.add({
        severity: 'warn',
        summary: 'No Valid Users',
        detail: 'All selected users already have permissions for this event (including inactive members)',
        life: 4000
      })
    }
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

  // ADDITIONAL PROTECTION: Final check before API call
  console.log('🔒 Final protection check before invitation...')
  const finalCheck = selectedUsers.value.filter(user => isUserAlreadyInvited(user))
  if (finalCheck.length > 0) {
    console.error('🚫 Protection triggered: Users already invited detected at final stage')
    toast.add({
      severity: 'error',
      summary: 'Protection Error',
      detail: 'System protection prevented duplicate invitation',
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
        summary: 'Invitation Sent Successfully',
        detail: `Invitation sent to ${selectedUsers.value.map(u => u.name).join(', ')}`,
        life: 4000
      })
      
      // Reset all form data
      selectedUsers.value = []
      newUser.value.contact = ''
      newUser.value.note = ''
      Object.keys(permissions.value).forEach(cat => permissions.value[cat].enabled = false)
      
      // IMPORTANT: Reload current organizers to update protection data
      console.log('🔄 Reloading team members for updated protection...')
      await loadCurrentOrganizers()
      
      // Clear search results to force fresh search with new protection data
      users.value = []
      
      toast.add({
        severity: 'info',
        summary: 'Protection Updated',
        detail: 'Team member list refreshed for protection',
        life: 2000
      })
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
    
    // Check if error is related to duplicate invitation from server
    if (error.response?.status === 409 || error.message?.includes('already')) {
      toast.add({
        severity: 'error',
        summary: 'Duplicate Invitation',
        detail: 'User already has permissions for this event',
        life: 4000
      })
      // Refresh organizers list to get latest data
      await loadCurrentOrganizers()
    } else {
      toast.add({
        severity: 'error',
        summary: 'API Error',
        detail: error.response?.data?.message || error.message,
        life: 4000
      })
    }
  } finally {
    inviting.value = false
  }
}

// Helper function to get current search value based on active tab
const getCurrentSearchValue = () => {
  return currentSearchTab.value === 'email' ? searchEmail.value.trim() : searchPhone.value.trim()
}

// Tab-specific search handlers (similar to login page logic)
const handleEmailSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    const email = searchEmail.value.trim()
    contactError.value = email.length > 0 && email.length < 3
    
    if (email.length >= 3) {
      searching.value = true
      try {
        users.value = await searchUsers(email)
        // Update the legacy contact field for compatibility
        newUser.value.contact = email
      } catch (error) {
        console.error('Email search error:', error)
        users.value = []
      } finally {
        searching.value = false
      }
    } else {
      users.value = []
      searching.value = false
      newUser.value.contact = ''
    }
  }, 400)
}

const handlePhoneSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    const phone = searchPhone.value.trim()
    contactError.value = phone.length > 0 && phone.length < 3
    
    if (phone.length >= 3) {
      searching.value = true
      try {
        // Get all possible phone number formats to search with
        const searchFormats = getPhoneSearchFormats(phone)
        let searchResults = []
        
        // Try searching with different phone formats in order of likelihood
        for (const format of searchFormats) {
          console.log('🔍 Searching with phone format:', format)
          const results = await searchUsers(format)
          if (results && results.length > 0) {
            searchResults = results
            console.log('✅ Found', results.length, 'results with format:', format)
            break // Stop searching once we find results
          } else {
            console.log('❌ No results with format:', format)
          }
        }
        
        users.value = searchResults
        // Update the legacy contact field for compatibility (use original input)
        newUser.value.contact = phone
        
        if (searchResults.length === 0) {
          console.log('❌ No results found with any phone format for input:', phone)
          console.log('🔍 Tried formats:', searchFormats)
        } else {
          console.log('✅ Final results count:', searchResults.length)
        }
      } catch (error) {
        console.error('Phone search error:', error)
        users.value = []
      } finally {
        searching.value = false
      }
    } else {
      users.value = []
      searching.value = false
      newUser.value.contact = ''
    }
  }, 400)
}

// Handle phone number component change event (gets more detailed info)
const handlePhoneNumberChange = (phoneData) => {
  // phoneData contains: { countryCode, phoneNumber, fullNumber, country }
  console.log('📞 PhoneNumber component data:', phoneData)
  
  // We can use the phoneData to get better search terms
  if (phoneData && phoneData.phoneNumber) {
    // Extract just the local number part
    const localNumber = phoneData.phoneNumber.replace(phoneData.countryCode, '').replace(/[^\d]/g, '')
    console.log('📞 Extracted local number:', localNumber)
    
    // Update search phone to trigger search with local number
    if (localNumber.length >= 3) {
      // Use the local number for search instead of full international format
      searchPhone.value = localNumber
    }
  }
}

// Helper function to generate different phone number search formats
const getPhoneSearchFormats = (inputPhone) => {
  const formats = []
  
  // Clean input: remove all non-digit characters except +
  const cleanInput = inputPhone.replace(/[^\d+]/g, '')
  const digitsOnly = cleanInput.replace(/[^\d]/g, '')
  
  // PRIORITY ORDER: Most likely to least likely formats
  
  // 1. For Cambodian numbers, if user types local format (like 10730876)
  // Try this first as it's most common use case
  if (digitsOnly.length >= 6 && digitsOnly.length <= 10 && !cleanInput.startsWith('+')) {
    // Remove leading zeros first
    const withoutLeadingZeros = digitsOnly.replace(/^0+/, '')
    if (withoutLeadingZeros.length >= 6) {
      formats.push(withoutLeadingZeros) // Most likely: just the local number
      formats.push(`0${withoutLeadingZeros}`) // With leading zero
    }
    formats.push(digitsOnly) // Original digits
  }
  
  // 2. Original input as-is (what user typed)
  formats.push(inputPhone)
  
  // 3. Clean digits only
  if (digitsOnly !== inputPhone && digitsOnly.length >= 6) {
    formats.push(digitsOnly)
  }
  
  // 4. If input is local format, try with country codes
  if (!cleanInput.startsWith('+') && digitsOnly.length >= 6) {
    const withoutLeadingZeros = digitsOnly.replace(/^0+/, '')
    if (withoutLeadingZeros.length >= 6) {
      formats.push(`855${withoutLeadingZeros}`) // Without + prefix
      formats.push(`+855${withoutLeadingZeros}`) // With + prefix
      formats.push(`855${digitsOnly}`) // With original digits
      formats.push(`+855${digitsOnly}`) // With + and original digits
    }
  }
  
  // 5. If input already has country code, try local variants
  if (cleanInput.startsWith('+855') || cleanInput.startsWith('855')) {
    const localPart = cleanInput.replace(/^(\+?855)/, '')
    if (localPart.length >= 6) {
      formats.push(localPart) // Just local part
      if (!localPart.startsWith('0')) {
        formats.push(`0${localPart}`) // With leading zero
      }
    }
  }
  
  // 6. Try full international formats if not already added
  if (!cleanInput.startsWith('+') && digitsOnly.length >= 8) {
    formats.push(`+855${digitsOnly}`)
    formats.push(`855${digitsOnly}`)
  }
  
  // 7. Common formatting patterns (least priority)
  if (digitsOnly.length >= 8) {
    const spacedFormat = digitsOnly.replace(/(\d{2,3})(\d{3})(\d+)/, '$1 $2 $3')
    formats.push(spacedFormat)
    
    const dashedFormat = digitsOnly.replace(/(\d{2,3})(\d{3})(\d+)/, '$1-$2-$3')
    formats.push(dashedFormat)
  }
  
  // Remove duplicates and keep order, filter short numbers
  const uniqueFormats = []
  const seen = new Set()
  
  for (const format of formats) {
    if (format && format.length >= 3 && !seen.has(format)) {
      uniqueFormats.push(format)
      seen.add(format)
    }
  }
  
  console.log('📞 Generated phone search formats for', inputPhone, '(prioritized):', uniqueFormats)
  return uniqueFormats
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