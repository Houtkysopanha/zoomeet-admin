<template>
  <div class="min-h-screen flex bg-[#F8F8FF] flex-col items-center p-6 overflow-y-hidden">
    <div
      class="relative w-full bg-gradient-to-r from-[#6A3ABF] to-[#A060F0] py-20 text-center rounded-3xl shadow-xl transform transition-all duration-500 hover:scale-[1.02]"
    >
      <Icon name="heroicons:ticket" class="absolute top-8 left-10 text-white/20 w-12 h-12 " />
      <Icon name="heroicons:ticket" class="absolute top-1/2 left-20 text-white/20 w-16 h-16 " />
      <Icon name="heroicons:ticket" class="absolute bottom-10 left-40 text-white/20 w-10 h-10" />
      <Icon name="heroicons:cube" class="absolute top-16 right-16 text-white/20 w-20 h-20 " />
      <Icon name="heroicons:cube" class="absolute bottom-8 right-32 text-white/20 w-14 h-14" />
      <Icon name="heroicons:ticket" class="absolute bottom-1/4 right-20 text-white/20 w-16 h-16" />
      <h1 class="text-5xl font-extrabold text-white mb-6 relative z-10 drop-shadow-lg">
        Search Identity Verification Tickets
      </h1>
      <p class="text-xl text-white/90 mb-10 relative z-10 drop-shadow-md">
        Search by booking reference, phone number, or ID to verify ticket holder identity
      </p>
      <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 z-20 w-full max-w-5xl">
        <div class="flex w-full bg-white rounded-xl shadow-lg overflow-hidden">
          <InputText
            v-model="generalSearchQuery"
            placeholder="Search identity tickets"
            class="flex-1 p-5 text-lg border-none focus:ring-2 focus:ring-purple-500 focus:outline-none rounded-l-xl placeholder-gray-400"
            @keyup.enter="performGeneralSearch"
          />
          <Button
            v-if="!showSearchForm"
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
      <Transition name="slide-fade" mode="out-in">
        <!-- Search Form with Tabs -->
        <div v-if="!searchPerformed && showSearchForm" key="searchForm" class="bg-white rounded-xl shadow-lg p-6 max-w-5xl mx-auto">
          <!-- Tab Navigation -->
          <div class="flex w-full mb-4 border-b border-gray-200">
            <button
              @click="activeTab = 'phone'"
              :class="[
                'flex-1 px-4 py-3 font-medium text-base transition-all duration-300 text-center',
                activeTab === 'phone'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              ]"
            >
              Phone Number
            </button>
            <button
              @click="activeTab = 'email'"
              :class="[
                'flex-1 px-4 py-3 font-medium text-base transition-all duration-300 text-center',
                activeTab === 'email'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              ]"
            >
              Email
            </button>
          </div>

          <!-- Tab Content -->
          <div class="space-y-4">
            <!-- Phone Number Tab -->
            <div v-if="activeTab === 'phone'" class="space-y-4">
              <div class="w-full">
                <label for="phoneNumber" class="block text-gray-700 text-sm font-medium mb-2">Phone number</label>
                <InputText
                  id="phoneNumber"
                  v-model="phoneNumber"
                  placeholder="+855 93984640"
                  class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none text-gray-800 transition-all duration-200"
                />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="bookingReference" class="block text-gray-700 text-sm font-medium mb-2">Booking reference</label>
                  <InputText
                    id="bookingReference"
                    v-model="bookingReference"
                    placeholder="ZM2025001"
                    class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none text-gray-800 transition-all duration-200"
                  />
                </div>
                <div>
                  <label for="ticketId" class="block text-gray-700 text-sm font-medium mb-2">Ticket ID</label>
                  <InputText
                    id="ticketId"
                    v-model="ticketId"
                    placeholder="Ticket ID"
                    class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none text-gray-800 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            <!-- Email Tab -->
            <div v-if="activeTab === 'email'" class="space-y-4">
              <div class="w-full">
                <label for="email" class="block text-gray-700 text-sm font-medium mb-2">Email</label>
                <InputText
                  id="email"
                  v-model="email"
                  placeholder="example@email.com"
                  class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none text-gray-800 transition-all duration-200"
                />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="bookingReferenceEmail" class="block text-gray-700 text-sm font-medium mb-2">Booking reference</label>
                  <InputText
                    id="bookingReferenceEmail"
                    v-model="bookingReferenceEmail"
                    placeholder="ZM2025001"
                    class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none text-gray-800 transition-all duration-200"
                  />
                </div>
                <div>
                  <label for="ticketIdEmail" class="block text-gray-700 text-sm font-medium mb-2">Ticket ID</label>
                  <InputText
                    id="ticketIdEmail"
                    v-model="ticketIdEmail"
                    placeholder="Ticket ID"
                    class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none text-gray-800 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            <!-- Search Button -->
            <div class="flex justify-end mt-6">
              <Button
                label="Search"
                class="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white py-3 px-8 rounded-lg hover:from-purple-700 hover:to-fuchsia-700 transition-all duration-200 flex items-center gap-2 text-lg font-semibold shadow-md"
                @click="performDetailedSearch"
              >
                <Icon name="heroicons:magnifying-glass" class="w-5 h-5" />
                Search
              </Button>
            </div>
          </div>
        </div>

        <!-- Initial empty state with illustration -->
        <div v-else-if="!searchPerformed && !showSearchForm" key="emptyState" class="flex flex-col items-center justify-center min-h-[500px] space-y-8">
          <!-- Search illustration -->
          <div class="relative">
            <!-- Main magnifying glass circle -->
            <div class="w-32 h-32 border-4 border-gray-300 rounded-full relative">
              <!-- Documents inside the magnifying glass -->
              <div class="absolute top-4 left-4 w-6 h-8 bg-gray-200 rounded-sm"></div>
              <div class="absolute top-6 right-4 w-6 h-6 bg-gray-300 rounded-sm"></div>
              <div class="absolute bottom-4 left-6 w-8 h-6 bg-gray-250 rounded-sm"></div>
              <!-- Small decorative elements -->
              <div class="absolute -top-2 -left-2 w-3 h-3 bg-blue-200 rounded-full"></div>
              <div class="absolute -top-1 right-2 w-2 h-2 bg-purple-200 rounded-full"></div>
              <div class="absolute bottom-2 -right-2 w-2 h-2 bg-gray-300 rounded-full"></div>
            </div>
            <!-- Magnifying glass handle -->
            <div class="absolute -bottom-6 -right-6 w-8 h-8 border-4 border-gray-400 rounded-full bg-gray-300 transform rotate-45"></div>
            <!-- Decorative dots around -->
            <div class="absolute -top-4 left-1/2 w-1 h-1 bg-gray-400 rounded-full"></div>
            <div class="absolute top-1/2 -left-6 w-1 h-1 bg-gray-400 rounded-full"></div>
            <div class="absolute top-1/2 -right-6 w-1 h-1 bg-gray-400 rounded-full"></div>
            <div class="absolute -bottom-8 left-1/4 w-1 h-1 bg-gray-400 rounded-full"></div>
          </div>
          
          <!-- Empty state text -->
          <div class="text-center space-y-2">
            <h3 class="text-xl font-medium text-gray-600">Search for tickets</h3>
            <p class="text-gray-500 text-sm">Enter search criteria above to find tickets</p>
          </div>
        </div>
        
        <!-- Loading state -->
        <div v-else-if="loading" key="loading" class="flex items-center justify-center min-h-[400px]">
          <div class="text-xl text-gray-600">Loading tickets...</div>
        </div>
        
        <!-- Search results -->
        <div v-else key="results" class="mx-auto">
          <!-- Results Summary Bar -->
          <div class="flex justify-between items-center mb-6 rounded-lg p-4 ">
            <div class="flex items-center space-x-6">
              <span class="text-gray-700 font-medium">Total number ({{ searchResults.length }})</span>
              <span class="text-gray-400">|</span>
              <span class="text-gray-700 font-medium">Assign ({{ searchResults.filter(r => r.isAssigned).length }})</span>
              <span class="text-gray-400">|</span>
              <span class="text-gray-700 font-medium">Unassign ({{ searchResults.filter(r => !r.isAssigned).length }})</span>
              <span class="text-gray-400">|</span>
              <span class="text-gray-700 font-medium">Check-in ({{ searchResults.filter(r => r.status === 'Check-in').length }})</span>
            </div>
            <Button
              label="Print Tickets"
              icon="pi pi-print"
              class="bg-white border border-purple-500 text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg transition-all duration-200"
              outlined
              @click="navigateToPrintTickets"
            />
          </div>

          <!-- Ticket Cards -->
          <div class="space-y-4">
            <div
              v-for="result in searchResults"
              :key="result.id"
              class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div class="flex">
                <!-- Left: Event Image and Info -->
                <div class="flex-1 flex">
                  <!-- Event Poster -->
                  <div class="relative overflow-hidden">
                    <img 
                      :src="result.image" 
                      :alt="result.eventTitle"
                      class="w-full h-full object-cover"
                    />
                    <!-- Status Badge -->
                    <div class="absolute top-3 left-3">
                      <span 
                        v-if="result.status === 'Check-in'"
                        class="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium"
                      >
                        ✓ Check-in
                      </span>
                      <span 
                        v-else
                        class="bg-gray-400 text-white px-3 py-1 rounded-full text-sm font-medium"
                      >
                        Not Check-in
                      </span>
                    </div>
                    <!-- Event Title Overlay -->
                    <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <h3 class="text-white font-semibold text-sm leading-tight">{{ result.eventTitle }}</h3>
                      <p class="text-white/80 text-xs mt-1">Owner: {{ result.owner }}</p>
                    </div>
                  </div>

                  <!-- Ticket Details -->
                  <div class="flex-1 p-6">
                    <div class="grid grid-cols-3 gap-8">
                      <!-- First Column -->
                      <div class="space-y-4">
                        <div>
                          <span class="text-gray-500 text-sm">Ticket Holder</span>
                          <p class="font-semibold text-gray-900">{{ result.ticketHolder || '-' }}</p>
                        </div>
                        <div>
                          <span class="text-gray-500 text-sm">Phone Number or Email</span>
                          <p class="font-semibold text-gray-900">{{ result.phoneNumberOrEmail || '-' }}</p>
                        </div>
                      </div>

                      <!-- Second Column -->
                      <div class="space-y-4">
                        <div>
                          <span class="text-gray-500 text-sm">Booking Ref</span>
                          <p class="font-semibold text-gray-900">{{ result.bookingRef }}</p>
                        </div>
                        <div>
                          <span class="text-gray-500 text-sm">Ticket ID</span>
                          <p class="font-semibold text-gray-900">{{ result.ticketId }}</p>
                        </div>
                      </div>

                      <!-- Third Column -->
                      <div class="space-y-4">
                        <div>
                          <span class="text-gray-500 text-sm">Ticket Type</span>
                          <p class="font-semibold text-gray-900">{{ result.ticketType }}</p>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                          <div>
                            <span class="text-gray-500 text-sm">Gate</span>
                            <p class="font-semibold text-gray-900">{{ result.gate }}</p>
                          </div>
                          <div>
                            <span class="text-gray-500 text-sm">Seat Number</span>
                            <p class="font-semibold text-gray-900">{{ result.seatNumber }}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Bottom Row - Location, Date, Time -->
                    <div class="grid grid-cols-3 gap-8 mt-6 pt-4 border-t border-gray-100">
                      <div>
                        <span class="text-gray-500 text-sm">Location</span>
                        <p class="font-semibold text-gray-900">{{ result.location }}</p>
                      </div>
                      <div>
                        <span class="text-gray-500 text-sm">Date</span>
                        <p class="font-semibold text-gray-900">{{ result.date }}</p>
                      </div>
                      <div>
                        <span class="text-gray-500 text-sm">Time</span>
                        <p class="font-semibold text-gray-900">{{ result.time }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Right: QR Code and Actions -->
                <div class="w-48 p-6 border-l border-gray-100 flex flex-col items-center justify-center space-y-4">
                  <div class="text-center">
                    <p class="text-gray-700 font-medium mb-3">Scan to Enter</p>
                    <!-- QR Code Placeholder -->
                    <div class="w-24 h-24 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                      <div class="grid grid-cols-8 gap-px">
                        <div v-for="i in 64" :key="i" class="w-1 h-1 bg-gray-600" :class="{ 'bg-transparent': Math.random() > 0.6 }"></div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Action Button -->
                  <Button
                    :label="result.isAssigned ? 'Assigned' : 'Assign Ticket'"
                    :disabled="result.isAssigned"
                    :class="[
                      'w-full py-2 px-3 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2',
                      result.isAssigned 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    ]"
                    @click="openAssignModal(result)"
                  >
                    <Icon :name="result.isAssigned ? 'icon-park-solid:ticket' : 'icon-park-solid:ticket'" class="w-4 h-4" /> 
                    {{ result.isAssigned ? 'Assigned' : 'Assign Ticket' }}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Assign Ticket Modal -->
    <div v-if="showAssignModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-8 max-w-[45rem] w-full mx-4 shadow-2xl">
        <div class="space-y-6">
          <!-- Modal Header -->
          <div>
            <h2 class="text-xl font-bold text-gray-900">Assign Ticket</h2>
            <p class="text-gray-600 text-sm mt-1">Complete Ticket Holder's Information</p>
          </div>

          <!-- Name Field -->
          <div>
            <label class="block text-gray-700 text-sm font-medium mb-2">Name</label>
            <InputText
              v-model="assignForm.name"
              placeholder="Enter"
              class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <!-- Phone Number Field -->
          <div>
            <label class="block text-gray-700 text-sm font-medium mb-2">Phone Number</label>
            <div class="flex">
              <div class="flex items-center bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg px-3">
                <img src="https://flagcdn.com/kh.svg" alt="Cambodia" class="w-5 h-3 mr-2">
                <span class="text-sm font-medium">+855</span>
              </div>
              <InputText
                v-model="assignForm.phoneNumber"
                placeholder="97 6028 424"
                class="flex-1 p-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <!-- Email Field -->
          <div>
            <label class="block text-gray-700 text-sm font-medium mb-2">Email (optional)</label>
            <InputText
              v-model="assignForm.email"
              placeholder="e.g. info@gmail.com"
              class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <!-- Identity Document Section -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Identity Document</h3>
            <p class="text-gray-500 text-sm mb-4">We will need your ID to verify that you are over 18 years old</p>
            
            <label class="block text-gray-700 text-sm font-medium mb-2">ID Card/Passport number</label>
            <InputText
              v-model="assignForm.idNumber"
              placeholder="e.g. 1100546873"
              class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <!-- Upload Identity Section -->
          <div>
            <label class="block text-gray-700 text-sm font-medium mb-2">Upload Identity</label>
            <div class="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center bg-purple-50">
              <Icon name="heroicons:photo" class="w-12 h-12 text-purple-400 mx-auto mb-3" />
              <p class="text-gray-600 mb-2">Drop your image here, or <span class="text-purple-600 font-medium cursor-pointer">browse</span></p>
              <p class="text-gray-400 text-xs">*Maximum file size: below 10MB</p>
              <p class="text-gray-400 text-xs">*Banner resolution must be 1920 Width x 1440 Height</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 pt-4">
            <Button
              label="Cancel"
              class="flex-1 py-3 px-6 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
              @click="closeAssignModal"
            />
            <Button
              label="Assign Ticket"
              class="flex-1 py-3 px-6 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-all duration-200"
              @click="completeAssignment"
            />
          </div>
        </div>
      </div>
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
  layout: 'admin',
})

const generalSearchQuery = ref('')
const loading = ref(false)
const searchResults = ref([])
const searchPerformed = ref(false) // New state to control initial view
const showSearchForm = ref(false) // Control search form visibility
const activeTab = ref('phone') // Active tab state

// Modal states
const showAssignModal = ref(false)
const selectedTicket = ref(null)

// Form fields
const phoneNumber = ref('')
const email = ref('')
const bookingReference = ref('')
const ticketId = ref('')
const bookingReferenceEmail = ref('')
const ticketIdEmail = ref('')

// Assign form fields
const assignForm = ref({
  name: '',
  phoneNumber: '',
  email: '',
  idNumber: ''
})

// Sample data for demonstration, matching the UI fields
const sampleTickets = ref([
  {
    id: 1,
    status: 'Check-in', // This represents QR scan check-in status
    isAssigned: true, // This represents whether ticket is assigned to someone
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
    status: 'Not Check-in', // QR scan status
    isAssigned: false, // Not assigned to anyone yet
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
    status: 'Not Check-in', // QR scan status - not checked in yet
    isAssigned: true, // But already assigned to Jane Doe
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
  // Show the search form when search button is clicked
  showSearchForm.value = true
  searchPerformed.value = false
}

const performDetailedSearch = () => {
  loading.value = true
  searchPerformed.value = true
  showSearchForm.value = false
  
  setTimeout(() => {
    // Get current tab's form values
    const currentPhone = activeTab.value === 'phone' ? phoneNumber.value : ''
    const currentEmail = activeTab.value === 'email' ? email.value : ''
    const currentBookingRef = activeTab.value === 'phone' ? bookingReference.value : bookingReferenceEmail.value
    const currentTicketId = activeTab.value === 'phone' ? ticketId.value : ticketIdEmail.value
    
    // Filter tickets based on form inputs
    searchResults.value = sampleTickets.value.filter((ticket) => {
      let matches = true
      
      // Check phone number match
      if (currentPhone && !ticket.phoneNumberOrEmail.toLowerCase().includes(currentPhone.toLowerCase())) {
        matches = false
      }
      
      // Check email match (if we had email field in sample data)
      if (currentEmail && !ticket.phoneNumberOrEmail.toLowerCase().includes(currentEmail.toLowerCase())) {
        matches = false
      }
      
      // Check booking reference match
      if (currentBookingRef && !ticket.bookingRef.toLowerCase().includes(currentBookingRef.toLowerCase())) {
        matches = false
      }
      
      // Check ticket ID match
      if (currentTicketId && !ticket.ticketId.toLowerCase().includes(currentTicketId.toLowerCase())) {
        matches = false
      }
      
      return matches
    })
    
    loading.value = false
  }, 1000)
}

const openAssignModal = (ticket) => {
  selectedTicket.value = ticket
  showAssignModal.value = true
  // Reset form
  assignForm.value = {
    name: '',
    phoneNumber: '',
    email: '',
    idNumber: ''
  }
}

const closeAssignModal = () => {
  showAssignModal.value = false
  selectedTicket.value = null
}

const completeAssignment = () => {
  if (selectedTicket.value) {
    // Only update ticket holder information, NOT the check-in status
    // Check-in status should only change when QR code is scanned
    selectedTicket.value.ticketHolder = assignForm.value.name
    selectedTicket.value.phoneNumberOrEmail = assignForm.value.phoneNumber
    selectedTicket.value.email = assignForm.value.email
    selectedTicket.value.idNumber = assignForm.value.idNumber
    selectedTicket.value.isAssigned = true // Add flag to track if ticket is assigned
    
    console.log('Ticket assigned successfully:', {
      ticket: selectedTicket.value.bookingRef,
      holder: assignForm.value.name,
      phone: assignForm.value.phoneNumber,
      email: assignForm.value.email,
      idNumber: assignForm.value.idNumber
    })
  }
  
  closeAssignModal()
}

const navigateToPrintTickets = () => {
  navigateTo('/admin/print-tickets')
}

const assignTicket = (ticket) => {
  // Toggle ticket status
  if (ticket.status === 'Check-in') {
    ticket.status = 'Not Check-in'
    console.log('Ticket unassigned:', ticket.bookingRef)
  } else {
    ticket.status = 'Check-in'
    console.log('Ticket assigned:', ticket.bookingRef)
  }
}

// The assignTicket function is now part of TicketDetailsCard.vue,
// but if you need to call it from the parent, you'd emit an event from the child.
// For now, I've kept the console.log in the child component.
</script>

<style scoped>
/* Custom animations (retained from your original code) */
:deep(.p-button) {
  border: none !important;
  box-shadow: none !important;
}

/* Smooth slide and fade transitions */
.slide-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-fade-enter-from {
  transform: translateY(-20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

/* Fade transition for existing elements */
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