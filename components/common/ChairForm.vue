<template>
  <div v-if="visible" class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black bg-opacity-50" @click="closeDialog"></div>
    
    <!-- Modal Container -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6">
          <h3 class="text-lg font-semibold text-gray-900">{{ isEdit ? 'Edit Chair' : 'Add Chair' }}</h3>
          <button
            @click="closeDialog"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6">
          <div class="flex gap-6">
            <!-- Left Side - Chair Profile Image -->
            <div class="flex-shrink-0">
              <div class="text-center">
                <div class="relative">
                  <!-- Profile Image Circle -->
                  <div class="w-24 h-24 bg-gray-100 rounded-full border-2 border-gray-200 flex items-center justify-center overflow-hidden mb-2 cursor-pointer group hover:bg-gray-50 transition-colors"
                       @click="triggerImageUpload">
                    <!-- Display uploaded or existing image -->
                    <img 
                      v-if="getImageSrc()"
                      :src="getImageSrc()"
                    alt="Current profile"
                  class="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                   @error="handleImageError"
                    />
                    <!-- Camera icon when no image -->
                    <div v-else class="text-gray-400 group-hover:text-gray-500 transition-colors">
                      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                    </div>
                    
                    <!-- Remove image button -->
                    <!-- <button 
                      v-if="getImageSrc()"
                      @click.stop="handleImageRemoved"
                      class="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button> -->
                  </div>
                </div>
                
                <!-- Chair Profile Label -->
                <p class="text-sm font-medium text-gray-900">Chair Profile</p>
                
                <!-- Hidden file input -->
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="handleFileSelect"
                  class="hidden"
                  :multiple="false"
                />
              </div>
            </div>

            <!-- Right Side - Form Fields -->
            <div class="flex-1">
              <div class="space-y-4">
                <!-- Chair Name Field -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Chair Name</label>
                  <input
                    v-model="chairData.name"
                    @blur="handleNameBlur"
                    @input="handleNameInput"
                    type="text"
                    placeholder="Enter full name"
                    :class="[
                      'w-full px-3 py-2 border rounded-xl text-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors',
                      getFieldError('name') ? 'border-red-500' : 'border-gray-300'
                    ]"
                  />
                  <p v-if="getFieldError('name')" class="mt-1 text-sm text-red-500">{{ getFieldError('name') }}</p>
                </div>

                <!-- Position Field -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Position</label>
                  <input
                    v-model="chairData.position"
                    @blur="handlePositionBlur"
                    @input="handlePositionInput"
                    type="text"
                    placeholder="position"
                    :class="[
                      'w-full px-3 py-2 border rounded-xl text-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors',
                      getFieldError('position') ? 'border-red-500' : 'border-gray-300'
                    ]"
                  />
                  <p v-if="getFieldError('position')" class="mt-1 text-sm text-red-500">{{ getFieldError('position') }}</p>
                </div>

                <!-- Ministry/Company Field -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Ministry/Company</label>
                  <input
                    v-model="chairData.company"
                    @blur="handleCompanyBlur"
                    @input="handleCompanyInput"
                    type="text"
                    placeholder="position"
                    :class="[
                      'w-full px-3 py-2 border rounded-xl text-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors',
                      getFieldError('company') ? 'border-red-500' : 'border-gray-300'
                    ]"
                  />
                  <p v-if="getFieldError('company')" class="mt-1 text-sm text-red-500">{{ getFieldError('company') }}</p>
                </div>
              </div>

              <!-- Advanced Options Section (collapsed by default) -->
              <!-- <div v-if="showAdvanced" class="mt-6 pt-4 border-t border-gray-100">
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                    <input
                      v-model="chairData.sort_order"
                      type="number"
                      :min="1"
                      :max="100"
                      placeholder="Enter sort order (optional)"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <p class="mt-1 text-xs text-gray-500">Order in which chairs will be displayed (1 = first)</p>
                  </div>
                </div>
              </div> -->

              <!-- Advanced Options Toggle -->
              <!-- <button
                @click="showAdvanced = !showAdvanced"
                class="mt-4 text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
              >
                <span>{{ showAdvanced ? 'Hide' : 'Show' }} Advanced Options</span>
                <svg 
                  :class="['w-4 h-4 transition-transform', showAdvanced ? 'rotate-180' : '']" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button> -->
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex justify-end gap-3 px-6 py-4 ">
          <button
            @click="closeDialog"
            class="px-4 py-2 text-sm font-medium text-purple-700 bg-white border border-purple-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="saveChair"
            :disabled="loading"
            class="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isEdit ? 'Update' : 'Add' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { useFormValidation } from '~/composables/useFormValidation'
import { useToast } from 'primevue/usetoast'

const props = defineProps({
  visible: { type: Boolean, default: false },
  chair: { type: Object, default: null },
  isEdit: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'save'])

const toast = useToast()
const loading = ref(false)
const fileInput = ref(null)
const objectUrls = ref([])

// ✅ Chair form state
const chairData = ref({
  id: null,
  name: '',
  position: '',
  company: '',
  sort_order: 1,
  profile_image: null,   // File if new upload
  avatar: '',            // Preview (object URL or server URL)
  profile_image_url: null,
  image_removed: false
})

// ✅ Validation composable
const {
  errors,
  clearErrors,
  clearFieldError,
  setFieldError,
  getFieldError,
  validateField,
  validateRequired
} = useFormValidation()

// ✅ Check if an image is placeholder
const isPlaceholderImage = (url) => {
  if (!url || typeof url !== 'string') return true
  const trimmedUrl = url.trim()
  if (trimmedUrl === '') return true
  const lowercaseUrl = trimmedUrl.toLowerCase()
  return lowercaseUrl === 'null' ||
         lowercaseUrl === 'undefined' ||
         lowercaseUrl.includes('default') || 
         lowercaseUrl.includes('placeholder') || 
         lowercaseUrl.includes('avatar.png') ||
         lowercaseUrl.includes('no-image') ||
         lowercaseUrl.includes('not-found') ||
         lowercaseUrl.includes('blank') ||
         lowercaseUrl.includes('empty')
}

// ✅ Watch for chair prop changes
watch(() => props.chair, (newChair) => {
  if (newChair && props.isEdit) {
    chairData.value = {
      id: newChair.id,
      name: newChair.name || '',
      position: newChair.position || '',
      company: newChair.company || '',
      sort_order: newChair.sort_order || 1,
      profile_image: null,
      avatar: !isPlaceholderImage(newChair.profile_image_url) ? newChair.profile_image_url : '',
      profile_image_url: newChair.profile_image_url,
      image_removed: false
    }
  } else {
    chairData.value = {
      id: null,
      name: '',
      position: '',
      company: '',
      sort_order: 1,
      profile_image: null,
      avatar: '',
      profile_image_url: null,
      image_removed: false
    }
  }
  clearErrors()
}, { immediate: true })

// ✅ Watch visible state
watch(() => props.visible, (newVisible) => {
  if (!newVisible) clearErrors()
})

// ✅ Validate before save
const validateChairData = () => {
  clearErrors()
  let isValid = true

  const requiredFields = [
    { field: 'name', value: chairData.value.name, label: 'Name' },
    { field: 'position', value: chairData.value.position, label: 'Position' },
    { field: 'company', value: chairData.value.company, label: 'Company/Ministry' }
  ]

  requiredFields.forEach(({ field, value, label }) => {
    const error = validateRequired(value, label)
    if (error) {
      setFieldError(field, error)
      isValid = false
    }
  })

  return isValid
}
const saveChair = async () => {
  if (!validateChairData()) return

  loading.value = true
  try {
    if (!props.isEdit || !chairData.value.id) {
      chairData.value.id = Date.now()
    }

    // ✅ Build payload
    const chairToSave = {
      id: chairData.value.id,
      name: chairData.value.name,
      position: chairData.value.position,
      company: chairData.value.company,
      sort_order: chairData.value.sort_order,
      profile_image: chairData.value.profile_image instanceof File ? chairData.value.profile_image : null,
      image_removed: chairData.value.image_removed
    }

    emit('save', chairToSave)

    // ✅ If user removed the image, clear preview after save
    if (chairData.value.image_removed) {
      chairData.value.profile_image = null
      chairData.value.avatar = ''
      chairData.value.profile_image_url = null
    }

    toast.add({
      severity: 'success',
      summary: props.isEdit ? 'Chair Updated' : 'Chair Added',
      detail: `${chairData.value.name} has been ${props.isEdit ? 'updated' : 'added'} successfully.`,
      life: 3000
    })

    if (!props.isEdit) {
      chairData.value = {
        id: null,
        name: '',
        position: '',
        company: '',
        sort_order: 1,
        profile_image: null,
        avatar: '',
        profile_image_url: null,
        image_removed: false
      }
    }

    closeDialog()
  } catch (error) {
    console.error('Error saving chair:', error)
    toast.add({ severity: 'error', summary: 'Save Failed', detail: 'Unable to save chair.', life: 4000 })
  } finally {
    loading.value = false
  }
}


// ✅ File handling
const triggerImageUpload = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  handleImageSelected(file)
}

const handleImageSelected = (file) => {
  cleanupObjectUrls()

  if (!file) {
    chairData.value.profile_image = null
    chairData.value.avatar = ''
    chairData.value.image_removed = false
    return
  }

  if (file instanceof File) {
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      toast.add({ severity: 'warn', summary: 'File too large', detail: 'Max size is 2MB', life: 3000 })
      return
    }

    const allowedTypes = ['image/jpeg','image/jpg','image/png','image/webp']
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toast.add({ severity: 'warn', summary: 'Invalid file', detail: 'Only JPG, PNG, WEBP allowed', life: 3000 })
      return
    }

    chairData.value.profile_image = file
    chairData.value.avatar = URL.createObjectURL(file)
    objectUrls.value.push(chairData.value.avatar)
    chairData.value.image_removed = false
  }
}

const handleImageRemoved = () => {
  cleanupObjectUrls()
  chairData.value.profile_image = null
  chairData.value.avatar = ''
  chairData.value.profile_image_url = null
  chairData.value.image_removed = true
}

const getImageSrc = () => chairData.value.avatar || ''

// ✅ Cleanup URLs
const cleanupObjectUrls = () => {
  objectUrls.value.forEach(url => URL.revokeObjectURL(url))
  objectUrls.value = []
}

onBeforeUnmount(() => {
  cleanupObjectUrls()
})

// ✅ Handle image load errors
const handleImageError = (event) => {
  event.target.style.display = 'none'
}

// ✅ Input handlers
const handleNameBlur = () => { try { validateField('name', chairData.value.name, 'required') } catch {} }
const handleNameInput = () => { try { clearFieldError('name') } catch {} }

const handlePositionBlur = () => { try { validateField('position', chairData.value.position, 'required') } catch {} }
const handlePositionInput = () => { try { clearFieldError('position') } catch {} }

const handleCompanyBlur = () => { try { validateField('company', chairData.value.company, 'required') } catch {} }
const handleCompanyInput = () => { try { clearFieldError('company') } catch {} }

// ✅ Close modal
const closeDialog = () => {
  emit('update:visible', false)
}
</script>

<style scoped>
/* Custom modal animations */
.modal-enter-active {
  transition: all 0.3s ease-out;
}

.modal-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.modal-enter-from,
.modal-leave-to {
  transform: scale(0.9);
  opacity: 0;
}

/* Focus styles for inputs */
input:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Button hover animations */
button {
  transition: all 0.2s ease-in-out;
}

/* Loading spinner animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>