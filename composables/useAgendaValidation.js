import { ref, computed } from 'vue'
import { useFormValidation } from './useFormValidation'

export const useAgendaValidation = () => {
  const { 
    validateRequired, 
    validateTimeRange, 
    setFieldError, 
    clearFieldError, 
    getFieldError,
    errors 
  } = useFormValidation()
  
  const agendaErrors = ref({})
  
  // Clear all agenda errors
  const clearAgendaErrors = () => {
    agendaErrors.value = {}
  }
  
  // Set agenda field error
  const setAgendaFieldError = (field, message) => {
    agendaErrors.value[field] = message
  }
  
  // Get agenda field error
  const getAgendaFieldError = (field) => {
    return agendaErrors.value[field] || ''
  }
  
  // Validate agenda form data
  const validateAgendaForm = (agendaData) => {
    clearAgendaErrors()
    const validationErrors = []
    
    // Validate required fields
    if (!agendaData.date) {
      setAgendaFieldError('date', 'Date is required')
      validationErrors.push('Date is required')
    }
    
    if (!agendaData.time_start) {
      setAgendaFieldError('time_start', 'Start time is required')
      validationErrors.push('Start time is required')
    }
    
    if (!agendaData.time_end) {
      setAgendaFieldError('time_end', 'End time is required')
      validationErrors.push('End time is required')
    }
    
    if (!agendaData.title || !agendaData.title.trim()) {
      setAgendaFieldError('title', 'Session title is required')
      validationErrors.push('Session title is required')
    }
    
    // Validate time range
    if (agendaData.time_start && agendaData.time_end) {
      const timeError = validateTimeRange(agendaData.time_start, agendaData.time_end)
      if (timeError) {
        setAgendaFieldError('time_end', timeError)
        validationErrors.push(timeError)
      }
    }
    
    // Validate date is not in the past (optional)
    if (agendaData.date) {
      const selectedDate = new Date(agendaData.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        setAgendaFieldError('date', 'Date cannot be in the past')
        validationErrors.push('Date cannot be in the past')
      }
    }
    
    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      fieldErrors: agendaErrors.value
    }
  }
  
  // Validate speakers array
  const validateSpeakers = (speakers) => {
    const speakerErrors = []
    
    if (!speakers || !Array.isArray(speakers)) {
      return { isValid: true, errors: [] }
    }
    
    speakers.forEach((speaker, index) => {
      if (speaker.name && speaker.name.trim()) {
        if (!speaker.about || !speaker.about.trim()) {
          speakerErrors.push(`Speaker ${index + 1}: About information is required when speaker name is provided`)
        }
      }
    })
    
    return {
      isValid: speakerErrors.length === 0,
      errors: speakerErrors
    }
  }
  
  // Validate agenda item for API submission
  const validateAgendaForAPI = (agendaData) => {
    const validation = validateAgendaForm(agendaData)
    const speakerValidation = validateSpeakers(agendaData.speakers)
    
    const allErrors = [...validation.errors, ...speakerValidation.errors]
    
    return {
      isValid: validation.isValid && speakerValidation.isValid,
      errors: allErrors,
      fieldErrors: validation.fieldErrors
    }
  }
  
  // Format agenda data for API
  const formatAgendaForAPI = (agendaData) => {
    return {
      date: agendaData.date ? new Date(agendaData.date).toISOString().split('T')[0] : null,
      time_start: agendaData.time_start,
      time_end: agendaData.time_end,
      title: agendaData.title?.trim(),
      venu: agendaData.venu?.trim() || null,
      room_no: agendaData.room_no?.trim() || null,
      description: agendaData.description?.trim() || null,
      speakers: agendaData.speakers?.filter(speaker => 
        speaker.name && speaker.name.trim()
      ).map(speaker => ({
        name: speaker.name.trim(),
        about: speaker.about?.trim() || null
      })) || [],
      is_break: agendaData.is_break || false
    }
  }
  
  // Calculate day number based on event start date
  const calculateDayNumber = (agendaDate, eventStartDate) => {
    if (!agendaDate || !eventStartDate) return 1
    
    const startDate = new Date(eventStartDate)
    const itemDate = new Date(agendaDate)
    
    // Reset time to compare dates only
    startDate.setHours(0, 0, 0, 0)
    itemDate.setHours(0, 0, 0, 0)
    
    const timeDiff = itemDate.getTime() - startDate.getTime()
    const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24))
    
    return Math.max(1, dayDiff + 1)
  }
  
  // Group agenda items by days
  const groupAgendaByDays = (agendaItems, eventStartDate, eventEndDate) => {
    if (!eventStartDate || !eventEndDate) {
      return [{ date: new Date(), items: agendaItems || [] }]
    }
    
    const startDate = new Date(eventStartDate)
    const endDate = new Date(eventEndDate)
    const days = []
    
    // Calculate number of days between start and end
    const timeDiff = endDate.getTime() - startDate.getTime()
    const dayCount = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1
    
    // Create day structure
    for (let i = 0; i < dayCount; i++) {
      const dayDate = new Date(startDate)
      dayDate.setDate(startDate.getDate() + i)
      
      const dayItems = (agendaItems || []).filter(item => {
        if (!item.date) return false
        const itemDate = new Date(item.date)
        return itemDate.toDateString() === dayDate.toDateString()
      })
      
      // Sort items by time
      dayItems.sort((a, b) => {
        if (!a.time_start || !b.time_start) return 0
        return a.time_start.localeCompare(b.time_start)
      })
      
      days.push({
        date: dayDate,
        dayNumber: i + 1,
        items: dayItems
      })
    }
    
    return days.length > 0 ? days : [{ date: new Date(), dayNumber: 1, items: [] }]
  }
  
  return {
    // State
    agendaErrors,
    
    // Validation functions
    validateAgendaForm,
    validateSpeakers,
    validateAgendaForAPI,
    
    // Error handling
    clearAgendaErrors,
    setAgendaFieldError,
    getAgendaFieldError,
    
    // Utility functions
    formatAgendaForAPI,
    calculateDayNumber,
    groupAgendaByDays,
    
    // Computed
    hasAgendaErrors: computed(() => Object.keys(agendaErrors.value).length > 0)
  }
}