// composables/useEventCount.js
import { ref, computed, readonly } from 'vue'
import { fetchEvents } from '@/composables/api.js'

const events = ref([])
const loading = ref(false)
const error = ref(null)

export const useEventCount = () => {
  
  // Reactive count computations
  const totalEventCount = computed(() => events.value.length)
  
  const activeEventCount = computed(() => 
    events.value.filter(event => event.status === 'Active').length
  )
  
  const draftEventCount = computed(() => 
    events.value.filter(event => event.status === 'Draft').length
  )
  
  const ongoingEventCount = computed(() => {
    const now = new Date()
    return events.value.filter(event => {
      const startDate = new Date(event.start_date)
      const endDate = new Date(event.end_date)
      return now >= startDate && now <= endDate
    }).length
  })

  // Function to load events and update counts
  const loadEventCount = async () => {
    if (loading.value) return // Prevent multiple simultaneous calls
    
    loading.value = true
    error.value = null
    
    try {
      const response = await fetchEvents()
      
      if (response.status === 200 && response.data.success && Array.isArray(response.data.data)) {
        events.value = response.data.data
      } else {
        console.warn('Unexpected events API response:', response)
        events.value = []
      }
    } catch (err) {
      console.error('Error loading events for count:', err)
      error.value = err.message || 'Failed to load events'
      events.value = []
    } finally {
      loading.value = false
    }
  }

  // Function to refresh event count (can be called from components)
  const refreshEventCount = () => loadEventCount()

  return {
    // Data
    events: readonly(events),
    loading: readonly(loading),
    error: readonly(error),
    
    // Computed counts
    totalEventCount,
    activeEventCount,  
    draftEventCount,
    ongoingEventCount,
    
    // Methods
    loadEventCount,
    refreshEventCount
  }
}

// Create a global singleton instance for sharing across components
let globalEventCount = null

export const useGlobalEventCount = () => {
  if (!globalEventCount) {
    globalEventCount = useEventCount()
  }
  return globalEventCount
}
