<template>
  <div class="p-6 bg-[#F8F8FF]">
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl text-gray-500 mb-2">Event /<span class="text-[#7A49C9] font-bold">Manage Booking</span></h1>
        </div>
        <div class="date-range-picker flex space-x-4 items-center">
          <Button
           @click="goToManageTicket"
            label="Manage Ticket"
            icon="pi pi-ticket"
            class="p-button-indigo w-44 h-12 p-4 rounded-full text-white bg-gradient-to-t from-indigo-600 to-indigo-400 hover:from-indigo-700 hover:to-indigo-500"
            raised
          />
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
                class="w-full pl-14 border-0 focus:ring-0 focus:outline-none bg-white p-3 rounded-full"
              />
            </div>
            <div class="relative">
              <Button
                label="Filters"
                icon="pi pi-filter"
                class="p-button-outlined p-button-purple text-purple-600 border-purple-600 hover:bg-purple-50 w-full h-full rounded-none p-3"
                @click="toggleFilters"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <div class="relative">
          <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium">Sort</span>
          <Dropdown
            v-model="sortOption"
            :options="sortOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Sort"
            class="w-30 p-dropdown-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg"
            @change="applySort"
          >
            <template #value="slotProps">
              <i class="pi pi-sort-amount-up mr-2 text-black"></i>
              <span v-if="slotProps.value">{{ slotProps.value }}</span>
              <span v-else class="ml-14 text-black">Sort</span>
            </template>
          </Dropdown>
          <span class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></span>
        </div>
        <p class="text-xl font-medium text-gray-700">Show</p>
        <Dropdown
          v-model="itemsPerPage"
          :options="pageOptions"
          optionLabel="label"
          optionValue="value"
          placeholder=""
          class="border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          @change="applyPageChange"
        />
        <span class="text-lg text-gray-700 border-l pl-2 border-gray-500">Show {{ currentPage * itemsPerPage - (itemsPerPage - 1) }} to {{ Math.min(currentPage * itemsPerPage, totalItems) }} of {{ totalItems }}</span>
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
      <!-- Booking Name -->
      <Column field="name" header="Booking Name" sortable class="text-[14px] border-b border-gray-300">
        <template #body="slotProps">
          <div class="text-gray-900 font-bold">
            {{ slotProps.data.name }}
          </div>
        </template>
      </Column>

      <!-- Phone Number -->
      <Column field="phonenumber" header="Phone Number" sortable class="text-[14px] border-b border-gray-300">
        <template #body="slotProps">
          <span >{{ slotProps.data.phonenumber }}</span>
        </template>
      </Column>

      <!-- Email -->
      <Column field="email" header="Email" class="text-[14px] border-b  border-gray-300" />

      <!-- Booking Reference -->
      <Column field="bookingRefNo" header="Booking Ref. No." class="text-[14px] border-b border-gray-300" />

      <!-- Purchase Date -->
      <Column field="purchaseDate" header="Purchase Date" sortable class="text-[14px] border-b border-gray-300">
        <template #body="slotProps">
          <span>{{ formatDate(slotProps.data.purchaseDate) }}</span>
        </template>
      </Column>

      <!-- No. Ticket -->
      <Column field="numberOfTickets" header="No. Ticket" class="text-[14px] text-center border-b border-gray-300">
        <template #body="slotProps">
          <span>{{ slotProps.data.numberOfTickets }}</span>
        </template>
      </Column>

      <!-- Payment -->
      <Column field="paymentMethod" header="Payment" class="text-[14px] text-start border-b border-gray-300">
        <template #body="slotProps">
          <span>{{ slotProps.data.paymentMethod }}</span>
        </template>
      </Column>

      <!-- Amount (USD) -->
      <Column field="revenue" header="Amount (USD)" class="text-[14px] text-center border-b border-gray-300">
        <template #body="slotProps">
          <span>{{ formatCurrency(slotProps.data.revenue) }}</span>
        </template>
      </Column>

      <!-- Refund -->
      <Column field="refund" header="Refund" class="text-[14px] text-center border-b border-gray-300" />

      <!-- Status -->
      <Column field="status" header="Status" class="text-[14px] border-b border-gray-300">
        <template #body="slotProps">
          <span :class="getStatusClass(slotProps.data.status)">
            {{ slotProps.data.status }}
          </span>
        </template>
      </Column>

      <!-- Actions -->
       <Column field="actions" header="Actions" class="border-b border-gray-300  text-start">
        <template #body="slotProps">
          <Button
            icon="pi pi-ellipsis-v"
            class="p-button-rounded p-button-outlined p-button-indigo"
            @click="(event) => toggleActionMenu(event, slotProps.data)"
          />
          <Menu ref="actionMenu" :model="actionItems(slotProps.data)" :popup="true" class="rounded-xl" />
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
import Menu from 'primevue/menu'
import CardCommon from '~/components/common/CardCommon.vue'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
const router = useRouter()
const toast = useToast()
import poster from '@/assets/image/poster-manage-booking.png'
const eventStats = [
  { title: 'Total Events', count: '28', icon: 'i-heroicons-calendar', weekChange: '2' },
  { title: 'Complete Event', count: '23', icon: 'i-heroicons-check-circle', weekChange: '2' },
  { title: 'Ongoing', count: '5', icon: 'i-heroicons-play', weekChange: '2' },
  { title: 'Draft', count: '24', icon: 'i-heroicons-pencil', weekChange: '2' },
]
const events = ref([
  {
    name: 'John Doe',
    phonenumber: '+85512345678',
    email: 'john@example.com',
    bookingRefNo: 'BRN001',
    purchaseDate: '2025-07-20',
    numberOfTickets: 2,
    paymentMethod: 'Credit Card',
    revenue: 120.5,
    refund: 'No',
    status: 'success',
  },
  {
    name: 'Sokha Chan',
    phonenumber: '+85598765432',
    email: 'sokha@example.com',
    bookingRefNo: 'BRN002',
    purchaseDate: '2025-07-21',
    numberOfTickets: 1,
    paymentMethod: 'ABA Pay',
    revenue: 90,
    refund: 'No',
    status: 'failed',
  },
  {
    name: 'Alice Kim',
    phonenumber: '+85510203040',
    email: 'alice@example.com',
    bookingRefNo: 'BRN003',
    purchaseDate: '2025-07-18',
    numberOfTickets: 3,
    paymentMethod: 'Wing',
    revenue: 150,
    refund: 'Yes',
    status: 'success',
  },
])
const goToManageTicket = () => {
  router.push('/admin/manage-tickets')
}
const dateRange = ref(null)
const displayRange = ref('')
const actionMenu = ref(null)

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
const sortOption = ref('Sort')
const itemsPerPage = ref(10)
const currentPage = ref(1)
const totalItems = ref(206)
const sortField = ref('purchaseDate')
const sortOrder = ref(1) 

const sortOptions = ref([
  { label: 'Date (Ascending)', value: 'Date (Ascending)' },
  { label: 'Date (Descending)', value: 'Date (Descending)' },
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
  sortField.value = field === 'Sort' ? 'purchaseDate' : field
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
      event.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  if (sortOption.value !== 'Sort') {
    const [field, order] = sortOption.value.split('-')
    result = result.sort((a, b) => {
      let valueA, valueB
      if (field === 'purchaseDate') {
        valueA = new Date(a.purchaseDate).getTime()
        valueB = new Date(b.purchaseDate).getTime()
        return order === 'asc' ? valueA - valueB : valueB - valueA
      } else {
        valueA = a[field] || ''
        valueB = b[field] || ''
        return order === 'asc' ? valueA.localeCompare(valueB) : -valueA.localeCompare(valueB)
      }
    })
  }
  totalItems.value = result.length
  return result.slice((currentPage.value - 1) * itemsPerPage.value, currentPage.value * itemsPerPage.value)
})

const onPage = (event) => {
  currentPage.value = event.page + 1
}

const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
const formatCurrency = (value) => `$${value.toLocaleString()}`

const getStatusClass = (status) => {
  const classes = {
    success: 'bg-green-100 text-green-800 px-2 py-1 rounded-full',
    failed: 'bg-red-100 text-red-800 px-2 py-1 rounded-full'
  }
  return classes[status] || 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full'
}

const toggleFilters = () => {
  toast.add({ severity: 'info', summary: 'Filters', detail: 'Filter functionality to be implemented', life: 3000 })
}

const toggleActionMenu = (event, data) => {
  actionMenu.value.toggle(event, { target: event.currentTarget })
  currentEvent.value = data
}

const currentEvent = ref(null)
const actionMenus = ref({})
const actionItems = (event) => [
  { label: 'Refund', icon: 'pi pi-ticket', command: () => refund(currentEvent.value) },
  { label: 'Remove', icon: 'pi pi-trash text-red-500', command: () => removeEvent(currentEvent.value) }
]
const refund = (event) => toast.add({ severity: 'info', summary: 'refund', detail: `Editing ${event.name}`, life: 3000 })
const removeEvent = (event) => toast.add({ severity: 'info', summary: 'Remove Event', detail: `Removing ${event.name}`, life: 3000 })

const previousPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value * itemsPerPage.value < totalItems.value) currentPage.value++
}

definePageMeta({
  layout: "admin",
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
  background-color: #F6F9F9; /* Custom header background color */
  color: #667085; /* Custom text color */
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: transparent; /* Inherits from tr for consistency */
  color: inherit; /* Inherits text color from tr */
  transition: background-color 0.3s ease; /* Smooth hover transition */
}

/* :deep(.p-datatable .p-datatable-thead > tr > th:hover) {
  background-color: #E6F2FF; 
} */

/* Updated td styles for row hover */
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
</style>