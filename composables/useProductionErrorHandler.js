import { useOptimizedToast } from './useOptimizedToast'

// Production-ready error handling with proper logging and user feedback
export const useProductionErrorHandler = () => {
  const toast = useOptimizedToast()

  // Error categories for better handling
  const ERROR_TYPES = {
    NETWORK: 'network',
    AUTH: 'auth',
    VALIDATION: 'validation',
    SERVER: 'server',
    CLIENT: 'client',
    UNKNOWN: 'unknown'
  }

  // Categorize errors
  const categorizeError = (error) => {
    if (!error) return ERROR_TYPES.UNKNOWN

    // Network errors
    if (error.message?.includes('fetch') || 
        error.message?.includes('CORS') || 
        error.message?.includes('Network') ||
        error.code === 'NETWORK_ERROR') {
      return ERROR_TYPES.NETWORK
    }

    // Authentication errors
    if (error.status === 401 || 
        error.status === 403 || 
        error.message?.includes('Authentication') ||
        error.message?.includes('Unauthorized')) {
      return ERROR_TYPES.AUTH
    }

    // Validation errors
    if (error.status === 422 || 
        error.status === 400 ||
        error.data?.errors ||
        error.validationErrors) {
      return ERROR_TYPES.VALIDATION
    }

    // Server errors
    if (error.status >= 500 || 
        error.message?.includes('Server') ||
        error.message?.includes('Internal')) {
      return ERROR_TYPES.SERVER
    }

    // Client errors
    if (error.status >= 400 && error.status < 500) {
      return ERROR_TYPES.CLIENT
    }

    return ERROR_TYPES.UNKNOWN
  }

  // Get user-friendly error message
  const getUserMessage = (error, context = '') => {
    const category = categorizeError(error)
    
    switch (category) {
      case ERROR_TYPES.NETWORK:
        return 'Connection issue. Please check your internet and try again.'
      
      case ERROR_TYPES.AUTH:
        return 'Please log in again to continue.'
      
      case ERROR_TYPES.VALIDATION:
        return 'Please check your input and fix any errors.'
      
      case ERROR_TYPES.SERVER:
        return 'Server is temporarily unavailable. Please try again later.'
      
      case ERROR_TYPES.CLIENT:
        return error.message || 'Something went wrong. Please try again.'
      
      default:
        return context ? `Failed to ${context}. Please try again.` : 'An unexpected error occurred.'
    }
  }

  // Log error for debugging (only in development)
  const logError = (error, context = '', additionalData = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error in ${context || 'Application'}`)
      console.error('Error:', error)
      console.log('Category:', categorizeError(error))
      console.log('Status:', error.status)
      console.log('Message:', error.message)
      if (Object.keys(additionalData).length > 0) {
        console.log('Additional Data:', additionalData)
      }
      console.groupEnd()
    }
  }

  // Handle error with appropriate user feedback
  const handleError = (error, context = '', options = {}) => {
    const {
      showToast = true,
      logToConsole = true,
      customMessage = null,
      additionalData = {}
    } = options

    // Log error for debugging
    if (logToConsole) {
      logError(error, context, additionalData)
    }

    // Show user-friendly toast
    if (showToast) {
      const category = categorizeError(error)
      const message = customMessage || getUserMessage(error, context)
      
      switch (category) {
        case ERROR_TYPES.AUTH:
          toast.criticalError('Authentication Required', message)
          break
        
        case ERROR_TYPES.NETWORK:
          toast.error('Connection Error', message)
          break
        
        case ERROR_TYPES.SERVER:
          toast.error('Server Error', message)
          break
        
        case ERROR_TYPES.VALIDATION:
          toast.warn('Input Error', message)
          break
        
        default:
          toast.error('Error', message)
      }
    }

    return {
      category: categorizeError(error),
      userMessage: getUserMessage(error, context),
      shouldRetry: [ERROR_TYPES.NETWORK, ERROR_TYPES.SERVER].includes(categorizeError(error)),
      shouldReauth: categorizeError(error) === ERROR_TYPES.AUTH
    }
  }

  // Handle API response errors specifically
  const handleApiError = (error, endpoint = '', operation = '') => {
    const context = operation || `call ${endpoint}`
    
    // Extract validation errors if present
    let validationErrors = {}
    if (error.data?.errors) {
      validationErrors = error.data.errors
    } else if (error.validationErrors) {
      validationErrors = error.validationErrors
    }

    const result = handleError(error, context, {
      additionalData: {
        endpoint,
        operation,
        validationErrors: Object.keys(validationErrors).length > 0 ? validationErrors : null
      }
    })

    return {
      ...result,
      validationErrors
    }
  }

  // Retry mechanism for network/server errors
  const withRetry = async (fn, maxRetries = 3, delay = 1000) => {
    let lastError
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error
        const category = categorizeError(error)
        
        // Only retry for network/server errors
        if (![ERROR_TYPES.NETWORK, ERROR_TYPES.SERVER].includes(category)) {
          throw error
        }
        
        // Don't retry on last attempt
        if (attempt === maxRetries) {
          throw error
        }
        
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
      }
    }
    
    throw lastError
  }

  return {
    ERROR_TYPES,
    categorizeError,
    getUserMessage,
    logError,
    handleError,
    handleApiError,
    withRetry
  }
}