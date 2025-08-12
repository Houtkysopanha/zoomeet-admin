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
            placeholder="Select policy"
            class="w-full"
          />
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

      <!-- Age Verification and Identity Document Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <div>
          <div class="flex items-center mb-4">
            <Checkbox v-model="settings.requireAgeVerification" :binary="true" inputId="ageVerification" />
            <label for="ageVerification" class="ml-2 font-medium text-gray-700">
              Require age verification for this event
            </label>
            
          </div>
           <label class="block text-sm font-medium text-gray-700 mb-2">Minimum Age</label>
            <Dropdown
            v-model="settings.minimumAgeOptions"
            :options="minimumAgeOptions"
            placeholder="18 years old"
            class="w-full"
          />
 <div> 
        </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Require Identity Document</label>
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import Textarea from 'primevue/textarea'
import Checkbox from 'primevue/checkbox'
import { useToast } from "primevue/usetoast"

const toast = useToast()

const settings = ref({
  registrationDeadline: null,
  refundPolicy: null,
  termsAndConditions: '',
  specialInstructions: '',
  requireAgeVerification: false,
  minimumAge: null,
  requiredIdentityDocuments: []
})

const refundPolicyOptions = ref([
'Full Refund', 'Not Refund',
])

const minimumAgeOptions = ref([
 '18 years old', '19 years old', '20 years old'
])

// Auto-save functionality
const isAutoSaving = ref(false)

// Check if settings are complete for auto-save
const areSettingsComplete = computed(() => {
  return !!(
    settings.value.registrationDeadline &&
    settings.value.refundPolicy &&
    settings.value.termsAndConditions
  )
})

// Auto-save watcher
watch(areSettingsComplete, async (newValue) => {
  if (newValue && !isAutoSaving.value) {
    isAutoSaving.value = true

    try {
      // Auto-save settings data
      const settingsData = {
        ...settings.value,
        autoSavedAt: new Date().toISOString()
      }
      localStorage.setItem('settingsPolicyData', JSON.stringify(settingsData))

      toast.add({
        severity: 'info',
        summary: 'Auto-Saved Settings ⚙️',
        detail: 'Your settings and policies have been automatically saved.',
        life: 3000
      })
    } catch (error) {
      console.error('Auto-save settings failed:', error)
    } finally {
      setTimeout(() => {
        isAutoSaving.value = false
      }, 2000)
    }
  }
}, { deep: true })

// Event listeners for parent component actions
const handleSaveSettings = () => {
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
}

onMounted(() => {
  // Load saved settings data
  const savedSettings = localStorage.getItem('settingsPolicyData')
  if (savedSettings) {
    try {
      const settingsData = JSON.parse(savedSettings)
      settings.value = {
        registrationDeadline: settingsData.registrationDeadline ? new Date(settingsData.registrationDeadline) : null,
        refundPolicy: settingsData.refundPolicy || null,
        termsAndConditions: settingsData.termsAndConditions || '',
        specialInstructions: settingsData.specialInstructions || '',
        requireAgeVerification: settingsData.requireAgeVerification || false,
        minimumAge: settingsData.minimumAge || null,
        requiredIdentityDocuments: settingsData.requiredIdentityDocuments || []
      }
    } catch (error) {
      console.error('Failed to load saved settings:', error)
    }
  }

  // Add event listeners
  window.addEventListener('saveCurrentTab', handleSaveSettings)
})

// Remove event listeners when component unmounts
onUnmounted(() => {
  window.removeEventListener('saveCurrentTab', handleSaveSettings)
})

const identityDocumentOptions = ref([
  { label: 'Driver\'s License', value: 'drivers_license' },
  { label: 'National ID Card', value: 'national_id' },
  { label: 'Passport', value: 'passport' },
  { label: 'Student Card', value: 'student_card' }
])
</script>

<style scoped>
/* Custom styling for form elements */
:deep(.p-calendar),
:deep(.p-dropdown),
:deep(.p-textarea) {
  @apply bg-gray-100 rounded-2xl;
}

:deep(.p-calendar .p-inputtext),
:deep(.p-dropdown .p-dropdown-label),
:deep(.p-textarea) {
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
</style>
