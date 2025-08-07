<template>
  <div class=" min-h-screen flex bg-[#F8F8FF] flex-col items-center p-6">
    <!-- Header Section -->
    <div class="relative w-full bg-gradient-to-r from-blue-800 to-purple-600 py-20 text-center rounded-3xl shadow-xl overflow-hidden transform transition-all duration-500 hover:scale-[1.02]">
      <!-- Animated Background Decorative Elements -->
      <Icon name="heroicons:ticket" class="absolute top-8 left-10 text-blue-200 w-12 h-12 animate-pulse" />
      <Icon name="heroicons:ticket" class="absolute top-1/2 left-20 text-blue-200 w-16 h-16 animate-spin-slow" />
      <Icon name="heroicons:ticket" class="absolute bottom-10 left-40 text-blue-200 w-10 h-10 animate-bounce" />
      <Icon name="heroicons:cube" class="absolute top-16 right-16 text-blue-200 w-20 h-20 animate-float" />
      <Icon name="heroicons:cube" class="absolute bottom-8 right-32 text-blue-200 w-14 h-14 animate-pulse-slow" />
      <Icon name="heroicons:ticket" class="absolute top-1/4 right-10 text-blue-200 w-12 h-12 animate-spin" />
      <Icon name="heroicons:ticket" class="absolute bottom-1/4 right-20 text-blue-200 w-16 h-16 animate-bounce-slow" />
      

      <h1 class="text-5xl font-extrabold text-white mb-6 relative z-10 drop-shadow-lg">Search Identity Verification Tickets</h1>
      <p class="text-xl text-white/90 mb-10 relative z-10 drop-shadow-md">
        Easily verify ticket holders by searching with booking reference, phone number, or ID.
      </p>

      <!-- Enhanced Search Input and Button -->
      <div class="relative z-50 flex justify-center">
        <div class="flex w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
          <InputText
            v-model="searchQuery"
            placeholder="Enter booking ref, phone, or ID..."
            class="flex-1 p-6 text-lg border-none focus:ring-2 focus:ring-purple-500 focus:outline-none rounded-l-full placeholder-gray-400"
            @keyup.enter="performSearch"
          />
          <Button
            label="Search"
            class="bg-purple-600 text-white p-3 m-4 text-xl rounded-2xl bg-gradient-to-t from-blue-800 to-purple-600 hover:bg-purple-700 transition-all duration-300 flex items-center gap-3"
            @click="performSearch"
          >
            <Icon name="heroicons:magnifying-glass" class="w-6 h-6" />
            Search Now
          </Button>
        </div>
      </div>
    </div>

    <!-- Content Area - Dynamic Results or Empty State -->
    <div class="flex-1 w-full max-w-7xl mt-12 p-6">
      <Transition name="fade" mode="out-in">
        <div v-if="searchResults.length === 0 && !loading" key="empty" class="flex flex-col items-center justify-center text-center min-h-[400px]">
          <img :src="img1" alt="No results found" class="mb-6 " />
          <p class="text-2xl font-semibold text-gray-700 mb-4">No Tickets Found</p>
          <p class="text-gray-500 max-w-md">Please try a different booking reference, phone number, or ID. Ensure the details are correct!</p>
        </div>
        <div v-else-if="loading" key="loading" class="flex items-center justify-center min-h-[400px]">
          <div class="text-xl text-gray-600">Loading tickets...</div>
        </div>
        <div v-else key="results" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="result in searchResults" :key="result.id" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ result.bookingId }}</h3>
            <p class="text-gray-600 mb-2">Name: {{ result.customerName }}</p>
            <p class="text-gray-600 mb-2">Phone: {{ result.phoneNumber }}</p>
            <p class="text-gray-600 mb-2">Date: {{ result.purchaseDate }}</p>
            <span class="inline-block px-3 py-1 rounded-full text-sm font-medium" :class="result.status === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'">{{ result.status }}</span>
            <Button
              label="Verify"
              class="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              @click="verifyTicket(result.id)"
            />
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import img1 from '@/assets/image/not-found.png'
// import { Icon } from '@iconify/vue'

definePageMeta({
  middleware: "auth",
  layout: "admin",
})

const searchQuery = ref('')
const loading = ref(false)
const searchResults = ref([])

// Sample data for demonstration
const sampleTickets = ref([
  {
    id: 1,
    bookingId: 'TK2025001',
    customerName: 'Sok Chenmeng',
    phoneNumber: '+855 123456789',
    purchaseDate: 'Aug 3, 2025',
    status: 'Pending',
  },
  {
    id: 2,
    bookingId: 'TK2025002',
    customerName: 'Sok Chenmeng',
    phoneNumber: '+855 987654321',
    purchaseDate: 'Aug 4, 2025',
    status: 'Verified',
  },
])

const performSearch = () => {
  loading.value = true
  console.log('Searching for:', searchQuery.value)
  // Simulate API call with a delay
  setTimeout(() => {
    searchResults.value = sampleTickets.value.filter((ticket) =>
      ticket.bookingId.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      ticket.phoneNumber.includes(searchQuery.value) ||
      ticket.customerName.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
    loading.value = false
  }, 1000) // 1-second delay to simulate loading
}

const verifyTicket = (id) => {
  const ticket = searchResults.value.find((t) => t.id === id)
  if (ticket) {
    ticket.status = 'Verified'
    console.log(`Ticket ${ticket.bookingId} verified at ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Phnom_Penh' })}`)
  }
}
</script>

<style scoped>
/* Custom animations */
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
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
@keyframes float {
  from { transform: translateY(0); }
  to { transform: translateY(-15px); }
}
@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

/* Fade transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>