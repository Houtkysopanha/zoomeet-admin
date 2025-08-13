<template>
  <div class="">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-lg font-semibold">Ticket Packages</h2>
        <p class="text-gray-400">Create and manage different ticket types</p>
      </div>
      <div v-if="currentEventId" class="text-right">
        <p class="text-sm text-green-600 font-medium">✅ Basic Info Saved</p>
        <p class="text-xs text-gray-500">{{ currentEventName }}</p>
      </div>
    </div>

    <!-- Event Status Alert -->
    <div v-if="!currentEventId" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div class="flex items-center">
        <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 text-yellow-600 mr-2" />
        <div>
          <p class="text-sm font-medium text-yellow-800">Basic Info Not Saved</p>
          <p class="text-xs text-yellow-600">Please complete and save the Basic Info tab first.</p>
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
        :readonly="false"
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

      <div class="flex space-x-4">
        <Button
          v-if="hasExistingTickets"
          @click="loadTickets"
          :disabled="loading"
          class="load-tickets-btn"
        >
          <Icon name="heroicons:arrow-path" class="mr-2" />
          Reload Tickets
        </Button>

        <Button
          @click="saveTickets"
          :disabled="!currentEventId || tickets.length === 0 || loading"
          :class="[
            'save-tickets-btn flex items-center justify-center',
            loading ? 'opacity-75 cursor-not-allowed' : ''
          ]"
        >
          <LoadingSpinner
            v-if="loading"
            size="sm"
            color="white"
            :showText="false"
            class="mr-2"
          />
          <Icon v-else name="heroicons:check" class="mr-2" />
          {{ loading ? 'Saving...' : 'Save Draft' }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue"
import Button from "primevue/button"
import TicketForm from '~/components/common/TicketForm.vue'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import { createTicketTypes, updateTicketType, getEventDetails } from '@/composables/api'
import { useToast } from "primevue/usetoast"

const loading = ref(false)
const toast = useToast()
const hasExistingTickets = ref(false)

// Event data
const currentEventId = ref(null)
const currentEventName = ref('')
const tickets = ref([])

// Load existing tickets if available
const loadTickets = async () => {
  if (!currentEventId.value) return

  loading.value = true
  try {
    const response = await getEventDetails(currentEventId.value)
    if (response?.data?.ticket_types?.length > 0) {
      tickets.value = response.data.ticket_types.map(ticket => ({
        id: Date.now() + Math.random(),
        ticket_type_id: ticket.id,
        name: ticket.name,
        price: ticket.price,
        quantity: ticket.total,
        description: ticket.tag || '',
        sort_order: ticket.sort_order,
        is_active: ticket.is_active
      }))
      hasExistingTickets.value = true
      toast.add({
        severity: 'success',
        summary: 'Tickets Loaded',
        detail: `Loaded ${tickets.value.length} existing tickets`,
        life: 3000
      })
    }
  } catch (error) {
    console.error('Failed to load tickets:', error)
    toast.add({
      severity: 'error',
      summary: 'Load Failed',
      detail: 'Failed to load existing tickets',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const createNewTicket = () => ({
  id: Date.now() + Math.random(),
  ticket_type_id: null,
  name: '',
  price: null,
  quantity: null,
  description: '',
  sort_order: tickets.value.length + 1,
  is_active: 1
})

const addTicket = () => {
  if (!currentEventId.value) {
    toast.add({
      severity: 'warn',
      summary: 'Basic Info Required',
      detail: 'Please complete and save Basic Info first.',
      life: 3000
    })
    return
  }
  tickets.value.push(createNewTicket())
}

// Save all tickets - ENHANCED FOR NEW FLOW
const saveTickets = async () => {
  if (!currentEventId.value) {
    toast.add({
      severity: 'error',
      summary: 'No Event',
      detail: 'Please complete and save Basic Info first.',
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
    console.log('🎫 Starting ticket save process...')
    
    // Handle existing and new tickets separately
    const ticketUpdates = []
    const updatePromises = []
    
    // Update existing tickets
    const existingTickets = tickets.value.filter(t => t.ticket_type_id)
    console.log(`📝 Updating ${existingTickets.length} existing tickets`)
    
    for (const ticket of existingTickets) {
      const ticketData = {
        name: ticket.name,
        price: parseFloat(ticket.price),
        total: parseInt(ticket.quantity),
        tag: ticket.description || '',
        sort_order: ticket.sort_order,
        is_active: 1
      }

      const updatePromise = updateTicketType(currentEventId.value, ticket.ticket_type_id, ticketData)
        .then(() => {
          ticketUpdates.push(`Updated: ${ticket.name}`)
          console.log(`✅ Updated ticket: ${ticket.name}`)
        })
        .catch((error) => {
          console.error(`❌ Failed to update ticket ${ticket.name}:`, error)
          ticketUpdates.push(`Failed to update: ${ticket.name}`)
        })
      
      updatePromises.push(updatePromise)
    }

    // Wait for all updates to complete
    await Promise.all(updatePromises)

    // Create new tickets
    const newTickets = tickets.value.filter(t => !t.ticket_type_id)
    console.log(`🆕 Creating ${newTickets.length} new tickets`)
    
    if (newTickets.length > 0) {
      const ticketTypesData = {
        ticket_types: newTickets.map(ticket => ({
          name: ticket.name,
          price: parseFloat(ticket.price),
          total: parseInt(ticket.quantity),
          tag: ticket.description || '',
          sort_order: ticket.sort_order,
          is_active: 1
        }))
      }

      try {
        const createResponse = await createTicketTypes(currentEventId.value, ticketTypesData)
        console.log('✅ Ticket creation response:', createResponse)
        
        // Handle different response structures
        if (createResponse && (createResponse.success || createResponse.data)) {
          newTickets.forEach(ticket => {
            ticketUpdates.push(`Created: ${ticket.name}`)
          })
          console.log(`✅ Created ${newTickets.length} new tickets`)
        } else {
          console.warn('Unexpected ticket creation response:', createResponse)
          ticketUpdates.push(`Created ${newTickets.length} new tickets`)
        }
      } catch (createError) {
        console.error('❌ Failed to create new tickets:', createError)
        ticketUpdates.push(`Failed to create ${newTickets.length} new tickets`)
        throw createError // Re-throw to be caught by outer catch
      }
    }

    // Show success message
    toast.add({
      severity: 'success',
      summary: 'Tickets Saved Successfully! 🎫',
      detail: ticketUpdates.length > 0 ? ticketUpdates.join('\n') : 'All tickets processed successfully',
      life: 5000
    })

    console.log('🎉 Ticket save process completed successfully')

    // Reload tickets to get updated data with fresh IDs
    setTimeout(async () => {
      await loadTickets()
    }, 1000) // Small delay to ensure server has processed the changes

  } catch (error) {
    console.error('❌ Ticket save error:', error)
    
    // Handle different error types
    let errorMessage = 'Failed to save tickets. Please try again.'
    let errorSummary = 'Save Failed'
    
    if (error.message) {
      errorMessage = error.message
      
      if (error.message.includes('Authentication')) {
        errorSummary = 'Authentication Error'
        errorMessage = 'Please login again to continue.'
      } else if (error.message.includes('Validation')) {
        errorSummary = 'Validation Error'
      } else if (error.message.includes('Event not found')) {
        errorSummary = 'Event Not Found'
        errorMessage = 'The event could not be found. Please refresh and try again.'
      }
    }
    
    toast.add({
      severity: 'error',
      summary: errorSummary,
      detail: errorMessage,
      life: 5000
    })
  } finally {
    loading.value = false
  }
}

// Initialize on mount and add event listeners
onMounted(() => {
  // Load event ID from localStorage
  const storedEventId = localStorage.getItem('currentEventId')
  const storedEventName = localStorage.getItem('currentEventName')

  if (storedEventId) {
    currentEventId.value = storedEventId
    currentEventName.value = storedEventName || 'Unnamed Event'
    console.log('📋 Loading event for tickets:', {
      id: currentEventId.value,
      name: currentEventName.value
    })
    
    // Load existing tickets if any
    loadTickets()
  } else {
    console.log('⚠️ No event ID found. Complete Basic Info first.')
  }

  // Listen for save tickets event from parent
  window.addEventListener('saveTickets', saveTickets)
})

// Remove event listener when component unmounts
onUnmounted(() => {
  window.removeEventListener('saveTickets', saveTickets)
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

.load-tickets-btn {
  @apply bg-gradient-to-r from-blue-600 to-cyan-600 text-white;
  @apply hover:from-blue-700 hover:to-cyan-700;
  @apply px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl;
  @apply transition-all duration-300 ease-in-out border-0;
}

.load-tickets-btn:hover {
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
  position: absolute;
  width: 100%;
}
</style>