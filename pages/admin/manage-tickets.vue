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

    <DataTable
      :value="filteredEvents"
      :paginator="true"
      :rows="itemsPerPage"
      :totalRecords="totalItems"
      :lazy="true"
      @page="onPage"
      :sortField="sortField"
      :sortOrder="sortOrder"
      class="p-datatable-sm shadow-md overflow-hidden"
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
</template>

<script setup>
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import EventCard from '~/components/common/EventCard.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import CardCommon from '~/components/common/CardCommon.vue'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import poster from '@/assets/image/poster-manage-booking.png'
import { definePageMeta } from '#imports';

const router = useRouter()
const toast = useToast()

const eventStats = [
  { title: 'Check-Ins', count: '28', icon: 'majesticons:ticket', weekChange: '2' },
  { title: 'Available Ticket', count: '23', icon: 'f7:tickets-fill', weekChange: '2' },
  { title: 'Complete Register', count: '5', icon: 'ix:user-success-filled', weekChange: '2' },
  { title: 'Unregistered', count: '24', icon: 'mingcute:user-x-fill', weekChange: '2' },
]

const events = ref([
  {
    name: 'John Doe',
    phonenumber: '+85512345678',
    email: 'john@example.com',
    bookingRefNo: 'BRN001',
    purchaseDate: '2025-07-20',
    nameAssign: 'Tom Teav',
    paymentMethod: 'Credit Card',
    revenue: 120.5,
    refund: 'No',
    status: 'Check-in', // Updated status
  },
  {
    name: 'Sokha Chan',
    phonenumber: '+85598765432',
    email: 'sokha@example.com',
    bookingRefNo: 'BRN002',
    purchaseDate: '2025-07-21',
    nameAssign: 'Tom Teav',
    paymentMethod: 'ABA Pay',
    revenue: 90,
    refund: 'No',
    status: 'Not Check-in', // Updated status
  },
  {
    name: 'Alice Kim',
    phonenumber: '+85510203040',
    email: 'alice@example.com',
    bookingRefNo: 'BRN003',
    purchaseDate: '2025-07-18',
    nameAssign: 'Tom Teav',
    paymentMethod: 'Wing',
    revenue: 150,
    refund: 'Yes',
    status: 'Check-in', // Updated status
  },
])

const searchQuery = ref('')
const sortOption = ref('Sort') // Default sort option
const itemsPerPage = ref(10)
const currentPage = ref(1)
const totalItems = ref(events.value.length) // Initialize with actual data length

const sortField = ref('purchaseDate')
const sortOrder = ref(-1) // Default to descending for purchaseDate

const sortOptions = ref([
  { label: 'Date (Ascending)', value: 'purchaseDate-asc' },
  { label: 'Date (Descending)', value: 'purchaseDate-desc' },
  { label: 'Name (A-Z)', value: 'name-asc' },
  { label: 'Name (Z-A)', value: 'name-desc' },
])

const pageOptions = ref([
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '50', value: 50 },
])

const applySort = () => {
  const [field, order] = sortOption.value.split('-')
  sortField.value = field
  sortOrder.value = order === 'asc' ? 1 : -1
  console.log('Sort applied:', sortOption.value)
}

const applyPageChange = () => {
  currentPage.value = 1 // Reset to first page on items per page change
  console.log('Items per page changed:', itemsPerPage.value)
}

const filteredEvents = computed(() => {
  let result = [...events.value]

  if (searchQuery.value) {
    result = result.filter(event =>
      event.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      event.bookingRefNo.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      event.phonenumber.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      event.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (sortField.value) {
    result = result.sort((a, b) => {
      let valueA, valueB
      if (sortField.value === 'purchaseDate') {
        valueA = new Date(a.purchaseDate).getTime()
        valueB = new Date(b.purchaseDate).getTime()
      } else {
        valueA = a[sortField.value] || ''
        valueB = b[sortField.value] || ''
      }

      if (valueA < valueB) return sortOrder.value * -1
      if (valueA > valueB) return sortOrder.value * 1
      return 0
    })
  }

  totalItems.value = result.length // Update totalItems based on filtered results
  return result.slice((currentPage.value - 1) * itemsPerPage.value, currentPage.value * itemsPerPage.value)
})

const onPage = (event) => {
  currentPage.value = event.page + 1
}

const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
const formatCurrency = (value) => `$${value.toLocaleString()}`

const getStatusClass = (status) => {
  const classes = {
    'Check-in': 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full',
    'Not Check-in': 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full'
  }
  return classes[status] || 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full'
}

const toggleFilters = () => {
  toast.add({ severity: 'info', summary: 'Filters', detail: 'Filter functionality to be implemented', life: 3000 })
}

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
