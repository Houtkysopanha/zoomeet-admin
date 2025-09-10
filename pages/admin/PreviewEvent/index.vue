<template>
  <div class="p-4 lg:p-6 bg-[#F8F8FF] min-h-screen">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 class="text-xl lg:text-3xl text-gray-400 mb-2">
            Event / <span class="text-xl lg:text-3xl font-bold text-[#7A49C9]">Preview Event</span>
          </h1>
        </div>
        <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 items-stretch sm:items-center">
          <Button
            @click="goBack"
            class="w-full sm:w-40 lg:w-52 h-12 lg:h-14 p-3 lg:p-4 rounded-full bg-white border-2 border-gray-400 hover:bg-gray-50 flex items-center justify-center gap-2 transition-all duration-300 text-sm lg:text-base"
            raised
          >
            <template #default>
              <Icon name="heroicons:arrow-left" class="text-lg lg:text-2xl text-gray-600" />
              <span class="text-gray-600 font-semibold">Back to Edit</span>
            </template>
          </Button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <LoadingSpinner size="lg" color="purple" text="Loading event preview..." />
    </div>

    <!-- Event Preview Content -->
    <div v-else-if="eventData" class="space-y-6">
      <!-- Event Status Badge -->
      <div class="flex items-center gap-3 mb-4">
        <span 
          :class="[
            'px-4 py-2 rounded-full text-sm font-semibold',
            eventData.is_published 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          ]"
        >
          {{ eventData.is_published ? 'Published' : 'Draft' }}
        </span>
        <span class="text-gray-500 text-sm">
          Created {{ formatDate(eventData.created_at) }}
        </span>
      </div>

      <!-- Cover Image -->
      <div v-if="eventData.cover_image" class="relative rounded-2xl overflow-hidden shadow-lg">
        <img 
          :src="eventData.cover_image" 
          :alt="eventData.name"
          class="w-full h-64 lg:h-80 object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div class="absolute bottom-6 left-6 text-white">
          <h2 class="text-2xl lg:text-4xl font-bold mb-2">{{ eventData.name }}</h2>
          <p class="text-lg opacity-90">{{ eventData.category_name }}</p>
        </div>
      </div>

      <!-- Event Details Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Basic Information -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-xl font-semibold text-purple-700 mb-4 flex items-center">
            <Icon name="heroicons:information-circle" class="text-2xl mr-2" />
            Event Information
          </h3>
          
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-500">Event Name</label>
              <p class="text-gray-900 font-medium">{{ eventData.name }}</p>
            </div>
            
            <div>
              <label class="text-sm font-medium text-gray-500">Category</label>
              <p class="text-gray-900">{{ eventData.category_name }}</p>
            </div>
            
            <div>
              <label class="text-sm font-medium text-gray-500">Description</label>
              <p class="text-gray-900 leading-relaxed">{{ eventData.description }}</p>
            </div>
            
            <div>
              <label class="text-sm font-medium text-gray-500">Event Slug</label>
              <p class="text-gray-900 font-mono text-sm bg-gray-100 px-3 py-1 rounded">{{ eventData.slug }}</p>
            </div>
          </div>
        </div>

        <!-- Date & Location -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-xl font-semibold text-purple-700 mb-4 flex items-center">
            <Icon name="heroicons:calendar-days" class="text-2xl mr-2" />
            Date & Location
          </h3>
          
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-500">Start Date</label>
              <p class="text-gray-900 font-medium">{{ formatDateTime(eventData.start_date) }}</p>
            </div>
            
            <div>
              <label class="text-sm font-medium text-gray-500">End Date</label>
              <p class="text-gray-900 font-medium">{{ formatDateTime(eventData.end_date) }}</p>
            </div>
            
            <div>
              <label class="text-sm font-medium text-gray-500">Location</label>
              <p class="text-gray-900">{{ eventData.location }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Event State -->
    <div v-else class="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
      <Icon name="heroicons:document-magnifying-glass" class="text-6xl text-gray-400 mb-4" />
      <h3 class="text-xl font-semibold text-gray-700 mb-2">No Event to Preview</h3>
      <p class="text-gray-500 mb-4">Please create an event first to see the preview.</p>
      <Button
        @click="goToCreateEvent"
        class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
      >
        Create Event
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import { fetchEventById } from '@/composables/api'

const router = useRouter()
const toast = useToast()

// State
const loading = ref(false)
const eventData = ref(null)

// Methods
const loadEventData = async () => {
  loading.value = true
  
  try {
    // Get event ID from localStorage (fallback when no ID in route)
    const eventId = localStorage.getItem('currentEventId')
    
    if (!eventId) {
      toast.add({
        severity: 'warn',
        summary: 'No Event Selected',
        detail: 'Please create or select an event to preview.',
        life: 4000
      })
      return
    }

    const response = await fetchEventById(eventId)
    
    if (response && response.data && response.data.success) {
      eventData.value = response.data.data

    } else {
      toast.add({
        severity: 'error',
        summary: 'Failed to Load Event',
        detail: 'Could not load event data. Please try again.',
        life: 4000
      })
    }
  } catch (err) {

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.message || 'Failed to load event',
      life: 4000
    })
  } finally {
    loading.value = false
  }
}

import { formatSingleDate } from '~/utils/dateFormatter'

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return formatSingleDate(dateString)
}

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  const formattedDate = formatSingleDate(dateString)
  const time = date.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
  return `${formattedDate} at ${time}`
}

const goBack = () => {
  router.push('/admin/CreateEvent')
}

const goToCreateEvent = () => {
  router.push('/admin/CreateEvent')
}

// Load event data on mount
onMounted(() => {
  loadEventData()
})

definePageMeta({
  layout: "admin",
})
</script>

<style scoped>
/* Custom animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
