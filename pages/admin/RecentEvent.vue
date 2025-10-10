<template>
  <!-- Recent event News -->
  <div class="p-6 bg-white rounded-2xl border border-gray-200 h-[calc(80vh-8rem)] overflow-hidden flex flex-col">
    <h2 class="text-xl font-semibold text-gray-900 mb-6">Recent events</h2>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p class="text-gray-500">Loading recent events...</p>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <Icon name="heroicons:exclamation-triangle" class="h-16 w-16 text-red-400 mx-auto mb-4" />
        <p class="text-red-500 text-lg mb-2">Error Loading Events</p>
        <p class="text-gray-400 text-sm mb-4">{{ error }}</p>
        <Button
          label="Try Again"
          icon="pi pi-refresh"
          class="p-button-sm"
          @click="loadEvents()"
        />
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="events.length === 0" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <Icon name="heroicons:calendar-days" class="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500 text-lg mb-2">No recent events</p>
        <p class="text-gray-400 text-sm">Recent events will appear here once you create them.</p>
      </div>
    </div>

    <!-- Events list -->
    <div v-else class="flex-1 overflow-y-auto space-y-4">
      <div
        v-for="(event, index) in visibleEvents"
        :key="event.id || index"
        class="bg-[#F9FAFB] rounded-2xl p-4 "
      >
        <!-- Event Header -->
        <div class="flex items-start justify-between mb-4">
         <div class="flex items-stretch space-x-3 flex-1">
  <!-- Image -->
  <div class="w-36 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 relative">
    <img
      :src="event.image || img"
      class="w-full h-full object-cover"
      :alt="event.name || 'Event image'"
      @error="handleRecentImageError"
    />
  </div>

  <!-- Text -->
  <div class="flex flex-col mt-1 justify-between flex-1 min-w-0 py-1">
    <div>
      <h3 class="text-md font-normal text-gray-900 leading-tight mb-2 truncate">
        {{ event.name }}
      </h3>
      <div class="flex items-center text-sm text-[#002B59B2] mb-2">
        <Icon name="heroicons:map-pin" class="w-4 h-4 mr-1" />
        <span class="truncate">{{ event.location }}</span>
      </div>
      <div class="flex items-center text-sm text-[#002B59B2]">
        <Icon name="heroicons:calendar" class="w-4 h-4 mr-1" />
        <span class="truncate">{{ event.date }} | {{ event.time }}</span>
      </div>
    </div>
  </div>
</div>

        <span
  :class="[
    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
    event.status === 'ended'
      ? 'bg-gray-50 text-gray-600'
      : 'bg-green-50 text-green-600'
  ]"
>
  <Icon
    name="radix-icons:dot-filled"
    class="w-3.5 h-3.5"
  />
  {{ event.status === 'ended' ? 'Event has Ended' : 'Active' }}
</span>

        </div>

       <!-- Event Metrics -->
  <div class="flex justify-between items-center gap-10 text-center mx-4">
    <!-- Total Revenue -->
    <div>
      <div class="text-sm text-black mb-1">Total Revenue</div>
      <div class="text-xl font-bold text-gray-900">{{ event.totalRevenue }}</div>
    </div>

    <!-- Divider -->
    <div class="h-8 w-px bg-gray-300"></div>

    <!-- Booking -->
    <div >
      <div class="text-sm text-black mb-1">Booking</div>
      <div class="text-xl font-bold text-gray-900">{{ event.booking }}</div>
    </div>

    <!-- Divider -->
    <div class="h-8 w-px bg-gray-300"></div>

    <!-- Tickets -->
    <div>
      <div class="text-sm text-black mb-1">Tickets</div>
      <div class="text-xl font-bold text-gray-900">{{ event.tickets }}</div>
    </div>
  </div>

  <!-- View Report Button -->
  <div class="flex justify-center mt-5">
    <Button
      label="View Report"
      icon="pi pi-chart-bar"
      class="p-button-sm text-purple-600  rounded-lg hover:bg-purple-50"
      @click="viewReport(event)"
    />
  </div>


      </div>

      <!-- Show More Button -->
      <div v-if="!showAll && events.length > visibleEvents.length" class="flex justify-center pt-4">
        <Button
          label="Show more"
          icon="pi pi-chevron-down"
          :loading="loading"
          class="p-button-text text-blue-600 border-none hover:bg-blue-50"
          @click="showMore"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { useRecentEvents } from '@/composables/useRecentEvents.js'
import img from '@/assets/image/poster-manage-booking.png'

const toast = useToast()

// Use the recent events composable
const { 
  formattedEvents, 
  dashboardSummary,
  isLoading, 
  error, 
  loadEvents 
} = useRecentEvents()

const showAll = ref(false)
const loading = ref(false)

// Use formatted events from composable with fallback image
const events = computed(() => {
  return formattedEvents.value.map(event => ({
    ...event,
    image: event.image || img // Fallback to default image
  }))
})

const visibleEvents = computed(() => {
  return showAll.value ? events.value : events.value.slice(0, 3)
})

function showMore() {
  loading.value = true
  setTimeout(() => {
    showAll.value = true
    loading.value = false
  }, 500)
}

function viewReport(event) {
  // Handle view report action  // Navigate to sale report page with the event ID
  navigateTo(`/admin/report/saleReport?eventId=${event.id}`)
}

function handleRecentImageError(event) {
  // Set fallback image when the original image fails to load
  event.target.src = img  
  // Optional: Add error class for styling
  event.target.classList.add('image-error')
}

// Load recent events when component mounts
onMounted(async () => {
  const result = await loadEvents()
  
  if (!result.success) {
    toast.error(result.message)
  } else if (result.count === 0) {
    toast.info('No recent events found')
  } else {
    toast.success(`Loaded ${result.count} recent events`)
    
    // Log dashboard summary if available
    if (result.summary) {
    }
  }
})

</script>

<style scoped>
/* Custom scrollbar for the events container */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Card hover effect */

/* Button customizations */
:deep(.p-button-outlined) {
  border-width: 1px;
  font-weight: 500;
}

:deep(.p-button-outlined:hover) {
  transform: translateY(-1px);
  transition: transform 0.2s ease-in-out;
}

:deep(.p-button-text:hover) {
  background-color: rgba(59, 130, 246, 0.05) !important;
}
</style>