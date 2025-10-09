// Composable for upcoming events management
import { ref, computed, readonly } from 'vue'
import { fetchUpcomingEvents } from '@/composables/api.js'

export const useUpcomingEvents = () => {
  const upcomingEvents = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const lastFetchDate = ref(null)

  // Computed property for formatted events
  const formattedEvents = computed(() => {
    return upcomingEvents.value.map(event => {
      const startDate = new Date(event.start_date)
      const endDate = new Date(event.end_date)
      
      const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      }

      const formatDate = (date) => {
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      }

      return {
        id: event.id,
        title: event.name,
        category: event.category_name,
        location: event.location,
        time: formatTime(startDate),
        date: formatDate(startDate),
        dateRange: formatDate(startDate) !== formatDate(endDate) 
          ? `${formatDate(startDate)} - ${formatDate(endDate)}`
          : formatDate(startDate),
        image: event.cover_image_url,
        startDate: startDate,
        endDate: endDate,
        rawData: event
      }
    })
  })

  // Load upcoming events
  const loadEvents = async (startDate = null) => {
    isLoading.value = true
    error.value = null
    
    try {
      // Format date as YYYY-MM-DD if provided
      const formattedDate = startDate ? 
        startDate.toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0]

      console.log('🔄 Loading upcoming events for date:', formattedDate)
      
      const response = await fetchUpcomingEvents(formattedDate)
      
      if (response.success && response.data) {
        upcomingEvents.value = response.data
        lastFetchDate.value = formattedDate
        console.log('✅ Upcoming events loaded:', response.data.length, 'events')
        
        return {
          success: true,
          message: 'Events loaded successfully',
          count: response.data.length
        }
      } else {
        console.warn('⚠️ No upcoming events found:', response.message)
        upcomingEvents.value = []
        
        return {
          success: false,
          message: response.message || 'No upcoming events found',
          count: 0
        }
      }
    } catch (err) {
      console.error('❌ Error loading upcoming events:', err)
      error.value = err.message || 'Failed to load upcoming events'
      upcomingEvents.value = []
      
      return {
        success: false,
        message: error.value,
        count: 0
      }
    } finally {
      isLoading.value = false
    }
  }

  // Refresh events (reload with last used date)
  const refreshEvents = async () => {
    if (lastFetchDate.value) {
      return await loadEvents(new Date(lastFetchDate.value))
    } else {
      return await loadEvents()
    }
  }

  // Clear events data
  const clearEvents = () => {
    upcomingEvents.value = []
    error.value = null
    lastFetchDate.value = null
  }

  return {
    // Reactive data
    upcomingEvents: readonly(upcomingEvents),
    formattedEvents,
    isLoading: readonly(isLoading),
    error: readonly(error),
    lastFetchDate: readonly(lastFetchDate),
    
    // Methods
    loadEvents,
    refreshEvents,
    clearEvents
  }
}