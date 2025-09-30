// Simple notification system for booking operations
import { ref } from 'vue'

const notifications = ref([])

export const useNotifications = () => {
  const addNotification = (notification) => {
    const id = Date.now()
    const newNotification = {
      id,
      type: 'success',
      title: 'Success',
      message: '',
      duration: 5000,
      ...notification
    }
    
    notifications.value.push(newNotification)
    
    // Auto remove after duration
    setTimeout(() => {
      removeNotification(id)
    }, newNotification.duration)
    
    return id
  }
  
  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  const success = (message, title = 'Success') => {
    return addNotification({
      type: 'success',
      title,
      message
    })
  }
  
  const error = (message, title = 'Error') => {
    return addNotification({
      type: 'error',
      title,
      message,
      duration: 8000 // Longer duration for errors
    })
  }
  
  const warning = (message, title = 'Warning') => {
    return addNotification({
      type: 'warning',
      title,
      message
    })
  }
  
  const info = (message, title = 'Info') => {
    return addNotification({
      type: 'info',
      title,
      message
    })
  }
  
  const clear = () => {
    notifications.value = []
  }
  
  return {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
    clear
  }
}