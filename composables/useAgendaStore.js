import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import { 
  getEventAgendas, 
  getAgendaDetails, 
  createAgenda, 
  updateAgenda, 
  deleteAgenda,
  createMultipleAgendas,
  getAgendasByDateRange
} from './api/agenda'

export const useAgendaStore = defineStore('agenda', () => {
  // State
  const agendas = ref([]) // Server-saved agendas
  const localAgendas = ref([]) // Local draft agendas (not saved to server yet)
  const speakers = ref([]) // Speaker management
  const currentAgenda = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const currentEventId = ref(null)
  
  // Form state for creating/editing agendas
  const agendaForm = reactive({
    date: null,
    time_start: '',
    time_end: '',
    title: '',
    description: '',
    venue: '',
    room_no: '',
    speaker_name: '',
    speaker_description: '',
    speaker_image: null,
    is_break: false
  })

  // Speaker form state
  const speakerForm = reactive({
    name: '',
    description: '',
    image: null,
    title: '',
    company: '',
    bio: ''
  })

  // Validation state
  const formErrors = ref({})
  const isFormValid = ref(false)

  // Computed properties
  const hasAgendas = computed(() => agendas.value.length > 0 || localAgendas.value.length > 0)
  const hasLocalAgendas = computed(() => localAgendas.value.length > 0)
  const hasSpeakers = computed(() => speakers.value.length > 0)
  
  // Combined agendas (server + local) for display
  const allAgendas = computed(() => {
    return [...agendas.value, ...localAgendas.value]
  })
  
  const agendasByDate = computed(() => {
    const grouped = {}
    allAgendas.value.forEach(agenda => {
      const date = agenda.date
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(agenda)
    })
    
    // Sort agendas within each date by start time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => {
        return a.time_start.localeCompare(b.time_start)
      })
    })
    
    return grouped
  })

  const sortedAgendas = computed(() => {
    return [...allAgendas.value].sort((a, b) => {
      // First sort by date
      const dateCompare = a.date.localeCompare(b.date)
      if (dateCompare !== 0) return dateCompare
      
      // Then sort by start time
      return a.time_start.localeCompare(b.time_start)
    })
  })

  const agendaStats = computed(() => {
    const total = allAgendas.value.length
    const breaks = allAgendas.value.filter(a => a.is_break).length
    const sessions = total - breaks
    const dates = [...new Set(allAgendas.value.map(a => a.date))].length
    const localCount = localAgendas.value.length
    const savedCount = agendas.value.length
    
    return {
      total,
      sessions,
      breaks,
      dates,
      localCount,
      savedCount
    }
  })

  // Actions
  function setCurrentEventId(eventId) {
    currentEventId.value = eventId
    console.log('📅 Current event ID set for agenda store:', eventId)
  }

  function resetForm() {
    Object.assign(agendaForm, {
      date: null,
      time_start: '',
      time_end: '',
      title: '',
      description: '',
      venue: '',
      room_no: '',
      speaker_name: '',
      speaker_description: '',
      speaker_image: null,
      is_break: false
    })
    formErrors.value = {}
    isFormValid.value = false
    console.log('📝 Agenda form reset')
  }

  function resetSpeakerForm() {
    Object.assign(speakerForm, {
      name: '',
      description: '',
      image: null,
      title: '',
      company: '',
      bio: ''
    })
    console.log('👤 Speaker form reset')
  }

  function validateForm() {
    const errors = {}
    
    // Required field validation
    if (!agendaForm.date) {
      errors.date = 'Date is required'
    }
    
    if (!agendaForm.time_start) {
      errors.time_start = 'Start time is required'
    } else if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(agendaForm.time_start)) {
      errors.time_start = 'Invalid time format (use HH:MM)'
    }
    
    if (!agendaForm.time_end) {
      errors.time_end = 'End time is required'
    } else if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(agendaForm.time_end)) {
      errors.time_end = 'Invalid time format (use HH:MM)'
    }
    
    if (!agendaForm.title || agendaForm.title.trim() === '') {
      errors.title = 'Title is required'
    }
    
    // Time validation
    if (agendaForm.time_start && agendaForm.time_end) {
      const startTime = new Date(`2000-01-01 ${agendaForm.time_start}`)
      const endTime = new Date(`2000-01-01 ${agendaForm.time_end}`)
      
      if (endTime <= startTime) {
        errors.time_end = 'End time must be after start time'
      }
    }
    
    // File validation
    if (agendaForm.speaker_image instanceof File) {
      if (!agendaForm.speaker_image.type.startsWith('image/')) {
        errors.speaker_image = 'Speaker image must be an image file'
      } else if (agendaForm.speaker_image.size > 5 * 1024 * 1024) {
        errors.speaker_image = 'Speaker image file size exceeds 5MB limit'
      }
    }
    
    formErrors.value = errors
    isFormValid.value = Object.keys(errors).length === 0
    
    console.log('🔍 Form validation result:', { isValid: isFormValid.value, errors })
    return isFormValid.value
  }

  function validateSpeakerForm() {
    const errors = {}
    
    if (!speakerForm.name || speakerForm.name.trim() === '') {
      errors.name = 'Speaker name is required'
    }
    
    if (!speakerForm.title || speakerForm.title.trim() === '') {
      errors.title = 'Speaker title is required'
    }
    
    // File validation for speaker image
    if (speakerForm.image instanceof File) {
      if (!speakerForm.image.type.startsWith('image/')) {
        errors.image = 'Speaker image must be an image file'
      } else if (speakerForm.image.size > 5 * 1024 * 1024) {
        errors.image = 'Speaker image file size exceeds 5MB limit'
      }
    }
    
    return Object.keys(errors).length === 0
  }

  function setFormData(data) {
    Object.assign(agendaForm, data)
    validateForm()
    console.log('📝 Agenda form data set:', data)
  }

  async function loadAgendas(eventId = null) {
    const targetEventId = eventId || currentEventId.value
    
    if (!targetEventId) {
      console.error('❌ No event ID provided for loading agendas')
      return
    }

    isLoading.value = true
    error.value = null

    try {
      console.log('📅 Loading agendas for event:', targetEventId)
      const response = await getEventAgendas(targetEventId)
      
      if (response && response.data) {
        agendas.value = Array.isArray(response.data) ? response.data : []
      } else if (Array.isArray(response)) {
        agendas.value = response
      } else {
        agendas.value = []
      }
      
      console.log('✅ Agendas loaded:', {
        count: agendas.value.length,
        eventId: targetEventId
      })
    } catch (err) {
      console.error('❌ Failed to load agendas:', err)
      error.value = err.message || 'Failed to load agendas'
      agendas.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function loadAgendaDetails(agendaId, eventId = null) {
    const targetEventId = eventId || currentEventId.value
    
    if (!targetEventId || !agendaId) {
      throw new Error('Event ID and Agenda ID are required')
    }

    isLoading.value = true
    error.value = null

    try {
      console.log('📅 Loading agenda details:', { eventId: targetEventId, agendaId })
      const response = await getAgendaDetails(targetEventId, agendaId)
      
      currentAgenda.value = response.data || response
      console.log('✅ Agenda details loaded:', currentAgenda.value)
      
      return currentAgenda.value
    } catch (err) {
      console.error('❌ Failed to load agenda details:', err)
      error.value = err.message || 'Failed to load agenda details'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function saveAgenda(formData = null, eventId = null) {
    const targetEventId = eventId || currentEventId.value
    
    if (!targetEventId) {
      throw new Error('Event ID is required')
    }

    // Use provided form data or fall back to internal agendaForm
    const dataToSave = formData || agendaForm

    // Validate the data to save
    if (!dataToSave.date || !dataToSave.time_start || !dataToSave.time_end || !dataToSave.title) {
      throw new Error('Form validation failed')
    }

    isLoading.value = true
    error.value = null

    try {
      console.log('📅 Saving agenda for event:', targetEventId)
      
      // Prepare agenda data
      const agendaData = {
        date: dataToSave.date instanceof Date ?
          dataToSave.date.toISOString().split('T')[0] :
          dataToSave.date,
        time_start: dataToSave.time_start,
        time_end: dataToSave.time_end,
        title: dataToSave.title?.trim() || '',
        description: dataToSave.description?.trim() || '',
        venue: dataToSave.venue?.trim() || '',
        room_no: dataToSave.room_no?.trim() || '',
        speaker_name: dataToSave.speaker_name?.trim() || '',
        speaker_description: dataToSave.speaker_description?.trim() || '',
        speaker_image: dataToSave.speaker_image,
        is_break: dataToSave.is_break || false
      }

      const response = await createAgenda(targetEventId, agendaData)
      
      // Add the new agenda to the list
      if (response.data) {
        agendas.value.push(response.data)
      }
      
      console.log('✅ Agenda saved successfully:', response)
      return response
    } catch (err) {
      console.error('❌ Failed to save agenda:', err)
      error.value = err.message || 'Failed to save agenda'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateExistingAgenda(agendaId, updatedData, eventId = null) {
    const targetEventId = eventId || currentEventId.value
    
    if (!targetEventId || !agendaId) {
      throw new Error('Event ID and Agenda ID are required')
    }

    isLoading.value = true
    error.value = null

    try {
      console.log('📅 Updating agenda:', { eventId: targetEventId, agendaId })
      
      const response = await updateAgenda(targetEventId, agendaId, updatedData)
      
      // Update the agenda in the list
      const index = agendas.value.findIndex(a => a.id === agendaId)
      if (index !== -1 && response.data) {
        agendas.value[index] = response.data
      }
      
      console.log('✅ Agenda updated successfully:', response)
      return response
    } catch (err) {
      console.error('❌ Failed to update agenda:', err)
      error.value = err.message || 'Failed to update agenda'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function removeAgenda(agendaId, eventId = null) {
    const targetEventId = eventId || currentEventId.value
    
    if (!targetEventId || !agendaId) {
      throw new Error('Event ID and Agenda ID are required')
    }

    isLoading.value = true
    error.value = null

    try {
      console.log('🗑️ Deleting agenda:', { eventId: targetEventId, agendaId })
      
      await deleteAgenda(targetEventId, agendaId)
      
      // Remove the agenda from the list
      agendas.value = agendas.value.filter(a => a.id !== agendaId)
      
      // Clear current agenda if it was the deleted one
      if (currentAgenda.value?.id === agendaId) {
        currentAgenda.value = null
      }
      
      console.log('✅ Agenda deleted successfully')
    } catch (err) {
      console.error('❌ Failed to delete agenda:', err)
      error.value = err.message || 'Failed to delete agenda'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function saveMultipleAgendas(agendasData, eventId = null) {
    const targetEventId = eventId || currentEventId.value
    
    if (!targetEventId || !Array.isArray(agendasData)) {
      throw new Error('Event ID and array of agenda data are required')
    }

    isLoading.value = true
    error.value = null

    try {
      console.log('📅 Saving multiple agendas for event:', targetEventId)
      
      const response = await createMultipleAgendas(targetEventId, agendasData)
      
      // Reload agendas to get the updated list
      await loadAgendas(targetEventId)
      
      console.log('✅ Multiple agendas saved:', response)
      return response
    } catch (err) {
      console.error('❌ Failed to save multiple agendas:', err)
      error.value = err.message || 'Failed to save multiple agendas'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function loadAgendasByDateRange(startDate, endDate, eventId = null) {
    const targetEventId = eventId || currentEventId.value
    
    if (!targetEventId || !startDate || !endDate) {
      throw new Error('Event ID, start date, and end date are required')
    }

    isLoading.value = true
    error.value = null

    try {
      console.log('📅 Loading agendas by date range:', { eventId: targetEventId, startDate, endDate })
      
      const response = await getAgendasByDateRange(targetEventId, startDate, endDate)
      
      if (response && response.data) {
        agendas.value = Array.isArray(response.data) ? response.data : []
      } else if (Array.isArray(response)) {
        agendas.value = response
      } else {
        agendas.value = []
      }
      
      console.log('✅ Agendas by date range loaded:', {
        count: agendas.value.length,
        dateRange: `${startDate} to ${endDate}`
      })
      
      return agendas.value
    } catch (err) {
      console.error('❌ Failed to load agendas by date range:', err)
      error.value = err.message || 'Failed to load agendas by date range'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function clearAgendas() {
    agendas.value = []
    currentAgenda.value = null
    currentEventId.value = null
    resetForm()
    console.log('🧹 Agenda store cleared')
  }

  // Helper functions
  function getAgendaById(agendaId) {
    return agendas.value.find(a => a.id === agendaId)
  }

  function getAgendasByDate(date) {
    return agendas.value.filter(a => a.date === date)
  }

  function isTimeSlotAvailable(date, startTime, endTime, excludeAgendaId = null) {
    const dayAgendas = getAgendasByDate(date).filter(a => 
      excludeAgendaId ? a.id !== excludeAgendaId : true
    )
    
    const newStart = new Date(`2000-01-01 ${startTime}`)
    const newEnd = new Date(`2000-01-01 ${endTime}`)
    
    return !dayAgendas.some(agenda => {
      const existingStart = new Date(`2000-01-01 ${agenda.time_start}`)
      const existingEnd = new Date(`2000-01-01 ${agenda.time_end}`)
      
      // Check for overlap
      return (newStart < existingEnd && newEnd > existingStart)
    })
  }

  return {
    // State
    agendas,
    currentAgenda,
    isLoading,
    error,
    currentEventId,
    agendaForm,
    formErrors,
    isFormValid,
    
    // Computed
    hasAgendas,
    agendasByDate,
    sortedAgendas,
    agendaStats,
    
    // Actions
    setCurrentEventId,
    resetForm,
    validateForm,
    setFormData,
    loadAgendas,
    loadAgendaDetails,
    saveAgenda,
    updateExistingAgenda,
    removeAgenda,
    saveMultipleAgendas,
    loadAgendasByDateRange,
    clearError,
    clearAgendas,
    
    // Helper functions
    getAgendaById,
    getAgendasByDate,
    isTimeSlotAvailable
  }
})