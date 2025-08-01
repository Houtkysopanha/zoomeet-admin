<template>
  <div class="">
    <h2 class="text-lg font-semibold">Ticket Packages</h2>
    <p class="text-gray-400 mb-6">Create and manage different ticket types</p>
    
    <!-- Dynamically rendered Ticket Forms -->
    <TransitionGroup name="ticket-list" tag="div">
      <TicketForm
        v-for="(ticket, index) in tickets"
        :key="ticket.id"
        v-model="tickets[index]"
        :ticket-index="index"
        @remove-ticket="removeTicket"
      />
    </TransitionGroup>

    <!-- Add Ticket Package Button -->
    <div class="flex justify-end mt-6">
      <Button
        @click="addTicket"
        class="add-ticket-btn"
      >
        <Icon icon="mdi:plus" class="mr-2" />
        Add Ticket Package
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { Icon } from "@iconify/vue"
import Button from "primevue/button"
import TicketForm from '~/components/common/TicketForm.vue' // Import the new component

const loading = ref(false)

// Array to hold multiple ticket package data
const tickets = ref([])

// Methods
const createNewTicket = () => ({
  id: Date.now() + Math.random(), // Unique ID for key
  name: '',
  price: null,
  quantity: null,
  description: ''
})

const addTicket = () => {
  tickets.value.push(createNewTicket())
  console.log('New ticket package added. Total tickets:', tickets.value.length)
}

const removeTicket = (index) => {
  tickets.value.splice(index, 1)
  console.log('Ticket package removed. Total tickets:', tickets.value.length)
}

onMounted(() => {
  // Add two initial ticket packages when the component mounts
  addTicket() // Ticket 1
  addTicket() // Ticket 2
  
  // Simulate initial loading (if needed, though not directly used here)
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
})
</script>

<style scoped>
.add-ticket-btn {
  @apply bg-gradient-to-r from-purple-600 to-indigo-600 text-white;
  @apply hover:from-purple-700 hover:to-indigo-700;
  @apply px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl;
  @apply transition-all duration-300 ease-in-out border-0;
}

.add-ticket-btn:hover {
  transform: translateY(-2px);
}

/* Transition for adding/removing tickets */
.ticket-list-enter-active,
.ticket-list-leave-active {
  transition: all 0.5s ease;
}
.ticket-list-enter-from,
.ticket-list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
.ticket-list-leave-active {
  position: absolute; /* Ensures smooth removal without jumping */
  width: 100%;
}
</style>
