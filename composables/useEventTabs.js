import { ref, reactive, computed } from 'vue'
import { defineStore } from 'pinia'

export const useEventTabsStore = defineStore('eventTabs', () => {
  const activeTab = ref(0)
  const completedTabs = ref(new Set())
  const isTabChanging = ref(false)
  
  // Enhanced tab data persistence with timestamps and validation
  const tabData = reactive({
    basicInfo: {
      eventName: '',
      category: null,
      description: '',
      startDate: null,
      endDate: null,
      location: '',
      mapUrl: '',
      company: '',
      organizer: '',
      onlineLinkMeeting: null,
      eventSlug: '',
      coverImageFile: null,
      eventBackgroundFile: null,
      cardBackgroundFile: null,
      chairs: [],
      members: [],
      lastSaved: null,
      isComplete: false
    },
    agenda: {
      sessions: [],
      speakers: [],
      schedule: [],
      isSkipped: false,
      lastSaved: null,
      isComplete: false
    },
    tickets: {
      ticketTypes: [],
      pricing: {},
      availability: {},
      lastSaved: null,
      isComplete: false
    },
    breakoutRooms: {
      rooms: [],
      settings: {},
      lastSaved: null,
      isComplete: false
    },
    settings: {
      policies: {},
      configurations: {},
      registrationDeadline: null,
      refundPolicy: null,
      termsAndConditions: '',
      specialInstructions: '',
      requireAgeVerification: false,
      minimumAge: null,
      requiredIdentityDocuments: [],
      lastSaved: null,
      isComplete: false
    }
  })

  // Track if data has been modified in each tab with enhanced tracking
  const tabModified = ref({
    0: false, // Basic Info
    1: false, // Agenda
    2: false, // Tickets
    3: false, // Breakout Rooms
    4: false  // Settings
  })

  // Track last interaction time for each tab
  const tabLastInteraction = ref({
    0: null,
    1: null,
    2: null,
    3: null,
    4: null
  })

  // Computed properties for better state management
  const hasAnyUnsavedChanges = computed(() => {
    return Object.values(tabModified.value).some(modified => modified)
  })

  const getTabCompletionStatus = computed(() => {
    return {
      basicInfo: tabData.basicInfo.isComplete,
      agenda: tabData.agenda.isComplete,
      tickets: tabData.tickets.isComplete,
      breakoutRooms: tabData.breakoutRooms.isComplete,
      settings: tabData.settings.isComplete
    }
  })

  function markTabComplete(tabIndex) {
    completedTabs.value.add(tabIndex)
    const tabKeys = ['basicInfo', 'agenda', 'tickets', 'breakoutRooms', 'settings']
    const tabKey = tabKeys[tabIndex]
    if (tabKey && tabData[tabKey]) {
      tabData[tabKey].isComplete = true
      tabData[tabKey].lastSaved = new Date().toISOString()
    }
  }

  function isTabCompleted(tabIndex) {
    return completedTabs.value.has(tabIndex)
  }

  function setActiveTab(index) {
    // Record last interaction time for previous tab
    if (activeTab.value !== null) {
      tabLastInteraction.value[activeTab.value] = new Date().toISOString()
    }
    activeTab.value = index
  }

  function resetTabs() {
    activeTab.value = 0
    completedTabs.value = new Set()
    
    // Reset all tab data with enhanced structure
    tabData.basicInfo = {
      eventName: '',
      category: null,
      description: '',
      startDate: null,
      endDate: null,
      location: '',
      mapUrl: '',
      company: '',
      organizer: '',
      onlineLinkMeeting: null,
      eventSlug: '',
      coverImageFile: null,
      eventBackgroundFile: null,
      cardBackgroundFile: null,
      chairs: [],
      members: [],
      lastSaved: null,
      isComplete: false
    }
    
    tabData.agenda = {
      sessions: [],
      speakers: [],
      schedule: [],
      isSkipped: false,
      lastSaved: null,
      isComplete: false
    }
    
    tabData.tickets = {
      ticketTypes: [],
      pricing: {},
      availability: {},
      lastSaved: null,
      isComplete: false
    }
    
    tabData.breakoutRooms = {
      rooms: [],
      settings: {},
      lastSaved: null,
      isComplete: false
    }
    
    tabData.settings = {
      policies: {},
      configurations: {},
      registrationDeadline: null,
      refundPolicy: null,
      termsAndConditions: '',
      specialInstructions: '',
      requireAgeVerification: false,
      minimumAge: null,
      requiredIdentityDocuments: [],
      lastSaved: null,
      isComplete: false
    }
    
    // Reset modification tracking
    Object.keys(tabModified.value).forEach(key => {
      tabModified.value[key] = false
    })
    
    // Reset interaction tracking
    Object.keys(tabLastInteraction.value).forEach(key => {
      tabLastInteraction.value[key] = null
    })
  }

  // Enhanced save data for a specific tab with validation
  function saveTabData(tabIndex, data) {
    const tabKeys = ['basicInfo', 'agenda', 'tickets', 'breakoutRooms', 'settings']
    const tabKey = tabKeys[tabIndex]
    
    if (tabKey && tabData[tabKey]) {
      // Merge the new data with existing data
      Object.assign(tabData[tabKey], data)
      
      // Update timestamps and modification status
      tabData[tabKey].lastSaved = new Date().toISOString()
      tabModified.value[tabIndex] = true
      tabLastInteraction.value[tabIndex] = new Date().toISOString()
      
      // Auto-validate completion for certain tabs
      if (tabIndex === 0) { // Basic Info
        tabData[tabKey].isComplete = !!(
          tabData[tabKey].eventName &&
          tabData[tabKey].category &&
          tabData[tabKey].description &&
          tabData[tabKey].startDate &&
          tabData[tabKey].endDate &&
          tabData[tabKey].location
        )
      }
      
      console.log(`💾 Tab ${tabIndex} (${tabKey}) data saved:`, {
        dataKeys: Object.keys(data),
        isComplete: tabData[tabKey].isComplete,
        lastSaved: tabData[tabKey].lastSaved
      })
    }
  }

  // Get data for a specific tab with metadata
  function getTabData(tabIndex) {
    const tabKeys = ['basicInfo', 'agenda', 'tickets', 'breakoutRooms', 'settings']
    const tabKey = tabKeys[tabIndex]
    
    if (tabKey && tabData[tabKey]) {
      return {
        ...tabData[tabKey],
        _metadata: {
          tabIndex,
          tabKey,
          hasUnsavedChanges: tabModified.value[tabIndex],
          lastInteraction: tabLastInteraction.value[tabIndex]
        }
      }
    }
    return {}
  }

  // Check if tab has unsaved changes with enhanced logic
  function hasUnsavedChanges(tabIndex) {
    return tabModified.value[tabIndex] || false
  }

  // Mark tab as saved with timestamp
  function markTabSaved(tabIndex) {
    tabModified.value[tabIndex] = false
    const tabKeys = ['basicInfo', 'agenda', 'tickets', 'breakoutRooms', 'settings']
    const tabKey = tabKeys[tabIndex]
    if (tabKey && tabData[tabKey]) {
      tabData[tabKey].lastSaved = new Date().toISOString()
    }
  }

  // Get tab statistics for debugging and UI
  function getTabStats() {
    return {
      activeTab: activeTab.value,
      completedTabs: Array.from(completedTabs.value),
      hasUnsavedChanges: hasAnyUnsavedChanges.value,
      tabModified: { ...tabModified.value },
      lastInteractions: { ...tabLastInteraction.value },
      completionStatus: getTabCompletionStatus.value
    }
  }

  // Validate tab data completeness
  function validateTabData(tabIndex) {
    const tabKeys = ['basicInfo', 'agenda', 'tickets', 'breakoutRooms', 'settings']
    const tabKey = tabKeys[tabIndex]
    
    if (!tabKey || !tabData[tabKey]) return false
    
    switch (tabIndex) {
      case 0: // Basic Info
        return !!(
          tabData[tabKey].eventName &&
          tabData[tabKey].category &&
          tabData[tabKey].description &&
          tabData[tabKey].startDate &&
          tabData[tabKey].endDate &&
          tabData[tabKey].location
        )
      case 1: // Agenda
        return tabData[tabKey].isSkipped === true || tabData[tabKey].sessions?.length > 0
      case 2: // Tickets
        return tabData[tabKey].ticketTypes?.length > 0
      case 3: // Breakout Rooms
        return tabData[tabKey].rooms?.length > 0
      case 4: // Settings
        return !!(
          tabData[tabKey].registrationDeadline ||
          tabData[tabKey].termsAndConditions
        )
      default:
        return false
    }
  }

  // Enhanced load event data into tabs with comprehensive CRUD support and event isolation
  function loadEventData(eventData) {
    if (!eventData) {
      console.warn('⚠️ No event data provided to loadEventData')
      return
    }
    
    // Clear all existing tab data first to prevent data mixing
    console.log('🧹 Clearing existing tab data before loading new event data')
    resetTabs()
    
    console.log('📥 Loading event data into tabs with CRUD support:', {
      id: eventData.id,
      name: eventData.name,
      hasTickets: !!eventData.ticket_types?.length,
      hasAgendas: !!eventData.agendas?.length,
      isPublished: eventData.is_published,
      status: eventData.status
    })
    
    const loadTimestamp = new Date().toISOString()
    
    // Enhanced basic info data loading with all fields
    tabData.basicInfo = {
      eventName: eventData.name || '',
      category: eventData.category_id || null,
      description: eventData.description || '',
      startDate: eventData.start_date ? new Date(eventData.start_date) : null,
      endDate: eventData.end_date ? new Date(eventData.end_date) : null,
      location: eventData.location || '',
      mapUrl: eventData.map_url || '',
      company: eventData.company || '',
      organizer: eventData.organizer || '',
      onlineLinkMeeting: eventData.online_link_meeting || null,
      eventSlug: eventData.event_slug || '',
      coverImageFile: null, // Files need to be handled separately
      eventBackgroundFile: null,
      cardBackgroundFile: null,
      chairs: eventData.chairs || [],
      members: eventData.members || [],
      // Additional metadata for CRUD operations
      eventId: eventData.id,
      isPublished: eventData.is_published || false,
      status: eventData.status || 'draft',
      createdAt: eventData.created_at,
      updatedAt: eventData.updated_at,
      lastSaved: loadTimestamp,
      isComplete: !!(eventData.name && eventData.category_id && eventData.location && eventData.start_date && eventData.end_date),
      hasUnsavedChanges: false
    }
    
    // Enhanced agenda data loading
    if (eventData.agendas && eventData.agendas.length > 0) {
      tabData.agenda = {
        sessions: eventData.agendas.map(agenda => ({
          ...agenda,
          id: agenda.id,
          eventId: eventData.id
        })),
        speakers: eventData.speakers || [],
        schedule: eventData.schedule || [],
        isSkipped: false,
        eventId: eventData.id,
        lastSaved: loadTimestamp,
        isComplete: true,
        hasUnsavedChanges: false
      }
    } else {
      // Reset agenda data if no agendas - could be skipped or empty
      tabData.agenda = {
        sessions: [],
        speakers: [],
        schedule: [],
        isSkipped: false, // Will be set by component if needed
        eventId: eventData.id,
        lastSaved: null,
        isComplete: false,
        hasUnsavedChanges: false
      }
    }
    
    // Enhanced ticket data loading with CRUD metadata
    if (eventData.ticket_types && eventData.ticket_types.length > 0) {
      tabData.tickets = {
        ticketTypes: eventData.ticket_types.map(ticket => ({
          ...ticket,
          id: ticket.id,
          ticket_type_id: ticket.id, // For update operations
          eventId: eventData.id,
          name: ticket.name,
          description: ticket.description || ticket.tag || '',
          price: parseFloat(ticket.price) || 0,
          quantity: parseInt(ticket.total) || 0,
          sort_order: ticket.sort_order || 1,
          is_active: ticket.is_active !== undefined ? ticket.is_active : true
        })),
        pricing: {},
        availability: {},
        eventId: eventData.id,
        lastSaved: loadTimestamp,
        isComplete: true,
        hasUnsavedChanges: false
      }
    } else {
      // Reset ticket data if no tickets
      tabData.tickets = {
        ticketTypes: [],
        pricing: {},
        availability: {},
        eventId: eventData.id,
        lastSaved: null,
        isComplete: false,
        hasUnsavedChanges: false
      }
    }
    
    // Enhanced settings data loading
    if (eventData.settings) {
      tabData.settings = {
        ...tabData.settings,
        ...eventData.settings,
        eventId: eventData.id,
        lastSaved: loadTimestamp,
        isComplete: true,
        hasUnsavedChanges: false
      }
    } else {
      // Reset settings with event ID
      tabData.settings = {
        policies: {},
        configurations: {},
        registrationDeadline: null,
        refundPolicy: null,
        termsAndConditions: '',
        specialInstructions: '',
        requireAgeVerification: false,
        minimumAge: null,
        requiredIdentityDocuments: [],
        eventId: eventData.id,
        lastSaved: null,
        isComplete: false,
        hasUnsavedChanges: false
      }
    }
    
    // Mark tabs as completed based on available data
    if (eventData.name && eventData.category_id && eventData.location) {
      markTabComplete(0)
    }
    if (eventData.agendas?.length > 0) {
      markTabComplete(1)
    }
    if (eventData.ticket_types?.length > 0) {
      markTabComplete(2)
    }
    if (eventData.settings) {
      markTabComplete(4)
    }
    
    // Clear modification flags since this is freshly loaded data
    Object.keys(tabModified.value).forEach(key => {
      tabModified.value[key] = false
    })
    
    console.log('✅ Event data loaded into tab persistence with CRUD support:', {
      completedTabs: Array.from(completedTabs.value),
      basicInfoComplete: tabData.basicInfo.isComplete,
      ticketsCount: tabData.tickets.ticketTypes.length,
      agendasCount: tabData.agenda.sessions.length,
      eventId: eventData.id,
      isPublished: tabData.basicInfo.isPublished
    })
  }

  // Enhanced function to get event data for API operations
  function getEventDataForAPI() {
    const basicInfo = tabData.basicInfo
    if (!basicInfo.eventId) {
      console.warn('⚠️ No event ID found in tab data')
      return null
    }

    return {
      id: basicInfo.eventId,
      name: basicInfo.eventName,
      category_id: basicInfo.category,
      description: basicInfo.description,
      start_date: basicInfo.startDate,
      end_date: basicInfo.endDate,
      location: basicInfo.location,
      map_url: basicInfo.mapUrl,
      company: basicInfo.company,
      organizer: basicInfo.organizer,
      online_link_meeting: basicInfo.onlineLinkMeeting,
      event_slug: basicInfo.eventSlug,
      is_published: basicInfo.isPublished,
      status: basicInfo.status,
      chairs: basicInfo.chairs,
      members: basicInfo.members,
      ticket_types: tabData.tickets.ticketTypes,
      agendas: tabData.agenda.sessions,
      settings: tabData.settings
    }
  }

  // Function to mark tab as having unsaved changes
  function markTabModified(tabIndex) {
    tabModified.value[tabIndex] = true
    tabLastInteraction.value[tabIndex] = new Date().toISOString()
    
    // Update the specific tab's hasUnsavedChanges flag
    const tabKeys = ['basicInfo', 'agenda', 'tickets', 'breakoutRooms', 'settings']
    const tabKey = tabKeys[tabIndex]
    if (tabKey && tabData[tabKey]) {
      tabData[tabKey].hasUnsavedChanges = true
    }
  }

  // Function to clear unsaved changes flag
  function clearTabModifications(tabIndex) {
    tabModified.value[tabIndex] = false
    
    const tabKeys = ['basicInfo', 'agenda', 'tickets', 'breakoutRooms', 'settings']
    const tabKey = tabKeys[tabIndex]
    if (tabKey && tabData[tabKey]) {
      tabData[tabKey].hasUnsavedChanges = false
      tabData[tabKey].lastSaved = new Date().toISOString()
    }
  }

  // Function to clear specific tab data with event context
  function clearTabData(tabIndex, eventId = null) {
    const tabKeys = ['basicInfo', 'agenda', 'tickets', 'breakoutRooms', 'settings']
    const tabKey = tabKeys[tabIndex]
    
    if (tabKey && tabData[tabKey]) {
      console.log(`🧹 Clearing tab ${tabIndex} (${tabKey}) data${eventId ? ` for event ${eventId}` : ''}`)
      
      // Reset tab data based on tab type
      switch (tabIndex) {
        case 0: // Basic Info
          tabData[tabKey] = {
            eventName: '',
            category: null,
            description: '',
            startDate: null,
            endDate: null,
            location: '',
            mapUrl: '',
            company: '',
            organizer: '',
            onlineLinkMeeting: null,
            eventSlug: '',
            coverImageFile: null,
            eventBackgroundFile: null,
            cardBackgroundFile: null,
            chairs: [],
            members: [],
            eventId: eventId || null,
            lastSaved: null,
            isComplete: false
          }
          break
        case 1: // Agenda
          tabData[tabKey] = {
            sessions: [],
            speakers: [],
            schedule: [],
            isSkipped: false,
            eventId: eventId || null,
            lastSaved: null,
            isComplete: false
          }
          break
        case 2: // Tickets
          tabData[tabKey] = {
            ticketTypes: [],
            pricing: {},
            availability: {},
            eventId: eventId || null,
            lastSaved: null,
            isComplete: false
          }
          break
        case 3: // Breakout Rooms
          tabData[tabKey] = {
            rooms: [],
            settings: {},
            eventId: eventId || null,
            lastSaved: null,
            isComplete: false
          }
          break
        case 4: // Settings
          tabData[tabKey] = {
            policies: {},
            configurations: {},
            registrationDeadline: null,
            refundPolicy: null,
            termsAndConditions: '',
            specialInstructions: '',
            requireAgeVerification: false,
            minimumAge: null,
            requiredIdentityDocuments: [],
            eventId: eventId || null,
            lastSaved: null,
            isComplete: false
          }
          break
      }
      
      // Clear modification flags
      tabModified.value[tabIndex] = false
      tabLastInteraction.value[tabIndex] = null
      
      // Remove from completed tabs
      completedTabs.value.delete(tabIndex)
      
      console.log(`✅ Tab ${tabIndex} (${tabKey}) data cleared${eventId ? ` for event ${eventId}` : ''}`)
    }
  }

  // Function to clear all tab data for event switching
  function clearAllTabDataForEventSwitch(newEventId = null) {
    console.log(`🧹 Clearing all tab data for event switch${newEventId ? ` to event ${newEventId}` : ''}`)
    
    // Clear all tabs
    for (let i = 0; i < 5; i++) {
      clearTabData(i, newEventId)
    }
    
    // Reset active tab to basic info
    activeTab.value = 0
    
    console.log(`✅ All tab data cleared for event switch`)
  }

  // Function to validate event context for data operations
  function validateEventContext(tabIndex, eventId) {
    const tabKeys = ['basicInfo', 'agenda', 'tickets', 'breakoutRooms', 'settings']
    const tabKey = tabKeys[tabIndex]
    
    if (!tabKey || !tabData[tabKey]) return false
    
    // Check if tab data belongs to the current event
    const tabEventId = tabData[tabKey].eventId
    if (tabEventId && eventId && tabEventId !== eventId) {
      console.warn(`⚠️ Event context mismatch for tab ${tabIndex}: expected ${eventId}, found ${tabEventId}`)
      return false
    }
    
    return true
  }

  return {
    // State
    activeTab,
    isTabChanging,
    tabData,
    tabModified,
    tabLastInteraction,
    
    // Computed
    hasAnyUnsavedChanges,
    getTabCompletionStatus,
    
    // Actions
    setActiveTab,
    markTabComplete,
    isTabCompleted,
    resetTabs,
    saveTabData,
    getTabData,
    hasUnsavedChanges,
    markTabSaved,
    loadEventData,
    getTabStats,
    validateTabData,
    clearTabData,
    
    // Enhanced CRUD operations
    getEventDataForAPI,
    markTabModified,
    clearTabModifications,
    
    // Event isolation functions
    clearAllTabDataForEventSwitch,
    validateEventContext,
  }
})
