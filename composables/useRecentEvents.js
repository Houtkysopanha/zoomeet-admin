// Composable for recent events management
import { ref, computed, readonly } from 'vue'
import { fetchRecentEvents } from '@/composables/api.js'

// Helper function to validate and sanitize image URLs
const validateImageUrl = (url) => {
  // Return null for empty, null, undefined, or invalid URLs
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return null
  }
  
  const trimmedUrl = url.trim()
  
  // Check if it's a valid URL format
  try {
    new URL(trimmedUrl)
    return trimmedUrl
  } catch {
    // If not a valid absolute URL, check if it's a relative path
    if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('./')) {
      return trimmedUrl
    }
    return null
  }
}

export const useRecentEvents = () => {
  const recentEvents = ref([])
  const dashboardSummary = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const lastFetchTime = ref(null)

  // Computed property for formatted events
  const formattedEvents = computed(() => {
    return recentEvents.value.map(event => {
      const startDate = new Date(event.start_date)
      const endDate = new Date(event.end_date)
      const currentDate = new Date()
      
      // Determine event status
      const isEventEnded = endDate < currentDate
      
      const formatDate = (date) => {
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      }
      
      const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      }

      // Create date range string
      const startDateStr = formatDate(startDate)
      const endDateStr = formatDate(endDate)
      const dateRange = startDateStr === endDateStr ? startDateStr : `${startDateStr} - ${endDateStr}`

      return {
        id: event.id,
        name: event.name,
        location: event.location,
        date: dateRange,
        time: formatTime(startDate),
        totalRevenue: `$${event.total_revenue?.toFixed(2) || '0.00'}`,
        booking: event.total_booking?.toString() || '0',
        tickets: event.total_ticket?.toString() || '0',
        status: isEventEnded ? 'ended' : 'active',
        image: validateImageUrl(event.cover_image_url),
        category: event.category_name,
        startDate: startDate,
        endDate: endDate,
        rawData: event
      }
    })
  })

  // Load recent events
  const loadEvents = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      
      const response = await fetchRecentEvents()
      
      if (response.success && response.data) {
        recentEvents.value = response.data
        dashboardSummary.value = response.summary
        lastFetchTime.value = new Date().toISOString()
        
        return {
          success: true,
          message: 'Recent events loaded successfully',
          count: response.data.length,
          summary: response.summary
        }
      } else {
        console.warn('⚠️ No recent events found:', response.message)
        recentEvents.value = []
        dashboardSummary.value = null
        
        return {
          success: false,
          message: response.message || 'No recent events found',
          count: 0,
          summary: null
        }
      }
    } catch (err) {
      console.error('❌ Error loading recent events:', err)
      error.value = err.message || 'Failed to load recent events'
      recentEvents.value = []
      dashboardSummary.value = null
      
      return {
        success: false,
        message: error.value,
        count: 0,
        summary: null
      }
    } finally {
      isLoading.value = false
    }
  }

  // Refresh events
  const refreshEvents = async () => {
    return await loadEvents()
  }

  // Clear events data
  const clearEvents = () => {
    recentEvents.value = []
    dashboardSummary.value = null
    error.value = null
    lastFetchTime.value = null
  }

  return {
    // Reactive data
    recentEvents: readonly(recentEvents),
    formattedEvents,
    dashboardSummary: readonly(dashboardSummary),
    isLoading: readonly(isLoading),
    error: readonly(error),
    lastFetchTime: readonly(lastFetchTime),
    
    // Methods
    loadEvents,
    refreshEvents,
    clearEvents
  }
}