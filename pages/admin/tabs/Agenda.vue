<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Left Panel: List of Created Agenda -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">List of Created Agenda</h2>
        <p class="text-gray-500 mb-6">View and manage your complete event schedule</p>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span class="ml-2 text-gray-600">Loading agendas...</span>
        </div>

        <!-- Empty State -->
        <div v-else-if="!agendaItems.length" class="text-center py-12">
          <Icon name="heroicons:calendar-days" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">No agenda items yet</h3>
          <p class="text-gray-500 mb-4">Start by creating your first agenda item</p>
        </div>

        <!-- Agenda Items -->
        <div v-else>
          <TabView class="mb-6">
            <TabPanel
              v-for="(dayAgendas, date, index) in agendasByDate"
              :key="date"
              :header="`Day ${index + 1}`"
            >
              <h3 class="text-lg font-semibold text-gray-700 mb-4">{{ formatDateForDisplay(date) }}</h3>
              <div class="space-y-4">
                <div v-for="item in dayAgendas" :key="item.id" class="bg-gray-50 rounded-lg p-4 shadow-sm">
                  <div class="flex items-start space-x-4">
                    <div class="flex flex-col items-center text-center text-gray-600">
                      <span class="text-sm font-semibold">{{ new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }) }}</span>
                      <span class="text-2xl font-bold text-purple-600">{{ new Date(item.date).getDate().toString().padStart(2, '0') }}</span>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center text-gray-500 text-sm">
                          <Icon name="heroicons:clock" class="w-4 h-4 mr-1" />
                          <span>{{ formatTimeForDisplay(item.time_start) }} - {{ formatTimeForDisplay(item.time_end) }}</span>
                        </div>
                        <div class="flex space-x-2">
                          <button @click="editAgenda(item)" class="text-gray-400 hover:text-purple-600 transition-colors">
                            <Icon name="heroicons:pencil-square" class="w-5 h-5" />
                          </button>
                          <button @click="deleteAgenda(item)" class="text-gray-400 hover:text-red-500 transition-colors">
                            <Icon name="heroicons:trash" class="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ item.title }}</h3>
                      <div v-if="item.description" class="text-sm text-gray-600 mb-2">{{ item.description }}</div>
                      <div v-if="item.venue || item.room_no" class="text-sm text-gray-500 mb-2">
                        <Icon name="heroicons:map-pin" class="w-4 h-4 mr-1 inline" />
                        {{ item.venue }}{{ item.room_no ? ` - Room ${item.room_no}` : '' }}
                      </div>
                      <div v-if="item.speaker_name" class="text-sm text-gray-700">
                        <span class="font-medium">{{ item.speaker_name }}</span>
                        <div v-if="item.speaker_description" class="text-xs text-gray-600 mt-1">{{ item.speaker_description }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>
            <TabPanel v-if="Object.keys(agendasByDate).length === 0" header="Day 1">
              <p class="text-gray-500 text-center py-8">No agenda items created yet.</p>
            </TabPanel>
          </TabView>
        </div>
      </div>

      <!-- Right Panel: Event Agenda Form -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">
          {{ editingAgenda ? 'Edit Agenda' : 'Event Agenda' }}
        </h2>
        <p class="text-gray-500 mb-6">
          {{ editingAgenda ? 'Update the agenda item' : 'Create a new agenda item for your event' }}
        </p>

        <form @submit.prevent="addAgenda" class="space-y-6">
          <div>
            <label for="date" class="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <Calendar
              id="date"
              v-model="eventForm.date"
              dateFormat="dd/mm/yy"
              showIcon
              class="w-full"
              inputClass="p-inputtext p-component w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-gray-800 placeholder-gray-400"
              iconClass="p-button-icon pi pi-calendar text-gray-500"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <Dropdown
                v-model="eventForm.time_start"
                :options="startTimeOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select start time"
                class="w-full"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <Dropdown
                v-model="eventForm.time_end"
                :options="endTimeOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select end time"
                class="w-full"
                :disabled="!eventForm.time_start"
              />
            </div>
          </div>

          <div>
            <label for="session-title" class="block text-sm font-medium text-gray-700 mb-1">Session Title</label>
            <InputText
              id="session-title"
              v-model="eventForm.title"
              placeholder="Enter session title"
              class="w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-gray-800 placeholder-gray-400"
            />
          </div>

          <div>
            <label for="venue" class="block text-sm font-medium text-gray-700 mb-1">Venue/Hall</label>
            <InputText
              id="venue"
              v-model="eventForm.venue"
              placeholder="venue/hall"
              class="w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-gray-800 placeholder-gray-400"
            />
          </div>

          <div>
            <label for="room-number" class="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
            <InputText
              id="room-number"
              v-model="eventForm.room_no"
              placeholder="room number"
              class="w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-gray-800 placeholder-gray-400"
            />
          </div>

          <div>
            <label for="event-description" class="block text-sm font-medium text-gray-700 mb-1">Event Description</label>
            <Textarea
              id="event-description"
              v-model="eventForm.description"
              placeholder="Brief description of this session"
              rows="4"
              class="w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-gray-800 placeholder-gray-400"
            />
          </div>

          <!-- Speakers/Presenters Section -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-800">Speakers/Presenters</h3>
            <div class="bg-gray-50 p-4 rounded-2xl space-y-4">
              <div>
                <label for="speaker-name" class="block text-sm font-medium text-gray-700 mb-1">Speaker Name</label>
                <InputText
                  id="speaker-name"
                  v-model="eventForm.speaker_name"
                  placeholder="Speaker name"
                  class="w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-gray-800 placeholder-gray-400"
                />
              </div>
              <div>
                <label for="speaker-about" class="block text-sm font-medium text-gray-700 mb-1">About Speaker</label>
                <Textarea
                  id="speaker-about"
                  v-model="eventForm.speaker_description"
                  placeholder="Brief description about the speaker"
                  rows="3"
                  class="w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-gray-800 placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          <!-- Break Session Toggle -->
          <div class="flex items-center space-x-3">
            <input
              id="is-break"
              type="checkbox"
              v-model="eventForm.is_break"
              class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label for="is-break" class="text-sm font-medium text-gray-700">
              This is a break session (coffee break, lunch, etc.)
            </label>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full flex items-center justify-center py-3 px-6 rounded-xl shadow-lg text-white font-semibold
                   bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 transition-all duration-300 ease-in-out disabled:opacity-50"
          >
            <div v-if="isLoading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            <Icon v-else :name="editingAgenda ? 'heroicons:pencil-square' : 'heroicons:document-plus'" class="w-5 h-5 mr-2" />
            {{ isLoading ? 'Saving...' : (editingAgenda ? 'Update Agenda' : 'Add Agenda') }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, inject } from 'vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import { useToast } from "primevue/usetoast"
import { useRoute } from 'vue-router'
import { useAgendaStore } from '~/composables/useAgendaStore'
import { useAgendaValidation, useAgendaFormValidation } from '~/composables/useAgendaValidation'
import { useEventTabsStore } from '~/composables/useEventTabs'
import { useEventStore } from '~/composables/useEventStore'

const toast = useToast()
const route = useRoute()

// Get event ID from multiple sources with proper fallback
const eventId = computed(() => {
  // First try to get from parent component's provided state (most reliable for tabs)
  const parentState = inject('eventCreationState', null)
  if (parentState?.eventId?.value) {
    console.log('📅 Got event ID from parent state:', parentState.eventId.value)
    return parentState.eventId.value
  }
  
  // Then try to get from route params (for direct access)
  if (route.params.id) {
    console.log('📅 Got event ID from route params:', route.params.id)
    return route.params.id
  }
  
  // Finally try to get from event store
  const eventStore = useEventStore()
  if (eventStore.currentEvent?.id) {
    console.log('📅 Got event ID from event store:', eventStore.currentEvent.id)
    return eventStore.currentEvent.id
  }
  
  console.warn('⚠️ No event ID found in any source')
  return null
})

// Initialize stores and composables
const agendaStore = useAgendaStore()
const eventTabsStore = useEventTabsStore()
const eventStore = useEventStore()
const { formatTimeForDisplay, formatDateForDisplay, calculateDuration, generateTimeOptions } = useAgendaValidation()

// Form validation
const {
  formData: eventForm,
  isFormValid,
  hasErrors,
  allErrors,
  validate,
  resetForm,
  setFormData
} = useAgendaFormValidation()

// Reactive state
const isLoading = ref(false)
const editingAgenda = ref(null)
const showTimeSelector = ref(false)
const selectedTab = ref(0)

// Time options for dropdowns
const timeOptions = generateTimeOptions(15, 6, 23) // 6 AM to 11 PM, 15-minute intervals
const startTimeOptions = computed(() => timeOptions)
const endTimeOptions = computed(() => {
  if (!eventForm.time_start) return timeOptions
  
  const startMinutes = timeOptions.find(opt => opt.value === eventForm.time_start)?.sortValue || 0
  return timeOptions.filter(opt => opt.sortValue > startMinutes)
})

// Computed properties
const agendaItems = computed(() => agendaStore.sortedAgendas)
const agendasByDate = computed(() => agendaStore.agendasByDate)
const agendaStats = computed(() => agendaStore.agendaStats)

const isAgendaComplete = computed(() => {
  return !!(
    eventForm.date &&
    eventForm.time_start &&
    eventForm.time_end &&
    eventForm.title &&
    eventForm.venue
  )
})

const formattedTimeRange = computed(() => {
  if (eventForm.time_start && eventForm.time_end) {
    return `${formatTimeForDisplay(eventForm.time_start)} - ${formatTimeForDisplay(eventForm.time_end)}`
  }
  return ''
})

const sessionDuration = computed(() => {
  return calculateDuration(eventForm.time_start, eventForm.time_end)
})

// Methods
const loadAgendas = async () => {
  if (!eventId.value) {
    console.warn('⚠️ Cannot load agendas: No event ID available')
    return
  }
  
  try {
    isLoading.value = true
    console.log('📅 Loading agendas for event ID:', eventId.value)
    
    // Ensure the agenda store has the correct event ID
    agendaStore.setCurrentEventId(eventId.value)
    
    // Load agendas from API
    await agendaStore.loadAgendas()
    
    console.log('✅ Agendas loaded successfully:', agendaStore.agendas.length)
  } catch (error) {
    console.error('❌ Failed to load agendas:', error)
    // Remove messy error toast - just log the error
  } finally {
    isLoading.value = false
  }
}

const addAgenda = async () => {
  try {
    // Check if we have an event ID
    if (!eventId.value) {
      console.error('❌ Cannot save agenda: No event ID available')
      toast.add({
        severity: 'warn',
        summary: 'Event Required',
        detail: 'Please save Basic Info first to create agenda items.',
        life: 3000
      })
      return
    }

    // Ensure the agenda store has the correct event ID
    agendaStore.setCurrentEventId(eventId.value)
    console.log('📅 Saving agenda for event ID:', eventId.value)

    // Validate form with existing agendas for conflict checking
    const validationResult = validate(agendaStore.agendas, editingAgenda.value?.id)
    
    if (!validationResult.isValid) {
      toast.add({
        severity: 'warn',
        summary: 'Please Complete Required Fields',
        detail: validationResult.conflictError || 'Please fill in all required fields',
        life: 4000
      })
      return
    }

    isLoading.value = true

    if (editingAgenda.value) {
      // Update existing agenda
      await agendaStore.updateExistingAgenda(editingAgenda.value.id, {
        date: eventForm.date instanceof Date ? eventForm.date.toISOString().split('T')[0] : eventForm.date,
        time_start: eventForm.time_start,
        time_end: eventForm.time_end,
        title: eventForm.title,
        description: eventForm.description,
        venue: eventForm.venue,
        room_no: eventForm.room_no,
        speaker_name: eventForm.speaker_name,
        speaker_description: eventForm.speaker_description,
        speaker_image: eventForm.speaker_image,
        is_break: eventForm.is_break
      })

      toast.add({
        severity: 'success',
        summary: 'Agenda Updated! ✅',
        detail: 'Your agenda item has been updated successfully.',
        life: 3000
      })
    } else {
      // Create new agenda - pass the form data to the store
      await agendaStore.saveAgenda(eventForm)

      toast.add({
        severity: 'success',
        summary: 'Agenda Added! ✅',
        detail: 'Your agenda item has been created successfully.',
        life: 3000
      })
    }

    // Reset form and editing state
    resetForm()
    editingAgenda.value = null
    
    // Mark tab as modified in event tabs store
    eventTabsStore.markTabModified(1) // Agenda tab index
    eventTabsStore.markTabComplete(1) // Mark as complete since we have agenda items
    
  } catch (error) {
    console.error('❌ Failed to save agenda:', error)
    toast.add({
      severity: 'error',
      summary: 'Save Failed',
      detail: 'Failed to save agenda. Please try again.',
      life: 4000
    })
  } finally {
    isLoading.value = false
  }
}

const editAgenda = (agenda) => {
  editingAgenda.value = agenda
  
  setFormData({
    date: new Date(agenda.date),
    time_start: agenda.time_start,
    time_end: agenda.time_end,
    title: agenda.title,
    description: agenda.description || '',
    venue: agenda.venue || '',
    room_no: agenda.room_no || '',
    speaker_name: agenda.speaker_name || '',
    speaker_description: agenda.speaker_description || '',
    speaker_image: null, // File inputs can't be pre-filled
    is_break: agenda.is_break || false
  })

  // Simple edit notification
  toast.add({
    severity: 'info',
    summary: 'Editing Agenda',
    detail: `Now editing: ${agenda.title}`,
    life: 2000
  })
}

const deleteAgenda = async (agenda) => {
  if (!confirm(`Are you sure you want to delete "${agenda.title}"?`)) {
    return
  }

  try {
    isLoading.value = true
    await agendaStore.removeAgenda(agenda.id)
    
    toast.add({
      severity: 'success',
      summary: 'Agenda Deleted',
      detail: 'Agenda item has been deleted successfully.',
      life: 3000
    })

    // Mark tab as modified
    eventTabsStore.markTabModified(1)
    
  } catch (error) {
    console.error('❌ Failed to delete agenda:', error)
    toast.add({
      severity: 'error',
      summary: 'Delete Failed',
      detail: 'Failed to delete agenda. Please try again.',
      life: 3000
    })
  } finally {
    isLoading.value = false
  }
}

const cancelEdit = () => {
  editingAgenda.value = null
  resetForm()
  
  toast.add({
    severity: 'info',
    summary: 'Edit Cancelled',
    detail: 'Agenda editing has been cancelled.',
    life: 2000
  })
}

// Event listeners for parent component actions
const handleSaveAgenda = async () => {
  // This handles the "Save Draft" button from the parent component
  try {
    if (!eventId.value) {
      toast.add({
        severity: 'warn',
        summary: 'Event Required',
        detail: 'Please save Basic Info first.',
        life: 3000
      })
      return
    }

    // Save current agenda data to tab store for persistence
    eventTabsStore.saveTabData(1, {
      currentAgenda: { ...eventForm },
      sessions: agendaStore.agendas,
      lastSaved: new Date().toISOString(),
      isComplete: agendaStore.agendas.length > 0,
      hasUnsavedChanges: false
    })

    // Mark tab as complete if we have agendas
    if (agendaStore.agendas.length > 0) {
      eventTabsStore.markTabComplete(1)
      eventTabsStore.markTabSaved(1)
    }

    toast.add({
      severity: 'success',
      summary: 'Agenda Draft Saved! ✅',
      detail: 'Your agenda progress has been saved successfully.',
      life: 3000
    })

    console.log('✅ Agenda draft saved successfully')
  } catch (error) {
    console.error('❌ Failed to save agenda draft:', error)
    toast.add({
      severity: 'error',
      summary: 'Save Failed',
      detail: 'Failed to save agenda draft. Please try again.',
      life: 3000
    })
  }
}

onMounted(async () => {
  console.log('📅 Agenda tab mounted with event ID:', eventId.value)
  
  // Load agendas for the current event
  await loadAgendas()
  
  // Load saved draft from event tabs store
  const savedTabData = eventTabsStore.getTabData(1)
  if (savedTabData.currentAgenda) {
    setFormData(savedTabData.currentAgenda)
    console.log('📝 Loaded agenda draft from tab store')
  }

  // Add event listeners
  window.addEventListener('saveCurrentTab', handleSaveAgenda)
})

onUnmounted(() => {
  window.removeEventListener('saveCurrentTab', handleSaveAgenda)
})

const updateTimeRange = () => {
  // This is now handled by computed properties
}
</script>

<style scoped>
/* Global styles for PrimeVue components and general layout */
.p-inputtext {
  @apply px-4 py-2.5; /* Adjust padding for inputs */
}

.p-calendar .p-inputtext {
  @apply pr-10; /* Space for the calendar icon */
}

.p-calendar .p-datepicker-trigger {
  @apply absolute right-3 top-1/2 -translate-y-1/2 text-gray-500;
}

.p-tabview .p-tabview-nav {
  @apply border-b border-gray-200;
}

.p-tabview .p-tabview-nav li .p-tabview-nav-link {
  @apply px-4 py-2 text-gray-600 font-medium rounded-t-lg;
}

.p-tabview .p-tabview-nav li.p-highlight .p-tabview-nav-link {
  @apply text-purple-600 border-b-2 border-purple-600;
}

:deep(.p-calendar .p-inputtext) {
  @apply bg-transparent border-0;
}
</style>
