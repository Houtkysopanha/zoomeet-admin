import { useFontOptimization } from './useFontOptimization'

// Production-ready validation with enhanced error handling
export const useProductionValidation = () => {
  const { cleanTextForUrl, sanitizeText, generateFallbackText } = useFontOptimization()

  // Enhanced slug validation for production
  const validateSlug = (slug, eventName = '') => {
    try {
      if (!slug || typeof slug !== 'string') {
        return {
          isValid: false,
          cleanedSlug: generateFallbackText(eventName, 'event'),
          error: 'Slug is required'
        }
      }

      // Clean the slug
      let cleanedSlug = cleanTextForUrl(slug)
      
      // If cleaning results in empty string, generate from event name or fallback
      if (!cleanedSlug) {
        cleanedSlug = eventName ? cleanTextForUrl(eventName) : generateFallbackText('', 'event')
      }
      
      // Ensure minimum length
      if (cleanedSlug.length < 3) {
        const timestamp = Date.now().toString(36).slice(-4)
        cleanedSlug = cleanedSlug ? `${cleanedSlug}-${timestamp}` : `event-${timestamp}`
      }
      
      // Ensure maximum length for URLs
      if (cleanedSlug.length > 100) {
        cleanedSlug = cleanedSlug.substring(0, 97) + '...'
        cleanedSlug = cleanedSlug.replace(/\.\.\.$/, Date.now().toString(36).slice(-3))
      }

      return {
        isValid: true,
        cleanedSlug,
        error: null
      }
    } catch (error) {
      console.error('Slug validation error:', error)
      return {
        isValid: false,
        cleanedSlug: generateFallbackText('', 'event'),
        error: 'Slug validation failed'
      }
    }
  }

  // Validate required fields with better error messages
  const validateRequiredFields = (data, fieldDefinitions) => {
    const errors = {}
    const missing = []

    fieldDefinitions.forEach(({ field, label, validator }) => {
      const value = data[field]
      
      // Check if field is empty
      if (value === null || value === undefined || value === '' || 
          (typeof value === 'string' && value.trim() === '') ||
          (Array.isArray(value) && value.length === 0)) {
        missing.push(label)
        errors[field] = `${label} is required`
        return
      }

      // Run custom validator if provided
      if (validator && typeof validator === 'function') {
        try {
          const validationResult = validator(value)
          if (validationResult !== true) {
            errors[field] = validationResult || `${label} is invalid`
          }
        } catch (error) {
          console.error(`Validation error for ${field}:`, error)
          errors[field] = `${label} validation failed`
        }
      }
    })

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      missing,
      summary: missing.length > 0 ? `Missing: ${missing.join(', ')}` : null
    }
  }

  // Enhanced URL validation
  const validateUrl = (url, fieldName = 'URL') => {
    if (!url || typeof url !== 'string') {
      return { isValid: true, error: null } // Optional field
    }

    const trimmedUrl = url.trim()
    if (!trimmedUrl) {
      return { isValid: true, error: null }
    }

    try {
      // Check basic URL format
      if (!/^https?:\/\/.+/i.test(trimmedUrl)) {
        return {
          isValid: false,
          error: `${fieldName} must start with http:// or https://`
        }
      }

      // Try to create URL object for validation
      new URL(trimmedUrl)
      
      return { isValid: true, error: null }
    } catch (error) {
      return {
        isValid: false,
        error: `${fieldName} format is invalid`
      }
    }
  }

  // Enhanced date validation
  const validateDateRange = (startDate, endDate) => {
    try {
      if (!startDate || !endDate) {
        return {
          isValid: false,
          error: 'Both start and end dates are required'
        }
      }

      const start = new Date(startDate)
      const end = new Date(endDate)

      // Check if dates are valid
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return {
          isValid: false,
          error: 'Invalid date format'
        }
      }

      // Check if end date is after start date
      if (end <= start) {
        return {
          isValid: false,
          error: 'End date must be after start date'
        }
      }

      // Check if dates are not too far in the past
      const now = new Date()
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      
      if (start < oneYearAgo) {
        return {
          isValid: false,
          error: 'Start date cannot be more than one year in the past'
        }
      }

      // Check if dates are not too far in the future
      const fiveYearsFromNow = new Date(now.getFullYear() + 5, now.getMonth(), now.getDate())
      
      if (end > fiveYearsFromNow) {
        return {
          isValid: false,
          error: 'End date cannot be more than five years in the future'
        }
      }

      return { isValid: true, error: null }
    } catch (error) {
      console.error('Date validation error:', error)
      return {
        isValid: false,
        error: 'Date validation failed'
      }
    }
  }

  // Validate file uploads
  const validateFile = (file, options = {}) => {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
      fieldName = 'File'
    } = options

    if (!file) {
      return { isValid: true, error: null } // Optional file
    }

    // Check if it's actually a File object
    if (!(file instanceof File)) {
      return {
        isValid: false,
        error: `${fieldName} must be a valid file`
      }
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024))
      return {
        isValid: false,
        error: `${fieldName} must be smaller than ${maxSizeMB}MB`
      }
    }

    // Check file type
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      const allowedExtensions = allowedTypes.map(type => type.split('/')[1]).join(', ')
      return {
        isValid: false,
        error: `${fieldName} must be one of: ${allowedExtensions}`
      }
    }

    return { isValid: true, error: null }
  }

  // Sanitize and validate event data for production
  const validateEventData = (eventData) => {
    const errors = {}
    let hasErrors = false

    // Required field definitions
    const requiredFields = [
      { field: 'name', label: 'Event Name' },
      { field: 'category_id', label: 'Category', validator: (val) => !isNaN(Number(val)) || 'Category must be selected' },
      { field: 'description', label: 'Description' },
      { field: 'start_date', label: 'Start Date' },
      { field: 'end_date', label: 'End Date' },
      { field: 'location', label: 'Location' },
      { field: 'company', label: 'Company' },
      { field: 'organizer', label: 'Organizer' }
    ]

    // Validate required fields
    const requiredValidation = validateRequiredFields(eventData, requiredFields)
    if (!requiredValidation.isValid) {
      Object.assign(errors, requiredValidation.errors)
      hasErrors = true
    }

    // Validate slug
    const slugValidation = validateSlug(eventData.event_slug, eventData.name)
    if (!slugValidation.isValid) {
      errors.event_slug = slugValidation.error
      hasErrors = true
    }

    // Validate date range
    if (eventData.start_date && eventData.end_date) {
      const dateValidation = validateDateRange(eventData.start_date, eventData.end_date)
      if (!dateValidation.isValid) {
        errors.date_range = dateValidation.error
        hasErrors = true
      }
    }

    // Validate URLs
    if (eventData.map_url) {
      const mapUrlValidation = validateUrl(eventData.map_url, 'Map URL')
      if (!mapUrlValidation.isValid) {
        errors.map_url = mapUrlValidation.error
        hasErrors = true
      }
    }

    if (eventData.online_link_meeting) {
      const meetingUrlValidation = validateUrl(eventData.online_link_meeting, 'Meeting URL')
      if (!meetingUrlValidation.isValid) {
        errors.online_link_meeting = meetingUrlValidation.error
        hasErrors = true
      }
    }

    // Validate files
    if (eventData.cover_image) {
      const coverValidation = validateFile(eventData.cover_image, { fieldName: 'Cover Image' })
      if (!coverValidation.isValid) {
        errors.cover_image = coverValidation.error
        hasErrors = true
      }
    }

    return {
      isValid: !hasErrors,
      errors,
      cleanedSlug: slugValidation.cleanedSlug,
      summary: requiredValidation.summary
    }
  }

  return {
    validateSlug,
    validateRequiredFields,
    validateUrl,
    validateDateRange,
    validateFile,
    validateEventData
  }
}