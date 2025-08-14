<template>
  <div class="p-4 lg:p-6 bg-[#F8F8FF]">
    <div class="mb-4 lg:mb-6">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 class="text-xl lg:text-3xl text-gray-400 mb-2">
            Event / <span class="text-xl lg:text-3xl font-bold text-[#7A49C9]">{{ isEditMode ? 'Edit Event' : 'Create Event' }}</span>
          </h1>
          <p v-if="isEditMode && eventData" class="text-sm text-gray-500">
            Editing: {{ eventData.name }}
          </p>
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
                'w-full sm:w-40 lg:w-52 h-12 lg:h-14 p-3 lg:p-4 rounded-full border-2 border-purple-800 flex items-center justify-center gap-2 transition-all duration-300 text-sm lg:text-base',
                !isSubmitting
                  ? 'bg-white hover:bg-purple-50 cursor-pointer'
                  : 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-50'
              ]"
              raised
            >
              <template #default>
                <Icon
                  name="heroicons:document-arrow-down"
                  :class="[
                    'text-lg lg:text-2xl',
                    !isSubmitting ? 'text-purple-800' : 'text-gray-400'
                  ]"
                />
                <span
                  :class="[
                    'font-semibold',
                    !isSubmitting
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent'
                      : 'text-gray-400'
                  ]"
                >
                  {{ isEditMode ? 'Update Draft' : 'Save Draft' }}
                </span>
              </template>
            </Button>
          </div>
          <div class="bt-publishEvent">
            <Button
              @click="handlePublishEvent"
              :disabled="activeIndex !== 0 || isSubmitting"
              :class="[
                'w-full sm:w-40 lg:w-52 h-12 lg:h-14 p-3 lg:p-4 rounded-full flex items-center justify-center gap-2 transition-all duration-300 shadow-lg text-sm lg:text-base',
                activeIndex === 0 && !isSubmitting
                  ? 'text-white bg-gradient-to-t from-indigo-600 to-indigo-400 hover:from-indigo-700 hover:to-indigo-500 hover:shadow-xl cursor-pointer'
                  : 'text-gray-400 bg-gray-200 cursor-not-allowed opacity-50'
              ]"
              raised
            >
              <template #default>
                <Icon name="heroicons:paper-airplane" class="text-lg lg:text-2xl" />
                <span>{{ isEditMode ? 'Update & Publish' : 'Publish Event' }}</span>
              </template>
            </Button>
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
import { ref, nextTick, provide, onMounted, onBeforeUnmount } from 'vue'
// Icon is auto-imported by Nuxt
import Button from 'primevue/button'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import BasicInfor from '~/pages/admin/tabs/BasicInfor.vue'
import Agenda from '~/pages/admin/tabs/Agenda.vue'
import TicketPacket from '~/pages/admin/tabs/TicketPacket.vue'
import BreakoutRooms from '~/pages/admin/tabs/BreakoutRooms.vue'
import SettingPolicy from '~/pages/admin/tabs/SettingPolicy.vue'
import { useToast } from "primevue/usetoast"
import { useRouter, useRoute } from "vue-router"
import { useEventStore } from '~/composables/useEventStore'

const toast = useToast()
const router = useRouter()
const route = useRoute()

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

// Initialize state on mount
onMounted(async () => {
  console.log('🚀 Initializing CreateEvent page...')
  const eventStore = useEventStore()

  // Determine if we're in edit mode from the query parameters
  const isEdit = route.query.mode === 'edit'
  const queryEventId = route.query.id?.toString()

  if (isEdit && queryEventId) {
    // EDIT MODE
    try {
      console.log('📝 EDIT MODE: Loading event data for ID:', queryEventId)

      eventId.value = queryEventId
      isEditMode.value = true

      // Event data should already be in store, but if not, load it
      if (!eventStore.currentEvent) {
        await eventStore.loadEventById(queryEventId)
      }

      if (eventStore.currentEvent) {
        eventData.value = { ...eventStore.currentEvent }
        isBasicInfoCompleted.value = true

        console.log('✅ Event data loaded for editing:', {
          id: eventId.value,
          name: eventData.value.name
        })

        toast.add({
          severity: 'success',
          summary: 'Event Loaded for Editing',
          detail: `Editing "${eventData.value.name}"`,
          life: 3000
        })
      } else {
        throw new Error('No event data received')
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
    
    // Clear event store
    eventStore.clearCurrentEvent()
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
  console.log('🚪 Leaving CreateEvent page - clearing event store')
  const eventStore = useEventStore()
  eventStore.clearCurrentEvent()
})

// Match tab index with component
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
      eventData.value = data
      eventStore.setCurrentEvent(data)
    }
  },
  updateEventData: (data) => {
    const eventStore = useEventStore()
    eventData.value = { ...eventData.value, ...data }
    eventStore.setCurrentEvent({ ...eventData.value, ...data })
  }
})

// Check if tab is accessible - STRICT FLOW CONTROL
const isTabAccessible = (index) => {
  // Basic Info is always accessible
  if (index === 0) return true
  
  // All other tabs require Basic Info to be completed first
  if (!isBasicInfoCompleted.value) return false
  
  // Only Ticket Package is accessible after Basic Info is saved
  if (index === 2) return true
  
  // Lock other tabs for now (Agenda, BreakoutRooms, SettingPolicy)
  return false
}

// Methods
const changeTab = async (index) => {
  // Prevent rapid tab switching
  if (isChangingTab.value) return

  // Check if tab is accessible
  if (!isTabAccessible(index)) {
    if (index === 0) return // Basic Info should always be accessible
    
    toast.add({
      severity: 'warn',
      summary: 'Save Basic Info First',
      detail: 'Please complete and save the Basic Info section before accessing other tabs.',
      life: 4000
    })
    return
  }

  if (index >= 0 && index < tabComponents.length && activeIndex.value !== index) {
    isChangingTab.value = true
    isLoading.value = true

    try {
      // Use nextTick to ensure DOM is ready
      await nextTick()

      // Simulate loading time for smooth transition
      await new Promise(resolve => setTimeout(resolve, 200))

      activeIndex.value = index
      
      console.log('📑 Switched to tab:', items.value[index].label)
    } catch (error) {
      console.error('Tab change error:', error)
    } finally {
      // Reset the flags after a short delay
      setTimeout(() => {
        isChangingTab.value = false
        isLoading.value = false
      }, 100)
    }
  }
}

// Handle Save Draft button - CONTEXT AWARE
const handleSaveDraft = async () => {
  // Trigger save draft based on current tab
  if (activeIndex.value === 0) {
    // BasicInfo tab - this will enable other tabs after success
    window.dispatchEvent(new CustomEvent('saveDraft'))
  } else if (activeIndex.value === 2 && isBasicInfoCompleted.value) {
    // TicketPacket tab - only available after Basic Info is saved
    window.dispatchEvent(new CustomEvent('saveTickets'))
  } else {
    // Other tabs - generic save (currently disabled)
    toast.add({
      severity: 'warn',
      summary: 'Save Basic Info First',
      detail: 'Please complete and save Basic Info before saving other sections.',
      life: 4000
    })
  }
}

// Handle Publish Event button - ONLY FROM BASIC INFO
const handlePublishEvent = async () => {
  if (activeIndex.value !== 0) {
    toast.add({
      severity: 'info',
      summary: 'Switch to Basic Info',
      detail: 'Please go to Basic Info tab to publish your event.',
      life: 3000
    })
    return
  }

  // Trigger publish event in BasicInfo component
  window.dispatchEvent(new CustomEvent('publishEvent'))
}

// Handle Preview button - REQUIRES SAVED EVENT
const handlePreview = () => {
  if (!isBasicInfoCompleted.value) {
    toast.add({
      severity: 'warn',
      summary: 'Save Basic Info First',
      detail: 'Please complete and save the Basic Info section before previewing the event.',
      life: 4000
    })
    return
  }

  if (!eventId.value) {
    toast.add({
      severity: 'error',
      summary: 'No Event Found',
      detail: 'Event ID not found. Please save the event first.',
      life: 3000
    })
    return
  }

  // Navigate to preview page with event ID
  router.push(`/admin/PreviewEvent/${eventId.value}`)
}

definePageMeta({
  layout: "admin",
})
</script>

<style scoped>
/* Smooth Tab Fade Transitions */
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(15px) scale(0.98);
}

.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-15px) scale(0.98);
}

.tab-fade-enter-to,
.tab-fade-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Tab content animation */
.tab-content {
  animation: slideInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced Button Styles */
.bt-preview button:hover {
  transform: translateY(-2px);
  transition: all 0.2s ease-in-out;
}

.bt-saveDraft button:hover {
  transform: translateY(-2px);
  border-color: #6b21a8;
  transition: all 0.2s ease-in-out;
}

/* Tab button smooth transitions */
button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

button:hover {
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}

/* Container smooth transitions */
.rounded-3xl {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.bt-publishEvent button:hover {
  transform: translateY(-2px);
}

/* Custom gradient for text */
.bg-custom-gradient {
  background: linear-gradient(135deg, #7c3aed, #3b82f6);
}

/* Smooth transitions for all interactive elements */
* {
  transition-property: transform, box-shadow, background-color, border-color, color, opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Active tab indicator animation */
@keyframes activeTab {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1.05);
  }
}

/* Loading state for tab content */
.tab-loading {
  opacity: 0.7;
  pointer-events: none;
}
</style>