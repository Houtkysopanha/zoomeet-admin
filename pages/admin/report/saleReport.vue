<template>
  <div class="p-4 bg-[#F8F8FF] min-h-screen">

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
      <Button
        label="Export"
        icon="pi pi-download"
        class="bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700"
        @click="exportReport"
      />
    </div>

    <!-- Search and Filters -->
    <div class="mb-6 flex items-center justify-between">
      <div class="relative flex-1 max-w-md">
        <Icon name="i-heroicons-magnifying-glass" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search"
          class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
        />
      </div>
      <div class="flex items-center space-x-4 ml-4">
        <Dropdown
          v-model="selectedMonth"
          :options="monthOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="October"
          class="w-32 rounded-2xl "
        />
        <Dropdown
          v-model="selectedYear"
          :options="yearOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="2025"
          class="w-24 rounded-2xl "
        />
      </div>
    </div>

    <!-- Event Cards -->
    <div class="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex items-center space-x-4">
        <img src="https://via.placeholder.com/60x60" alt="Event" class="w-15 h-15 rounded-lg object-cover" />
        <div class="flex-1">
          <h3 class="font-medium text-gray-900 text-sm mb-1">Navigating the future of cybersecurity in Cambodia 2015</h3>
          <p class="text-xs text-gray-500">📍 Hayatt Regency, Phnom Penh</p>
          <p class="text-xs text-gray-500">🕐 10:00 AM GMT+7</p>
        </div>
      </div>
      <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex items-center space-x-4">
        <img src="https://via.placeholder.com/60x60" alt="Event" class="w-15 h-15 rounded-lg object-cover" />
        <div class="flex-1">
          <h3 class="font-medium text-gray-900 text-sm mb-1">Navigating the future of cybersecurity in Cambodia 2015</h3>
          <p class="text-xs text-gray-500">📍 Hayatt Regency, Phnom Penh</p>
          <p class="text-xs text-gray-500">🕐 10:00 AM GMT+7</p>
        </div>
      </div>
      <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex items-center space-x-4">
        <img src="https://via.placeholder.com/60x60" alt="Event" class="w-15 h-15 rounded-lg object-cover" />
        <div class="flex-1">
          <h3 class="font-medium text-gray-900 text-sm mb-1">Navigating the future of cyber in Cambodia 2015</h3>
          <p class="text-xs text-gray-500">📍 Hayatt Regency, Phnom Penh</p>
          <p class="text-xs text-gray-500">🕐 10:00 AM GMT+7</p>
        </div>
      </div>
    </div>

    <!-- Sale Overtime Section -->
    <div class="mb-8">
      <h2 class="text-xl font-semibold text-gray-900 mb-6">Sale Overtime</h2>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Paid and confirmed -->
        <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div class="mb-4">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Paid and confirmed</h3>
            <p class="text-2xl font-bold text-purple-600">1,000</p>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div class="text-center">
              <div class="flex items-center justify-center mb-2">
                <span class="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                <span class="text-sm text-gray-600">Bookings</span>
              </div>
              <p class="text-lg font-semibold text-gray-900">1,000</p>
            </div>
            <div class="text-center">
              <div class="flex items-center justify-center mb-2">
                <span class="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                <span class="text-sm text-gray-600">Tickets</span>
              </div>
              <p class="text-lg font-semibold text-gray-900">1,500</p>
            </div>
            <div class="text-center">
              <div class="flex items-center justify-center mb-2">
                <span class="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                <span class="text-sm text-gray-600">Amount</span>
              </div>
              <p class="text-lg font-semibold text-gray-900">$2,000</p>
            </div>
          </div>
        </div>

        <!-- Pending for cash payment -->
        <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div class="mb-4">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Pending for cash payment</h3>
            <p class="text-2xl font-bold text-purple-600">1,000</p>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div class="text-center">
              <div class="flex items-center justify-center mb-2">
                <span class="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                <span class="text-sm text-gray-600">Bookings</span>
              </div>
              <p class="text-lg font-semibold text-gray-900">1,000</p>
            </div>
            <div class="text-center">
              <div class="flex items-center justify-center mb-2">
                <span class="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                <span class="text-sm text-gray-600">Tickets</span>
              </div>
              <p class="text-lg font-semibold text-gray-900">1,500</p>
            </div>
            <div class="text-center">
              <div class="flex items-center justify-center mb-2">
                <span class="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                <span class="text-sm text-gray-600">Amount</span>
              </div>
              <p class="text-lg font-semibold text-gray-900">$2,000</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- List Sale Section -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <!-- Header with filters -->
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900">List Sale</h2>
        <div class="flex items-center space-x-4">
          <Button
            label="Today"
            class="p-button-outlined text-gray-600 border-gray-300 hover:bg-gray-50"
            @click="filterToday"
          />
          <Button
            label="Filters"
            icon="pi pi-filter"
            class="p-button-outlined text-purple-600 border-purple-600 hover:bg-purple-50"
            @click="toggleFilters"
          />
        </div>
      </div>

      <!-- Data Table -->
      <div class="overflow-hidden">
        <DataTable 
          :value="salesData" 
          :paginator="true" 
          :rows="itemsPerPage"
          :totalRecords="totalRecords"
          class="p-datatable-gridlines"
          scrollable 
          responsiveLayout="scroll"
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
              <span class="text-gray-700">{{ formatDate(slotProps.data.purchaseDate) }}</span>
            </template>
          </Column>
          
          <Column field="noTicket" header="No.Ticket" class="text-[12px] text-start border-b border-gray-300">
            <template #body="slotProps">
              <span class="text-gray-700">{{ slotProps.data.noTicket }}</span>
            </template>
          </Column>
          
          <Column field="typeTicket" header="Type of Ticket" class="text-[12px] text-start border-b border-gray-300">
            <template #body="slotProps">
              <span class="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {{ slotProps.data.typeTicket }}
              </span>
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
          
          <Column field="status" header="Status" class="text-[12px] text-start border-b border-gray-300">
            <template #body="slotProps">
              <span :class="getStatusClass(slotProps.data.status)" class="px-2 py-1 rounded-full text-xs font-medium">
                {{ slotProps.data.status }}
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
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import Dropdown from 'primevue/dropdown'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

// Data
const itemsPerPage = ref(10)
const totalRecords = ref(206)
const searchQuery = ref('')
const selectedMonth = ref('October')
const selectedYear = ref('2025')

// Dropdown options
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

// Sample sales data matching the image
const salesData = ref([
  {
    name: 'Sovanpunchauth',
    phone: '012345678',
    bookingRefNo: 'BK789456',
    purchaseDate: 'Aug 3, 2025 | 09:15AM',
    noTicket: 10,
    typeTicket: 'Premium',
    payment: 'Cash',
    amount: 250,
    status: 'PENDING'
  },
  {
    name: 'Sovanvicha',
    phone: '012345678',
    bookingRefNo: 'BK789456',
    purchaseDate: 'Aug 3, 2025 | 09:15AM',
    noTicket: 10,
    typeTicket: 'Premium',
    payment: 'ABA Bank',
    amount: 120,
    status: 'PAID'
  },
  {
    name: 'Tom Tony',
    phone: 'voltonnextgen@.com',
    bookingRefNo: 'BK789456',
    purchaseDate: 'Aug 3, 2025 | 09:15AM',
    noTicket: 20,
    typeTicket: 'Premium',
    payment: 'Cash',
    amount: 120,
    status: 'PENDING'
  },
  {
    name: 'Pleung Prakika',
    phone: '012345678',
    bookingRefNo: 'BK789456',
    purchaseDate: 'Aug 3, 2025 | 09:15AM',
    noTicket: 20,
    typeTicket: 'Premium',
    payment: 'ABA Bank',
    amount: 120,
    status: 'PAID'
  },
  {
    name: 'Seng Sivmey',
    phone: '012345678',
    bookingRefNo: 'BK789456',
    purchaseDate: 'Aug 3, 2025 | 09:15AM',
    noTicket: 10,
    typeTicket: 'Premium',
    payment: 'ABA Bank',
    amount: 120,
    status: 'PAID'
  },
  {
    name: 'Pleung Phalisa',
    phone: 'pleungphals@gmail.com',
    bookingRefNo: 'BK789456',
    purchaseDate: 'Aug 3, 2025 | 09:15AM',
    noTicket: 2,
    typeTicket: 'Premium',
    payment: 'ABA Bank',
    amount: 120,
    status: 'PAID'
  },
  {
    name: 'Ly Sokmey',
    phone: '012345678',
    bookingRefNo: 'BK789456',
    purchaseDate: 'Aug 3, 2025 | 09:15AM',
    noTicket: 8,
    typeTicket: 'Premium',
    payment: 'ABA Bank',
    amount: 120,
    status: 'PAID'
  },
  {
    name: 'Som Lydara',
    phone: 'somlydara@gmail.com',
    bookingRefNo: 'BK789456',
    purchaseDate: 'Aug 3, 2025 | 09:15AM',
    noTicket: 6,
    typeTicket: 'Premium',
    payment: 'ABA Bank',
    amount: 120,
    status: 'PAID'
  },
  {
    name: 'Mey Lykonika',
    phone: '012345678',
    bookingRefNo: 'BK789456',
    purchaseDate: 'Aug 3, 2025 | 09:15AM',
    noTicket: 5,
    typeTicket: 'Premium',
    payment: 'Cash',
    amount: 120,
    status: 'PENDING'
  },
  {
    name: 'Ty Lynney',
    phone: 'ty.lynney@gmail.com',
    bookingRefNo: 'BK789456',
    purchaseDate: 'Aug 3, 2025 | 09:15AM',
    noTicket: 15,
    typeTicket: 'Premium',
    payment: 'Cash',
    amount: 120,
    status: 'PENDING'
  }
])

// Methods
const exportReport = () => {
  toast.add({ 
    severity: 'info', 
    summary: 'Export Report', 
    detail: 'Sale report exported successfully', 
    life: 3000 
  })
}

const filterToday = () => {
  toast.add({ 
    severity: 'info', 
    summary: 'Filter Applied', 
    detail: 'Showing today\'s sales', 
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

const formatDate = (dateString) => {
  return dateString
}

const getStatusClass = (status) => {
  switch (status) {
    case 'PAID':
      return 'bg-green-100 text-green-800'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'FAILED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
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
  background: transparent;
}

:deep(.p-button-outlined:hover) {
  background-color: rgba(124, 58, 237, 0.05);
}

/* Search and filter styling */
.input-search {
  @apply w-full pl-12 pr-4 py-3 border-0 rounded-none focus:ring-0 focus:border-0;
  background: transparent;
  outline: none;
}

.select-standard {
  @apply border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white;
}

/* Card hover effects */
.bg-white:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

/* Status badge styling */
.px-2 {
  border-radius: 9999px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}
</style>
