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
    console.log('📥 Setting current event:', {
      id: eventData.id,
      name: eventData.name,
      fields: Object.keys(eventData)
    })
    
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
    console.log('✅ Current event set:', {
      id: normalizedData.id,
      name: normalizedData.name,
      category: `${normalizedData.category_id} - ${normalizedData.category_name}`,
      image_urls: {
        cover: normalizedData.cover_image_url,
        background: normalizedData.event_background_url,
        card: normalizedData.card_background_url
      }
    })
  }

  function normalizeEventData(data) {
    // Validate UUID
    const eventId = data.id?.toString()
    if (!eventId || !eventId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      console.error('❌ Invalid UUID format:', eventId)
      throw new Error('Invalid event ID format. Expected UUID format.')
    }

    // Log incoming data structure
    console.log('📥 Normalizing event data:', {
      id: eventId,
      fields: Object.keys(data)
    })

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
      
      // Keep ALL other fields from the original data
      ...data
    }

    // Log normalized structure
    console.log('✅ Normalized event structure:', {
      id: normalized.id,
      name: normalized.name,
      category: `${normalized.category_id} - ${normalized.category_name}`,
      fields: Object.keys(normalized)
    })

    return normalized
  }

  async function loadEventById(eventId) {
    if (!eventId) {
      console.error('❌ No event ID provided to loadEventById')
      return null
    }
    
    console.log('🔍 Loading event by ID:', eventId)

    const eventIdStr = eventId.toString()
    
    // Validate UUID format
    if (!eventIdStr.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      console.error('❌ Invalid event ID format:', eventIdStr)
      throw new Error('Invalid event ID format. Expected UUID format.')
    }

    console.log(`🔍 Loading event ID: ${eventIdStr}`)

    // Always clear previous state to prevent data mixing
    clearCurrentEvent()
    clearCache()
    isLoading.value = true
    error.value = null

    // Log the loading attempt
    console.log('🔄 Starting event load:', {
      id: eventIdStr,
      state: {
        currentEvent: !!currentEvent.value,
        isLoading: isLoading.value,
        error: error.value
      }
    })

    try {
      console.log('🔄 Force loading fresh event details for:', eventIdStr)
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
      console.log('🎫 Fetching ticket types for event:', eventIdStr)
      try {
        const ticketResponse = await getEventTicketTypes(eventIdStr)
        if (ticketResponse && ticketResponse.data) {
          eventData.ticket_types = ticketResponse.data
          console.log(`✅ Loaded ${eventData.ticket_types.length} ticket types`)
        }
      } catch (ticketError) {
        console.warn('⚠️ Could not load ticket types:', ticketError)
        eventData.ticket_types = []
      }

      const loadedIdStr = eventData.id.toString()
      if (loadedIdStr !== eventIdStr) {
        console.error('ID mismatch:', {
          requested: eventIdStr,
          received: loadedIdStr
        })
        throw new Error(`ID mismatch: requested ${eventIdStr} but got ${loadedIdStr}`)
      }

      // Store the complete event data with all fields
      console.log('📦 Storing complete event data:', {
        id: eventData.id,
        name: eventData.name,
        category: `${eventData.category_id} - ${eventData.category_name}`,
        fields: Object.keys(eventData)
      })

      // Set current event with ALL fields intact
      currentEvent.value = {
        ...eventData,
        _original: response.data // Keep original API response
      }

      // Log success with field verification
      console.log('✅ Event loaded successfully:', {
        id: eventData.id,
        name: eventData.name,
        category_name: eventData.category_name,
        image_urls: {
          cover: eventData.cover_image_url,
          background: eventData.event_background_url,
          card: eventData.card_background_url
        },
        field_count: Object.keys(eventData).length
      })

      return currentEvent.value

    } catch (e) {
      console.error('❌ Failed to load event:', e)
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
      console.log('🔄 Updating event:', currentEvent.value.id)
      const response = await updateEvent(currentEvent.value.id, updatedData)

      if (!response || !response.data) {
        throw new Error('No response from update operation')
      }

      const updatedEvent = normalizeEventData(response.data)
      console.log('✅ Event updated:', updatedEvent.name)

      // Update both current event and cache
      setCurrentEvent(updatedEvent)
      return updatedEvent

    } catch (e) {
      console.error('❌ Failed to update event:', e)
      error.value = e.message || 'Failed to update event'
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

  return {
    // State
    currentEvent,
    isLoading,
    error,
    
    // Computed
    hasCurrentEvent,
    getAllEvents,
    
    // Actions
    setCurrentEvent,
    loadEventById,
    updateCurrentEvent,
    clearCurrentEvent,
    clearCache,
  }
})
