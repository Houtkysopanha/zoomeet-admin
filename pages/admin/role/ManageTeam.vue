<template>
  <div class="p-4 bg-[#F8F8FF] min-h-screen">
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <Breadcrumb
            :items="[
              { text: 'Event', to: '/admin/event' },
              { text: 'Manage Team' }
            ]"
            class="mb-2"
          />
        </div>
        <div class="flex space-x-3">
          <!-- <Button
            icon="pi pi-refresh"
            class="p-button-outlined p-button-sm"
            @click="loadOrganizers"
            :loading="loading"
            title="Refresh team members"
          /> -->
          <IconnButton label="Invite new user" icon="mingcute:user-add-2-fill" @click="inviteUser()" />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
      <div v-if="eventCardData">
  <EventCard
    :image-src="eventCardData.imageSrc"
    :alt-text="eventCardData.altText"
    :event-title="eventCardData.title"
    :owner="eventCardData.owner"
    :location="eventCardData.location"
    :date="eventCardData.date"
    :time="eventCardData.time"
  />
</div>
      <div v-else class="flex items-center justify-center p-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mb-2"></div>
          <p class="text-gray-600">Loading event details...</p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CardCommon
          v-for="(stat, index) in updatedTeamStats"
          :key="index"
          :title="stat.title"
          :count="stat.count"
          :icon="stat.icon"
          :weekChange="stat.weekChange"
            :style="index !== 0 ? { visibility: 'hidden' } : {}"
        />
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="mb-6 flex items-center justify-between mt-10 rounded-lg">
     <div class="flex items-center space-x-4 w-full lg:w-auto">
        <div class="relative w-full">
          <div class="border border-gray-300 rounded-full overflow-hidden flex">
            <div class="relative flex-1">
              <Icon name="i-heroicons-magnifying-glass" class="absolute w-6 h-6 lg:w-8 lg:h-8 left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search"
                class="w-full pl-12 lg:pl-14 border-0 focus:ring-0 focus:outline-none bg-transparent p-2 lg:p-3 rounded-full text-sm lg:text-base"
              />
            </div>
            <div class="relative">
              <Icon name="mynaui:filter" class="absolute w-6 h-6 lg:w-8 lg:h-8 left-3 top-1/2 bg-gradient-to-t from-blue-900 to-purple-800 transform -translate-y-1/2" />
              <Button
                label="Filters"
                class="p-button-outlined px-4 lg:px-5 text-purple-600 border-purple-600 w-full h-full rounded-none p-2 ml-5 lg:p-3 text-sm lg:text-base"
                @click="toggleFilters"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <div class="relative">
          <Dropdown
            v-model="sortOption"
            :options="sortOptions"
            optionLabel="label"
            optionValue="value"
            class="w-30 p-dropdown-sm border bg-transparent border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg"
            @change="applySort"
          >
            <template #value="slotProps">
  <span>{{ slotProps.value || 'Sort' }}</span>
</template>

          </Dropdown>
          <span class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></span>
        </div>
        <p class="text-xl font-normal text-gray-700">Show</p>
        <Dropdown
          v-model="itemsPerPage"
          :options="pageOptions"
          optionLabel="label"
          optionValue="value"
          placeholder=""
          class="border border-gray-300 bg-transparent rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          @change="applyPageChange"
        />
        <span class="text-lg text-gray-700 border-l pl-2 border-gray-500"> 
          {{ paginationDisplay }}
        </span>
      </div>
    </div>

    <!-- Datatable -->
    <div class="bg-white overflow-hidden">
      <!-- Loading state -->
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p class="mt-2 text-gray-600">Loading team members...</p>
      </div>
      
      <!-- Data table -->
      <div v-else-if="filteredUsers.length > 0">
        <DataTable
  :value="filteredUsers"
  :paginator="true"
  :rows="itemsPerPage"
  :first="(currentPage - 1) * itemsPerPage"
  :totalRecords="totalFilteredCount"
  @page="onPageChange"
  dataKey="id"
  class="p-datatable-gridlines"
  scrollable
  responsiveLayout="scroll">

          <Column field="user" header="User" sortable class="text-[14px] border-b border-gray-300">
            <template #body="{ data }">
              <div class="flex items-center gap-2">
                <!-- Avatar image if available, otherwise show initials -->
                <div v-if="data.avatar && data.avatar !== ''" class="relative">
                  <img 
                    :src="data.avatar" 
                    :alt="data.user"
                    class="w-8 h-8 rounded-full object-cover"
                    @error="handleImageError(data)"
                  />
                </div>
                <div v-else :class="['w-8 h-8 rounded-full bg-gradient-to-r flex items-center justify-center text-xs font-bold text-white', getAvatarGradient(data.user)]">
                  {{ getInitials(data.user) }}
                </div>
                <div>
                  <span class="font-medium">{{ data.user }}</span>
                  <p class="text-[12px] text-gray-600 text-justify pr-6">
                    <span>{{ data.email }}</span>
                  </p>
                </div>
              </div>
            </template>
          </Column>
          <Column field="phoneNumber" header="Phone Number" sortable class="text-[14px] border-b border-gray-300"></Column>
          <Column field="optionalNote" header="Optional Note" class="text-[14px] border-b border-gray-300"></Column>
          <Column field="permissions" header="Permissions" class="text-[14px] border-b border-gray-300">
  <template #body="{ data }">
    <div v-if="data.permissions && data.permissions.length > 0" class="flex flex-wrap gap-1">
      <span v-for="perm in data.permissions" :key="perm"
            :class="['px-2 py-1 rounded-full text-xs font-medium', colorByPermission(perm)]">
        {{ perm }}
      </span>
    </div>
    <span v-else class="text-gray-400 text-xs">No permissions assigned</span>
  </template>
</Column>

          <Column field="status" header="Status" class="text-[14px] border-b border-gray-300">
            <template #body="{ data }">
              <span :class="['px-2 py-1 rounded-full text-xs font-medium', {
                'bg-green-100 text-green-700': data.status === 'Active',
                'bg-gray-100 text-gray-800': data.status === 'Inactive'
              }]">
                {{ data.status }}
              </span>
            </template>
          </Column>
          <Column header="Actions" class="text-[14px] border-b border-gray-300">
            <template #body="{ data }">
             <Button
  icon="pi pi-ellipsis-v"
  class="p-button-text p-button-sm text-gray-500"
  @click="toggleMenu($event, data)"
/>
<Menu ref="menu" class="rounded-xl" :model="menuItems" :popup="true" />

            </template>
          </Column>
        </DataTable>
      </div>

      <!-- Empty state when no team members -->
      <div v-else class="text-center py-12">
        <div class="mb-4">
          <Icon name="heroicons:users" class="w-16 h-16 text-gray-300 mx-auto" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
        <p class="text-gray-500 mb-4">
          Invite team members to start collaborating on this event.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import IconnButton from '~/components/ui/IconnButton.vue'
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import EventCard from '~/components/common/EventCard.vue'
import { formatEventDateRange, formatEventTime } from '~/utils/dateFormatter'
import CardCommon from '~/components/common/CardCommon.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import Menu from 'primevue/menu'
import Button from 'primevue/button'
import poster from '@/assets/image/poster-manage-booking.png'

import { fetchEventOrganizers, disableEventOrganizer, removeOrganizer, getEventDetails } from '@/composables/api'

const eventCardData = ref(null)

const router = useRouter()
const route = useRoute()
const toast = useToast()

// ✅ dynamic from query params
const eventId = ref(route.query.eventId)
const userId = ref(route.query.userId)
const userName = ref(route.query.userName)

const loadEventCard = async () => {
  if (!eventId.value) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No event selected. Please select an event.',
      life: 5000
    })
    router.push('/admin/event')
    return
  }

  try {
    const eventResponse = await getEventDetails(eventId.value)
    const event = eventResponse.data

    eventCardData.value = {
      imageSrc: event.cover_image_url || '',
      altText: event.name || 'Event',
      title: event.name || 'Untitled Event',
      owner: event.organizer || 'Unknown Organizer',
      location: event.location || 'No location specified',
      date: formatEventDateRange(event.start_date, event.end_date),
      time: formatEventTime(event)
    }
  } catch (err) {
    console.error("❌ Failed to fetch event details:", err)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load event details. Please try again.',
      life: 5000
    })

    eventCardData.value = {
      imageSrc: '',
      altText: 'Event',
      title: 'Unable to load event details',
      owner: 'Unknown',
      location: 'Unknown',
      date: 'Unknown',
      time: 'Unknown'
    }
  }
}


// 📌 Team Members
const allUsers = ref([])
const users = ref([])
const loading = ref(false)
const totalMembers = ref(0)
const activeMembers = ref(0)

// Filters & sorting
const searchQuery = ref('')
const sortOption = ref(null)
const itemsPerPage = ref(10)
const currentPage = ref(1)

// Options
const sortOptions = [
  { label: 'Sort by Name', value: 'name' },
  { label: 'Sort by Email', value: 'email' },
  { label: 'Sort by Status', value: 'status' }
]

const pageOptions = ref([
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '25', value: 25 },
])
const colorByPermission = (perm) => {
  if (!perm) return 'bg-gray-100 text-gray-800'

  const p = perm.toLowerCase()
  if (p.includes('event')) return 'bg-purple-50 text-purple-800'
  if (p.includes('booking')) return 'bg-blue-50 text-blue-700'
  if (p.includes('check-in')) return 'bg-blue-50 text-blue-800'
  if (p.includes('report')) return 'bg-pink-50 text-pink-800'

  return 'bg-gray-100 text-gray-800'
}

// Helper function to get initials from name
const getInitials = (name) => {
  if (!name || name.trim() === '') return '??'
  
  const words = name.trim().split(' ').filter(word => word.length > 0)
  if (words.length === 0) return '??'
  
  if (words.length === 1) {
    // If single word, take first 2 characters
    return words[0].slice(0, 2).toUpperCase()
  }
  
  // If multiple words, take first character of first two words
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
}

// Get gradient color based on name
const getAvatarGradient = (name) => {
  if (!name) return 'from-blue-500 to-purple-600'
  
  const gradients = [
    'from-blue-500 to-purple-600',
    'from-green-500 to-blue-600', 
    'from-purple-500 to-pink-600',
    'from-orange-500 to-red-600',
    'from-teal-500 to-cyan-600',
    'from-indigo-500 to-purple-600'
  ]
  
  // Simple hash based on name length and first character
  const hash = name.length + name.charCodeAt(0)
  return gradients[hash % gradients.length]
}

// Handle image loading errors
const handleImageError = (userData) => {
  userData.avatar = '' // Clear the avatar to show initials
}

// Stats
const updatedTeamStats = computed(() => [
  {
    title: 'Team Members',
    count: allUsers.value.length, // Total team members (not filtered)
    icon: 'fluent:people-team-24-filled',
    weekChange: '0'
  },
  {
    title: 'Team Members',
    count: allUsers.value.length, // Total team members (not filtered)
    icon: 'fluent:people-team-24-filled',
    weekChange: '0'
  }
  ,
  {
    title: 'Team Members',
    count: allUsers.value.length, // Total team members (not filtered)
    icon: 'fluent:people-team-24-filled',
    weekChange: '0'
  },
  {
    title: 'Team Members',
    count: allUsers.value.length, // Total team members (not filtered)
    icon: 'fluent:people-team-24-filled',
    weekChange: '0'
  }
])

// Menu state
const menu = ref()
const selectedUserForMenu = ref(null)
const menuItems = [
  {
    label: 'Edit Permission',
    icon: 'pi pi-pencil',
    command: () => editPermission(selectedUserForMenu.value)
  },
  {
    label: 'Disable',
    icon: 'pi pi-times',
    command: () => disableUser(selectedUserForMenu.value)
  },
  {
    label: 'Remove',
    icon: 'pi pi-trash text-red-500',
    command: () => removeUser(selectedUserForMenu.value)
  }
]

// Pagination & sorting pipeline
const filteredUsers = computed(() => {
  let filtered = [...allUsers.value]

  // Search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      u =>
        u.user.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phoneNumber.toLowerCase().includes(q)
    )
  }

  // Sort
  if (sortOption.value === 'name') {
    filtered.sort((a, b) => a.user.localeCompare(b.user))
  } else if (sortOption.value === 'email') {
    filtered.sort((a, b) => a.email.localeCompare(b.email))
  } else if (sortOption.value === 'status') {
    filtered.sort((a, b) => a.status.localeCompare(b.status))
  }

  return filtered
})

const paginatedUsers = computed(() => {
  const filtered = filteredUsers.value
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filtered.slice(start, end)
})

// Total filtered count for pagination display
const totalFilteredCount = computed(() => filteredUsers.value.length)

// Pagination display
const paginationDisplay = computed(() => {
  const total = totalFilteredCount.value
  if (total === 0) return 'No results'
  
  const start = (currentPage.value - 1) * itemsPerPage.value + 1
  const end = Math.min(currentPage.value * itemsPerPage.value, total)
  
  return `Show ${start} to ${end} of ${total}`
})

// Methods
const loadOrganizers = async () => {
  if (!eventId.value) return

  loading.value = true
  try {
    const { status, data } = await fetchEventOrganizers(eventId.value)

    if (status === 200 && data.success && Array.isArray(data.data)) {
      allUsers.value = data.data.map(o => ({
        id: o.id,
        user_id: o.user_id,
        user: o.name,
        email: o.email,
        avatar: o.avatar_url || o.avatar || '', // Handle different possible avatar field names
        phoneNumber: o.phone_number || 'N/A',
        optionalNote: o.note || 'Admin',
        permissions: (o.roles || []).map(r => typeof r === 'string' ? r : r.name),
        status: o.is_active == 1 || o.is_active === true ? 'Active' : 'Inactive',
        created_at: o.created_at
      }))

      totalMembers.value = allUsers.value.length
      activeMembers.value = allUsers.value.filter(u => u.status === 'Active').length
    }
  } catch (err) {
    console.error('❌ Error loading organizers:', err)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load team members. Please try again.',
      life: 4000
    })
  } finally {
    loading.value = false
  }
}

const toggleMenu = (event, data) => {
  selectedUserForMenu.value = data
  menu.value.toggle(event)
}

const inviteUser = () => {
  router.push({
    path: '/admin/role/InviteNewUser',
    query: { eventId: eventId.value }
  })
}

const editPermission = (userData) => {
  router.push({
    path: '/admin/role/EditPermission',
    query: {
      eventId: eventId.value,
      userId: userData.user_id,
      userName: userData.user
    }
  })
}

const disableUser = async (userData) => {
  try {
    const { status, data } = await disableEventOrganizer(eventId.value, userData.user_id)

    if (status === 200 && data.success) {
      const userIndex = allUsers.value.findIndex(u => u.user_id === userData.user_id)
      if (userIndex !== -1) allUsers.value[userIndex].status = 'Inactive'

      toast.add({ severity: 'success', summary: 'Disabled', detail: `${userData.user} disabled.`, life: 3000 })
    }
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: err.message, life: 4000 })
  }
}

const removeUser = async (userData) => {
  try {
    const token = localStorage.getItem('token')
    const { status, data } = await removeOrganizer({ eventId: eventId.value, userId: userData.user_id, token })

    if (status === 200 && data.success) {
      allUsers.value = allUsers.value.filter(u => u.user_id !== userData.user_id)
      totalMembers.value = allUsers.value.length
      activeMembers.value = allUsers.value.filter(u => u.status === 'Active').length
      
      toast.add({ severity: 'success', summary: 'Removed', detail: `${userData.user} removed.`, life: 3000 })
    }
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || error.message, life: 4000 })
  }
}

const toggleFilters = () => toast.add({ severity: 'info', summary: 'Filters', detail: 'Filter TBD', life: 3000 })
const applySort = () => { currentPage.value = 1 }
const applyPageChange = e => { itemsPerPage.value = e.value; currentPage.value = 1 }
const onPageChange = (event) => {
  currentPage.value = event.page + 1
}

// Watch for search changes to reset pagination
watch(searchQuery, () => {
  currentPage.value = 1
})

// ✅ Load data on mount
onMounted(loadOrganizers)
onMounted(loadEventCard)

definePageMeta({ layout: 'admin' })
</script>


<style scoped>
/* Existing styles */
:deep(.p-calendar) {
  background: transparent !important;
}
:deep(.p-calendar .p-inputtext) {
  background: transparent !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}
:deep(.p-calendar .p-inputtext:focus) {
  outline: none !important;
  box-shadow: none !important;
  border: none !important;
}
:deep(.p-datatable .p-datatable-thead > tr) {
  background-color: #F6F9F9;
  color: #667085;
}
:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: transparent;
  color: inherit;
  transition: background-color 0.3s ease;
  padding-top: 1rem; /* Added padding */
  padding-bottom: 1rem; /* Added padding */
}
:deep(.p-datatable .p-datatable-tbody > tr > td) {
  background-color: white;
  color: #1F2937;
  padding-top: 20px;
  padding-bottom: 20px;
}
:deep(.p-datatable .p-datatable-tbody > tr:hover > td) {
  background-color: #E6F2FF;
  transition: background-color 0.3s ease;
}
/* Custom menu styling */
:deep(.p-menu .p-menuitem-link) {
  padding: 0.75rem 1rem;
  display: flex; /* Added for icon alignment */
  align-items: center; /* Added for icon alignment */
  gap: 0.5rem; /* Space between icon and text */
}
:deep(.p-menu .p-menuitem-link:hover) {
  background-color: #f3f4f6;
}
:deep(.p-menu .p-menuitem-separator) {
  margin: 0.25rem 0;
}

/* New styles for search and dropdown */
:deep(.p-dropdown) {
  border-radius: 0.5rem; /* Rounded corners */
  border: 1px solid #D1D5DB; /* Border color */
  box-shadow: none; /* No shadow */
}

:deep(.p-dropdown:not(.p-disabled):focus) {
  outline: 0 none;
  outline-offset: 0;
  box-shadow: 0 0 0 0.2rem rgba(122, 73, 201, 0.25); /* Custom focus ring */
  border-color: #7A49C9; /* Custom border color on focus */
}

:deep(.p-dropdown .p-dropdown-label) {
  padding: 0.5rem 0.75rem; /* Adjust padding */
}

:deep(.p-dropdown-trigger) {
  width: 2rem; /* Adjust trigger width */
}

:deep(.p-dropdown-panel .p-dropdown-items-wrapper) {
  border-radius: 0.5rem;
  overflow: hidden;
}

:deep(.p-dropdown-panel .p-dropdown-item) {
  padding: 0.75rem 1rem;
}

:deep(.p-dropdown-panel .p-dropdown-item:hover) {
  background-color: #f3f4f6;
}

/* PrimeVue DataTable specific overrides for better visual match */
:deep(.p-datatable .p-datatable-header) {
  padding: 0; /* Remove default header padding as we have custom search/filters above */
  border-bottom: none; /* Remove default header border */
}

:deep(.p-datatable .p-datatable-wrapper) {
  border-radius: 0.5rem; /* Apply border-radius to the table wrapper */
  overflow: hidden; /* Ensure content respects border-radius */
}

:deep(.p-datatable .p-datatable-tfoot > tr > td) {
  background-color: white; /* Ensure footer background matches body */
}

:deep(.p-paginator) {
  background-color: white; /* Ensure paginator background matches body */
  border-top: 1px solid #e5e7eb; /* Add a subtle border to separate from table */
  padding: 1rem;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
  @apply bg-gradient-to-tr from-[#4D66A6] to-[#B61EEB] text-white border-none;
  border-color: linear-gradient(79deg, #4D66A6 7.31%, #B61EEB 98.95%);
  border-radius: 10px;
  color: white;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page:not(.p-highlight):hover) {
  background-color: #e6f2ff; /* Hover color for pages */
  color: #7A49C9;
}

:deep(.p-paginator .p-paginator-first,
.p-paginator .p-paginator-prev,
.p-paginator .p-paginator-next,
.p-paginator .p-paginator-last) {
  border-radius: 0.5rem; /* Rounded buttons */
}

:deep(.p-paginator .p-paginator-first:hover,
.p-paginator .p-paginator-prev:hover,
.p-paginator .p-paginator-next:hover,
.p-paginator .p-paginator-last:hover) {
  background-color: #e6f2ff; /* Hover color for navigation buttons */
  color: #7A49C9;
}

:deep(.p-column-header-content) {
  display: flex;
  align-items: center;
  gap: 0.25rem; /* Space between text and sort icon */
}

/* Custom button styling for Filters */
.p-button-purple {
  background: linear-gradient(to top, #4A00B0, #7A49C9); /* Adjusted gradient for better visibility */
  color: white !important; /* Ensure text is white */
  border-color: #7A49C9 !important;
}

.p-button-purple:hover {
  background: linear-gradient(to top, #3A0090, #6A39B9); /* Darker hover state */
}

/* Avatar styling */


</style>
