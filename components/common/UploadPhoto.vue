<template>
  <div class="file-upload-component p-6 border border-gray-200 rounded-2xl">
    <!-- Label -->
    <h3 v-if="label" class="text-lg font-medium text-gray-800 mb-4">{{ label }}</h3>
    
    <!-- Upload Area -->
    <div
      class="upload-area"
      :class="{ 'upload-area-error': hasError }"
      @drop.prevent.stop="handleDrop"
      @dragover.prevent.stop="handleDragOver"
      @dragenter.prevent.stop="handleDragEnter"
      @click.prevent.stop="triggerFileInput"
    >
      <!-- Upload Icon -->
      <div class="upload-icon" @click.prevent.stop="triggerFileInput">
        <i :class="iconClass" class="text-4xl text-purple-500 pointer-events-none"></i>
      </div>
      
      <!-- Upload Text -->
      <div class="upload-text" @click.prevent.stop="triggerFileInput">
        <span class="text-gray-600 pointer-events-none">{{ uploadText }} </span>
        <button
          type="button"
          class="browse-link"
          @click.prevent.stop="handleBrowseClick"
        >
          browse
        </button>
      </div>
      
      <!-- File Constraints -->
      <div class="upload-constraints" v-if="showConstraints">
        <p class="text-xs text-gray-400">*Maximum file size: {{ maxSizeText }}</p>
        <p v-if="dimensionsText" class="text-xs text-gray-400">*{{ dimensionsText }}</p>
      </div>

      <!-- Existing Image Preview -->
      <div v-if="props.existingImageUrl && !selectedFile" class="existing-image mt-4 p-3 bg-white rounded-lg border">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-700">Current Image</span>
          <Button
            icon="pi pi-times"
            text
            rounded
            size="small"
            @click="removeExistingImage"
            class="text-red-500 hover:text-red-600"
            title="Remove current image"
          />
        </div>
        <div class="existing-image-preview">
          <img
            :src="props.existingImageUrl"
            :alt="props.label"
            class="max-w-full max-h-32 object-contain rounded border"
            @error="handleImageError"
          />
        </div>
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
  },
  existingImageUrl: {
    type: String,
    default: null
  }
})

// Emits
const emit = defineEmits(['file-selected', 'file-removed', 'upload-error'])

// Reactive data
const fileInput = ref(null)
const selectedFile = ref(null)
const hasError = ref(false)

// Methods
const triggerFileInput = (event) => {
  console.log('🖱️ Triggering file input click', event?.target?.tagName)
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  
  if (fileInput.value) {
    console.log('📁 File input found, triggering click')
    // Use setTimeout to ensure the click happens after event handling
    setTimeout(() => {
      fileInput.value.click()
    }, 0)
  } else {
    console.error('❌ File input ref not found')
  }
}

const handleBrowseClick = (event) => {
  console.log('🖱️ Browse button clicked')
  event.preventDefault()
  event.stopPropagation()
  triggerFileInput(event)
}

const handleDragOver = (event) => {
  event.preventDefault()
}

const handleDragEnter = (event) => {
  event.preventDefault()
}

const handleFileSelect = (event) => {
  console.log('📁 File input changed', event.target.files)
  const file = event.target.files[0]
  if (file) {
    console.log('📎 File selected:', file.name, file.size, file.type)
    validateAndProcessFile(file)
  } else {
    console.log('❌ No file selected')
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
  console.log('🔍 Validating file:', file.name, file.size, file.type)
  hasError.value = false
  
  // Check file size
  if (file.size > props.maxSize) {
    console.error('❌ File too large:', file.size, 'max:', props.maxSize)
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
    console.error('❌ Invalid file type:', file.type, 'allowed:', props.allowedTypes)
    hasError.value = true
    emit('upload-error', {
      type: 'type',
      message: 'Please select a valid file type',
      file
    })
    return
  }
  
  console.log('✅ File validation passed, emitting file-selected')
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

const removeExistingImage = () => {
  emit('existing-image-removed')
}

const handleImageError = (event) => {
  console.warn('Failed to load existing image:', props.existingImageUrl)
  event.target.style.display = 'none'
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
  @apply relative;
  min-height: 200px;
  z-index: 1;
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
  @apply mb-4 cursor-pointer;
  z-index: 2;
}

.upload-text {
  @apply mb-4 text-center cursor-pointer;
  z-index: 2;
}

.browse-link {
  @apply text-purple-500 hover:text-purple-600 underline;
  @apply transition-colors duration-200;
  @apply bg-transparent border-none cursor-pointer;
  @apply inline-block;
  z-index: 3;
}

.upload-constraints {
  @apply text-center space-y-1;
  z-index: 2;
}

.selected-file {
  @apply shadow-sm;
}

/* Ensure file input is properly hidden but accessible */
input[type="file"] {
  position: absolute !important;
  left: -9999px !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

/* Prevent any interference from child elements */
.upload-area * {
  user-select: none;
}

.browse-link {
  user-select: text;
}
</style>