<template>
  <div class="min-h-screen font-sans">
    <div class="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      <!-- Left Panel: List of Created Agenda -->
      <div class="bg-white p-4 rounded-3xl col-span-2">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">List of Created Agenda</h2>
            <p class="text-gray-500">View and manage your complete event schedule</p>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-500">
              Total: {{ agendaStats.total }} | Sessions: {{ agendaStats.sessions }} | Breaks: {{ agendaStats.breaks }}
            </div>
          </div>
        </div>

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

        <!-- Agenda Items by Date -->
        <div v-else>
          <TabView class="mb-6" v-model:activeIndex="selectedTab">
            <TabPanel
              v-for="(dayAgendas, date, index) in agendasByDate"
              :key="date"
              :header="`Day ${index + 1}`"
            >
              <div class="mb-4">
                <h3 class="text-lg font-normal text-gray-700">
                  {{ formatDateForDisplay(date) }}
                </h3>
                <p class="text-sm text-gray-500">{{ dayAgendas.length }} items scheduled</p>
              </div>
              
              <div class="space-y-4">
                <div
                  v-for="item in dayAgendas"
                  :key="item.id"
                  class="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                  :class="{ 'bg-blue-50 border-blue-200': item.is_break }"
                >
                  <div class="flex items-start space-x-4">
                    <div class="flex flex-col items-center text-center text-gray-600 min-w-[60px]">
                      <span class="text-sm font-semibold">
                        {{ new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }) }}
                      </span>
                      <span class="text-2xl font-bold text-purple-600">
                        {{ new Date(item.date).getDate().toString().padStart(2, '0') }}
                      </span>
                      <span v-if="item.is_break" class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full mt-1">
                        Break
                      </span>
                    </div>
                    
                    <div class="flex-1 pl-4 border-l-2 border-gray-400">
                      <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center text-gray-500 text-sm">
                          <Icon name="heroicons:clock" class="w-4 h-4 mr-1" />
                          <span>{{ formatTimeForDisplay(item.time_start) }} - {{ formatTimeForDisplay(item.time_end) }}</span>
                          <span class="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                            {{ calculateDuration(item.time_start, item.time_end) }}
                          </span>
                        </div>
                        <div class="flex space-x-2">
                          <button
                            @click="editAgenda(item)"
                            class="text-gray-400 hover:text-purple-600 transition-colors"
                            title="Edit agenda"
                          >
                            <Icon name="heroicons:pencil-square" class="w-5 h-5" />
                          </button>
                          <button
                            @click="deleteAgenda(item)"
                            class="text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete agenda"
                          >
                            <Icon name="heroicons:trash" class="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      
                      <h3 class="text-lg font-normal text-gray-800 mb-2">{{ item.title }}</h3>
                      
                      <div v-if="item.description" class="text-sm text-gray-600 mb-2">
                        {{ item.description }}
                      </div>
                      
                      <div v-if="item.venue || item.room_no" class="flex items-center text-sm text-gray-500 mb-2">
                        <Icon name="heroicons:map-pin" class="w-4 h-4 mr-1" />
                        <span>{{ item.venue }}{{ item.room_no ? ` - Room ${item.room_no}` : '' }}</span>
                      </div>
                      
                      <div v-if="item.speaker_name" class="space-y-1">
                        <div class="text-sm text-gray-700">
                          <Icon name="heroicons:user" class="w-4 h-4 mr-1 inline" />
                          <span class="font-medium">{{ item.speaker_name }}</span>
                        </div>
                        <div v-if="item.speaker_description" class="text-xs text-gray-600 ml-5">
                          {{ item.speaker_description }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>
            
            <!-- Show message if no agendas for any day -->
            <TabPanel v-if="Object.keys(agendasByDate).length === 0" header="Day 1">
              <p class="text-gray-500 text-center py-8">No agenda items created yet.</p>
            </TabPanel>
          </TabView>
        </div>
      </div>

      <!-- Right Panel: Event Agenda Form -->
      <div class="bg-white p-4 rounded-3xl">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">
              {{ editingAgenda ? 'Edit Agenda' : 'Event Agenda' }}
            </h2>
            <p class="text-gray-500">
              {{ editingAgenda ? 'Update the agenda item' : 'Create a new agenda item for your event' }}
            </p>
          </div>
          <div v-if="editingAgenda" class="flex space-x-2">
            <button
              @click="cancelEdit"
              type="button"
              class="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        <!-- Form Validation Errors -->
        <div v-if="hasErrors" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <h4 class="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</h4>
          <ul class="text-sm text-red-700 space-y-1">
            <li v-for="(errors, field) in allErrors" :key="field">
              <strong>{{ field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) }}:</strong>
              {{ Array.isArray(errors) ? errors.join(', ') : errors }}
            </li>
          </ul>
        </div>

        <form @submit.prevent="addAgenda" class="space-y-6">
          <!-- Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Date <span class="text-red-500">*</span>
            </label>
            <Calendar
              v-model="eventForm.date"
              showIcon
              iconDisplay="input"
              placeholder="Select date"
              dateFormat="dd/mm/yy"
              class="w-full"
              :class="{ 'border-red-300': allErrors.date }"
              :minDate="new Date()"
            />
            <div v-if="allErrors.date" class="mt-1 text-sm text-red-600">
              {{ Array.isArray(allErrors.date) ? allErrors.date[0] : allErrors.date }}
            </div>
          </div>

          <!-- Time Range -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Start Time <span class="text-red-500">*</span>
              </label>
              <Dropdown
                v-model="eventForm.time_start"
                :options="startTimeOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select start time"
                class="w-full"
                :class="{ 'border-red-300': allErrors.time_start }"
              />
              <div v-if="allErrors.time_start" class="mt-1 text-sm text-red-600">
                {{ Array.isArray(allErrors.time_start) ? allErrors.time_start[0] : allErrors.time_start }}
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                End Time <span class="text-red-500">*</span>
              </label>
              <Dropdown
                v-model="eventForm.time_end"
                :options="endTimeOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select end time"
                class="w-full"
                :class="{ 'border-red-300': allErrors.time_end }"
                :disabled="!eventForm.time_start"
              />
              <div v-if="allErrors.time_end" class="mt-1 text-sm text-red-600">
                {{ Array.isArray(allErrors.time_end) ? allErrors.time_end[0] : allErrors.time_end }}
              </div>
            </div>
          </div>

          <!-- Duration Display -->
          <div v-if="sessionDuration" class="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
            <Icon name="heroicons:clock" class="w-4 h-4 mr-1 inline" />
            Duration: {{ sessionDuration }}
            <span v-if="formattedTimeRange" class="ml-2">({{ formattedTimeRange }})</span>
          </div>

          <!-- Session Title -->
          <div>
            <label for="session-title" class="block text-sm font-medium text-gray-700 mb-1">
              Session Title <span class="text-red-500">*</span>
            </label>
            <InputText
              id="session-title"
              v-model="eventForm.title"
              placeholder="Enter session title"
              class="w-full"
              :class="{ 'border-red-300': allErrors.title }"
            />
            <div v-if="allErrors.title" class="mt-1 text-sm text-red-600">
              {{ Array.isArray(allErrors.title) ? allErrors.title[0] : allErrors.title }}
            </div>
          </div>

          <!-- Description -->
          <div>
            <label for="event-description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <Textarea
              id="event-description"
              v-model="eventForm.description"
              placeholder="Brief description of this session"
              rows="3"
              class="w-full"
              :class="{ 'border-red-300': allErrors.description }"
            />
            <div v-if="allErrors.description" class="mt-1 text-sm text-red-600">
              {{ Array.isArray(allErrors.description) ? allErrors.description[0] : allErrors.description }}
            </div>
          </div>

          <!-- Venue and Room -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="venue" class="block text-sm font-medium text-gray-700 mb-1">Venue/Hall</label>
              <InputText
                id="venue"
                v-model="eventForm.venue"
                placeholder="Venue or Hall"
                class="w-full"
                :class="{ 'border-red-300': allErrors.venue }"
              />
              <div v-if="allErrors.venue" class="mt-1 text-sm text-red-600">
                {{ Array.isArray(allErrors.venue) ? allErrors.venue[0] : allErrors.venue }}
              </div>
            </div>

            <div>
              <label for="room-number" class="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
              <InputText
                id="room-number"
                v-model="eventForm.room_no"
                placeholder="Room number"
                class="w-full"
                :class="{ 'border-red-300': allErrors.room_no }"
              />
              <div v-if="allErrors.room_no" class="mt-1 text-sm text-red-600">
                {{ Array.isArray(allErrors.room_no) ? allErrors.room_no[0] : allErrors.room_no }}
              </div>
            </div>
          </div>

          <!-- Speaker Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-800">Speaker/Presenter (Optional)</h3>

            <div class="bg-gray-50 p-4 rounded-2xl space-y-4">
              <div>
                <label for="speaker-name" class="block text-sm font-medium text-gray-700 mb-1">Speaker Name</label>
                <InputText
                  id="speaker-name"
                  v-model="eventForm.speaker_name"
                  placeholder="Speaker name"
                  class="w-full"
                  :class="{ 'border-red-300': allErrors.speaker_name }"
                />
                <div v-if="allErrors.speaker_name" class="mt-1 text-sm text-red-600">
                  {{ Array.isArray(allErrors.speaker_name) ? allErrors.speaker_name[0] : allErrors.speaker_name }}
                </div>
              </div>

              <div>
                <label for="speaker-description" class="block text-sm font-medium text-gray-700 mb-1">About Speaker</label>
                <Textarea
                  id="speaker-description"
                  v-model="eventForm.speaker_description"
                  placeholder="Brief description about the speaker"
                  rows="3"
                  class="w-full"
                  :class="{ 'border-red-300': allErrors.speaker_description }"
                />
                <div v-if="allErrors.speaker_description" class="mt-1 text-sm text-red-600">
                  {{ Array.isArray(allErrors.speaker_description) ? allErrors.speaker_description[0] : allErrors.speaker_description }}
                </div>
              </div>

              <div>
                <label for="speaker-image" class="block text-sm font-medium text-gray-700 mb-1">Speaker Image</label>
                <input
                  id="speaker-image"
                  type="file"
                  accept="image/*"
                  @change="(e) => eventForm.speaker_image = e.target.files[0]"
                  class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  :class="{ 'border-red-300': allErrors.speaker_image }"
                />
                <div v-if="allErrors.speaker_image" class="mt-1 text-sm text-red-600">
                  {{ Array.isArray(allErrors.speaker_image) ? allErrors.speaker_image[0] : allErrors.speaker_image }}
                </div>
                <p class="mt-1 text-xs text-gray-500">Max file size: 5MB. Supported formats: JPEG, PNG, GIF, WebP</p>
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

          <!-- Submit Button -->
          <div class="flex space-x-3">
            <button
              type="submit"
              :disabled="isLoading"
              class="flex-1 flex items-center justify-center py-3 px-6 rounded-full shadow-lg text-white font-semibold bg-gradient-to-r from-purple-600 to-blue-800 hover:from-purple-700 hover:to-purple-900 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div v-if="isLoading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              <Icon v-else :name="editingAgenda ? 'heroicons:pencil-square' : 'heroicons:document-plus'" class="w-5 h-5 mr-2" />
              {{ isLoading ? 'Saving...' : (editingAgenda ? 'Update Agenda' : 'Add Agenda') }}
            </button>
          </div>
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
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load agendas: ' + error.message,
      life: 5000
    })
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
        severity: 'error',
        summary: 'Error',
        detail: 'Event ID is required to save agenda. Please ensure the event is created first.',
        life: 5000
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
        summary: 'Validation Error',
        detail: validationResult.conflictError || 'Please fix the form errors',
        life: 5000
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
        summary: 'Updated',
        detail: 'Agenda item updated successfully',
        life: 3000
      })
    } else {
      // Create new agenda - pass the form data to the store
      await agendaStore.saveAgenda(eventForm)

      toast.add({
        severity: 'success',
        summary: 'Created',
        detail: 'Agenda item created successfully',
        life: 3000
      })
    }

    // Reset form and editing state
    resetForm()
    editingAgenda.value = null
    
    // Mark tab as modified in event tabs store
    eventTabsStore.markTabModified(1) // Agenda tab index
    
  } catch (error) {
    console.error('❌ Failed to save agenda:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save agenda: ' + error.message,
      life: 5000
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

  toast.add({
    severity: 'info',
    summary: 'Editing',
    detail: `Now editing: ${agenda.title}`,
    life: 3000
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
      summary: 'Deleted',
      detail: 'Agenda item deleted successfully',
      life: 3000
    })

    // Mark tab as modified
    eventTabsStore.markTabModified(1)
    
  } catch (error) {
    console.error('❌ Failed to delete agenda:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete agenda: ' + error.message,
      life: 5000
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
    summary: 'Cancelled',
    detail: 'Edit cancelled',
    life: 2000
  })
}

const addSpeakerField = () => {
  // This is now handled by the form validation composable
  // Keep for backward compatibility but speakers are now single fields
}

const removeSpeakerField = (index) => {
  // This is now handled by the form validation composable
  // Keep for backward compatibility but speakers are now single fields
}

// Auto-save functionality
const isAutoSaving = ref(false)

watch(isAgendaComplete, async (newValue) => {
  if (newValue && !isAutoSaving.value && !editingAgenda.value) {
    isAutoSaving.value = true

    try {
      // Auto-save to event tabs store
      eventTabsStore.saveTabData(1, {
        currentAgenda: { ...eventForm },
        autoSavedAt: new Date().toISOString()
      })

      toast.add({
        severity: 'info',
        summary: 'Auto-Saved 📅',
        detail: 'Your agenda draft has been automatically saved.',
        life: 2000
      })
    } catch (error) {
      console.error('Auto-save agenda failed:', error)
    } finally {
      setTimeout(() => {
        isAutoSaving.value = false
      }, 2000)
    }
  }
}, { deep: true })

// Event listeners for parent component actions
const handleSaveAgenda = () => {
  addAgenda()
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

:deep(.p-calendar .p-inputtext) {
  @apply bg-transparent border-0;
}
/* You can add scoped Tailwind overrides here if needed */
</style>
