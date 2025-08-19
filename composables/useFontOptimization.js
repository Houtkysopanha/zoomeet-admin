// Font optimization for production - removes unnecessary font loading
export const useFontOptimization = () => {
  // Detect if Khmer text is actually being used
  const hasKhmerText = (text) => {
    if (!text || typeof text !== 'string') return false
    // Check for Khmer Unicode range (U+1780–U+17FF)
    return /[\u1780-\u17FF]/.test(text)
  }

  // Check if any form data contains Khmer text
  const detectKhmerUsage = (formData) => {
    if (!formData || typeof formData !== 'object') return false
    
    const textFields = [
      'eventName', 'description', 'location', 'company', 'organizer'
    ]
    
    for (const field of textFields) {
      if (hasKhmerText(formData[field])) {
        return true
      }
    }
    
    // Check chairs data
    if (Array.isArray(formData.chairs)) {
      for (const chair of formData.chairs) {
        if (hasKhmerText(chair.name) || 
            hasKhmerText(chair.position) || 
            hasKhmerText(chair.company)) {
          return true
        }
      }
    }
    
    return false
  }

  // Clean text for URL/slug generation (removes Khmer and special chars)
  const cleanTextForUrl = (text) => {
    if (!text || typeof text !== 'string') return ''
    
    return text
      .toLowerCase()
      .trim()
      // Remove Khmer Unicode characters
      .replace(/[\u1780-\u17FF]/g, '')
      // Remove other non-ASCII characters
      .replace(/[^\x00-\x7F]/g, '')
      // Replace spaces and special chars with hyphens
      .replace(/[^a-z0-9]+/g, '-')
      // Remove multiple consecutive hyphens
      .replace(/-+/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^-|-$/g, '')
  }

  // Sanitize text for safe display (removes potentially problematic characters)
  const sanitizeText = (text) => {
    if (!text || typeof text !== 'string') return ''
    
    return text
      .trim()
      // Remove control characters
      .replace(/[\x00-\x1F\x7F]/g, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
  }

  // Generate fallback text when Khmer text is cleaned
  const generateFallbackText = (originalText, type = 'general') => {
    if (!originalText || typeof originalText !== 'string') {
      const fallbacks = {
        event: 'Untitled Event',
        chair: 'Chair Member',
        company: 'Organization',
        general: 'Text Content'
      }
      return fallbacks[type] || fallbacks.general
    }

    const cleaned = cleanTextForUrl(originalText)
    
    if (!cleaned || cleaned.length < 2) {
      const timestamp = Date.now().toString(36).slice(-4)
      const fallbacks = {
        event: `event-${timestamp}`,
        chair: `chair-${timestamp}`,
        company: `org-${timestamp}`,
        general: `content-${timestamp}`
      }
      return fallbacks[type] || fallbacks.general
    }
    
    return cleaned
  }

  // Optimize form data by cleaning problematic text
  const optimizeFormData = (formData) => {
    if (!formData || typeof formData !== 'object') return formData

    const optimized = { ...formData }
    
    // Clean text fields that might cause issues
    const textFields = ['eventName', 'description', 'location', 'company', 'organizer']
    
    textFields.forEach(field => {
      if (optimized[field]) {
        optimized[field] = sanitizeText(optimized[field])
      }
    })

    // Clean chair data
    if (Array.isArray(optimized.chairs)) {
      optimized.chairs = optimized.chairs.map(chair => ({
        ...chair,
        name: sanitizeText(chair.name) || generateFallbackText(chair.name, 'chair'),
        position: sanitizeText(chair.position) || 'Position',
        company: sanitizeText(chair.company) || generateFallbackText(chair.company, 'company')
      }))
    }

    return optimized
  }

  // Check if we need to load additional fonts (for future use)
  const shouldLoadKhmerFonts = (formData) => {
    // In production, we'll disable Khmer font loading to reduce bundle size
    if (process.env.NODE_ENV === 'production') {
      return false
    }
    
    return detectKhmerUsage(formData)
  }

  return {
    hasKhmerText,
    detectKhmerUsage,
    cleanTextForUrl,
    sanitizeText,
    generateFallbackText,
    optimizeFormData,
    shouldLoadKhmerFonts
  }
}