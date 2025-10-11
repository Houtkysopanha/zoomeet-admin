<template>
  <div class="p-3 sm:p-4 lg:p-6 bg-[#F8F8FF] min-h-screen w-full max-w-none">

    <!-- Sale Report Header -->
    <div class="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
     <!-- Breadcrumb -->
      <div>
        <Breadcrumb
          :items="[
            { text: 'Report' },
            { text: 'Sale Report' }
          ]"
          class="mb-2"
        />
      </div>
      
      <div class="flex gap-2">
        <Button
          label="Export"
          icon="pi pi-download"
          class="bg-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-purple-700 text-sm sm:text-base"
          @click="exportReport"
        />
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="mb-4 sm:mb-6 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-0 lg:justify-between">
      <div class="relative flex-1 max-w-none lg:max-w-md">
        <Icon name="i-heroicons-magnifying-glass" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 sm:w-5 h-4 sm:h-5" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search"
          class="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-transparent text-sm sm:text-base"
        />
      </div>
      <div class="flex items-center gap-3 sm:gap-4 lg:ml-4">
        <Dropdown
          v-model="selectedMonth"
          :options="monthOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="October"
          class="w-28 sm:w-32 rounded-xl border border-gray-300 bg-[#F5F5F5] text-sm"
        />
        <Dropdown
          v-model="selectedYear"
          :options="yearOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="2025"
          class="w-20 sm:w-24 rounded-xl border border-gray-300 bg-[#F5F5F5] text-sm"
        />
      </div>
    </div>

    <!-- Events Section with Fixed Height Container -->
    <div class="mb-4 sm:mb-6 h-40 sm:h-48 w-full overflow-hidden">
      <EventCards 
        :events="events"
        :selected-event="selectedEvent"
        :loading="loading"
        @select-event="selectEvent"
        class="h-full"
      />
    </div>

    <!-- Sale Overtime Section -->
    <div class="mb-6 sm:mb-8 w-full min-w-0">
      <!-- Sale Overtime Header with Controls -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
        <h2 class="text-lg sm:text-xl font-semibold text-gray-900">Sale Overtime</h2>
        <div class="flex items-center gap-3 sm:gap-4">
          <Dropdown
            v-model="selectedPeriod"
            :options="periodOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Today"
            class="w-28 sm:w-32 rounded-full border border-gray-300 bg-white text-sm"
          />
          <Button
            label="Filters"
            icon="pi pi-filter"
            class="p-button-outlined text-white border-purple-600 bg-purple-600 hover:bg-purple-600 px-3 sm:px-4 py-2 rounded-full text-sm"
            @click="toggleOvertimeFilters"
          />
        </div>
      </div>
      
     <div class="grid grid-cols-1 xl:grid-cols-[1fr_auto_1fr] bg-white rounded-2xl w-full min-w-0 overflow-hidden">
  <!-- Paid and confirmed -->
  <div class="p-4 sm:p-6">
    <div class="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:justify-between rounded-lg px-2 sm:px-1 py-2 sm:py-1 items-start sm:items-center bg-[#F9F7FD] m-auto gap-2 sm:gap-0">
      <h3 class="text-xs sm:text-sm font-medium text-gray-900">Paid and confirmed</h3>
      <h3 class="text-sm sm:text-md font-bold text-purple-800">
        {{ salesOvertimeData?.summary_paid?.total_booking || 0 }}
      </h3>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      <div class="text-start">
        <div class="flex items-center justify-start mb-2">
          <Icon name="material-symbols-light:receipt-rounded" class="w-5 sm:w-6 h-5 sm:h-6 text-purple-700 mr-1" />
          <span class="text-sm sm:text-md font-medium text-purple-700">Bookings</span>
        </div>
        <p class="text-lg sm:text-xl ml-0 sm:ml-5 font-semibold text-gray-900">
          {{ salesOvertimeData?.summary_paid?.total_booking || 0 }}
        </p>
      </div>

      <div class="text-start sm:text-center sm:border-x border-gray-300 sm:px-2">
        <div class="flex items-center justify-start sm:justify-center mb-2">
          <Icon name="heroicons:ticket-solid" class="w-5 sm:w-6 h-5 sm:h-6 text-purple-700 mr-1" />
          <span class="text-sm sm:text-md font-medium text-purple-700">Tickets</span>
        </div>
        <p class="text-lg sm:text-xl font-semibold text-gray-900">
          {{ salesOvertimeData?.summary_paid?.total_ticket || 0 }}
        </p>
      </div>

      <div class="text-start sm:text-end">
        <div class="flex items-center justify-start sm:justify-end mb-2">
          <Icon name="tabler:coin-filled" class="w-5 sm:w-6 h-5 sm:h-6 text-purple-700 mr-1" />
          <span class="text-sm sm:text-md font-medium text-purple-700">Revenue</span>
        </div>
        <p class="text-lg sm:text-xl font-semibold mr-0 sm:mr-4 text-gray-900">
          ${{ salesOvertimeData?.summary_paid?.total_revenue || 0 }}
        </p>
      </div>
    </div>
  </div>

  <!-- Divider (custom height and padding) -->
  <div class="hidden xl:flex justify-center items-center">
    <div class="h-[70%] w-px bg-gray-300"></div>
  </div>
  
  <!-- Mobile/Tablet Divider -->
  <div class="xl:hidden w-full">
    <div class="h-px bg-gray-300 mx-4"></div>
  </div>

  <!-- Pending for cash payment -->
  <div class="p-4 sm:p-6">
    <div class="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:justify-between rounded-lg px-2 sm:px-1 py-2 sm:py-1 items-start sm:items-center bg-[#F9F7FD] m-auto gap-2 sm:gap-0">
      <h3 class="text-xs sm:text-sm font-medium text-gray-900">Pending for cash payment</h3>
      <h3 class="text-sm sm:text-md font-bold text-purple-800">
        {{ salesOvertimeData?.summary_pending?.total_booking || 0 }}
      </h3>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      <div class="text-start">
        <div class="flex items-center justify-start mb-2">
          <Icon name="material-symbols-light:receipt-rounded" class="w-5 sm:w-6 h-5 sm:h-6 text-purple-700 mr-1" />
          <span class="text-sm sm:text-md font-medium text-purple-700">Bookings</span>
        </div>
        <p class="text-lg sm:text-xl ml-0 sm:ml-5 font-semibold text-gray-900">
          {{ salesOvertimeData?.summary_pending?.total_booking || 0 }}
        </p>
      </div>

      <div class="text-start sm:text-center sm:border-x border-gray-300 sm:px-2">
        <div class="flex items-center justify-start sm:justify-center mb-2">
          <Icon name="heroicons:ticket-solid" class="w-5 sm:w-6 h-5 sm:h-6 text-purple-700 mr-1" />
          <span class="text-sm sm:text-md font-medium text-purple-700">Tickets</span>
        </div>
        <p class="text-lg sm:text-xl font-semibold text-gray-900">
          {{ salesOvertimeData?.summary_pending?.total_ticket || 0 }}
        </p>
      </div>

      <div class="text-start sm:text-end">
        <div class="flex items-center justify-start sm:justify-end mb-2">
          <Icon name="tabler:coin-filled" class="w-5 sm:w-6 h-5 sm:h-6 text-purple-700 mr-1" />
          <span class="text-sm sm:text-md font-medium text-purple-700">Revenue</span>
        </div>
        <p class="text-lg sm:text-xl font-semibold mr-0 sm:mr-4 text-gray-900">
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
      <div class="px-4 sm:px-6 py-4 border-b border-gray-200">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h2 class="text-lg font-semibold text-gray-900">List Sale</h2>
          
          <!-- Filters and Search -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
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
                  <span v-if="slotProps.value" class="text-sm">{{ slotProps.value }}</span>
                  <span v-else class="text-sm text-black">Sort</span>
                </template>
              </Dropdown>
            </div>

            <div class="flex items-center gap-2 w-full sm:w-auto">
              <p class="text-sm font-normal text-gray-700 whitespace-nowrap">Show</p>
              <Dropdown
                v-model="itemsPerPage"
                :options="pageOptions"
                optionLabel="label"
                optionValue="value"
                placeholder=""
                class="w-20 border border-gray-300 bg-transparent rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                @change="applyPageChange"
              />
            </div>

            <div class="hidden sm:block w-px h-6 bg-gray-300"></div>
            
            <span class="text-xs sm:text-sm text-gray-700 whitespace-nowrap">
              {{ searchQuery ? `Filtered: ${totalItems} results` : `Show ${currentPage * itemsPerPage - (itemsPerPage - 1)} to ${Math.min(currentPage * itemsPerPage, totalItems)} of ${totalItems}` }}
            </span>
          </div>
        </div>
      </div>

      <!-- Data Table -->
      <div class="overflow-x-auto overflow-y-hidden">
        <DataTable 
          :value="salesData" 
          :paginator="true" 
          :rows="itemsPerPage"
          :totalRecords="totalRecords"
          :lazy="true"
          :loading="loading"
          @page="onPageChange"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
          class="p-datatable-sm shadow-md overflow-hidden min-w-full"
          :scrollable="true"
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

const loadSalesListData = async (eventId, page = 1, showLoading = true) => {
  try {
    // Only show loading spinner for initial load or event changes, not pagination
    if (showLoading) {
      loading.value = true
    }
    
    console.log('🔄 Loading sales list data:', { eventId, page, itemsPerPage: itemsPerPage.value })
    
    const response = await fetchSalesReportList(eventId, page, itemsPerPage.value)
    console.log('📋 Sales list response:', response)
    
    if (response && response.success) {
      salesListData.value = response.data.items || []
      totalRecords.value = response.data.paginate?.total || 0
      totalItems.value = response.data.paginate?.total || 0
      currentPage.value = response.data.paginate?.current_page || page
      
      console.log('✅ Sales list data loaded:', {
        itemsCount: salesListData.value.length,
        totalRecords: totalRecords.value,
        currentPage: currentPage.value,
        itemsPerPage: itemsPerPage.value
      })
    } else {
      console.warn('⚠️ Invalid sales list response:', response)
      salesListData.value = []
      totalRecords.value = 0
      totalItems.value = 0
      currentPage.value = 1
    }
  } catch (error) {
    console.error('❌ Error loading sales list data:', error)
    salesListData.value = []
    totalRecords.value = 0
    totalItems.value = 0
    currentPage.value = 1
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load sales list data',
      life: 3000
    })
  } finally {
    if (showLoading) {
      loading.value = false
    }
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
    // Show loading when sorting as it changes data order
    loadSalesListData(selectedEvent.value.id, currentPage.value, true)
  }
}

const applyPageChange = () => {
  console.log('📄 Apply page change - items per page changed to:', itemsPerPage.value)
  currentPage.value = 1
  if (selectedEvent.value) {
    // Show loading only when changing items per page (this affects data structure)
    loadSalesListData(selectedEvent.value.id, 1, true)
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

// Handle pagination changes from DataTable
const onPageChange = (event) => {
  console.log('📄 Page change event:', event)
  
  const newPage = event.page + 1 // PrimeVue uses 0-based indexing, but our API uses 1-based
  const newRows = event.rows
  
  if (newRows !== itemsPerPage.value) {
    itemsPerPage.value = newRows
  }
  
  if (newPage !== currentPage.value) {
    currentPage.value = newPage
    if (selectedEvent.value) {
      // Don't show loading spinner for pagination changes - better UX
      loadSalesListData(selectedEvent.value.id, newPage, false)
    }
  }
}

// Watch for pagination changes
watch([currentPage, itemsPerPage], () => {
  if (selectedEvent.value) {
    // Don't show loading for watch-triggered changes (handled by individual methods)
    loadSalesListData(selectedEvent.value.id, currentPage.value, false)
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
/* DataTable Header Styling */
:deep(.p-datatable .p-datatable-thead > tr) {
  background-color: #F6F9F9;
  color: #667085;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: transparent;
  color: inherit;
  transition: background-color 0.3s ease;
}

:deep(.p-datatable .p-datatable-thead > td:hover) {
  background-color: #6A3ABF;
}

/* DataTable Body Styling */
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

/* Pagination Styling - Match Event Page Style */
:deep(.p-paginator) {
  padding: 1rem;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  flex-wrap: wrap;
}

:deep(.p-paginator .p-paginator-pages) {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-wrap: nowrap;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
  @apply bg-gradient-to-tr from-[#4D66A6] to-[#B61EEB] text-white border-none;
  border-color: linear-gradient(79deg, #4D66A6 7.31%, #B61EEB 98.95%);
  border-radius: 10px;
  color: white;
  box-shadow: 0 2px 8px rgba(77, 102, 166, 0.3);
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page) {
  border-radius: 8px;
  margin: 0 2px;
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  cursor: pointer;
  border: 1px solid transparent;
  font-weight: 500;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page:hover:not(.p-highlight)) {
  background-color: #F3F4F6;
  transform: translateY(-1px);
  border-color: #E5E7EB;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.p-paginator .p-paginator-first),
:deep(.p-paginator .p-paginator-prev),
:deep(.p-paginator .p-paginator-next),
:deep(.p-paginator .p-paginator-last) {
  border-radius: 8px;
  margin: 0 2px;
  min-width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

:deep(.p-paginator .p-paginator-first:hover),
:deep(.p-paginator .p-paginator-prev:hover),
:deep(.p-paginator .p-paginator-next:hover),
:deep(.p-paginator .p-paginator-last:hover) {
  background-color: #F3F4F6;
  transform: translateY(-1px);
}

:deep(.p-paginator .p-paginator-first:disabled),
:deep(.p-paginator .p-paginator-prev:disabled),
:deep(.p-paginator .p-paginator-next:disabled),
:deep(.p-paginator .p-paginator-last:disabled) {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

:deep(.p-paginator .p-dropdown) {
  border-radius: 8px;
  margin-left: 0.5rem;
  background-color: white;
  transition: all 0.2s ease;
}

:deep(.p-paginator .p-dropdown:hover) {
  border-color: #6366F1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* Ensure paginator elements are inline */
:deep(.p-paginator .p-paginator-element) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Fix for pagination wrapper */
:deep(.p-paginator-content) {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-wrap: nowrap;
}

/* Responsive pagination */
@media (max-width: 640px) {
  :deep(.p-paginator) {
    padding: 0.75rem 0.5rem;
    gap: 0.125rem;
  }
  
  :deep(.p-paginator .p-paginator-pages .p-paginator-page),
  :deep(.p-paginator .p-paginator-first),
  :deep(.p-paginator .p-paginator-prev),
  :deep(.p-paginator .p-paginator-next),
  :deep(.p-paginator .p-paginator-last) {
    min-width: 36px;
    height: 36px;
    margin: 0 1px;
    font-size: 0.875rem;
  }
  
  :deep(.p-paginator .p-dropdown) {
    margin-left: 0.25rem;
    font-size: 0.875rem;
  }
}
</style>

