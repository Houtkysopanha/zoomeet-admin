<template>
  <div class="file-upload-component p-6 border border-gray-200 rounded-2xl">
    <!-- Label -->
    <h3 v-if="label" class="text-lg font-medium text-gray-800 mb-4">{{ label }}</h3>
    
    <!-- Upload Area -->
    <div 
      class="upload-area"
      :class="{ 'upload-area-error': hasError }"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragenter="handleDragEnter"
      @click="triggerFileInput"
    >
      <!-- Upload Icon -->
      <div class="upload-icon">
        <i :class="iconClass" class="text-4xl text-purple-500"></i>
      </div>
      
      <!-- Upload Text -->
      <div class="upload-text">
        <span class="text-gray-600">{{ uploadText }} </span>
        <button 
          class="browse-link"
          @click="handleBrowseClick"
        >
          browse
        </button>
      </div>
      
      <!-- File Constraints -->
      <div class="upload-constraints" v-if="showConstraints">
        <p class="text-xs text-gray-400">*Maximum file size: {{ maxSizeText }}</p>
        <p v-if="dimensionsText" class="text-xs text-gray-400">*{{ dimensionsText }}</p>
      </div>

      <!-- Selected File Preview -->
      <div v-if="selectedFile" class="selected-file mt-4 p-3 bg-white rounded-lg border">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i class="pi pi-file text-purple-500"></i>
            <span class="text-sm font-medium">{{ selectedFile.name }}</span>
            <span class="text-xs text-gray-500">({{ formatFileSize(selectedFile.size) }})</span>
          </div>
          <Button
            icon="pi pi-times"
            text
            rounded
            size="small"
            @click="removeFile"
            class="text-red-500 hover:text-red-600"
          />
        </div>
      </div>
    </div>
    
    <!-- Hidden File Input -->
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      :multiple="multiple"
      @change="handleFileSelect"
      class="hidden"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Button from 'primevue/button'

// Props
const props = defineProps({
  label: {
    type: String,
    default: 'Cover'
  },
  uploadText: {
    type: String,
    default: 'Drop your Image here, or '
  },
  accept: {
    type: String,
    default: 'image/*'
  },
  maxSize: {
    type: Number,
    default: 10 * 1024 * 1024 // 10MB in bytes
  },
  maxSizeText: {
    type: String,
    default: 'below 10MB'
  },
  dimensionsText: {
    type: String,
    default: 'Banner resolution must be 1800 Width x 1440 Height'
  },
  showConstraints: {
    type: Boolean,
    default: true
  },
  multiple: {
    type: Boolean,
    default: false
  },
  iconClass: {
    type: String,
    default: 'pi pi-image'
  },
  allowedTypes: {
    type: Array,
    default: () => ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  }
})

// Emits
const emit = defineEmits(['file-selected', 'file-removed', 'upload-error'])

// Reactive data
const fileInput = ref(null)
const selectedFile = ref(null)
const hasError = ref(false)

// Methods
const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const handleBrowseClick = (event) => {
  event.stopPropagation()
  triggerFileInput()
}

const handleDragOver = (event) => {
  event.preventDefault()
}

const handleDragEnter = (event) => {
  event.preventDefault()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    validateAndProcessFile(file)
  }
}

const handleDrop = (event) => {
  event.preventDefault()
  const file = event.dataTransfer.files[0]
  if (file) {
    validateAndProcessFile(file)
  }
}

const validateAndProcessFile = (file) => {
  hasError.value = false
  
  // Check file size
  if (file.size > props.maxSize) {
    hasError.value = true
    emit('upload-error', {
      type: 'size',
      message: `File size must be ${props.maxSizeText}`,
      file
    })
    return
  }
  
  // Check file type
  if (props.allowedTypes.length > 0 && !props.allowedTypes.includes(file.type)) {
    hasError.value = true
    emit('upload-error', {
      type: 'type',
      message: 'Please select a valid file type',
      file
    })
    return
  }
  
  selectedFile.value = file
  emit('file-selected', file)
}

const removeFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  emit('file-removed')
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Expose methods for parent components
defineExpose({
  removeFile,
  triggerFileInput
})
</script>

<style scoped>
.upload-area {
  @apply border-2 border-dashed border-purple-300 rounded-lg;
  @apply bg-gray-50 hover:bg-purple-50;
  @apply flex flex-col items-center justify-center;
  @apply py-16 px-8 cursor-pointer;
  @apply transition-all duration-200;
  min-height: 200px;
}

.upload-area:hover {
  @apply border-purple-400 bg-purple-50;
}

.upload-area-error {
  @apply border-red-300 bg-red-50;
}

.upload-area-error:hover {
  @apply border-red-400 bg-red-50;
}

.upload-icon {
  @apply mb-4;
}

.upload-text {
  @apply mb-4 text-center;
}

.browse-link {
  @apply text-purple-500 hover:text-purple-600 underline;
  @apply transition-colors duration-200;
  @apply bg-transparent border-none cursor-pointer;
}

.upload-constraints {
  @apply text-center space-y-1;
}

.selected-file {
  @apply shadow-sm;
}
</style>