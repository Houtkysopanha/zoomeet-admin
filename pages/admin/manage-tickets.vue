<template>
  <div class="p-4 bg-[#F8F8FF] ">
    <div class="mb-6 mt-2">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl text-gray-500 mb-2">Event / Manage Booking /<span class="text-[#7A49C9] font-bold"> Manage Tickets</span></h1>
        </div>
        <div class="date-range-picker flex space-x-4 items-center">
          <!-- Date range picker or other buttons can go here -->
        </div>
      </div>
    </div>

    <!-- Event Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
      <EventCard
        :image-src="poster"
        alt-text="Cybersecurity Event 2025"
        event-title="Cybersecurity Summit 2025"
        owner="John Doe"
        location="Sokha Hotel, Phnom Penh"
        date="20-22 August, 2025"
        time="9:00 AM GMT+7"
      />
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        <CardCommon
          v-for="(stat, index) in eventStats"
          :key="index"
          :title="stat.title"
          :count="stat.count"
          :icon="stat.icon"
          :weekChange="stat.weekChange"
        />
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="mb-6 flex items-center justify-between mt-10 rounded-lg">
      <div class="flex items-center space-x-4">
        <div class="relative w-full">
          <div class="border border-gray-300 rounded-full overflow-hidden flex">
            <div class="relative flex-1">
              <Icon name="i-heroicons-magnifying-glass" class="absolute w-8 h-8 left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search"
                class="w-full pl-14 border-0 focus:ring-0 focus:outline-none bg-transparent p-3 rounded-full"
              />
            </div>
            <div class="relative space-x-5">
              <Icon name="mynaui:filter" class="absolute w-8 h-8 left-3 top-1/2 bg-gradient-to-t from-blue-900 to-purple-800 transform -translate-y-1/2 text-grad" />
              <Button
                label="Filters"
                class="p-button-outlined px-5 p-button-purple text-purple-600 border-purple-600 w-full h-full rounded-none p-3"
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
              <span v-if="slotProps.value" class="">{{ sortOptions.find(opt => opt.value === slotProps.value)?.label || slotProps.value }}</span>
              <span v-else class="ml-14 text-black">Sort</span>
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
        <span class="text-lg text-gray-700 border-l pl-2 border-gray-500"> Show {{ currentPage * itemsPerPage - (itemsPerPage - 1) }} to {{ Math.min(currentPage * itemsPerPage, totalItems) }} of {{ totalItems }}</span>
      </div>
    </div>

    <!-- Enhanced Responsive Table with Loading -->
    <TableLoader
      :loading="isLoading"
      text="Loading tickets..."
      size="md"
      :showSkeleton="!filteredEvents.length"
      :skeletonRows="itemsPerPage"
      :skeletonHeaders="[
        { width: 'col-span-2' }, // Booking Ref
        { width: 'col-span-2' }, // Ticket ID
        { width: 'col-span-2' }, // Ticket Holder
        { width: 'col-span-2' }, // Phone/Email
        { width: 'col-span-1' }, // Price
        { width: 'col-span-1' }, // Check-in
        { width: 'col-span-2' }, // Actions
      ]"
    >
      <div class="table-responsive bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <DataTable
            :value="filteredEvents"
            :paginator="true"
            :rows="itemsPerPage"
            :totalRecords="totalItems"
            :lazy="true"
            @page="onPage"
            :sortField="sortField"
            :sortOrder="sortOrder"
            class="p-datatable-sm min-w-full"
          >
      <!-- Booking Reference -->
      <Column field="bookingRefNo" header="Booking Ref. No." class="text-[12px] test-start border-b border-gray-300" />
      <!-- Ticket ID -->
      <Column field="name" header="Ticket ID" sortable class="text-[12px] test-start border-b border-gray-300">
        <template #body="slotProps">
          <div class="text-gray-900 font-bold">
            {{ slotProps.data.name }}
          </div>
        </template>
      </Column>
      <!-- Ticket Holder -->
      <Column field="phonenumber" header="Tickets Holder" sortable class="text-[12px] test-start border-b border-gray-300">
        <template #body="slotProps">
          <span>{{ slotProps.data.phonenumber }}</span>
        </template>
      </Column>
      <!-- Phone Number -->
      <Column field="phonenumber" header="Phone Number" class="text-[12px] test-start border-b border-gray-300" />
      <!-- Email -->
      <Column field="email" header="Email" sortable class="text-[12px] test-start border-b border-gray-300">
        <template #body="slotProps">
          <span>{{ slotProps.data.email }}</span>
        </template>
      </Column>
      <!-- Purchase Date (formerly Assign by) -->
      <Column field="nameAssign" header="Assign by" sortable class="text-[12px] test-start border-b border-gray-300">
        <template #body="slotProps">
          <span>{{slotProps.data.nameAssign }}</span>
        </template>
      </Column>

      <!-- No. Tickets (formerly Assign Date) -->
      <Column field="purchaseDate" header="Assign Date" sortable class="text-[12px] test-start border-b border-gray-300">
        <template #body="slotProps">
          <span>{{ slotProps.data.purchaseDate }}</span>
        </template>
      </Column>
      <!-- Type Ticket -->
      <Column field="paymentMethod" header="Type Ticket" class="text-[12px] text-start border-b border-gray-300">
        <template #body="slotProps">
          <span>{{ slotProps.data.paymentMethod }}</span>
        </template>
      </Column>
      <!-- Price -->
      <Column field="revenue" header="Price" class="text-[12px] test-start border-b border-gray-300">
        <template #body="slotProps">
          <span>{{ formatCurrency(slotProps.data.revenue) }}</span>
        </template>
      </Column>
      <!-- Check-in Status -->
      <Column field="status" header="Check-in" class="text-[12px] border-b border-gray-300">
        <template #body="slotProps">
          <span :class="getStatusClass(slotProps.data.status)">
            {{ slotProps.data.status }}
          </span>
        </template>
      </Column>
          </DataTable>
        </div>
      </div>
    </TableLoader>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Button from 'primevue/button'
import EventCard from '~/components/common/EventCard.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import CardCommon from '~/components/common/CardCommon.vue'
import TableLoader from '~/components/ui/TableLoader.vue'
import { useToast } from 'primevue/usetoast'
import { useRouter, useRoute } from 'vue-router'
import poster from '@/assets/image/poster-manage-booking.png'
import '#imports'
import { fetchEventTickets, getTicketStats } from '~/composables/api/tickets'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const getEventId = () => {
  // Try getting from route first
  const routeId = route.params.eventId || route.query.eventId
  if (routeId) {
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentEventId', routeId.toString())
      console.log('✅ Stored event ID in localStorage:', routeId)
    }
    return routeId.toString()
  }

  // Then try localStorage
  if (typeof window !== 'undefined') {
    const storedId = localStorage.getItem('currentEventId') || localStorage.getItem('editEventId')
    if (storedId) {
      console.log('📦 Found event ID in localStorage:', storedId)
      // If we found it in localStorage but not in the URL, update the URL
      router.replace({ query: { ...route.query, eventId: storedId }})
      return storedId
    }
  }

  console.warn('❌ No event ID found in route or localStorage')
  return null
}

// Create ref for event ID with initial value from query or localStorage
const eventId = ref(null)

// Initialize component
onMounted(async () => {
  // Try to get event ID from multiple sources in order of preference
  const queryId = route.query.eventId
  const storedId = localStorage.getItem('currentEventId')
  
  console.log('🔍 Checking event ID sources:', {
    queryId,
    storedId,
    routeParams: route.params
  })
  
  if (queryId) {
    // Use query parameter if available
    console.log('✅ Using event ID from URL:', queryId)
    eventId.value = queryId.toString()
    localStorage.setItem('currentEventId', queryId.toString())
  } else if (storedId) {
    // Use localStorage if available and update URL
    console.log('📦 Using event ID from localStorage:', storedId)
    eventId.value = storedId
    await router.replace({
      query: { ...route.query, eventId: storedId }
    })
  } else {
    // No event ID found
    console.warn('⚠️ No event ID found')
    toast.add({
      severity: 'warn',
      summary: 'No Event Selected',
      detail: 'Please select an event to view tickets',
      life: 5000
    })
    router.push('/admin/event')
    return
  }

  // Verify we have a valid event ID
  if (!eventId.value) {
    console.error('❌ Invalid event ID state after initialization')
    router.push('/admin/event')
    return
  }

  // Load tickets data
  try {
    await fetchTicketsData()
  } catch (error) {
    console.error('❌ Failed to load initial ticket data:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load ticket data. Please try again.',
      life: 5000
    })
  }
})

// Watch for route changes to update eventId
watch(
  () => route.query.eventId,
  async (newEventId, oldEventId) => {
    console.log('🔄 Route eventId changed:', { newEventId, oldEventId })
    
    if (newEventId) {
      // Update both the ref and localStorage
      eventId.value = newEventId.toString()
      localStorage.setItem('currentEventId', newEventId.toString())
      
      // Load the data
      await fetchTicketsData()
    } else if (localStorage.getItem('currentEventId')) {
      // If URL lost the eventId but we have one in localStorage, restore it
      const storedId = localStorage.getItem('currentEventId')
      router.replace({ query: { ...route.query, eventId: storedId }})
    } else {
      // No event ID anywhere, redirect to events page
      console.warn('⚠️ No event ID available')
      toast.add({
        severity: 'warn',
        summary: 'No Event Selected',
        detail: 'Please select an event to view tickets',
        life: 5000
      })
      router.push('/admin/event')
    }
  },
  { immediate: true }
)

// Loading state for table data
const isLoading = ref(false)

// API Data
const ticketData = ref(null)
const ticketTypes = ref([])
const organizers = ref([])
const tickets = ref([])

// Stats data
const eventStats = ref([
  { title: 'Check-Ins', count: '0', icon: 'majesticons:ticket', weekChange: '0' },
  { title: 'Available Ticket', count: '0', icon: 'f7:tickets-fill', weekChange: '0' },
  { title: 'Complete Register', count: '0', icon: 'ix:user-success-filled', weekChange: '0' },
  { title: 'Unregistered', count: '0', icon: 'mingcute:user-x-fill', weekChange: '0' },
])

// Table controls
const searchQuery = ref('')
const sortOption = ref('Sort')
const itemsPerPage = ref(10)
const currentPage = ref(1)
const totalItems = ref(0)

const sortField = ref('created_at')
const sortOrder = ref(-1) // Default to descending

const sortOptions = ref([
  { label: 'Date (Ascending)', value: 'created_at-asc' },
  { label: 'Date (Descending)', value: 'created_at-desc' },
  { label: 'Name (A-Z)', value: 'name-asc' },
  { label: 'Name (Z-A)', value: 'name-desc' },
  { label: 'Price (Low to High)', value: 'price-asc' },
  { label: 'Price (High to Low)', value: 'price-desc' },
])

const pageOptions = ref([
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '50', value: 50 },
])

// Fetch tickets data
const fetchTicketsData = async () => {
  // Get current state for debugging
  const currentState = {
    refEventId: eventId.value,
    queryEventId: route.query.eventId,
    localStorageEventId: localStorage.getItem('currentEventId')
  }
  console.log('🎫 Attempting to fetch tickets. Current state:', currentState)
  
  // Validate event ID
  if (!eventId.value) {
    // Try each source in order of preference
    const sources = [
      { type: 'URL', id: route.query.eventId },
      { type: 'localStorage', id: localStorage.getItem('currentEventId') },
      { type: 'editEvent', id: localStorage.getItem('editEventId') }
    ]
    
    // Find first valid source
    const validSource = sources.find(source => source.id)
    
    if (validSource) {
      console.log(`📦 Using event ID from ${validSource.type}:`, validSource.id)
      eventId.value = validSource.id.toString()
      
      // Sync to localStorage if not already there
      if (localStorage.getItem('currentEventId') !== eventId.value) {
        localStorage.setItem('currentEventId', eventId.value)
      }
      
      // Sync to URL if not already there
      if (route.query.eventId !== eventId.value) {
        await router.replace({
          query: { ...route.query, eventId: eventId.value }
        })
      }
    } else {
      console.error('❌ No event ID available from any source:', sources)
      toast.add({
        severity: 'error',
        summary: 'No Event Selected',
        detail: 'Please select an event first',
        life: 5000
      })
      router.push('/admin/event')
      return
    }
  }
  
  // Double-check we have an event ID before proceeding
  if (!eventId.value) {
    console.error('❌ Event ID still not available after fallback checks')
    return
  }

  isLoading.value = true
  
  try {
    console.log('🎫 Fetching tickets for event:', eventId.value)
    
    const response = await fetchEventTickets(eventId.value, {
      page: currentPage.value,
      per_page: itemsPerPage.value,
      search: searchQuery.value,
      sort_field: sortField.value,
      sort_order: sortOrder.value === 1 ? 'asc' : 'desc'
    })

    console.log('✅ Tickets data received:', response)

    if (response && response.success && response.data) {
      ticketData.value = response.data
      ticketTypes.value = response.data.ticket_types || []
      organizers.value = response.data.organizers || []
      
      // Transform ticket types data to match your table structure
      tickets.value = ticketTypes.value.map(ticketType => ({
        id: ticketType.id,
        name: ticketType.name,
        ticketId: ticketType.id,
        bookingRefNo: `TKT-${ticketType.id.substring(0, 8).toUpperCase()}`,
        phonenumber: organizers.value[0]?.phone_number || 'N/A',
        email: organizers.value[0]?.email || 'N/A',
        purchaseDate: new Date(ticketType.created_at).toLocaleDateString(),
        nameAssign: organizers.value[0]?.name || 'System',
        paymentMethod: ticketType.name, // Using ticket type name as payment method for now
        revenue: ticketType.price,
        refund: 'No',
        status: ticketType.is_active ? 'Active' : 'Inactive',
        inventory: ticketType.inventory,
        total: ticketType.inventory?.total || 0,
        sold: ticketType.inventory?.sold || 0,
        reserved: ticketType.inventory?.reserved || 0,
        available: (ticketType.inventory?.total || 0) - (ticketType.inventory?.sold || 0) - (ticketType.inventory?.reserved || 0)
      }))

      totalItems.value = tickets.value.length

      // Update stats based on ticket data
      updateEventStats()
    }
  } catch (error) {
    console.error('❌ Failed to fetch tickets:', error)
    let errorDetail = 'Failed to fetch tickets data'
    let errorSummary = 'Error'

    if (error.message) {
      errorDetail = error.message
      if (error.message.includes('Authentication required')) {
        errorSummary = 'Authentication Error'
        errorDetail = 'Please login again to continue.'
        // Redirect to login
        router.push('/login')
      } else if (error.message.includes('Event not found')) {
        errorSummary = 'Event Not Found'
        errorDetail = 'The event could not be found or has no tickets.'
      }
    }

    toast.add({
      severity: 'error',
      summary: errorSummary,
      detail: errorDetail,
      life: 5000
    })
  } finally {
    isLoading.value = false
  }
}

// Update event stats based on ticket data
const updateEventStats = () => {
  if (!tickets.value.length) return

  const totalTickets = tickets.value.reduce((sum, ticket) => sum + ticket.total, 0)
  const soldTickets = tickets.value.reduce((sum, ticket) => sum + ticket.sold, 0)
  const reservedTickets = tickets.value.reduce((sum, ticket) => sum + ticket.reserved, 0)
  const availableTickets = tickets.value.reduce((sum, ticket) => sum + ticket.available, 0)

  eventStats.value = [
    { title: 'Check-Ins', count: soldTickets.toString(), icon: 'majesticons:ticket', weekChange: '0' },
    { title: 'Available Ticket', count: availableTickets.toString(), icon: 'f7:tickets-fill', weekChange: '0' },
    { title: 'Complete Register', count: soldTickets.toString(), icon: 'ix:user-success-filled', weekChange: '0' },
    { title: 'Unregistered', count: reservedTickets.toString(), icon: 'mingcute:user-x-fill', weekChange: '0' },
  ]
}

// Apply sorting
const applySort = () => {
  if (sortOption.value === 'Sort') return
  
  const [field, order] = sortOption.value.split('-')
  sortField.value = field
  sortOrder.value = order === 'asc' ? 1 : -1
  currentPage.value = 1
  fetchTicketsData()
}

// Apply page change
const applyPageChange = () => {
  currentPage.value = 1
  fetchTicketsData()
}

// Computed filtered events (for local filtering if needed)
const filteredEvents = computed(() => {
  let result = [...tickets.value]

  if (searchQuery.value) {
    result = result.filter(ticket =>
      ticket.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      ticket.bookingRefNo.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      ticket.phonenumber.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      ticket.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  return result
})

// Handle pagination
const onPage = (event) => {
  currentPage.value = event.page + 1
  fetchTicketsData()
}

// Utility functions
const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
const formatCurrency = (value) => `${value.toLocaleString()}`

const getStatusClass = (status) => {
  const classes = {
    'Active': 'bg-green-100 text-green-800 px-2 py-1 rounded-full',
    'Inactive': 'bg-red-100 text-red-800 px-2 py-1 rounded-full',
    'Check-in': 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full',
    'Not Check-in': 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full'
  }
  return classes[status] || 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full'
}

const toggleFilters = () => {
  toast.add({ severity: 'info', summary: 'Filters', detail: 'Filter functionality to be implemented', life: 3000 })
}

// Watch for search query changes
watch(searchQuery, () => {
  // Debounce search
  clearTimeout(searchQuery.debounceTimer)
  searchQuery.debounceTimer = setTimeout(() => {
    currentPage.value = 1
    fetchTicketsData()
  }, 500)
})

// Watch for event ID changes
watch(eventId, (newId) => {
  if (newId) {
    fetchTicketsData()
  }
})

// Lifecycle
onMounted(() => {
  const queryId = route.query.eventId
  const storedId = localStorage.getItem('currentEventId')
  
  // If no ID in query params but we have one in localStorage
  if (!queryId && storedId) {
    console.log('📦 Restoring event ID from localStorage:', storedId)
    router.replace({ query: { ...route.query, eventId: storedId }})
    // The watch handler will take care of loading the data
    return
  }
  
  // If no ID is found anywhere, redirect to events page
  if (!queryId && !storedId) {
    console.warn('⚠️ No event ID found')
    toast.add({
      severity: 'warn',
      summary: 'No Event Selected',
      detail: 'Please select an event to view tickets',
      life: 5000
    })
    router.push('/admin/event')
  }
  
  // If we have queryId, the watch handler will load the data
})

definePageMeta({
  layout: "admin",
})
</script>

<style scoped>
:deep(.p-inputtext) {
  background: transparent !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}
:deep(.p-inputtext:focus) {
  outline: none !important;
  box-shadow: none !important;
  border: none !important;
}
:deep(.p-datatable .p-datatable-thead > tr) {
  background-color: #F6F9F9; /* Custom header background color */
  color: #667085; /* Custom text color */
}
:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: transparent; /* Inherits from tr for consistency */
  color: inherit; /* Inherits text color from tr */
  transition: background-color 0.3s ease; /* Smooth hover transition */
}
:deep(.p-datatable .p-datatable-tbody > tr > td) {
  background-color: white; /* Light gray background for td */
  color: #1F2937; /* Dark text color */
  padding-top: 20px;
  padding-bottom: 20px;
}
:deep(.p-datatable .p-datatable-tbody > tr:hover > td) {
  background-color: #E6F2FF; /* Slightly lighter blue on hover for the entire row */
  transition: background-color 0.3s ease; /* Smooth hover transition */
}
:deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
  @apply bg-gradient-to-tr from-[#4D66A6] to-[#B61EEB] text-white border-none;
  border-color: linear-gradient(79deg, #4D66A6 7.31%, #B61EEB 98.95%);
  border-radius: 10px;
  color: white;
}
</style>
