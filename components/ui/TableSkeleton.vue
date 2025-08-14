<template>
  <div class="animate-pulse">
    <!-- Table Header Skeleton -->
    <div class="bg-gray-50 border-b border-gray-200">
      <div class="grid grid-cols-12 gap-4 p-4">
        <div 
          v-for="(header, index) in headers" 
          :key="index"
          :class="[
            'h-4 bg-gray-300 rounded',
            header.width || 'col-span-2'
          ]"
        ></div>
      </div>
    </div>

    <!-- Table Body Skeleton -->
    <div class="divide-y divide-gray-200">
      <div 
        v-for="row in rows" 
        :key="row"
        class="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50"
      >
        <div 
          v-for="(cell, index) in headers" 
          :key="index"
          :class="[
            'h-4 bg-gray-200 rounded',
            cell.width || 'col-span-2'
          ]"
        ></div>
      </div>
    </div>

    <!-- Pagination Skeleton -->
    <div v-if="showPagination" class="flex items-center justify-between p-4 border-t border-gray-200">
      <div class="flex items-center space-x-2">
        <div class="h-4 bg-gray-300 rounded w-32"></div>
      </div>
      <div class="flex items-center space-x-2">
        <div class="h-8 bg-gray-300 rounded w-20"></div>
        <div class="h-8 bg-gray-300 rounded w-8"></div>
        <div class="h-8 bg-gray-300 rounded w-8"></div>
        <div class="h-8 bg-gray-300 rounded w-20"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  // Number of skeleton rows to show
  rows: {
    type: Number,
    default: 5
  },
  
  // Header configuration
  headers: {
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
  
  // Show pagination skeleton
  showPagination: {
    type: Boolean,
    default: true
  }
})
</script>

<style scoped>
/* Enhanced pulse animation */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Staggered animation for rows */
.animate-pulse > div:nth-child(1) { animation-delay: 0ms; }
.animate-pulse > div:nth-child(2) { animation-delay: 100ms; }
.animate-pulse > div:nth-child(3) { animation-delay: 200ms; }
.animate-pulse > div:nth-child(4) { animation-delay: 300ms; }
.animate-pulse > div:nth-child(5) { animation-delay: 400ms; }
.animate-pulse > div:nth-child(6) { animation-delay: 500ms; }
</style>
