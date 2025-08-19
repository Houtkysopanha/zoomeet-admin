<template>
  <div class="">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-lg font-semibold">Ticket Packages</h2>
        <p class="text-gray-400">Create and manage different ticket types</p>
      </div>
      <div v-if="currentEventId" class="text-right">
        <p class="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-500">Basic Info Saved</p>
        <p class="text-xs text-gray-500">{{ currentEventName }}</p>
        <p v-if="shouldShowEditMode" class="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-500">Edit Mode</p>
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

    <!-- FIXED: Ticket Display Based on Workflow State -->
    <div v-if="tickets.length > 0" class="space-y-4 mb-6">
      <TransitionGroup name="ticket-list" tag="div" class="space-y-4">
        <div
          v-for="(ticket, index) in tickets"
          :key="ticket.id"
          class="relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <!-- FIXED: Edit Icon Only for Saved Tickets (after draft) -->
          <div v-if="ticket.ticket_type_id && hasExistingTickets" class="absolute top-4 right-4 z-10">
            <Button
              icon="pi pi-pencil"
              text
              rounded
              size="small"
              class="edit-ticket-btn text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              @click="editTicket(index)"
              title="Edit this saved ticket"
            />
          </div>
          
          <!-- Ticket Form Component -->
          <div class="p-4">
            <TicketForm
              v-model="tickets[index]"
              :ticket-index="index"
              :readonly="false"
              @remove-ticket="removeTicket"
            />
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
      <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon name="heroicons:ticket" class="w-8 h-8 text-purple-600" />
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No tickets created yet</h3>
      <p class="text-gray-500 mb-6">Create your first ticket package to get started.</p>
      <Button
        @click="addTicket"
        class="create-first-ticket-btn"
        :disabled="!currentEventId"
      >
        <Icon name="heroicons:plus" class="mr-2" />
        Create First Ticket
      </Button>
    </div>

    <!-- FIXED: Action Buttons Based on Workflow State -->
    <div class="flex justify-center items-center mt-6 gap-4">
      <!-- PHASE 1: Create First Ticket (No tickets exist) -->
      <Button
        v-if="tickets.length === 0"
        @click="addTicket"
        class="create-first-ticket-btn"
        :disabled="!currentEventId"
      >
        <Icon name="heroicons:plus" class="mr-2" />
        Create Ticket
      </Button>
      
      <!-- PHASE 2: Add More Tickets (Tickets exist but not saved) -->
      <Button
        v-else-if="!hasExistingTickets"
        @click="addTicket"
        class="add-ticket-btn"
        :disabled="!currentEventId"
      >
        <Icon name="heroicons:plus" class="mr-2" />
        Add Another Ticket
      </Button>
      
      <!-- PHASE 3: After Draft Saved - Show Add + Edit Options -->
      <template v-else>
        <Button
          @click="addTicket"
          class="add-ticket-btn"
          :disabled="!currentEventId"
        >
          <Icon name="heroicons:plus" class="mr-2" />
          Add Ticket Package
        </Button>
        
        <Button
          @click="updateTickets"
          class="update-tickets-btn"
          :disabled="!currentEventId || loading"
          :loading="loading"
        >
          <Icon name="heroicons:arrow-path" class="mr-2" />
          {{ loading ? 'Updating...' : 'Save Changes' }}
        </Button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, inject } from "vue"
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

// Enhanced computed property to determine if we should show edit mode UI
const shouldShowEditMode = computed(() => {
  return isEditMode.value && hasExistingTickets.value
})

// Validate ticket data
const isValidTicketData = computed(() => {
  if (tickets.value.length === 0) return false
  
  return tickets.value.every(ticket => {
    const name = (ticket.name || '').toString().trim()
    const description = (ticket.description || ticket.tag || '').toString().trim()
    const price = ticket.price !== null && ticket.price !== undefined ? parseFloat(ticket.price) : NaN
    const quantity = ticket.quantity !== null && ticket.quantity !== undefined ? parseInt(ticket.quantity) : NaN
    
    return name.length > 0 &&
           description.length > 0 &&
           !isNaN(price) && price >= 0 &&
           !isNaN(quantity) && quantity > 0
  })
})

// Clear all ticket data and refresh from API with proper event isolation
const clearAndRefreshTickets = async () => {
  if (!currentEventId.value) return

  loading.value = true
  try {
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
  } catch (error) {
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

// FIXED: Add edit ticket functionality
const editTicket = (index) => {
  const ticket = tickets.value[index]
  if (!ticket) return
  
  console.log('✏️ Editing ticket:', ticket.name, 'at index:', index)
  
  // Show edit notification
  toast.add({
    severity: 'info',
    summary: 'Edit Mode',
    detail: `Now editing "${ticket.name}". Make your changes and click "Save Changes" to update.`,
    life: 4000
  })
  
  // Scroll to the ticket form for better UX
  const ticketElement = document.querySelector(`[data-ticket-index="${index}"]`)
  if (ticketElement) {
    ticketElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
  
  // Mark the ticket as being edited (for visual feedback)
  ticket.isEditing = true
  
  // Auto-save current state
  handleSaveCurrentTab()
}

// FIXED: Add remove ticket functionality
const removeTicket = (index) => {
  const ticket = tickets.value[index]
  if (!ticket) return
  
  const ticketName = ticket.name || `Ticket ${index + 1}`
  
  // Confirm deletion for existing tickets
  if (ticket.ticket_type_id) {
    if (!confirm(`Are you sure you want to remove "${ticketName}"? This action cannot be undone.`)) {
      return
    }
  }
  
  tickets.value.splice(index, 1)
  
  toast.add({
    severity: 'success',
    summary: 'Ticket Removed',
    detail: `"${ticketName}" has been removed successfully.`,
    life: 3000
  })
  
  // Auto-save after removal
  handleSaveCurrentTab()
}

// Enhanced save current tab data for tab switching with event validation
const handleSaveCurrentTab = (event) => {
  const tabsStore = useEventTabsStore()
  
  // Validate event context if provided
  if (event?.detail?.eventId && event.detail.eventId !== currentEventId.value) {
    return
  }
  
  // Only save if we have a valid event ID
  if (!currentEventId.value) {
    return
  }
  
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
}

// Save Draft - for new tickets or adding more tickets
const saveDraft = async () => {
  await saveTicketsInternal('draft')
}

// Update Tickets - for editing existing tickets
const updateTickets = async () => {
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
    
    // Validate name - must be non-empty string
    if (!name || name.length === 0) {
      errors.push('name')
    }
    
    // Validate description - must be non-empty string
    if (!description || description.length === 0) {
      errors.push('description')
    }
    
    // Validate price - must be valid number >= 0
    if (isNaN(price) || price < 0) {
      errors.push('price')
    }
    
    // Validate quantity - must be valid integer >= 1
    if (isNaN(quantity) || quantity < 1) {
      errors.push('quantity')
    }
    
    // Mark ticket for validation display if errors exist
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

    // Show only one toast notification
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Please complete all required fields for all tickets before saving.',
      life: 5000
    })

    // Force re-render of validation states
    tickets.value = [...tickets.value.map((ticket, index) => ({
      ...ticket,
      isValidating: invalidTickets.some(invalid => invalid.ticketNumber === index + 1)
    }))]

    return
  }

  loading.value = true

  try {
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
    } catch (error) {
      existingTickets = []
    }

    // Ensure existingTickets is always an array
    if (!Array.isArray(existingTickets)) {
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


      // Enhanced validation
      const errors = []
      if (!name) errors.push(`Ticket ${ticketNumber}: Name is required`)
      if (!description) errors.push(`Ticket ${ticketNumber}: Description is required`)
      if (isNaN(price) || price < 0) errors.push(`Ticket ${ticketNumber}: Price must be 0 or greater`)
      if (isNaN(quantity) || quantity < 1) errors.push(`Ticket ${ticketNumber}: Quantity must be at least 1`)

      if (errors.length > 0) {
        throw new Error(errors.join('\n'))
      }

      // Check if this ticket exists in API (by ID first, then by name)
      const existingTicket = existingTickets.find(et => et.id === ticket.ticket_type_id)
      
      const ticketData = {
        name: name,
        price: parseFloat(price),
        total: quantity,
        tag: description,
        sort_order: index + 1,
        is_active: 1
      }

      if (existingTicket) {
        // UPDATE existing ticket using PUT method - only match by ID to avoid name conflicts
        const updatePromise = updateTicketType(currentEventId.value, existingTicket.id, ticketData)
          .then(() => {
            ticketUpdates.push(`Updated: ${name}`)
            // Update local ticket with the API ID
            ticket.ticket_type_id = existingTicket.id
          })
          .catch((error) => {
            ticketUpdates.push(`Failed to update: ${name}`)
            throw error
          })
        
        updatePromises.push(updatePromise)
      } else {
        // CREATE new ticket using POST method only if it doesn't have a ticket_type_id
        if (!ticket.ticket_type_id) {
          const createPromise = createTicketTypes(currentEventId.value, [ticketData])
            .then((response) => {
              ticketUpdates.push(`Created: ${name}`)
              // Update local ticket with the new API ID if available
              if (response?.data?.[0]?.id) {
                ticket.ticket_type_id = response.data[0].id
              }
            })
            .catch((error) => {
              ticketUpdates.push(`Failed to create: ${name}`)
              throw error
            })
          
          updatePromises.push(createPromise)
        }
      }
    }

    // Wait for all operations to complete
    await Promise.all(updatePromises)

      // Update stores with new ticket data
      
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

      // Show detailed success message with counts
      const updateCount = ticketUpdates.filter(update => update.includes('Updated:')).length
      const createCount = ticketUpdates.filter(update => update.includes('Created:')).length
      
      let summaryMessage = 'Tickets Saved Successfully! 🎫'
      let detailMessage = ''
      
      if (updateCount > 0 && createCount > 0) {
        summaryMessage = 'Tickets have changed and created more! 🎫'
        detailMessage = `Successfully updated ${updateCount} existing ticket(s) and created ${createCount} new ticket(s). Your event now has ${tickets.value.length} total tickets.`
      } else if (updateCount > 0) {
        summaryMessage = 'Success for change ticket! 🎫'
        detailMessage = `Successfully updated ${updateCount} existing ticket(s)`
      } else if (createCount > 0) {
        summaryMessage = `Created ${createCount} ticket${createCount > 1 ? 's' : ''}! 🎫`
        detailMessage = `Successfully created ${createCount} new ticket(s)`
      } else {
        detailMessage = 'All tickets processed successfully'
      }
      
      toast.add({
        severity: 'success',
        summary: summaryMessage,
        detail: detailMessage,
        life: 5000
      })
      
      // Mark ticket tab as completed in parent
      const eventCreationState = inject('eventCreationState')
      if (eventCreationState?.markTabCompleted) {
        eventCreationState.markTabCompleted(2)
      }

    // Reload tickets to get updated data with fresh IDs
    setTimeout(async () => {
      await loadExistingTickets()
    }, 1000) // Small delay to ensure server has processed the changes

  } catch (error) {
    
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
    return
  }

  // Validate that we're loading tickets for the correct event
  const eventStore = useEventStore()
  if (eventStore.currentEvent && eventStore.currentEvent.id !== currentEventId.value) {
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
        
        // FIXED: Set hasExistingTickets to true since we loaded tickets from API
        hasExistingTickets.value = true
        isEditMode.value = true
        
        console.log('📝 Loaded tickets for event:', {
          eventId: currentEventId.value,
          ticketCount: tickets.value.length,
          isEditMode: isEditMode.value,
          hasExistingTickets: hasExistingTickets.value,
          allTicketsHaveIds: tickets.value.every(t => t.ticket_type_id)
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

// Watch tickets array for changes
watch(tickets, (newTickets) => {
  if (currentEventId.value) {
    console.log('🎫 Tickets changed, saving to tab store:', newTickets.length)
    const tabsStore = useEventTabsStore()
    
    // Save current ticket data immediately
    const tabData = {
      ticketTypes: newTickets,
      lastSaved: new Date().toISOString(),
      hasTickets: newTickets.length > 0,
      eventId: currentEventId.value,
      isComplete: newTickets.length > 0 && newTickets.every(t =>
        (t.name && t.name.trim()) &&
        (t.description && t.description.trim()) &&
        (t.price !== null && t.price !== undefined && t.price >= 0) &&
        (t.quantity !== null && t.quantity !== undefined && t.quantity > 0)
      ),
      hasUnsavedChanges: true
    }
    
    tabsStore.saveTabData(2, tabData)
    tabsStore.markTabModified(2)
  }
}, { deep: true })

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
    // Enhanced edit mode detection - if event has an ID, it's in edit mode
    isEditMode.value = !!eventStore.currentEvent.id
    
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
        
        return restoredTicket
      })
      
      // FIXED: Properly set hasExistingTickets based on saved tickets with ticket_type_id
      const savedTicketsCount = tickets.value.filter(t => t.ticket_type_id).length
      hasExistingTickets.value = savedTicketsCount > 0
      ticketsRestored = true
      tabsStore.markTabComplete(2)
      
      console.log('🎫 Restored tickets from tab store:', {
        totalTickets: tickets.value.length,
        savedTickets: savedTicketsCount,
        hasExistingTickets: hasExistingTickets.value,
        ticketDetails: tickets.value.map(t => ({
          name: t.name,
          hasId: !!t.ticket_type_id,
          id: t.ticket_type_id
        }))
      })
    }
    // Priority 2: Event store (loaded from API)
    else if (eventStore.currentEvent.ticket_types?.length > 0) {
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
        
        return restoredTicket
      })
      
      // FIXED: All tickets from event store have ticket_type_id, so they are existing tickets
      hasExistingTickets.value = true
      ticketsRestored = true
      
      console.log('🎫 Restored tickets from event store:', {
        totalTickets: tickets.value.length,
        allHaveIds: tickets.value.every(t => t.ticket_type_id),
        hasExistingTickets: hasExistingTickets.value
      })
      
      // Save to tab persistence for future use
      handleSaveCurrentTab()
      tabsStore.markTabComplete(2)
    }
    
    // Priority 3: Load fresh from API if nothing in stores
    if (!ticketsRestored) {
      await loadExistingTickets()
    }
    
    // Auto-save current state for tab switching
    if (tickets.value.length > 0) {
      handleSaveCurrentTab()
    }
    
  } else {
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
      loadExistingTickets()
    }
  })
  
  // Listen for edit mode changes from main page
  window.addEventListener('editModeChanged', (event) => {
    if (event.detail?.eventId === currentEventId.value) {
      isEditMode.value = event.detail.isEditMode
      if (event.detail.eventData) {
        eventData.value = event.detail.eventData
      }
    }
  })
  
  // Add event listener for event switching to clear data
  window.addEventListener('clearTicketData', (event) => {
    if (event.detail?.eventId !== currentEventId.value) {
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
  // Note: loadTicketData and clearTicketData use anonymous functions, so they can't be removed individually
  // This is acceptable as the component is being destroyed anyway
})
</script>

<style scoped>
/* FIXED: Enhanced button styles for different workflow phases */
.create-first-ticket-btn {
  @apply bg-gradient-to-r from-purple-600 to-indigo-600 text-white;
  @apply hover:from-purple-700 hover:to-indigo-700;
  @apply px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl;
  @apply transition-all duration-300 ease-in-out border-0;
  @apply text-lg;
}

.create-first-ticket-btn:hover {
  transform: translateY(-2px);
}

.create-first-ticket-btn:disabled {
  @apply bg-gray-300 text-gray-500 cursor-not-allowed;
  transform: none;
}

.add-ticket-btn {
  @apply bg-gradient-to-r from-purple-600 to-indigo-600 text-white;
  @apply hover:from-purple-700 hover:to-indigo-700;
  @apply px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl;
  @apply transition-all duration-300 ease-in-out border-0;
}

.add-ticket-btn:hover {
  transform: translateY(-2px);
}

.add-ticket-btn:disabled {
  @apply bg-gray-300 text-gray-500 cursor-not-allowed;
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

.edit-ticket-btn {
  @apply transition-all duration-200 ease-in-out;
  @apply hover:scale-110;
}

.edit-ticket-btn:hover {
  transform: scale(1.1) translateY(-1px);
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

/* Enhanced visual feedback for workflow phases */
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
</style>
