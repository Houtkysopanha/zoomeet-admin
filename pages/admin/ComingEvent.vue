<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-200  p-4 sm:p-6 max-w-4xl mx-auto h-[calc(80vh-8rem)] overflow-hidden flex flex-col">
    <!-- Header -->
    <h2 class="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Upcoming events</h2>

    <!-- Month Navigation -->
    <div class="flex items-center justify-between mb-4 sm:mb-6 bg-color">
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
    <div class="flex items-center justify-between mb-7">
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
            :class="{
              'selected-day': day.isSelected,
              'calendar-day': !day.isSelected && !day.isToday,
              'today-day': day.isToday && !day.isSelected
            }"
            @click="selectDay(day)"
          >
            <span class="text-base sm:text-md font-normal" 
                  :class="{
                    'text-white': day.isSelected,
                    'text-blue-600': day.isToday && !day.isSelected,
                    'text-gray-600': !day.isSelected && !day.isToday
                  }">
              {{ day.dayName }}
            </span>
            <span class="text-2xl sm:text-lg font-bold" 
                  :class="{
                    'text-white': day.isSelected,
                    'text-blue-600': day.isToday && !day.isSelected,
                    'text-gray-800': !day.isSelected && !day.isToday
                  }">
              {{ day.date }}
            </span>
            <div v-if="day.isToday && !day.isSelected" class="w-1 h-1 bg-blue-600 rounded-full mt-1"></div>
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
                :src="event.image || img" 
                :alt="event.title"
                class="w-36 h-full rounded-lg object-cover shadow-md group-hover:shadow-lg transition-shadow duration-200"
                @error="handleUpcomingImageError"
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
const currentDate = ref(new Date(2025, 6, 1)) // July 1, 2025 (month is 0-indexed) 
const selectedDay = ref(6) // Start with July 6th as shown in UI
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
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const today = new Date()
  
  // Start from the selected day in the current month, or day 1 if selectedDay is not set
  const startDay = selectedDay.value || 1
  
  // Create consecutive days starting from startDay
  const days = []
  
  for (let i = 0; i < 7; i++) {
    const dayNumber = startDay + i
    const date = new Date(year, month, dayNumber)
    
    // Check if this date is valid for the current month
    if (date.getMonth() === month) {
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      
      // Only show today and future dates
      if (dateStart >= todayStart) {
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
        const isToday = dateStart.getTime() === todayStart.getTime()
        const isSelected = selectedDay.value === dayNumber
        
        days.push({
          dayName,
          date: String(dayNumber).padStart(2, '0'),
          fullDate: date,
          isSelected: isSelected,
          isToday: isToday
        })
      }
    }
  }
  
  return days
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
  const today = new Date()
  
  // Prevent going to months that are entirely in the past
  newDate.setMonth(newDate.getMonth() - 1)
  
  // Check if the new month is entirely in the past
  const lastDayOfNewMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0)
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  
  if (lastDayOfNewMonth < todayStart) {
    toast.warn('Cannot navigate to past months. Only current and future months are allowed.')
    return
  }
  
  currentDate.value = newDate
  toast.info(`Switched to ${currentMonthYear.value}`)
  
  // Find the first valid day (today or later) in the new month
  const isCurrentMonth = newDate.getFullYear() === today.getFullYear() && newDate.getMonth() === today.getMonth()
  const startDay = isCurrentMonth ? today.getDate() : 1
  
  selectedDay.value = startDay
  
  const startDate = new Date(newDate.getFullYear(), newDate.getMonth(), startDay)
  const result = await loadEvents(startDate)
  if (!result.success) {
    toast.warn(result.message)
  }
}

const nextMonth = async () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  currentDate.value = newDate
  toast.info(`Switched to ${currentMonthYear.value}`)
  
  // Reset to first day of new month or today, whichever is later
  const today = new Date()
  const firstDayOfMonth = new Date(newDate.getFullYear(), newDate.getMonth(), 1)
  const startDay = today > firstDayOfMonth ? today.getDate() : 1
  
  selectedDay.value = startDay
  
  const startDate = new Date(newDate.getFullYear(), newDate.getMonth(), startDay)
  const result = await loadEvents(startDate)
  if (!result.success) {
    toast.warn(result.message)
  }
}

const selectDay = async (day) => {
  selectedDay.value = parseInt(day.date)
  
  // Use the full date from the day object to ensure correct date
  const selectedDate = day.fullDate
  
  // Check if the selected date is not in the past
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  
  if (selectedDate < todayStart) {
    toast.warn('Cannot select past dates. Please select today or future dates.')
    return
  }
  
  // Load events for the selected date
  const result = await loadEvents(selectedDate)
  if (!result.success) {
    toast.warn(result.message)
  } else if (result.count === 0) {
    toast.info(`No upcoming events found for ${day.dayName}, ${day.date}`)
  } else {
    toast.success(`Found ${result.count} event(s) for ${day.dayName}, ${day.date}`)
  }
}

function viewEvent(event) {
  toast.info(`Opening: ${event.title}`)
  // You can add navigation to event details here
  // For example: navigateTo(`/admin/events/${event.id}`)
}

function handleUpcomingImageError(event) {
  console.log('🚫 Upcoming event image failed to load:', event.target.src)
  // Set fallback image when the original image fails to load
  event.target.src = img
  console.log('🔄 Using fallback image for upcoming event:', img)
  
  // Optional: Add error class for styling
  event.target.classList.add('image-error')
}

const previousDays = async () => {
  // Move the start day back by 3 days
  const newStartDay = Math.max(1, selectedDay.value - 3)
  selectedDay.value = newStartDay
  
  // Load events for the new start day
  const newDate = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), newStartDay)
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  
  if (newDate >= todayStart) {
    const result = await loadEvents(newDate)
    if (result.success && result.count > 0) {
      toast.success(`Found ${result.count} event(s) for ${newDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`)
    }
  }
}

const nextDays = async () => {
  // Move the start day forward by 3 days
  const daysInMonth = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0).getDate()
  const newStartDay = Math.min(daysInMonth - 6, selectedDay.value + 3)
  selectedDay.value = newStartDay
  
  // Load events for the new start day
  const newDate = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), newStartDay)
  const result = await loadEvents(newDate)
  if (result.success && result.count > 0) {
    toast.success(`Found ${result.count} event(s) for ${newDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`)
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
  // Initialize with the UI pattern (July 6-12, 2025) but respect current date logic
  const today = new Date()
  const targetDate = new Date(2025, 6, 6) // July 6, 2025 as shown in UI
  
  // Use today's date if we're past the target date, otherwise use target date
  const dateToUse = today > targetDate ? today : targetDate
  
  // Set the current month and selected day
  currentDate.value = new Date(dateToUse.getFullYear(), dateToUse.getMonth(), 1)
  selectedDay.value = dateToUse.getDate()
  
  // Load events for the selected date
  const result = await loadEvents(dateToUse)
  
  if (!result.success) {
    toast.error(result.message)
  } else if (result.count === 0) {
    toast.info(`No upcoming events found for ${dateToUse.toLocaleDateString()}`)
  } else {
    toast.success(`Loaded ${result.count} upcoming events`)
  }
})
</script>

<style scoped>
/* Calendar Day Styling */
.calendar-day {
  @apply bg-[#E9EBF8] border border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-50 hover:border-gray-300;
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

/* Image Error Handling */
.image-error {
  opacity: 0.7;
  filter: grayscale(20%);
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

.today-day {
  @apply bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 hover:bg-blue-100 hover:border-blue-300;
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
  padding: 10px;
  border-radius: 10px;
}
</style>