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

  try {
    // Double check current event and clear if not matching
    if (eventStore.currentEvent && eventStore.currentEvent.id.toString() !== eventId.toString()) {
      console.log('🔄 Clearing mismatched event data:', {
        currentId: eventStore.currentEvent.id,
        requestedId: eventId
      })
      eventStore.clearCurrentEvent()
      eventStore.clearCache()
    }

    // Load or reload event data into store
    console.log('🔄 Loading event data:', eventId)
    const eventData = await eventStore.loadEventById(eventId)

    if (!eventData) {
      throw new Error('Failed to load event data')
    }

    // Verify the loaded event matches the requested ID
    if (eventData.id.toString() !== eventId.toString()) {
      throw new Error('Loaded event does not match requested ID')
    }

    console.log('✅ Event loaded successfully:', {
      id: eventData.id,
      name: eventData.name
    })

    toast.add({
      severity: 'success',
      summary: 'Event Loaded',
      detail: `Editing: ${eventData.name}`,
      life: 3000
    })

    // Redirect to main create event page with proper query params
    await router.push({
      path: '/admin/CreateEvent',
      query: { 
        mode: 'edit', 
        id: eventId,
        timestamp: Date.now() // Force route refresh
      }
    })

  } catch (e) {
    console.error('❌ Failed to load event:', e)
    error.value = e.message
    toast.add({
      severity: 'error',
      summary: 'Load Failed',
      detail: `Failed to load event: ${e.message}`,
      life: 5000
    })

    // Clear everything on error
    eventStore.clearCurrentEvent()
    eventStore.clearCache()
    
    // Redirect back to events list
    await router.push('/admin/event')
  } finally {
    loading.value = false
  }
})

definePageMeta({
  layout: "admin",
})
</script>