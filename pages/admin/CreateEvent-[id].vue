<template>
  <div>
    <!-- This redirects to the main CreateEvent page with the ID stored -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Loading event for editing...</p>
        <p class="text-sm text-gray-500 mt-2">Event ID: {{ eventId }}</p>
        <p class="text-xs text-gray-400 mt-1">Route: {{ route.fullPath }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const eventId = ref(null)

onMounted(async () => {
  // Get event ID from route params
  eventId.value = route.params.id
  
  console.log('🔗 CreateEvent-[id] route accessed:', {
    routeParams: route.params,
    eventId: eventId.value,
    fullRoute: route.fullPath
  })
  
  if (eventId.value) {
    // Check what's currently in localStorage before clearing
    const beforeClear = {
      currentEventId: localStorage.getItem('currentEventId'),
      editEventId: localStorage.getItem('editEventId')
    }
    console.log('📦 localStorage before clearing:', beforeClear)
    
    // Clear any existing data first to ensure clean state
    localStorage.removeItem('currentEventId')
    localStorage.removeItem('currentEventName')
    localStorage.removeItem('editEventId')
    localStorage.removeItem('editEventName')
    
    // Store the SPECIFIC event ID for editing
    localStorage.setItem('editEventId', eventId.value)
    
    // Verify storage
    const afterStore = {
      editEventId: localStorage.getItem('editEventId')
    }
    console.log('✅ Dynamic event ID stored for editing:', {
      originalId: eventId.value,
      storedId: afterStore.editEventId,
      matches: afterStore.editEventId === eventId.value
    })
    
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Redirect to the main CreateEvent page
    console.log('🔄 Redirecting to /admin/CreateEvent')
    await router.push('/admin/CreateEvent')
  } else {
    console.log('❌ No event ID provided, redirecting to create event')
    // No ID provided, go to regular create event
    await router.push('/admin/CreateEvent')
  }
})

definePageMeta({
  layout: "admin",
})
</script>