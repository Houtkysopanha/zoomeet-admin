<template>
  <!-- Recent event News -->
  <div class="p-6 bg-white rounded-2xl border border-gray-200 h-[calc(80vh-8rem)] overflow-hidden flex flex-col">
    <h2 class="text-xl font-semibold text-gray-900 mb-6">Recent events</h2>

    <div class="flex-1 overflow-y-auto space-y-4">
      <div
        v-for="(event, index) in visibleEvents"
        :key="index"
        class="bg-[#F9FAFB] rounded-2xl p-4 "
      >
        <!-- Event Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-start space-x-3 flex-1">
            <img
              :src="event.image"
              class="w-28 h-20 rounded-lg object-cover flex-shrink-0"
              alt="event"
            />
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
          <div class="flex justify-between items-center my-3 mx-5">
            <div>
              <div class="text-xs text-gray-500 mb-1">Total Revenue</div>
              <div class="text-lg font-semibold text-gray-900">{{ event.totalRevenue }}</div>
            </div>
            |
            <div >
              <div class="text-xs text-gray-500 text-start mb-1">Booking</div>
              <div class="text-lg font-semibold text-gray-900">{{ event.booking }}</div>
            </div>
            |
            <div>
              <div class="text-xs text-gray-500 mb-1">Tickets</div>
              <div class="text-lg font-semibold text-gray-900">{{ event.tickets }}</div>
            </div>
          </div>
       <div class="flex justify-center items-center">
         <Button
            label="View Report"
            icon="pi pi-chart-bar"
            class=" p-button-sm text-purple-600  hover:bg-purple-50"
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
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import img from '@/assets/image/poster-manage-booking.png'

const events = ref([
  {
    name: 'Navigating the future of cybersecurity in Cambodia 2015',
    location: 'Hyatt Regency, Phnom Penh',
    date: '14-16 July, 2025',
    time: '10:00 AM GMT+7',
    totalRevenue: '$230,650',
    booking: '1,000',
    tickets: '3,000',
    status: 'ended',
    image: img,
  },
  {
    name: 'Navigating the future of cybersecurity in Cambodia 2015',
    location: 'Hyatt Regency, Phnom Penh',
    date: '14-16 July, 2025',
    time: '10:00 AM GMT+7',
    totalRevenue: '$230,650',
    booking: '1,000',
    tickets: '3,000',
    status: 'active',
    image: img,
  },
  {
    name: 'Navigating the future of cybersecurity in Cambodia 2015',
    location: 'Hyatt Regency, Phnom Penh',
    date: '14-16 July, 2025',
    time: '10:00 AM GMT+7',
    totalRevenue: '$230,650',
    booking: '1,000',
    tickets: '3,000',
    status: 'active',
    image: img,
  },
  {
    name: 'Boeung Mealia Meeting fan concert follow up new album diss strack',
    location: 'Hyatt Regency, Phnom Penh',
    date: '16 July, 2025',
    time: '10:00 AM GMT+7',
    totalRevenue: '$230,650',
    booking: '1,000',
    tickets: '3,000',
    status: 'active',
    image: img,
  },
  {
    name: 'Asian Music showcase festival 2025',
    location: 'Hyatt Regency, Phnom Penh',
    date: '14–16 July, 2025',
    time: '10:00 AM GMT+7',
    totalRevenue: '$230,650',
    booking: '1,000',
    tickets: '3,000',
    status: 'active',
    image: img,
  },
  {
    name: 'Navigating the future of cybersecurity in Cambodia 2015',
    location: 'Hyatt Regency, Phnom Penh',
    date: '14–16 July, 2025',
    time: '10:00 AM GMT+7',
    totalRevenue: '$230,650',
    booking: '1,000',
    tickets: '3,000',
    status: 'active',
    image: img,
  },
  {
    name: 'World business summit - There are many variations',
    location: 'Hyatt Regency, Phnom Penh',
    date: '14–16 July, 2025',
    time: '10:00 AM GMT+7',
    totalRevenue: '$230,650',
    booking: '1,000',
    tickets: '3,000',
    status: 'active',
    image: img,
  },
])

const showAll = ref(false)
const loading = ref(false)

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
  console.log('View report for:', event.name)
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