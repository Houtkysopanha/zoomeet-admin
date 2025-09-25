<template>
  <Sidebar v-model:visible="visible" :header="selectedEvent ? selectedEvent.title : 'Event Details'" position="right" class="w-full md:w-[450px] text-black rounded-l-2xl lg:w-[500px] p-0">
    <!-- Use the closeicon slot to customize the close button -->
    <template #closeicon>
      <button @click="visible = false" class="p-sidebar-close p-link">
        <Icon name="hugeicons:arrow-left-03" class="w-8 h-8 text-black hover:text-gray-700" />
      </button>
    </template>

    <div class="flex flex-col h-full">
      <!-- Header Section -->
      <div class="bg-white pb-4 shadow-sm relative">
        <div class="text-sm text-gray-600">
          <div class="flex space-x-5 mb-5">
            <div>Date | {{ selectedEvent?.date }}</div>
            <div>Time | {{ selectedEvent?.time }}</div>
          </div>
          <div class="flex space-x-5 mb-5">
            <div>
              <div class="text-sm font-gray-100">Booking name</div>
              <div class="text-sm font-bold text-gray-800 leading-5">Seang Sovanpunhavuth</div>
            </div>
            <div>
              <div class="text-sm">Email/Phone Number</div>
              <div class="text-sm font-bold text-gray-800 leading-5">+855 12 345 678</div>
            </div>
          </div>
          <div class="border border-gray-300 my-8"></div>
        </div>
        <!-- Tabs -->
        <div class="flex space-x-2 p-1 rounded-full">
          <button
            @click="activeDetailTab = 'ticket'"
            :class="[
              'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full font-semibold transition-all duration-300 ease-in-out',
              activeDetailTab === 'ticket'
                ? 'bg-gradient-to-r from-purple-600 to-purple-400 text-white shadow-md'
                : 'text-gray-600 hover:text-purple-600 hover:bg-white',
            ]"
          >
            <Icon name="heroicons:ticket" class="w-5 h-5" />
            <span>Select Ticket</span>
          </button>
          <button
            @click="activeDetailTab = 'breakout'"
            :class="[
              'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full font-semibold transition-all duration-300 ease-in-out',
              activeDetailTab === 'breakout'
                ? 'bg-gradient-to-r from-purple-600 to-purple-400 text-white shadow-md'
                : 'text-gray-600 hover:text-purple-600 hover:bg-white',
            ]"
          >
            <Icon name="heroicons:building-library" class="w-5 h-5" />
            <span>Breakout Room</span>
          </button>
        </div>
      </div>

      <!-- Content Area (Scrollable) -->
      <div class="flex-1 overflow-y-auto mt-6">
        <div v-if="activeDetailTab === 'ticket'">
          <!-- Ticket Selection -->
          <div class="space-y-4 mb-8">
            <div v-for="ticket in tickets" :key="ticket.type" class="bg-white rounded-xl shadow-md p-4 relative">
              <div
                :class="[
                  'absolute top-0 left-0 px-3 py-2 rounded-lg text-xs font-semibold text-white',
                  ticket.type === 'Premium' ? 'bg-gradient-to-r from-[#FFA100] to-[#FFCA61]' : ticket.type === 'Executive' ? 'bg-gradient-to-r from-[#8E2DE2] to-[#FF6B81]' : 'bg-gradient-to-r from-[#8E2DE2] to-[#FF6B81]',
                ]"
              >
                {{ ticket.type }}
              </div>
              <div class="pt-6">
                <p class="text-gray-700 mb-2">{{ ticket.description }}</p>
                <div class="flex items-center justify-between">
                  <span class="text-2xl font-bold" :class="[
                    ticket.type === 'Premium' ? 'bg-custom-gradient bg-clip-text text-transparent' : ticket.type === 'Executive' ? 'bg-custom-gradient bg-clip-text text-transparent' : 'bg-custom-gradient bg-clip-text text-transparent',
                  ]">{{ ticket.price }}$</span>
                  <div class="flex items-center space-x-2">
                    <Button
                      icon="pi pi-minus"
                      class="!w-6 !h-6 !min-w-0 !min-h-0 !p-0 text-gray-600 border border-blue-300 hover:bg-gray-100"
                      @click="updateQuantity(ticket.type, -1)"
                      :disabled="ticket.quantity === 0"
                    />
                    <span class="text-lg font-medium text-gray-800 w-6 text-center">{{ ticket.quantity }}</span>
                    <Button
                      icon="pi pi-plus"
                      class="!w-6 !h-6 !min-w-0 !min-h-0 !p-0 text-gray-600 border border-blue-300 hover:bg-gray-100"
                      @click="updateQuantity(ticket.type, 1)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="activeDetailTab === 'breakout'">
          <!-- Breakout Room Content -->
          <div class="space-y-4 mb-8">
            <div v-for="room in breakoutRooms" :key="room.id" class="bg-white rounded-xl border border-gray-200 shadow-md p-4 relative">
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="font-semibold text-gray-800 mb-8">{{ room.title }}</h4>
                  <div class="flex items-center text-gray-600 text-sm mb-1">
                    <Icon name="heroicons:clock" class="w-4 h-4 mr-1" />
                    <span>{{ room.time }}</span>
                  </div>
                  <div class="flex items-center text-gray-600 text-sm">
                    <Icon name="heroicons:user" class="w-4 h-4 mr-1" />
                    <span>{{ room.speaker }} | Joined {{ room.joinedPeople }} people</span>
                  </div>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r from-blue-800 to-purple-600">
                  {{ room.roomNumber }}
                </span>
              </div>
            </div>
          </div>
        </div>
         <!-- Payment Summary -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Payment Summary</h3>
          <div class="space-y-3 text-gray-700">
            <div class="flex justify-between">
              <span>Subtotal</span>
              <span class="font-medium">${{ subtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <InputText v-model="voucherCode" placeholder="Enter Voucher code" class="flex-1 p-3 rounded-lg bg-gray-100 mr-2" />
              <Button label="Apply" class="bg-purple-100 text-purple-600 hover:bg-purple-200 px-4 py-2 rounded-lg" @click="applyVoucher" />
            </div>
            <div class="flex justify-between">
              <span>Discount {{ (discountRate * 100).toFixed(0) }}%</span>
              <span class="font-medium">-${{ discount.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Tax {{ (taxRate * 100).toFixed(0) }}%</span>
              <span class="font-medium">${{ tax.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between pt-4 border-t border-gray-200 text-lg font-bold text-gray-800">
              <span>Total</span>
              <span>${{ total.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Payment Method -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Payment Method</h3>
          <div class="space-y-3">
            <div class="flex items-center">
              <RadioButton v-model="paymentMethod" inputId="khqr" value="khqr" />
              <label for="khqr" class="ml-2 text-gray-700">KHQR Payment</label>
            </div>
            <div class="flex items-center">
              <RadioButton v-model="paymentMethod" inputId="cash" value="cash" />
              <label for="cash" class="ml-2 text-gray-700">Cash Payment</label>
            </div>
          </div>
        </div>
      </div>

      <!-- Fixed Payment Summary, Method, and Button -->
      <div class="bg-white ">


        <!-- Footer Button -->
        <Button
          label="Complete Booking"
          class="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-700 hover:to-purple-500 transition-all duration-200"
          @click="handleCompleteBooking"
        />
      </div>
    </div>
  </Sidebar>
</template>

<script setup>
import { ref, computed } from 'vue'
import Sidebar from 'primevue/sidebar'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import RadioButton from 'primevue/radiobutton'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  selectedEvent: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:visible', 'complete-booking'])

// Use a computed property to handle v-model for `visible` prop
const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

const activeDetailTab = ref('ticket') // 'ticket' or 'breakout'

const tickets = ref([
  { type: 'Premium', description: 'Front Seat, Free Drink, Coffee Break', price: 25, quantity: 1 },
  { type: 'Executive', description: 'Front Seat, Free Drink, Coffee Break', price: 15, quantity: 0 },
  { type: 'Normal', description: 'Front Seat, Free Drink, Coffee Break', price: 10, quantity: 0 },
])

const breakoutRooms = ref([
  {
    id: 1,
    title: 'AI in Cybersecurity',
    time: '10:00 AM - 10:40 AM GMT+7',
    speaker: 'Dr. Sarah Chen',
    joinedPeople: 25,
    roomNumber: 'Room 110',
  },
  {
    id: 2,
    title: 'Blockchain Defence Strategies',
    time: '10:00 AM - 10:40 AM GMT+7',
    speaker: 'Dr. Sarah Chen',
    joinedPeople: 25,
    roomNumber: 'Room 120',
  },
  {
    id: 3,
    title: 'Blockchain Technology Branding Strategies',
    time: '10:00 AM - 10:40 AM GMT+7',
    speaker: 'Dr. Sarah Chen',
    joinedPeople: 25,
    roomNumber: 'Room 100',
  },
])

const voucherCode = ref('')
const appliedVoucher = ref(false)
const discountRate = ref(0) // 0% initially
const taxRate = ref(0.05) // 5% tax

const paymentMethod = ref('khqr') // Default to KHQR Payment

const updateQuantity = (type, change) => {
  const ticket = tickets.value.find((t) => t.type === type)
  if (ticket) {
    ticket.quantity = Math.max(0, ticket.quantity + change)
  }
}

const subtotal = computed(() => {
  return tickets.value.reduce((sum, ticket) => sum + ticket.price * ticket.quantity, 0)
})

const discount = computed(() => {
  return subtotal.value * discountRate.value
})

const tax = computed(() => {
  return (subtotal.value - discount.value) * taxRate.value
})

const total = computed(() => {
  return subtotal.value - discount.value + tax.value
})

const applyVoucher = () => {
  // Simple voucher logic for demonstration
  if (voucherCode.value.toLowerCase() === 'v0discount') {
    discountRate.value = 0.10 // 10% discount
    appliedVoucher.value = true
  } else {
    discountRate.value = 0
    appliedVoucher.value = false
  }
}

const handleCompleteBooking = () => {
  const bookingDetails = {
    event: props.selectedEvent,
    tickets: tickets.value.filter(t => t.quantity > 0),
    customerInfo: {
      fullName: 'Seang Sovanpunhavuth', // Placeholder from UI
      phoneNumber: '+855 12 345 678', // Placeholder from UI
      email: 'customer@example.com' // Placeholder
    },
    paymentSummary: {
      subtotal: subtotal.value,
      discount: discount.value,
      tax: tax.value,
      total: total.value,
      voucherCode: voucherCode.value,
      appliedVoucher: appliedVoucher.value
    },
    paymentMethod: paymentMethod.value,
  }
  emit('complete-booking', bookingDetails)
  // Optionally close sidebar after booking
  // visible.value = false;
}
</script>

<style scoped>
/* Custom gradient for text */

/* PrimeVue component overrides for consistent styling */
:deep(.p-sidebar-content) {
  padding: 0 !important; /* Remove default padding to control it manually */
}
:deep(.p-button.p-button-text) {
  background-color: transparent !important;
  border-color: transparent !important;
  color: inherit !important;
}
:deep(.p-button.p-button-text:hover) {
  background-color: var(--surface-hover) !important;
}
:deep(.p-inputtext) {
  @apply focus:ring-0 focus:ring-purple-500 focus:border-purple-500;
}
:deep(.p-radiobutton .p-radiobutton-box) {
  border-color: #d1d5db; /* gray-300 */
}
:deep(.p-radiobutton .p-radiobutton-box.p-highlight) {
  border-color: #8b5cf6; /* purple-500 */
  background-color: #8b5cf6; /* purple-500 */
}
:deep(.p-radiobutton .p-radiobutton-box.p-highlight .p-radiobutton-icon) {
  background-color: #ffffff; /* white dot */
}
</style>