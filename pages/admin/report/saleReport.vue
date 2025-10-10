<template>
  <div class="p-4 bg-[#F8F8FF] min-h-screen w-full min-w-0 overflow-x-hidden">

    <!-- Sale Report Header -->
    <div class="mb-6 flex items-center justify-between">
     <!-- Breadcrumb -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <Breadcrumb
            :items="[
              { text: 'Report' },
              { text: 'Sale Report' }
            ]"
            class="mb-2"
          />
        </div>
      </div>
    </div>
      <div class="flex gap-2">
        <Button
          label="Export"
          icon="pi pi-download"
          class="bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700"
          @click="exportReport"
        />
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="mb-6 flex items-center justify-between">
      <div class="relative flex-1 max-w-md">
        <Icon name="i-heroicons-magnifying-glass" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search"
          class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-transparent"
        />
      </div>
      <div class="flex items-center space-x-4 ml-4">
        <Dropdown
          v-model="selectedMonth"
          :options="monthOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="October"
          class="w-32 rounded-xl border border-gray-300 bg-[#F5F5F5]"
        />
        <Dropdown
          v-model="selectedYear"
          :options="yearOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="2025"
          class="w-24 rounded-xl border border-gray-300 bg-[#F5F5F5]"
        />
      </div>
    </div>

    <!-- Events Section with Fixed Height Container -->
    <div class="mb-6 h-48">
      <EventCards 
        :events="events"
        :selected-event="selectedEvent"
        :loading="loading"
        @select-event="selectEvent"
        class="h-full"
      />
    </div>

    <!-- Sale Overtime Section -->
    <div class="mb-8 w-full min-w-0">
      <!-- Sale Overtime Header with Controls -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-gray-900">Sale Overtime</h2>
        <div class="flex items-center space-x-4">
          <Dropdown
            v-model="selectedPeriod"
            :options="periodOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Today"
            class="w-32 rounded-full border border-gray-300 bg-white"
          />
          <Button
            label="Filters"
            icon="pi pi-filter"
            class="p-button-outlined text-white border-purple-600 bg-purple-600 hover:bg-purple-600 px-4 py-2 rounded-full"
            @click="toggleOvertimeFilters"
          />
        </div>
      </div>
      
     <div class="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] bg-white rounded-2xl w-full min-w-0">
  <!-- Paid and confirmed -->
  <div class="p-6">
    <div class="mb-6 flex justify-between rounded-lg px-1 py-1 items-center bg-[#F9F7FD] m-auto">
      <h3 class="text-sm font-medium text-gray-900">Paid and confirmed</h3>
      <h3 class="text-md font-bold text-purple-800">
        {{ salesOvertimeData?.summary_paid?.total_booking || 0 }}
      </h3>
    </div>

    <div class="grid grid-cols-3 gap-4">
      <div class="text-start">
        <div class="flex items-center justify-start mb-2">
          <Icon name="material-symbols-light:receipt-rounded" class="w-6 h-6 text-purple-700 mr-1" />
          <span class="text-md font-medium text-purple-700">Bookings</span>
        </div>
        <p class="text-xl ml-5 font-semibold text-gray-900">
          {{ salesOvertimeData?.summary_paid?.total_booking || 0 }}
        </p>
      </div>

      <div class="text-center border-x border-gray-300">
        <div class="flex items-center justify-center mb-2">
          <Icon name="heroicons:ticket-solid" class="w-6 h-6 text-purple-700 mr-1" />
          <span class="text-md font-medium text-purple-700">Tickets</span>
        </div>
        <p class="text-xl font-semibold text-gray-900">
          {{ salesOvertimeData?.summary_paid?.total_ticket || 0 }}
        </p>
      </div>

      <div class="text-end">
        <div class="flex items-center justify-end mb-2">
          <Icon name="tabler:coin-filled" class="w-6 h-6 text-purple-700 mr-1" />
          <span class="text-md font-medium text-purple-700">Revenue</span>
        </div>
        <p class="text-xl font-semibold mr-4 text-gray-900">
          ${{ salesOvertimeData?.summary_paid?.total_revenue || 0 }}
        </p>
      </div>
    </div>
  </div>

  <!-- Divider (custom height and padding) -->
  <div class="hidden lg:flex justify-center items-center">
    <div class="h-[70%] w-px bg-gray-300"></div>
  </div>

  <!-- Pending for cash payment -->
  <div class="p-6">
    <div class="mb-6 flex justify-between rounded-lg px-1 py-1 items-center bg-[#F9F7FD] m-auto">
      <h3 class="text-sm font-medium text-gray-900">Pending for cash payment</h3>
      <h3 class="text-md font-bold text-purple-800">
        {{ salesOvertimeData?.summary_pending?.total_booking || 0 }}
      </h3>
    </div>

    <div class="grid grid-cols-3 gap-4">
      <div class="text-start">
        <div class="flex items-center justify-start mb-2">
          <Icon name="material-symbols-light:receipt-rounded" class="w-6 h-6 text-purple-700 mr-1" />
          <span class="text-md font-medium text-purple-700">Bookings</span>
        </div>
        <p class="text-xl ml-5 font-semibold text-gray-900">
          {{ salesOvertimeData?.summary_pending?.total_booking || 0 }}
        </p>
      </div>

      <div class="text-center border-x border-gray-300">
        <div class="flex items-center justify-center mb-2">
          <Icon name="heroicons:ticket-solid" class="w-6 h-6 text-purple-700 mr-1" />
          <span class="text-md font-medium text-purple-700">Tickets</span>
        </div>
        <p class="text-xl font-semibold text-gray-900">
          {{ salesOvertimeData?.summary_pending?.total_ticket || 0 }}
        </p>
      </div>

      <div class="text-end">
        <div class="flex items-center justify-end mb-2">
          <Icon name="tabler:coin-filled" class="w-6 h-6 text-purple-700 mr-1" />
          <span class="text-md font-medium text-purple-700">Revenue</span>
        </div>
        <p class="text-xl font-semibold mr-4 text-gray-900">
          ${{ salesOvertimeData?.summary_pending?.total_revenue || 0 }}
        </p>
      </div>
    </div>
  </div>
</div>

    </div>

    <!-- List Sale Section -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 w-full min-w-0 overflow-hidden">
      <!-- Header with filters -->
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900">List Sale</h2>
        <!-- Filters and Search -->
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
          {{ searchQuery ? `Filtered: ${totalItems} results` : `Show ${currentPage * itemsPerPage - (itemsPerPage - 1)} to ${Math.min(currentPage * itemsPerPage, totalItems)} of ${totalItems}` }}
        </span>
      </div>
      </div>

      <!-- Data Table -->
      <div class="overflow-x-auto overflow-y-hidden">
        <DataTable 
          :value="salesData" 
          :paginator="true" 
          :rows="itemsPerPage"
          :totalRecords="totalRecords"
          class="p-datatable-gridlines min-w-full"
          scrollable 
          responsiveLayout="scroll"
          scrollHeight="flex"
        >
                    <Column field="bookingName" header="Booking name" sortable class="text-[12px] text-start border-b border-gray-300">
            <template #body="slotProps">
              <div class="py-2">
                <p class="font-medium text-gray-900">{{ slotProps.data.name }}</p>
                <p class="text-xs text-gray-500">{{ slotProps.data.phone }}</p>
              </div>
            </template>
          </Column>
          
          <Column field="bookingRefNo" header="Booking Ref.No." class="text-[12px] text-start border-b border-gray-300">
            <template #body="slotProps">
              <span class="text-gray-700">{{ slotProps.data.bookingRefNo }}</span>
            </template>
          </Column>
          
          <Column field="purchaseDate" header="Purchase Date" sortable class="text-[12px] text-start border-b border-gray-300">
            <template #body="slotProps">
              <span class="text-gray-700">{{ slotProps.data.purchaseDate }}</span>
            </template>
          </Column>
          
          <Column field="noTicket" header="No.Ticket" class="text-[12px] text-start border-b border-gray-300">
            <template #body="slotProps">
              <span class="text-gray-700">{{ slotProps.data.noTicket }}</span>
            </template>
          </Column>
          
          <Column field="typeTicket" header="Type of Ticket" class="text-[12px] text-start border-b border-gray-300">
            <template #body="slotProps">
              <div class="flex flex-wrap gap-1">
                <span 
                  v-for="ticketType in getTicketTypes(slotProps.data.typeTicket)" 
                  :key="ticketType"
                  :class="getTicketTypeClass(ticketType)"
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ ticketType }}
                </span>
              </div>
            </template>
          </Column>
          
          <Column field="payment" header="Payment" class="text-[12px] text-start border-b border-gray-300">
            <template #body="slotProps">
              <span class="text-gray-700">{{ slotProps.data.payment }}</span>
            </template>
          </Column>
          
          <Column field="amount" header="Amount(USD)" class="text-[12px] text-start border-b border-gray-300">
            <template #body="slotProps">
              <span class="font-medium text-gray-900">${{ slotProps.data.amount }}</span>
            </template>
          </Column>
          
         <Column
  field="status"
  header="Status"
  class="text-[12px] text-start border-b border-gray-300"
>
  <template #body="slotProps">
    <div class="flex items-center">
      <span
        :class="[
          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
          getStatusClass(slotProps.data.status)
        ]"
      >
        <Icon
          name="radix-icons:dot-filled"
          class="w-4 h-4"
        />
        {{ slotProps.data.status }}
      </span>
    </div>
  </template>
</Column>

          
          <Column header="Actions" class="text-[12px] text-start border-b border-gray-300">
            <template #body="slotProps">
              <Button
                class="p-button p-component p-button-icon-only p-button-text"
                @click="toggleMenu($event, slotProps.data)"
                aria-haspopup="true"
                aria-controls="overlay_menu"
              >
                <Icon name="lucide:more-vertical" class="h-5 w-5 text-gray-500" />
              </Button>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import EventCards from '~/components/common/EventCards.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import Dropdown from 'primevue/dropdown'
import { useToast } from 'primevue/usetoast'
import { useRoute } from 'vue-router'
import { fetchEvents, fetchSalesOvertimeReport, fetchSalesReportList } from '~/composables/api.js'
import poster from "@/assets/image/poster-manage-booking.png"
const toast = useToast()

// Data
const itemsPerPage = ref(10)
const totalRecords = ref(0)
const searchQuery = ref('')
const selectedMonth = ref('October')
const selectedYear = ref('2025')
const selectedPeriod = ref('Today')

// New reactive data for events and sales
const events = ref([])
const selectedEvent = ref(null)
const salesOvertimeData = ref(null)
const salesListData = ref([])
const currentPage = ref(1)
const loading = ref(false)
const sortOption = ref('')
const totalItems = ref(0)

// Dropdown options
const periodOptions = ref([
  { label: 'Today', value: 'Today' },
  { label: 'Yesterday', value: 'Yesterday' },
  { label: 'This Week', value: 'This Week' },
  { label: 'Last Week', value: 'Last Week' },
  { label: 'This Month', value: 'This Month' },
  { label: 'Last Month', value: 'Last Month' }
])

const monthOptions = ref([
  { label: 'January', value: 'January' },
  { label: 'February', value: 'February' },
  { label: 'March', value: 'March' },
  { label: 'April', value: 'April' },
  { label: 'May', value: 'May' },
  { label: 'June', value: 'June' },
  { label: 'July', value: 'July' },
  { label: 'August', value: 'August' },
  { label: 'September', value: 'September' },
  { label: 'October', value: 'October' },
  { label: 'November', value: 'November' },
  { label: 'December', value: 'December' }
])

const yearOptions = ref([
  { label: '2023', value: '2023' },
  { label: '2024', value: '2024' },
  { label: '2025', value: '2025' },
  { label: '2026', value: '2026' }
])

// Sort and pagination options
const sortOptions = ref([
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Highest Amount', value: 'amount_desc' },
  { label: 'Lowest Amount', value: 'amount_asc' }
])

const pageOptions = ref([
  { label: '10', value: 10 },
  { label: '25', value: 25 },
  { label: '50', value: 50 },
  { label: '100', value: 100 }
])

// Computed property for transformed sales data
const salesData = computed(() => {
  return salesListData.value.map(item => ({
    id: item.id,
    name: item.customer_name,
    phone: item.customer_phone_number || item.customer_email,
    bookingRefNo: item.order_number,
    purchaseDate: formatDate(item.created_at),
    noTicket: item.total_ticket,
    typeTicket: item.ticket_types?.join(', ') || '-',
    payment: formatPaymentMethod(item.payment_method),
    amount: item.total_amount,
    status: item.status.toUpperCase()
  }))
})

// Methods
const loadEvents = async () => {
  try {
    loading.value = true
    
    const response = await fetchEvents()
    
    // Handle different possible response structures
    let eventData = []
    if (response && response.data && response.data.success) {
      // Response structure: { data: { success: true, data: [...] } }
      eventData = response.data.data || []
    } else if (response && response.success) {
      // Response structure: { success: true, data: [...] }
      eventData = response.data || []
    } else if (response && Array.isArray(response)) {
      // Response structure: [...]
      eventData = response
    } else if (response && response.data && Array.isArray(response.data)) {
      // Response structure: { data: [...] }
      eventData = response.data
    }
    
    events.value = eventData
    
    // Select first event by default if available
    if (events.value.length > 0 && !selectedEvent.value) {
      selectEvent(events.value[0])
    }
    
    if (events.value.length === 0) {
      toast.add({
        severity: 'info',
        summary: 'No Events',
        detail: 'No events found in your account',
        life: 3000
      })
    }
  } catch (error) {
    console.error('❌ Error loading events:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `Failed to load events: ${error.message}`,
      life: 5000
    })
  } finally {
    loading.value = false
  }
}

const selectEvent = async (event) => {
  selectedEvent.value = event
  await Promise.all([
    loadSalesOvertimeData(event.id),
    loadSalesListData(event.id)
  ])
}

const loadSalesOvertimeData = async (eventId) => {
  try {
    const response = await fetchSalesOvertimeReport(eventId)
    if (response && response.success) {
      salesOvertimeData.value = response.data
    }
  } catch (error) {
    console.error('Error loading sales overtime data:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load sales overtime data',
      life: 3000
    })
  }
}

const loadSalesListData = async (eventId, page = 1) => {
  try {
    loading.value = true
    const response = await fetchSalesReportList(eventId, page, itemsPerPage.value)
    if (response && response.success) {
      salesListData.value = response.data.items || []
      totalRecords.value = response.data.paginate?.total || 0
      totalItems.value = response.data.paginate?.total || 0
      currentPage.value = response.data.paginate?.current_page || 1
    }
  } catch (error) {
    console.error('Error loading sales list data:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load sales list data',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const exportReport = () => {
  if (!selectedEvent.value) {
    toast.add({
      severity: 'warn',
      summary: 'Warning',
      detail: 'Please select an event first',
      life: 3000
    })
    return
  }
  
  toast.add({ 
    severity: 'info', 
    summary: 'Export Report', 
    detail: `Sale report for ${selectedEvent.value.name} exported successfully`, 
    life: 3000 
  })
}

const toggleFilters = () => {
  toast.add({ 
    severity: 'info', 
    summary: 'Filters', 
    detail: 'Filter panel toggled', 
    life: 3000 
  })
}

const toggleOvertimeFilters = () => {
  toast.add({ 
    severity: 'info', 
    summary: 'Overtime Filters', 
    detail: 'Sale overtime filters toggled', 
    life: 3000 
  })
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return dateString
  }
}



const formatPaymentMethod = (method) => {
  const methodMap = {
    'offline': 'Cash',
    'abapay': 'ABA Bank',
    'cash': 'Cash'
  }
  return methodMap[method] || method
}

const getStatusClass = (status) => {
  switch (status?.toUpperCase()) {
    case 'COMPLETED':
    case 'PAID':
      return 'bg-green-50 text-green-800'
    case 'PENDING':
      return 'bg-yellow-50 text-yellow-800'
    case 'CANCELED':
    case 'FAILED':
      return 'bg-red-50 text-red-800'
    default:
      return 'bg-gray-50 text-gray-800'
  }
}

const getTicketTypes = (typeTicketString) => {
  if (!typeTicketString || typeTicketString === '-') return []
  return typeTicketString.split(', ').map(type => type.trim()).filter(type => type.length > 0)
}

const getTicketTypeClass = (ticketType) => {
  const type = ticketType.toLowerCase()
  switch (type) {
    case 'premium':
      return 'bg-purple-100 text-purple-800'
    case 'executive':
      return 'bg-purple-100 text-purple-800'
    case 'normal':
    case 'standard':
      return 'bg-purple-100 text-purple-800'
    case 'vip':
      return 'bg-purple-100 text-purple-800'
    case 'early bird':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-purple-100 text-purple-800'
  }
}

const applySort = () => {
  if (selectedEvent.value) {
    loadSalesListData(selectedEvent.value.id, currentPage.value)
  }
}

const applyPageChange = () => {
  currentPage.value = 1
  if (selectedEvent.value) {
    loadSalesListData(selectedEvent.value.id, 1)
  }
}

const toggleMenu = (event, data) => {
  toast.add({ 
    severity: 'info', 
    summary: 'Menu', 
    detail: `Menu opened for ${data.name}`, 
    life: 3000 
  })
}

// Watch for pagination changes
watch([currentPage, itemsPerPage], () => {
  if (selectedEvent.value) {
    loadSalesListData(selectedEvent.value.id, currentPage.value)
  }
})

// Load events on component mount
onMounted(async () => {
  // Get eventId from URL query parameters
  const route = useRoute()
  const eventIdFromUrl = route.query.eventId
    
  // Load events first
  await loadEvents()
  
  // If eventId is provided in URL, select that event
  if (eventIdFromUrl && events.value.length > 0) {
    const targetEvent = events.value.find(event => event.id.toString() === eventIdFromUrl.toString())
    if (targetEvent) {
      await selectEvent(targetEvent)
      
      toast.add({
        severity: 'success',
        summary: 'Event Selected',
        detail: `Viewing report for: ${targetEvent.name}`,
        life: 3000
      })
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Event Not Found',
        detail: 'The requested event was not found',
        life: 3000
      })
    }
  }
})

definePageMeta({
  layout: "admin",
})
</script>

<style scoped>
/* DataTable styling to match project theme */
:deep(.p-datatable .p-datatable-thead > tr) {
  background-color: #F6F9F9;
  color: #667085;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: transparent;
  color: inherit;
  transition: background-color 0.3s ease;
  padding-top: 1rem;
  padding-bottom: 1rem;
  font-weight: 600;
  font-size: 12px;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  background-color: white;
  color: #1F2937;
  padding-top: 20px;
  padding-bottom: 20px;
  font-size: 12px;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover > td) {
  background-color: #E6F2FF;
  transition: background-color 0.3s ease;
}

/* Button styling */
:deep(.p-button-outlined) {
  border-width: 1px;
  border-style: solid;
}



/* Search and filter styling */
.input-search {
  @apply w-full pl-12 pr-4 py-3 border-0 rounded-none focus:ring-0 focus:border-0;
  background: transparent;
  outline: none;
}

/* .select-standard {
  @apply border border-gray-300 my-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white;
} */




/* Layout Protection Styles */
.layout-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
}

.section-container {
  flex-shrink: 0;
  width: 100%;
  min-width: 0;
}

.data-table-container {
  min-width: 800px; /* Ensure minimum table width */
}

/* Keep only non-event related scrollbar utilities */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

/* DataTable responsive protection */
:deep(.p-datatable-wrapper) {
  min-width: 100%;
  overflow-x: auto;
}

:deep(.p-datatable-table) {
  min-width: 800px;
}
</style>
