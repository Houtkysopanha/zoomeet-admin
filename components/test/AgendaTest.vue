<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Agenda Feature Test</h1>
      
      <!-- Test Results -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Test Results</h2>
        
        <div class="space-y-3">
          <div v-for="test in testResults" :key="test.name" class="flex items-center space-x-3">
            <div class="flex-shrink-0">
              <Icon 
                :name="test.passed ? 'heroicons:check-circle' : 'heroicons:x-circle'" 
                :class="test.passed ? 'text-green-500' : 'text-red-500'"
                class="w-5 h-5"
              />
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900">{{ test.name }}</p>
              <p class="text-xs text-gray-500">{{ test.description }}</p>
              <p v-if="test.error" class="text-xs text-red-600 mt-1">{{ test.error }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Test Actions -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Test Actions</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            @click="runAllTests"
            :disabled="isRunning"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isRunning ? 'Running Tests...' : 'Run All Tests' }}
          </button>
          
          <button
            @click="testValidation"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Test Form Validation
          </button>
          
          <button
            @click="testStoreOperations"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Test Store Operations
          </button>
          
          <button
            @click="testAPIFunctions"
            class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Test API Functions
          </button>
        </div>
      </div>

      <!-- Test Data Display -->
      <div v-if="testData" class="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Test Data</h2>
        <pre class="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">{{ JSON.stringify(testData, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAgendaStore } from '~/composables/useAgendaStore'
import { useAgendaValidation, useAgendaFormValidation } from '~/composables/useAgendaValidation'

const isRunning = ref(false)
const testResults = ref([])
const testData = ref(null)

// Initialize composables
const agendaStore = useAgendaStore()
const { validateAgendaForm, validateTimeSlotConflict, generateTimeOptions } = useAgendaValidation()
const { formData, validate, resetForm } = useAgendaFormValidation()

// Test functions
const addTestResult = (name, description, passed, error = null) => {
  testResults.value.push({
    name,
    description,
    passed,
    error
  })
}

const testValidation = async () => {
  console.log('🧪 Testing form validation...')
  
  try {
    // Test 1: Empty form validation
    const emptyFormResult = validateAgendaForm({})
    addTestResult(
      'Empty Form Validation',
      'Should fail validation for empty form',
      !emptyFormResult.isValid && emptyFormResult.errorCount > 0
    )

    // Test 2: Valid form validation
    const validForm = {
      date: new Date().toISOString().split('T')[0],
      time_start: '09:00',
      time_end: '10:00',
      title: 'Test Session',
      description: 'Test description',
      venue: 'Test Venue',
      room_no: '101',
      speaker_name: 'John Doe',
      speaker_description: 'Test speaker',
      is_break: false
    }
    
    const validFormResult = validateAgendaForm(validForm)
    addTestResult(
      'Valid Form Validation',
      'Should pass validation for complete form',
      validFormResult.isValid && validFormResult.errorCount === 0
    )

    // Test 3: Time conflict validation
    const existingAgendas = [
      { id: 1, date: validForm.date, time_start: '09:30', time_end: '10:30', title: 'Existing Session' }
    ]
    
    const conflictResult = validateTimeSlotConflict(validForm, existingAgendas)
    addTestResult(
      'Time Conflict Validation',
      'Should detect time slot conflicts',
      conflictResult.hasConflict
    )

    // Test 4: Time options generation
    const timeOptions = generateTimeOptions(30, 8, 18)
    addTestResult(
      'Time Options Generation',
      'Should generate time options correctly',
      Array.isArray(timeOptions) && timeOptions.length > 0
    )

    testData.value = {
      emptyFormResult,
      validFormResult,
      conflictResult,
      timeOptionsCount: timeOptions.length
    }

  } catch (error) {
    addTestResult(
      'Validation Test Error',
      'Validation tests encountered an error',
      false,
      error.message
    )
  }
}

const testStoreOperations = async () => {
  console.log('🧪 Testing store operations...')
  
  try {
    // Test 1: Store initialization
    addTestResult(
      'Store Initialization',
      'Store should be properly initialized',
      typeof agendaStore.agendas !== 'undefined' && typeof agendaStore.saveAgenda === 'function'
    )

    // Test 2: Form reset
    agendaStore.resetForm()
    addTestResult(
      'Form Reset',
      'Should reset form to initial state',
      agendaStore.agendaForm.title === '' && agendaStore.agendaForm.date === null
    )

    // Test 3: Form validation
    const isValid = agendaStore.validateForm()
    addTestResult(
      'Store Form Validation',
      'Should validate form correctly',
      typeof isValid === 'boolean'
    )

    // Test 4: Event ID setting
    agendaStore.setCurrentEventId('test-event-id')
    addTestResult(
      'Event ID Setting',
      'Should set current event ID',
      agendaStore.currentEventId === 'test-event-id'
    )

    testData.value = {
      ...testData.value,
      storeState: {
        agendasCount: agendaStore.agendas.length,
        currentEventId: agendaStore.currentEventId,
        formValid: isValid
      }
    }

  } catch (error) {
    addTestResult(
      'Store Operations Error',
      'Store operations encountered an error',
      false,
      error.message
    )
  }
}

const testAPIFunctions = async () => {
  console.log('🧪 Testing API functions...')
  
  try {
    // Import API functions
    const { 
      getEventAgendas, 
      createAgenda, 
      updateAgenda, 
      deleteAgenda 
    } = await import('~/composables/api/agenda')

    // Test 1: API functions exist
    addTestResult(
      'API Functions Import',
      'Should import all required API functions',
      typeof getEventAgendas === 'function' && 
      typeof createAgenda === 'function' && 
      typeof updateAgenda === 'function' && 
      typeof deleteAgenda === 'function'
    )

    // Test 2: Function parameter validation
    try {
      await getEventAgendas()
      addTestResult(
        'API Parameter Validation',
        'Should validate required parameters',
        false,
        'Should have thrown error for missing event ID'
      )
    } catch (error) {
      addTestResult(
        'API Parameter Validation',
        'Should validate required parameters',
        error.message.includes('Event ID is required')
      )
    }

    testData.value = {
      ...testData.value,
      apiFunctions: {
        getEventAgendas: typeof getEventAgendas,
        createAgenda: typeof createAgenda,
        updateAgenda: typeof updateAgenda,
        deleteAgenda: typeof deleteAgenda
      }
    }

  } catch (error) {
    addTestResult(
      'API Functions Error',
      'API functions test encountered an error',
      false,
      error.message
    )
  }
}

const runAllTests = async () => {
  isRunning.value = true
  testResults.value = []
  testData.value = null

  try {
    await testValidation()
    await testStoreOperations()
    await testAPIFunctions()

    // Summary
    const passedTests = testResults.value.filter(t => t.passed).length
    const totalTests = testResults.value.length
    
    console.log(`🧪 Test Summary: ${passedTests}/${totalTests} tests passed`)
    
    addTestResult(
      'Test Summary',
      `Overall test results: ${passedTests}/${totalTests} passed`,
      passedTests === totalTests
    )

  } catch (error) {
    addTestResult(
      'Test Suite Error',
      'Test suite encountered a critical error',
      false,
      error.message
    )
  } finally {
    isRunning.value = false
  }
}

onMounted(() => {
  console.log('🧪 Agenda Test Component mounted')
})
</script>

<style scoped>
/* Add any specific styles for the test component */
</style>