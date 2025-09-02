/**
 * Date formatting utilities for consistent date display across the application
 */

/**
 * Format a date to "D Month, Years" format (e.g., "14 July, 2025")
 * @param {string|Date} startDate - Start date string or Date object
 * @param {string|Date} endDate - End date string or Date object (optional)
 * @returns {string} Formatted date string
 */
export const formatEventDateRange = (startDate, endDate = null) => {
  if (!startDate) return 'Date not available'
  
  try {
    const start = new Date(startDate)
    if (isNaN(start.getTime())) return 'Invalid date'
    
    const startDay = start.getDate()
    const startMonth = start.toLocaleDateString('en-US', { month: 'long' })
    const startYear = start.getFullYear()
    
    // If no end date, return single date format
    if (!endDate) {
      return `${startDay} ${startMonth}, ${startYear}`
    }
    
    const end = new Date(endDate)
    if (isNaN(end.getTime())) {
      return `${startDay} ${startMonth}, ${startYear}`
    }
    
    const endDay = end.getDate()
    const endMonth = end.toLocaleDateString('en-US', { month: 'long' })
    const endYear = end.getFullYear()
    
    // Same date, return single date
    if (start.toDateString() === end.toDateString()) {
      return `${startDay} ${startMonth}, ${startYear}`
    }
    
    // Same year and month, show range within month
    if (startYear === endYear && startMonth === endMonth) {
      return `${startDay}-${endDay} ${startMonth}, ${startYear}`
    }
    
    // Same year, different month
    if (startYear === endYear) {
      return `${startDay} ${startMonth} - ${endDay} ${endMonth}, ${startYear}`
    }
    
    // Different year
    return `${startDay} ${startMonth}, ${startYear} - ${endDay} ${endMonth}, ${endYear}`
  } catch (error) {
    console.warn('Failed to format date range:', error)
    return 'Date not available'
  }
}

/**
 * Format a single date to "D Month, Year" format (e.g., "14 July, 2025")
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted date string
 */
export const formatSingleDate = (dateInput) => {
  if (!dateInput) return 'Date not available'
  
  try {
    const date = new Date(dateInput)
    if (isNaN(date.getTime())) return 'Invalid date'
    
    const day = date.getDate()
    const month = date.toLocaleDateString('en-US', { month: 'long' })
    const year = date.getFullYear()
    
    return `${day} ${month}, ${year}`
  } catch (error) {
    console.warn('Failed to format single date:', error)
    return 'Date not available'
  }
}

/**
 * Format time from date string
 * @param {string|Date} dateInput - Date string or Date object
 * @param {string} timezone - Timezone (default: 'Asia/Phnom_Penh')
 * @param {boolean} keepUTC - Whether to keep UTC time (default: false)
 * @returns {string} Formatted time string
 */
export const formatTime = (dateInput, timezone = 'Asia/Phnom_Penh', keepUTC = false) => {
  if (!dateInput) return 'Time not available'
  
  try {
    const date = new Date(dateInput)
    if (isNaN(date.getTime())) return 'Invalid time'
    
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }
    
    if (!keepUTC) {
      options.timeZone = timezone
    }
    
    const formattedTime = date.toLocaleTimeString('en-US', options)
    
    if (keepUTC) {
      return `${formattedTime} UTC`
    } else {
      return `${formattedTime} GMT+7`
    }
  } catch (error) {
    console.warn('Failed to format time:', error)
    return 'Time not available'
  }
}

/**
 * Format event time specifically for event display
 * @param {Object} eventData - Event data object with start_date and end_date
 * @returns {string} Formatted time string
 */
export const formatEventTime = (eventData) => {
  if (!eventData || !eventData.start_date) return 'Time not available'
  return formatTime(eventData.start_date)
}

/**
 * Format date for display in various components (D Month, Years format)
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted date string
 */
export const formatDateForDisplay = (dateInput) => {
  if (!dateInput) return 'Date not available'
  
  try {
    const date = new Date(dateInput)
    if (isNaN(date.getTime())) return 'Invalid date'
    
    const day = date.getDate()
    const month = date.toLocaleDateString('en-US', { month: 'long' })
    const year = date.getFullYear()
    
    return `${day} ${month}, ${year}`
  } catch (error) {
    console.warn('Failed to format date for display:', error)
    return 'Date not available'
  }
}

/**
 * Format date for API calls (YYYY-MM-DD format)
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted date string for API
 */
export const formatDateForAPI = (dateInput) => {
  if (!dateInput) return new Date().toISOString().split('T')[0]
  
  // If it's a Date object from Calendar component
  if (dateInput instanceof Date) {
    return dateInput.toISOString().split('T')[0]
  }
  
  // If it's already a string in YYYY-MM-DD format, return as-is
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return dateInput
  }
  
  // Try to parse and convert
  try {
    const date = new Date(dateInput)
    if (isNaN(date.getTime())) {
      console.warn('⚠️ Invalid date, using today:', dateInput)
      return new Date().toISOString().split('T')[0]
    }
    return date.toISOString().split('T')[0]
  } catch (error) {
    console.warn('⚠️ Date parsing failed, using today:', dateInput)
    return new Date().toISOString().split('T')[0]
  }
}

/**
 * Validate if a date is valid
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidDate = (dateInput) => {
  if (!dateInput) return false
  
  try {
    const date = new Date(dateInput)
    return !isNaN(date.getTime())
  } catch (error) {
    return false
  }
}

/**
 * Validate if start date is before end date
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {boolean} True if valid order, false otherwise
 */
export const isValidDateRange = (startDate, endDate) => {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return false
  }
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  return start < end
}

/**
 * Validate if date is not in the past
 * @param {string|Date} dateInput - Date to check
 * @param {boolean} allowToday - Whether to allow today's date (default: true)
 * @returns {boolean} True if not in past, false otherwise
 */
export const isNotInPast = (dateInput, allowToday = true) => {
  if (!isValidDate(dateInput)) return false
  
  const inputDate = new Date(dateInput)
  const today = new Date()
  
  // Set time to start of day for comparison
  inputDate.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  
  if (allowToday) {
    return inputDate >= today
  } else {
    return inputDate > today
  }
}

/**
 * Get validation error message for date fields
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @param {Object} options - Validation options
 * @returns {string|null} Error message or null if valid
 */
export const getDateValidationError = (startDate, endDate, options = {}) => {
  const {
    allowPastStart = false,
    allowPastEnd = false,
    allowSameDay = false,
    startFieldName = 'Start date',
    endFieldName = 'End date'
  } = options
  
  // Check if dates are provided
  if (!startDate) return `${startFieldName} is required`
  if (!endDate) return `${endFieldName} is required`
  
  // Check if dates are valid
  if (!isValidDate(startDate)) return `${startFieldName} is not a valid date`
  if (!isValidDate(endDate)) return `${endFieldName} is not a valid date`
  
  // Check if dates are not in the past
  if (!allowPastStart && !isNotInPast(startDate)) {
    return `${startFieldName} cannot be in the past`
  }
  if (!allowPastEnd && !isNotInPast(endDate)) {
    return `${endFieldName} cannot be in the past`
  }
  
  // Check date order
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  if (allowSameDay) {
    if (end < start) {
      return `${endFieldName} must be on or after ${startFieldName}`
    }
  } else {
    if (end <= start) {
      return `${endFieldName} must be after ${startFieldName}`
    }
  }
  
  return null // No validation errors
}
