<template>
  <div class="flex h-full bg-gray-50">
    <!-- Left Column: Booking List -->
    <div class="flex-1 pr-8 overflow-y-auto">
      <h1 class="text-2xl font-bold text-gray-800">Cash Payment Bookings</h1>
      <p class="text-gray-600 mb-6">Manage users who booked tickets with cash payment</p>

      <!-- Search, Filters, Sort -->
      <div class="flex items-center gap-4 mb-6">
        <div class="relative flex-1">
          <Icon name="heroicons:magnifying-glass" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <InputText v-model="searchQuery" placeholder="Search" class="pl-10 pr-4 py-3 border border-gray-300 rounded-full w-full bg-white focus:ring-0 focus:ring-purple-500 focus:border-purple-500" />
        </div>
        <Button class="px-4 py-3 bg-white border border-gray-300 rounded-full bg-custom-gradient bg-clip-text text-transparent hover:bg-gray-100 flex items-center">
          <Icon name="heroicons:funnel" class="w-5 h-5 mr-2 bg-gradient-to-tr from-blue-900 to-purple-700" />
          Filters
        </Button>
        <Button class="px-4 py-3 bg-white border border-gray-300 rounded-full bg-custom-gradient bg-clip-text text-transparent hover:bg-gray-100 flex items-center">
          <Icon name="heroicons:arrows-up-down" class="w-5 h-5 mr-2 bg-gradient-to-tr from-blue-900 to-purple-700" />
          Sort
        </Button>
      </div>

      <!-- Booking Cards List -->
      <div class="space-y-4">
        <div v-for="booking in filteredBookings" :key="booking.id" class="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div class="p-4">
            <div class="flex justify-between items-center mb-2">
              <div class="flex items-center gap-2">
                <span class="font-semibold text-gray-800">{{ booking.customerName }}</span>
                <span class="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{{ booking.bookingId }}</span>
              </div>
              <span class="px-3 py-1 rounded-full text-xs font-medium" :class="booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'">{{ booking.status }}</span>
            </div>
            <p class="text-sm text-gray-500 mb-3">Purchase Date: {{ booking.purchaseDate }} | {{ booking.purchaseTime }}</p>
            <div class="border-t border-dashed border-gray-300 my-4"></div>
            <div class="mb-4">
             <p class="text-sm text-gray-500 mb-3 leading-3">Event</p>
              <div class="flex justify-between items-center cursor-pointer" @click="toggleExpand(booking.id)">
                <span class="font-medium text-gray-800">{{ booking.eventTitle }}</span>
                <Icon :name="expandedBookings[booking.id] ? 'mingcute:down-line' : 'mingcute:up-line'" class="w-5 h-5 text-gray-500" />
              </div>
               <div class="border-b border-gray-300 my-4"></div>
              <Transition name="slide-fade">
                <div v-if="expandedBookings[booking.id]" class="mt-3  text-gray-600 space-y-1">
                 <div class="flex items-center align space-x-12 mb-4">
                   <div class="email">
                    <p class="text-sm text-gray-500">Email</p>
                    <span class="font-medium text-gray-800">{{ booking.email }}</span>
                  </div>
                    <div class="total-ticket">
                    <p class="text-sm text-gray-500">Total Tickets</p>
                    <span class="font-medium text-gray-800">{{ booking.totalTickets }}</span>
                  </div>
                 </div>
                 <div class="flex space-x-28 ">
                   <div class="number-phone">
                    <p class="text-sm text-gray-500">Phone Number</p>
                    <span class="font-medium text-gray-800">{{ booking.phoneNumber }}</span>
                  </div>
                    <div class="ticket-types">
                    <p class="text-sm text-gray-500">Tickets Types</p>
                    <span class="font-medium text-gray-800">{{ booking.ticketType }}</span>
                  </div>
                 </div>
                 <div class="border-b border-gray-300 my-4"></div>
                </div>
              </Transition>
            </div>

            <div class="flex justify-between items-center">   
            <div>
                 <p class="text-sm text-gray-500">Price</p>
                <span class="text-xl font-bold text-gray-800">${{ booking.price.toFixed(2) }}</span>
            </div>
              <Button
                label="Pay Bill"
                class="bg-purple-600 text-white px-5 py-2 rounded-full hover:bg-purple-700 flex items-center"
                @click="selectBooking(booking)"
              >
                <Icon name="solar:bill-check-bold" class="w-5 h-5 mr-2" />
                Pay Bill
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Right Column: Receipt / Payment Details -->
    <div class="w-[30rem] bg-white p-4 rounded-2xl flex flex-col">
      <!-- Receipt (shown only when a booking is selected) -->
      <div v-if="selectedBooking" class="flex-grow">
        <div class="mb-6">
          <h2 class="text-xl font-bold text-gray-800">{{ selectedBooking.bookingId }}</h2>
          <p class="text-gray-600">{{ selectedBooking.customerName }}</p>
        </div>

        <!-- Ticket Items -->
        <div class="space-y-3 mb-6">
          <div v-for="(ticket, index) in selectedBooking.tickets" :key="index" class="flex justify-between items-center bg-gray-100 rounded-2xl p-3 text-gray-700">
           <div class="space-x-3">
             <span class="text-sm p-1 text-black bg-white rounded-full">{{ String(index + 1).padStart(2, '0') }}</span>
             <span class="text-sm"> {{ ticket.type }} Tickets</span>
           </div>
            <span class="font-medium">{{ ticket.quantity }}</span>
            <span class="font-medium">${{ ticket.amount.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Summary Details -->
        <div class="space-y-5 bg-gray-100 p-3 rounded-xl text-gray-700 mb-6">
          <div class="flex justify-between">
            <span>Subtotal</span>
            <span class="font-medium">${{ selectedBooking.subtotal.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Tax {{ (selectedBooking.taxRate * 100).toFixed(0) }}%</span>
            <span class="font-medium">${{ selectedBooking.tax.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Voucher</span>
            <span class="font-medium">${{ selectedBooking.voucher.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between pt-4 pb-16 border-t border-dashed border-gray-300 text-lg font-bold text-gray-800">
            <span>Total</span>
            <span>${{ selectedBooking.total.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between pt-4 border-t border-dashed border-gray-300 text-lg font-bold text-gray-800">
            <span>Received</span>
            <span>${{ selectedBooking.received.toFixed(2) }}</span>
          </div>
        </div>
      </div>
      <div v-else class="flex-grow flex items-center justify-center text-gray-500">
        <p class="text-lg font-semibold">No booking selected</p>
      </div>

      <!-- Fixed Payment Method and Order Button (always visible) -->
      <div class="mt-auto sticky bottom-4">
        <h3 class="text-lg font-normal text-purple-600 mb-4">Payment Method</h3>
        <div class="grid grid-cols-2 gap-4 mb-8">
          <div
            :class="['flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all duration-200',
                     paymentMethod === 'cash' ? 'border-purple-600 bg-purple-50 shadow-md' : 'border-gray-300 bg-gray-50 hover:bg-gray-100']"
            @click="paymentMethod = 'cash'"
          >
            <Icon name="heroicons:currency-dollar" class="w-8 h-8 mb-2" :class="paymentMethod === 'cash' ? 'text-purple-600' : 'text-gray-600'" />
            <span class="text-sm font-medium" :class="paymentMethod === 'cash' ? 'text-purple-800' : 'text-gray-700'">Cash</span>
          </div>
          <div
            :class="['flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all duration-200',
                     paymentMethod === 'khqr' ? 'border-purple-600 bg-purple-50 shadow-md' : 'border-gray-300 bg-gray-50 hover:bg-gray-100']"
            @click="paymentMethod = 'khqr'"
          >
            <Icon name="heroicons:credit-card" class="w-8 h-8 mb-2" :class="paymentMethod === 'khqr' ? 'text-purple-600' : 'text-gray-600'" />
            <span class="text-sm font-medium" :class="paymentMethod === 'khqr' ? 'text-purple-800' : 'text-gray-700'">KHQR</span>
          </div>
        </div>

        <Button
          label="Order Completed"
          class="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-700 hover:to-purple-500 transition-all duration-200"
          @click="completeOrder"
          :disabled="!selectedBooking || paymentMethod === ''"
        />

        <!-- KHQR Popup -->
        <Transition name="fade">
          <div v-if="showQrPopup" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white p-6 rounded-lg shadow-lg w-96">
              <h3 class="text-lg font-bold text-gray-800 mb-4">Scan KHQR Code</h3>
              <div class="flex justify-center mb-4">
                <div class="w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-500">QR Code Here</div>
              </div>
              <p class="text-sm text-gray-600 mb-4">Scan the QR code with your payment app to complete the transaction.</p>
              <div class="flex justify-end">
                <Button label="Close" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600" @click="closeQrPopup" />
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
// import { Icon } from '@iconify/vue'

// Sample data for bookings
const bookings = ref([
  {
    id: 1,
    customerName: 'Sok Chenmeng',
    bookingId: 'TK2025001',
    purchaseDate: 'Aug 3, 2025',
    purchaseTime: '09:15AM',
    eventTitle: 'Navigating the future of cybersecurity in Cambodia 2015',
    price: 125.00,
    status: 'Pending',
    email: 'sokchenmeng@gmail.com',
    phoneNumber: '+855 123456789',
    totalTickets: 5,
    ticketType: 'Premium, Normal',
    tickets: [
      { type: 'Premium', quantity: 2, amount: 55.00 },
      { type: 'Normal', quantity: 2, amount: 40.00 },
    ],
    subtotal: 110.00,
    taxRate: 0.05,
    tax: 5.50,
    voucher: 2.00,
    total: 117.50,
    received: 117.50,
  },
  {
    id: 2,
    customerName: 'Sok Chenmeng',
    bookingId: 'TK2025002',
    purchaseDate: 'Aug 3, 2025',
    purchaseTime: '09:15AM',
    eventTitle: 'Navigating the future of cybersecurity in Cambodia 2015',
    price: 125.00,
    status: 'Pending',
    email: 'sokchenmeng@gmail.com',
    phoneNumber: '+855 123456789',
    totalTickets: 5,
    ticketType: 'Premium, Normal',
    tickets: [
      { type: 'Premium', quantity: 1, amount: 27.50 },
      { type: 'Executive', quantity: 3, amount: 45.00 },
    ],
    subtotal: 72.50,
    taxRate: 0.05,
    tax: 3.63,
    voucher: 0.00,
    total: 76.13,
    received: 76.13,
  },
  {
    id: 3,
    customerName: 'Sok Chenmeng',
    bookingId: 'TK2025003',
    purchaseDate: 'Aug 3, 2025',
    purchaseTime: '09:15AM',
    eventTitle: 'Navigating the future of cybersecurity in Cambodia 2015',
    price: 125.00,
    status: 'Pending',
    email: 'sokchenmeng@gmail.com',
    phoneNumber: '+855 123456789',
    totalTickets: 5,
    ticketType: 'Premium, Normal',
    tickets: [
      { type: 'Normal', quantity: 5, amount: 50.00 },
    ],
    subtotal: 50.00,
    taxRate: 0.05,
    tax: 2.50,
    voucher: 0.00,
    total: 52.50,
    received: 52.50,
  },
])

const searchQuery = ref('')
const filteredBookings = computed(() => {
  if (!searchQuery.value) return bookings.value
  return bookings.value.filter(
    (booking) =>
      booking.customerName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      booking.bookingId.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      booking.eventTitle.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const expandedBookings = ref({})
const toggleExpand = (id) => {
  expandedBookings.value[id] = !expandedBookings.value[id]
}

const selectedBooking = ref(null)
const paymentMethod = ref('cash')
const showQrPopup = ref(false)

const selectBooking = (booking) => {
  selectedBooking.value = booking
  paymentMethod.value = 'cash' // Reset payment method when selecting a new booking
  showQrPopup.value = false // Ensure QR popup is closed
}

const completeOrder = () => {
  if (selectedBooking.value) {
    if (paymentMethod.value === 'khqr') {
      showQrPopup.value = true // Show QR popup only when KHQR is selected and Order Completed is clicked
    } else {
      selectedBooking.value.status = 'Success' // Change status to Success for Cash payment
    }
  }
}

// Close popup and update status when QR payment is confirmed (simulated)
const closeQrPopup = () => {
  if (selectedBooking.value && paymentMethod.value === 'khqr') {
    selectedBooking.value.status = 'Success' // Change status to Success after QR payment
  }
  showQrPopup.value = false
}
</script>

<style scoped>
/* Transition styles for smooth expand/collapse */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

/* Transition for QR popup */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>