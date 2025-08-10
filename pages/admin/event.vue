<template>
  <div class="p-4 bg-[#F8F8FF]">
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-[#7A49C9]">Event</h1>
        </div>
        <div class="date-range-picker flex space-x-4 items-center">
          <Calendar
            v-model="dateRange"
            selectionMode="range"
            :manualInput="false"
            :showIcon="true"
            :showButtonBar="true"
            dateFormat="dd MM, yy"
            class="w-full max-w-xs p-inputtext-lg rounded-xl border border-gray-200 p-3 text-center text-blue-950 font-medium text-lg bg-transparent focus:ring-0 focus:outline-none"
            placeholder="Select Date Range"
            @date-select="updateDisplay"
          />
          <div>
            <IconnButton
              label="Create Event"
              icon="mdi:event-add"
              @click="goToCreateEvent"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Event Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
     <div class="mb-6 flex items-center justify-between mt-10  rounded-lg">
     <div class="flex items-center space-x-4">
  <div class="relative w-full">
    <div class="border border-gray-300 rounded-full overflow-hidden flex">
      <div class="relative flex-1">
        <Icon name="i-heroicons-magnifying-glass" class="absolute w-8 h-8 left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search"
          class="w-full pl-14  border-0 focus:ring-0 focus:outline-none bg-transparent p-3 rounded-full"
        />
      </div>
      <div class=" relative space-x-5">
     <Icon name="mynaui:filter" class="absolute w-8 h-8 left-3 top-1/2 bg-gradient-to-t from-blue-900 to-purple-800 transform -translate-y-1/2 text-grad" />
       <Button
          label="Filters"
          class="p-button-outlined px-5  text-purple-600 border-purple-600 w-full h-full rounded-none p-3"
          @click="toggleFilters"
        />
      </div>
    </div>
  </div>
</div>

    <div class="flex items-center space-x-4">
  <div class="relative">
    <!-- <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium">Sort</span> -->
    <Dropdown
      v-model="sortOption"
      :options="sortOptions"
      optionLabel="label"
      optionValue="value"
      class="w-30 p-dropdown-sm border bg-transparent border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg"
      @change="applySort"
    >
      <template #value="slotProps">
       <!-- <i class="pi pi-sort-amount-up mr-2 text-black"></i> -->
        <span v-if="slotProps.value" class="">{{ slotProps.value }}</span>
        <span v-else class="ml-14 text-black"></span>
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
    class=" border border-gray-300 bg-transparent rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
    @change="applyPageChange"
  />
  <span class="text-lg text-gray-700  border-l pl-2 border-gray-500"> Show {{ currentPage * itemsPerPage - (itemsPerPage - 1) }} to {{ Math.min(currentPage * itemsPerPage, totalItems) }} of {{ totalItems }}</span>
</div>
    </div>
    <!-- Events Table -->
    <DataTable
      :value="filteredEvents"
      :paginator="true"
      :rows="itemsPerPage"
      :totalRecords="totalItems"
      :lazy="true"
      @page="onPage"
      class="p-datatable-sm shadow-md overflow-hidden"
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
import { useRuntimeConfig } from '#app' // Import useRuntimeConfig

const router = useRouter()
const toast = useToast()
const runtimeConfig = useRuntimeConfig() // Get runtime config
const API_ADMIN_BASE_URL = runtimeConfig.public.apiAdminBaseUrl // Use from runtime config
const BEARER_TOKEN = runtimeConfig.public.bearerToken // Get bearer token

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
const itemsPerPage = ref(10)
const currentPage = ref(1)
const totalItems = ref(0)
const sortField = ref('date')
const sortOrder = ref(1) // 1 ascending, -1 descending

const events = ref([])

// Fetch events from API
const fetchEvents = async () => {
  try {
    const url = `${API_ADMIN_BASE_URL}/events`
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`, // Use the retrieved token
        'Content-Type': 'application/json',
      },
    })
    const data = await res.json()
    if (data.status === 200 && data.data.success) {
      events.value = data.data.data.map(ev => ({
        id: ev.id,
        name: ev.name,
        description: ev.description,
        organizer: ev.organizer,
        date: new Date(ev.start_date),
        venue: ev.location,
        type: ev.category_name,
        revenue: 0, // Not in API, keep 0
        bookings: 0, // Not in API, keep 0
        tickets: 0, // Not in API, keep 0
        status: ev.is_published ? 'Active' : 'Draft',
      }))
      totalItems.value = events.value.length
    } else {
      toast.add({ severity: 'error', summary: 'API Error', detail: 'Failed to fetch events', life: 3000 })
    }
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Fetch Error', detail: error.message, life: 3000 })
  }
}

onMounted(() => {
  fetchEvents()
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

const manageBooking = (event) =>
  toast.add({ severity: 'info', summary: 'Manage Booking', detail: `Managing ${event.name}`, life: 3000 })
const editEvent = (event) =>
  toast.add({ severity: 'info', summary: 'Edit Event', detail: `Editing ${event.name}`, life: 3000 })
const endEvent = (event) =>
  toast.add({ severity: 'info', summary: 'End Event', detail: `Ending ${event.name}`, life: 3000 })
const removeEvent = (event) =>
  toast.add({ severity: 'info', summary: 'Remove Event', detail: `Removing ${event.name}`, life: 3000 })

const getSortLabel = (value) => {
  const map = {
    'date-asc': 'Date (Ascending)',
    'date-desc': 'Date (Descending)',
    'name-asc': 'Name (A-Z)',
    'name-desc': 'Name (Z-A)',
  }
  return map[value] || value
}

definePageMeta({
  middleware: 'auth',
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