import { ref, computed, reactive } from 'vue'

export const useAgendaValidation = () => {
  // Validation rules
  const validationRules = {
    date: {
      required: true,
      message: 'Date is required'
    },
    time_start: {
      required: true,
      pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
      message: 'Start time is required and must be in HH:MM format'
    },
    time_end: {
      required: true,
      pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
      message: 'End time is required and must be in HH:MM format'
    },
    title: {
      required: true,
      minLength: 3,
      maxLength: 255,
      message: 'Title is required (3-255 characters)'
    },
    description: {
      maxLength: 1000,
      message: 'Description must not exceed 1000 characters'
    },
    venue: {
      maxLength: 255,
      message: 'Venue must not exceed 255 characters'
    },
    room_no: {
      maxLength: 50,
      message: 'Room number must not exceed 50 characters'
    },
    speaker_name: {
      maxLength: 255,
      message: 'Speaker name must not exceed 255 characters'
    },
    speaker_description: {
      maxLength: 1000,
      message: 'Speaker description must not exceed 1000 characters'
    },
    speaker_image: {
      fileTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      maxSize: 5 * 1024 * 1024, // 5MB
      message: 'Speaker image must be an image file (JPEG, PNG, GIF, WebP) and not exceed 5MB'
    }
  }

  // Time validation helpers
  const timeToMinutes = (timeString) => {
    if (!timeString || typeof timeString !== 'string') return 0
    const [hours, minutes] = timeString.split(':').map(Number)
    return hours * 60 + minutes
  }

  const isValidTimeFormat = (timeString) => {
    return validationRules.time_start.pattern.test(timeString)
  }

  const isEndTimeAfterStartTime = (startTime, endTime) => {
    if (!startTime || !endTime) return true // Skip if either is empty
    if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) return true // Skip if invalid format
    
    return timeToMinutes(endTime) > timeToMinutes(startTime)
  }

  const isValidDateFormat = (date) => {
    if (!date) return false
    
    // Handle Date object
    if (date instanceof Date) {
      return !isNaN(date.getTime())
    }
    
    // Handle string date (YYYY-MM-DD format)
    if (typeof date === 'string') {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(date)) return false
      
      const parsedDate = new Date(date)
      return !isNaN(parsedDate.getTime())
    }
    
    return false
  }

  const isDateInFuture = (date) => {
    if (!date) return true // Skip validation if no date
    
    const inputDate = date instanceof Date ? date : new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day
    
    return inputDate >= today
  }

  const isValidFileType = (file, allowedTypes) => {
    if (!file || !(file instanceof File)) return true // Skip if no file
    return allowedTypes.includes(file.type)
  }

  const isValidFileSize = (file, maxSize) => {
    if (!file || !(file instanceof File)) return true // Skip if no file
    return file.size <= maxSize
  }

  // Main validation function
  const validateField = (fieldName, value, additionalRules = {}) => {
    const rules = { ...validationRules[fieldName], ...additionalRules }
    const errors = []

    // Required validation
    if (rules.required) {
      if (value === null || value === undefined || value === '' || 
          (typeof value === 'string' && value.trim() === '')) {
        errors.push(rules.message || `${fieldName} is required`)
        return errors // Return early if required field is empty
      }
    }

    // Skip other validations if field is empty and not required
    if (!rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return errors
    }

    // Pattern validation
    if (rules.pattern && typeof value === 'string') {
      if (!rules.pattern.test(value)) {
        errors.push(rules.message || `${fieldName} format is invalid`)
      }
    }

    // Length validations
    if (rules.minLength && typeof value === 'string') {
      if (value.trim().length < rules.minLength) {
        errors.push(`${fieldName} must be at least ${rules.minLength} characters`)
      }
    }

    if (rules.maxLength && typeof value === 'string') {
      if (value.trim().length > rules.maxLength) {
        errors.push(`${fieldName} must not exceed ${rules.maxLength} characters`)
      }
    }

    // File validations
    if (rules.fileTypes && value instanceof File) {
      if (!isValidFileType(value, rules.fileTypes)) {
        errors.push(`${fieldName} must be one of: ${rules.fileTypes.join(', ')}`)
      }
    }

    if (rules.maxSize && value instanceof File) {
      if (!isValidFileSize(value, rules.maxSize)) {
        const maxSizeMB = (rules.maxSize / (1024 * 1024)).toFixed(1)
        errors.push(`${fieldName} must not exceed ${maxSizeMB}MB`)
      }
    }

    return errors
  }

  // Validate entire agenda form
  const validateAgendaForm = (formData) => {
    const errors = {}
    let isValid = true

    // Validate each field
    Object.keys(validationRules).forEach(fieldName => {
      const fieldErrors = validateField(fieldName, formData[fieldName])
      if (fieldErrors.length > 0) {
        errors[fieldName] = fieldErrors
        isValid = false
      }
    })

    // Custom validations
    
    // Date validation
    if (formData.date) {
      if (!isValidDateFormat(formData.date)) {
        errors.date = errors.date || []
        errors.date.push('Invalid date format')
        isValid = false
      } else if (!isDateInFuture(formData.date)) {
        errors.date = errors.date || []
        errors.date.push('Date must be today or in the future')
        isValid = false
      }
    }

    // Time range validation
    if (formData.time_start && formData.time_end) {
      if (!isEndTimeAfterStartTime(formData.time_start, formData.time_end)) {
        errors.time_end = errors.time_end || []
        errors.time_end.push('End time must be after start time')
        isValid = false
      }

      // Check for reasonable duration (at least 15 minutes)
      const duration = timeToMinutes(formData.time_end) - timeToMinutes(formData.time_start)
      if (duration < 15) {
        errors.time_end = errors.time_end || []
        errors.time_end.push('Session must be at least 15 minutes long')
        isValid = false
      }

      // Check for maximum duration (12 hours)
      if (duration > 720) {
        errors.time_end = errors.time_end || []
        errors.time_end.push('Session cannot exceed 12 hours')
        isValid = false
      }
    }

    // Speaker validation - if speaker name is provided, description should be provided too
    if (formData.speaker_name && formData.speaker_name.trim() && 
        (!formData.speaker_description || !formData.speaker_description.trim())) {
      errors.speaker_description = errors.speaker_description || []
      errors.speaker_description.push('Speaker description is required when speaker name is provided')
      isValid = false
    }

    return {
      isValid,
      errors,
      errorCount: Object.keys(errors).length,
      firstError: Object.keys(errors)[0] || null
    }
  }

  // Time slot conflict validation
  const validateTimeSlotConflict = (formData, existingAgendas = [], excludeAgendaId = null) => {
    if (!formData.date || !formData.time_start || !formData.time_end) {
      return { hasConflict: false, conflictingAgendas: [] }
    }

    const formDate = formData.date instanceof Date ? 
      formData.date.toISOString().split('T')[0] : 
      formData.date

    const conflictingAgendas = existingAgendas.filter(agenda => {
      // Skip if it's the same agenda being edited
      if (excludeAgendaId && agenda.id === excludeAgendaId) {
        return false
      }

      // Check if it's the same date
      if (agenda.date !== formDate) {
        return false
      }

      // Check for time overlap
      const formStart = timeToMinutes(formData.time_start)
      const formEnd = timeToMinutes(formData.time_end)
      const agendaStart = timeToMinutes(agenda.time_start)
      const agendaEnd = timeToMinutes(agenda.time_end)

      // Check for overlap: (start1 < end2) && (start2 < end1)
      return (formStart < agendaEnd) && (agendaStart < formEnd)
    })

    return {
      hasConflict: conflictingAgendas.length > 0,
      conflictingAgendas,
      conflictMessage: conflictingAgendas.length > 0 ? 
        `Time slot conflicts with: ${conflictingAgendas.map(a => a.title).join(', ')}` : 
        null
    }
  }

  // Utility functions for form helpers
  const formatTimeForDisplay = (timeString) => {
    if (!timeString || !isValidTimeFormat(timeString)) return timeString
    
    const [hours, minutes] = timeString.split(':')
    const hour24 = parseInt(hours)
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
    const ampm = hour24 >= 12 ? 'PM' : 'AM'
    
    return `${hour12}:${minutes} ${ampm}`
  }

  const formatDateForDisplay = (date) => {
    if (!date) return ''
    
    const dateObj = date instanceof Date ? date : new Date(date)
    if (isNaN(dateObj.getTime())) return ''
    
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime || !isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
      return ''
    }

    const duration = timeToMinutes(endTime) - timeToMinutes(startTime)
    if (duration <= 0) return ''

    const hours = Math.floor(duration / 60)
    const minutes = duration % 60

    if (hours === 0) {
      return `${minutes} min`
    } else if (minutes === 0) {
      return `${hours} hr`
    } else {
      return `${hours} hr ${minutes} min`
    }
  }

  // Generate time options for dropdowns
  const generateTimeOptions = (interval = 15, startHour = 0, endHour = 23) => {
    const options = []
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        options.push({
          value: timeString,
          label: formatTimeForDisplay(timeString),
          sortValue: hour * 60 + minute
        })
      }
    }
    
    return options
  }

  return {
    // Validation functions
    validateField,
    validateAgendaForm,
    validateTimeSlotConflict,
    
    // Helper functions
    isValidTimeFormat,
    isEndTimeAfterStartTime,
    isValidDateFormat,
    isDateInFuture,
    isValidFileType,
    isValidFileSize,
    
    // Utility functions
    formatTimeForDisplay,
    formatDateForDisplay,
    calculateDuration,
    generateTimeOptions,
    timeToMinutes,
    
    // Validation rules (for reference)
    validationRules
  }
}

// Composable for reactive form validation
export const useAgendaFormValidation = (initialData = {}) => {
  const { validateAgendaForm, validateTimeSlotConflict } = useAgendaValidation()
  
  const formData = reactive({
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
    is_break: false,
    ...initialData
  })

  const validationResult = ref({
    isValid: false,
    errors: {},
    errorCount: 0,
    firstError: null
  })

  const conflictResult = ref({
    hasConflict: false,
    conflictingAgendas: [],
    conflictMessage: null
  })

  const validate = (existingAgendas = [], excludeAgendaId = null) => {
    // Validate form fields
    validationResult.value = validateAgendaForm(formData)
    
    // Check for time slot conflicts
    conflictResult.value = validateTimeSlotConflict(formData, existingAgendas, excludeAgendaId)
    
    return {
      isValid: validationResult.value.isValid && !conflictResult.value.hasConflict,
      fieldErrors: validationResult.value.errors,
      conflictError: conflictResult.value.conflictMessage,
      hasConflict: conflictResult.value.hasConflict
    }
  }

  const resetForm = () => {
    Object.assign(formData, {
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
    
    validationResult.value = {
      isValid: false,
      errors: {},
      errorCount: 0,
      firstError: null
    }
    
    conflictResult.value = {
      hasConflict: false,
      conflictingAgendas: [],
      conflictMessage: null
    }
  }

  const setFormData = (data) => {
    Object.assign(formData, data)
  }

  const isFormValid = computed(() => {
    return validationResult.value.isValid && !conflictResult.value.hasConflict
  })

  const hasErrors = computed(() => {
    return validationResult.value.errorCount > 0 || conflictResult.value.hasConflict
  })

  const allErrors = computed(() => {
    const errors = { ...validationResult.value.errors }
    
    if (conflictResult.value.hasConflict) {
      errors.timeConflict = [conflictResult.value.conflictMessage]
    }
    
    return errors
  })

  return {
    formData,
    validationResult,
    conflictResult,
    isFormValid,
    hasErrors,
    allErrors,
    validate,
    resetForm,
    setFormData
  }
}