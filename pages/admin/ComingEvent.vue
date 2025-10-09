<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-200  p-4 sm:p-6 max-w-4xl mx-auto h-[calc(80vh-8rem)] overflow-hidden flex flex-col">
    <!-- Header -->
    <h2 class="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Upcoming events</h2>

    <!-- Month Navigation -->
    <div class="flex items-center justify-between mb-4 sm:mb-6 bg-color mx-5">
      <Button 
        icon="pi pi-chevron-left" 
        text 
        rounded 
        size="small"
        @click="previousMonth"
        class="text-gray-500 hover:text-gray-700 border rounded-md w-6 h-6"
      />
      <h3 class="text-base sm:text-lg font-medium text-gray-800">
        {{ currentMonthYear }}
      </h3>
      <Button 
        icon="pi pi-chevron-right" 
        text 
        rounded 
        size="small"
        @click="nextMonth"
        class="text-gray-500 hover:text-gray-700 border rounded-md w-6 h-6"
      />
    </div>

    <!-- Calendar Days Navigation -->
    <!-- Calendar Days Navigation -->
    <div class="flex items-center justify-between mb-4">
      <Button 
        icon="pi pi-chevron-left"
        text 
        rounded 
        size="small"
        @click="previousDays"
        class="text-gray-500 hover:text-gray-700 border rounded-md w-6 h-6"
      />
      <div class="flex-1 overflow-x-auto scrollbar-hide">
        <div class="flex space-x-4 px-2" ref="daysContainer">
          <div 
            v-for="day in visibleDays" 
            :key="day.date"
            class="flex flex-col items-center justify-center cursor-pointer transition-all duration-200 w-20 h-14 p-4"
            :class="day.isSelected ? 'selected-day' : 'calendar-day'"
            @click="selectDay(day)"
          >
            <span class="text-base sm:text-md font-normal" :class="day.isSelected ? 'text-white' : 'text-gray-600'">
              {{ day.dayName }}
            </span>
            <span class="text-2xl sm:text-lg font-bold" :class="day.isSelected ? 'text-white' : 'text-gray-800'">
              {{ day.date }}
            </span>
          </div>
        </div>
      </div>
      <Button 
        icon="pi pi-chevron-right"
        text 
        rounded 
        size="small"
        @click="nextDays"
        class="text-gray-500 hover:text-gray-700 border rounded-md w-6 h-6"
      />
    </div>
    <!-- Loading State -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p class="text-gray-500">Loading upcoming events...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <i class="pi pi-exclamation-triangle text-4xl text-red-400 mb-4"></i>
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

    <!-- Empty State -->
    <div v-else-if="events.length === 0" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <i class="pi pi-calendar text-4xl text-gray-400 mb-4"></i>
        <p class="text-gray-500 text-lg mb-2">No upcoming events</p>
        <p class="text-gray-400 text-sm">No events found for the selected date.</p>
      </div>
    </div>

    <!-- Events Scroll Area with Note Icon -->
    <div v-else class="flex-1 overflow-y-auto pr-1">
      <div class="space-y-4 pb-4">
        <div 
          v-for="(event) in events" 
          :key="event.id"
          class="flex items-start space-x-4 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer group"
          @click="viewEvent(event)"
        >
          <!-- Event Image -->
          <div class="flex-shrink-0">
            <img 
              :src="event.image" 
              :alt="event.title"
              class="w-20 h-20 rounded-lg object-cover shadow-md group-hover:shadow-lg transition-shadow duration-200"
              @error="event.image = img"
            />
          </div>

          <!-- Event Details -->
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
              {{ event.title }}
            </h4>
            <div class="flex items-center text-xs text-gray-500 mb-1">
              <i class="pi pi-map-marker text-xs mr-2"></i>
              <span>{{ event.location }}</span>
            </div>
            <div class="flex items-center text-xs text-gray-500 mb-1">
              <i class="pi pi-clock text-xs mr-2"></i>
              <span>{{ event.time }}</span>
            </div>
            <div class="flex items-center text-xs text-gray-500">
              <i class="pi pi-tag text-xs mr-2"></i>
              <span>{{ event.category }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- Note Icon as Scroll Cue -->
      <div v-if="events.length > 4" class="flex justify-center mt-4 text-gray-400">
        <i class="pi pi-sticky-note text-2xl animate-bounce"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { useUpcomingEvents } from '@/composables/useUpcomingEvents.js'
import img from '@/assets/image/poster-manage-booking.png'

const toast = useToast()
const isLoadingMore = ref(false)
const currentDate = ref(new Date(2025, 6, 6)) // July 6, 2025 (month is 0-indexed)
const selectedDay = ref(6)
const daysContainer = ref(null)

// Use the upcoming events composable
const { 
  formattedEvents, 
  isLoading, 
  error, 
  loadEvents 
} = useUpcomingEvents()

// Use formatted events from composable with fallback image
const events = computed(() => {
  return formattedEvents.value.map(event => ({
    ...event,
    image: event.image || img // Fallback to default image
  }))
})

// Computed properties
const currentMonthYear = computed(() => {
  const options = { month: 'long', year: 'numeric' }
  return currentDate.value.toLocaleDateString('en-US', options)
})

const calendarDays = computed(() => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const startDate = 6 // Starting from July 6th
  return days.map((dayName, index) => ({
    dayName,
    date: String(startDate + index).padStart(2, '0'),
    isSelected: selectedDay.value === startDate + index
  }))
})

const visibleDays = computed(() => {
  const totalDays = calendarDays.value.length
  const startIdx = currentDayOffset.value
  return calendarDays.value.slice(startIdx, startIdx + 5)
})

const currentDayOffset = ref(0)

// Methods
const previousMonth = async () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  currentDate.value = newDate
  toast.info(`Switched to ${currentMonthYear.value}`)
  
  // Load events for the selected day in the new month
  const selectedDate = new Date(newDate.getFullYear(), newDate.getMonth(), selectedDay.value)
  const result = await loadEvents(selectedDate)
  if (!result.success) {
    toast.warn(result.message)
  }
}

const nextMonth = async () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  currentDate.value = newDate
  toast.info(`Switched to ${currentMonthYear.value}`)
  
  // Load events for the selected day in the new month
  const selectedDate = new Date(newDate.getFullYear(), newDate.getMonth(), selectedDay.value)
  const result = await loadEvents(selectedDate)
  if (!result.success) {
    toast.warn(result.message)
  }
}

const selectDay = async (day) => {
  selectedDay.value = parseInt(day.date)
  toast.success(`Selected ${day.dayName}, ${day.date}`)
  
  // Calculate the selected date based on current month and selected day
  const selectedDate = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), selectedDay.value)
  
  // Load events for the selected date
  const result = await loadEvents(selectedDate)
  if (!result.success) {
    toast.warn(result.message)
  } else if (result.count === 0) {
    toast.info('No events found for this date')
  }
}

const viewEvent = (event) => {
  toast.info(`Opening: ${event.title}`)
  // You can add navigation to event details here
  // For example: navigateTo(`/admin/events/${event.id}`)
}

const previousDays = () => {
  if (currentDayOffset.value > 0) {
    currentDayOffset.value -= 2
    scrollDaysContainer(-1)
  }
}

const nextDays = () => {
  if (currentDayOffset.value + 5 < calendarDays.value.length) {
    currentDayOffset.value += 2
    scrollDaysContainer(1)
  }
}

const scrollDaysContainer = (direction) => {
  const container = daysContainer.value
  if (container) {
    const scrollAmount = direction * 150 // Adjust based on day width
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }
}

onMounted(async () => {
  // Load initial events for the default date (2025-10-03)
  const defaultDate = new Date(2025, 9, 3) // October 3, 2025
  const result = await loadEvents(defaultDate)
  
  if (!result.success) {
    toast.error(result.message)
  } else if (result.count === 0) {
    toast.info('No upcoming events found for the default date')
  } else {
    toast.success(`Loaded ${result.count} upcoming events`)
  }
})
</script>

<style scoped>
/* Calendar Day Styling */
.calendar-day {
  @apply bg-white border border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-50 hover:border-gray-300;
  @apply transition-all duration-200;
}

.selected-day {
  @apply bg-custom-gradient rounded-lg px-4 py-3;
  @apply shadow-lg hover:shadow-xl;
  @apply transform hover:scale-105;
  @apply transition-all duration-200;
}

/* Event Card Hover Effects */
.group:hover img {
  transform: scale(1.05);
}

/* Smooth transitions for all interactive elements */
* {
  transition-property: transform, box-shadow, background-color, border-color, color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.calendar-day {
  @apply bg-white border border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-50 hover:border-gray-300;
}

.selected-day {
  @apply bg-custom-gradient rounded-lg px-4 py-3 shadow-lg text-white;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.bg-color {
  background-color: #F6F9F9;
}
</style>