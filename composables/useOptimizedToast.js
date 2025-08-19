import { useToast } from 'primevue/usetoast'

// Toast management with deduplication and rate limiting
const activeToasts = new Set()
const toastHistory = new Map()
const RATE_LIMIT_MS = 2000 // Prevent same toast within 2 seconds

export const useOptimizedToast = () => {
  const toast = useToast()

  const showToast = (options) => {
    const { severity, summary, detail, life = 4000 } = options
    
    // Create unique key for deduplication
    const toastKey = `${severity}-${summary}-${detail}`
    
    // Check rate limiting
    const lastShown = toastHistory.get(toastKey)
    const now = Date.now()
    
    if (lastShown && (now - lastShown) < RATE_LIMIT_MS) {
      console.log('Toast rate limited:', toastKey)
      return
    }
    
    // Check if same toast is already active
    if (activeToasts.has(toastKey)) {
      console.log('Toast already active:', toastKey)
      return
    }
    
    // Add to active toasts
    activeToasts.add(toastKey)
    toastHistory.set(toastKey, now)
    
    // Show toast
    toast.add({
      severity,
      summary,
      detail,
      life,
      onClose: () => {
        activeToasts.delete(toastKey)
      }
    })
    
    // Auto-remove from active set after life duration
    setTimeout(() => {
      activeToasts.delete(toastKey)
    }, life)
  }

  // Optimized toast methods
  const success = (summary, detail, life = 3000) => {
    showToast({ severity: 'success', summary, detail, life })
  }

  const error = (summary, detail, life = 5000) => {
    showToast({ severity: 'error', summary, detail, life })
  }

  const warn = (summary, detail, life = 4000) => {
    showToast({ severity: 'warn', summary, detail, life })
  }

  const info = (summary, detail, life = 3000) => {
    showToast({ severity: 'info', summary, detail, life })
  }

  // Critical errors only (for production)
  const criticalError = (summary, detail) => {
    showToast({ severity: 'error', summary, detail, life: 8000 })
  }

  // Clear all active toasts
  const clearAll = () => {
    activeToasts.clear()
    toastHistory.clear()
  }

  return {
    success,
    error,
    warn,
    info,
    criticalError,
    clearAll,
    showToast
  }
}