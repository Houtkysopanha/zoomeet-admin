<template>
  <div class="bg-gray-50">
    <!-- Main Content Area -->
    <div class="w-full">
      <!-- Customer Information -->
      <div class="bg-white rounded-2xl p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-1">Customer Information</h2>
        <p class="text-gray-500 mb-6">Enter customer detail for booking</p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="grid-cols-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <InputText v-model="customerInfo.fullName" placeholder="ZM2025001" class="w-full p-3 rounded-lg bg-gray-100" />
          </div>
          <div class="grid-cols-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <div class="flex">
              <!-- Prefix section -->
              <div class="flex items-center px-3 bg-gray-100 rounded-l-lg">
                <img :src="flat" alt="Cambodia" class="w-8 h-8 mr-2 rounded-sm" />
                <span class="text-gray-600 border-l-2 px-1 border-gray-600">+855</span>
              </div>
              <!-- Input section -->
              <InputText v-model="customerInfo.phoneNumber" class="flex-1 p-3 bg-gray-100 rounded-lg !rounded-l-none" />
            </div>
          </div>
          <div class="grid-cols-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <InputText v-model="customerInfo.email" placeholder="Email" class="w-full p-3 rounded-lg bg-gray-100" />
          </div>
        </div>
      </div>

      <!-- Select Event -->
      <div>
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-4">
            <div>
              <h2 class="text-xl font-semibold text-gray-800 mb-1">Select Event</h2>
              <p class="text-gray-500">Choose the event for booking</p>
            </div>
            <div>
              <span class="text-blue-600 font-medium px-3 py-1 rounded-full bg-blue-50">Now {{ events.length }} event available</span>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <!-- Layout Toggle Buttons -->
            <div class="flex bg-gray-100 rounded-lg p-1">
              <Button
                @click="layoutView = 'grid'"
                :class="[
                  'p-2 !rounded-md transition-all duration-200',
                  layoutView === 'grid' ? '!bg-white !shadow-sm !text-purple-600' : '!bg-transparent !text-gray-500 hover:!text-gray-700',
                ]"
                severity="secondary"
                text
                title="Grid View"
              >
                <Icon name="heroicons:squares-2x2" class="w-5 h-5" />
              </Button>
              <Button
                @click="layoutView = 'column'"
                :class="[
                  'p-2 !rounded-md transition-all duration-200',
                  layoutView === 'column' ? '!bg-white !shadow-sm !text-purple-600' : '!bg-transparent !text-gray-500 hover:!text-gray-700',
                ]"
                severity="secondary"
                text
                title="Column View"
              >
                <Icon name="heroicons:list-bullet" class="w-5 h-5" />
              </Button>
            </div>
            <div class="relative">
              <Icon name="heroicons:magnifying-glass" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <InputText v-model="searchQuery" placeholder="Search" class="pl-10 pr-4 py-3 border border-blue-300 rounded-full w-80 bg-gray-50" />
            </div>
          </div>
        </div>

        <!-- Event Cards - Grid Layout -->
        <div v-if="layoutView === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="event in filteredEvents"
            :key="event.id"
            class="rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer bg-[#FFFFFF]"
            @click="selectEvent(event)"
          >
            <div class="relative overflow-hidden">
              <img :src="event.image" :alt="event.title" class="w-full  object-cover" />
            </div>
            <div class="p-4">
              <h3 class="font-semibold text-gray-800 mb-3 text-sm leading-tight line-clamp-2">
                {{ event.title }}
              </h3>
              <div class="flex items-start text-gray-600 mb-4">
                <Icon name="heroicons:map-pin" class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span class="text-sm">{{ event.location }}</span>
              </div>
              <div class="grid grid-cols-2 bg-white p-4 border border-gray-200 rounded-2xl shadow-md gap-4 text-sm text-center">
                <div class="border-r-2 border-gray-200">
                  <div class="text-gray-500 mb-1">Date</div>
                  <div class="font-medium text-gray-800">{{ event.date }}</div>
                </div>
                <div>
                  <div class="text-gray-500 mb-1">Time</div>
                  <div class="font-medium text-gray-800">{{ event.time }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Event Cards - Column Layout -->
        <div v-else class="space-y-4">
          <div
            v-for="event in filteredEvents"
            :key="event.id"
            class="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer bg-white flex"
            @click="selectEvent(event)"
          >
            <div class="w-48 relative overflow-hidden flex-shrink-0 rounded-lg">
              <img :src="event.image" :alt="event.title" class="w-full h-full object-cover rounded-lg" />
            </div>
            <div class="flex-1 p-4 flex flex-col justify-between">
              <div>
                <h3 class="font-semibold text-gray-800 mb-2 text-base leading-tight line-clamp-2">
                  {{ event.title }}
                </h3>
                <div class="flex items-start text-gray-600 mb-3">
                  <Icon name="heroicons:map-pin" class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span class="text-sm">{{ event.location }}</span>
                </div>
              </div>
              <div class="flex gap-8 text-sm">
                <div>
                  <div class="text-gray-500 mb-1">Date</div>
                  <div class="font-medium text-gray-800">{{ event.date }}</div>
                </div>
                <div>
                  <div class="font-medium text-gray-800">{{ event.time }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Detail Sidebar Component -->
    <EventDetail
      v-model:visible="visible"
      :selected-event="selectedEvent"
      @book-now="handleBookNowClick"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
// Import the new EventDetailSidebar component
import EventDetail from './EventDetail.vue'

import img1 from '@/assets/image/poster-manage-booking.png'
import flat from '../assets/image/cambodia.png'

// Customer information
const customerInfo = ref({
  fullName: 'ZM2025001',
  phoneNumber: '',
  email: '',
})

// Search functionality
const searchQuery = ref('')

// Layout state: 'grid' for 3-column, 'column' for single column
const layoutView = ref('grid')

// Events data
const events = ref([
  {
    id: 1,
    title: 'Navigating the future of cybersecurity in Cambodia 2015',
    location: 'Hayatt Regency, Phnom Penh',
    date: '14-16 July, 2025',
    time: '10:00 AM GMT+7',
    image: img1,
  },
  {
    id: 2,
    title: 'Navigating the future of cybersecurity in Cambodia 2015',
    location: 'Hayatt Regency, Phnom Penh',
    date: '14-16 July, 2025',
    time: '10:00 AM GMT+7',
    image: img1,
  },
  {
    id: 3,
    title: 'Navigating the future of cybersecurity in Cambodia 2015',
    location: 'Hayatt Regency, Phnom Penh',
    date: '14-16 July, 2025',
    time: '10:00 AM GMT+7',
    image: img1,
  },
  {
    id: 4,
    title: 'Navigating the future of cybersecurity in Cambodia 2015',
    location: 'Hayatt Regency, Phnom Penh',
    date: '14-16 July, 2025',
    time: '10:00 AM GMT+7',
    image: img1,
  },
  {
    id: 5,
    title: 'Navigating the future of cybersecurity in Cambodia 2015',
    location: 'Hayatt Regency, Phnom Penh',
    date: '14-16 July, 2025',
    time: '10:00 AM GMT+7',
    image: img1,
  },
  {
    id: 6,
    title: 'Navigating the future of cybersecurity in Cambodia 2015',
    location: 'Hayatt Regency, Phnom Penh',
    date: '14-16 July, 2025',
    time: '10:00 AM GMT+7',
    image: img1,
  },
])

// Computed property for filtered events
const filteredEvents = computed(() => {
  if (!searchQuery.value) return events.value
  return events.value.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Sidebar state
const visible = ref(false)
const selectedEvent = ref(null)

// Methods
const selectEvent = (event) => {
  selectedEvent.value = event
  visible.value = true
}

const handleBookNowClick = (event) => {
  // console.log('Book Now clicked for event:', event.title);
  // You can add further logic here, e.g., navigate to a booking page
  // or open a booking form modal.
  visible.value = false; // Close the sidebar after clicking book now
}
</script>

<style scoped>
/* PrimeVue component overrides for consistent styling */
:deep(.p-inputtext) {
  @apply focus:ring-0 focus:ring-purple-500 focus:border-purple-500;
}
/* Ensure input text next to flag is not rounded on left */
:deep(.p-inputtext.\!rounded-l-none) {
  @apply rounded-l-none;
}
/* Custom button styling for layout toggle */
:deep(.p-button) {
  @apply transition-all duration-200;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
