<template>
  <div>
    <!-- This redirects to the main CreateEvent page with the ID stored -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Loading event for editing...</p>
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

onMounted(async () => {
  // Get event ID from route params
  const eventId = route.params.id
  
  if (eventId) {
    // Store the event ID for editing
    localStorage.setItem('editEventId', eventId)
    
    // Redirect to the main CreateEvent page
    await router.push('/admin/CreateEvent')
  } else {
    // No ID provided, go to regular create event
    await router.push('/admin/CreateEvent')
  }
})

definePageMeta({
  layout: "admin",
})
</script>