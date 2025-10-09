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
          <div class="flex items-start space-x-3 flex-1">
            <div class="w-28 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 relative">
              <img
                :src="event.image"
                class="w-full h-full object-cover"
                :alt="event.name || 'Event image'"
                @error="handleImageError"
              />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-medium text-gray-900 leading-tight mb-2">
                {{ event.name }}
              </h3>
              <div class="flex items-center text-xs text-gray-500 mb-1">
                <Icon name="heroicons:map-pin" class="w-3 h-3 mr-1" />
                {{ event.location }}
              </div>
              <div class="flex items-center text-xs text-gray-500">
                <Icon name="heroicons:calendar" class="w-3 h-3 mr-1" />
                {{ event.date }} | {{ event.time }}
              </div>
            </div>
          </div>
          <span
            :class="[
              'px-2 py-1 rounded-full text-xs font-medium',
              event.status === 'ended' 
                ? 'bg-gray-100 text-gray-600' 
                : 'bg-green-100 text-green-600'
            ]"
          >
            {{ event.status === 'ended' ? 'Event has Ended' : 'Active' }}
          </span>
        </div>

       <!-- Event Metrics -->
  <div class="flex justify-between items-center gap-10 text-center mx-4">
    <!-- Total Revenue -->
    <div>
      <div class="text-sm text-gray-500 mb-1">Total Revenue</div>
      <div class="text-xl font-semibold text-gray-900">{{ event.totalRevenue }}</div>
    </div>

    <!-- Divider -->
    <div class="h-8 w-px bg-gray-300"></div>

    <!-- Booking -->
    <div >
      <div class="text-sm text-gray-500 mb-1">Booking</div>
      <div class="text-xl font-semibold text-gray-900">{{ event.booking }}</div>
    </div>

    <!-- Divider -->
    <div class="h-8 w-px bg-gray-300"></div>

    <!-- Tickets -->
    <div>
      <div class="text-sm text-gray-500 mb-1">Tickets</div>
      <div class="text-xl font-semibold text-gray-900">{{ event.tickets }}</div>
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
import { ref, computed, watch } from 'vue'
import Button from 'primevue/button'
// Props
const props = defineProps({
  recentEvents: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const showAll = ref(false)
const loading = ref(false)


// Transform API data to component format
const events = computed(() => {
  if (!props.recentEvents || props.recentEvents.length === 0) {
    return []
  }

  return props.recentEvents.map(event => {
    // Parse dates
    const startDate = new Date(event.start_date)
    const endDate = new Date(event.end_date)
    const currentDate = new Date()
    
    // Determine event status
    const isEventEnded = endDate < currentDate
    
    // Format dates
    const formatDate = (date) => {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    }
    
    const formatTime = (date) => {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }

    // Create date range string
    const startDateStr = formatDate(startDate)
    const endDateStr = formatDate(endDate)
    const dateRange = startDateStr === endDateStr ? startDateStr : `${startDateStr} - ${endDateStr}`

    // Debug image URL selection
    const selectedImage = event.cover_image_url || ""

    return {
      id: event.id,
      name: event.name,
      location: event.location,
      date: dateRange,
      time: formatTime(startDate),
      totalRevenue: `$${event.total_revenue?.toFixed(2) || '0.00'}`,
      booking: event.total_booking?.toString() || '0',
      tickets: event.total_ticket?.toString() || '0',
      status: isEventEnded ? 'ended' : 'active',
      image: selectedImage,
      category: event.category_name
    }
  })
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
  // Handle view report action
  console.log('View report for:', event.name, 'Event ID:', event.id)
  // You can add navigation to event report page here
  // For example: navigateTo(`/admin/event/${event.id}/report`)
}

function handleImageError(event) {
  console.log('🚫 Image failed to load:', event.target.src)
  // Set fallback image when the original image fails to load
  event.target.src = fallbackImage
  console.log('🔄 Using fallback image:', fallbackImage)
}

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