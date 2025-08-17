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
        <p v-if="isEditMode" class="text-xs text-blue-600 font-medium">📝 Edit Mode</p>
        <p v-else class="text-xs text-purple-600 font-medium">🆕 Create Mode</p>
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
    <!-- Edit Mode Warning for Published Events -->
    <div v-if="isEditMode && eventData?.is_published" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div class="flex items-center">
        <Icon name="heroicons:information-circle" class="w-5 h-5 text-blue-600 mr-2" />
        <div>
          <p class="text-sm font-medium text-blue-800">Editing Published Event</p>
          <p class="text-xs text-blue-600">Changes to tickets will affect live event. Please review carefully before saving.</p>
        </div>
      </div>
    </div>

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
        <!-- Save Draft Button (for new tickets or adding more) -->
        <Button
          v-if="!isEditMode"
          @click="saveDraft"
          :disabled="!currentEventId || tickets.length === 0 || loading"
          :class="[
            'save-draft-btn flex items-center justify-center',
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
          <Icon v-else name="heroicons:document-arrow-down" class="mr-2" />
          {{ loading ? 'Saving...' : 'Save Draft' }}
        </Button>

        <!-- Update Button (for editing existing tickets) -->
        <Button
          v-if="isEditMode"
          @click="updateTickets"
          :disabled="!currentEventId || tickets.length === 0 || loading"
          :class="[
            'update-tickets-btn flex items-center justify-center',
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
          <Icon v-else name="heroicons:pencil-square" class="mr-2" />
          {{ loading ? 'Updating...' : 'Update Tickets' }}
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
const isEditMode = ref(false)
const eventData = ref(null)

// Track if there are new tickets added
const hasNewTickets = computed(() => {
  return tickets.value.some(ticket => !ticket.ticket_type_id)
})

// Clear all ticket data and refresh from API with proper event isolation
const clearAndRefreshTickets = async () => {
  if (!currentEventId.value) return

  loading.value = true
  try {
    console.log('🧹 Clearing all ticket data and refreshing from API for event:', currentEventId.value)
    
    // Clear local state completely
    tickets.value = []
    hasExistingTickets.value = false
    
    // Clear tab store data for current event only
    const tabsStore = useEventTabsStore()
    tabsStore.clearTabData(2) // Clear tickets tab data
    
    // Clear event store tickets for current event
    const eventStore = useEventStore()
    if (eventStore.currentEvent && eventStore.currentEvent.id === currentEventId.value) {
      eventStore.currentEvent.ticket_types = []
    }
    
    // Force reload from API with event ID validation
    if (currentEventId.value) {
      await loadExistingTickets()
    }
    
    console.log('✅ Ticket data cleared and refreshed for event:', currentEventId.value)
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

const createNewTicket = () => {
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
  tickets.value.push(createNewTicket())
}

// Enhanced save current tab data for tab switching with event validation
const handleSaveCurrentTab = (event) => {
  const tabsStore = useEventTabsStore()
  
  // Validate event context if provided
  if (event?.detail?.eventId && event.detail.eventId !== currentEventId.value) {
    console.warn('⚠️ Event ID mismatch in save request, ignoring:', {
      requested: event.detail.eventId,
      current: currentEventId.value
    })
    return
  }
  
  // Only save if we have a valid event ID
  if (!currentEventId.value) {
    console.warn('⚠️ No current event ID, cannot save ticket data')
    return
  }
  
  // Log current ticket data before saving
  console.log('💾 Saving current ticket data for event:', currentEventId.value, tickets.value.map((t, i) => ({
    index: i,
    name: t.name,
    description: t.description,
    price: t.price,
    quantity: t.quantity,
    eventId: t.eventId
  })))
  
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
      is_active: ticket.is_active,
      eventId: currentEventId.value // Ensure event ID is included
    })),
    lastSaved: new Date().toISOString(),
    hasTickets: tickets.value.length > 0,
    eventId: currentEventId.value,
    isEditMode: isEditMode.value,
    isComplete: tickets.value.length > 0 && tickets.value.every(t =>
      (t.name && t.name.trim()) &&
      (t.description && t.description.trim()) &&
      (t.price !== null && t.price !== undefined && t.price >= 0) &&
      (t.quantity !== null && t.quantity !== undefined && t.quantity > 0)
    )
  }
  
  tabsStore.saveTabData(2, tabData)
  console.log('💾 Ticket data saved to tab persistence for event:', currentEventId.value, tickets.value.length, 'tickets')
}

// Save Draft - for new tickets or adding more tickets
const saveDraft = async () => {
  console.log('💾 Saving tickets as draft...')
  await saveTicketsInternal('draft')
}

// Update Tickets - for editing existing tickets
const updateTickets = async () => {
  console.log('📝 Updating existing tickets...')
  await saveTicketsInternal('update')
}

// Internal save method - ENHANCED FOR NEW FLOW with edit/create mode validation
const saveTicketsInternal = async (mode = 'draft') => {
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

  // Show different confirmation for published events
  if (isEditMode.value && eventData.value?.is_published) {
    console.log('⚠️ Saving tickets for published event - showing warning')
    toast.add({
      severity: 'info',
      summary: 'Updating Published Event',
      detail: 'You are modifying tickets for a live event. Changes will be visible to users immediately.',
      life: 4000
    })
  }

  // Enhanced ticket validation with better error detection
  const invalidTickets = []
  
  for (let index = 0; index < tickets.value.length; index++) {
    const ticket = tickets.value[index]
    const ticketNumber = index + 1
    const errors = []
    
    // Get current values with fallbacks
    const name = (ticket.name || '').toString().trim()
    const description = (ticket.description || ticket.tag || '').toString().trim()
    const price = ticket.price !== null && ticket.price !== undefined ? parseFloat(ticket.price) : NaN
    const quantity = ticket.quantity !== null && ticket.quantity !== undefined ? parseInt(ticket.quantity) : NaN
    
    console.log('🔍 Enhanced ticket validation:', {
      ticketNumber,
      name: `"${name}"`,
      nameLength: name.length,
      description: `"${description}"`,
      descriptionLength: description.length,
      price,
      quantity,
      rawTicket: {
        name: ticket.name,
        description: ticket.description,
        tag: ticket.tag,
        price: ticket.price,
        quantity: ticket.quantity
      }
    })
    
    // Validate name - must be non-empty string
    if (!name || name.length === 0) {
      errors.push('name')
      console.log(`❌ Ticket ${ticketNumber}: Name validation failed - "${name}"`)
    }
    
    // Validate description - must be non-empty string
    if (!description || description.length === 0) {
      errors.push('description')
      console.log(`❌ Ticket ${ticketNumber}: Description validation failed - "${description}"`)
    }
    
    // Validate price - must be valid number >= 0
    if (isNaN(price) || price < 0) {
      errors.push('price')
      console.log(`❌ Ticket ${ticketNumber}: Price validation failed - ${price}`)
    }
    
    // Validate quantity - must be valid integer >= 1
    if (isNaN(quantity) || quantity < 1) {
      errors.push('quantity')
      console.log(`❌ Ticket ${ticketNumber}: Quantity validation failed - ${quantity}`)
    }
    
    // Mark ticket for validation display if errors exist
    if (errors.length > 0) {
      ticket.isValidating = true
      invalidTickets.push({
        ticketNumber,
        ticketName: name || `Ticket ${ticketNumber}`,
        errors
      })
      console.log(`❌ Ticket ${ticketNumber} validation failed:`, errors)
    } else {
      ticket.isValidating = false
      console.log(`✅ Ticket ${ticketNumber} validation passed`)
    }
  }

  if (invalidTickets.length > 0) {
    const errorMessages = invalidTickets.map(ticket => {
      const fieldNames = {
        name: 'Ticket Name',
        description: 'Description',
        price: 'Price',
        quantity: 'Quantity'
      }
      const readableErrors = ticket.errors.map(error => fieldNames[error] || error)
      return `• ${ticket.ticketName || `Ticket ${ticket.ticketNumber}`}: ${readableErrors.join(', ')}`
    })

    console.log('❌ Validation failed for tickets:', invalidTickets)

    toast.add({
      severity: 'error',
      summary: 'Please Complete All Required Fields',
      detail: `The following tickets need attention:\n${errorMessages.join('\n')}\n\nPlease fill in all required fields before saving.`,
      life: 10000,
      sticky: true
    })

    // Force re-render of validation states
    tickets.value = [...tickets.value.map((ticket, index) => ({
      ...ticket,
      isValidating: invalidTickets.some(invalid => invalid.ticketNumber === index + 1)
    }))]

    console.log('🔄 Updated validation states for tickets')
    return
  }

  loading.value = true

  try {
    console.log('🎫 Starting ticket save process...')
    
    // Get existing tickets from API to determine update vs create strategy
    let existingTickets = []
    try {
      const existingTicketsResponse = await getEventTicketTypes(currentEventId.value)
      
      // Handle different response structures
      if (existingTicketsResponse?.data && Array.isArray(existingTicketsResponse.data)) {
        existingTickets = existingTicketsResponse.data
      } else if (Array.isArray(existingTicketsResponse)) {
        existingTickets = existingTicketsResponse
      } else {
        existingTickets = []
      }
      
      console.log(`📋 Found ${existingTickets.length} existing tickets in API`, existingTickets)
    } catch (error) {
      console.warn('⚠️ Failed to fetch existing tickets:', error)
      existingTickets = []
    }

    // Ensure existingTickets is always an array
    if (!Array.isArray(existingTickets)) {
      console.warn('⚠️ existingTickets is not an array, converting:', existingTickets)
      existingTickets = []
    }

    const ticketUpdates = []
    const updatePromises = []
    
    // Process each ticket individually
    for (let index = 0; index < tickets.value.length; index++) {
      const ticket = tickets.value[index]
      const ticketNumber = index + 1
      
      const name = String(ticket.name || '').trim()
      const description = String(ticket.description || ticket.tag || '').trim()
      const price = parseFloat(ticket.price || 0)
      const quantity = parseInt(ticket.quantity || 0)

      console.log(`🎫 Processing ticket ${ticketNumber}:`, {
        name,
        description,
        price,
        quantity,
        hasTicketTypeId: !!ticket.ticket_type_id
      })

      // Enhanced validation
      const errors = []
      if (!name) errors.push(`Ticket ${ticketNumber}: Name is required`)
      if (!description) errors.push(`Ticket ${ticketNumber}: Description is required`)
      if (isNaN(price) || price < 0) errors.push(`Ticket ${ticketNumber}: Price must be 0 or greater`)
      if (isNaN(quantity) || quantity < 1) errors.push(`Ticket ${ticketNumber}: Quantity must be at least 1`)

      if (errors.length > 0) {
        throw new Error(errors.join('\n'))
      }

      // Check if this ticket exists in API (by name or ID)
      const existingTicket = existingTickets.find(et =>
        et.id === ticket.ticket_type_id ||
        et.name.toLowerCase() === name.toLowerCase()
      )

      const ticketData = {
        name: name,
        price: parseFloat(price),
        total: quantity,
        tag: description,
        sort_order: index + 1,
        is_active: 1
      }

      if (existingTicket) {
        // UPDATE existing ticket
        console.log(`📝 Updating existing ticket: ${name} (ID: ${existingTicket.id})`)
        const updatePromise = updateTicketType(currentEventId.value, existingTicket.id, ticketData)
          .then(() => {
            ticketUpdates.push(`Updated: ${name}`)
            console.log(`✅ Updated ticket: ${name}`)
            // Update local ticket with the API ID
            ticket.ticket_type_id = existingTicket.id
          })
          .catch((error) => {
            console.error(`❌ Failed to update ticket ${name}:`, error)
            ticketUpdates.push(`Failed to update: ${name}`)
            throw error
          })
        
        updatePromises.push(updatePromise)
      } else {
        // CREATE new ticket (single ticket at a time to avoid name conflicts)
        console.log(`🆕 Creating new ticket: ${name}`)
        const createPromise = createTicketTypes(currentEventId.value, [ticketData])
          .then((response) => {
            ticketUpdates.push(`Created: ${name}`)
            console.log(`✅ Created ticket: ${name}`)
            // Update local ticket with the new API ID if available
            if (response?.data?.[0]?.id) {
              ticket.ticket_type_id = response.data[0].id
            }
          })
          .catch((error) => {
            console.error(`❌ Failed to create ticket ${name}:`, error)
            ticketUpdates.push(`Failed to create: ${name}`)
            throw error
          })
        
        updatePromises.push(createPromise)
      }
    }

    // Wait for all operations to complete
    await Promise.all(updatePromises)
    console.log(`✅ All ticket operations completed`)

      // Update stores with new ticket data
      console.log('💾 Updating stores with saved ticket data...')
      
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
        console.log(`✅ Updated ${updatedTickets.length} tickets in event store`)
      }

      // Update tab store and mark as complete
      const tabData = {
        ticketTypes: tickets.value,
        lastSaved: new Date().toISOString(),
        hasTickets: true,
        eventId: currentEventId.value,
        isComplete: true,
        validTickets: tickets.value.length > 0
      }
      tabsStore.markTabComplete(2)
      tabsStore.markTabSaved(2)
      tabsStore.saveTabData(2, tabData)
      console.log('✅ Ticket tab marked as complete')

      // Show success message
      toast.add({
        severity: 'success',
        summary: 'Tickets Saved Successfully! 🎫',
        detail: ticketUpdates.length > 0 ? ticketUpdates.join('\n') : 'All tickets processed successfully',
        life: 5000
      })

      console.log('🎉 Ticket save process completed successfully:', {
        ticketCount: tickets.value.length,
        eventId: currentEventId.value,
        tabComplete: true
      })

    // Reload tickets to get updated data with fresh IDs
    setTimeout(async () => {
      await loadExistingTickets()
    }, 1000) // Small delay to ensure server has processed the changes

  } catch (error) {
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

// Load existing tickets when in edit mode with proper event validation
const loadExistingTickets = async () => {
  if (!currentEventId.value) {
    console.warn('No event ID available for loading tickets')
    return
  }

  // Validate that we're loading tickets for the correct event
  const eventStore = useEventStore()
  if (eventStore.currentEvent && eventStore.currentEvent.id !== currentEventId.value) {
    console.warn('⚠️ Event ID mismatch, clearing tickets to prevent data mixing')
    tickets.value = []
    hasExistingTickets.value = false
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
            isValidating: false,
            eventId: currentEventId.value // Add event ID for validation
          }
          
          console.log('📝 Loaded ticket from API:', {
            index,
            eventId: currentEventId.value,
            original: ticket,
            loaded: loadedTicket
          })
          
          return loadedTicket
        })
        
        hasExistingTickets.value = true
        isEditMode.value = true
        
        console.log('📝 Loaded tickets for event:', {
          eventId: currentEventId.value,
          ticketCount: tickets.value.length,
          isEditMode: isEditMode.value
        })
        
        toast.add({
          severity: 'success',
          summary: 'Tickets Loaded',
          detail: `Loaded ${existingTickets.length} existing ticket(s) for editing`,
          life: 3000
        })
      } else {
        console.log('📝 No existing tickets found, starting fresh')
        hasExistingTickets.value = false
        tickets.value = [] // Clear any existing tickets
        isEditMode.value = false
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
    isEditMode.value = false
  } finally {
    loading.value = false
  }
}

// Enhanced initialization with better data restoration
onMounted(async () => {
  console.log('🎫 Initializing TicketPacket component...')
  
  // Use Pinia store instead of localStorage
  const eventStore = useEventStore()
  const tabsStore = useEventTabsStore()
  
  if (eventStore.hasCurrentEvent) {
    currentEventId.value = eventStore.currentEvent.id
    currentEventName.value = eventStore.currentEvent.name || "Unnamed Event"
    eventData.value = eventStore.currentEvent
    isEditMode.value = !!eventStore.currentEvent.id && (eventStore.currentEvent.status !== 'new')
    
    console.log('📋 Current event found:', {
      id: currentEventId.value,
      name: currentEventName.value,
      isEditMode: isEditMode.value,
      status: eventStore.currentEvent.status,
      isPublished: eventStore.currentEvent.is_published
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

    // Enhanced ticket restoration with priority order
    const ticketTabData = tabsStore.getTabData(2)
    let ticketsRestored = false
    
    // Priority 1: Tab persistence (user's current work)
    if (ticketTabData.ticketTypes && ticketTabData.ticketTypes.length > 0) {
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
      tabsStore.markTabComplete(2)
    }
    // Priority 2: Event store (loaded from API)
    else if (eventStore.currentEvent.ticket_types?.length > 0) {
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
      
      // Save to tab persistence for future use
      handleSaveCurrentTab()
      tabsStore.markTabComplete(2)
    }
    
    // Priority 3: Load fresh from API if nothing in stores
    if (!ticketsRestored) {
      console.log('🔄 Loading tickets from API...')
      await loadExistingTickets()
    }
    
    // Auto-save current state for tab switching
    if (tickets.value.length > 0) {
      handleSaveCurrentTab()
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

  // Add event listeners for ticket saving and tab switching with event validation
  window.addEventListener('saveTickets', saveDraft)
  window.addEventListener('saveCurrentTab', handleSaveCurrentTab)
  window.addEventListener('loadTicketData', (event) => {
    // Only load if the event ID matches current event
    if (event.detail?.eventId === currentEventId.value) {
      console.log('🔄 Loading ticket data for matching event:', event.detail.eventId)
      loadExistingTickets()
    } else if (event.detail?.eventId) {
      console.warn('⚠️ Ignoring load request for different event:', {
        requested: event.detail.eventId,
        current: currentEventId.value
      })
    }
  })
  
  // Add event listener for event switching to clear data
  window.addEventListener('clearTicketData', (event) => {
    if (event.detail?.eventId !== currentEventId.value) {
      console.log('🧹 Clearing ticket data for event switch')
      tickets.value = []
      hasExistingTickets.value = false
      isEditMode.value = false
      
      // Clear tab store data
      const tabsStore = useEventTabsStore()
      tabsStore.clearTabData(2, event.detail?.eventId)
    }
  })
})

// Remove event listeners when component unmounts
onUnmounted(() => {
  window.removeEventListener('saveTickets', saveDraft)
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

.save-draft-btn {
  @apply bg-gradient-to-r from-purple-600 to-indigo-600 text-white;
  @apply hover:from-purple-700 hover:to-indigo-700;
  @apply px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl;
  @apply transition-all duration-300 ease-in-out border-0;
}

.save-draft-btn:hover {
  transform: translateY(-2px);
}

.save-draft-btn:disabled {
  @apply bg-gray-400 cursor-not-allowed;
  transform: none;
}

.update-tickets-btn {
  @apply bg-gradient-to-r from-green-600 to-emerald-600 text-white;
  @apply hover:from-green-700 hover:to-emerald-700;
  @apply px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl;
  @apply transition-all duration-300 ease-in-out border-0;
}

.update-tickets-btn:hover {
  transform: translateY(-2px);
}

.update-tickets-btn:disabled {
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
