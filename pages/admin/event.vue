<template>
  <div class="p-3 lg:p-4 bg-[#F8F8FF]">
    <div class="mb-4 lg:mb-6">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <Breadcrumb
            :items="[
              { text: 'Event' }
            ]"
            class="mb-2"
          />
        </div>
        <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 items-stretch sm:items-center">
          <Calendar
            v-model="dateRange"
            selectionMode="range"
            :manualInput="false"
            :showIcon="true"
            :showButtonBar="true"
            dateFormat="dd MM, yy"
            class="w-full sm:max-w-xs p-inputtext-lg rounded-xl border border-gray-200 p-2 lg:p-3 text-center text-blue-950 font-medium text-sm lg:text-lg bg-transparent focus:ring-0 focus:outline-none"
            placeholder="Select Date Range"
            @date-select="updateDisplay"
          />
          <div class="w-full sm:w-auto">
            <IconnButton
              label="Create Event"
              icon="mdi:event-add"
              @click="goToCreateEvent"
              class="w-full sm:w-auto"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Event Stats -->
    <div class="opacity-30 cursor-not-allowed">
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      <CardCommon
        v-for="(stat, index) in eventStats"
        :key="index"
        :title="stat.title"
        :count="stat.count"
        :icon="stat.icon"
        :weekChange="stat.weekChange"
        :disabled="true"
      />
    </div>
    </div>

    <!-- Filters and Search -->
    <div class="mb-4 lg:mb-6 flex flex-col lg:flex-row lg:items-center justify-between mt-6 lg:mt-10 gap-4 rounded-lg">
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

      <div class="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
        <div class="relative w-full sm:w-auto">
          <Dropdown
            v-model="sortOption"
            :options="sortOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full sm:w-32 lg:w-40 p-dropdown-sm border bg-transparent border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            @change="applySort"
          >
            <template #value="slotProps">
              <span v-if="slotProps.value" class="text-sm lg:text-base">{{ slotProps.value }}</span>
              <span v-else class="text-sm lg:text-base text-black">Sort</span>
            </template>
          </Dropdown>
        </div>

        <div class="flex items-center space-x-2 lg:space-x-4 w-full sm:w-auto">
          <p class="text-sm lg:text-xl font-normal text-gray-700 whitespace-nowrap">Show</p>
          <Dropdown
            v-model="itemsPerPage"
            :options="pageOptions"
            optionLabel="label"
            optionValue="value"
            placeholder=""
            class="w-20 lg:w-24 border border-gray-300 bg-transparent rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            @change="applyPageChange"
          />
        </div>

        <span class="text-xs lg:text-lg text-gray-700 border-l pl-2 border-gray-500 whitespace-nowrap">
          Show {{ currentPage * itemsPerPage - (itemsPerPage - 1) }} to {{ Math.min(currentPage * itemsPerPage, totalItems) }} of {{ totalItems }}
        </span>
      </div>
    </div>
    <!-- Events Table -->
    <div class="overflow-x-auto">
      <DataTable
        :value="filteredEvents"
        :paginator="true"
        :rows="itemsPerPage"
        :totalRecords="totalItems"
        :lazy="true"
        @page="onPage"
        class="p-datatable-sm shadow-md overflow-hidden min-w-full"
        :scrollable="true"
        scrollHeight="flex"
      >
      <Column
        field="name"
        header="Event"
        sortable
        class="w-[23%] text-[14px] border-b border-gray-300 "
      >
        <template #body="slotProps">
          <div class="text-black font-medium capitalize">
            <span>{{ slotProps.data.name }}</span>
            <p class="text-[12px] text-gray-600 text-justify pr-6">
              <span> Owner: {{ slotProps.data.organizer }}</span>
            </p>
          </div>
        </template>
      </Column>
      <Column
        field="date"
        header="Date"
        sortable
        class="text-[12px] border-b border-gray-300"
      >
        <template #body="slotProps">
          <span>{{ formatDate(slotProps.data.date) }}</span>
        </template>
      </Column>

    <Column field="venue" header="Venue" class="text-[12px] border-b border-gray-300" />
      <Column field="type" header="Event Type" class="text-[12px] border-b border-gray-300" />

      <Column
        field="revenue"
        header="Revenue"
        class="text-[12px] border-b border-gray-300"
      >
        <template #body="slotProps">
          <span>{{ formatCurrency(slotProps.data.revenue) }}</span>
        </template>
      </Column>

      <Column
        field="bookings"
        header="Number of Booking"
        class="text-[12px] text-start border-b border-gray-300"
      >
      <template #body="slotProps">
        <span>{{ slotProps.data.bookings }}</span>
      </template>
      </Column>
      <Column
         field="bookings"
        header="Number of Booking"
        class="text-[12px] text-start border-b border-gray-300"
      >
      <template #body="slotProps">
        <span>{{ slotProps.data.tickets }}</span>
      </template>
      </Column>
      <Column
        field="status"
        header="Status"
        class="text-[12px] border-b border-gray-300"
      >
        <template #body="slotProps">
          <span :class="getStatusClass(slotProps.data.status)">{{
            slotProps.data.status
          }}</span>
        </template>
      </Column>

      <Column
        field="actions"
        header="Actions"
        class="border-b border-gray-300 text-[12px]  text-start"
      >
        <template #body="slotProps">
          <Button
            icon="pi pi-ellipsis-v"
            class="p-button-rounded p-button-outlined p-button-indigo"
            @click="(event) => toggleActionMenu(event, slotProps.data)"
          />
          <Menu
            ref="actionMenu"
            :model="actionItems(slotProps.data)"
            :popup="true"
            class="rounded-xl shadow-md"
          />
        </template>
      </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Button from 'primevue/button'
import IconnButton from '~/components/ui/IconnButton.vue'
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import Calendar from 'primevue/calendar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import Menu from 'primevue/menu'
import CardCommon from '~/components/common/CardCommon.vue'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import { fetchEvents } from '@/composables/api'
import { useEventStore } from '~/composables/useEventStore'
import { useAuth } from '~/composables/useAuth'

const router = useRouter()
const toast = useToast()

const goToCreateEvent = () => { router.push('/admin/CreateEvent') }

const eventStats = ref([
  { title: 'Total Events', count: '0', icon: 'clarity:event-solid', weekChange: '0' },
  { title: 'Active Events', count: '0', icon: 'clarity:event-solid-badged', weekChange: '0' },
  { title: 'Ongoing', count: '0', icon: 'mdi:movie-check', weekChange: '0' },
  { title: 'Draft', count: '0', icon: 'mdi:clipboard-text-date', weekChange: '0' },
])

const dateRange = ref(null)
const displayRange = ref('')
const updateDisplay = () => {
  const [start, end] = dateRange.value || []
  if (start instanceof Date && !isNaN(start) && end instanceof Date && !isNaN(end)) {
    const formattedStart = start.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
    const formattedEnd = end.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
    displayRange.value = `${formattedStart} - ${formattedEnd}`
  } else {
    displayRange.value = ''
  }
}

const searchQuery = ref('')
const sortOption = ref('Sort') // default sorting by date ascending

// Sort options for dropdown
const sortOptions = ref([
  { label: 'Sort', value: 'Sort' },
  { label: 'Date (Ascending)', value: 'date-asc' },
  { label: 'Date (Descending)', value: 'date-desc' },
  { label: 'Name (A-Z)', value: 'name-asc' },
  { label: 'Name (Z-A)', value: 'name-desc' },
])

const pageOptions = ref([
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  { label: '25', value: 25 },
  { label: '50', value: 50 },
])

const itemsPerPage = ref(10)
const currentPage = ref(1)
const totalItems = ref(0)
const sortField = ref('date')
const sortOrder = ref(1) // 1 ascending, -1 descending

const events = ref([])

// Fetch events from API
const loadEvents = async () => {
  try {
    // Add debug information
    const { debugAuth } = useAuthDebug()
    debugAuth()
    
    const { status, data } = await fetchEvents()

    if (status === 200 && data.success && Array.isArray(data.data)) {
      // Clear existing events first
      events.value = []
      
      // Map and validate each event
      events.value = data.data.map(ev => {
        // Keep ALL original data
        const originalData = { ...ev }
        
        // Ensure we have a valid UUID
        const eventId = ev.id?.toString()
        if (!eventId || !eventId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          return null
        }

        // Log each unique event ID for debugging

        // Return an object with display fields AND all original data
        return {
          // Display fields for the table
          id: eventId,
          name: ev.name || 'Untitled Event',
          description: ev.description || '',
          organizer: ev.organizer || 'Unknown Organizer',
          date: ev.start_date ? new Date(ev.start_date) : new Date(),
          venue: ev.location || 'TBD',
          type: ev.category_name || 'Uncategorized',
          revenue: ev.total_revenue || 0,
          bookings: ev.total_bookings || 0,
          tickets: ev.total_tickets || 0,
          status: ev.is_published ? 'Active' : 'Draft',
          
          // Category info
          category_id: ev.category_id,
          category_name: ev.category_name,
          
          // Dates
          start_date: ev.start_date,
          end_date: ev.end_date,
          created_at: ev.created_at,
          updated_at: ev.updated_at,
          
          // Location info
          location: ev.location,
          map_url: ev.map_url,
          online_link_meeting: ev.online_link_meeting,
          
          // Organization info
          company: ev.company,
          event_slug: ev.event_slug,
          
          // Images
          cover_image_url: ev.cover_image_url,
          event_background_url: ev.event_background_url,
          card_background_url: ev.card_background_url,
          
          // Related data
          chairs: ev.chairs || [],
          members: ev.members || [],
          agendas: ev.agendas || [],
          settings: ev.settings,
          
          // Keep complete original data
          _original: originalData
        }
      }).filter(Boolean) // Remove any null entries

      totalItems.value = events.value.length
      
      // Update event statistics
      updateEventStats(events.value);
      
      if (events.value.length === 0) {
        toast.add({
          severity: 'info',
          summary: 'No Events',
          detail: 'No events found. Create your first event!',
          life: 3000
        })
      }
    } else {
      console.error('API Error Response:', data)
      toast.add({
        severity: 'error',
        summary: 'API Error',
        detail: data.message || 'Failed to fetch events',
        life: 3000
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Fetch Error',
      detail: error.message || 'Failed to load events',
      life: 3000
    })
  }
}

// Update event statistics based on loaded events
const updateEventStats = (eventsData) => {
  if (!eventsData || !Array.isArray(eventsData)) return;
  
  const totalEvents = eventsData.length;
  const activeEvents = eventsData.filter(event => event.status === 'Active').length;
  const draftEvents = eventsData.filter(event => event.status === 'Draft').length;
  // For ongoing events, we could check if current date is between start_date and end_date
  const ongoingEvents = eventsData.filter(event => {
    const now = new Date();
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    return now >= startDate && now <= endDate;
  }).length;
  
  eventStats.value = [
    { title: 'Total Events', count: totalEvents.toString(), icon: 'clarity:event-solid', weekChange: '0' },
    { title: 'Active Events', count: activeEvents.toString(), icon: 'clarity:event-solid-badged', weekChange: '0' },
    { title: 'Ongoing', count: ongoingEvents.toString(), icon: 'mdi:movie-check', weekChange: '0' },
    { title: 'Draft', count: draftEvents.toString(), icon: 'mdi:clipboard-text-date', weekChange: '0' },
  ];
}

onMounted(() => {
  loadEvents()
})

const applySort = () => {
  // Parse sortOption and update sortField and sortOrder accordingly
  const [field, order] = sortOption.value.split('-')
  sortField.value = field.toLowerCase()
  sortOrder.value = order === 'asc' ? 1 : -1
  currentPage.value = 1
}

const applyPageChange = () => {
  currentPage.value = 1 // Reset page on items per page change
}

const filteredEvents = computed(() => {
  let result = [...events.value]

  // Search filter
  if (searchQuery.value) {
    result = result.filter(ev =>
      ev.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Sorting
  result.sort((a, b) => {
    let valA = a[sortField.value]
    let valB = b[sortField.value]

    // If date, compare timestamps
    if (valA instanceof Date && valB instanceof Date) {
      return sortOrder.value * (valA.getTime() - valB.getTime())
    }

    // String comparison
    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortOrder.value * valA.localeCompare(valB)
    }

    // Numbers fallback
    return sortOrder.value * (valA - valB)
  })

  totalItems.value = result.length

  // Pagination
  const start = (currentPage.value - 1) * itemsPerPage.value
  return result.slice(start, start + itemsPerPage.value)
})

const onPage = (event) => {
  currentPage.value = event.page + 1
}

const formatDate = (date) =>
  date.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })

const formatCurrency = (value) => `$${value.toLocaleString()}`

const getStatusClass = (status) => {
  const classes = {
    Active: 'bg-green-100 text-green-800 px-2 py-1 rounded-full',
    Pending: 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full',
    Completed: 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full',
    Draft: 'bg-gray-200 text-gray-700 px-2 py-1 rounded-full',
  }
  return classes[status] || 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full'
}

const toggleFilters = () => {
  toast.add({ severity: 'info', summary: 'Filters', detail: 'Filter functionality to be implemented', life: 3000 })
}

const actionMenu = ref(null)
const currentEvent = ref(null)
const toggleActionMenu = (event, data) => {
  currentEvent.value = data
  actionMenu.value.toggle(event)
}

// Helper function to validate UUID
function validateUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid?.toString());
}

const handleEditEvent = (event) => {
  // Use the existing editEvent function which is better implemented
  editEvent(event);
};


const actionItems = (event) => [
  {
    label: 'Edit Event',
    icon: 'pi pi-pencil',
    command: () => handleEditEvent(event),
  },
  // Disabled actions - no API support yet
  {
    label: 'Manage Booking',
    icon: 'pi pi-cog',
    command: () => {
      toast.add({
        severity: 'info',
        summary: 'Feature Coming Soon',
        detail: 'Booking management is currently under development.',
        life: 3000
      });
    },
    visible: false, // Disabled
  },
  {
    label: 'End Event',
    icon: 'pi pi-times',
    command: () => {
      toast.add({
        severity: 'info',
        summary: 'Feature Coming Soon',
        detail: 'End event functionality is currently under development.',
        life: 3000
      });
    },
    visible: false, // Disabled
  },
  {
    label: 'Delete Event',
    icon: 'pi pi-trash text-red-500',
    command: () => removeEvent(event),
  },
]

const manageTickets = (event) => {
  const eventStore = useEventStore()

  try {
    // Store event in Pinia instead of localStorage
    eventStore.setCurrentEvent(event)

    toast.add({
      severity: 'info',
      summary: 'Manage Tickets',
      detail: `Opening ticket management for ${event.name}`,
      life: 3000
    })

    // Navigate to Create Event page with Ticket tab
    router.push({
      path: '/admin/CreateEvent',
      query: {
        tab: 'tickets',
        mode: 'edit',
        id: event.id,
        timestamp: Date.now()
      }
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Setup Failed',
      detail: 'Failed to prepare ticket management',
      life: 3000
    })
  }
}

// Enhanced edit event function with better UUID handling and data flow
const editEvent = async (event) => {
  const eventStore = useEventStore();
  const { getToken } = useAuth();

  try {
    // Verify authentication
    const token = getToken();
    if (!token) {
      toast.add({
        severity: 'error',
        summary: 'Authentication Required',
        detail: 'Please login to continue',
        life: 3000
      });
      router.push('/login');
      return;
    }

    // Enhanced event data validation
    if (!event?.id || !validateUUID(event.id)) {
      toast.add({
        severity: 'error',
        summary: 'Invalid Event',
        detail: 'Cannot edit: Invalid event data or UUID format',
        life: 4000
      });
      return;
    }

    const eventId = event.id.toString();

    // Clear previous state to prevent data mixing
    eventStore.clearCache();
    
    // Store the event ID in session for persistence across navigation
    if (process.client) {
      sessionStorage.setItem('currentEventId', eventId);
      sessionStorage.setItem('editMode', 'true');
      sessionStorage.setItem('editSource', 'event-list');
    }
    
    // Track this event selection for debugging and analytics
    eventStore.trackEventClick(eventId);
    
    // Show enhanced loading state
    toast.add({
      severity: 'info',
      summary: 'Loading Event for Edit',
      detail: `Preparing "${event.name}" for editing...`,
      life: 2000
    });

    // Use the complete original data if available, otherwise use the event data
    const eventDataToStore = event._original || event;
    
    // Ensure we have all required fields for editing
    const completeEventData = {
      ...eventDataToStore,
      // Ensure critical fields are present
      id: eventId,
      name: eventDataToStore.name || event.name,
      category_id: eventDataToStore.category_id || event.category_id,
      category_name: eventDataToStore.category_name || event.category_name,
      location: eventDataToStore.location || event.location,
      start_date: eventDataToStore.start_date || event.start_date,
      end_date: eventDataToStore.end_date || event.end_date,
      description: eventDataToStore.description || event.description,
      is_published: eventDataToStore.is_published !== undefined ? eventDataToStore.is_published : (event.status === 'Active'),
      status: eventDataToStore.status || event.status
    };

    // Set the current event in the store
    eventStore.setCurrentEvent(completeEventData);

    // Verify the event was stored correctly
    if (!eventStore.currentEvent || eventStore.currentEvent.id !== eventId) {
      throw new Error('Failed to store event data correctly in the event store');
    }


    // Navigate to edit view with enhanced parameters
    await router.push({
      path: '/admin/CreateEvent',
      query: {
        mode: 'edit',
        id: eventId,
        ts: Date.now(),
        from: 'event-list',
        action: 'edit'
      }
    });


  } catch (error) {
    
    // Provide more specific error messages
    let errorMessage = 'Failed to prepare event for editing';
    let errorSummary = 'Edit Failed';
    
    if (error.message.includes('store')) {
      errorMessage = 'Failed to load event data into the editor. Please try again.';
      errorSummary = 'Data Loading Error';
    } else if (error.message.includes('navigation')) {
      errorMessage = 'Failed to navigate to the editor. Please try again.';
      errorSummary = 'Navigation Error';
    } else if (error.message) {
      errorMessage = error.message;
    }

    toast.add({
      severity: 'error',
      summary: errorSummary,
      detail: errorMessage,
      life: 4000
    });

    // Clear state on error to prevent corruption
    eventStore.clearCache();
    if (process.client) {
      sessionStorage.removeItem('currentEventId');
      sessionStorage.removeItem('editMode');
      sessionStorage.removeItem('editSource');
    }
  }
}

const endEvent = (event) => {
  toast.add({
    severity: "info",
    summary: "End Event",
    detail: `Ending ${event.name}`,
    life: 3000
  })
}

const removeEvent = async (event) => {
  if (!event?.id) {
    toast.add({
      severity: 'error',
      summary: 'Invalid Event',
      detail: 'Cannot delete: Invalid event data',
      life: 3000
    })
    return
  }

  // Show confirmation dialog
  const confirmed = confirm(`Are you sure you want to delete "${event.name}"? This action cannot be undone.`)
  if (!confirmed) return

  try {
    // Import delete function
    const { deleteEvent } = await import('@/composables/api')
    
    toast.add({
      severity: 'info',
      summary: 'Deleting Event',
      detail: `Deleting "${event.name}"...`,
      life: 2000
    })

    await deleteEvent(event.id)

    // Remove from local events array
    const index = events.value.findIndex(e => e.id === event.id)
    if (index > -1) {
      events.value.splice(index, 1)
      totalItems.value = events.value.length
      updateEventStats(events.value)
    }

    toast.add({
      severity: 'success',
      summary: 'Event Deleted',
      detail: `"${event.name}" has been successfully deleted`,
      life: 4000
    })

  } catch (error) {
    
    let errorMessage = 'Failed to delete event. Please try again.'
    if (error.message.includes('not found')) {
      errorMessage = 'Event not found or already deleted'
    } else if (error.message.includes('permission')) {
      errorMessage = 'You do not have permission to delete this event'
    } else if (error.message.includes('bookings')) {
      errorMessage = 'Cannot delete event with existing bookings'
    } else if (error.message) {
      errorMessage = error.message
    }

    toast.add({
      severity: 'error',
      summary: 'Delete Failed',
      detail: errorMessage,
      life: 5000
    })
  }
}

definePageMeta({
  layout: 'admin',
})
</script>

<style scoped>
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
  background-color: transparent; /* Inherits from tr for consistency */
  color: inherit; /* Inherits text color from tr */
  transition: background-color 0.3s ease; /* Smooth hover transition */
}

:deep(.p-datatable .p-datatable-thead > td:hover) {
  background-color: #6A3ABF; /* Darker purple on hover */
}
/* Updated td styles for row hover */
:deep(.p-datatable .p-datatable-tbody > tr > td) {
  background-color: white; /* Light gray background for td */
  color: #1F2937; /* Dark text color */
  padding-top: 20px;
  padding-bottom: 20px;
}
:deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
  @apply bg-gradient-to-tr from-[#4D66A6] to-[#B61EEB] text-white border-none;
  border-color: linear-gradient(79deg, #4D66A6 7.31%, #B61EEB 98.95%);
  border-radius: 10px;
  color: white;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover > td) {
  background-color: #E6F2FF; /* Slightly darker gray on hover for the entire row */
  transition: background-color 0.3s ease; /* Smooth hover transition */
}
</style>