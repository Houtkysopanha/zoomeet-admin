<template>
  <div class="relative overflow-hidden col-span-1">
    <div
      :class="[
        'absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 z-10',
        result.status === 'Check-in' ? 'bg-purple-600 text-white' : 'bg-gray-600 text-white',
      ]"
    >
      <Icon :name="result.status === 'Check-in' ? 'heroicons:check-circle' : 'heroicons:x-circle'" class="w-4 h-4" />
      {{ result.status }}
    </div>
    <img :src="result.image" alt="Event Banner" class="w-full h-48 object-cover rounded-lg" />
    <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
      <h3 class="text-lg font-semibold mb-1">{{ result.eventTitle }}</h3>
      <p class="text-sm text-white/80">Owner: {{ result.owner }}</p>
    </div>
  </div>

  <div class="col-span-1 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4 text-sm">
     <!-- Top Section  -->
    <div>
      <div class="font-semibold text-gray-500">Ticket Holder</div>
      <div class="font-semibold text-gray-900">{{ result.ticketHolder }}</div>
    </div>
    <div>
      <div class="font-semibold text-gray-500">Booking Ref</div>
      <div class="font-semibold text-gray-900">{{ result.bookingRef }}</div>
    </div>
    <div>
      <div class="font-semibold text-gray-500">Ticket Type</div>
      <div class="font-semibold text-gray-900">{{ result.ticketType }}</div>
    </div>

    <div>
      <div class="font-semibold text-gray-500">Phone Number or Email</div>
      <div class="font-semibold text-gray-900">{{ result.phoneNumberOrEmail }}</div>
    </div>
    <div>
      <div class="font-semibold text-gray-500">Ticket ID</div>
      <div class="font-semibold text-gray-900">{{ result.ticketId }}</div>
    </div>
    <div class="flex gap-4">
      <div>
        <div class="font-semibold text-gray-500">Gate</div>
        <div class="font-semibold text-gray-900">{{ result.gate }}</div>
      </div>
      <div>
        <div class="font-semibold text-gray-500">Seat Number</div>
        <div class="font-semibold text-gray-900">{{ result.seatNumber }}</div>
      </div>
    </div>

    <Divider class="col-span-full my-2" />

     <!-- Bottom Section  -->
    <div class="col-span-full">
      <div class="font-semibold text-gray-500">Location</div>
      <div class="font-semibold text-gray-900">{{ result.location }}</div>
    </div>

    <div>
      <div class="font-semibold text-gray-500">Date</div>
      <div class="font-semibold text-gray-900">{{ result.date }}</div>
    </div>
    <div class="col-span-2">
      <div class="font-semibold text-gray-500">Time</div>
      <div class="font-semibold text-gray-900">{{ result.time }}</div>
    </div>
  </div>

  <div class="col-span-1 flex flex-col items-center justify-center p-4 rounded-lg">
    <p class="text-gray-600 text-sm mb-2">Scan to Enter</p>
    <img :src="qrcode" alt="QR Code" class="w-32 h-32 object-contain mb-4" />
    <Button
      label="Assign Ticket"
      class="w-44 bg-gray-400 rounded-full text-white py-3 hover:from-blue-700 hover:to-purple-700 transition-colors duration-200 flex items-center justify-center gap-2"
      @click="assignTicket(result.id)"
    >
      <Icon name="heroicons:ticket" class="w-5 h-5" />
      Assign Ticket
    </Button>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import Button from 'primevue/button'
import Divider from 'primevue/divider' // Import Divider
import qrcode from '@/assets/image/qr-code.png'


const props = defineProps({
  result: {
    type: Object,
    required: true,
  },
})

const assignTicket = (id) => {
  console.log(`Assigning ticket with ID: ${id}`)
  // Implement actual ticket assignment logic here (e.g., API call)
}
</script>