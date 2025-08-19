<template>
  <div>
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p class="text-gray-600">Loading event for editing...</p>
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEventStore } from '~/composables/useEventStore'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const route = useRoute()
const toast = useToast()
const loading = ref(true)
const error = ref(null)
const eventStore = useEventStore()

onMounted(async () => {
  const eventId = route.params.id

  if (!eventId) {
    error.value = 'No event ID provided'
    await router.push('/admin/CreateEvent')
    return
  }

  // Enhanced UUID validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(eventId)) {
    error.value = 'Invalid event ID format'
    toast.add({
      severity: 'error',
      summary: 'Invalid Event ID',
      detail: 'The event ID format is invalid. Expected UUID format.',
      life: 5000
    })
    await router.push('/admin/event')
    return
  }

  try {
    
    // Store the event ID and edit context in session for persistence
    if (process.client) {
      sessionStorage.setItem('currentEventId', eventId)
      sessionStorage.setItem('editMode', 'true')
      sessionStorage.setItem('editSource', 'direct-link')
    }

    // Always clear and load fresh data to ensure consistency
    eventStore.clearCache()
    
    const eventData = await eventStore.loadEventById(eventId)

    if (!eventData) {
      throw new Error('Failed to load event data from API')
    }

    // Enhanced UUID verification with detailed logging
    const loadedId = eventData.id.toString()
    const requestedId = eventId.toString()
    
    if (loadedId !== requestedId) {
      throw new Error(`Event ID mismatch: expected ${requestedId}, got ${loadedId}`)
    }


    // Show success message with event details
    toast.add({
      severity: 'success',
      summary: 'Event Loaded for Editing',
      detail: `Successfully loaded "${eventData.name}" with all data`,
      life: 3000
    })

    // Enhanced redirect to main create event page with comprehensive query params
    await router.push({
      path: '/admin/CreateEvent',
      query: {
        mode: 'edit',
        id: eventId,
        ts: Date.now(), // Force route refresh
        source: 'direct-link',
        loaded: 'true'
      }
    })


  } catch (e) {
    error.value = e.message
    
    // Provide more specific error messages
    let errorDetail = `Failed to load event: ${e.message}`
    let errorSummary = 'Load Failed'
    
    if (e.message.includes('not found')) {
      errorDetail = 'The event could not be found. It may have been deleted or you may not have permission to access it.'
      errorSummary = 'Event Not Found'
    } else if (e.message.includes('Authentication')) {
      errorDetail = 'Authentication failed. Please login again.'
      errorSummary = 'Authentication Error'
    } else if (e.message.includes('mismatch')) {
      errorDetail = 'Event data integrity error. Please try accessing the event from the events list.'
      errorSummary = 'Data Integrity Error'
    }

    toast.add({
      severity: 'error',
      summary: errorSummary,
      detail: errorDetail,
      life: 6000
    })

    // Enhanced cleanup on error
    eventStore.clearCurrentEvent()
    eventStore.clearCache()
    
    // Clear all session storage related to editing
    if (process.client) {
      sessionStorage.removeItem('currentEventId')
      sessionStorage.removeItem('editMode')
      sessionStorage.removeItem('editSource')
    }
    
    // Redirect back to events list with error context
    await router.push({
      path: '/admin/event',
      query: {
        error: 'load_failed',
        eventId: eventId
      }
    })
  } finally {
    loading.value = false
  }
})

definePageMeta({
  layout: "admin",
})
</script>