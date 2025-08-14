<template>
  <div class="p-3 lg:p-4 bg-[#F8F8FF]">
    <div class="mb-4 lg:mb-6">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl lg:text-3xl font-bold text-[#7A49C9]">Event</h1>
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
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      <CardCommon
        v-for="(stat, index) in eventStats"
        :key="index"
        :title="stat.title"
        :count="stat.count"
        :icon="stat.icon"
        :weekChange="stat.weekChange"
      />
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
      />
      <Column
        field="tickets"
        header="Tickets"
        class="text-[12px] text-start border-b border-gray-300"
      />
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
import Calendar from 'primevue/calendar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import Menu from 'primevue/menu'
import CardCommon from '~/components/common/CardCommon.vue'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import { fetchEvents } from '@/composables/api'

const router = useRouter()
const toast = useToast()

const goToCreateEvent = () => { router.push('/admin/CreateEvent') }

const eventStats = [
  { title: 'Total Events', count: '28', icon: 'clarity:event-solid', weekChange: '2' },
  { title: 'Complete Event', count: '23', icon: 'clarity:event-solid-badged', weekChange: '2' },
  { title: 'Ongoing', count: '5', icon: 'mdi:movie-check', weekChange: '2' },
  { title: 'Draft', count: '24', icon: 'mdi:clipboard-text-date', weekChange: '2' },
]

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
    const { status, data } = await fetchEvents()
    console.log('loadEvents response:', { status, data })

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
          console.error('Invalid UUID format for event:', ev)
          return null
        }

        // Log each unique event ID for debugging
        console.log('Processing event:', { 
          id: eventId, 
          name: ev.name,
          category: `${ev.category_id} - ${ev.category_name}`,
          is_published: ev.is_published
        })

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
          revenue: ev.revenue || 0,
          bookings: ev.bookings_count || 0,
          tickets: ev.tickets_count || 0,
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
      console.log('Loaded events:', events.value.map(e => ({ id: e.id, name: e.name })))
      
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
    console.error('Fetch events error:', error)
    toast.add({ 
      severity: 'error', 
      summary: 'Fetch Error', 
      detail: error.message || 'Failed to load events', 
      life: 3000 
    })
  }
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

const actionItems = (event) => [
  {
    label: 'Manage Booking',
    icon: 'pi pi-cog',
    command: () => {
      router.push('/admin/manage-booking')
    },
    visible: event?.status === 'Active',
  },
  {
    label: 'Manage Tickets',
    icon: 'pi pi-ticket',
    command: () => manageTickets(event),
  },
  {
    label: 'Edit Event',
    icon: 'pi pi-pencil',
    command: () => editEvent(event),
  },
  {
    label: 'End Event',
    icon: 'pi pi-times',
    command: () => endEvent(event),
    visible: event?.status === 'Active',
  },
  {
    label: 'Remove',
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
    console.error('Failed to setup ticket management:', error)
    toast.add({
      severity: 'error',
      summary: 'Setup Failed',
      detail: 'Failed to prepare ticket management',
      life: 3000
    })
  }
}

const editEvent = async (event) => {
  const eventStore = useEventStore()

  try {
    // Basic validation
    if (!event?.id) {
      throw new Error('No event ID provided for editing')
    }

    // Use complete original data
    const eventData = event._original || event
    const eventId = eventData.id.toString()
    const eventName = eventData.name || 'Untitled Event'

    // Log complete event data
    console.log('📝 Edit request for complete event:', {
      id: eventId,
      name: eventName,
      category: `${eventData.category_id} - ${eventData.category_name}`,
      fields: Object.keys(eventData)
    })

    console.log('📝 Edit request:', {
      id: eventId,
      name: eventName
    })

    // Pre-edit checks
    // Validate UUID format (8-4-4-4-12)
    if (!eventId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      console.error('❌ Invalid event ID format:', eventId)
      throw new Error('Invalid event ID format. Expected UUID format.')
    }

    // Start fresh - clear all previous state
    console.log('🧹 Clearing previous state...')
    eventStore.clearCurrentEvent()
    eventStore.clearCache()

    // Show loading feedback
    toast.add({
      severity: "info",
      summary: "Loading",
      detail: `Preparing "${eventName}" for editing...`,
      life: 3000
    })

    // Load fresh event data
    console.log('🔄 Loading fresh event data...')
    const loadedEvent = await eventStore.loadEventById(eventId)

    // Validate loaded data
    if (!loadedEvent) {
      throw new Error(`Failed to load event ${eventId}`)
    }

    if (!eventStore.hasCurrentEvent) {
      throw new Error('Event loaded but not set in store')
    }

    const loadedId = loadedEvent.id.toString()
    if (loadedId !== eventId) {
      console.error('Event ID verification failed:', {
        requested: eventId,
        loaded: loadedId
      })
      throw new Error('Event ID mismatch')
    }

    console.log('✅ Event verified:', {
      id: loadedId,
      name: loadedEvent.name
    })

    // Create unique session
    const sessionId = `edit-${eventId}-${Date.now()}`

    // Navigate with all verification data
    console.log('🚀 Navigating to edit view...')
    await router.push({
      path: '/admin/CreateEvent',
      query: {
        mode: 'edit',
        id: eventId,
        session: sessionId,
        name: encodeURIComponent(loadedEvent.name),
        ts: Date.now() // Force fresh page load
      }
    })

  } catch (error) {
    console.error('❌ Edit event error:', error)
    toast.add({
      severity: "error",
      summary: "Edit Failed",
      detail: error.message || 'Failed to prepare event for editing',
      life: 5000
    })
    
    // Clear everything on error
    eventStore.clearCurrentEvent()
    eventStore.clearCache()
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

const removeEvent = (event) => {
  toast.add({
    severity: "info",
    summary: "Remove Event",
    detail: `Removing ${event.name}`,
    life: 3000
  })
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