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
          @click="clearAndRefreshTickets"
          :disabled="loading || !currentEventId"
          class="refresh-tickets-btn"
        >
          <Icon name="heroicons:arrow-path" class="mr-2" />
          Refresh Data
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
import { createTicketTypes, updateTicketType, getEventDetails, getEventTicketTypes } from '@/composables/api'
import { useToast } from "primevue/usetoast"
import { useEventStore } from '~/composables/useEventStore'
import { useEventTabsStore } from '~/composables/useEventTabs'

const loading = ref(false)
const toast = useToast()
const hasExistingTickets = ref(false)

// Event data
const currentEventId = ref(null)
const currentEventName = ref('')
const tickets = ref([])

// Clear all ticket data and refresh from API
const clearAndRefreshTickets = async () => {
  if (!currentEventId.value) return

  loading.value = true
  try {
    console.log('🧹 Clearing all ticket data and refreshing from API...')
    
    // Clear local state
    tickets.value = []
    hasExistingTickets.value = false
    
    // Clear tab store data
    const tabsStore = useEventTabsStore()
    tabsStore.clearTabData(2) // Clear tickets tab data
    
    // Clear event store tickets
    const eventStore = useEventStore()
    if (eventStore.currentEvent) {
      eventStore.currentEvent.ticket_types = []
    }
    
    // Force reload from API
    await loadExistingTickets()
    
    console.log('✅ Ticket data cleared and refreshed')
  } catch (error) {
    console.error('❌ Failed to clear and refresh tickets:', error)
    toast.add({
      severity: 'error',
      summary: 'Refresh Failed',
      detail: 'Failed to refresh ticket data',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

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

const createNewTicketTemplate = () => {
  const ticketNumber = tickets.value.length + 1
  const newTicket = {
    id: Date.now() + Math.random(),
    ticket_type_id: null,
    name: '', // Initialize as empty string
    price: 0, // Initialize as number
    quantity: 1, // Initialize as number
    description: '', // Initialize as empty string
    tag: '', // Initialize as empty string for API compatibility
    sort_order: ticketNumber,
    is_active: true,
    isValidating: false
  }
  
  console.log('🎫 Created new ticket with enhanced structure:', {
    ...newTicket,
    ticketNumber,
    dataTypes: {
      name: typeof newTicket.name,
      price: typeof newTicket.price,
      quantity: typeof newTicket.quantity,
      description: typeof newTicket.description
    }
  })
  return newTicket
}

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
  tickets.value.push(createNewTicketTemplate())
}

// Enhanced save current tab data for tab switching
const handleSaveCurrentTab = () => {
  const tabsStore = useEventTabsStore()
  
  // Log current ticket data before saving
  console.log('💾 Saving current ticket data:', tickets.value.map((t, i) => ({
    index: i,
    name: t.name,
    description: t.description,
    price: t.price,
    quantity: t.quantity,
    ticket_type_id: t.ticket_type_id
  })))
  
  // Check if there are any changes that need API save
  const hasValidTickets = tickets.value.length > 0 && tickets.value.every(t =>
    (t.name && t.name.trim()) &&
    (t.description && t.description.trim()) &&
    (t.price !== null && t.price !== undefined && t.price >= 0) &&
    (t.quantity !== null && t.quantity !== undefined && t.quantity > 0)
  )
  
  // Save current ticket data to tab persistence without API call
  const tabData = {
    ticketTypes: tickets.value.map(ticket => ({
      id: ticket.id,
      ticket_type_id: ticket.ticket_type_id,
      name: ticket.name || '',
      description: ticket.description || ticket.tag || '',
      tag: ticket.tag || ticket.description || '',
      price: ticket.price || 0,
      quantity: ticket.quantity || 1,
      sort_order: ticket.sort_order,
      is_active: ticket.is_active
    })),
    lastSaved: new Date().toISOString(),
    hasTickets: tickets.value.length > 0,
    eventId: currentEventId.value,
    isComplete: hasValidTickets,
    hasUnsavedChanges: hasValidTickets && !tabsStore.isTabSaved(2) // Has changes but not saved to API
  }
  
  tabsStore.saveTabData(2, tabData)
  
  // Mark as needing save if there are valid tickets but not saved to API
  if (hasValidTickets && !tabsStore.isTabSaved(2)) {
    tabsStore.markTabNeedsSave(2)
    tabsStore.markTabModified(2)
  }
  
  console.log('💾 Ticket data saved to tab persistence:', {
    ticketCount: tickets.value.length,
    hasValidTickets,
    needsAPISave: hasValidTickets && !tabsStore.isTabSaved(2)
  })
}

// RESTRUCTURED Save all tickets - CLEAR FLOW CONTROL
const saveTickets = async () => {
  const eventStore = useEventStore()
  const tabsStore = useEventTabsStore()

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

  // Validate all tickets first
  const validationResult = validateAllTickets()
  if (!validationResult.isValid) {
    showValidationErrors(validationResult.errors)
    return
  }

  loading.value = true

  try {
    console.log('🎫 Starting RESTRUCTURED ticket save process...')
    
    // Get fresh existing tickets from API
    const existingTickets = await fetchExistingTickets()
    
    // Separate tickets into UPDATE and CREATE groups
    const { ticketsToUpdate, ticketsToCreate } = categorizeTickets(existingTickets)
    
    console.log(`📊 Ticket categorization:`, {
      toUpdate: ticketsToUpdate.length,
      toCreate: ticketsToCreate.length,
      total: tickets.value.length
    })

    const results = []

    // Process UPDATES first (existing tickets)
    for (const ticketInfo of ticketsToUpdate) {
      try {
        await updateExistingTicket(ticketInfo)
        results.push(`Updated: ${ticketInfo.ticket.name}`)
      } catch (error) {
        console.error(`❌ Failed to update ${ticketInfo.ticket.name}:`, error)
        results.push(`Failed to update: ${ticketInfo.ticket.name}`)
        throw error
      }
    }

    // Process CREATES second (new tickets)
    for (const ticket of ticketsToCreate) {
      try {
        const newTicketId = await createNewTicket(ticket)
        ticket.ticket_type_id = newTicketId
        results.push(`Created: ${ticket.name}`)
      } catch (error) {
        console.error(`❌ Failed to create ${ticket.name}:`, error)
        results.push(`Failed to create: ${ticket.name}`)
        throw error
      }
    }

    // Update stores and mark as complete
    await updateStoresAfterSave(eventStore, tabsStore)

    // Show success message
    toast.add({
      severity: 'success',
      summary: 'Tickets Saved Successfully! 🎫',
      detail: `${results.length} ticket(s) processed successfully. You can now publish the event.`,
      life: 5000
    })

    console.log('🎉 Ticket save process completed successfully')

  } catch (error) {
    handleSaveError(error)
  } finally {
    loading.value = false
  }
}

// Helper function: Validate all tickets
const validateAllTickets = () => {
  const invalidTickets = []
  
  for (let index = 0; index < tickets.value.length; index++) {
    const ticket = tickets.value[index]
    const ticketNumber = index + 1
    const errors = []
    
    const name = (ticket.name || '').toString().trim()
    const description = (ticket.description || ticket.tag || '').toString().trim()
    const price = ticket.price !== null && ticket.price !== undefined ? parseFloat(ticket.price) : NaN
    const quantity = ticket.quantity !== null && ticket.quantity !== undefined ? parseInt(ticket.quantity) : NaN
    
    if (!name || name.length === 0) errors.push('name')
    if (!description || description.length === 0) errors.push('description')
    if (isNaN(price) || price < 0) errors.push('price')
    if (isNaN(quantity) || quantity < 1) errors.push('quantity')
    
    if (errors.length > 0) {
      ticket.isValidating = true
      invalidTickets.push({
        ticketNumber,
        ticketName: name || `Ticket ${ticketNumber}`,
        errors
      })
    } else {
      ticket.isValidating = false
    }
  }

  return {
    isValid: invalidTickets.length === 0,
    errors: invalidTickets
  }
}

// Helper function: Show validation errors
const showValidationErrors = (invalidTickets) => {
  const errorMessages = invalidTickets.map(ticket => {
    const fieldNames = {
      name: 'Ticket Name',
      description: 'Description',
      price: 'Price',
      quantity: 'Quantity'
    }
    const readableErrors = ticket.errors.map(error => fieldNames[error] || error)
    return `• ${ticket.ticketName}: ${readableErrors.join(', ')}`
  })

  toast.add({
    severity: 'error',
    summary: 'Please Complete All Required Fields',
    detail: `The following tickets need attention:\n${errorMessages.join('\n')}`,
    life: 10000,
    sticky: true
  })
}

// Helper function: Fetch existing tickets
const fetchExistingTickets = async () => {
  try {
    const response = await getEventTicketTypes(currentEventId.value)
    
    if (response?.data && Array.isArray(response.data)) {
      return response.data
    } else if (Array.isArray(response)) {
      return response
    }
    return []
  } catch (error) {
    console.warn('⚠️ Failed to fetch existing tickets:', error)
    return []
  }
}

// Helper function: Categorize tickets into update vs create
const categorizeTickets = (existingTickets) => {
  const ticketsToUpdate = []
  const ticketsToCreate = []

  for (const ticket of tickets.value) {
    let existingTicket = null

    // PRIORITY 1: Match by ticket_type_id (most reliable)
    if (ticket.ticket_type_id) {
      existingTicket = existingTickets.find(et => et.id === ticket.ticket_type_id)
      console.log(`🔍 ID Match for "${ticket.name}":`, !!existingTicket)
    }

    // PRIORITY 2: Match by exact name (only if no ID match)
    if (!existingTicket) {
      const ticketName = String(ticket.name || '').trim().toLowerCase()
      existingTicket = existingTickets.find(et =>
        String(et.name || '').trim().toLowerCase() === ticketName
      )
      console.log(`🔍 Name Match for "${ticket.name}":`, !!existingTicket)
    }

    if (existingTicket) {
      // UPDATE existing ticket
      ticketsToUpdate.push({
        ticket,
        existingTicket,
        ticketData: createTicketData(ticket)
      })
      // Ensure ticket has the correct ID
      ticket.ticket_type_id = existingTicket.id
    } else {
      // CREATE new ticket
      ticketsToCreate.push(ticket)
    }
  }

  return { ticketsToUpdate, ticketsToCreate }
}

// Helper function: Create ticket data object
const createTicketData = (ticket) => {
  return {
    name: String(ticket.name || '').trim(),
    price: parseFloat(ticket.price || 0),
    total: parseInt(ticket.quantity || 0),
    tag: String(ticket.description || ticket.tag || '').trim(),
    sort_order: ticket.sort_order || 1,
    is_active: 1
  }
}

// Helper function: Update existing ticket
const updateExistingTicket = async (ticketInfo) => {
  const { ticket, existingTicket, ticketData } = ticketInfo
  
  console.log(`📝 Updating ticket: ${ticket.name} (ID: ${existingTicket.id})`)
  
  await updateTicketType(currentEventId.value, existingTicket.id, ticketData)
  
  console.log(`✅ Successfully updated: ${ticket.name}`)
}

// Helper function: Create new ticket
const createNewTicket = async (ticket) => {
  const ticketData = createTicketData(ticket)
  
  console.log(`🆕 Creating new ticket: ${ticket.name}`)
  
  const response = await createTicketTypes(currentEventId.value, [ticketData])
  
  let newTicketId = null
  if (response?.data && Array.isArray(response.data) && response.data[0]?.id) {
    newTicketId = response.data[0].id
  } else if (response?.id) {
    newTicketId = response.id
  }
  
  console.log(`✅ Successfully created: ${ticket.name} (ID: ${newTicketId})`)
  
  return newTicketId
}

// Helper function: Update stores after successful save
const updateStoresAfterSave = async (eventStore, tabsStore) => {
  // Update event store
  if (eventStore.currentEvent) {
    const updatedTickets = tickets.value.map(ticket => ({
      id: ticket.ticket_type_id || ticket.id,
      name: ticket.name,
      price: parseFloat(ticket.price) || 0,
      total: parseInt(ticket.quantity) || 0,
      tag: ticket.description || '',
      sort_order: ticket.sort_order,
      is_active: ticket.is_active ? 1 : 0
    }))
    eventStore.currentEvent.ticket_types = updatedTickets
  }

  // Update tab store and mark as complete
  const tabData = {
    ticketTypes: tickets.value.map(ticket => ({
      ...ticket,
      // Ensure we have the API ID for future updates
      ticket_type_id: ticket.ticket_type_id || ticket.id
    })),
    lastSaved: new Date().toISOString(),
    hasTickets: true,
    eventId: currentEventId.value,
    isComplete: true,
    validTickets: tickets.value.length > 0,
    hasUnsavedChanges: false // Clear unsaved changes flag
  }
  
  tabsStore.markTabComplete(2)
  tabsStore.markTabSaved(2) // Mark as saved to API
  tabsStore.saveTabData(2, tabData)
  tabsStore.clearTabModifications(2) // Clear modification flag
  
  console.log('✅ Stores updated and ticket tab marked as complete and saved')
}

// Helper function: Handle save errors
const handleSaveError = (error) => {
  console.error('❌ Ticket save error:', error)
  
  let errorMessage = 'Failed to save tickets. Please try again.'
  let errorSummary = 'Save Failed'
  
  if (error.message) {
    errorMessage = error.message
    
    if (error.message.includes('Authentication')) {
      errorSummary = 'Authentication Error'
      errorMessage = 'Please login again to continue.'
    } else if (error.message.includes('Validation')) {
      errorSummary = 'Validation Error'
    } else if (error.message.includes('already taken')) {
      errorSummary = 'Duplicate Ticket Name'
      errorMessage = 'A ticket with this name already exists. Please use a different name or edit the existing ticket.'
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
}

// Load existing tickets when in edit mode
const loadExistingTickets = async () => {
  if (!currentEventId.value) {
    console.warn('No event ID available for loading tickets')
    return
  }

  loading.value = true
  try {
    console.log('🎫 Loading existing tickets for event:', currentEventId.value)
    const response = await getEventTicketTypes(currentEventId.value)
    
    if (response && response.data && Array.isArray(response.data)) {
      const existingTickets = response.data
      
      if (existingTickets.length > 0) {
        console.log('✅ Found existing tickets:', existingTickets.length)
        
        // Clear current tickets and load existing ones with proper validation
        tickets.value = existingTickets.map((ticket, index) => {
          const loadedTicket = {
            id: ticket.id || Date.now() + Math.random() + index,
            ticket_type_id: ticket.id, // Store original ID for updates
            name: ticket.name || '',
            description: ticket.description || ticket.tag || '',
            tag: ticket.tag || ticket.description || '', // Ensure both fields
            price: parseFloat(ticket.price) || 0,
            quantity: parseInt(ticket.total || ticket.quantity) || 1,
            sort_order: ticket.sort_order || (index + 1),
            is_active: ticket.is_active === undefined ? true : Boolean(ticket.is_active),
            isValidating: false
          }
          
          console.log('📝 Loaded ticket from API:', {
            index,
            original: ticket,
            loaded: loadedTicket
          })
          
          return loadedTicket
        })
        
        hasExistingTickets.value = true
        
        console.log('📝 Loaded tickets:', tickets.value.map(t => ({
          id: t.id,
          ticket_type_id: t.ticket_type_id,
          name: t.name
        })))
        
        toast.add({
          severity: 'success',
          summary: 'Tickets Loaded',
          detail: `Loaded ${existingTickets.length} existing ticket(s)`,
          life: 3000
        })
      } else {
        console.log('📝 No existing tickets found, starting fresh')
        hasExistingTickets.value = false
        tickets.value = [] // Clear any existing tickets
      }
    }
  } catch (error) {
    console.error('❌ Failed to load existing tickets:', error)
    toast.add({
      severity: 'error',
      summary: 'Load Failed',
      detail: error.message || 'Could not load existing tickets. You can create new ones.',
      life: 4000
    })
    tickets.value = [] // Reset on error
    hasExistingTickets.value = false
  } finally {
    loading.value = false
  }
}

// Enhanced initialization with better data restoration and synchronization
onMounted(async () => {
  console.log('🎫 Initializing TicketPacket component...')
  
  // Use Pinia store instead of localStorage
  const eventStore = useEventStore()
  const tabsStore = useEventTabsStore()
  
  if (eventStore.hasCurrentEvent) {
    currentEventId.value = eventStore.currentEvent.id
    currentEventName.value = eventStore.currentEvent.name || "Unnamed Event"
    console.log('📋 Current event found:', {
      id: currentEventId.value,
      name: currentEventName.value
    })
    
    // Check if event has completed basic info from tab store
    const basicInfoData = tabsStore.getTabData(0)
    const hasBasicInfo = basicInfoData.isComplete || (
      eventStore.currentEvent &&
      eventStore.currentEvent.name &&
      eventStore.currentEvent.category_id &&
      eventStore.currentEvent.start_date &&
      eventStore.currentEvent.end_date &&
      eventStore.currentEvent.location
    )
    
    if (!hasBasicInfo) {
      console.log("⚠️ Basic info not complete.")
      toast.add({
        severity: 'warn',
        summary: 'Basic Info Required',
        detail: 'Please complete and save Basic Info first.',
        life: 3000
      })
      return
    }
    
    console.log("📋 Loading event for tickets:", {
      id: currentEventId.value,
      name: currentEventName.value,
      hasBasicInfo,
      isTabComplete: tabsStore.isTabCompleted(0)
    })

    // Enhanced ticket restoration with priority order and better synchronization
    const ticketTabData = tabsStore.getTabData(2)
    let ticketsRestored = false
    
    // Priority 1: Load fresh from API to ensure data consistency
    console.log('🔄 Loading fresh tickets from API for data consistency...')
    await loadExistingTickets()
    ticketsRestored = tickets.value.length > 0
    
    // Priority 2: If no API data, try tab persistence (user's current work)
    if (!ticketsRestored && ticketTabData.ticketTypes && ticketTabData.ticketTypes.length > 0) {
      console.log('📦 Restoring tickets from tab persistence:', ticketTabData.ticketTypes.length)
      tickets.value = ticketTabData.ticketTypes.map((ticket, index) => {
        const restoredTicket = {
          id: ticket.id || Date.now() + Math.random() + index,
          ticket_type_id: ticket.ticket_type_id || ticket.id,
          name: ticket.name || '',
          description: ticket.description || ticket.tag || '',
          tag: ticket.tag || ticket.description || '', // Ensure both fields
          price: parseFloat(ticket.price) || 0,
          quantity: parseInt(ticket.quantity || ticket.total) || 1,
          sort_order: ticket.sort_order || (index + 1),
          is_active: ticket.is_active === undefined ? true : Boolean(ticket.is_active),
          isValidating: false
        }
        
        console.log('📝 Restored ticket from tab persistence:', {
          index,
          original: ticket,
          restored: restoredTicket
        })
        
        return restoredTicket
      })
      hasExistingTickets.value = true
      ticketsRestored = true
      
      // Mark as needing save since this is from tab persistence
      tabsStore.markTabNeedsSave(2)
    }
    // Priority 3: Event store (loaded from API) - fallback
    else if (!ticketsRestored && eventStore.currentEvent.ticket_types?.length > 0) {
      console.log('📦 Restoring tickets from event store:', eventStore.currentEvent.ticket_types.length)
      tickets.value = eventStore.currentEvent.ticket_types.map((ticket, index) => {
        const restoredTicket = {
          id: ticket.id || Date.now() + Math.random() + index,
          ticket_type_id: ticket.id,
          name: ticket.name || '',
          description: ticket.description || ticket.tag || '',
          tag: ticket.tag || ticket.description || '', // Ensure both fields
          price: parseFloat(ticket.price) || 0,
          quantity: parseInt(ticket.total || ticket.quantity) || 1,
          sort_order: ticket.sort_order || (index + 1),
          is_active: ticket.is_active === undefined ? true : Boolean(ticket.is_active),
          isValidating: false
        }
        
        console.log('📝 Restored ticket from event store:', {
          index,
          original: ticket,
          restored: restoredTicket
        })
        
        return restoredTicket
      })
      hasExistingTickets.value = true
      ticketsRestored = true
      
      // Mark as saved since this is from API
      tabsStore.markTabSaved(2)
    }
    
    // Auto-save current state for tab switching
    if (tickets.value.length > 0) {
      handleSaveCurrentTab()
      if (hasExistingTickets.value) {
        tabsStore.markTabComplete(2)
      }
    }
    
  } else {
    console.log("⚠️ No event found in store. Complete Basic Info first.")
    toast.add({
      severity: 'warn',
      summary: 'Event Required',
      detail: 'Please complete and save Basic Info first.',
      life: 3000
    })
  }

  // Add event listeners for ticket saving and tab switching
  window.addEventListener('saveTickets', saveTickets)
  window.addEventListener('saveCurrentTab', handleSaveCurrentTab)
  window.addEventListener('loadTicketData', (event) => {
    if (event.detail?.eventId === currentEventId.value) {
      loadExistingTickets()
    }
  })
})

// Remove event listeners when component unmounts
onUnmounted(() => {
  window.removeEventListener('saveTickets', saveTickets)
  window.removeEventListener('saveCurrentTab', handleSaveCurrentTab)
  window.removeEventListener('loadTicketData', loadExistingTickets)
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

.refresh-tickets-btn {
  @apply bg-gradient-to-r from-blue-600 to-cyan-600 text-white;
  @apply hover:from-blue-700 hover:to-cyan-700;
  @apply px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl;
  @apply transition-all duration-300 ease-in-out border-0;
}

.refresh-tickets-btn:hover {
  transform: translateY(-2px);
}

.refresh-tickets-btn:disabled {
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
  position: absolute;
  width: 100%;
}
</style>
