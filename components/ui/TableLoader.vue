<template>
  <div class="relative">
    <!-- Loading Overlay -->
    <div 
      v-if="loading"
      class="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center"
    >
      <BrandedLoader 
        :size="size"
        :text="text"
        :showProgress="showProgress"
        :progress="progress"
        :showDots="true"
      />
    </div>

    <!-- Table Content -->
    <div :class="{ 'opacity-50 pointer-events-none': loading }">
      <!-- Skeleton Loader (shown when loading and no data) -->
      <TableSkeleton 
        v-if="loading && showSkeleton"
        :rows="skeletonRows"
        :headers="skeletonHeaders"
        :showPagination="showPagination"
      />
      
      <!-- Actual Table Content -->
      <slot v-else></slot>
    </div>
  </div>
</template>

<script setup>
import BrandedLoader from './BrandedLoader.vue'
import TableSkeleton from './TableSkeleton.vue'

// Props
const props = defineProps({
  // Loading state
  loading: {
    type: Boolean,
    default: false
  },
  
  // Loading text
  text: {
    type: String,
    default: 'Loading data...'
  },
  
  // Loader size
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  
  // Show progress bar
  showProgress: {
    type: Boolean,
    default: false
  },
  
  // Progress value (0-100)
  progress: {
    type: Number,
    default: null
  },
  
  // Show skeleton loader instead of overlay
  showSkeleton: {
    type: Boolean,
    default: false
  },
  
  // Skeleton configuration
  skeletonRows: {
    type: Number,
    default: 5
  },
  
  skeletonHeaders: {
    type: Array,
    default: () => [
      { width: 'col-span-3' }, // Event name
      { width: 'col-span-2' }, // Date
      { width: 'col-span-2' }, // Venue
      { width: 'col-span-2' }, // Type
      { width: 'col-span-1' }, // Revenue
      { width: 'col-span-1' }, // Status
      { width: 'col-span-1' }, // Actions
    ]
  },
  
  // Show pagination in skeleton
  showPagination: {
    type: Boolean,
    default: true
  }
})
</script>

<style scoped>
/* Smooth transitions */
.opacity-50 {
  transition: opacity 0.3s ease-in-out;
}

/* Backdrop blur fallback */
@supports not (backdrop-filter: blur(12px)) {
  .backdrop-blur-sm {
    background-color: rgba(255, 255, 255, 0.9);
  }
}
</style>
