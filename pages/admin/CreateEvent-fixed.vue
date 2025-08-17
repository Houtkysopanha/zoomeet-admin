<template>
  <div class="p-4 lg:p-6 bg-[#F8F8FF]">
    <div class="mb-4 lg:mb-6">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <Breadcrumb
            :items="[
              { text: 'Event', to: '/admin/event' },
              { text: isEditMode ? 'Edit Event' : 'Create Event' }
            ]"
            class="mb-2"
          />
          <p v-if="isEditMode && eventData" class="text-sm text-gray-500">
            Editing: {{ eventData.name }}
          </p>
        </div>
        <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 items-stretch sm:items-center">
          <!-- Progress Indicator -->
          <div class="hidden lg:flex items-center space-x-2 text-sm">
            <div class="flex items-center space-x-1">
              <div :class="[
                'w-3 h-3 rounded-full transition-all duration-300',
                isBasicInfoCompleted ? 'bg-green-500' : 'bg-gray-300'
              ]"></div>
              <span :class="[
                'text-xs font-medium',
                isBasicInfoCompleted ? 'text-green-600' : 'text-gray-500'
              ]">Basic Info</span>
            </div>
            <Icon name="heroicons:chevron-right" class="w-3 h-3 text-gray-400" />
            <div class="flex items-center space-x-1">
              <div :class="[
                'w-3 h-3 rounded-full transition-all duration-300',
                hasTickets ? 'bg-green-500' : 'bg-gray-300'
              ]"></div>
              <span :class="[
                'text-xs font-medium',
                hasTickets ? 'text-green-600' : 'text-gray-500'
              ]">Tickets</span>
            </div>
            <Icon name="heroicons:chevron-right" class="w-3 h-3 text-gray-400" />
            <div class="flex items-center space-x-1">
              <div :class="[
                'w-3 h-3 rounded-full transition-all duration-300',
                eventData?.is_published ? 'bg-blue-500' : 'bg-gray-300'
              ]"></div>
              <span :class="[
                'text-xs font-medium',
                eventData?.is_published ? 'text-blue-600' : 'text-gray-500'
              ]">Published</span>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 items-stretch sm:items-center">
            <div class="bt-preview">
              <Button
                @click="handlePreview"
                :disabled="!isBasicInfoCompleted"
                :class="[
                  'w-full sm:w-40 lg:w-52 h-12 lg:h-14 p-3 lg:p-4 rounded-full flex items-center justify-center gap-2 transition-all duration-300 text-sm lg:text-base',
                  isBasicInfoCompleted
                    ? 'text-white bg-[#9E9E9E] hover:bg-[#8E8E8E] cursor-pointer'
                    : 'text-gray-400 bg-gray-200 cursor-not-allowed opacity-50'
                ]"
                raised
                :title="!isBasicInfoCompleted ? 'Complete and save Basic Info first to preview' : 'Preview your event'"
              >
                <template #default>
                  <Icon name="heroicons:eye" class="text-lg lg:text-2xl" />
                  <span>Preview</span>
                </template>
              </Button>
            </div>
            <div class="bt-saveDraft">
              <Button
                @click="handleSaveDraft"
                :disabled="isSubmitting"
                :class="[
                  'w-full sm:w-40 lg:w-52 h-12 lg:h-14 p-3 lg:p-4 rounded-full border-2 border-purple-800 flex items-center justify-center gap-2 transition-all duration-300 text-sm lg:text-base relative',
                  !isSubmitting
                    ? 'bg-white hover:bg-purple-50 cursor-pointer'
                    : 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-50'
                ]"
                raised
              >
                <template #default>
                  <Icon
                    v-if="!isSubmitting"
                    name="heroicons:document-arrow-down"
                    :class="[
                      'text-lg lg:text-2xl',
                      !isSubmitting ? 'text-purple-800' : 'text-gray-400'
                    ]"
                  />
                  <Icon
                    v-else
                    name="heroicons:arrow-path"
                    class="text-lg lg:text-2xl text-gray-400 animate-spin"
                  />
                  <span
                    :class="[
                      'font-semibold',
                      !isSubmitting
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent'
                        : 'text-gray-400'
                    ]"
                  >
                    {{ isSubmitting ? 'Saving...' : (isEditMode ? 'Update Draft' : 'Save Draft') }}
                  </span>
                </template>
              </Button>
            </div>
            <div class="bt-publishEvent">
              <Button
                @click="handlePublishEvent"
                :disabled="!canPublish || isSubmitting"
                :class="[
                  'w-full sm:w-40 lg:w-52 h-12 lg:h-14 p-3 lg:p-4 rounded-full flex items-center justify-center gap-2 transition-all duration-300 shadow-lg text-sm lg:text-base relative',
                  canPublish && !isSubmitting
                    ? 'text-white bg-gradient-to-t from-indigo-600 to-indigo-400 hover:from-indigo-700 hover:to-indigo-500 hover:shadow-xl cursor-pointer'
                    : 'text-gray-400 bg-gray-200 cursor-not-allowed opacity-50'
                ]"
                raised
                :title="getPublishButtonTitle"
              >
                <template #default>
                  <Icon
                    v-if="!isSubmitting"
                    name="heroicons:paper-airplane"
                    class="text-lg lg:text-2xl"
                  />
                  <Icon
                    v-else
                    name="heroicons:arrow-path"
                    class="text-lg lg:text-2xl animate-spin"
                  />
                  <span>{{ isSubmitting ? 'Publishing...' : (isEditMode ? 'Update & Publish' : 'Publish Event') }}</span>
                </template>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="min-h-0">
      <!-- Enhanced Tab Menu -->
      <div class="mb-4 lg:mb-6 w-full">
        <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 bg-gray-100 p-2 rounded-full">
          <button
            v-for="(item, index) in items"
            :key="index"
            @click="changeTab(index)"
            :disabled="isChangingTab || !isTabAccessible(index)"
            :class="[
              'flex-1 flex items-center justify-center gap-2 lg:gap-3 px-3 lg:px-6 py-3 lg:py-4 rounded-full font-semibold transition-all duration-300 ease-in-out text-sm lg:text-base relative',
              activeIndex === index
                ? 'bg-gradient-to-r from-blue-800 to-purple-600 text-white shadow-lg transform scale-105'
                : isTabAccessible(index)
                  ? 'text-gray-600 hover:text-purple-600 hover:bg-white hover:shadow-md cursor-pointer'
                  : 'text-gray-400 bg-gray-50 cursor-not-allowed opacity-60',
              isChangingTab ? 'opacity-50 cursor-not-allowed' : ''
            ]"
            :title="!isTabAccessible(index) ? 'Complete and save Basic Info first to access this tab' : ''"
          >
            <i :class="item.icon" class="text-base lg:text-lg"></i>
            <span class="hidden sm:inline">{{ item.label }}</span>
            <span class="sm:hidden">{{ item.shortLabel || item.label }}</span>

            <!-- Lock icon for disabled tabs -->
            <Icon
              v-if="!isTabAccessible(index)"
              name="heroicons:lock-closed"
              class="absolute -top-1 -right-1 text-xs bg-gray-300 text-gray-600 rounded-full p-1 w-5 h-5"
            />
          </button>
        </div>
      </div>

      <!-- Dynamic Content with Smooth Transitions -->
      <div class="relative overflow-hidden">
        <div
          :class="[
            'rounded-2xl lg:rounded-3xl transition-all duration-300 ease-in-out',
            activeIndex === 1 ? '' : 'bg-white shadow-lg p-3 lg:p-4'
          ]"
        >
          <!-- Render all components with smooth fade transitions -->
          <Transition
            name="tab-fade"
            mode="out-in"
            appear
          >
            <div
              :key="activeIndex"
              class="min-h-[300px] lg:min-h-[400px] relative"
            >
              <!-- Loading Overlay for Tab Content -->
              <div
                v-if="isChangingTab"
                class="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10"
              >
                <LoadingSpinner size="md" color="purple" text="Loading tab..." />
              </div>

              <div v-if="activeIndex === 0 && tabComponents[0]" class="tab-content">
                <BasicInfor />
              </div>
              <div v-else-if="activeIndex === 1 && tabComponents[1]" class="tab-content">
                <Agenda />
              </div>
              <div v-else-if="activeIndex === 2 && tabComponents[2]" class="tab-content">
                <TicketPacket />
              </div>
              <div v-else-if="activeIndex === 3 && tabComponents[3]" class="tab-content">
                <BreakoutRooms />
              </div>
              <div v-else-if="activeIndex === 4 && tabComponents[4]" class="tab-content">
                <SettingPolicy />
              </div>
              <div v-else class="tab-content flex items-center justify-center p-8">
                <LoadingSpinner size="lg" color="purple" text="Loading tab content..." />
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, provide, onMounted, onBeforeUnmount, computed } from 'vue'
// Icon is auto-imported by Nuxt
import Button from 'primevue/button'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import BasicInfor from '~/pages/admin/tabs/BasicInfor.vue'
import Agenda from '~/pages/admin/tabs/Agenda.vue'
import TicketPacket from '~/pages/admin/tabs/TicketPacket.vue'
import BreakoutRooms from '~/pages/admin/tabs/BreakoutRooms.vue'
import SettingPolicy from '~/pages/admin/tabs/SettingPolicy.vue'
import { useToast } from "primevue/usetoast"
import { useRouter, useRoute } from "vue-router"
import { useEventStore } from '~/composables/useEventStore'
import { useEventTabsStore } from '~/composables/useEventTabs'

const toast = useToast()
const router = useRouter()
const route = useRoute()
const tabsStore = useEventTabsStore()

// Tab Menu Items
const items = ref([
  { label: 'Basic Info', shortLabel: 'Info', icon: 'pi pi-info-circle' },
  { label: 'Agenda', shortLabel: 'Agenda', icon: 'pi pi-calendar' },
  { label: 'Ticket Package', shortLabel: 'Tickets', icon: 'pi pi-ticket' },
  { label: 'Breakout Room', shortLabel: 'Rooms', icon: 'pi pi-video' },
  { label: 'Setting & Policies', shortLabel: 'Settings', icon: 'pi pi-cog' }
])

// Active Tab Index
const activeIndex = ref(0)
const isChangingTab = ref(false)
const isLoading = ref(false)

// Event creation/editing state management
const isBasicInfoCompleted = ref(false)
const eventId = ref(null)
const isSubmitting = ref(false)
const eventData = ref(null)
const isEditMode = ref(false)

// Computed properties for publish button
const hasTickets = computed(() => {
  const eventStore = useEventStore()
  // Check multiple sources for tickets
  if (eventStore.tickets && eventStore.tickets.length > 0) {
    return true
  }
  if (eventStore.currentEvent?.ticket_types && eventStore.currentEvent.ticket_types.length > 0) {
    return true
  }
  // Check tab persistence for tickets
  const tabsStore = useEventTabsStore()
  const ticketTabData = tabsStore.getTabData(2) // Tickets tab
  if (ticketTabData.ticketTypes && ticketTabData.ticketTypes.length > 0) {
    return true
  }
  return false
})

// Enhanced computed properties for publish functionality
const canPublish = computed(() => {
  return isBasicInfoCompleted.value && eventId.value && hasTickets.value
})

const getPublishButtonTitle = computed(() => {
  if (!isBasicInfoCompleted.value || !eventId.value) {
    return 'Complete and save Basic Info first to publish'
  }
  if (!hasTickets.value) {
    return 'Create at least one ticket before publishing'
  }
  return 'Publish your event'
})

// Initialize state on mount
onMounted(async () => {
  console.log('🚀 Initializing CreateEvent page...')
  const eventStore = useEventStore()
  const { getToken } = useAuth()

  // Verify authentication
  const token = getToken()
  if (!token) {
    console.error('❌ No auth token found')
    router.push('/login')
    return
  }

  // Get parameters from route
  const queryEventId = route.query.id?.toString()
  const isEdit = route.query.mode === 'edit' && queryEventId
  const forceReload = route.query.ts || route.query.timestamp

  // Check if we're switching to a different event
  const currentStoredEventId = process.client ? sessionStorage.getItem('currentEventId') : null
  const isSwitchingEvents = isEdit && currentStoredEventId && currentStoredEventId !== queryEventId

  console.log('🔍 Event switching check:', {
    queryEventId,
    currentStoredEventId,
    isSwitchingEvents,
    isEdit
  })

  // ALWAYS clear state when switching events or starting fresh
  if (isSwitchingEvents || !isEdit) {
    console.log('🧹 Clearing all state (switching events or new creation)...')
    eventStore.clearCache()
    tabsStore.resetTabs()
    
    if (process.client) {
      localStorage.removeItem('currentEvent')
      localStorage.removeItem('eventData')
      localStorage.removeItem('editSession')
      if (!isEdit) {
        sessionStorage.removeItem('currentEventId')
      }
    }
    
    // Reset local state
    eventId.value = null
    isEditMode.value = false
    isBasicInfoCompleted.value = false
    eventData.value = null
  } else {
    // Just clear cache for same event reload
    eventStore.clearCache()
  }

  // UUID validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  
  // Handle EDIT MODE
  if (isEdit && queryEventId) {
    // Validate UUID format
    if (!uuidRegex.test(queryEventId)) {
      console.error('❌ Invalid UUID format:', queryEventId)
      toast.add({
        severity: 'error',
        summary: 'Invalid Event ID',
        detail: 'The event ID format is invalid',
        life: 5000
      })
      await router.replace({ path: '/admin/event' })
      return
    }

    // Store the current event ID
    if (process.client) {
      sessionStorage.setItem('currentEventId', queryEventId)
    }
    
    try {
      console.log('📝 EDIT MODE: Loading event data for ID:', queryEventId)

      eventId.value = queryEventId
      isEditMode.value = true

      // Force load fresh data from API
      console.log('🔄 Force loading fresh event data from API...')
      await eventStore.loadEventById(queryEventId)

      if (eventStore.currentEvent && eventStore.currentEvent.id === queryEventId) {
        eventData.value = { ...eventStore.currentEvent }
        isBasicInfoCompleted.value = true

        // Load event data into tab persistence system with fresh data
        tabsStore.loadEventData(eventStore.currentEvent)

        console.log('✅ Event data loaded for editing:', {
          id: eventId.value,
          name: eventData.value.name,
          ticketCount: eventStore.currentEvent.ticket_types?.length || 0,
          hasImages: {
            cover: !!eventData.value.cover_image_url,
            background: !!eventData.value.event_background_url,
            card: !!eventData.value.card_background_url
          }
        })

        toast.add({
          severity: 'success',
          summary: 'Event Loaded for Editing',
          detail: `Editing "${eventData.value.name}" - Data loaded instantly`,
          life: 3000
        })
      } else {
        throw new Error('Event data mismatch or not found')
      }
    } catch (error) {
      console.error('❌ Failed to load event for editing:', error)

      // Reset to new event creation mode
      eventId.value = null
      isBasicInfoCompleted.value = false
      isEditMode.value = false
      eventData.value = null
      
      // Clear event from store
      eventStore.clearCurrentEvent()
      tabsStore.resetTabs()

      toast.add({
        severity: 'error',
        summary: 'Edit Load Failed',
        detail: 'Failed to load event for editing. Starting fresh event creation.',
        life: 4000
      })
    }
  } else {
    // CREATE MODE
    console.log('🆕 CREATE MODE: Starting fresh event creation')
    
    isEditMode.value = false
    isBasicInfoCompleted.value = false
    eventId.value = null
    eventData.value = null
  }

  // Check for tab query parameter (from manage tickets - only in edit mode)
  if (route.query.tab === 'tickets' && isBasicInfoCompleted.value && isEditMode.value) {
    activeIndex.value = 2 // Ticket Package tab
    toast.add({
      severity: 'info',
      summary: 'Ticket Management',
      detail: 'You can now manage tickets for this event.',
      life: 3000
    })
  }
})

  // Clear event data when leaving the page
onBeforeUnmount(() => {
  console.log('🚪 Leaving CreateEvent page - cleaning up state')
  const eventStore = useEventStore()

  // Log current state before cleanup
  if (eventStore.currentEvent) {
    console.log('📝 Current event state:', {
      id: eventStore.currentEvent.id,
      name: eventStore.currentEvent.name,
      isPublished: eventStore.currentEvent.is_published
    })
  }

  // Clear all state storage
  eventStore.clearCache()
  
  // Reset all local state
  eventId.value = null
  isEditMode.value = false
  isBasicInfoCompleted.value = false
  eventData.value = null
  
  // Clear all local storage related to event editing
  if (process.client) {
    localStorage.removeItem('currentEvent')
    localStorage.removeItem('eventData')
    localStorage.removeItem('editSession')
  }

  // Remove query parameters
  if (route.query.id) {
    router.replace({
      path: route.path,
      query: {}
    })
  }
  
  console.log('✅ State cleanup complete')
})// Match tab index with component
const tabComponents = [
  BasicInfor,
  Agenda,
  TicketPacket,
  BreakoutRooms,
  SettingPolicy
]

// Provide state to child components
provide('eventCreationState', {
  isBasicInfoCompleted,
  eventId,
  eventData,
  isEditMode,
  setBasicInfoCompleted: (completed, id = null, data = null) => {
    console.log('🔄 Setting basic info completed:', { completed, id })
    const eventStore = useEventStore()

    isBasicInfoCompleted.value = completed
    if (id) {
      eventId.value = id
    }
    if (data) {
      try {
        // Update local state first
        eventData.value = data

        // Validate event data before setting in store
        if (!data.id || !data.name) {
          console.error('❌ Invalid event data:', data)
          return
        }

        // Update store state with normalized data
        const normalizedData = {
          ...data,
          id: data.id.toString()
        }
        
        console.log('📥 Updating store with event:', {
          id: normalizedData.id,
          name: normalizedData.name
        })
        
        // Update the store using setCurrentEvent action
        eventStore.setCurrentEvent(normalizedData)
      } catch (error) {
        console.error('❌ Failed to update event state:', error)
        toast.add({
          severity: 'error',
          summary: 'State Update Failed',
          detail: 'Failed to update event state. Please try again.',
          life: 3000
        })
      }
    }
  },
  updateEventData: (data) => {
    const eventStore = useEventStore()
    eventData.value = { ...eventData.value, ...data }
    eventStore.setCurrentEvent({ ...eventData.value, ...data })
  }
})

// Enhanced tab accessibility with API-based locking
const isTabAccessible = (index) => {
  // Basic Info is always accessible
  if (index === 0) return true
  
  // All other tabs require Basic Info to be completed and saved first
  if (!isBasicInfoCompleted.value || !eventId.value) {
    console.log(`🔒 Tab ${index} locked - Basic Info not completed:`, {
      isBasicInfoCompleted: isBasicInfoCompleted.value,
      hasEventId: !!eventId.value
    })
    return false
  }
  
  // Tab-specific accessibility rules with API availability check
  switch (index) {
    case 1: // Agenda tab - LOCKED (No API implementation yet)
      console.log(`🔒 Tab ${index} (Agenda) locked - API not implemented`)
      return false
      
    case 2: // Ticket Package tab - UNLOCKED (Has full API support)
      console.log(`🔓 Tab ${index} (Tickets) unlocked - Basic Info completed & API available`)
      return true
      
    case 3: // Breakout Rooms tab - LOCKED (No API implementation yet)
      console.log(`🔒 Tab ${index} (Breakout Rooms) locked - API not implemented`)
      return false
      
    case 4: // Settings & Policies tab - LOCKED (No API implementation yet)
      console.log(`🔒 Tab ${index} (Settings) locked - API not implemented`)
      return false
      
    default:
      console.log(`🔒 Tab ${index} not recognized`)
      return false
  }
}

// Enhanced tab switching with comprehensive data persistence
const changeTab = async (index) => {
  // Prevent rapid tab switching
  if (isChangingTab.value) return

  // Check if tab is accessible
  if (!isTabAccessible(index)) {
    if (index === 0) return // Basic Info should always be accessible
    
    // Provide specific messages for different locked tabs
    let message = 'Please complete and save the Basic Info section first to unlock other tabs.'
    let summary = 'Complete Basic Info First'
    
    // Specific messages for API-locked tabs
    if (isBasicInfoCompleted.value && eventId.value) {
      switch (index) {
        case 1: // Agenda
          message = 'Agenda management is coming soon. This feature is currently under development.'
          summary = 'Feature Coming Soon'
          break
        case 3: // Breakout Rooms
          message = 'Breakout Room management is coming soon. This feature is currently under development.'
          summary = 'Feature Coming Soon'
          break
        case 4: // Settings
          message = 'Settings & Policies management is coming soon. This feature is currently under development.'
          summary = 'Feature Coming Soon'
          break
      }
    }
    
    toast.add({
      severity: 'warn',
      summary: summary,
      detail: message,
      life: 4000
    })
    return
  }

  if (index >= 0 && index <script (tabComponents.length && activeIndex.value !== index)) {
    isChangingTab.value = true
    isLoading.value = true

    try {
      // Save current tab data before switching
      const currentTabIndex = activeIndex.value
      console.log(`💾 Saving data for tab ${currentTabIndex} before switching`)
      
      // Auto-save current tab data
      await saveCurrentTabData()
      
      // Mark current tab as having unsaved changes if needed
      if (tabsStore.hasUnsavedChanges(currentTabIndex)) {
        console.log(`📝 Tab ${currentTabIndex} has unsaved changes`)
      }

      // Use nextTick to ensure DOM is ready
      await nextTick()

      // Simulate loading time for smooth transition
      await new Promise(resolve => setTimeout(resolve, 300))

      // Update active tab in both local state and tab store
      const previousTab = activeIndex.value
      activeIndex.value = index
      tabsStore.setActiveTab(index)
      
      console.log(`📑 Switched from tab ${previousTab} to tab ${index}:`, items.value[index].label)
      
      // Check if new tab has saved data to restore
      const tabData = tabsStore.getTabData(index)
      const hasData = Object.keys(tabData).length > 0
      const lastSaved = tabData.lastSaved
      
      // Show appropriate notification
      if (hasData && lastSaved) {
        const savedTime = new Date(lastSaved).toLocaleTimeString()
        toast.add({
          severity: 'success',
          summary: 'Data Restored ✨',
          detail: `Your previous work has been restored (last saved: ${savedTime})`,
          life: 3000
        })
      } else if (index > 0 && isBasicInfoCompleted.value) {
        // Show welcome message for unlocked tabs
        const tabNames = ['Basic Info', 'Agenda', 'Tickets', 'Breakout Rooms', 'Settings']
        toast.add({
          severity: 'info',
          summary: `${tabNames[index]} Tab Unlocked! 🔓`,
          detail: 'You can now configure this section of your event.',
          life: 2500
        })
      }
      
      // Load any existing data for this tab from the event store
      if (isBasicInfoCompleted.value && eventId.value) {
        await loadTabSpecificData(index)
      }
      
    } catch (error) {
      console.error('Tab change error:', error)
      toast.add({
        severity: 'error',
        summary: 'Tab Switch Error',
        detail: 'There was an issue switching tabs. Please try again.',
        life: 3000
      })
    } finally {
      // Reset the flags after a short delay
      setTimeout(() => {
        isChangingTab.value = false
        isLoading.value = false
      }, 150)
    }
  }
}

// Load tab-specific data from API when switching tabs
const loadTabSpecificData = async (tabIndex) => {
  if (!eventId.value) return
  
  try {
    const eventStore = useEventStore()
    
    switch (tabIndex) {
      case 2: // Tickets tab
        console.log('🎫 Loading ticket data for tab switch')
        // Trigger ticket data reload in the TicketPacket component
        window.dispatchEvent(new CustomEvent('loadTicketData', {
          detail: { eventId: eventId.value }
        }))
        break
        
      case 1: // Agenda tab
        console.log('📅 Loading agenda data for tab switch')
        // Load agenda data if available
        if (eventStore.currentEvent?.agendas) {
          tabsStore.saveTabData(1, {
            sessions: eventStore.currentEvent.agendas,
            loadedAt: new Date().toISOString()
          })
        }
        break
        
      case 3: // Breakout Rooms tab
        console.log('🏢 Loading breakout rooms data for tab switch')
        // Load rooms data if available
        break
        
      case 4: // Settings tab
        console.log('⚙️ Loading settings data for tab switch')
        // Load settings data if available
        break
    }
  } catch (error) {
    console.warn(`Failed to load data for tab ${tabIndex}:`, error)
  }
}

// Enhanced Save Draft button - IMPROVED GLOBAL FUNCTIONALITY
const handleSaveDraft = async () => {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  
//   try {
    // Always save current tab data first
    // await saveCurrentTabData()
    
    // If we're on Basic Info tab and it's not completed yet, trigger basic info save
    // if (activeIndex.value === 0 && (!isBasicInfoCompleted.value || !eventId.value)) {
}
</script>