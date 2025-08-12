<template>
  <div class="">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-lg font-semibold">Ticket Packages</h2>
        <p class="text-gray-400">Create and manage different ticket types</p>
      </div>
      <div v-if="currentEventId" class="text-right">
        <p class="text-sm text-green-600 font-medium">✅ Event Created</p>
        <p class="text-xs text-gray-500">{{ currentEventName }}</p>
      </div>
    </div>

    <!-- Event Status Alert -->
    <div v-if="!currentEventId" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div class="flex items-center">
        <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 text-yellow-600 mr-2" />
        <div>
          <p class="text-sm font-medium text-yellow-800">No Event Selected</p>
          <p class="text-xs text-yellow-600">Please create an event first in the "Basic Info" tab before creating tickets.</p>
        </div>
      </div>
    </div>
    
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

    <!-- Action Buttons -->
    <div class="flex justify-between items-center mt-6">
      <Button
        @click="addTicket"
        class="add-ticket-btn"
        :disabled="!currentEventId"
      >
        <Icon name="heroicons:plus" class="mr-2" />
        Add Ticket Package
      </Button>

      <Button
        @click="saveTickets"
        :loading="loading"
        :disabled="!currentEventId || tickets.length === 0"
        class="save-tickets-btn"
      >
        <Icon name="heroicons:check" class="mr-2" />
        Save All Tickets
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
// Icon is auto-imported by Nuxt
import Button from "primevue/button"
import TicketForm from '~/components/common/TicketForm.vue'
import { createTicketTypes } from '@/composables/api'
import { useToast } from "primevue/usetoast"

const loading = ref(false)
const toast = useToast()

// Event data from localStorage
const currentEventId = ref(null)
const currentEventName = ref('')

// Array to hold multiple ticket package data
const tickets = ref([])

// Methods
const createNewTicket = () => ({
  id: Date.now() + Math.random(), // Unique ID for key
  name: '',
  price: null,
  quantity: null, // This will map to 'total' in API
  description: '', // This will map to 'tag' in API
  sort_order: tickets.value.length + 1,
  is_active: 1
})

const addTicket = () => {
  if (!currentEventId.value) {
    toast.add({
      severity: 'warn',
      summary: 'Event Required',
      detail: 'Please create an event first before adding tickets.',
      life: 3000
    })
    return
  }

  tickets.value.push(createNewTicket())
  console.log('New ticket package added. Total tickets:', tickets.value.length)
}

const removeTicket = (index) => {
  tickets.value.splice(index, 1)
  console.log('Ticket package removed. Total tickets:', tickets.value.length)
}

// Save all tickets to API
const saveTickets = async () => {
  if (!currentEventId.value) {
    toast.add({
      severity: 'error',
      summary: 'No Event',
      detail: 'Please create an event first.',
      life: 3000
    })
    return
  }

  if (tickets.value.length === 0) {
    toast.add({
      severity: 'warn',
      summary: 'No Tickets',
      detail: 'Please add at least one ticket package.',
      life: 3000
    })
    return
  }

  // Validate tickets
  const invalidTickets = tickets.value.filter(ticket =>
    !ticket.name || !ticket.price || !ticket.quantity
  )

  if (invalidTickets.length > 0) {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Please fill in all required fields (name, price, quantity) for all tickets.',
      life: 5000
    })
    return
  }

  loading.value = true

  try {
    // Transform tickets to API format
    const ticketTypesData = {
      ticket_types: tickets.value.map((ticket, index) => ({
        name: ticket.name,
        price: parseFloat(ticket.price),
        total: parseInt(ticket.quantity),
        tag: ticket.description || '',
        sort_order: index + 1,
        is_active: 1
      }))
    }

    console.log('🎫 Saving tickets for event:', currentEventId.value)
    console.log('📝 Ticket data:', ticketTypesData)

    const result = await createTicketTypes(currentEventId.value, ticketTypesData)

    if (result && (result.status === 201 || (result.data && result.data.success))) {
      const message = result.data?.message || 'Tickets created successfully!'

      toast.add({
        severity: 'success',
        summary: 'Tickets Created! 🎫',
        detail: `${message} - ${tickets.value.length} ticket type(s) added.`,
        life: 5000
      })

      console.log('🎉 Tickets created successfully:', result.data?.data)

      // Optionally clear the form or keep it for editing
      // tickets.value = []
    }
  } catch (error) {
    console.error('❌ Ticket creation error:', error)
    toast.add({
      severity: 'error',
      summary: 'Ticket Creation Failed',
      detail: error.message || 'Failed to create tickets. Please try again.',
      life: 5000
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Load event ID from localStorage
  const storedEventId = localStorage.getItem('currentEventId')
  const storedEventName = localStorage.getItem('currentEventName')

  if (storedEventId) {
    currentEventId.value = storedEventId
    currentEventName.value = storedEventName || 'Unnamed Event'
    console.log('📋 Loaded event for ticket creation:', {
      id: currentEventId.value,
      name: currentEventName.value
    })

    // Add two initial ticket packages when event is available
    addTicket() // Ticket 1
    addTicket() // Ticket 2
  } else {
    console.log('⚠️ No event ID found. User needs to create an event first.')
  }
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

.save-tickets-btn {
  @apply bg-gradient-to-r from-green-600 to-emerald-600 text-white;
  @apply hover:from-green-700 hover:to-emerald-700;
  @apply px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl;
  @apply transition-all duration-300 ease-in-out border-0;
}

.save-tickets-btn:hover {
  transform: translateY(-2px);
}

.save-tickets-btn:disabled {
  @apply bg-gray-400 cursor-not-allowed;
  transform: none;
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
