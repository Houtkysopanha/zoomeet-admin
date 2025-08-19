/**
 * Event Isolation Composable
 * Manages proper data isolation when switching between different events
 * Ensures each event's data is loaded fresh and doesn't mix with other events
 */

import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useEventStore } from './useEventStore'
import { useEventTabsStore } from './useEventTabs'

export function useEventIsolation() {
  const eventStore = useEventStore()
  const tabsStore = useEventTabsStore()
  
  // Track current event context
  const currentEventId = ref(null)
  const previousEventId = ref(null)
  const isEventSwitching = ref(false)
  
  // Event change detection
  const detectEventChange = (newEventId) => {
    const newId = newEventId?.toString()
    const currentId = currentEventId.value?.toString()
    
    if (!newId) return false
    if (!currentId) return true // First load
    
    return newId !== currentId
  }
  
  // Clear all data for event switch
  const clearDataForEventSwitch = async (newEventId) => {
    console.log('🧹 Event Isolation: Clearing data for event switch', {
      from: currentEventId.value,
      to: newEventId,
      timestamp: new Date().toISOString()
    })
    
    isEventSwitching.value = true
    
    try {
      // Clear tab store data
      tabsStore.clearAllTabDataForEventSwitch(newEventId)
      
      // Clear any component-level data via events
      window.dispatchEvent(new CustomEvent('clearEventData', {
        detail: {
          previousEventId: currentEventId.value,
          newEventId: newEventId,
          timestamp: Date.now()
        }
      }))
      
      // Update tracking
      previousEventId.value = currentEventId.value
      currentEventId.value = newEventId
      
      console.log('✅ Event Isolation: Data cleared successfully')
      
    } catch (error) {
      console.error('❌ Event Isolation: Error clearing data:', error)
    } finally {
      isEventSwitching.value = false
    }
  }
  
  // Initialize event context
  const initializeEventContext = (eventId) => {
    const newId = eventId?.toString()
    if (!newId) return
    
    console.log('🎯 Event Isolation: Initializing context', {
      eventId: newId,
      isFirstLoad: !currentEventId.value
    })
    
    if (detectEventChange(newId)) {
      clearDataForEventSwitch(newId)
    } else {
      currentEventId.value = newId
    }
  }
  
  // Watch for event store changes
  watch(
    () => eventStore.currentEvent?.id,
    (newEventId) => {
      if (newEventId) {
        initializeEventContext(newEventId)
      }
    },
    { immediate: true }
  )
  
  // Validate event context for operations
  const validateEventContext = (operationEventId) => {
    const opId = operationEventId?.toString()
    const currentId = currentEventId.value?.toString()
    
    if (!opId || !currentId) return false
    if (opId !== currentId) {
      console.warn('⚠️ Event Isolation: Context mismatch', {
        operation: opId,
        current: currentId
      })
      return false
    }
    
    return true
  }
  
  // Get current event context
  const getCurrentEventContext = () => ({
    currentEventId: currentEventId.value,
    previousEventId: previousEventId.value,
    isEventSwitching: isEventSwitching.value
  })
  
  // Force refresh current event data
  const refreshCurrentEventData = async () => {
    if (!currentEventId.value) return
    
    console.log('🔄 Event Isolation: Refreshing current event data')
    
    try {
      // Clear and reload from API
      await eventStore.loadEventById(currentEventId.value)
      
      // Trigger data reload in components
      window.dispatchEvent(new CustomEvent('refreshEventData', {
        detail: {
          eventId: currentEventId.value,
          timestamp: Date.now()
        }
      }))
      
    } catch (error) {
      console.error('❌ Event Isolation: Error refreshing data:', error)
    }
  }
  
  return {
    // State
    currentEventId: readonly(currentEventId),
    previousEventId: readonly(previousEventId),
    isEventSwitching: readonly(isEventSwitching),
    
    // Methods
    detectEventChange,
    clearDataForEventSwitch,
    initializeEventContext,
    validateEventContext,
    getCurrentEventContext,
    refreshCurrentEventData
  }
}

/**
 * Tab-specific event isolation hook
 * Use this in tab components for automatic event isolation
 */
export function useTabEventIsolation(tabIndex, componentName = 'Unknown') {
  const { 
    currentEventId, 
    validateEventContext, 
    getCurrentEventContext 
  } = useEventIsolation()
  
  const tabsStore = useEventTabsStore()
  
  // Component state
  const isDataLoaded = ref(false)
  const lastLoadedEventId = ref(null)
  
  // Check if component data is valid for current event
  const isDataValidForCurrentEvent = () => {
    const currentId = currentEventId.value?.toString()
    const lastLoadedId = lastLoadedEventId.value?.toString()
    
    return currentId && lastLoadedId && currentId === lastLoadedId
  }
  
  // Clear component data
  const clearComponentData = (newEventId = null) => {
    console.log(`🧹 ${componentName}: Clearing component data`, {
      tabIndex,
      newEventId,
      previousEventId: lastLoadedEventId.value
    })
    
    // Clear tab store data for this tab
    tabsStore.clearTabData(tabIndex, newEventId)
    
    // Reset component state
    isDataLoaded.value = false
    lastLoadedEventId.value = newEventId
    
    return true
  }
  
  // Load data for current event
  const loadDataForCurrentEvent = async (loadFunction) => {
    const eventId = currentEventId.value
    if (!eventId) return false
    
    console.log(`📥 ${componentName}: Loading data for event`, {
      tabIndex,
      eventId,
      componentName
    })
    
    try {
      // Validate event context
      if (!validateEventContext(eventId)) {
        console.warn(`⚠️ ${componentName}: Invalid event context`)
        return false
      }
      
      // Call the provided load function
      if (typeof loadFunction === 'function') {
        await loadFunction(eventId)
      }
      
      // Mark as loaded
      isDataLoaded.value = true
      lastLoadedEventId.value = eventId
      
      console.log(`✅ ${componentName}: Data loaded successfully`)
      return true
      
    } catch (error) {
      console.error(`❌ ${componentName}: Error loading data:`, error)
      isDataLoaded.value = false
      return false
    }
  }
  
  // Event listeners for isolation
  const handleClearEventData = (event) => {
    const { newEventId } = event.detail || {}
    clearComponentData(newEventId)
  }
  
  const handleRefreshEventData = (event) => {
    const { eventId } = event.detail || {}
    if (eventId === currentEventId.value) {
      isDataLoaded.value = false // Force reload
    }
  }
  
  // Setup event listeners
  onMounted(() => {
    window.addEventListener('clearEventData', handleClearEventData)
    window.addEventListener('refreshEventData', handleRefreshEventData)
    
    console.log(`🎯 ${componentName}: Event isolation initialized`, {
      tabIndex,
      currentEventId: currentEventId.value
    })
  })
  
  onUnmounted(() => {
    window.removeEventListener('clearEventData', handleClearEventData)
    window.removeEventListener('refreshEventData', handleRefreshEventData)
  })
  
  // Watch for event changes
  watch(currentEventId, (newEventId, oldEventId) => {
    if (newEventId !== oldEventId) {
      console.log(`🔄 ${componentName}: Event changed`, {
        from: oldEventId,
        to: newEventId,
        tabIndex
      })
      
      clearComponentData(newEventId)
    }
  })
  
  return {
    // State
    currentEventId: readonly(currentEventId),
    isDataLoaded: readonly(isDataLoaded),
    lastLoadedEventId: readonly(lastLoadedEventId),
    
    // Methods
    isDataValidForCurrentEvent,
    clearComponentData,
    loadDataForCurrentEvent,
    validateEventContext,
    getCurrentEventContext
  }
}