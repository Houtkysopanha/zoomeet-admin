<template>
  <div class="min-h-screen flex bg-[#F8F8FF] flex-col items-center p-6 overflow-y-hidden">
    <div
      class="relative w-full bg-gradient-to-r from-[#6A3ABF] to-[#A060F0] py-20 text-center rounded-3xl shadow-xl overflow-hidden transform transition-all duration-500 hover:scale-[1.02]"
    >
      <Icon name="heroicons:ticket" class="absolute top-8 left-10 text-white/20 w-12 h-12 animate-pulse" />
      <Icon name="heroicons:ticket" class="absolute top-1/2 left-20 text-white/20 w-16 h-16 animate-spin-slow" />
      <Icon name="heroicons:ticket" class="absolute bottom-10 left-40 text-white/20 w-10 h-10 animate-bounce" />
      <Icon name="heroicons:cube" class="absolute top-16 right-16 text-white/20 w-20 h-20 animate-float" />
      <Icon name="heroicons:cube" class="absolute bottom-8 right-32 text-white/20 w-14 h-14 animate-pulse-slow" />
      <Icon name="heroicons:ticket" class="absolute top-1/4 right-10 text-white/20 w-12 h-12 animate-spin" />
      <Icon name="heroicons:ticket" class="absolute bottom-1/4 right-20 text-white/20 w-16 h-16 animate-bounce-slow" />
      <h1 class="text-5xl font-extrabold text-white mb-6 relative z-10 drop-shadow-lg">
        Search Identity Verification Tickets
      </h1>
      <p class="text-xl text-white/90 mb-10 relative z-10 drop-shadow-md">
        Search by booking reference, phone number, or ID to verify ticket holder identity
      </p>
      <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl">
        <div class="flex w-full bg-white rounded-xl shadow-lg overflow-hidden">
          <InputText
            v-model="generalSearchQuery"
            placeholder="Search identity tickets"
            class="flex-1 p-4 text-lg border-none focus:ring-2 focus:ring-purple-500 focus:outline-none rounded-l-xl placeholder-gray-400"
            @keyup.enter="performGeneralSearch"
          />
          <Button
            label="Search"
            class="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white py-3 px-6 rounded-r-xl hover:from-purple-700 hover:to-fuchsia-700 transition-all duration-200 flex items-center gap-2 text-lg font-semibold shadow-md"
            @click="performGeneralSearch"
          >
            <Icon name="heroicons:magnifying-glass" class="w-5 h-5" />
            Search
          </Button>
        </div>
      </div>
    </div>
    <div class="flex-1 w-full mt-12 p-2">
      <Transition name="fade" mode="out-in">
        <div v-if="!searchPerformed" key="searchForm" class="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="bookingReference" class="block text-gray-700 text-sm font-medium mb-2"
                >Booking reference</label
              >
              <InputText
                id="bookingReference"
                v-model="bookingReference"
                placeholder="ZM2025001"
                class="w-full p-3 rounded-lg bg-blue-50 border-none focus:ring-2 focus:ring-blue-200 focus:outline-none text-gray-800"
              />
            </div>
            <div>
              <label for="ticketId" class="block text-gray-700 text-sm font-medium mb-2">Ticket ID</label>
              <InputText
                id="ticketId"
                v-model="ticketId"
                placeholder="e.g. #1234"
                class="w-full p-3 rounded-lg bg-blue-50 border-none focus:ring-2 focus:ring-blue-200 focus:outline-none text-gray-800"
              />
            </div>
            <div>
              <label for="email" class="block text-gray-700 text-sm font-medium mb-2">Email</label>
              <InputText
                id="email"
                v-model="email"
                placeholder="e.g. info@gmail.com"
                class="w-full p-3 rounded-lg bg-blue-50 border-none focus:ring-2 focus:ring-blue-200 focus:outline-none text-gray-800"
              />
            </div>
            <div>
              <label for="phoneNumber" class="block text-gray-700 text-sm font-medium mb-2">Phone number</label>
              <InputText
                id="phoneNumber"
                v-model="phoneNumber"
                placeholder="e.g. +855 976028424"
                class="w-full p-3 rounded-lg bg-blue-50 border-none focus:ring-2 focus:ring-blue-200 focus:outline-none text-gray-800"
              />
            </div>
          </div>
          <div class="flex justify-end mt-6">
            <Button
              label="Search"
              class="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-fuchsia-700 transition-all duration-200 flex items-center gap-2 text-lg font-semibold shadow-md"
              @click="performDetailedSearch"
            >
              <Icon name="heroicons:magnifying-glass" class="w-5 h-5" />
              Search
            </Button>
          </div>
        </div>
        <div v-else-if="loading" key="loading" class="flex items-center justify-center min-h-[400px]">
          <div class="text-xl text-gray-600">Loading tickets...</div>
        </div>
        <div v-else key="results">
          <h2 class="text-2xl font-semibold text-gray-800 mb-6">Result ({{ searchResults.length }})</h2>
          <div class="space-y-6">
            <div
              v-for="result in searchResults"
              :key="result.id"
              class="bg-white rounded-xl shadow-lg p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-center"
            >
               <!-- Use the new TicketDetailsCard component here  -->
              <TicketCard :result="result" />
            </div>
          </div>
        </div>
      </Transition>
      <Transition name="fade" mode="out-in">
        <div v-if="showError" class="mt-6 text-center">
          <div
            class="inline-flex items-center bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm"
          >
            <Icon name="heroicons:exclamation-triangle" class="w-6 h-6 mr-3 text-red-500" />
            <div>
              <p class="font-semibold">Insufficient information</p>
              <p class="text-sm">To search, you must fill in two or more pieces of information.</p>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { definePageMeta } from '#imports'
import img from '@/assets/image/poster-manage-booking.png'
import TicketCard from '~/components/common/TicketCard.vue'
import Divider from 'primevue/divider' // Import Divider if you use it directly in this file

definePageMeta({
  middleware: 'auth',
  layout: 'admin',
})

const generalSearchQuery = ref('')
const bookingReference = ref('')
const ticketId = ref('')
const email = ref('')
const phoneNumber = ref('')
const showError = ref(false)
const loading = ref(false)
const searchResults = ref([])
const searchPerformed = ref(false) // New state to control initial view

// Sample data for demonstration, matching the UI fields
const sampleTickets = ref([
  {
    id: 1,
    status: 'Check-in',
    image: img,
    eventTitle: 'Navigating the future of cybersecurity in Cambodia 2015',
    owner: 'Fussac',
    ticketHolder: 'Sok Chenmeng',
    bookingRef: '1',
    phoneNumberOrEmail: '###### 424',
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
    status: 'Not Check-in',
    image: img,
    eventTitle: 'Quer deixar seu cliente IMPRESSIONADO?',
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
    status: 'Check-in',
    image: img,
    eventTitle: 'Tech Innovation Summit 2025',
    owner: 'Global Tech',
    ticketHolder: 'Jane Doe',
    bookingRef: 'TX2025003',
    phoneNumberOrEmail: '+855 11223344',
    ticketId: '5678',
    location: 'Phnom Penh Convention Center',
    ticketType: 'VIP',
    date: '20-22 August, 2025',
    gate: '1',
    time: '09:00 AM GMT+7',
    seatNumber: 'A12',
  },
])

const performGeneralSearch = () => {
  loading.value = true
  searchPerformed.value = true // Indicate that a search has been performed
  showError.value = false // Hide error message from detailed search
  console.log('Performing general search for:', generalSearchQuery.value)
  setTimeout(() => {
    const query = generalSearchQuery.value.toLowerCase()
    searchResults.value = sampleTickets.value.filter(
      (ticket) =>
        ticket.bookingRef.toLowerCase().includes(query) ||
        ticket.ticketId.toLowerCase().includes(query) ||
        ticket.phoneNumberOrEmail.toLowerCase().includes(query) ||
        ticket.ticketHolder.toLowerCase().includes(query)
    )
    loading.value = false
  }, 1000)
}

const performDetailedSearch = () => {
  const filledFields = [bookingReference.value, ticketId.value, email.value, phoneNumber.value].filter(
    (field) => field && field.trim() !== ''
  ).length
  if (filledFields < 2) {
    showError.value = true
    searchPerformed.value = false // Keep form visible if validation fails
    searchResults.value = [] // Clear previous results
  } else {
    showError.value = false
    loading.value = true
    searchPerformed.value = true // Indicate that a search has been performed
    console.log('Performing detailed search with:', {
      bookingReference: bookingReference.value,
      ticketId: ticketId.value,
      email: email.value,
      phoneNumber: phoneNumber.value,
    })
    setTimeout(() => {
      const refQuery = bookingReference.value.toLowerCase()
      const idQuery = ticketId.value.toLowerCase()
      const emailPhoneQuery = (email.value || phoneNumber.value).toLowerCase()
      searchResults.value = sampleTickets.value.filter((ticket) => {
        const matchesRef = refQuery ? ticket.bookingRef.toLowerCase().includes(refQuery) : true
        const matchesId = idQuery ? ticket.ticketId.toLowerCase().includes(idQuery) : true
        const matchesEmailPhone = emailPhoneQuery
          ? ticket.phoneNumberOrEmail.toLowerCase().includes(emailPhoneQuery) ||
            ticket.email?.toLowerCase().includes(emailPhoneQuery)
          : true
        // Logic to match at least two fields (simplified for demo, adjust as needed)
        let matchCount = 0
        if (refQuery && ticket.bookingRef.toLowerCase().includes(refQuery)) matchCount++
        if (idQuery && ticket.ticketId.toLowerCase().includes(idQuery)) matchCount++
        if (email.value && ticket.phoneNumberOrEmail.toLowerCase().includes(email.value.toLowerCase())) matchCount++
        if (phoneNumber.value && ticket.phoneNumberOrEmail.toLowerCase().includes(phoneNumber.value.toLowerCase()))
          matchCount++
        return matchCount >= 2 // Ensure at least two fields match
      })
      loading.value = false
    }, 1000)
  }
}

// The assignTicket function is now part of TicketDetailsCard.vue,
// but if you need to call it from the parent, you'd emit an event from the child.
// For now, I've kept the console.log in the child component.
</script>

<style scoped>
/* Custom animations (retained from your original code) */
.animate-spin-slow {
  animation: spin 4s linear infinite;
}
.animate-bounce-slow {
  animation: bounce 3s infinite;
}
.animate-float {
  animation: float 2s ease-in-out infinite alternate;
}
.animate-pulse-slow {
  animation: pulse 3s infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
@keyframes float {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-15px);
  }
}
@keyframes pulse {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}
/* Fade transition for error message and content */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
/* PrimeVue InputText overrides for blue background */
:deep(.p-inputtext) {
  background-color: #ebf8ff !important; /* Light blue background */
  border: none !important;
  box-shadow: none !important;
}
:deep(.p-inputtext:focus) {
  box-shadow: 0 0 0 2px rgba(147, 197, 253, 0.5) !important; /* Focus ring for blue-200 */
}
/* PrimeVue Button overrides for search button */
:deep(.p-button) {
  border: none !important;
  box-shadow: none !important;
}
</style>