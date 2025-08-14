<template>
  <div class="bg-[#F8F8FF] border border-gray-200 rounded-2xl shadow-sm p-4 sm:p-6 max-w-4xl mx-auto h-[calc(80vh-8rem)] overflow-hidden flex flex-col">
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
    <!-- Events Scroll Area with Note Icon -->
    <div class="flex-1 overflow-y-auto pr-1">
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
            <div class="flex items-center text-xs text-gray-500">
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
import { ref, computed, onMounted } from 'vue'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
const toast = useToast()
const isLoadingMore = ref(false)
const currentDate = ref(new Date(2025, 6, 6)) // July 6, 2025 (month is 0-indexed)
const selectedDay = ref(6)
import img from '@/assets/image/poster-manage-booking.png'

// Sample event data
const events = ref([
  {
    id: 1,
    title: 'Navigating the future of cybersecurity in Cambodia 2015',
    location: 'Hyatt Regency, Phnom Penh',
    time: '10:00 AM GMT+7',
    image: img
  },
  {
    id: 2,
    title: 'Navigating the future of cybersecurity in Cambodia 2015',
    location: 'Hyatt Regency, Phnom Penh',
    time: '10:00 AM GMT+7',
    image: img
  },
  {
    id: 3,
    title: 'Navigating the future of cybersecurity in Cambodia 2015',
    location: 'Hyatt Regency, Phnom Penh',
    time: '10:00 AM GMT+7',
    image: img
  },
  {
    id: 4,
    title: 'Navigating the future of cybersecurity in Cambodia 2015',
    location: 'Hyatt Regency, Phnom Penh',
    time: '10:00 AM GMT+7',
    image: img
  },
  {
    id: 5,
    title: 'Digital Innovation Summit 2025',
    location: 'Sofitel Phnom Penh Phokeethra',
    time: '2:00 PM GMT+7',
    image: img
  },
  {
    id: 6,
    title: 'Southeast Asia Tech Conference',
    location: 'NagaWorld Hotel & Entertainment Complex',
    time: '9:00 AM GMT+7',
    image: img
  },
   {
    id: 7,
    title: 'Southeast Asia Tech Conference',
    location: 'NagaWorld Hotel & Entertainment Complex',
    time: '9:00 AM GMT+7',
    image: img
  },
   {
    id: 8,
    title: 'Southeast Asia Tech Conference',
    location: 'NagaWorld Hotel & Entertainment Complex',
    time: '9:00 AM GMT+7',
    image: img
  },
  {
    id: 9,
    title: 'Southeast Asia Tech Conference',
    location: 'NagaWorld Hotel & Entertainment Complex',
    time: '9:00 AM GMT+7',
    image: img
  }
])

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
const previousMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  currentDate.value = newDate
  toast.info(`Switched to ${currentMonthYear.value}`)
}

const nextMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  currentDate.value = newDate
  toast.info(`Switched to ${currentMonthYear.value}`)
}

const selectDay = (day) => {
  selectedDay.value = parseInt(day.date)
  toast.success(`Selected ${day.dayName}, ${day.date}`)
}

const viewEvent = (event) => {
  toast.info(`Opening: ${event.title}`)
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

onMounted(() => {
  // Ensure days container is referenced
  // No motion due to previous issues
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