<template>
  <div class="">
    <!-- Main Layout: Left Form + Right Listing -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Left Side: Ticket Form -->
      <div class="space-y-6">
         <!-- Header -->
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-1">Ticket Packages</h2>
      <p class="text-gray-500">Create and manage different ticket types</p>
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
    

        <!-- Ticket Icon Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:ticket" class="w-5 h-5 text-white" />
            </div>
            <span class="text-lg font-medium text-gray-900">
              {{ currentEditingTicket ? 'Edit Ticket' : 'Create New Ticket' }}
            </span>
          </div>
          <span v-if="currentEditingTicket" class="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            Editing
          </span>
        </div>

        <!-- Current Ticket Form -->
        <div class="">
          <div class="space-y-4">
            <!-- Ticket Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Ticket Name
              </label>
              <InputText
                v-model="formData.name"
                class="w-full p-3 mt-1 bg-gray-100 border-none rounded-2xl"
                placeholder="ticket name"
              />
            </div>

            <!-- Ticket Price -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Ticket Price
              </label>
              <div class="relative">
                <InputNumber
                  v-model="formData.price"
                  mode="decimal"
                  :minFractionDigits="0"
                  :maxFractionDigits="2"
                  :min="0"
                  class="w-full "
                  inputClass="pl-8 bg-gray-100 "
                  placeholder="Set price to $0 or 0 for free tickets"
                />
                <span class="text-xs text-gray-400">Set price to 0$ or 0 for free ticket </span>
              </div>
            </div>

            <!-- Quantity -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <InputText
                v-model="formData.quantity"
                class="w-full p-3 mt-1 bg-gray-100 border-none rounded-2xl"
                placeholder="ticket quantity"
              />
            </div>

            <!-- Ticket Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Ticket Description
              </label>
              <Textarea
                v-model="formData.description"
                class="w-full p-3 mt-1 bg-gray-100 border-none rounded-2xl"
                placeholder="Brief description of this ticket"
                rows="3"
              />
            </div>

          </div>
          
        </div>

        <!-- Add Ticket Package Button -->
    <div class="mt-8 flex justify-end gap-4">
      <Button
        v-if="currentEditingTicket"
        @click="cancelForm"
        class="px-6 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 font-medium"
      >
        Cancel
      </Button>
      <Button
        @click="addTicketPackage"
        class="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3"
        :disabled="!currentEventId || loading"
        :loading="loading"
      >
        <Icon name="heroicons:plus-circle" class="w-6 h-6" />
        <span>{{ currentEditingTicket ? 'Update Ticket' : 'Add Ticket Package' }}</span>
      </Button>
    </div>
      </div>

      <!-- Right Side: Ticket Listing -->
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Ticket Listing</h3>
          <span class="text-sm text-gray-500">{{ tickets.length }} ticket{{ tickets.length !== 1 ? 's' : '' }}</span>
        </div>
        
        <!-- Ticket Cards -->
        <div v-if="tickets.length > 0" class="space-y-4">
          <div
            v-for="(ticket, index) in tickets"
            :key="ticket.id || index"
            class="bg-white shadow-md rounded-2xl p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-semibold text-gray-900">{{ ticket.name || 'Unnamed Ticket' }}</h4>
                  <div class="flex items-center space-x-2">
                    <!-- Edit Button -->
                    <Button
                      icon="pi pi-pencil"
                      text
                      rounded
                      size="small"
                      class="text-gray-600 hover:text-blue-600"
                      @click="editTicket(ticket.ticket_type_id, index)"
                      title="Edit ticket"
                    />
                    <!-- Delete Button -->
                    <Button
                      icon="pi pi-trash"
                      text
                      rounded
                      size="small"
                      class="text-gray-600 hover:text-red-600"
                      @click="deleteTicket(ticket.ticket_type_id, index)"
                      title="Delete ticket"
                    />
                    
                    <!-- Privacy Toggle -->
                    <div class="flex items-center">
                      <button
                        @click="toggleTicketPrivacy(ticket, index)"
                        :disabled="ticket.isUpdatingPrivacy"
                        :class="[
                          'flex items-center justify-center h-8 w-20 rounded-full cursor-pointer transition-all duration-300 text-white text-xs font-medium shadow-sm relative',
                          ticket.is_private 
                            ? 'bg-gray-500 hover:bg-gray-600' 
                            : 'bg-purple-500 hover:bg-purple-600',
                          ticket.isUpdatingPrivacy ? 'opacity-70 cursor-wait' : ''
                        ]"
                        :title="ticket.is_private ? 'Click to make Public' : 'Click to make Private'"
                      >
                        <span v-if="!ticket.isUpdatingPrivacy" class="flex items-center space-x-1">
                          <span>{{ ticket.is_private ? 'OFF' : 'ON' }}</span> |
                          <span>{{ ticket.is_private ? 'Private' : 'Public' }}</span>
                        </span>
                        <span v-else class="flex items-center space-x-1">
                          <Icon name="heroicons:arrow-path" class="w-3 h-3 animate-spin" />
                          <span class="text-xs">Updating...</span>
                        </span>
                      </button>
                    </div>                  </div>
                </div>
                
                <div class="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                  <span>Quantity | {{ ticket.quantity || 0 }}</span>
                </div>
                <div class="border border-gray-200 my-3"></div>
                <div class="inline-flex items-center justify-center px-4 py-1 rounded-full bg-purple-50 text-purple-700 font-semibold text-lg shadow-sm">
  {{ ticket.price == 0 ? 'FREE' : `$${ticket.price || 0}` }}
</div>
                <p class="text-sm text-gray-600 mt-2">{{ ticket.description || ticket.tag || 'No description' }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-else class="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Icon name="heroicons:ticket" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500 mb-2">No tickets created yet</p>
          <p class="text-sm text-gray-400 mb-4">Fill out the form on the left, then click "Add to Listing" or use the "Add Ticket Package" button below</p>
          <div class="flex items-center justify-center space-x-2 text-xs text-gray-400">
            <Icon name="heroicons:arrow-left" class="w-4 h-4" />
            <span>Form</span>
            <Icon name="heroicons:arrow-right" class="w-4 h-4" />
            <span>Save/Add</span>
            <Icon name="heroicons:arrow-right" class="w-4 h-4" />
            <span>Appears here</span>
          </div>
        </div>
      </div>
    </div>


  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, inject } from "vue"
import Button from "primevue/button"
import InputText from "primevue/inputtext"
import InputNumber from "primevue/inputnumber"
import Textarea from "primevue/textarea"
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

// Toast management system to prevent duplicates
const activeToasts = ref(new Set())
const showToast = (severity, summary, detail, life = 3000) => {
  const toastKey = `${severity}-${summary}`
  
  // Prevent duplicate toasts
  if (activeToasts.value.has(toastKey)) {
    return
  }
  
  activeToasts.value.add(toastKey)
  
  toast.add({
    severity,
    summary,
    detail,
    life
  })
  
  // Remove from active toasts after the toast expires
  setTimeout(() => {
    activeToasts.value.delete(toastKey)
  }, life + 100)
}

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

// New UI state variables
const showNewTicketForm = ref(false)
const currentEditingTicket = ref(null)
const formData = ref({
  name: '',
  price: 0,
  quantity: 1,
  description: '',
  is_private: 0
})

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

// Form validation
const isFormValid = computed(() => {
  const isValid = formData.value.name.trim() !== '' &&
         formData.value.description.trim() !== '' &&
         formData.value.price >= 0 &&
         formData.value.quantity > 0
  
  // Debug validation
  if (process.client) {
    console.log('Form validation:', {
      name: formData.value.name.trim(),
      description: formData.value.description.trim(),
      price: formData.value.price,
      quantity: formData.value.quantity,
      isValid
    })
  }
  
  return isValid
})

// Reset form data
const resetForm = () => {
  formData.value = {
    name: '',
    price: 0,
    quantity: 1,
    description: '',
    is_private: 0
  }
  currentEditingTicket.value = null
}

// Add ticket package - save current ticket if valid, then clear form for new ticket
const addTicketPackage = async () => {
  if (!currentEventId.value) {
    showToast('warn', 'Event Required', 'Please save basic info first')
    return
  }
  
  // If editing, save the update
  if (currentEditingTicket.value && isFormValid.value) {
    await saveTicket()
    return
  }
  
  // If form has valid data, save it first
  if (isFormValid.value) {
    await saveTicket()
  } else {
    // Just clear the form for new ticket
    resetForm()
  }
}

// Cancel form
const cancelForm = () => {
  resetForm()
}

// Save ticket
const saveTicket = async () => {
  if (!isFormValid.value || !currentEventId.value) return
  
  loading.value = true
  try {
    const ticketData = {
      name: formData.value.name.trim(),
      price: parseFloat(formData.value.price) || 0,
      quantity: parseInt(formData.value.quantity) || 1,
      description: formData.value.description.trim(),
      tag: formData.value.description.trim(),
      event_id: currentEventId.value,
      is_active: true,
      is_private: parseInt(formData.value.is_private) || 0,
      sort_order: tickets.value.length + 1
    }

    if (currentEditingTicket.value) {
      // Update existing ticket
      const response = await updateTicketType(currentEventId.value, currentEditingTicket.value.ticket_type_id, ticketData)
      
      if (response?.success) {
        // Update in local array
        const index = tickets.value.findIndex(t => t.ticket_type_id === currentEditingTicket.value.ticket_type_id)
        if (index !== -1) {
          tickets.value[index] = { ...tickets.value[index], ...ticketData, ...response.data }
        }
        
        // Ticket updated successfully - no toast needed
      }
    } else {
      // Create new ticket
      console.log('Creating new ticket with data:', ticketData)
      const response = await createTicketTypes(currentEventId.value, [ticketData])
      console.log('Create ticket response:', response)
      
      if (response?.success && response?.data?.length > 0) {
        const newTicket = {
          ...ticketData,
          ticket_type_id: response.data[0].id,
          id: response.data[0].id,
          name: ticketData.name,
          price: ticketData.price,
          quantity: ticketData.quantity,
          description: ticketData.description,
          tag: ticketData.tag,
          is_active: true,
          is_private: parseInt(ticketData.is_private) || 0
        }
        
        // Add to local array
        tickets.value.push(newTicket)
        console.log('Added ticket to local array. Total tickets:', tickets.value.length)
        
        // Ticket added successfully - no toast needed
      } else {
        console.error('Failed to create ticket - invalid response:', response)
        throw new Error('Failed to create ticket - invalid response from server')
      }
    }
    
    resetForm()
    
    // Update hasExistingTickets flag since we now have saved tickets
    hasExistingTickets.value = true
    isEditMode.value = true
    
  } catch (error) {
    console.error('Failed to save ticket:', error)
    showToast('error', 'Save Failed', 'Failed to save ticket. Please try again.')
  } finally {
    loading.value = false
  }
}

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
    showToast('error', 'Refresh Failed', 'Failed to refresh ticket data')
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
        is_active: ticket.is_active,
        is_private: parseInt(ticket.is_private) || 0
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

// Legacy method - redirect to new form approach
const addTicket = () => {
  addTicketPackage()
}

// Toggle ticket status instantly with server update
const toggleTicketStatus = async (ticket, index) => {
  if (!ticket.ticket_type_id || !currentEventId.value || ticket.isUpdating) {
    console.warn('⚠️ Toggle blocked:', { 
      hasTicketId: !!ticket.ticket_type_id, 
      hasEventId: !!currentEventId.value, 
      isUpdating: ticket.isUpdating 
    })
    return
  }
  
  // Set updating state
  ticket.isUpdating = true
  
  // Store original state for rollback
  const originalState = ticket.is_active
  
  // Optimistically update UI
  ticket.is_active = !ticket.is_active
  
  console.log(`🔄 Toggling ticket "${ticket.name}" from ${originalState} to ${ticket.is_active}`)
  
  try {
    // Prepare update data - ensure all required fields are included
    const updateData = {
      name: ticket.name || '',
      price: parseFloat(ticket.price) || 0,
      total: parseInt(ticket.quantity) || 1,
      tag: ticket.description || ticket.tag || '',
      sort_order: ticket.sort_order || (index + 1),
      is_active: ticket.is_active ? 1 : 0, // Convert boolean to integer for API
      is_private: parseInt(ticket.is_private) || 0
    }
    
    console.log('📤 Sending update data:', updateData)
    
    // Make API call to update ticket status
    const response = await updateTicketType(currentEventId.value, ticket.ticket_type_id, updateData)
    
    console.log('📥 API Response:', response)
    
    // Check for successful response (different API response formats)
    const isSuccess = response && (
      response.success === true || 
      response.status === 'success' ||
      (!response.error && response.status !== 'error')
    )
    
    if (isSuccess) {
      // Update successful - keep the new state
      const statusText = ticket.is_active ? 'published' : 'made private'
      console.log(`✅ Ticket "${ticket.name}" ${statusText}`)
      
      // Update tab store to persist the change
      handleSaveCurrentTab()
      
      // Show success feedback (optional)
      showToast('success', 'Status Updated', `Ticket ${statusText} successfully`, 2000)
      
    } else {
      // Update failed - rollback to original state
      ticket.is_active = originalState
      console.error('❌ API returned unsuccessful response:', response)
      throw new Error(response?.message || response?.error || 'Server returned unsuccessful response')
    }
    
  } catch (error) {
    console.error('❌ Failed to toggle ticket status:', error)
    
    // Rollback to original state
    ticket.is_active = originalState
    
    // Show error toast
    const actionText = originalState ? 'unpublish' : 'publish'
    showToast('error', 'Update Failed', `Could not ${actionText} ticket. ${error.message || 'Please try again.'}`, 4000)
    
  } finally {
    // Clear updating state
    ticket.isUpdating = false
  }
}

// Toggle ticket privacy status instantly with server update
const toggleTicketPrivacy = async (ticket, index) => {
  if (!ticket.ticket_type_id || !currentEventId.value || ticket.isUpdatingPrivacy) {
    console.warn('⚠️ Privacy toggle blocked:', { 
      hasTicketId: !!ticket.ticket_type_id, 
      hasEventId: !!currentEventId.value, 
      isUpdatingPrivacy: ticket.isUpdatingPrivacy 
    })
    return
  }
  
  // Set updating state
  ticket.isUpdatingPrivacy = true
  
  // Store original state for rollback
  const originalPrivacyState = ticket.is_private
  
  // Optimistically update UI
  ticket.is_private = ticket.is_private ? 0 : 1
  
  console.log(`🔄 Toggling ticket "${ticket.name}" privacy from ${originalPrivacyState} to ${ticket.is_private}`)
  
  try {
    // Prepare update data - ensure all required fields are included
    const updateData = {
      name: ticket.name || '',
      price: parseFloat(ticket.price) || 0,
      total: parseInt(ticket.quantity) || 1,
      tag: ticket.description || ticket.tag || '',
      sort_order: ticket.sort_order || (index + 1),
      is_active: ticket.is_active ? 1 : 0,
      is_private: ticket.is_private
    }
    
    console.log('📤 Sending privacy update data:', updateData)
    
    // Make API call to update ticket privacy status
    const response = await updateTicketType(currentEventId.value, ticket.ticket_type_id, updateData)
    
    console.log('📥 Privacy API Response:', response)
    
    // Check for successful response (different API response formats)
    const isSuccess = response && (
      response.success === true || 
      response.status === 'success' ||
      (!response.error && response.status !== 'error')
    )
    
    if (isSuccess) {
      // Update successful - keep the new state
      const privacyText = ticket.is_private ? 'made private' : 'made public'
      console.log(`✅ Ticket "${ticket.name}" ${privacyText}`)
      
      // Update tab store to persist the change
      handleSaveCurrentTab()
      
      // Show success feedback
      showToast('success', 'Privacy Updated', `Ticket ${privacyText} successfully`, 2000)
      
    } else {
      // Update failed - rollback to original state
      ticket.is_private = originalPrivacyState
      console.error('❌ Privacy API returned unsuccessful response:', response)
      throw new Error(response?.message || response?.error || 'Server returned unsuccessful response')
    }
    
  } catch (error) {
    console.error('❌ Failed to toggle ticket privacy:', error)
    
    // Rollback to original state
    ticket.is_private = originalPrivacyState
    
    // Show error toast
    const actionText = originalPrivacyState ? 'make public' : 'make private'
    showToast('error', 'Update Failed', `Could not ${actionText} ticket. ${error.message || 'Please try again.'}`, 4000)
    
  } finally {
    // Clear updating state
    ticket.isUpdatingPrivacy = false
  }
}

// Edit ticket functionality - Load into form
const editTicket = async (ticketTypeId, index) => {
  if (!ticketTypeId || !currentEventId.value) return
  
  const ticket = tickets.value[index]
  if (!ticket) return
  
  // Populate form with ticket data
  formData.value = {
    name: ticket.name || '',
    price: ticket.price || 0,
    quantity: ticket.quantity || 1,
    description: ticket.description || ticket.tag || '',
    is_private: parseInt(ticket.is_private) || 0
  }
  
  currentEditingTicket.value = ticket
  
  // Edit mode activated - no toast needed
}

// Delete ticket functionality (Agenda Pattern)
const deleteTicket = async (ticketTypeId, index) => {
  if (!ticketTypeId || !currentEventId.value) return
  
  const ticket = tickets.value[index]
  const ticketName = ticket?.name || 'Ticket ' + (index + 1)
  
  if (!confirm('Are you sure you want to delete "' + ticketName + '"? This action cannot be undone.')) {
    return
  }
  
  loading.value = true
  try {
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
      
      // Ticket deleted successfully - no toast needed
      
      // Reload tickets to get updated list
      await loadExistingTickets()
      
      // Update tab store
      handleSaveCurrentTab()
      
    } else {
      throw new Error(response?.message || response?.error || 'Failed to delete ticket')
    }
    
  } catch (error) {
    console.error('❌ Failed to delete ticket:', error)
    showToast('error', 'Delete Failed', error.message || 'Could not delete ticket. Please try again.', 4000)
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
  
  // Ticket removed successfully - no toast needed
  
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
    showToast('error', 'No Event', 'Please complete and save Basic Info first.')
    return
  }

  if (tickets.value.length === 0) {
    showToast('warn', 'No Tickets', 'Please add at least one ticket package.')
    return
  }

  // Show different confirmation for published events (only once)
  if (isEditMode.value && eventData.value?.is_published) {
    showToast('success', 'Tickets Saved', 'Your tickets has been saved successfully.', 4000)
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
            is_active: 1,
            is_private: parseInt(ticket.is_private) || 0
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
          is_active: 1,
          is_private: parseInt(ticket.is_private) || 0
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
      
      // Tickets created successfully - no toast needed
      
    } else if (mode === 'update') {
      // After successful update, clear editing states and unsaved changes
      tickets.value.forEach(ticket => {
        ticket.isEditing = false
      })
      hasUnsavedChanges.value = false
      
      const updateCount = ticketUpdates.filter(update => update.includes('Updated:')).length
      
      // Tickets updated successfully - no toast needed
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
    
    showToast('error', errorSummary, errorMessage, 5000)
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
          is_private: parseInt(ticket.is_private) || 0,
          isValidating: false,
          eventId: eventId // Ensure event ID is set
        }
        
        return loadedTicket
      })
      
      // Set hasExistingTickets to true since we loaded tickets from API
      hasExistingTickets.value = true
      isEditMode.value = true
      
      
      // Tickets loaded successfully - no toast needed
    } else {
      hasExistingTickets.value = false
      tickets.value = []
      isEditMode.value = false
    }
  } catch (error) {
    showToast('error', 'Load Failed', error.message || 'Could not load existing tickets. You can create new ones.', 4000)
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
      showToast('warn', 'Basic Info Required', 'Please complete and save Basic Info first.')
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
/* Toggle Switch Styles */
.toggle-checkbox {
  right: 0;
  border: 0;
  top: 0;
  z-index: 2;
}

.toggle-checkbox:checked {
  @apply bg-purple-600 border-purple-600;
  right: 0;
}

.toggle-checkbox:checked + .toggle-label {
  @apply bg-purple-600;
}

.toggle-label {
  display: block;
  overflow: hidden;
  cursor: pointer;
  border: 0;
  border-radius: 20px;
  margin: 0;
}

.toggle-label:before {
  content: "";
  display: block;
  width: 30px;
  margin: 0;
  background: #FFFFFF;
  position: absolute;
  top: 0;
  bottom: 0;
  right: 16px;
  border: 0;
  border-radius: 20px;
  transition: all 0.3s ease-in 0s;
}

.toggle-checkbox:checked + .toggle-label:before {
  right: 0;
}

/* Form Styling */
:deep(.p-inputtext),
:deep(.p-inputnumber-input),
:deep(.p-textarea) {
  @apply border-gray-300 rounded-lg;
  padding: 12px;
}

:deep(.p-inputnumber .p-inputnumber-input) {
  @apply border-gray-300 rounded-lg;
}

:deep(.p-inputtext:focus),
:deep(.p-inputnumber-input:focus),
:deep(.p-textarea:focus) {
  @apply border-purple-500 ring-1 ring-purple-200;
  outline: none;
}

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

/* Toggle Switch Styling */
.toggle-checkbox:checked {
  right: 0;
  border-color: #8b5cf6;
}

.toggle-checkbox:checked + .toggle-label {
  background-color: #8b5cf6;
}

.toggle-checkbox {
  transition: all 0.3s ease;
  top: 0;
}

.toggle-label {
  transition: all 0.3s ease;
}

/* Form Input Styling */
:deep(.p-inputtext),
:deep(.p-inputnumber-input),
:deep(.p-textarea) {
  @apply border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent;
}

:deep(.p-inputnumber .p-inputnumber-input) {
  @apply border-0;
}

/* Card hover effects */
.ticket-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.ticket-card {
  transition: all 0.2s ease-in-out;
}
</style>
