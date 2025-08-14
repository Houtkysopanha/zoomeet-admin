import { ref } from 'vue'

// Global state for the classic loader
const isVisible = ref(false)
const progress = ref(0)
const text = ref('Loading...')
const statusText = ref('')
const steps = ref([])
const currentStep = ref(0)

export const useClassicLoader = () => {
  // Show the loader
  const show = (initialText = 'Loading...', initialSteps = []) => {
    isVisible.value = true
    progress.value = 0
    text.value = initialText
    statusText.value = ''
    steps.value = initialSteps
    currentStep.value = 0
  }

  // Hide the loader
  const hide = () => {
    isVisible.value = false
    progress.value = 0
    text.value = 'Loading...'
    statusText.value = ''
    steps.value = []
    currentStep.value = 0
  }

  // Update progress (0-100)
  const updateProgress = (newProgress, newText = null, newStatusText = null) => {
    progress.value = Math.max(0, Math.min(100, newProgress))
    if (newText) text.value = newText
    if (newStatusText) statusText.value = newStatusText
    
    // Auto-update current step based on progress
    if (steps.value.length > 0) {
      currentStep.value = Math.floor((progress.value / 100) * steps.value.length)
    }
  }

  // Set text without changing progress
  const setText = (newText) => {
    text.value = newText
  }

  // Set status text
  const setStatusText = (newStatusText) => {
    statusText.value = newStatusText
  }

  // Set steps
  const setSteps = (newSteps) => {
    steps.value = newSteps
    currentStep.value = 0
  }

  // Set current step
  const setCurrentStep = (step) => {
    currentStep.value = Math.max(0, Math.min(steps.value.length - 1, step))
  }

  // Simulate progress with steps
  const simulateProgress = async (stepTexts = [], stepDurations = []) => {
    const totalSteps = stepTexts.length
    const progressPerStep = 100 / totalSteps
    
    for (let i = 0; i < totalSteps; i++) {
      setText(stepTexts[i])
      setCurrentStep(i)
      updateProgress((i + 1) * progressPerStep)
      
      const duration = stepDurations[i] || 1000 // Default 1 second per step
      await new Promise(resolve => setTimeout(resolve, duration))
    }
  }

  // Login simulation
  const simulateLogin = async () => {
    show('Connecting to server...', [
      'Connecting to server',
      'Authenticating credentials', 
      'Loading dashboard'
    ])

    await simulateProgress(
      [
        'Connecting to server...',
        'Authenticating credentials...',
        'Verifying account...',
        'Loading dashboard...',
        'Complete!'
      ],
      [500, 800, 600, 700, 300]
    )
  }

  // Data loading simulation
  const simulateDataLoad = async (dataType = 'data') => {
    show(`Loading ${dataType}...`, [
      'Connecting to database',
      'Fetching records',
      'Processing data'
    ])

    await simulateProgress(
      [
        `Connecting to database...`,
        `Fetching ${dataType}...`,
        `Processing ${dataType}...`,
        'Complete!'
      ],
      [400, 600, 500, 200]
    )
  }

  // Form submission simulation
  const simulateSubmission = async (formType = 'form') => {
    show(`Submitting ${formType}...`, [
      'Validating data',
      'Sending to server',
      'Processing request'
    ])

    await simulateProgress(
      [
        'Validating data...',
        `Submitting ${formType}...`,
        'Processing request...',
        'Complete!'
      ],
      [300, 800, 600, 200]
    )
  }

  return {
    // State
    isVisible: readonly(isVisible),
    progress: readonly(progress),
    text: readonly(text),
    statusText: readonly(statusText),
    steps: readonly(steps),
    currentStep: readonly(currentStep),
    
    // Methods
    show,
    hide,
    updateProgress,
    setText,
    setStatusText,
    setSteps,
    setCurrentStep,
    simulateProgress,
    
    // Prebuilt simulations
    simulateLogin,
    simulateDataLoad,
    simulateSubmission
  }
}

// Global instance for app-wide use
export const classicLoader = useClassicLoader()
