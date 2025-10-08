import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getEventDetails, updateEvent, getEventTicketTypes } from './api'

export const useEventStore = defineStore('event', () => {
  // State
  const currentEvent = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const eventsCache = ref(new Map()) // Cache for all loaded events

  // Computed
  const hasCurrentEvent = computed(() => !!currentEvent.value)
  const getAllEvents = computed(() => Array.from(eventsCache.value.values()))
  
  // Actions
  function setCurrentEvent(eventData) {
    if (!eventData) return
    
    // Log incoming data
    
    // Use the original API data if available
    const dataToNormalize = eventData._original || eventData
    
    // Normalize the data structure
    const normalizedData = normalizeEventData(dataToNormalize)
    
    // Keep the complete original data
    normalizedData._original = dataToNormalize
    
    // Update both current event and cache
    currentEvent.value = normalizedData
    eventsCache.value.set(normalizedData.id.toString(), normalizedData)
    
    // Log the stored data
  }

  function normalizeEventData(data) {
    // Validate UUID
    const eventId = data.id?.toString()
    if (!eventId || !eventId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      throw new Error('Invalid event ID format. Expected UUID format.')
    }

    // Log incoming data structure

    // Create normalized data structure that preserves ALL fields
    const normalized = {
      // Basic Info
      id: eventId,
      name: data.name || '',
      description: data.description || '',
      
      // Category Info
      category_id: data.category_id || null,
      category_name: data.category_name || '',
      
      // Dates
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      created_at: data.created_at || null,
      updated_at: data.updated_at || null,
      
      // Location Info
      location: data.location || '',
      map_url: data.map_url || '',
      online_link_meeting: data.online_link_meeting || null,
      
      // Organization Info
      company: data.company || '',
      organizer: data.organizer || '',
      event_slug: data.event_slug || '',
      
      // Status Flags
      is_published: data.is_published === true || data.is_published === 1 || data.is_published === '1',
      is_ended: data.is_ended === true || data.is_ended === 1 || data.is_ended === '1',
      status: data.status || (data.is_published ? 'active' : 'draft'), // Ensure status is always set
      
      // Images
      cover_image_url: data.cover_image_url || null,
      event_background_url: data.event_background_url || null,
      card_background_url: data.card_background_url || null,
      
      // Related Data
      chairs: data.chairs || [],
      members: data.members || [],
      agendas: data.agendas || [],
      settings: data.settings || null,
      ticket_types: data.ticket_types || [],
      
      // New Fields - tags and chair_label
      tags: data.tags || null,
      chair_label: data.chair_label || data.label_title || null,
      label_title: data.label_title || data.chair_label || null, // backward compatibility
      
      // Keep ALL other fields from the original data
      ...data
    }

    // Log normalized structure

    return normalized
  }

  async function loadEventById(eventId) {
    if (!eventId) {
      return null
    }
    

    const eventIdStr = eventId.toString()
    
    // Validate UUID format
    if (!eventIdStr.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      throw new Error('Invalid event ID format. Expected UUID format.')
    }


    // Check cache first for this specific event
    if (eventsCache.value.has(eventIdStr)) {
      const cachedEvent = eventsCache.value.get(eventIdStr)
      currentEvent.value = cachedEvent
      return cachedEvent
    }

    // Clear only current event, keep cache for other events
    clearCurrentEvent()
    isLoading.value = true
    error.value = null

    // Log the loading attempt

    try {
      const response = await getEventDetails(eventIdStr)
      
      // Validate response
      if (!response) {
        throw new Error('No response from API')
      }
      
      if (!response.data) {
        throw new Error('Response missing data field')
      }

      // Get event data and validate
      const eventData = normalizeEventData(response.data)
      
      // Strict ID verification
      if (!eventData.id) {
        throw new Error('Event data missing ID')
      }

      // Fetch ticket types
      try {
        const ticketResponse = await getEventTicketTypes(eventIdStr)
        if (ticketResponse && ticketResponse.data) {
          eventData.ticket_types = ticketResponse.data
        }
      } catch (ticketError) {
        eventData.ticket_types = []
      }

      const loadedIdStr = eventData.id.toString()
      if (loadedIdStr !== eventIdStr) {
        throw new Error(`ID mismatch: requested ${eventIdStr} but got ${loadedIdStr}`)
      }

      // Store the complete event data with all fields

      // Create complete event object with ALL fields intact
      const completeEvent = {
        ...eventData,
        _original: response.data // Keep original API response
      }

      // Set current event and cache it
      currentEvent.value = completeEvent
      eventsCache.value.set(eventIdStr, completeEvent)

      // Log success with field verification

      return currentEvent.value

    } catch (e) {
      error.value = e.message || 'Failed to load event'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function updateCurrentEvent(updatedData) {
    if (!currentEvent.value?.id) {
      throw new Error('No current event to update')
    }

    isLoading.value = true
    error.value = null

    try {

      // Pre-update current event immediately for optimistic UI update
      const optimisticUpdate = {
        ...currentEvent.value,
        ...updatedData,
        _pendingUpdate: true
      }
      setCurrentEvent(optimisticUpdate)

      const response = await updateEvent(currentEvent.value.id, updatedData)

      if (!response || !response.data) {
        throw new Error('No response from update operation')
      }

      // Merge API response with any local changes to ensure we don't lose data
      const updatedEvent = normalizeEventData({
        ...response.data,
        _original: response.data,
        _lastUpdate: new Date().toISOString()
      })


      // Update both current event and cache
      setCurrentEvent(updatedEvent)
      return updatedEvent

    } catch (e) {
      error.value = e.message || 'Failed to update event'
      
      // Revert optimistic update on failure
      if (currentEvent.value?._pendingUpdate) {
        await loadEventById(currentEvent.value.id)
      }
      
      throw e
    } finally {
      isLoading.value = false
    }
  }

  function clearCurrentEvent() {
    currentEvent.value = null
    error.value = null
  }

  function clearCache() {
    eventsCache.value.clear()
    clearCurrentEvent()
  }

  // Get event from cache without setting as current
  function getEventFromCache(eventId) {
    const eventIdStr = eventId?.toString()
    if (!eventIdStr) return null
    
    return eventsCache.value.get(eventIdStr) || null
  }

  // Check if event exists in cache
  function hasEventInCache(eventId) {
    const eventIdStr = eventId?.toString()
    if (!eventIdStr) return false
    
    return eventsCache.value.has(eventIdStr)
  }

  // Track event click for analytics/debugging
  function trackEventClick(eventId) {
    
    // Store click tracking in session storage for debugging
    if (process.client) {
      const clickHistory = JSON.parse(sessionStorage.getItem('eventClickHistory') || '[]')
      clickHistory.push({
        eventId,
        timestamp: new Date().toISOString(),
        action: 'edit_click'
      })
      // Keep only last 10 clicks
      if (clickHistory.length > 10) {
        clickHistory.shift()
      }
      sessionStorage.setItem('eventClickHistory', JSON.stringify(clickHistory))
    }
  }

  return {
    // State
    currentEvent,
    isLoading,
    error,
    eventsCache,
    
    // Computed
    hasCurrentEvent,
    getAllEvents,
    
    // Actions
    setCurrentEvent,
    loadEventById,
    updateCurrentEvent,
    clearCurrentEvent,
    clearCache,
    trackEventClick,
    getEventFromCache,
    hasEventInCache,
  }
})
