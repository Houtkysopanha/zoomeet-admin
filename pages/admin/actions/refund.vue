<template>
  <div class="p-6 bg-[#F8F8FF] min-h-screen">
    <div class="mb-6">
      <h1 class="text-3xl text-gray-500 mb-2">
        Event / Manage Booking /<span class="text-[#7A49C9] font-bold">Refund</span>
      </h1>
    </div>

    <!-- Filters and Search -->
    <div class="mb-6 mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-4 w-full sm:w-auto flex-grow">
        <div class="relative w-full">
         <div class="flex items-center gap-4 text-xl font-medium text-gray-700">
        <span>Booking Ref.No. {{ currentBooking?.bookingRefNo || 'N/A' }}</span>
        <span class="text-gray-400">|</span>
        <span>{{ currentBooking?.bookingName || 'N/A' }}</span>
      </div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-end">
        <div class="relative w-full sm:w-auto">
          <Dropdown
            v-model="sortOption"
            :options="sortOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Sort"
            class="w-full sm:w-32 p-dropdown-sm border bg-transparent border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            @change="applySort"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex items-center gap-2">
                <Icon name="lucide:arrow-down-up" class="h-5 w-5 text-gray-600" />
                <span>{{ slotProps.value }}</span>
              </div>
              <div v-else class="flex items-center gap-2 text-gray-500">
                <!-- <Icon name="lucide:arrow-down-up" class="h-5 w-5" /> -->
                <span>Sort</span>
              </div>
            </template>
          </Dropdown>
        </div>
        <p class="text-xl font-normal text-gray-700 whitespace-nowrap">Show</p>
        <Dropdown
          v-model="itemsPerPage"
          :options="pageOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="10"
          class="w-20 border border-gray-300 bg-transparent rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          @change="applyPageChange"
        />
        <span class="text-lg text-gray-700 border-l pl-2 border-gray-500 whitespace-nowrap">
          Show {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredTickets.length) }} of {{ filteredTickets.length }}
        </span>
      </div>
    </div>

    <!-- Tickets Table -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <DataTable :value="paginatedTickets" paginator :rows="itemsPerPage" :totalRecords="filteredTickets.length"
                 dataKey="ticketId" class="p-datatable-gridlines"
                 scrollable responsiveLayout="scroll">
        <Column class="text-[12px] text-start border-b border-gray-300" field="ticketId" header="Ticket ID" ></Column>
        <Column class="text-[12px] text-start border-b font-bold border-gray-300" field="ticketHolder" header="Tickets Holder" sortable></Column>
        <Column class="text-[12px] text-start border-b border-gray-300" field="phoneNumber" header="Phone Number" sortable></Column>
        <Column class="text-[12px] text-start border-b border-gray-300" field="email" header="Email" ></Column>
        <Column class="text-[12px] text-start border-b border-gray-300" field="typeTicket" header="Type Ticket" ></Column>
        <Column class="text-[12px] text-start border-b border-gray-300" field="originalPrice" header="Original Price" >
          <template #body="slotProps">
            <span>{{ formatCurrency(slotProps.data.originalPrice) }}</span>
          </template>
        </Column>
        <Column class="text-[12px] text-start border-b border-gray-300" field="refundAmount" header="Refund Amount" >
          <template #body="slotProps">
            <span>{{ slotProps.data.refundAmount ? formatCurrency(slotProps.data.refundAmount) : '-' }}</span>
          </template>
        </Column>
        <Column class="text-[12px] text-start border-b border-gray-300" field="reason" header="Reason" ></Column>
        <Column class="text-[12px] text-start border-b border-gray-300" field="refundStatus" header="Refund Status" >
          <template #body="slotProps">
            <span :class="getStatusClass(slotProps.data.refundStatus)">
              {{ slotProps.data.refundStatus }}
            </span>
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
            <Menu ref="menu" :model="menuItems" :popup="true" />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import Menu from 'primevue/menu'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const bookingId = ref(null)
const currentBooking = ref(null) // To store details of the specific booking
const tickets = ref([]) // To store tickets for this booking

const searchQuery = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)

const sortOption = ref(null)
const sortOptions = ref([
  { label: 'Ticket ID (Asc)', value: 'ticketId-asc' },
  { label: 'Ticket ID (Desc)', value: 'ticketId-desc' },
  { label: 'Holder (A-Z)', value: 'ticketHolder-asc' },
  { label: 'Holder (Z-A)', value: 'ticketHolder-desc' },
  { label: 'Original Price (Low to High)', value: 'originalPrice-asc' },
  { label: 'Original Price (High to Low)', value: 'originalPrice-desc' },
])

const pageOptions = ref([
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '50', value: 50 },
])

// Sample data for bookings and their tickets (replace with API calls)
const allBookingsData = [
  {
    id: 1,
    bookingName: 'Sovapunchavuth',
    bookingRefNo: 'BK789456',
    tickets: [
      { ticketId: 'TKT001', ticketHolder: 'Sovapunchavuth', phoneNumber: '0123456789', email: 'N/A', typeTicket: 'Premium', originalPrice: 25, refundAmount: null, reason: null, refundStatus: '-' },
      { ticketId: 'TKT002', ticketHolder: 'Sovanvichka', phoneNumber: '0123456789', email: 'info@rice.com', typeTicket: 'Premium', originalPrice: 25, refundAmount: 25, reason: 'Schedule conflict', refundStatus: 'Success' },
      { ticketId: 'TKT003', ticketHolder: 'Odom kh', phoneNumber: '0123456789', email: 'info@rice.com', typeTicket: 'Premium', originalPrice: 25, refundAmount: 25, reason: 'Schedule conflict', refundStatus: 'Success' },
      { ticketId: 'TKT004', ticketHolder: 'Vy Lariya', phoneNumber: '0123456789', email: 'info@rice.com', typeTicket: 'Premium', originalPrice: 25, refundAmount: 25, reason: 'Schedule conflict', refundStatus: 'Success' },
      { ticketId: 'TKT005', ticketHolder: 'Khun Thaliya', phoneNumber: '0123456789', email: 'info@rice.com', typeTicket: 'Premium', originalPrice: 25, refundAmount: 25, reason: 'Schedule conflict', refundStatus: 'processed' },
      { ticketId: 'TKT006', ticketHolder: 'Tom Teav', phoneNumber: '0123456789', email: 'info@rice.com', typeTicket: 'Premium', originalPrice: 25, refundAmount: 25, reason: 'Schedule conflict', refundStatus: 'Pending' },
      { ticketId: 'TKT007', ticketHolder: 'Plorng Prakrika', phoneNumber: '0123456789', email: 'info@rice.com', typeTicket: 'Premium', originalPrice: 25, refundAmount: 25, reason: 'Schedule conflict', refundStatus: 'Pending' },
      { ticketId: 'TKT008', ticketHolder: 'Song Sivemey', phoneNumber: '0123456789', email: 'info@rice.com', typeTicket: 'Premium', originalPrice: 25, refundAmount: 25, reason: 'Schedule conflict', refundStatus: 'processed' },
      { ticketId: 'TKT009', ticketHolder: 'Li MeyMey', phoneNumber: '0123456789', email: 'info@rice.com', typeTicket: 'Premium', originalPrice: 25, refundAmount: 25, reason: 'Schedule conflict', refundStatus: 'processed' },
      { ticketId: 'TKT010', ticketHolder: 'Mey Lyjing', phoneNumber: '0123456789', email: 'info@rice.com', typeTicket: 'Premium', originalPrice: 25, refundAmount: null, reason: null, refundStatus: 'Success' },
    ]
  },
  // Add more sample bookings if needed for testing different booking IDs
  {
    id: 2,
    bookingName: 'Another Booking',
    bookingRefNo: 'BK999999',
    tickets: [
      { ticketId: 'TKT101', ticketHolder: 'Test User', phoneNumber: '0987654321', email: 'test@example.com', typeTicket: 'Standard', originalPrice: 15, refundAmount: null, reason: null, refundStatus: '-' },
    ]
  }
]

const filteredTickets = computed(() => {
  let result = [...tickets.value]

  // Apply search filter
  if (searchQuery.value) {
    const lowerCaseQuery = searchQuery.value.toLowerCase()
    result = result.filter(ticket =>
      Object.values(ticket).some(value =>
        String(value).toLowerCase().includes(lowerCaseQuery)
      )
    )
  }

  // Apply client-side sorting based on sortOption
  if (sortOption.value) {
    const [field, order] = sortOption.value.split('-')
    result = result.sort((a, b) => {
      let valueA = a[field] || ''
      let valueB = b[field] || ''

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return order === 'asc' ? valueA.localeCompare(valueB) : -valueA.localeCompare(valueB)
      } else {
        return order === 'asc' ? valueA - valueB : valueB - valueA
      }
    })
  }

  return result
})

const paginatedTickets = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredTickets.value.slice(start, end)
})

const applySort = () => {
  currentPage.value = 1; // Reset to first page on sort change
}

const applyPageChange = (event) => {
  itemsPerPage.value = event.value
  currentPage.value = 1 // Reset to first page on items per page change
}

const toggleFilters = () => {
  toast.add({ severity: 'info', summary: 'Filters', detail: 'Filter functionality to be implemented', life: 3000 })
}

const menu = ref()
const selectedTicketForMenu = ref(null)

const menuItems = ref([
  {
    label: 'Refund',
    icon: 'lucide:receipt-text',
    command: () => {
      if (selectedTicketForMenu.value) {
        toast.add({ severity: 'info', summary: 'Refund Initiated', detail: `Refunding ticket ${selectedTicketForMenu.value.ticketId}`, life: 3000 })
        // Implement actual refund logic here, e.g., API call
        // For demonstration, update status locally
        const index = tickets.value.findIndex(t => t.ticketId === selectedTicketForMenu.value.ticketId);
        if (index !== -1) {
          tickets.value[index].refundStatus = 'processed';
          tickets.value[index].refundAmount = tickets.value[index].originalPrice; // Example
          tickets.value[index].reason = 'User requested refund'; // Example
        }
      }
    }
  },
  {
    label: 'Remove',
    icon: 'lucide:trash',
    command: () => {
      if (selectedTicketForMenu.value) {
        toast.add({ severity: 'warn', summary: 'Ticket Removed', detail: `Removed ticket ${selectedTicketForMenu.value.ticketId}`, life: 3000 })
        tickets.value = tickets.value.filter(t => t.ticketId !== selectedTicketForMenu.value.ticketId)
      }
    }
  }
])

const toggleMenu = (event, data) => {
  selectedTicketForMenu.value = data
  menu.value.toggle(event)
}

const formatCurrency = (value) => `$${value.toFixed(2)}`

const getStatusClass = (status) => {
  const classes = {
    'Success': 'bg-green-100 text-green-800 px-2 py-1 rounded-full',
    'processed': 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full',
    'Pending': 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full',
    '-': 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full', // For empty status
  }
  return classes[status] || 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full'
}

definePageMeta({
  middleware: "auth",
  layout: "admin",
})

onMounted(() => {
  bookingId.value = parseInt(route.query.bookingId)
  if (bookingId.value) {
    const foundBooking = allBookingsData.find(b => b.id === bookingId.value)
    if (foundBooking) {
      currentBooking.value = foundBooking
      tickets.value = foundBooking.tickets
    } else {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Booking not found!', life: 3000 })
      router.push('/admin/manage-booking') // Redirect if booking not found
    }
  } else {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Booking ID missing!', life: 3000 })
    router.push('/admin/manage-booking') // Redirect if ID is missing
  }
})
</script>

<style scoped>
/* Reusing styles from manage-booking for consistency */
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
  padding-top: 1rem;
  padding-bottom: 1rem;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
:deep(.p-menu .p-menuitem-link:hover) {
  background-color: #f3f4f6;
}
:deep(.p-menu .p-menuitem-separator) {
  margin: 0.25rem 0;
}

/* Styles for search and dropdowns */
:deep(.p-dropdown) {
  border-radius: 0.5rem;
  border: 1px solid #D1D5DB;
  box-shadow: none;
}

:deep(.p-dropdown:not(.p-disabled):focus) {
  outline: 0 none;
  outline-offset: 0;
  box-shadow: 0 0 0 0.2rem rgba(122, 73, 201, 0.25);
  border-color: #7A49C9;
}

:deep(.p-dropdown .p-dropdown-label) {
  padding: 0.5rem 0.75rem;
}

:deep(.p-dropdown-trigger) {
  width: 2rem;
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
  padding: 0;
  border-bottom: none;
}

:deep(.p-datatable .p-datatable-wrapper) {
  border-radius: 0.5rem;
  overflow: hidden;
}

:deep(.p-datatable .p-datatable-tfoot > tr > td) {
  background-color: white;
}

:deep(.p-paginator) {
  background-color: white;
  border-top: 1px solid #e5e7eb;
  padding: 1rem;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
  background-color: #7A49C9;
  border-color: #7A49C9;
  color: white;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
  @apply bg-gradient-to-tr from-[#4D66A6] to-[#B61EEB] text-white border-none;
  border-color: linear-gradient(79deg, #4D66A6 7.31%, #B61EEB 98.95%);
  border-radius: 10px;
  color: white;
}
:deep(.p-paginator .p-paginator-first,
.p-paginator .p-paginator-prev,
.p-paginator .p-paginator-next,
.p-paginator .p-paginator-last) {
  border-radius: 0.5rem;
}

:deep(.p-paginator .p-paginator-first:hover,
.p-paginator .p-paginator-prev:hover,
.p-paginator .p-paginator-next:hover,
.p-paginator .p-paginator-last:hover) {
  background-color: #e6f2ff;
  color: #7A49C9;
}

:deep(.p-column-header-content) {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Custom button styling for Filters */
.p-button-purple {
  background: linear-gradient(to top, #4A00B0, #7A49C9);
  color: white !important;
  border-color: #7A49C9 !important;
}

.p-button-purple:hover {
  background: linear-gradient(to top, #3A0090, #6A39B9);
}
</style>
