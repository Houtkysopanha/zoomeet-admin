<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-800 flex items-center">
        <Icon name="heroicons:clipboard-document-list" class="w-5 h-5 mr-2 text-purple-600" />
        Event Status
      </h3>
      <div class="flex items-center space-x-2">
        <div :class="[
          'px-3 py-1 rounded-full text-xs font-medium',
          overallStatus === 'complete' ? 'bg-green-100 text-green-800' :
          overallStatus === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-600'
        ]">
          {{ overallStatusText }}
        </div>
        <Button
          @click="toggleExpanded"
          :class="[
            'p-2 rounded-full transition-all duration-200',
            isExpanded ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'
          ]"
          size="small"
          text
        >
          <Icon :name="isExpanded ? 'heroicons:chevron-up' : 'heroicons:chevron-down'" class="w-4 h-4" />
        </Button>
      </div>
    </div>

    <!-- Compact Status Bar -->
    <div v-if="!isExpanded" class="flex items-center space-x-4">
      <div class="flex-1 bg-gray-200 rounded-full h-2">
        <div 
          :class="[
            'h-2 rounded-full transition-all duration-500',
            overallStatus === 'complete' ? 'bg-green-500' :
            overallStatus === 'in-progress' ? 'bg-yellow-500' :
            'bg-gray-400'
          ]"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
      <span class="text-sm font-medium text-gray-600">{{ progressPercentage }}%</span>
    </div>

    <!-- Detailed Status -->
    <div v-else class="space-y-3">
      <div 
        v-for="(step, index) in statusSteps" 
        :key="index"
        class="flex items-center justify-between p-3 rounded-xl transition-all duration-200"
        :class="[
          step.status === 'completed' ? 'bg-green-50 border border-green-200' :
          step.status === 'in-progress' ? 'bg-yellow-50 border border-yellow-200' :
          step.status === 'skipped' ? 'bg-blue-50 border border-blue-200' :
          step.status === 'blocked' ? 'bg-red-50 border border-red-200' :
          'bg-gray-50 border border-gray-200'
        ]"
      >
        <div class="flex items-center space-x-3">
          <div :class="[
            'w-8 h-8 rounded-full flex items-center justify-center',
            step.status === 'completed' ? 'bg-green-500 text-white' :
            step.status === 'in-progress' ? 'bg-yellow-500 text-white' :
            step.status === 'skipped' ? 'bg-blue-500 text-white' :
            step.status === 'blocked' ? 'bg-red-500 text-white' :
            'bg-gray-300 text-gray-600'
          ]">
            <Icon 
              :name="
                step.status === 'completed' ? 'heroicons:check' :
                step.status === 'in-progress' ? 'heroicons:clock' :
                step.status === 'skipped' ? 'heroicons:forward' :
                step.status === 'blocked' ? 'heroicons:x-mark' :
                'heroicons:minus'
              " 
              class="w-4 h-4" 
            />
          </div>
          <div>
            <h4 :class="[
              'font-medium',
              step.status === 'completed' ? 'text-green-800' :
              step.status === 'in-progress' ? 'text-yellow-800' :
              step.status === 'skipped' ? 'text-blue-800' :
              step.status === 'blocked' ? 'text-red-800' :
              'text-gray-600'
            ]">
              {{ step.title }}
            </h4>
            <p :class="[
              'text-sm',
              step.status === 'completed' ? 'text-green-600' :
              step.status === 'in-progress' ? 'text-yellow-600' :
              step.status === 'skipped' ? 'text-blue-600' :
              step.status === 'blocked' ? 'text-red-600' :
              'text-gray-500'
            ]">
              {{ step.description }}
            </p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <Button
            v-if="step.action && step.actionEnabled"
            @click="step.action"
            :class="[
              'px-3 py-1 text-xs font-medium rounded-full transition-all duration-200',
              step.status === 'completed' ? 'bg-green-600 text-white hover:bg-green-700' :
              step.status === 'in-progress' ? 'bg-yellow-600 text-white hover:bg-yellow-700' :
              step.status === 'skipped' ? 'bg-blue-600 text-white hover:bg-blue-700' :
              'bg-purple-600 text-white hover:bg-purple-700'
            ]"
            size="small"
          >
            {{ step.actionText }}
          </Button>
          <div v-if="step.lastUpdated" class="text-xs text-gray-400">
            {{ formatTime(step.lastUpdated) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div v-if="isExpanded && quickActions.length > 0" class="mt-4 pt-4 border-t border-gray-200">
      <h4 class="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
      <div class="flex flex-wrap gap-2">
        <Button
          v-for="action in quickActions"
          :key="action.key"
          @click="action.handler"
          :disabled="!action.enabled"
          :class="[
            'px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200',
            action.primary ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
          size="small"
        >
          <Icon :name="action.icon" class="w-3 h-3 mr-1" />
          {{ action.text }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, watch } from 'vue'
import Button from 'primevue/button'
import { useEventStore } from '~/composables/useEventStore'
import { useEventTabsStore } from '~/composables/useEventTabs'

const props = defineProps({
  eventId: String,
  isEditMode: Boolean
})

const emit = defineEmits(['switchTab', 'saveTab', 'publishEvent'])

const eventStore = useEventStore()
const tabsStore = useEventTabsStore()
const eventCreationState = inject('eventCreationState')

const isExpanded = ref(false)

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// Computed status steps
const statusSteps = computed(() => {
  const basicInfoData = tabsStore.getTabData(0)
  const agendaData = tabsStore.getTabData(1)
  const ticketData = tabsStore.getTabData(2)
  const settingsData = tabsStore.getTabData(4)
  
  const isBasicInfoComplete = eventCreationState?.isBasicInfoCompleted?.value || false
  const hasEventId = eventCreationState?.eventId?.value || props.eventId
  const isPublished = eventStore.currentEvent?.is_published
  
  return [
    {
      title: 'Basic Information',
      description: isBasicInfoComplete 
        ? `Event "${eventStore.currentEvent?.name || 'Unnamed'}" saved successfully`
        : 'Complete event name, category, dates, and location',
      status: isBasicInfoComplete ? 'completed' : 'in-progress',
      lastUpdated: basicInfoData.lastSaved,
      action: () => emit('switchTab', 0),
      actionText: isBasicInfoComplete ? 'Edit' : 'Complete',
      actionEnabled: true,
      isRequired: true
    },
    {
      title: 'Event Agenda',
      description: agendaData.isSkipped 
        ? 'Agenda skipped - event will be published without schedule'
        : agendaData.sessions?.length > 0
          ? `${agendaData.sessions.length} agenda item(s) created`
          : 'Add event schedule or skip if not needed',
      status: agendaData.isSkipped 
        ? 'skipped' 
        : agendaData.sessions?.length > 0 
          ? 'completed' 
          : hasEventId ? 'in-progress' : 'blocked',
      lastUpdated: agendaData.lastSaved,
      action: () => emit('switchTab', 1),
      actionText: agendaData.isSkipped ? 'Add Agenda' : agendaData.sessions?.length > 0 ? 'Edit' : 'Create',
      actionEnabled: hasEventId,
      isRequired: false
    },
    {
      title: 'Ticket Packages',
      description: ticketData.ticketTypes?.length > 0
        ? `${ticketData.ticketTypes.length} ticket type(s) configured`
        : 'Create ticket types and pricing',
      status: ticketData.ticketTypes?.length > 0 
        ? 'completed' 
        : hasEventId ? 'in-progress' : 'blocked',
      lastUpdated: ticketData.lastSaved,
      action: () => emit('switchTab', 2),
      actionText: ticketData.ticketTypes?.length > 0 ? 'Edit' : 'Create',
      actionEnabled: hasEventId,
      isRequired: true
    },
    {
      title: 'Settings & Policies',
      description: (settingsData.termsAndConditions || settingsData.registrationDeadline)
        ? 'Event policies and settings configured successfully'
        : 'Configure registration policies, terms and conditions',
      status: (settingsData.termsAndConditions || settingsData.registrationDeadline)
        ? 'completed' 
        : hasEventId ? 'in-progress' : 'blocked',
      lastUpdated: settingsData.lastSaved,
      action: () => emit('switchTab', 4),
      actionText: (settingsData.termsAndConditions || settingsData.registrationDeadline) ? 'Edit' : 'Configure',
      actionEnabled: hasEventId,
      isRequired: false
    },
    {
      title: 'Event Publishing',
      description: isPublished
        ? 'Event is live and visible to attendees'
        : 'Publish event to make it available for booking',
      status: isPublished 
        ? 'completed' 
        : (isBasicInfoComplete && ticketData.ticketTypes?.length > 0) 
          ? 'in-progress' 
          : 'blocked',
      lastUpdated: eventStore.currentEvent?.updated_at,
      action: () => emit('publishEvent'),
      actionText: isPublished ? 'Published' : 'Publish',
      actionEnabled: isBasicInfoComplete && ticketData.ticketTypes?.length > 0 && !isPublished,
      isRequired: true
    }
  ]
})

// Overall status computation
const overallStatus = computed(() => {
  const isPublished = eventStore.currentEvent?.is_published
  
  // If event is published, it's considered complete regardless of other steps
  if (isPublished) return 'complete'
  
  const steps = statusSteps.value
  // Only consider functional steps that are released (exclude blocked steps)
  const functionalSteps = steps.filter(s => s.status !== 'blocked')
  const completedSteps = functionalSteps.filter(s => s.status === 'completed' || s.status === 'skipped').length
  const totalSteps = functionalSteps.length
  
  if (totalSteps === 0) return 'pending'
  if (completedSteps === totalSteps) return 'complete'
  if (completedSteps > 0) return 'in-progress'
  return 'pending'
})

const overallStatusText = computed(() => {
  const isPublished = eventStore.currentEvent?.is_published
  
  if (isPublished) return 'Published & Complete'
  
  switch (overallStatus.value) {
    case 'complete': return 'Ready to Publish'
    case 'in-progress': return 'In Progress'
    default: return 'Getting Started'
  }
})

const progressPercentage = computed(() => {
  const isPublished = eventStore.currentEvent?.is_published
  
  // If event is published, always show 100% progress
  if (isPublished) return 100
  
  const steps = statusSteps.value
  // Only consider functional steps that are released (exclude blocked steps)
  const functionalSteps = steps.filter(s => s.status !== 'blocked')
  const completedSteps = functionalSteps.filter(s => s.status === 'completed' || s.status === 'skipped').length
  return functionalSteps.length > 0 ? Math.round((completedSteps / functionalSteps.length) * 100) : 0
})

// Quick actions
const quickActions = computed(() => {
  const actions = []
  const basicInfoComplete = eventCreationState?.isBasicInfoCompleted?.value || false
  const hasTickets = tabsStore.getTabData(2).ticketTypes?.length > 0
  const hasSettings = tabsStore.getTabData(4).termsAndConditions || tabsStore.getTabData(4).registrationDeadline
  const isPublished = eventStore.currentEvent?.is_published
  
  if (!basicInfoComplete) {
    actions.push({
      key: 'complete-basic',
      text: 'Complete Basic Info',
      icon: 'heroicons:document-text',
      handler: () => emit('switchTab', 0),
      enabled: true,
      primary: true
    })
  }
  
  if (basicInfoComplete && !hasTickets) {
    actions.push({
      key: 'create-tickets',
      text: 'Create Tickets',
      icon: 'heroicons:ticket',
      handler: () => emit('switchTab', 2),
      enabled: true,
      primary: true
    })
  }
  
  if (basicInfoComplete && !hasSettings) {
    actions.push({
      key: 'configure-settings',
      text: 'Configure Settings',
      icon: 'heroicons:cog-6-tooth',
      handler: () => emit('switchTab', 4),
      enabled: true,
      primary: false
    })
  }
  
  if (basicInfoComplete && hasTickets && !isPublished) {
    actions.push({
      key: 'publish-event',
      text: 'Publish Event',
      icon: 'heroicons:paper-airplane',
      handler: () => emit('publishEvent'),
      enabled: true,
      primary: true
    })
  }
  
  if (basicInfoComplete) {
    actions.push({
      key: 'save-draft',
      text: 'Save Draft',
      icon: 'heroicons:document-arrow-down',
      handler: () => emit('saveTab'),
      enabled: true,
      primary: false
    })
  }
  
  if (basicInfoComplete && eventCreationState?.eventId?.value) {
    actions.push({
      key: 'add-agenda',
      text: 'Add Agenda',
      icon: 'heroicons:calendar-days',
      handler: () => emit('switchTab', 1),
      enabled: true,
      primary: false
    })
  }
  
  return actions
})
</script>

<style scoped>
.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>