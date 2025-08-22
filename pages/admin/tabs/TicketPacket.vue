<template>
  <div class="">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-lg font-semibold">Ticket Packages</h2>
        <p class="text-gray-400">Create and manage different ticket types</p>
      </div>
      <div v-if="currentEventId" class="text-right">
        <p class="px-3 py-1 rounded-full text-xs font-medium text-green-500">Basic Info Saved</p>
        <p class="text-xs text-gray-500">{{ currentEventName }}</p>
        <p v-if="shouldShowEditMode" class="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-500">Click Icon for update and click Update before save draft</p>
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

    <!-- Ticket Display Based on Workflow State -->
    <div v-if="tickets.length > 0" class="space-y-4 mb-6">
      <TransitionGroup name="ticket-list" tag="div" class="space-y-4">
        <div
          v-for="(ticket, index) in tickets"
          :key="ticket.id"
          class="relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <!-- Edit Icon Only for Saved Tickets (after draft) -->
          <div v-if="ticket.ticket_type_id && hasExistingTickets" class="absolute top-4 right-4 z-10 flex gap-2">
            <Button
              icon="pi pi-pencil"
              text
              rounded
              size="small"
              class="edit-ticket-btn text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              @click="editTicket(ticket.ticket_type_id, index)"
              title="Edit this saved ticket"
            />
            <Button
              icon="pi pi-trash"
              text
              rounded
              size="small"
              class="delete-ticket-btn text-red-600 hover:text-red-800 hover:bg-red-50"
              @click="deleteTicket(ticket.ticket_type_id, index)"
              title="Delete this ticket"
            />
          </div>
          
          <!-- Ticket Form Component -->
          <div class="p-4">
            <TicketForm
              v-model="tickets[index]"
              :ticket-index="index"
              :readonly="ticket.ticket_type_id && hasExistingTickets && !ticket.isEditing"
              :is-editing="ticket.isEditing"
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

    <!-- Action Buttons Based on Workflow State (Agenda Pattern) -->
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
      
      <!-- PHASE 2: Save Draft (New tickets exist but not saved) -->
      <template v-else-if="!hasExistingTickets">
        <Button
          @click="addTicket"
          class="add-ticket-btn"
          :disabled="!currentEventId"
        >
          <Icon name="heroicons:plus" class="mr-2" />
          Add Another Ticket
        </Button>
        
        <Button
          @click="saveDraft"
          class="save-draft-btn"
          :disabled="!currentEventId || loading || !isValidTicketData"
          :loading="loading"
        >
          <Icon name="heroicons:document-plus" class="mr-2" />
          {{ loading ? 'Saving...' : 'Save Draft' }}
        </Button>
      </template>
      
      <!-- PHASE 3: After Draft Saved - Show Add + Save Changes (like Agenda) -->
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
          v-if="hasUnsavedChanges"
          @click="saveChanges"
          class="save-changes-btn"
          :disabled="!currentEventId || loading"
          :loading="loading"
        >
          <Icon name="heroicons:arrow-path" class="mr-2" />
          {{ loading ? 'Saving...' : 'Update' }}
        </Button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, inject } from "vue"
import Button from "primevue/button"
import TicketForm from '~/components/common/TicketForm.vue'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import { createTicketTypes, updateTicketType, getEventDetails, getEventTicketTypes, getTicketTypeDetails } from '@/composables/api'
import { useToast } from "primevue/usetoast"
import { useEventStore } from '~/composables/useEventStore'
import { useEventTabsStore } from '~/composables/useEventTabs'
import { useTabEventIsolation } from '~/composables/useEventIsolation'

const loading = ref(false)
const toast = useToast()
const hasExistingTickets = ref(false)

// ENHANCED: Event isolation system
const {
  currentEventId,
  isDataLoaded,
  isDataValidForCurrentEvent,
  clearComponentData,
  loadDataForCurrentEvent,
  validateEventContext
} = useTabEventIsolation(2, 'TicketPacket') // Tab index 2 for tickets

// Event data - now managed by isolation system
const currentEventName = ref('')
const tickets = ref([])
const isEditMode = ref(false)
const eventData = ref(null)

// Track if there are new tickets added
const hasNewTickets = computed(() => {
  return tickets.value.some(ticket => !ticket.ticket_type_id)
})

// Track if there are unsaved changes (like Agenda pattern)
const hasUnsavedChanges = ref(false)

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

// Edit ticket functionality (Agenda Pattern) - Load from server
const editTicket = async (ticketTypeId, index) => {
  if (!ticketTypeId || !currentEventId.value) return
  
  loading.value = true
  try {
    
    // FIXED: Use getTicketTypeDetails to get individual ticket data (like Agenda pattern)
    const response = await getTicketTypeDetails(currentEventId.value, ticketTypeId)
    
    if (response?.success && response?.data) {
      const serverTicket = response.data
      
      // FIXED: Load fresh data from server with correct field mapping
      tickets.value[index] = {
        id: tickets.value[index].id, // Keep local ID
        ticket_type_id: serverTicket.id,
        name: serverTicket.name || '',
        description: serverTicket.tag || '', // API uses 'tag' field
        tag: serverTicket.tag || '',
        price: parseFloat(serverTicket.price) || 0,
        quantity: parseInt(serverTicket.inventory?.total || serverTicket.total) || 1, // FIXED: Use inventory.total
        sort_order: serverTicket.sort_order || (index + 1),
        is_active: serverTicket.is_active === undefined ? true : Boolean(serverTicket.is_active),
        isEditing: true, // Mark as being edited
        isValidating: false,
        eventId: currentEventId.value
      }
      
      toast.add({
        severity: 'info',
        summary: 'Edit Mode',
        detail: `Now editing "${serverTicket.name}". Make your changes and click "Save Changes".`,
        life: 4000
      })
      
      // Scroll to the ticket form
      const ticketElement = document.querySelector(`[data-ticket-index="${index}"]`)
      if (ticketElement) {
        ticketElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      
      // Mark as having unsaved changes
      hasUnsavedChanges.value = true
      
    } else {
      throw new Error('Invalid response structure from server')
    }
    
  } catch (error) {
    console.error('❌ Failed to load ticket for editing:', error)
    
    // Enhanced error handling
    let errorMessage = 'Could not load ticket data for editing. Please try again.'
    if (error.status === 404) {
      errorMessage = 'Ticket not found on server. It may have been deleted.'
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to edit this ticket.'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    toast.add({
      severity: 'error',
      summary: 'Edit Failed',
      detail: errorMessage,
      life: 4000
    })
  } finally {
    loading.value = false
  }
}

// Delete ticket functionality (Agenda Pattern)
const deleteTicket = async (ticketTypeId, index) => {
  if (!ticketTypeId || !currentEventId.value) return
  
  const ticket = tickets.value[index]
  const ticketName = ticket?.name || `Ticket ${index + 1}`
  
  if (!confirm(`Are you sure you want to delete "${ticketName}"? This action cannot be undone.`)) {
    return
  }
  
  loading.value = true
  try {
    console.log('🗑️ Deleting ticket:', {
      eventId: currentEventId.value,
      ticketTypeId: ticketTypeId,
      method: 'DELETE'
    })
    
    // DELETE request to remove ticket from server
    const { deleteTicketType } = await import('@/composables/api')
    const response = await deleteTicketType(currentEventId.value, ticketTypeId)
    
    // Check if deletion was successful
    const isSuccess = response && (
      response.success === true ||
      response.status === 'success' ||
      response.message === 'Ticket deleted successfully' ||
      (!response.error && response.status !== 'error')
    )
    
    if (isSuccess) {
      // Remove from local array
      tickets.value.splice(index, 1)
      
      toast.add({
        severity: 'success',
        summary: 'Ticket Deleted! 🗑️',
        detail: `"${ticketName}" has been deleted successfully.`,
        life: 3000
      })
      
      // Reload tickets to get updated list
      await loadExistingTickets()
      
      // Update tab store
      handleSaveCurrentTab()
      
    } else {
      throw new Error(response?.message || response?.error || 'Failed to delete ticket')
    }
    
  } catch (error) {
    console.error('❌ Failed to delete ticket:', error)
    toast.add({
      severity: 'error',
      summary: 'Delete Failed',
      detail: error.message || 'Could not delete ticket. Please try again.',
      life: 4000
    })
  } finally {
    loading.value = false
  }
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

// Save Draft - for new tickets (POST method like Agenda)
const saveDraft = async () => {
  await saveTicketsInternal('create')
}

// Save Changes - for editing existing tickets (PUT method like Agenda)
const saveChanges = async () => {
  await saveTicketsInternal('update')
}

// Legacy method for backward compatibility
const updateTickets = async () => {
  await saveChanges()
}

// Internal save method - RESTRUCTURED TO MATCH AGENDA PATTERN
const saveTicketsInternal = async (mode = 'create') => {
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

    const ticketUpdates = []
    const promises = []
    
    if (mode === 'create') {
      // CREATE MODE: Save all new tickets using POST (like Agenda createAgendaItems)
      const newTickets = tickets.value.filter(ticket => !ticket.ticket_type_id)
      
      if (newTickets.length > 0) {
        const ticketsData = newTickets.map((ticket, index) => {
          const name = String(ticket.name || '').trim()
          const description = String(ticket.description || ticket.tag || '').trim()
          const price = parseFloat(ticket.price || 0)
          const quantity = parseInt(ticket.quantity || 0)

          // Enhanced validation
          const errors = []
          if (!name) errors.push(`Ticket ${index + 1}: Name is required`)
          if (!description) errors.push(`Ticket ${index + 1}: Description is required`)
          if (isNaN(price) || price < 0) errors.push(`Ticket ${index + 1}: Price must be 0 or greater`)
          if (isNaN(quantity) || quantity < 1) errors.push(`Ticket ${index + 1}: Quantity must be at least 1`)

          if (errors.length > 0) {
            throw new Error(errors.join('\n'))
          }

          return {
            name: name,
            price: parseFloat(price),
            total: quantity,
            tag: description,
            sort_order: tickets.value.indexOf(ticket) + 1,
            is_active: 1
          }
        })
        
        const createPromise = createTicketTypes(currentEventId.value, ticketsData)
          .then((response) => {

            
            // FIXED: Handle new API response structure with ticket_types array
            let createdTickets = []
            if (response?.data?.ticket_types && Array.isArray(response.data.ticket_types)) {
              createdTickets = response.data.ticket_types
            } else if (response?.data && Array.isArray(response.data)) {
              createdTickets = response.data
            }
            
            // Update local tickets with API IDs
            if (createdTickets.length > 0) {
              createdTickets.forEach((createdTicket, index) => {
                if (newTickets[index] && createdTicket.id) {
                  newTickets[index].ticket_type_id = createdTicket.id
                  ticketUpdates.push(`Created: ${createdTicket.name}`)
                }
              })
            }
            
            // Mark as having existing tickets after successful creation
            hasExistingTickets.value = true
          })
          .catch((error) => {
            console.error('❌ Failed to create tickets:', error)
            throw error
          })
        
        promises.push(createPromise)
      }
      
    } else if (mode === 'update') {
      // UPDATE MODE: Update individual tickets using PUT (like Agenda updateAgendaItem)
      const ticketsToUpdate = tickets.value.filter(ticket => ticket.ticket_type_id && ticket.isEditing)
      
      for (const ticket of ticketsToUpdate) {
        const name = String(ticket.name || '').trim()
        const description = String(ticket.description || ticket.tag || '').trim()
        const price = parseFloat(ticket.price || 0)
        const quantity = parseInt(ticket.quantity || 0)

        // Enhanced validation
        const errors = []
        if (!name) errors.push(`${ticket.name || 'Ticket'}: Name is required`)
        if (!description) errors.push(`${ticket.name || 'Ticket'}: Description is required`)
        if (isNaN(price) || price < 0) errors.push(`${ticket.name || 'Ticket'}: Price must be 0 or greater`)
        if (isNaN(quantity) || quantity < 1) errors.push(`${ticket.name || 'Ticket'}: Quantity must be at least 1`)

        if (errors.length > 0) {
          throw new Error(errors.join('\n'))
        }

        const ticketData = {
          name: name,
          price: parseFloat(price),
          total: quantity,
          tag: description,
          sort_order: tickets.value.indexOf(ticket) + 1,
          is_active: 1
        }

        const updatePromise = updateTicketType(currentEventId.value, ticket.ticket_type_id, ticketData)
          .then(() => {
            ticketUpdates.push(`Updated: ${name}`)
            // Clear editing state
            ticket.isEditing = false
          })
          .catch((error) => {
            ticketUpdates.push(`Failed to update: ${name}`)
            throw error
          })
        
        promises.push(updatePromise)
      }
    }

    // Wait for all operations to complete
    await Promise.all(promises)

    // FIXED: Clean success handling for post-draft workflow
    if (mode === 'create') {
      // After successful creation, mark as having existing tickets and reload clean data
      hasExistingTickets.value = true
      
      // Clear unsaved changes flag
      hasUnsavedChanges.value = false
      
      // Reload tickets from server to get clean data with IDs
      await loadExistingTickets()
      
      const createCount = ticketUpdates.filter(update => update.includes('Created:')).length
      
      toast.add({
        severity: 'success',
        summary: `Created ${createCount} ticket${createCount > 1 ? 's' : ''}! 🎫`,
        detail: `Successfully created ${createCount} new ticket(s). You can now edit individual tickets or add more.`,
        life: 5000
      })
      
    } else if (mode === 'update') {
      // After successful update, clear editing states and unsaved changes
      tickets.value.forEach(ticket => {
        ticket.isEditing = false
      })
      hasUnsavedChanges.value = false
      
      const updateCount = ticketUpdates.filter(update => update.includes('Updated:')).length
      
      toast.add({
        severity: 'success',
        summary: 'Tickets Updated! 🎫',
        detail: `Successfully updated ${updateCount} ticket(s).`,
        life: 4000
      })
    }

    // Update stores with new ticket data
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
      validTickets: tickets.value.length > 0,
      hasExistingTickets: hasExistingTickets.value
    }
    tabsStore.markTabComplete(2)
    tabsStore.markTabSaved(2)
    tabsStore.saveTabData(2, tabData)
    
    // Mark ticket tab as completed in parent
    const eventCreationState = inject('eventCreationState')
    if (eventCreationState?.markTabCompleted) {
      eventCreationState.markTabCompleted(2)
    }

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

// ENHANCED: Load existing tickets with event isolation
const loadExistingTickets = async () => {
  const eventId = currentEventId.value
  if (!eventId) {
    console.warn('⚠️ No current event ID for loading tickets')
    return
  }

  // Validate event context
  if (!validateEventContext(eventId)) {
    console.warn('⚠️ Invalid event context for loading tickets')
    return
  }

  loading.value = true
  try {

    const response = await getEventTicketTypes(eventId)
    
    // Handle new API response structure with ticket_types array
    let existingTickets = []
    if (response && response.success && response.data && response.data.ticket_types && Array.isArray(response.data.ticket_types)) {
      existingTickets = response.data.ticket_types
    } else if (response && response.data && Array.isArray(response.data)) {
      // Fallback for old API structure
      existingTickets = response.data
    }
    
    if (existingTickets.length > 0) {      
      // Clear current tickets and load existing ones with event validation
      tickets.value = existingTickets.map((ticket, index) => {
        const loadedTicket = {
          id: ticket.id || Date.now() + Math.random() + index,
          ticket_type_id: ticket.id, // Store original ID for updates
          name: ticket.name || '',
          description: ticket.description || ticket.tag || '',
          tag: ticket.tag || ticket.description || '',
          price: parseFloat(ticket.price) || 0,
          // Handle inventory.total field from new API structure
          quantity: parseInt(ticket.inventory?.total || ticket.total || ticket.quantity) || 1,
          sort_order: ticket.sort_order || (index + 1),
          is_active: ticket.is_active === undefined ? true : Boolean(ticket.is_active),
          isValidating: false,
          eventId: eventId // Ensure event ID is set
        }
        
        return loadedTicket
      })
      
      // Set hasExistingTickets to true since we loaded tickets from API
      hasExistingTickets.value = true
      isEditMode.value = true
      
      
      toast.add({
        severity: 'success',
        summary: 'Tickets Loaded',
        detail: `Loaded ${existingTickets.length} existing ticket(s) for editing`,
        life: 3000
      })
    } else {
      hasExistingTickets.value = false
      tickets.value = []
      isEditMode.value = false
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Load Failed',
      detail: error.message || 'Could not load existing tickets. You can create new ones.',
      life: 4000
    })
    tickets.value = []
    hasExistingTickets.value = false
    isEditMode.value = false
  } finally {
    loading.value = false
  }
}

// Watch tickets array for changes
watch(tickets, (newTickets) => {
  if (currentEventId.value) {
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

// ENHANCED: Initialization with event isolation
onMounted(async () => {
  
  // Initialize data loading function
  const loadTicketData = async (eventId) => {
    const eventStore = useEventStore()
    const tabsStore = useEventTabsStore()
    
    // Validate event context
    if (!validateEventContext(eventId)) {

      return
    }
    
    // Get current event data
    const currentEvent = eventStore.currentEvent
    if (!currentEvent || currentEvent.id !== eventId) {
      return
    }
    
    // Set component data
    currentEventName.value = currentEvent.name || "Unnamed Event"
    eventData.value = currentEvent
    isEditMode.value = !!currentEvent.id
    
    
    // Check basic info completion
    const basicInfoData = tabsStore.getTabData(0)
    const hasBasicInfo = basicInfoData.isComplete || (
      currentEvent.name &&
      currentEvent.category_id &&
      currentEvent.start_date &&
      currentEvent.end_date &&
      currentEvent.location
    )
    
    if (!hasBasicInfo) {
      toast.add({
        severity: 'warn',
        summary: 'Basic Info Required',
        detail: 'Please complete and save Basic Info first.',
        life: 3000
      })
      return
    }
    
    // Load ticket data with priority system
    await loadTicketsWithPriority(eventId, currentEvent, tabsStore)
  }
  
  // Load data if current event exists
  if (currentEventId.value) {
    await loadDataForCurrentEvent(loadTicketData)
  }

  // Add event listeners for ticket operations
  window.addEventListener('saveTickets', saveDraft)
  window.addEventListener('saveCurrentTab', handleSaveCurrentTab)
  
  // Enhanced event listener for ticket data loading
  window.addEventListener('loadTicketData', (event) => {
    const { eventId } = event.detail || {}
    if (eventId && validateEventContext(eventId)) {
      loadDataForCurrentEvent(loadTicketData)
    }
  })
  
  // Listen for edit mode changes
  window.addEventListener('editModeChanged', (event) => {
    const { eventId, isEditMode: newEditMode, eventData: newEventData } = event.detail || {}
    if (eventId && validateEventContext(eventId)) {
      isEditMode.value = newEditMode
      if (newEventData) {
        eventData.value = newEventData
      }
    }
  })
})

// ENHANCED: Ticket loading with priority system and event isolation
const loadTicketsWithPriority = async (eventId, currentEvent, tabsStore) => {
  
  let ticketsRestored = false
  
  // Priority 1: Tab persistence (user's current work) - but only for same event
  const ticketTabData = tabsStore.getTabData(2)
  if (ticketTabData.ticketTypes &&
      ticketTabData.ticketTypes.length > 0 &&
      ticketTabData.eventId === eventId) {
    
    tickets.value = ticketTabData.ticketTypes.map((ticket, index) => ({
      id: ticket.id || Date.now() + Math.random() + index,
      ticket_type_id: ticket.ticket_type_id || ticket.id,
      name: ticket.name || '',
      description: ticket.description || ticket.tag || '',
      tag: ticket.tag || ticket.description || '',
      price: parseFloat(ticket.price) || 0,
      quantity: parseInt(ticket.quantity || ticket.total) || 1,
      sort_order: ticket.sort_order || (index + 1),
      is_active: ticket.is_active === undefined ? true : Boolean(ticket.is_active),
      isValidating: false,
      eventId: eventId
    }))
    
    const savedTicketsCount = tickets.value.filter(t => t.ticket_type_id).length
    hasExistingTickets.value = savedTicketsCount > 0
    ticketsRestored = true
    tabsStore.markTabComplete(2)
    
  }
  // Priority 2: Event store (loaded from API)
  else if (currentEvent.ticket_types?.length > 0) {
    tickets.value = currentEvent.ticket_types.map((ticket, index) => ({
      id: ticket.id || Date.now() + Math.random() + index,
      ticket_type_id: ticket.id,
      name: ticket.name || '',
      description: ticket.description || ticket.tag || '',
      tag: ticket.tag || ticket.description || '',
      price: parseFloat(ticket.price) || 0,
      quantity: parseInt(ticket.inventory?.total || ticket.total || ticket.quantity) || 1,
      sort_order: ticket.sort_order || (index + 1),
      is_active: ticket.is_active === undefined ? true : Boolean(ticket.is_active),
      isValidating: false,
      eventId: eventId
    }))
    
    hasExistingTickets.value = true
    ticketsRestored = true
  
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
}

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

.save-changes-btn {
  @apply bg-gradient-to-r from-green-600 to-emerald-600 text-white;
  @apply hover:from-green-700 hover:to-emerald-700;
  @apply px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl;
  @apply transition-all duration-300 ease-in-out border-0;
}

.save-changes-btn:hover {
  transform: translateY(-2px);
}

.save-changes-btn:disabled {
  @apply bg-gray-400 cursor-not-allowed;
  transform: none;
}

.delete-ticket-btn {
  @apply transition-all duration-200 ease-in-out;
  @apply hover:scale-110;
}

.delete-ticket-btn:hover {
  transform: scale(1.1) translateY(-1px);
}
</style>
