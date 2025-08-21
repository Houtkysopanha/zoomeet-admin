import { ref, computed } from 'vue'

export const useFormValidation = () => {
  const errors = ref({})
  const isValidating = ref(false)

  // Clear all errors
  const clearErrors = () => {
    errors.value = {}
  }

  // Clear specific field error
  const clearFieldError = (field) => {
    if (errors.value[field]) {
      delete errors.value[field]
    }
  }

  // Set field error
  const setFieldError = (field, message) => {
    errors.value[field] = message
  }

  // Check if form has any errors
  const hasErrors = computed(() => {
    return Object.keys(errors.value).length > 0
  })

  // Get error for specific field
  const getFieldError = (field) => {
    return errors.value[field] || ''
  }

  // Validate required field
  const validateRequired = (value, fieldName) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} is required`
    }
    return null
  }

  // Validate email format
  const validateEmail = (email) => {
    if (!email) return null
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) ? null : 'Please enter a valid email address'
  }

  // Validate URL format
  const validateUrl = (url) => {
    if (!url) return null
    try {
      new URL(url)
      return null
    } catch {
      return null // Removed validation message
    }
  }

  // Validate date range - allow same date/time
  const validateDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return null
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (end < start) {
      return 'End date and time cannot be before start date and time'
    }
    return null
  }

  // Validate time range - allow same time
  const validateTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) return null
    
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)
    
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    
    if (endMinutes < startMinutes) {
      return 'End time cannot be before start time'
    }
    return null
  }

  // Validate file size
  const validateFileSize = (file, maxSizeMB = 5) => {
    if (!file) return null
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSizeMB}MB`
    }
    return null
  }

  // Validate file type
  const validateFileType = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif']) => {
    if (!file) return null
    if (!allowedTypes.includes(file.type)) {
      return `File type must be one of: ${allowedTypes.map(type => type.split('/')[1]).join(', ')}`
    }
    return null
  }

  // Validate event slug
  const validateSlug = (slug) => {
    if (!slug) return 'Event slug is required'
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    if (!slugRegex.test(slug)) {
      return 'Slug can only contain lowercase letters, numbers, and hyphens'
    }
    return null
  }

  // Validate chair data
  const validateChair = (chair) => {
    const chairErrors = {}
    
    if (!chair.name || chair.name.trim() === '') {
      chairErrors.name = 'Chair name is required'
    }
    
    if (!chair.position || chair.position.trim() === '') {
      chairErrors.position = 'Position is required'
    }
    
    if (!chair.company || chair.company.trim() === '') {
      chairErrors.company = 'Company/Ministry is required'
    }
    
    if (chair.sort_order && (isNaN(chair.sort_order) || chair.sort_order < 1)) {
      chairErrors.sort_order = 'Sort order must be a positive number'
    }
    
    return chairErrors
  }

  // Validate agenda item
  const validateAgendaItem = (agenda) => {
    const agendaErrors = {}
    
    if (!agenda.day || agenda.day < 1) {
      agendaErrors.day = 'Please select a valid day'
    }
    
    if (!agenda.date) {
      agendaErrors.date = 'Date is required'
    }
    
    if (!agenda.time_start) {
      agendaErrors.time_start = 'Start time is required'
    }
    
    if (!agenda.time_end) {
      agendaErrors.time_end = 'End time is required'
    }
    
    if (agenda.time_start && agenda.time_end) {
      const timeError = validateTimeRange(agenda.time_start, agenda.time_end)
      if (timeError) {
        agendaErrors.time_range = timeError
      }
    }
    
    if (!agenda.title || agenda.title.trim() === '') {
      agendaErrors.title = 'Session title is required'
    }
    
    // Validate speakers if provided
    if (agenda.speakers && agenda.speakers.length > 0) {
      agenda.speakers.forEach((speaker, index) => {
        if (speaker.name && speaker.name.trim() !== '' && (!speaker.about || speaker.about.trim() === '')) {
          agendaErrors[`speaker_${index}_about`] = `About information is required for ${speaker.name}`
        }
      })
    }
    
    return agendaErrors
  }

  // Validate basic event info
  const validateBasicInfo = (eventData) => {
    const basicErrors = {}
    
    const requiredFields = [
      { field: 'name', label: 'Event Name' },
      { field: 'category_id', label: 'Category' },
      { field: 'description', label: 'Description' },
      { field: 'start_date', label: 'Start Date' },
      { field: 'end_date', label: 'End Date' },
      { field: 'location', label: 'Location' },
      { field: 'event_slug', label: 'Event Slug' }
    ]
    
    requiredFields.forEach(({ field, label }) => {
      const error = validateRequired(eventData[field], label)
      if (error) {
        basicErrors[field] = error
      }
    })
    
    // Validate slug format
    if (eventData.event_slug) {
      const slugError = validateSlug(eventData.event_slug)
      if (slugError) {
        basicErrors.event_slug = slugError
      }
    }
    
    // Validate date range
    if (eventData.start_date && eventData.end_date) {
      const dateError = validateDateRange(eventData.start_date, eventData.end_date)
      if (dateError) {
        basicErrors.date_range = dateError
      }
    }
    
    // Validate URLs if provided
    if (eventData.map_url) {
      const urlError = validateUrl(eventData.map_url)
      if (urlError) {
        basicErrors.map_url = urlError
      }
    }
    
    // Online link is optional, but if provided, must be valid URL
    if (eventData.online_link_meeting && eventData.online_link_meeting.trim()) {
      const urlError = validateUrl(eventData.online_link_meeting)
      if (urlError) {
        basicErrors.online_link_meeting = urlError
      }
    }
    
    return basicErrors
  }

  // Real-time validation for forms
  const validateField = (field, value, validationType = 'required') => {
    clearFieldError(field)
    
    let error = null
    
    switch (validationType) {
      case 'required':
        error = validateRequired(value, field)
        break
      case 'email':
        error = validateEmail(value)
        break
      case 'url':
        error = validateUrl(value)
        break
      case 'slug':
        error = validateSlug(value)
        break
      default:
        break
    }
    
    if (error) {
      setFieldError(field, error)
    }
    
    return !error
  }

  return {
    errors,
    isValidating,
    hasErrors,
    clearErrors,
    clearFieldError,
    setFieldError,
    getFieldError,
    validateRequired,
    validateEmail,
    validateUrl,
    validateDateRange,
    validateTimeRange,
    validateFileSize,
    validateFileType,
    validateSlug,
    validateChair,
    validateAgendaItem,
    validateBasicInfo,
    validateField
  }
}