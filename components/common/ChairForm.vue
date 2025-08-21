<template>
  <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" modal :header="isEdit ? 'Edit Chair' : 'Add Chair'" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <div class="space-y-6">
      <!-- Chair Information -->
      <div class="grid grid-cols-1 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Name <span class="text-red-500">*</span></label>
          <InputText
            v-model="chairData.name"
            @blur="handleNameBlur"
            @input="handleNameInput"
            :class="[
              'w-full p-3 rounded-lg border',
              getFieldError('name') ? 'border-red-500' : 'border-gray-300'
            ]"
            placeholder="Enter chair name"
          />
          <small v-if="getFieldError('name')" class="text-red-500">{{ getFieldError('name') }}</small>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Position <span class="text-red-500">*</span></label>
          <InputText
            v-model="chairData.position"
            @blur="handlePositionBlur"
            @input="handlePositionInput"
            :class="[
              'w-full p-3 rounded-lg border',
              getFieldError('position') ? 'border-red-500' : 'border-gray-300'
            ]"
            placeholder="Enter position"
          />
          <small v-if="getFieldError('position')" class="text-red-500">{{ getFieldError('position') }}</small>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Company/Ministry <span class="text-red-500">*</span></label>
          <InputText
            v-model="chairData.company"
            @blur="handleCompanyBlur"
            @input="handleCompanyInput"
            :class="[
              'w-full p-3 rounded-lg border',
              getFieldError('company') ? 'border-red-500' : 'border-gray-300'
            ]"
            placeholder="Enter company or ministry"
          />
          <small v-if="getFieldError('company')" class="text-red-500">{{ getFieldError('company') }}</small>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
          <InputNumber
            v-model="chairData.sort_order"
            :class="[
              'w-full p-3 rounded-lg border border-gray-300'
            ]"
            placeholder="Enter sort order (optional)"
            :min="1"
            :max="100"
          />
          <small class="text-gray-500">Order in which chairs will be displayed (1 = first)</small>
        </div>
      </div>

      <!-- Profile Image Upload -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
        <UploadPhoto
          label="Chair Profile Image (Optional)"
          :multiple="false"
          :existing-image-url="getImageSrc()"
          @file-selected="handleImageSelected"
          @file-removed="handleImageRemoved"
          @existing-image-removed="handleImageRemoved"
        />
        <!-- Display current image if editing -->
        <div v-if="(chairData.avatar || chairData.profile_image) && isEdit" class="mt-3">
          <p class="text-sm text-gray-600 mb-2">Current Image:</p>
          <img
            :src="getImageSrc()"
            alt="Current profile"
            class="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            @error="handleImageError"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <Button label="Cancel" icon="pi pi-times" text @click="closeDialog" />
        <Button 
          :label="isEdit ? 'Update Chair' : 'Add Chair'" 
          icon="pi pi-check" 
          @click="saveChair"
          :loading="loading"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import UploadPhoto from '~/components/common/UploadPhoto.vue'
import { useFormValidation } from '~/composables/useFormValidation'
import { useToast } from 'primevue/usetoast'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  chair: {
    type: Object,
    default: null
  },
  isEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'save'])

const toast = useToast()
const loading = ref(false)

// Form validation
const {
  errors,
  clearErrors,
  clearFieldError,
  setFieldError,
  getFieldError,
  validateField,
  validateRequired
} = useFormValidation()

// Chair data
const chairData = ref({
  id: null,
  name: '',
  position: '',
  company: '',
  sort_order: 1,
  profile_image: null,
  avatar: ''
})

// Watch for chair prop changes to populate form
watch(() => props.chair, (newChair) => {
  if (newChair && props.isEdit) {
    chairData.value = {
      id: newChair.id,
      name: newChair.name || '',
      position: newChair.position || '',
      company: newChair.company || '',
      sort_order: newChair.sort_order || 1,
      profile_image: newChair.profile_image || null,
      avatar: newChair.avatar || ''
    }
  } else {
    // Reset form for new chair
    chairData.value = {
      id: null,
      name: '',
      position: '',
      company: '',
      sort_order: 1,
      profile_image: null,
      avatar: ''
    }
  }
  clearErrors()
}, { immediate: true })

// Watch visible prop
watch(() => props.visible, (newVisible) => {
  if (!newVisible) {
    clearErrors()
  }
})

const validateChairData = () => {
  clearErrors()
  let isValid = true

  // Validate required fields
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
  if (!validateChairData()) {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Please fill all required fields.',
      life: 3000
    })
    return
  }

  loading.value = true
  
  try {
    // Generate ID for new chairs
    if (!props.isEdit || !chairData.value.id) {
      chairData.value.id = Date.now()
    }

    // Set avatar from profile image if available
    if (chairData.value.profile_image) {
      chairData.value.avatar = URL.createObjectURL(chairData.value.profile_image)
    }

    emit('save', { ...chairData.value })
    
    toast.add({
      severity: 'success',
      summary: props.isEdit ? 'Chair Updated' : 'Chair Added',
      detail: `${chairData.value.name} has been ${props.isEdit ? 'updated' : 'added'} successfully.`,
      life: 3000
    })

    // ✅ Reset only if adding new chair
    if (!props.isEdit) {
      chairData.value = {
        id: null,
        name: '',
        position: '',
        company: '',
        sort_order: 1,
        profile_image: null,
        avatar: ''
      }
    }

    closeDialog()
  } catch (error) {
    console.error('Error saving chair:', error)
    toast.add({
      severity: 'error',
      summary: 'Save Failed',
      detail: 'Unable to save chair information. Please check your input and try again.',
      life: 4000
    })
  } finally {
    loading.value = false
  }
}


const closeDialog = () => {
  emit('update:visible', false)
  clearErrors()
}

// Handle image selection
const handleImageSelected = (file) => {
  try {
    chairData.value.profile_image = file
    if (file && typeof file === 'object' && file.constructor && file.constructor.name === 'File') {
      chairData.value.avatar = URL.createObjectURL(file)
    }
  } catch (error) {
    console.error('Error handling image selection:', error)
  }
}

// Handle image removal
const handleImageRemoved = () => {
  chairData.value.profile_image = null
  chairData.value.avatar = ''
}

// Safe image source getter
const getImageSrc = () => {
  try {
    if (chairData.value.profile_image &&
        typeof chairData.value.profile_image === 'object' &&
        chairData.value.profile_image.constructor &&
        chairData.value.profile_image.constructor.name === 'File') {
      return URL.createObjectURL(chairData.value.profile_image)
    }
    return chairData.value.avatar || ''
  } catch (error) {
    console.error('Error getting image source:', error)
    return chairData.value.avatar || ''
  }
}

// Handle image load errors
const handleImageError = (event) => {
  console.warn('Image failed to load:', event.target.src)
  event.target.style.display = 'none'
}

// Enhanced input handlers with proper error handling
const handleNameBlur = () => {
  try {
    if (validateField && typeof validateField === 'function') {
      validateField('name', chairData.value.name, 'required')
    }
  } catch (e) {
    console.error('Name validation error:', e)
  }
}

const handleNameInput = () => {
  try {
    if (clearFieldError && typeof clearFieldError === 'function') {
      clearFieldError('name')
    }
  } catch (e) {
    console.error('Clear name error:', e)
  }
}

const handlePositionBlur = () => {
  try {
    if (validateField && typeof validateField === 'function') {
      validateField('position', chairData.value.position, 'required')
    }
  } catch (e) {
    console.error('Position validation error:', e)
  }
}

const handlePositionInput = () => {
  try {
    if (clearFieldError && typeof clearFieldError === 'function') {
      clearFieldError('position')
    }
  } catch (e) {
    console.error('Clear position error:', e)
  }
}

const handleCompanyBlur = () => {
  try {
    if (validateField && typeof validateField === 'function') {
      validateField('company', chairData.value.company, 'required')
    }
  } catch (e) {
    console.error('Company validation error:', e)
  }
}

const handleCompanyInput = () => {
  try {
    if (clearFieldError && typeof clearFieldError === 'function') {
      clearFieldError('company')
    }
  } catch (e) {
    console.error('Clear company error:', e)
  }
}
</script>

<style scoped>
:deep(.p-dialog .p-dialog-header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

:deep(.p-dialog .p-dialog-title) {
  color: white;
  font-weight: 600;
}

:deep(.p-dialog .p-dialog-header-icon) {
  color: white;
}

:deep(.p-inputnumber input) {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
}
</style>