import { ref, reactive, computed } from 'vue'
import { defineStore } from 'pinia'

export const useEventTabsStore = defineStore('eventTabs', () => {
  const activeTab = ref(0)
  const completedTabs = ref(new Set())
  const isTabChanging = ref(false)
  
  // Enhanced tab data persistence with timestamps and validation
  // Add dedicated storage for chair files
  const chairFiles = reactive(new Map())

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
      chairFileObjects: new Map(), // Store chair file objects separately
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
      registrationDeadline: null,
      refundPolicyOption: null,
      maxTicketPerPerson: 5,
      ticketTransferDeadline: null,
      qrcodeAvailableHours: '48 hours before event starts',
      termsAndConditions: '',
      specialInstructions: '',
      acceptCashPayment: false,
      requireAgeVerification: false,
      minimumAgeOptions: null,
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
    const existingChairFileObjects = tabData.basicInfo?.chairFileObjects instanceof Map ? tabData.basicInfo.chairFileObjects : null;
    
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
      chairFileObjects: existingChairFileObjects || reactive(new Map()), // Preserve existing chairFileObjects
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
      registrationDeadline: null,
      refundPolicyOption: null,
      maxTicketPerPerson: 5,
      ticketTransferDeadline: null,
      qrcodeAvailableHours: '48 hours before event starts',
      termsAndConditions: '',
      specialInstructions: '',
      acceptCashPayment: false,
      requireAgeVerification: false,
      minimumAgeOptions: null,
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

  // Enhanced save data for a specific tab with validation and chair file handling
  function saveTabData(tabIndex, data) {
    const tabKeys = ['basicInfo', 'agenda', 'tickets', 'breakoutRooms', 'settings']
    const tabKey = tabKeys[tabIndex]
    
    if (tabKey && tabData[tabKey]) {
      // Special handling for chairs with file objects
      if (tabKey === 'basicInfo' && data.chairs) {
        // Initialize chairFileObjects as a reactive Map if it doesn't exist
        if (!tabData[tabKey].chairFileObjects || !(tabData[tabKey].chairFileObjects instanceof Map)) {
          tabData[tabKey].chairFileObjects = reactive(new Map())
        }
        
        // CRITICAL FIX: Store chair files and preserve existing files
        data.chairs.forEach(chair => {
          // If there's a new profile_image File, store it
          if (chair.profile_image instanceof File) {
            tabData[tabKey].chairFileObjects.set(chair.id, chair.profile_image)
          }
          // Preserve existing file if no new file provided
          else if (!tabData[tabKey].chairFileObjects.has(chair.id) && chair.profile_image_url) {
            // Keep the existing profile_image_url
            chair.profile_image = chair.profile_image_url
          }
          // Get file from existing chairFileObjects if available
          else if (tabData[tabKey].chairFileObjects.has(chair.id)) {
            const existingFile = tabData[tabKey].chairFileObjects.get(chair.id)
            if (existingFile instanceof File) {
            }
          }
        })
      }

      // Merge the new data with existing data
      Object.assign(tabData[tabKey], data)
      
      // Update timestamps and modification status
      tabData[tabKey].lastSaved = new Date().toISOString()
      tabModified.value[tabIndex] = true
      tabLastInteraction.value[tabIndex] = new Date().toISOString()
      
      // Restore file objects to chairs after save
      if (tabKey === 'basicInfo' && tabData[tabKey].chairs) {
        tabData[tabKey].chairs = tabData[tabKey].chairs.map(chair => ({
          ...chair,
          imageFile: tabData[tabKey].chairFileObjects?.get(chair.id) || chair.imageFile || null
        }))
      }
      
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
    }
  }

  // Get data for a specific tab with metadata and chair file handling
  function getTabData(tabIndex) {
    const tabKeys = ['basicInfo', 'agenda', 'tickets', 'breakoutRooms', 'settings']
    const tabKey = tabKeys[tabIndex]
    
    if (tabKey && tabData[tabKey]) {
      const data = { ...tabData[tabKey] }

      // CRITICAL FIX: Enhanced handling for chair files in basic info tab
      if (tabKey === 'basicInfo' && data.chairs) {
        data.chairs = data.chairs.map(chair => {
          const chairCopy = { ...chair }
          
          // Priority 1: Get file from chairFileObjects Map
          if (data.chairFileObjects?.has(chair.id)) {
            const storedFile = data.chairFileObjects.get(chair.id)
            if (storedFile instanceof File) {
              chairCopy.profile_image = storedFile
              chairCopy.profile_image_local = URL.createObjectURL(storedFile)
            }
          }
          // Priority 2: Keep existing profile_image_url if no new file
          else if (chair.profile_image_url) {
            chairCopy.profile_image = chair.profile_image_url

          }
          
          return chairCopy
        })
      }
      
      return {
        ...data,
        _metadata: {
          tabIndex,
          tabKey,
          hasUnsavedChanges: tabModified.value[tabIndex],
          lastInteraction: tabLastInteraction.value[tabIndex],
          chairFilesCount: tabKey === 'basicInfo' ? data.chairFileObjects?.size : 0
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
    
    // Save existing chair file objects before resetting
    const existingChairFileObjects = tabData.basicInfo?.chairFileObjects instanceof Map ? 
      tabData.basicInfo.chairFileObjects : new Map();
    
    // Clear all existing tab data first to prevent data mixing
    resetTabs()
    
    // Restore chair file objects
    if (existingChairFileObjects.size > 0) {
      tabData.basicInfo.chairFileObjects = existingChairFileObjects;
    }
    
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
      chairs: (eventData.chairs || []).map(chair => ({
        ...chair,
        id: chair.id || chair.event_id || 633,
        event_id: chair.event_id || null,
        profile_image: chair.profile_image_url ? chair.profile_image_url : null,
        profile_image_url: chair.profile_image_url || null
      })),
      chairFileObjects: tabData.basicInfo?.chairFileObjects || reactive(new Map()), // Preserve existing chairFileObjects
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
        registrationDeadline: null,
        refundPolicyOption: null,
        maxTicketPerPerson: 5,
        ticketTransferDeadline: null,
        qrcodeAvailableHours: '48 hours before event starts',
        termsAndConditions: '',
        specialInstructions: '',
        acceptCashPayment: false,
        requireAgeVerification: false,
        minimumAgeOptions: null,
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
  
  }

  // Enhanced function to get event data for API operations
  function getEventDataForAPI() {
    const basicInfo = tabData.basicInfo
    if (!basicInfo.eventId) {
      console.warn('⚠️ No event ID found in tab data')
      return null
    }

    // Process chairs with file objects and preserved IDs
    const processedChairs = basicInfo.chairs.map(chair => {
      // Ensure chair has an ID and preserve it
      const chairId = chair.id || chair.event_id || 633;
      
      const chairWithFiles = {
        ...chair,
        id: chairId,
        event_id: chair.event_id || null
      }
      
      // Get file from chairFileObjects Map using preserved ID
      const fileObject = basicInfo.chairFileObjects?.get(chairId)
      if (fileObject instanceof File) {
        chairWithFiles.profile_image = fileObject
      } else if (chair.profile_image instanceof File) {
        chairWithFiles.profile_image = chair.profile_image
      } else if (chair.profile_image_url) {
        chairWithFiles.profile_image_url = chair.profile_image_url
      }
      
      return chairWithFiles
    })

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
      chairs: processedChairs,
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
      
    }
  }

  // Function to clear all tab data for event switching
  function clearAllTabDataForEventSwitch(newEventId = null) {
    // Clear all tabs
    for (let i = 0; i < 5; i++) {
      clearTabData(i, newEventId)
    }
    
    // Reset active tab to basic info
    activeTab.value = 0
    
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
