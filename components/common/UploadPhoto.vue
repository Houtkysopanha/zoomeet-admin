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

      <!-- Image Preview (Existing or Selected) -->
      <div v-if="(props.existingImageUrl && !selectedFile) || selectedFile" class="image-preview mt-4">
        <!-- Preview Image Container -->
        <div class="image-preview-container group">
          <img
            :src="getImagePreviewUrl()"
            :alt="getImageAltText()"
            class="preview-image"
            @error="handleImageError"
            @load="handleImageLoad"
          />
          
          <!-- Remove Button Overlay -->
          <div class="image-overlay">
            <Button
              icon="pi pi-times"
              rounded
              size="small"
              @click="handleImageRemove"
              class="remove-btn"
              title="Remove image"
            />
          </div>
          
          <!-- Image Info Overlay -->
          <div class="image-info-overlay" v-if="actualImageDimensions">
            <span class="image-dimensions">
              {{ actualImageDimensions }}
            </span>
          </div>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'

// Use toast for consistent notifications
const toast = useToast()

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
    default: 'below 2MB'
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
const emit = defineEmits(['file-selected', 'file-removed', 'upload-error', 'existing-image-removed'])

// Reactive data
const fileInput = ref(null)
const selectedFile = ref(null)
const selectedFilePreviewUrl = ref(null)
const hasError = ref(false)
const actualImageDimensions = ref('')

// Banner resolution constants
const BANNER_WIDTH = 1800
const BANNER_HEIGHT = 1440
const BANNER_ASPECT_RATIO = BANNER_WIDTH / BANNER_HEIGHT

// Computed properties for preview styling
const getImagePreviewUrl = () => {
  if (selectedFile.value && selectedFilePreviewUrl.value) {
    return selectedFilePreviewUrl.value
  }
  if (props.existingImageUrl) {
    return props.existingImageUrl
  }
  return null
}

const getImageAltText = () => {
  if (selectedFile.value) {
    return selectedFile.value.name
  }
  return props.label || 'Preview image'
}

// Watch for selected file changes to create preview URL
watch(selectedFile, (newFile) => {
  if (selectedFilePreviewUrl.value) {
    URL.revokeObjectURL(selectedFilePreviewUrl.value)
    selectedFilePreviewUrl.value = null
  }
  
  if (newFile && newFile instanceof File) {
    selectedFilePreviewUrl.value = URL.createObjectURL(newFile)
  }
})

// Methods
const triggerFileInput = (event) => {
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  
  if (fileInput.value) {
    // Use setTimeout to ensure the click happens after event handling
    setTimeout(() => {
      fileInput.value.click()
    }, 0)
  } else {
  }
}

const handleBrowseClick = (event) => {
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
  const file = event.target.files[0]
  if (file) {
    validateAndProcessFile(file)
  } else {
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
    const errorData = {
      type: 'size',
      message: `File size must be ${props.maxSizeText}`,
      file
    }
    
    // Standard PrimeVue toast notification
    toast.add({
      severity: 'error',
      summary: 'File Size Error',
      detail: errorData.message,
      life: 4000
    })
    
    emit('upload-error', errorData)
    return
  }
  
  // Check file type
  if (props.allowedTypes.length > 0 && !props.allowedTypes.includes(file.type)) {
    hasError.value = true
    const errorData = {
      type: 'type',
      message: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)',
      file
    }
    
    // Standard PrimeVue toast notification
    toast.add({
      severity: 'error',
      summary: 'Invalid File Type',
      detail: errorData.message,
      life: 4000
    })
    
    emit('upload-error', errorData)
    return
  }

  selectedFile.value = file
  
  // Success notification
  toast.add({
    severity: 'success',
    summary: 'File Selected',
    detail: `${file.name} selected successfully`,
    life: 3000
  })
  
  emit('file-selected', file)
}

const removeFile = () => {
  if (selectedFilePreviewUrl.value) {
    URL.revokeObjectURL(selectedFilePreviewUrl.value)
    selectedFilePreviewUrl.value = null
  }
  
  selectedFile.value = null
  actualImageDimensions.value = ''
  
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  
  // Standard PrimeVue toast notification
  toast.add({
    severity: 'info',
    summary: 'File Removed',
    detail: 'Selected image has been removed',
    life: 2000
  })
  
  emit('file-removed')
}

const removeExistingImage = () => {
  actualImageDimensions.value = ''
  
  // Standard PrimeVue toast notification  
  toast.add({
    severity: 'info',
    summary: 'Image Removed',
    detail: 'Current image has been removed',
    life: 2000
  })
  
  emit('existing-image-removed')
}

const handleImageRemove = () => {
  if (selectedFile.value) {
    removeFile()
  } else if (props.existingImageUrl) {
    removeExistingImage()
  }
}

const handleImageError = (event) => {
  console.warn('Failed to load image:', props.existingImageUrl || selectedFilePreviewUrl.value)
  event.target.style.display = 'none'
  
  // Standard PrimeVue toast notification for image load error
  toast.add({
    severity: 'warn',
    summary: 'Image Load Error',
    detail: 'Failed to load the image. Please try uploading again.',
    life: 3000
  })
}

const handleImageLoad = (event) => {
  const img = event.target
  const naturalWidth = img.naturalWidth
  const naturalHeight = img.naturalHeight
  const aspectRatio = naturalWidth / naturalHeight
  
  actualImageDimensions.value = `${naturalWidth}×${naturalHeight}`
  
  // Add dimension validation info
  if (naturalWidth === BANNER_WIDTH && naturalHeight === BANNER_HEIGHT) {
    actualImageDimensions.value += ' ✓ Perfect'
  } else if (Math.abs(aspectRatio - BANNER_ASPECT_RATIO) < 0.01) {
    actualImageDimensions.value += ' ✓ Ratio'
  } else {
    actualImageDimensions.value += ' ⚠ Check'
  }
}

const handleNewImageLoad = (event) => {
  handleImageLoad(event)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Cleanup on unmount
onMounted(() => {
  // Cleanup any existing object URLs when component unmounts
  const cleanup = () => {
    if (selectedFilePreviewUrl.value) {
      URL.revokeObjectURL(selectedFilePreviewUrl.value)
    }
  }
  
  // Add cleanup to beforeunload for safety
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', cleanup)
  }
})

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

/* Image Preview Styles */
.image-preview {
  @apply mt-4;
}

.image-preview-container {
  @apply relative rounded-lg border border-gray-200 overflow-hidden;
  @apply bg-white shadow-sm;
  max-width: 400px;
  margin: 0 auto;
}

.preview-image {
  @apply w-full;
  height: 200px;
  object-fit: contain;
  object-position: center;
  transition: all 0.3s ease;
}

.image-overlay {
  @apply absolute inset-0;
  @apply bg-black bg-opacity-0 group-hover:bg-opacity-20;
  @apply flex items-center justify-center;
  @apply transition-all duration-200;
  @apply opacity-0 group-hover:opacity-100;
}

.remove-btn {
  @apply bg-red-500 text-white;
  @apply hover:bg-red-600;
  @apply shadow-lg;
  @apply transform scale-90 group-hover:scale-100;
  @apply transition-all duration-200;
}

.image-info-overlay {
  @apply absolute bottom-2 left-2;
  @apply opacity-0 group-hover:opacity-100;
  @apply transition-opacity duration-200;
}

.image-dimensions {
  @apply text-xs text-white bg-black bg-opacity-75 px-2 py-1 rounded;
  @apply backdrop-blur-sm;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

/* Remove button styling */
:deep(.remove-btn.p-button) {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

:deep(.remove-btn .p-button-icon) {
  font-size: 1.2rem;
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

/* Responsive adjustments */
@media (max-width: 640px) {
  .image-preview-container {
    max-width: 100%;
  }
  
  .preview-image {
    height: 160px;
  }
}

/* Hover effects for preview */
.image-preview-container:hover .preview-image {
  transform: scale(1.02);
}

/* Loading state for images */
.preview-image {
  background: linear-gradient(90deg, #f0f0f0 25%, transparent 25%), 
              linear-gradient(#f0f0f0 50%, transparent 50%);
  background-size: 20px 20px;
  background-position: 0 0, 10px 10px;
}

.preview-image[src]:not([src=""]) {
  background: none;
}
</style>