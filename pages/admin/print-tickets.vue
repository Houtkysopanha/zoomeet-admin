<template>
  <div class="min-h-screen bg-[#F8F8FF] p-6">
    <!-- Header Section -->
    <div class="mx-auto">
      <!-- Breadcrumb and Title -->
     
      <div class="mb-6">
          <div class="flex items-center justify-between">
        <Breadcrumb
          :items="[
            { text: 'Check-In Service', to: '/admin/checkIn' },
            { text: 'Print Tickets' }
          ]"
          class="mb-4"
        />
         <div class="flex space-x-3">
          <!-- <Button
            icon="pi pi-refresh"
            class="p-button-outlined p-button-sm"
            @click="loadOrganizers"
            :loading="loading"
            title="Refresh team members"
          /> -->
          <IconnButton label="Confirm to print" icon="material-symbols:print-outline-rounded" @click="inviteUser()" />
        </div>
               </div>
        <!-- Header with Title and Actions -->
        <div class="flex justify-between items-center mt-5">
          <div class="flex items-center gap-4">
            <span class="text-gray-700 font-medium">Total ticket(3)</span>
          </div>
          <div class="flex items-center gap-4 mr-3">
            <label class="flex items-center gap-2 text-gray-700 font-medium cursor-pointer">
              <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" class="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4">
              Select all tickets
            </label>
          </div>
        </div>
      </div>
      <!-- Print Preview Cards -->
      <div class="space-y-4">
        <div
          v-for="ticket in printTickets"
          :key="ticket.id"
          class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div class="flex">
            <!-- Left: Event Image and Info -->
            <div class="flex-1 flex">
              <!-- Event Poster with Checkbox -->
              <div class="w-80 relative overflow-hidden">
                <img 
                  :src="ticket.image" 
                  :alt="ticket.eventTitle"
                  class="w-full h-full object-cover"
                />
                <!-- Checkbox on top of image -->
                <div class="absolute top-4 left-4">
                  <input 
                    type="checkbox" 
                    v-model="ticket.selected" 
                    class="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-5 h-5 bg-white shadow-sm"
                    @change="updateSelectAll"
                  >
                </div>
                <!-- Event Title Overlay -->
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <h3 class="text-white font-semibold text-sm leading-tight">{{ ticket.eventTitle }}</h3>
                  <p class="text-white/80 text-xs mt-1">Owner: {{ ticket.owner }}</p>
                </div>
              </div>

              <!-- Ticket Details -->
              <div class="flex-1 p-6">
                <div class="grid grid-cols-3 gap-8">
                  <!-- First Column -->
                  <div class="space-y-4">
                    <div>
                      <span class="text-gray-500 text-sm">Ticket Holder</span>
                      <p class="font-semibold text-gray-900">{{ ticket.ticketHolder || '-' }}</p>
                    </div>
                    <div>
                      <span class="text-gray-500 text-sm">Phone Number or Email</span>
                      <p class="font-semibold text-gray-900">{{ ticket.phoneNumberOrEmail || '-' }}</p>
                    </div>
                  </div>

                  <!-- Second Column -->
                  <div class="space-y-4">
                    <div>
                      <span class="text-gray-500 text-sm">Booking Ref</span>
                      <p class="font-semibold text-gray-900">{{ ticket.bookingRef }}</p>
                    </div>
                    <div>
                      <span class="text-gray-500 text-sm">Ticket ID</span>
                      <p class="font-semibold text-gray-900">{{ ticket.ticketId }}</p>
                    </div>
                  </div>

                  <!-- Third Column -->
                  <div class="space-y-4">
                    <div>
                      <span class="text-gray-500 text-sm">Ticket Type</span>
                      <p class="font-semibold text-gray-900">{{ ticket.ticketType }}</p>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <span class="text-gray-500 text-sm">Gate</span>
                        <p class="font-semibold text-gray-900">{{ ticket.gate }}</p>
                      </div>
                      <div>
                        <span class="text-gray-500 text-sm">Seat Number</span>
                        <p class="font-semibold text-gray-900">{{ ticket.seatNumber }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Bottom Row - Location, Date, Time -->
                <div class="grid grid-cols-3 gap-8 mt-6 pt-4 border-t border-gray-100">
                  <div>
                    <span class="text-gray-500 text-sm">Location</span>
                    <p class="font-semibold text-gray-900">{{ ticket.location }}</p>
                  </div>
                  <div>
                    <span class="text-gray-500 text-sm">Date</span>
                    <p class="font-semibold text-gray-900">{{ ticket.date }}</p>
                  </div>
                  <div>
                    <span class="text-gray-500 text-sm">Time</span>
                    <p class="font-semibold text-gray-900">{{ ticket.time }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- QR Code Section -->
            <div class="w-48 p-6 bg-white border-l border-gray-200 flex flex-col justify-center items-center">
              <div class="text-center space-y-4">
                <h4 class="text-gray-800 font-semibold text-base">Scan to Enter</h4>
                
                <!-- QR Code -->
                <div class="w-24 h-24 bg-white border border-gray-300 rounded-lg p-1">
                  <div class="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                    <div class="grid grid-cols-8 gap-px w-20 h-20">
                      <div v-for="i in 64" :key="i" class="w-full h-full" :class="Math.random() > 0.5 ? 'bg-black' : 'bg-white'"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { definePageMeta, navigateTo } from '#imports'
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import img from '@/assets/image/poster-manage-booking.png'
import IconnButton from '~/components/ui/IconnButton.vue'
definePageMeta({
  layout: 'admin',
})


// Sample print tickets data
const printTickets = ref([
  {
    id: 1,
    selected: false,
    image: img,
    eventTitle: 'Navigating the future of cybersecurity in Cambodia 2015',
    owner: 'Fussac',
    ticketHolder: 'Sok Chenmeng',
    bookingRef: 'ZM2025001',
    phoneNumberOrEmail: '####### 424',
    ticketId: '1234',
    location: 'Hayatt Regency, Phnom Penh',
    ticketType: 'Premium',
    date: '14-16 July, 2025',
    gate: '3',
    time: '10:00 AM GMT+7',
    seatNumber: '-',
  },
  {
    id: 2,
    selected: false,
    image: img,
    eventTitle: 'Navigating the future of cybersecurity in Cambodia 2015',
    owner: 'Fussac',
    ticketHolder: '-',
    bookingRef: 'ZM2025001',
    phoneNumberOrEmail: '-',
    ticketId: '1234',
    location: 'Hayatt Regency, Phnom Penh',
    ticketType: 'Premium',
    date: '14-16 July, 2025',
    gate: '3',
    time: '10:00 AM GMT+7',
    seatNumber: '-',
  },
  {
    id: 3,
    selected: false,
    image: img,
    eventTitle: 'Navigating the future of cybersecurity in Cambodia 2015',
    owner: 'Fussac',
    ticketHolder: '-',
    bookingRef: 'ZM2025001',
    phoneNumberOrEmail: '-',
    ticketId: '1234',
    location: 'Hayatt Regency, Phnom Penh',
    ticketType: 'Premium',
    date: '14-16 July, 2025',
    gate: '3',
    time: '10:00 AM GMT+7',
    seatNumber: '-',
  }
])

const selectAll = ref(false)

const toggleSelectAll = () => {
  printTickets.value.forEach(ticket => {
    ticket.selected = selectAll.value
  })
}

const updateSelectAll = () => {
  const allSelected = printTickets.value.every(ticket => ticket.selected)
  const noneSelected = printTickets.value.every(ticket => !ticket.selected)
  
  if (allSelected) {
    selectAll.value = true
  } else if (noneSelected) {
    selectAll.value = false
  } else {
    selectAll.value = false
  }
}

const confirmPrint = () => {
  const selectedTickets = printTickets.value.filter(ticket => ticket.selected)
  console.log('Printing tickets:', selectedTickets)
  // Implement print functionality here
}
</script>

<style scoped>
/* Custom checkbox styling */
input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

/* Custom animations */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
