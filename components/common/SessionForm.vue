<template>
  <div class="session-form-container">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-purple-700 font-medium flex items-center">
        <Icon name="heroicons:document-text" class="text-2xl mr-2" />
        Session {{ sessionIndex + 1 }}
      </h3>
      <Button
        v-if="sessionIndex > 0"
        icon="pi pi-trash"
        text
        rounded
        severity="danger"
        size="small"
        @click="$emit('remove-session', sessionIndex)"
        title="Remove Session"
      />
    </div>
    
    <!-- Date and Time Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Date</label>
        <Calendar
          v-model="sessionData.date"
          showIcon
          placeholder="31/07/2025"
          iconDisplay="input"
          class="w-full"
          dateFormat="dd/mm/yy"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Time</label>
        <div class="relative">
          <InputText
            :value="formattedTimeRange"
            class="w-full p-3 bg-gray-100 rounded-2xl cursor-pointer"
            placeholder="9:30 AM - 10:30 AM"
            readonly
            @click="showTimeSelector = !showTimeSelector"
          />
          <i class="pi pi-clock absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          
          <!-- Time Selector Dropdown -->
          <div v-if="showTimeSelector" class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4">
            <div class="grid grid-cols-2 gap-4">
              <!-- Start Time -->
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-2">Start Time</label>
                <Dropdown
                  v-model="sessionData.startTime"
                  :options="timeOptions"
                  class="w-full"
                  placeholder="Select start time"
                  @change="updateTimeRange"
                />
              </div>
              <!-- End Time -->
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-2">End Time</label>
                <Dropdown
                  v-model="sessionData.endTime"
                  :options="timeOptions"
                  class="w-full"
                  placeholder="Select end time"
                  @change="updateTimeRange"
                />
              </div>
            </div>
            <div class="flex justify-end mt-3 pt-3 border-t border-gray-100">
              <Button
                @click="showTimeSelector = false"
                size="small"
                class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Session Title and Speaker Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Session Title</label>
        <InputText
          v-model="sessionData.title"
          class="w-full p-3 bg-gray-100 rounded-2xl"
          placeholder="Enter session title"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Speaker</label>
        <InputText
          v-model="sessionData.speaker"
          class="w-full p-3 bg-gray-100 rounded-2xl"
          placeholder="Enter speaker name"
        />
      </div>
    </div>

    <!-- Description -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">Session Description</label>
      <Textarea
        v-model="sessionData.description"
        class="w-full p-3 bg-gray-100 rounded-2xl"
        placeholder="Describe this session..."
        rows="4"
      />
    </div>
  </div>

  <!-- Click outside to close time selector -->
  <div v-if="showTimeSelector" @click="showTimeSelector = false" class="fixed inset-0 z-40"></div>
</template>

<script setup>
import { ref, computed, watch } from "vue"
// Icon is auto-imported by Nuxt
import Button from "primevue/button"
import InputText from "primevue/inputtext"
import Dropdown from "primevue/dropdown"
import Textarea from "primevue/textarea"
import Calendar from "primevue/calendar"

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  sessionIndex: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue', 'remove-session'])

const sessionData = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const showTimeSelector = ref(false)

// Generate time options (every 30 minutes)
const timeOptions = ref([
  '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
  '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
  '8:00 PM', '8:30 AM', '9:00 PM', '9:30 PM', '10:00 PM'
])

// Computed formatted time range
const formattedTimeRange = computed(() => {
  if (sessionData.value.startTime && sessionData.value.endTime) {
    return `${sessionData.value.startTime} - ${sessionData.value.endTime}`
  }
  return ''
})

// Methods
const updateTimeRange = () => {
  // This will trigger the computed property to update
  // No explicit action needed here as computed property handles it
}

// Close time selector if start/end times are selected
watch(() => [sessionData.value.startTime, sessionData.value.endTime], () => {
  if (sessionData.value.startTime && sessionData.value.endTime) {
    showTimeSelector.value = false
  }
})
</script>

<style scoped>
/* Custom styling for form elements */
:deep(.p-calendar) {
  @apply bg-gray-100 rounded-2xl;
}

:deep(.p-calendar .p-inputtext) {
  @apply p-3 bg-transparent border-0;
}

:deep(.p-dropdown) {
  @apply p-3;
}

:deep(.p-dropdown .p-dropdown-label) {
  @apply bg-transparent;
}

.session-form-container {
  @apply transition-all duration-300 ease-in-out;
}

.z-50 {
  z-index: 50;
}

.z-40 {
  z-index: 40;
}
</style>
