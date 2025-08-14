<template>
  <div class="p-6">
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-[#7A49C9] mb-2">Event</h1>
        </div>
        <div class="date-range-picker flex space-x-4 items-center">
          <Calendar
            v-model="dateRange"
            selectionMode="range"
            :manualInput="false"
            :showIcon="true"
            :showButtonBar="true"
            :dateFormat="'dd MM, yy'"
            class="w-full max-w-xs p-inputtext-lg rounded-xl border border-gray-200 p-3 text-center text-blue-950 font-medium text-lg focus:ring-0"
            placeholder="Select Date Range"
            @date-select="updateDisplay"
          />
          <Button
            label="Create Event"
            icon="pi pi-plus"
            class="p-button-indigo w-60 h-12 p-4 rounded-full text-white bg-gradient-to-t from-indigo-600 to-indigo-400 hover:from-indigo-700 hover:to-indigo-500"
            raised
          />
        </div>
      </div>
    </div>

    <!-- Event Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50">
      <EventStatsCard
        v-for="(stat, index) in eventStats"
        :key="index"
        :title="stat.title"
        :count="stat.count"
        :icon="stat.icon"
        :weekChange="stat.weekChange"
      />
    </div>

    <!-- Filters and Search -->
    <div class="mb-6 flex items-center justify-between bg-gray-50 p-4 rounded-lg">
      <div class="flex items-center space-x-4">
        <div class="relative">
          <Icon name="i-heroicons-magnifying-glass" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search"
            class="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          />
        </div>
        <Button
          label="Filters"
          icon="pi pi-filter"
          class="p-button-outlined p-button-purple text-purple-600 border-purple-600 hover:bg-purple-50"
          @click="toggleFilters"
        />
      </div>
      <div class="flex items-center space-x-4">
        <select
          v-model="sortOption"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
        >
          <option value="" disabled selected>Sort</option>
          <option value="date-asc">Date (Ascending)</option>
          <option value="date-desc">Date (Descending)</option>
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
        </select>
        <select
          v-model="itemsPerPage"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
        >
          <option value="10">Show 10</option>
          <option value="20">Show 20</option>
          <option value="50">Show 50</option>
        </select>
        <span class="text-sm text-gray-700">Show {{ currentPage * itemsPerPage - (itemsPerPage - 1) }} to {{ Math.min(currentPage * itemsPerPage, totalItems) }} of {{ totalItems }}</span>
      </div>
    </div>

    <!-- Events Table with Enhanced Responsiveness and Loading -->
    <TableLoader
      :loading="isLoading"
      text="Loading events..."
      size="md"
      :showSkeleton="!filteredEvents.length"
      :skeletonRows="itemsPerPage"
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
            sortField="date"
            :sortOrder="1"
            class="p-datatable-sm min-w-full"
          >
          <Column field="name" header="Event" sortable class="min-w-48">
            <template #body="slotProps">
              <div class="text-blue-900 font-medium text-responsive-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-48" :title="slotProps.data.name">
                {{ slotProps.data.name }}
              </div>
            </template>
          </Column>
          <Column field="date" header="Date" sortable class="min-w-32">
            <template #body="slotProps">
              <span class="text-responsive-xs whitespace-nowrap">{{ formatDate(slotProps.data.date) }}</span>
            </template>
          </Column>
          <Column field="venue" header="Venue" sortable class="min-w-40">
            <template #body="slotProps">
              <div class="text-responsive-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-40" :title="slotProps.data.venue">
                {{ slotProps.data.venue }}
              </div>
            </template>
          </Column>
          <Column field="type" header="Event Type" sortable class="min-w-32">
            <template #body="slotProps">
              <span class="text-responsive-xs whitespace-nowrap">{{ slotProps.data.type }}</span>
            </template>
          </Column>
          <Column field="revenue" header="Revenue" sortable class="min-w-28">
            <template #body="slotProps">
              <span class="text-responsive-xs font-medium whitespace-nowrap">{{ formatCurrency(slotProps.data.revenue) }}</span>
            </template>
          </Column>
          <Column field="bookings" header="Number of Booking" sortable class="min-w-32">
            <template #body="slotProps">
              <span class="text-responsive-xs whitespace-nowrap">{{ slotProps.data.bookings }}</span>
            </template>
          </Column>
          <Column field="tickets" header="Tickets" sortable class="min-w-24">
            <template #body="slotProps">
              <span class="text-responsive-xs whitespace-nowrap">{{ slotProps.data.tickets }}</span>
            </template>
          </Column>
          <Column field="status" header="Status" sortable class="min-w-24">
            <template #body="slotProps">
              <span :class="getStatusClass(slotProps.data.status)" class="whitespace-nowrap">{{ slotProps.data.status }}</span>
            </template>
          </Column>
          <Column field="actions" header="Actions" class="min-w-40">
            <template #body="slotProps">
              <div class="flex space-x-1 justify-center">
                <Button
                  v-if="slotProps.data.status === 'Active'"
                  icon="pi pi-cog"
                  class="p-button-rounded p-button-outlined p-button-indigo p-button-sm"
                  @click="manageBooking(slotProps.data)"
                  v-tooltip.top="'Manage Booking'"
                />
                <Button
                  icon="pi pi-pencil"
                  class="p-button-rounded p-button-outlined p-button-indigo p-button-sm"
                  @click="editEvent(slotProps.data)"
                  v-tooltip.top="'Edit Event'"
                />
                <Button
                  v-if="slotProps.data.status === 'Active'"
                  icon="pi pi-times"
                  class="p-button-rounded p-button-outlined p-button-red p-button-sm"
                  @click="endEvent(slotProps.data)"
                  v-tooltip.top="'End Event'"
                />
                <Button
                  icon="pi pi-trash"
                  class="p-button-rounded p-button-outlined p-button-red p-button-sm"
                  @click="removeEvent(slotProps.data)"
                  v-tooltip.top="'Delete Event'"
                />
              </div>
            </template>
          </Column>
          </DataTable>
        </div>
      </div>
    </TableLoader>

    <!-- Pagination (Redundant with DataTable paginator, kept for reference) -->
    <div class="flex items-center justify-between mt-8" v-if="false">
      <div class="text-sm text-gray-700">
        Showing <span class="font-medium">{{ currentPage * itemsPerPage - (itemsPerPage - 1) }}</span> to <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, totalItems) }}</span> of <span class="font-medium">{{ totalItems }}</span> results
      </div>
      <div class="flex space-x-2">
        <Button label="Previous" class="p-button-outlined p-button-indigo hover:bg-gray-50" @click="previousPage" :disabled="currentPage === 1" />
        <Button :label="currentPage.toString()" class="p-button-indigo" :disabled="true" />
        <Button label="2" class="p-button-outlined p-button-indigo hover:bg-gray-50" @click="nextPage" :disabled="currentPage * itemsPerPage >= totalItems" />
        <Button label="Next" class="p-button-outlined p-button-indigo hover:bg-gray-50" @click="nextPage" :disabled="currentPage * itemsPerPage >= totalItems" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import Calendar from 'primevue/calendar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import EventStatsCard from '~/components/EventStatsCard.vue'
import TableLoader from '~/components/ui/TableLoader.vue'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

// Loading state for table data
const isLoading = ref(false)

const eventStats = [
  { title: 'Total Events', count: '28', icon: 'i-heroicons-calendar', weekChange: '2' },
  { title: 'Complete Event', count: '23', icon: 'i-heroicons-check-circle', weekChange: '2' },
  { title: 'Ongoing', count: '5', icon: 'i-heroicons-play', weekChange: '2' },
  { title: 'Draft', count: '24', icon: 'i-heroicons-pencil', weekChange: '2' },
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
const sortOption = ref('date-asc')
const itemsPerPage = ref(10)
const currentPage = ref(1)
const totalItems = ref(206)

const events = ref([
  { name: 'National Conference of Digital Transformation 2025', date: new Date('2022-01-22'), venue: 'Conventions center', type: 'Conference', revenue: 1200, bookings: 1280, tickets: 1180, status: 'Active' },
  { name: 'Boeng Mealea Meeting fan concert', date: new Date('2022-01-22'), venue: 'J&T Tower', type: 'Concert', revenue: 1200, bookings: 1280, tickets: 1180, status: 'Active', owner: 'Fussac' },
  { name: 'Follow upnew album diss track', date: new Date('2022-01-22'), venue: 'J&T Tower', type: 'Concert', revenue: 1200, bookings: 1280, tickets: 1180, status: 'Active', owner: 'Fussac' },
  { name: 'Asian Music showcase festival 2025', date: new Date('2022-01-22'), venue: 'Shokha Hotel', type: 'Concert', revenue: 1200, bookings: 1280, tickets: 1180, status: 'Active', owner: 'Fussac' },
  { name: 'National Conference of Digital Transformation 2025', date: new Date('2022-01-22'), venue: 'Khmer Enterprise', type: 'Conference', revenue: 1200, bookings: 1280, tickets: 1180, status: 'Active', owner: 'Fussac' },
  { name: 'Asian Music showcase festival 2025', date: new Date('2022-01-22'), venue: 'TechNo Start up', type: 'Concert', revenue: 1200, bookings: 1280, tickets: 1180, status: 'Completed' },
  { name: 'Asian Music showcase festival 2025', date: new Date('2022-01-22'), venue: 'Conventions center', type: 'Concert', revenue: 1200, bookings: 1280, tickets: 1180, status: 'Completed' },
  { name: 'National Conference of Digital Transformation 2025', date: new Date('2022-01-22'), venue: 'The Primum Sen Sok', type: 'Conference', revenue: 1200, bookings: 1280, tickets: 1180, status: 'Completed', owner: 'Fussac' },
  { name: 'Boeng Mealea Meeting fan concert', date: new Date('2022-01-22'), venue: 'Conventions center', type: 'Concert', revenue: 1200, bookings: 1280, tickets: 1180, status: 'Completed', owner: 'Fussac' },
  { name: 'Follow upnew album diss track', date: new Date('2022-01-22'), venue: 'Conventions center', type: 'Concert', revenue: 1200, bookings: 1280, tickets: 1180, status: 'Completed', owner: 'Fussac' },
  { name: 'National Conference of Digital Transformation 2025', date: new Date('2022-01-22'), venue: 'Conventions center', type: 'Conference', revenue: 1200, bookings: 1280, tickets: 1180, status: 'Completed', owner: 'Fussac' },
  { name: 'Boeng Mealea Meeting fan concert', date: new Date('2022-01-22'), venue: 'Conventions center', type: 'Concert', revenue: 1200, bookings: 1280, tickets: 1180, status: 'Completed', owner: 'Fussac' },
])

const filteredEvents = computed(() => {
  let result = [...events.value]
  if (searchQuery.value) {
    result = result.filter(event =>
      event.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  if (sortOption.value) {
    result = result.sort((a, b) => {
      const [field, order] = sortOption.value.split('-')
      const valueA = field === 'date' ? a.date.getTime() : a[field] || ''
      const valueB = field === 'date' ? b.date.getTime() : b[field] || ''
      return order === 'asc' ? valueA.localeCompare(valueB) : -valueA.localeCompare(valueB)
    })
  }
  totalItems.value = result.length
  return result.slice((currentPage.value - 1) * itemsPerPage.value, currentPage.value * itemsPerPage.value)
})

const onPage = (event) => {
  currentPage.value = event.page + 1
  // Simulate loading when changing pages
  loadData()
}

// Simulate data loading
const loadData = async () => {
  isLoading.value = true
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    // Data is already loaded in the events array
  } finally {
    isLoading.value = false
  }
}

const formatDate = (date) => date.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
const formatCurrency = (value) => `$${value.toLocaleString()}`

const getStatusClass = (status) => {
  const classes = {
    Active: 'bg-green-100 text-green-800 px-2 py-1 rounded',
    Completed: 'bg-gray-100 text-gray-800 px-2 py-1 rounded'
  }
  return classes[status] || 'bg-gray-100 text-gray-800 px-2 py-1 rounded'
}

const toggleFilters = () => {
  toast.add({ severity: 'info', summary: 'Filters', detail: 'Filter functionality to be implemented', life: 3000 })
}

const manageBooking = (event) => toast.add({ severity: 'info', summary: 'Manage Booking', detail: `Managing ${event.name}`, life: 3000 })
const editEvent = (event) => toast.add({ severity: 'info', summary: 'Edit Event', detail: `Editing ${event.name}`, life: 3000 })
const endEvent = (event) => toast.add({ severity: 'info', summary: 'End Event', detail: `Ending ${event.name}`, life: 3000 })
const removeEvent = (event) => toast.add({ severity: 'info', summary: 'Remove Event', detail: `Removing ${event.name}`, life: 3000 })

const previousPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value * itemsPerPage.value < totalItems.value) currentPage.value++
}

definePageMeta({
  middleware: "auth",
  layout: "admin",
})
</script>

<style scoped>
.date-range-picker :deep(.p-calendar) {
  display: flex;
  align-items: center;
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0.5rem 1rem;
}

.date-range-picker :deep(.p-calendar .p-inputtext) {
  border: none;
  background: transparent;
  flex-grow: 1;
  font-size: 1rem;
  color: #1e3a8a;
}

.date-range-picker :deep(.p-calendar .p-datepicker-trigger) {
  margin-left: 0.5rem;
  color: #1e3a8a;
}

.date-range-picker :deep(.p-calendar .p-datepicker-trigger:enabled:hover) {
  background: none;
  color: #1e3a8a;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: #f3f4f6;
  color: #1f2937;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  border-bottom: 1px solid #e5e7eb;
}

:deep(.p-button.p-button-outlined) {
  border-color: currentColor;
}
</style>