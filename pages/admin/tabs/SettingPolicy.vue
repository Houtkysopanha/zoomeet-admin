<template>
  <div class="mx-auto ">
    <h2 class="text-lg font-semibold">Setting & Policies</h2>
    <p class="text-gray-400 mb-6">Configure additional event options and preferences</p>

    <div class="">
      <!-- Registration Deadline and Refund Policy Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Registration Deadline</label>
          <Calendar
            v-model="settings.registrationDeadline"
            showIcon
            placeholder="31/07/2025"
            iconDisplay="input"
            class="w-full"
            dateFormat="dd/mm/yy"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Refund Policy</label>
          <Dropdown
            v-model="settings.refundPolicyOption"
            :options="refundPolicyOptions"
            placeholder="Select Refund policy"
            class="w-full"
          />
        </div>
      </div>

      <!-- Max Tickets Per Person and Ticket Transfer Deadline Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Max Tickets Per Person</label>
          <InputNumber
            v-model="settings.maxTicketPerPerson"
            :min="1"
            :max="50"
            placeholder="10"
            class="w-full"
          />
          <small class="text-gray-500">Limit how many tickets one person can purchase</small>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Ticket transfer deadline</label>
          <Calendar
            v-model="settings.ticketTransferDeadline"
            showIcon
            placeholder="31/07/2025"
            iconDisplay="input"
            class="w-full"
            dateFormat="dd/mm/yy"
          />
        </div>
      </div>

      <!-- QR Code Available -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">QR code available</label>
        <div class="space-y-2">
          <Dropdown
            v-model="settings.qrcodeAvailableHours"
            :options="qrcodeAvailableOptions"
            placeholder="48 hours before event starts"
            class="w-full"
          />
          <div v-if="settings.qrcodeAvailableHours === 'Custom QR code available'" class="mt-2">
            <div class="flex items-center space-x-2">
              <InputNumber
                v-model="settings.customQrcodeHours"
                :min="1"
                :max="8760"
                placeholder="168"
                class="flex-1"
              />
            </div>
            <small class="text-gray-500">Enter custom hours (1 week = 168 hours)</small>
          </div>
        </div>
      </div>

      <!-- Terms and Conditions -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Terms and Conditions</label>
        <Textarea
          v-model="settings.termsAndConditions"
          class="w-full p-3 bg-gray-100 rounded-2xl"
          placeholder="Enter terms and conditions for attendees..."
          rows="4"
        />
      </div>

      <!-- Special Instructions -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
        <Textarea
          v-model="settings.specialInstructions"
          class="w-full p-3 bg-gray-100 rounded-2xl"
          placeholder="Any special instructions for attendees..."
          rows="4"
        />
      </div>
      <div class="border border-gray-200 my-10"></div>

      <!-- Accept Cash Payment -->
      <div class="mb-6">
        <div class="flex items-center">
          <Checkbox v-model="settings.acceptCashPayment" :binary="true" inputId="acceptCash" />
          <label for="acceptCash" class="ml-2 font-medium text-gray-700">
            Accept cash payment
          </label>
        </div>
      </div>

      <div class="border border-gray-200 my-10"></div>

      <!-- Age Verification and Identity Document Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <div>
          <div class="flex items-center mb-4">
            <Checkbox v-model="settings.requireAgeVerification" :binary="true" inputId="ageVerification" />
            <label for="ageVerification" class="ml-2 font-medium text-gray-700">
              Require age verification for this event
            </label>
          </div>
          
          <div v-if="settings.requireAgeVerification">
            <label class="block text-sm font-medium text-gray-700 mb-2">Minimum Age</label>
            <Dropdown
              v-model="settings.minimumAgeOptions"
              :options="minimumAgeOptions"
              placeholder="18 years old"
              class="w-full"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Require Identity Document <span class="text-red-600">(Can be tick only1)</span></label>
          <div class="grid grid-cols-2 gap-2">
            <div v-for="doc in identityDocumentOptions" :key="doc.value" class="flex items-center">
              <Checkbox v-model="settings.requiredIdentityDocuments" :value="doc.value" :inputId="doc.value" />
              <label :for="doc.value" class="ml-2 text-sm font-medium text-gray-700">{{ doc.label }}</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, inject } from 'vue'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import Textarea from 'primevue/textarea'
import Checkbox from 'primevue/checkbox'
import InputNumber from 'primevue/inputnumber'
import { useToast } from "primevue/usetoast"
import { getEventSettings, saveEventSettings } from '~/composables/api'
import { useEventTabsStore } from '~/composables/useEventTabs'

// Component props (for consistency with other tabs)
const props = defineProps(['eventId'])

const toast = useToast()
const tabsStore = useEventTabsStore()

// Event ID can come from props (like Agenda) or from injected context
const currentEventId = ref(null)

// Get event context from parent component (fallback)
const eventCreationState = inject('eventCreationState', {
  isBasicInfoCompleted: ref(false),
  eventId: ref(null),
  eventData: ref(null),
  isEditMode: ref(false)
})

const { isEditMode } = eventCreationState

const settings = ref({
  registrationDeadline: null,
  refundPolicyOption: null,
  maxTicketPerPerson: 5,
  ticketTransferDeadline: null,
  qrcodeAvailableHours: '48 hours before event starts',
  customQrcodeHours: 168, // Default to 1 week (168 hours)
  termsAndConditions: '',
  specialInstructions: '',
  acceptCashPayment: false,
  requireAgeVerification: false,
  minimumAgeOptions: null,
  requiredIdentityDocuments: []
})

const refundPolicyOptions = ref([
  'Refund', 'Not Refund',
])

const minimumAgeOptions = ref([
  '16 years old', '17 years old', '18 years old', '19 years old', '20 years old', '21 years old'
])

const qrcodeAvailableOptions = ref([
  '24 hours before event starts',
  '48 hours before event starts', 
  '72 hours before event starts',
  'Custom QR code available'
])

const identityDocumentOptions = ref([
  { label: 'Driver\'s License', value: 'driver_license' },
  { label: 'National ID Card', value: 'national_id_card' },
  { label: 'Passport', value: 'passport' },
  { label: 'Student Card', value: 'student_card' }
])

// State management
const isSaving = ref(false)

// Check if settings are complete for tab validation
const areSettingsComplete = computed(() => {
  return !!(
    settings.value.registrationDeadline &&
    settings.value.refundPolicyOption &&
    settings.value.termsAndConditions &&
    settings.value.maxTicketPerPerson
  )
})

// Load settings from API
const loadSettingsFromAPI = async () => {
  if (!currentEventId.value || !isEditMode.value) return

  try {
    console.log('🔄 Loading settings from API for event:', currentEventId.value)
    const response = await getEventSettings(currentEventId.value)
    
    if (response && response.data) {
      const apiData = response.data
      
      // Helper function to safely parse dates from API
      const parseAPIDate = (dateString) => {
        if (!dateString) return null
        
        try {
          // Handle different date formats from API
          let dateToParse = dateString
          if (typeof dateString === 'string') {
            // Add Z suffix if not present to ensure UTC parsing
            if (!dateString.includes('Z') && !dateString.includes('+')) {
              dateToParse = dateString + 'Z'
            }
          }
          
          const parsedDate = new Date(dateToParse)
          
          // Check if date is valid
          if (isNaN(parsedDate.getTime())) {
            console.warn('⚠️ Invalid date from API:', dateString)
            return null
          }
          
          return parsedDate
        } catch (error) {
          console.error('❌ Date parsing error:', error, 'for date:', dateString)
          return null
        }
      }
      
      // Map API data to component format
      settings.value = {
        registrationDeadline: parseAPIDate(apiData.registration_dateline),
        refundPolicyOption: apiData.refund_policy_id === 1 ? 'Refund' : 
                           apiData.refund_policy_id === 2 ? 'Not Refund' : null,
        maxTicketPerPerson: apiData.max_ticket_per_person || 5,
        ticketTransferDeadline: parseAPIDate(apiData.ticket_transfer_deadline),
        qrcodeAvailableHours: (() => {
          const hours = apiData.qrcode_available_hours || 48
          if (hours === 24) return '24 hours before event starts'
          if (hours === 48) return '48 hours before event starts'
          if (hours === 72) return '72 hours before event starts'
          return 'Custom QR code available'
        })(),
        customQrcodeHours: apiData.qrcode_available_hours || 168,
        termsAndConditions: apiData.terms_and_condition || '',
        specialInstructions: apiData.special_instructions || '',
        acceptCashPayment: Number(apiData.accept_cash_payment) === 1,
        requireAgeVerification: Number(apiData.is_required_age_verification) === 1,
        minimumAgeOptions: (Number(apiData.is_required_age_verification) === 1 && apiData.maximum_age) ? 
          `${apiData.maximum_age} years old` : null,
        requiredIdentityDocuments: Array.isArray(apiData.required_identity_document) ? 
          apiData.required_identity_document : 
          (apiData.required_identity_document ? 
            (typeof apiData.required_identity_document === 'string' ? 
              apiData.required_identity_document.split(',').filter(doc => doc.trim() !== '') : 
              []) : [])
      }
      
      console.log('✅ Settings loaded from API:', settings.value)
    }
  } catch (error) {
    console.error('❌ Failed to load settings from API:', error)
    // If error is 404, it means no settings exist yet, which is fine
    if (!error.message?.includes('404')) {
      toast.add({
        severity: 'warn',
        summary: 'Load Failed',
        detail: 'Failed to load existing settings. Starting with defaults.',
        life: 3000
      })
    }
  }
}

// Save settings to API
const saveSettingsToAPI = async () => {
  if (!currentEventId.value || isSaving.value) return

  isSaving.value = true

  try {
    console.log('💾 Saving settings to API for event:', currentEventId.value)
    
    // Helper function to safely convert dates to API format
    const formatDateForAPI = (dateValue) => {
      if (!dateValue) return null
      
      let date
      if (dateValue instanceof Date) {
        date = dateValue
      } else {
        date = new Date(dateValue)
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('⚠️ Invalid date value:', dateValue)
        return null
      }
      
      // Convert to GMT and format for API
      try {
        const utcDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        return utcDate.toISOString().slice(0, 19).replace('T', ' ')
      } catch (error) {
        console.error('❌ Date formatting error:', error, 'for date:', dateValue)
        return null
      }
    }
    
    // Convert component format to API format
    const apiData = {
      registration_dateline: formatDateForAPI(settings.value.registrationDeadline),
      refund_policy_id: settings.value.refundPolicyOption === 'Refund' ? 1 : 
                       settings.value.refundPolicyOption === 'Not Refund' ? 2 : null,
      max_ticket_per_person: parseInt(settings.value.maxTicketPerPerson) || 5,
      ticket_transfer_deadline: formatDateForAPI(settings.value.ticketTransferDeadline),
      qrcode_available_hours: (() => {
        if (settings.value.qrcodeAvailableHours === 'Custom QR code available') {
          return parseInt(settings.value.customQrcodeHours) || 168
        }
        const match = settings.value.qrcodeAvailableHours?.match(/(\d+)/)
        if (match) {
          const hours = parseInt(match[1])
          // Convert "1 week" to 168 hours
          if (settings.value.qrcodeAvailableHours.includes('week')) {
            return hours * 7 * 24
          }
          return hours
        }
        return 48 // Default
      })(),
      terms_and_condition: settings.value.termsAndConditions || '',
      special_instructions: settings.value.specialInstructions || '',
      accept_cash_payment: settings.value.acceptCashPayment ? 1 : 0,
      is_required_age_verification: settings.value.requireAgeVerification ? 1 : 0,
      maximum_age: settings.value.requireAgeVerification && settings.value.minimumAgeOptions && 
        typeof settings.value.minimumAgeOptions === 'string' ? 
        parseInt(settings.value.minimumAgeOptions.replace(/\D/g, '')) || null : null,
      required_identity_document: Array.isArray(settings.value.requiredIdentityDocuments) && settings.value.requiredIdentityDocuments.length > 0 ? 
        settings.value.requiredIdentityDocuments : []
    }

    console.log('📊 Original settings values:', {
      registrationDeadline: settings.value.registrationDeadline,
      registrationDeadlineType: typeof settings.value.registrationDeadline,
      registrationDeadlineValid: settings.value.registrationDeadline instanceof Date ? !isNaN(settings.value.registrationDeadline.getTime()) : 'not a Date',
      ticketTransferDeadline: settings.value.ticketTransferDeadline,
      ticketTransferDeadlineType: typeof settings.value.ticketTransferDeadline,
      ticketTransferDeadlineValid: settings.value.ticketTransferDeadline instanceof Date ? !isNaN(settings.value.ticketTransferDeadline.getTime()) : 'not a Date'
    })
    
    console.log('📤 Sending to API:', apiData)
    console.log('🔍 Age verification logic:', {
      requireAgeVerification: settings.value.requireAgeVerification,
      minimumAgeOptions: settings.value.minimumAgeOptions,
      is_required_age_verification: settings.value.requireAgeVerification ? 1 : 0,
      maximum_age: settings.value.requireAgeVerification && settings.value.minimumAgeOptions ? 
        parseInt(settings.value.minimumAgeOptions.replace(/\D/g, '')) : null
    })
    console.log('🆔 Identity documents:', {
      requiredIdentityDocuments: settings.value.requiredIdentityDocuments,
      sent_as_array: Array.isArray(settings.value.requiredIdentityDocuments) && settings.value.requiredIdentityDocuments.length > 0 ? 
        settings.value.requiredIdentityDocuments : []
    })

    const response = await saveEventSettings(currentEventId.value, apiData)
    
    if (response) {
      // Save to tab store (like other tabs)
      handleSaveCurrentTab()

      // Also save to localStorage for persistence
      const settingsData = {
        ...settings.value,
        savedAt: new Date().toISOString()
      }
      localStorage.setItem('settingsPolicyData', JSON.stringify(settingsData))

      toast.add({
        severity: 'success',
        summary: 'Settings Saved',
        detail: 'Settings and policies have been saved successfully.',
        life: 3000
      })
      
      console.log('✅ Settings saved to API successfully')
    }
  } catch (error) {
    console.error('❌ Failed to save settings to API:', error)
    toast.add({
      severity: 'error',
      summary: 'Save Failed',
      detail: 'Failed to save settings. Please try again.',
      life: 4000
    })
  } finally {
    isSaving.value = false
  }
}

// Handle save current tab data (consistent with other tabs)
const handleSaveCurrentTab = (event) => {
  const detail = event?.detail
  if (detail && detail.eventId && detail.eventId !== currentEventId.value) {
    return
  }
  
  if (!currentEventId.value) {
    return
  }

  // Save current settings data to tab persistence (like other tabs)
  const tabData = {
    registrationDeadline: settings.value.registrationDeadline,
    refundPolicyOption: settings.value.refundPolicyOption,
    maxTicketPerPerson: settings.value.maxTicketPerPerson,
    ticketTransferDeadline: settings.value.ticketTransferDeadline,
    qrcodeAvailableHours: settings.value.qrcodeAvailableHours,
    customQrcodeHours: settings.value.customQrcodeHours,
    termsAndConditions: settings.value.termsAndConditions,
    specialInstructions: settings.value.specialInstructions,
    acceptCashPayment: settings.value.acceptCashPayment,
    requireAgeVerification: settings.value.requireAgeVerification,
    minimumAgeOptions: settings.value.minimumAgeOptions,
    requiredIdentityDocuments: settings.value.requiredIdentityDocuments,
    lastSaved: new Date().toISOString(),
    hasSettings: areSettingsComplete.value,
    eventId: currentEventId.value,
    isEditMode: isEditMode.value,
    isComplete: areSettingsComplete.value
  }
  
  tabsStore.saveTabData(4, tabData)
  
  if (tabData.isComplete) {
    tabsStore.markTabComplete(4)
  }
}

// Tab data saving (Save Draft only - no auto-save)
watch(settings, () => {
  if (currentEventId.value) {
    tabsStore.saveTabData(4, {
      registrationDeadline: settings.value.registrationDeadline,
      refundPolicyOption: settings.value.refundPolicyOption,
      maxTicketPerPerson: settings.value.maxTicketPerPerson,
      ticketTransferDeadline: settings.value.ticketTransferDeadline,
      qrcodeAvailableHours: settings.value.qrcodeAvailableHours,
      customQrcodeHours: settings.value.customQrcodeHours,
      termsAndConditions: settings.value.termsAndConditions,
      specialInstructions: settings.value.specialInstructions,
      acceptCashPayment: settings.value.acceptCashPayment,
      requireAgeVerification: settings.value.requireAgeVerification,
      minimumAgeOptions: settings.value.minimumAgeOptions,
      requiredIdentityDocuments: settings.value.requiredIdentityDocuments,
      lastSaved: new Date().toISOString(),
      hasSettings: areSettingsComplete.value,
      eventId: currentEventId.value,
      isEditMode: isEditMode.value,
      isComplete: areSettingsComplete.value
    })
    
    tabsStore.markTabModified(4)
    
    if (areSettingsComplete.value) {
      tabsStore.markTabComplete(4)
    }
  }
}, { deep: true })

// Watch age verification to clear minimum age when unchecked
watch(() => settings.value.requireAgeVerification, (newValue) => {
  if (!newValue) {
    settings.value.minimumAgeOptions = null
  }
})

// Event listeners for parent component actions
const handleSaveSettings = async () => {
  await saveSettingsToAPI()
}

// Listen for save draft events (from parent component)
onMounted(() => {
  window.addEventListener('saveDraft', handleSaveCurrentTab)
})

onUnmounted(() => {
  window.removeEventListener('saveDraft', handleSaveCurrentTab)
})

// Watch for event ID changes to load settings (consistent with Agenda tab)
watch(() => props.eventId || eventCreationState.eventId.value, async (newEventId) => {
  console.log('👁️ EventId changed to:', newEventId)
  currentEventId.value = newEventId
  
  if (newEventId && isEditMode.value) {
    await loadSettingsFromAPI()
  } else if (newEventId) {
    // Load any saved tab data for new events
    const tabData = tabsStore.getTabData(4)
    if (tabData && tabData.eventId === newEventId) {
      console.log('📥 Loading saved tab data for event:', newEventId)
      
      // Safe date parsing helper
      const safeParseDateFromTab = (dateValue) => {
        if (!dateValue) return null
        try {
          const parsedDate = new Date(dateValue)
          return isNaN(parsedDate.getTime()) ? null : parsedDate
        } catch (error) {
          console.warn('⚠️ Invalid date in tab data:', dateValue)
          return null
        }
      }
      
      // Load tab data into settings
      settings.value = {
        registrationDeadline: safeParseDateFromTab(tabData.registrationDeadline),
        refundPolicyOption: tabData.refundPolicyOption || null,
        maxTicketPerPerson: tabData.maxTicketPerPerson || 5,
        ticketTransferDeadline: safeParseDateFromTab(tabData.ticketTransferDeadline),
        qrcodeAvailableHours: tabData.qrcodeAvailableHours || '48 hours before event starts',
        customQrcodeHours: tabData.customQrcodeHours || 168,
        termsAndConditions: tabData.termsAndConditions || '',
        specialInstructions: tabData.specialInstructions || '',
        acceptCashPayment: tabData.acceptCashPayment || false,
        requireAgeVerification: tabData.requireAgeVerification || false,
        minimumAgeOptions: tabData.minimumAgeOptions || null,
        requiredIdentityDocuments: tabData.requiredIdentityDocuments || []
      }
    }
  }
}, { immediate: true })

onMounted(async () => {
  // Set initial currentEventId from props or injected context
  currentEventId.value = props.eventId || eventCreationState.eventId.value
  
  console.log('🔧 SettingPolicy mounted, currentEventId:', currentEventId.value, 'isEditMode:', isEditMode.value)
  
  // Load saved settings data from localStorage first (for offline support)
  const savedSettings = localStorage.getItem('settingsPolicyData')
  if (savedSettings) {
    try {
      const settingsData = JSON.parse(savedSettings)
      
      // Safe date parsing helper for localStorage
      const safeParseDateFromStorage = (dateValue) => {
        if (!dateValue) return null
        try {
          const parsedDate = new Date(dateValue)
          return isNaN(parsedDate.getTime()) ? null : parsedDate
        } catch (error) {
          console.warn('⚠️ Invalid date in localStorage:', dateValue)
          return null
        }
      }
      
      settings.value = {
        registrationDeadline: safeParseDateFromStorage(settingsData.registrationDeadline),
        refundPolicyOption: settingsData.refundPolicyOption || null,
        maxTicketPerPerson: settingsData.maxTicketPerPerson || 5,
        ticketTransferDeadline: safeParseDateFromStorage(settingsData.ticketTransferDeadline),
        qrcodeAvailableHours: settingsData.qrcodeAvailableHours || '48 hours before event starts',
        customQrcodeHours: settingsData.customQrcodeHours || 168,
        termsAndConditions: settingsData.termsAndConditions || '',
        specialInstructions: settingsData.specialInstructions || '',
        acceptCashPayment: settingsData.acceptCashPayment || false,
        requireAgeVerification: settingsData.requireAgeVerification || false,
        minimumAgeOptions: settingsData.requireAgeVerification ? settingsData.minimumAgeOptions : null,
        requiredIdentityDocuments: Array.isArray(settingsData.requiredIdentityDocuments) ? 
          settingsData.requiredIdentityDocuments : []
      }
      console.log('📥 Loaded settings from localStorage:', settings.value)
    } catch (error) {
      console.error('Failed to load saved settings from localStorage:', error)
    }
  }

  // If in edit mode and have event ID, load from API
  if (currentEventId.value && isEditMode.value) {
    console.log('🔄 Loading settings from API because we have eventId and are in edit mode')
    await loadSettingsFromAPI()
  }

  // Add event listeners
  window.addEventListener('saveCurrentTab', handleSaveSettings)
  window.addEventListener('loadSettingsData', async (event) => {
    if (event.detail?.eventId) {
      await loadSettingsFromAPI()
    }
  })
})

// Remove event listeners when component unmounts
onUnmounted(() => {
  window.removeEventListener('saveCurrentTab', handleSaveSettings)
  window.removeEventListener('loadSettingsData', loadSettingsFromAPI)
})
</script>

<style scoped>
/* Custom styling for form elements */
:deep(.p-calendar),
:deep(.p-dropdown),
:deep(.p-textarea),
:deep(.p-inputnumber) {
  @apply bg-gray-100 rounded-2xl;
}

:deep(.p-calendar .p-inputtext),
:deep(.p-dropdown .p-dropdown-label),
:deep(.p-textarea),
:deep(.p-inputnumber .p-inputtext) {
  @apply p-3 bg-transparent border-0;
}

:deep(.p-dropdown .p-dropdown-trigger) {
  @apply w-12; /* Adjust dropdown icon width */
}

:deep(.p-checkbox .p-checkbox-box) {
  @apply rounded-md border border-purple-600;
}

:deep(.p-checkbox.p-highlight .p-checkbox-box) {
  @apply border border-purple-600 bg-white; /* Keep box white, only border changes */
}

:deep(.p-checkbox.p-highlight .p-checkbox-box .p-checkbox-icon) {
  @apply text-purple-600; /* Make the checkmark purple */
}
:deep(.p-calendar .p-inputtext) {
  background: transparent !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

:deep(.p-calendar .p-inputtext:focus) {
  outline: none !important;
  box-shadow: none !important;
  border: none !important;
}
</style>
