<template>
  <div class="min-h-screen font-sans">
    <!-- Status and Skip Option -->
    <div class="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-purple-800 mb-1">Event Agenda</h3>
          <p class="text-sm text-purple-600">{{ isSkipped ? 'Agenda has been skipped for this event' : 'Create and manage your event schedule' }}</p>
        </div>
        <div class="flex items-center space-x-4">
          <div v-if="currentEventId" class="text-right">
            <p class="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-500">Basic Info Saved</p>
            <p class="text-xs text-gray-500">{{ currentEventName }}</p>
          </div>
          <Button
            @click="toggleSkipAgenda"
            :class="[
              'px-4 py-2 rounded-full font-medium transition-all duration-300',
              isSkipped
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-yellow-500 text-white hover:bg-yellow-600'
            ]"
          >
            <Icon :name="isSkipped ? 'heroicons:plus' : 'heroicons:x-mark'" class="w-4 h-4 mr-2" />
            {{ isSkipped ? 'Add Agenda' : 'Skip Agenda' }}
          </Button>
        </div>
      </div>
    </div>

    <!-- Validation Errors Display -->
    <div v-if="validationErrors.length > 0" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
      <div class="flex items-start">
        <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 text-red-600 mr-2 mt-0.5" />
        <div>
          <h4 class="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</h4>
          <ul class="text-sm text-red-700 space-y-1">
            <li v-for="error in validationErrors" :key="error">• {{ error }}</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Agenda Content (hidden when skipped) -->
    <div v-if="!isSkipped" class="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      <!-- Left Panel: List of Created Agenda -->
      <div class="bg-white p-4 rounded-3xl col-span-2">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">List of Created Agenda</h2>
        <p class="text-gray-500 mb-6">View and manage your complete event schedule</p>

        <!-- Show tabs based on event date range -->
        <TabView class="mb-6" v-model:activeIndex="activeTabIndex" v-if="agendaDays.length > 0 && eventStartDate && eventEndDate">
          <TabPanel v-for="(day, dayIndex) in agendaDays" :key="dayIndex" :header="day.label">
            <div class="space-y-4">
              <div v-if="day.items.length === 0" class="text-center py-8">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="heroicons:calendar" class="w-8 h-8 text-gray-400" />
                </div>
                <h3 class="text-lg font-medium text-gray-800 mb-2">No agenda for {{ formatDate(day.date) }}</h3>
                <p class="text-gray-600">Add agenda items for this day using the form on the right.</p>
              </div>
              <div v-for="item in day.items" :key="item.id" class="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div class="flex items-start space-x-4">
                  <div class="flex flex-col items-center text-center text-gray-600 min-w-[60px]">
                    <span class="text-sm font-semibold">Day {{ getDayNumber(item.date) }}</span>
                    <span class="text-lg font-bold text-purple-600">{{ formatDateShort(item.date) }}</span>
                  </div>
                  <div class="flex-1 pl-4 border-l-2 border-gray-400">
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center text-gray-500 text-sm">
                        <Icon name="heroicons:clock" class="w-4 h-4 mr-1" />
                        <span>{{ item.time_start || 'No time' }} - {{ item.time_end || 'No time' }}</span>
                      </div>
                      <div class="flex space-x-2">
                        <button @click="editAgenda(item)" class="text-gray-400 hover:text-purple-600 transition-colors" title="Edit agenda item">
                          <Icon name="heroicons:pencil-square" class="w-5 h-5" />
                        </button>
                        <button @click="deleteAgendaAction($event, item.id)" class="text-gray-400 hover:text-red-500 transition-colors" title="Delete agenda item">
                          <Icon name="heroicons:trash" class="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <h3 class="text-lg font-normal text-gray-800 mb-2">{{ item.title || 'Untitled Session' }}</h3>
                    <div v-if="item.description" class="text-sm text-gray-600 mb-2">{{ item.description }}</div>
                    <div v-if="item.venu || item.room_no" class="text-sm text-gray-500 mb-2">
                      <Icon name="heroicons:map-pin" class="w-4 h-4 inline mr-1" />
                      {{ item.venu }}{{ item.venu && item.room_no ? ', ' : '' }}{{ item.room_no ? `Room ${item.room_no}` : '' }}
                    </div>
                    <div v-if="item.speakers?.length > 0" class="space-y-1">
                      <div v-for="(speaker, sIdx) in item.speakers" :key="sIdx" class="text-sm text-gray-700">
                        <Icon name="heroicons:user" class="w-4 h-4 inline mr-1" />
                        <span class="font-medium">{{ speaker.name || 'Unknown Speaker' }}</span>
                        <span v-if="speaker.about"> | {{ speaker.about }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>
        </TabView>

        <!-- No Event Dates Display -->
        <div v-else-if="!eventStartDate || !eventEndDate" class="text-center py-12">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="heroicons:calendar" class="w-10 h-10 text-gray-400" />
          </div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">Event Dates Required</h3>
          <p class="text-gray-600 mb-6">Please set event start and end dates in Basic Info to see agenda days.</p>
          <Button
            @click="generateInitialTabs"
            class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-full font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
          >
            <Icon name="heroicons:calendar-days" class="w-5 h-5 mr-2" />
            Start Creating Agenda
          </Button>
        </div>

        <!-- Empty state when dates exist but no agenda -->
        <div v-else class="text-center py-12">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="heroicons:calendar-days" class="w-10 h-10 text-gray-400" />
          </div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">Ready to Create Agenda</h3>
          <p class="text-gray-600 mb-6">Your event dates are set. Start adding agenda items using the form on the right.</p>
        </div>
      </div>

      <!-- Right Panel: Event Agenda Form -->
      <div class="bg-white p-4 rounded-3xl">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Event Agenda</h2>
        <p class="text-gray-500 mb-6">{{ isEditMode ? 'Edit existing agenda item' : 'Create a new agenda item for your event' }}</p>

        <form @submit.prevent="createOrUpdateAgenda" class="space-y-6">
          <!-- Start Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Start Date <span class="text-red-500">*</span></label>
            <Calendar
              showIcon
              iconDisplay="input"
              placeholder="Select date"
              v-model="eventForm.date"
              :class="[
                'w-full mt-1 bg-gray-100 p-3 rounded-2xl',
                getFieldError('date') ? 'border-red-500 border-2' : ''
              ]"
              dateFormat="dd/mm/yy"
              @date-select="handleDateChange"
            />
            <small v-if="getFieldError('date')" class="text-red-500">{{ getFieldError('date') }}</small>
          </div>

          <!-- Time -->
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-2">Time <span class="text-red-500">*</span></label>
            <div class="grid grid-cols-2 gap-4">
              <div class="relative">
                <!-- <Icon name="heroicons:clock" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" /> -->
                <InputText
                  v-model="eventForm.time_start"
                  type="time"
                  placeholder="Start Time"
                  :class="[
                    'w-full pl-10 bg-gray-100 p-3 rounded-2xl text-gray-800',
                    getFieldError('time_start') ? 'border-red-500 border-2' : ''
                  ]"
                />
                <small v-if="getFieldError('time_start')" class="text-red-500 text-xs">{{ getFieldError('time_start') }}</small>
              </div>
              <div class="relative">
                <!-- <Icon name="heroicons:clock" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" /> -->
                <InputText
                  v-model="eventForm.time_end"
                  type="time"
                  placeholder="End Time"
                  :class="[
                    'w-full pl-10 bg-gray-100 p-3 rounded-2xl text-gray-800',
                    getFieldError('time_end') ? 'border-red-500 border-2' : ''
                  ]"
                />
                <small v-if="getFieldError('time_end')" class="text-red-500 text-xs">{{ getFieldError('time_end') }}</small>
              </div>
            </div>
          </div>

          <!-- Session Title -->
          <div>
            <label for="session-title" class="block text-sm font-medium text-gray-700 mb-1">Session Title <span class="text-red-500">*</span></label>
            <InputText
              id="session-title"
              v-model="eventForm.title"
              placeholder="Enter session title"
              :class="[
                'w-full bg-gray-100 p-3 rounded-2xl border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-gray-800 placeholder-gray-400',
                getFieldError('title') ? 'border-red-500 border-2' : ''
              ]"
            />
            <small v-if="getFieldError('title')" class="text-red-500">{{ getFieldError('title') }}</small>
          </div>

          <!-- Venue -->
          <div>
            <label for="venue" class="block text-sm font-medium text-gray-700 mb-1">Venue/Hall</label>
            <InputText
              id="venue"
              v-model="eventForm.venu"
              placeholder="Venue or Hall"
              class="w-full bg-gray-100 p-3 rounded-2xl border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-gray-800 placeholder-gray-400"
            />
          </div>

          <!-- Room Number -->
          <div>
            <label for="room-number" class="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
            <InputText
              id="room-number"
              v-model="eventForm.room_no"
              placeholder="Room number"
              class="w-full bg-gray-100 p-3 rounded-2xl border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-gray-800 placeholder-gray-400"
            />
          </div>

          <!-- Description -->
          <div>
            <label for="event-description" class="block text-sm font-medium text-gray-700 mb-1">Event Description</label>
            <Textarea
              id="event-description"
              v-model="eventForm.description"
              placeholder="Brief description of this session"
              rows="4"
              class="w-full bg-gray-100 p-3 rounded-2xl border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-gray-800 placeholder-gray-400"
            />
          </div>

          <!-- Speakers -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-800">Speakers/Presenters</h3>
            <div class="form-speaker bg-[#F1EBF9] p-3 rounded-2xl border-2 border-purple-700">
              <div v-for="(speaker, index) in eventForm.speakers" :key="index" class="mb-4 last:mb-0">
                <div class="w-full space-y-2">
                  <div class="speaker namer">
                    <label class="block text-sm font-normal text-purple-700 mb-2">Speaker/Presenter Name</label>
                    <InputText
                      v-model="speaker.name"
                      placeholder="Speaker name"
                      class="w-full bg-white p-3 rounded-2xl border-gray-300 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-normal text-purple-700 mb-2">About Speaker</label>
                    <Textarea
                      v-model="speaker.about"
                      placeholder="About speaker"
                      rows="2"
                      class="w-full bg-white p-3 rounded-2xl border-gray-300 focus:border-purple-500"
                    />
                  </div>
                  <button
                    v-if="eventForm.speakers.length > 1"
                    type="button"
                    @click="removeSpeakerField(index)"
                    class="mt-2 text-red-500 hover:text-red-700 flex items-center"
                  >
                    <Icon name="heroicons:trash" class="w-4 h-4 mr-1" />
                    Remove Speaker
                  </button>
                </div>
              </div>
              <button
                @click="addSpeakerField"
                type="button"
                class="w-full flex items-center justify-center mt-5 py-3 px-4 border border-purple-400 border-dashed text-purple-600 rounded-xl hover:bg-purple-50 transition-colors font-semibold"
              >
                <Icon name="heroicons:plus" class="w-5 h-5 mr-2" />
                Add Speaker
              </button>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex space-x-4">
            <button
              type="submit"
              :disabled="isSubmitting"
              :class="[
                'w-full flex items-center justify-center py-3 px-6 rounded-full shadow-lg text-white font-semibold transition-all duration-300 ease-in-out',
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-blue-800 hover:from-purple-700 hover:to-purple-900'
              ]"
            >
              <Icon v-if="isSubmitting" name="heroicons:arrow-path" class="w-5 h-5 mr-2 animate-spin" />
              <Icon v-else name="heroicons:document-plus" class="w-5 h-5 mr-2" />
              {{ isSubmitting ? 'Saving...' : (isEditMode ? 'Update Agenda' : 'Add Agenda') }}
            </button>
            <button
              v-if="isEditMode"
              type="button"
              @click="resetForm"
              class="w-full flex items-center justify-center py-3 px-6 rounded-full border border-gray-300 text-gray-600 font-semibold hover:bg-gray-100 transition-all"
            >
              <Icon name="heroicons:x-mark" class="w-5 h-5 mr-2" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Skipped State Display -->
    <div v-else class="text-center py-16">
      <div class="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Icon name="heroicons:calendar-x" class="w-12 h-12 text-yellow-600" />
      </div>
      <h3 class="text-2xl font-semibold text-gray-800 mb-4">Agenda Skipped</h3>
      <p class="text-gray-600 mb-8 max-w-md mx-auto">
        This event will be published without an agenda. You can add an agenda later if needed.
      </p>
      <div class="flex justify-center space-x-4">
        <Button
          @click="toggleSkipAgenda"
          class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-full font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
        >
          <Icon name="heroicons:plus" class="w-5 h-5 mr-2" />
          Add Agenda Now
        </Button>
      </div>
    </div>

    <ConfirmPopup></ConfirmPopup>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, inject } from 'vue';
import ConfirmPopup from 'primevue/confirmpopup';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Button from 'primevue/button';
import SpeakerInput from '~/components/common/SpeakerInput.vue';
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import { getEventAgenda, createAgendaItems, updateAgendaItem, deleteAgenda } from '@/composables/api'
import { useEventStore } from '~/composables/useEventStore'
import { useEventTabsStore } from '~/composables/useEventTabs'
import { useFormValidation } from '~/composables/useFormValidation'
// Icon is auto-imported by Nuxt

const props = defineProps(['eventId'])

const toast = useToast();
const confirm = useConfirm();

// Form validation
const {
  errors,
  hasErrors,
  clearErrors,
  clearFieldError,
  setFieldError,
  getFieldError,
  validateField,
  validateRequired,
  validateTimeRange
} = useFormValidation()

// Event creation state from parent
const eventCreationState = inject('eventCreationState')

// Event data
const currentEventId = ref(null)
const currentEventName = ref('')
const isSkipped = ref(false)
const isSubmitting = ref(false)

const agendaItems = ref([]);
const activeTabIndex = ref(0)
const validationErrors = ref([])

// Track edit mode and the ID of the agenda being edited
const isEditMode = ref(false);
const editingAgendaId = ref(null);

const eventForm = ref({
  date: null,
  time_start: null,
  time_end: null,
  title: null,
  venu: null,
  room_no: null,
  description: null,
  speakers: [{ name: null, about: null }],
});

// Get event start and end dates for day calculation
const eventStartDate = ref(null)
const eventEndDate = ref(null)

// Computed property for organizing agenda items by days with dynamic labels
const agendaDays = computed(() => {
  if (!eventStartDate.value || !eventEndDate.value) {
    return []
  }

  const startDate = new Date(eventStartDate.value)
  const endDate = new Date(eventEndDate.value)
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset time for comparison
  const days = []
  
  // Calculate number of days between start and end
  const timeDiff = endDate.getTime() - startDate.getTime()
  const dayCount = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1
  
  // Create day structure with dynamic labels
  for (let i = 0; i < dayCount; i++) {
    const dayDate = new Date(startDate)
    dayDate.setDate(startDate.getDate() + i)
    dayDate.setHours(0, 0, 0, 0) // Reset time for comparison
    
    // Generate dynamic label based on relation to today
    let label = `Day ${i + 1}`
    const dayDiff = Math.floor((dayDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
    
    if (dayDiff === 0) {
      label = `Day ${i + 1} (Today)`
    } else if (dayDiff === 1) {
      label = `Day ${i + 1} (Tomorrow)`
    } else if (dayDiff === -1) {
      label = `Day ${i + 1} (Yesterday)`
    } else if (dayDiff > 1) {
      label = `Day ${i + 1} (${dayDiff} days from now)`
    } else if (dayDiff < -1) {
      label = `Day ${i + 1} (${Math.abs(dayDiff)} days ago)`
    }
    
    const dayItems = agendaItems.value.filter(item => {
      if (!item.date) return false
      const itemDate = new Date(item.date)
      itemDate.setHours(0, 0, 0, 0)
      return itemDate.getTime() === dayDate.getTime()
    })
    
    days.push({
      date: dayDate,
      dayNumber: i + 1,
      label: label,
      items: dayItems.sort((a, b) => {
        // Sort by time_start
        if (!a.time_start || !b.time_start) return 0
        return a.time_start.localeCompare(b.time_start)
      })
    })
  }
  
  return days
})

// Computed property for days that have agenda items - show all days from event range
const daysWithItems = computed(() => {
  return agendaDays.value // Show all days, not just those with items
})

// Helper functions for date formatting
const formatDate = (date) => {
  if (!date) return 'No date'
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDateShort = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

const getDayNumber = (date) => {
  if (!date || !eventStartDate.value) return 1
  
  const startDate = new Date(eventStartDate.value)
  startDate.setHours(0, 0, 0, 0) // Reset to start of day
  const itemDate = new Date(date)
  itemDate.setHours(0, 0, 0, 0) // Reset to start of day
  
  const timeDiff = itemDate.getTime() - startDate.getTime()
  const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24))
  
  // Ensure Day 1 is always returned for the start date or earlier
  if (dayDiff <= 0) {
    return 1
  }
  
  return dayDiff + 1
}

// Handle date change to auto-determine day
const handleDateChange = (selectedDate) => {
  if (!selectedDate || !eventStartDate.value) return
  
  const dayNumber = getDayNumber(selectedDate)
  
  // Switch to the appropriate tab - ensure Day 1 is always index 0
  const targetTabIndex = Math.max(0, dayNumber - 1)
  
  // Always ensure Day 1 (first day) maps to tab index 0
  if (dayNumber === 1) {
    activeTabIndex.value = 0
  } else if (targetTabIndex < daysWithItems.value.length) {
    activeTabIndex.value = targetTabIndex
  } else if (daysWithItems.value.length > 0) {
    // Default to first available day if calculated day doesn't exist
    activeTabIndex.value = 0
  }
}

// Validate agenda form
const validateAgendaForm = () => {
  clearErrors()
  validationErrors.value = []
  const errors = []

  // Validate required fields
  if (!eventForm.value.date) {
    setFieldError('date', 'Date is required')
    errors.push('Date is required')
  }

  if (!eventForm.value.time_start) {
    setFieldError('time_start', 'Start time is required')
    errors.push('Start time is required')
  }

  if (!eventForm.value.time_end) {
    setFieldError('time_end', 'End time is required')
    errors.push('End time is required')
  }

  if (!eventForm.value.title || !eventForm.value.title.trim()) {
    setFieldError('title', 'Session title is required')
    errors.push('Session title is required')
  }

  // Validate time range - allow same time
  if (eventForm.value.time_start && eventForm.value.time_end) {
    const timeError = validateTimeRange(eventForm.value.time_start, eventForm.value.time_end)
    if (timeError) {
      setFieldError('time_end', timeError)
      errors.push(timeError)
    }
  }

  // Validate speakers (if any speaker has name, they must have about)
  eventForm.value.speakers.forEach((speaker, index) => {
    if (speaker.name && speaker.name.trim() && (!speaker.about || !speaker.about.trim())) {
      errors.push(`Speaker ${index + 1}: About information is required when speaker name is provided`)
    }
  })

  validationErrors.value = errors
  return errors.length === 0
}

// Reset form to initial state
const resetForm = () => {
  eventForm.value = {
    date: null,
    time_start: null,
    time_end: null,
    title: null,
    venu: null,
    room_no: null,
    description: null,
    speakers: [{ name: null, about: null }],
  };
  isEditMode.value = false;
  editingAgendaId.value = null;
  clearErrors()
  validationErrors.value = []
};

// Populate form for editing
const editAgenda = (agenda) => {
  try {
    if (!agenda || !agenda.id) {
      toast.add({
        severity: 'error',
        summary: 'Edit Error',
        detail: 'Invalid agenda item selected for editing.',
        life: 3000
      })
      return
    }

    eventForm.value = {
      date: agenda.date ? new Date(agenda.date) : null, // Ensure date is a Date object for Calendar
      time_start: agenda.time_start || null,
      time_end: agenda.time_end || null,
      title: agenda.title || '',
      venu: agenda.venu || '',
      room_no: agenda.room_no || '',
      description: agenda.description || '',
      speakers: agenda.speakers?.length ? [...agenda.speakers] : [{ name: null, about: null }],
    };
    isEditMode.value = true;
    editingAgendaId.value = agenda.id;
    clearErrors()
    validationErrors.value = []
    
    toast.add({
      severity: 'info',
      summary: 'Edit Mode',
      detail: `Editing agenda: ${agenda.title || 'Untitled Session'}`,
      life: 2000
    })
  } catch (error) {
    console.error('Error editing agenda:', error)
    toast.add({
      severity: 'error',
      summary: 'Edit Error',
      detail: 'Failed to load agenda item for editing. Please try again.',
      life: 4000
    })
  }
};

// Handle form submission (create or update)
const createOrUpdateAgenda = async () => {
  if (!validateAgendaForm()) {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Please fix the errors before submitting.',
      life: 4000,
    });
    return
  }

  isSubmitting.value = true

  try {
    // Prepare agenda data with proper format and validation
    const agendaData = {
      date: eventForm.value.date ? new Date(eventForm.value.date).toISOString().split('T')[0] : null,
      time_start: eventForm.value.time_start,
      time_end: eventForm.value.time_end,
      title: eventForm.value.title?.trim(),
      venu: eventForm.value.venu?.trim() || '',
      room_no: eventForm.value.room_no?.trim() || '',
      description: eventForm.value.description?.trim() || '',
      is_break: false
    }

    // Handle speakers separately - only include valid speakers
    const validSpeakers = eventForm.value.speakers.filter(speaker =>
      speaker.name && speaker.name.trim()
    ).map(speaker => ({
      name: speaker.name.trim(),
      about: speaker.about?.trim() || ''
    }))

    // Only add speakers if there are valid ones
    if (validSpeakers.length > 0) {
      agendaData.speakers = validSpeakers
    }

    let response;
    if (isEditMode.value) {
      // Update existing agenda - ensure we have the agenda ID
      if (!editingAgendaId.value) {
        throw new Error('No agenda ID found for update operation')
      }
      response = await updateAgendaItem(currentEventId.value, editingAgendaId.value, agendaData);
    } else {
      // Create new agenda
      response = await createAgendaItems(currentEventId.value, agendaData);
    }

    if (response.success) {
      toast.add({
        severity: 'success',
        summary: isEditMode.value ? 'Agenda Updated' : 'Agenda Created',
        detail: isEditMode.value ? 'Agenda item updated successfully.' : 'Agenda item created successfully.',
        life: 3000,
      });
      
      // Reset form and fetch updated agenda list
      resetForm();
      await loadAgendaItems()
      
      // Update tab store and mark tab as completed
      handleSaveCurrentTab()
      
      // Mark agenda tab as completed in parent
      if (eventCreationState?.markTabCompleted) {
        eventCreationState.markTabCompleted(1)
      }
    } else {
      throw new Error(response.message || 'Failed to save agenda');
    }
  } catch (error) {
    console.error('❌ Agenda save error:', error)
    toast.add({
      severity: 'error',
      summary: isEditMode.value ? 'Update Failed' : 'Create Failed',
      detail: error.message || 'Failed to save agenda item.',
      life: 4000,
    });
  } finally {
    isSubmitting.value = false
  }
};

// Load agenda items
const loadAgendaItems = async () => {
  if (!currentEventId.value) return

  try {
    const response = await getEventAgenda(currentEventId.value);
    if (response.success && response.data) {
      agendaItems.value = response.data;
    }
  } catch (error) {
    // Failed to load agenda items
  }
}

// Handle delete agenda
const deleteAgendaAction = (event, agendaId) => {
  confirm.require({
    target: event.currentTarget,
    message: 'Do you want to delete this agenda?',
    icon: 'pi pi-info-circle',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true,
    },
    acceptProps: {
      label: 'Delete',
      severity: 'danger',
      class: 'text'
    },
    accept: async () => {
      try {
        const response = await deleteAgenda(currentEventId.value, agendaId);
        if (response.success) {
          toast.add({
            severity: 'success',
            summary: 'Agenda Deleted',
            detail: 'Agenda deleted successfully',
            life: 3000,
          });
          
          // Refresh agenda list
          await loadAgendaItems()
          
          // Reset form if deleting the currently edited agenda
          if (editingAgendaId.value === agendaId) {
            resetForm();
          }
          
          // Update tab store
          handleSaveCurrentTab()
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Delete Failed',
          detail: 'Failed to delete agenda item.',
          life: 3000,
        });
      }
    },
    reject: () => {},
  });
};

// Toggle skip agenda functionality
const toggleSkipAgenda = () => {
  isSkipped.value = !isSkipped.value
  
  const tabsStore = useEventTabsStore()
  
  if (isSkipped.value) {
    // Mark as skipped and complete
    tabsStore.saveTabData(1, {
      isSkipped: true,
      sessions: [],
      speakers: [],
      schedule: [],
      lastSaved: new Date().toISOString(),
      isComplete: true,
      eventId: currentEventId.value
    })
    tabsStore.markTabComplete(1)
    
    toast.add({
      severity: 'info',
      summary: 'Agenda Skipped',
      detail: 'This event will be published without an agenda. You can add one later if needed.',
      life: 4000
    })
  } else {
    // Remove skip status
    tabsStore.saveTabData(1, {
      isSkipped: false,
      sessions: agendaItems.value,
      speakers: [],
      schedule: [],
      lastSaved: new Date().toISOString(),
      isComplete: agendaItems.value.length > 0,
      eventId: currentEventId.value
    })
    
    if (agendaItems.value.length === 0) {
      tabsStore.completedTabs.delete(1)
    }
    
    toast.add({
      severity: 'success',
      summary: 'Agenda Enabled',
      detail: 'You can now create agenda items for your event.',
      life: 3000
    })
  }
  
  // Save current tab data
  handleSaveCurrentTab()
}

// Enhanced save current tab data for tab switching
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
  
  // Save current agenda data to tab persistence
  const tabData = {
    sessions: agendaItems.value,
    speakers: [],
    schedule: [],
    isSkipped: isSkipped.value,
    lastSaved: new Date().toISOString(),
    hasAgenda: agendaItems.value.length > 0,
    eventId: currentEventId.value,
    isEditMode: isEditMode.value,
    isComplete: isSkipped.value || agendaItems.value.length > 0
  }
  
  tabsStore.saveTabData(1, tabData)
  
  if (tabData.isComplete) {
    tabsStore.markTabComplete(1)
  }
  
}

// Save agenda items
const saveAgenda = async () => {
  if (!currentEventId.value) {
    toast.add({
      severity: 'error',
      summary: 'No Event',
      detail: 'Please complete and save Basic Info first.',
      life: 3000
    })
    return
  }

  if (isSkipped.value) {
    toast.add({
      severity: 'success',
      summary: 'Agenda Skipped',
      detail: 'Event will be published without agenda.',
      life: 3000
    })
    return
  }

  if (agendaItems.value.length === 0) {
    toast.add({
      severity: 'warn',
      summary: 'No Agenda Items',
      detail: 'Please add at least one agenda item or skip the agenda.',
      life: 3000
    })
    return
  }

  try {
    // Save all agenda items
    const tabsStore = useEventTabsStore()
    
    // Update tab store and mark as complete
    const tabData = {
      sessions: agendaItems.value,
      speakers: [],
      schedule: [],
      isSkipped: false,
      lastSaved: new Date().toISOString(),
      hasAgenda: true,
      eventId: currentEventId.value,
      isComplete: true
    }
    
    tabsStore.markTabComplete(1)
    tabsStore.markTabSaved(1)
    tabsStore.saveTabData(1, tabData)
    
    toast.add({
      severity: 'success',
      summary: 'Agenda Saved Successfully! 📅',
      detail: `Saved ${agendaItems.value.length} agenda item(s)`,
      life: 4000
    })
    
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Save Failed',
      detail: 'Failed to save agenda. Please try again.',
      life: 4000
    })
  }
}

// Generate initial tabs when user clicks start
const generateInitialTabs = () => {
  if (!eventStartDate.value || !eventEndDate.value) {
    toast.add({
      severity: 'warn',
      summary: 'Event Dates Required',
      detail: 'Please set event start and end dates in Basic Info first.',
      life: 4000
    })
    return
  }
  
  toast.add({
    severity: 'success',
    summary: 'Agenda Days Generated',
    detail: `Generated ${agendaDays.value.length} day(s) based on your event dates. You can now add agenda items.`,
    life: 4000
  })
}

onMounted(async () => {
  // Get event data from store or props
  const eventStore = useEventStore()
  const tabsStore = useEventTabsStore()
  
  if (eventStore.hasCurrentEvent) {
    currentEventId.value = eventStore.currentEvent.id
    currentEventName.value = eventStore.currentEvent.name || "Unnamed Event"
    
    // Get event dates for day calculation
    eventStartDate.value = eventStore.currentEvent.start_date
    eventEndDate.value = eventStore.currentEvent.end_date
    
    // Load existing agenda data
    const agendaTabData = tabsStore.getTabData(1)
    if (agendaTabData.isSkipped) {
      isSkipped.value = true
    } else if (agendaTabData.sessions && agendaTabData.sessions.length > 0) {
      agendaItems.value = agendaTabData.sessions
    } else if (eventStore.currentEvent.agendas && eventStore.currentEvent.agendas.length > 0) {
      agendaItems.value = eventStore.currentEvent.agendas
    } else {
      // Load from API
      await loadAgendaItems()
    }
    
  } else if (props.eventId) {
    currentEventId.value = props.eventId
    await loadAgendaItems()
  } else {
    toast.add({
      severity: 'warn',
      summary: 'Event Required',
      detail: 'Please complete and save Basic Info first.',
      life: 3000
    })
  }

  // Add event listeners for agenda saving and tab switching
  window.addEventListener('saveAgenda', saveAgenda)
  window.addEventListener('saveCurrentTab', handleSaveCurrentTab)
  
  // Listen for edit mode changes from main page
  window.addEventListener('editModeChanged', (event) => {
    if (event.detail?.eventId === currentEventId.value) {
      // Update any local edit mode state if needed
    }
  })
});

// Remove event listeners when component unmounts
onUnmounted(() => {
  window.removeEventListener('saveAgenda', saveAgenda)
  window.removeEventListener('saveCurrentTab', handleSaveCurrentTab)
})

const addSpeakerField = () => {
  eventForm.value.speakers.push({ name: '', about: '' });
};

const removeSpeakerField = (index) => {
  if (eventForm.value.speakers.length > 1) {
    eventForm.value.speakers.splice(index, 1);
  }
};
</script>

<style scoped>
:deep(.p-calendar .p-inputtext) {
  @apply bg-transparent border-0;
}

:deep(.p-tabview .p-tabview-nav) {
  @apply bg-gray-50 rounded-lg;
}

:deep(.p-tabview .p-tabview-nav li .p-tabview-nav-link) {
  @apply rounded-lg mx-1;
}

:deep(.p-tabview .p-tabview-nav li.p-highlight .p-tabview-nav-link) {
  @apply bg-purple-600 text-white;
}

.agenda-item-enter-active,
.agenda-item-leave-active {
  transition: all 0.3s ease;
}

.agenda-item-enter-from,
.agenda-item-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
