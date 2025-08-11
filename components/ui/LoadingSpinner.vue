<template>
  <div 
    :class="[
      'flex items-center justify-center',
      fullScreen ? 'fixed inset-0 bg-white/80 backdrop-blur-sm z-50' : '',
      containerClass
    ]"
  >
    <div class="text-center">
      <!-- Spinner -->
      <div 
        :class="[
          'inline-block rounded-full border-solid animate-spin',
          sizeClasses,
          colorClasses
        ]"
      ></div>
      
      <!-- Loading Text -->
      <div 
        v-if="showText" 
        :class="[
          'mt-4 font-medium',
          textSizeClasses,
          textColorClasses
        ]"
      >
        {{ text }}
      </div>
      
      <!-- Progress Bar (optional) -->
      <div v-if="showProgress && progress !== null" class="mt-4 w-48 mx-auto">
        <div class="bg-gray-200 rounded-full h-2">
          <div 
            class="bg-purple-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        <div class="text-sm text-gray-600 mt-2">{{ progress }}%</div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  // Size variants
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  
  // Color variants
  color: {
    type: String,
    default: 'purple',
    validator: (value) => ['purple', 'blue', 'green', 'red', 'gray'].includes(value)
  },
  
  // Loading text
  text: {
    type: String,
    default: 'Loading...'
  },
  
  // Show/hide text
  showText: {
    type: Boolean,
    default: true
  },
  
  // Full screen overlay
  fullScreen: {
    type: Boolean,
    default: false
  },
  
  // Progress bar
  showProgress: {
    type: Boolean,
    default: false
  },
  
  // Progress value (0-100)
  progress: {
    type: Number,
    default: null
  },
  
  // Custom container classes
  containerClass: {
    type: String,
    default: ''
  }
})

// Computed classes
const sizeClasses = computed(() => {
  const sizes = {
    xs: 'w-4 h-4 border-2',
    sm: 'w-6 h-6 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4'
  }
  return sizes[props.size]
})

const colorClasses = computed(() => {
  const colors = {
    purple: 'border-purple-600 border-t-transparent',
    blue: 'border-blue-600 border-t-transparent',
    green: 'border-green-600 border-t-transparent',
    red: 'border-red-600 border-t-transparent',
    gray: 'border-gray-600 border-t-transparent'
  }
  return colors[props.color]
})

const textSizeClasses = computed(() => {
  const sizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }
  return sizes[props.size]
})

const textColorClasses = computed(() => {
  const colors = {
    purple: 'text-purple-700',
    blue: 'text-blue-700',
    green: 'text-green-700',
    red: 'text-red-700',
    gray: 'text-gray-700'
  }
  return colors[props.color]
})
</script>

<style scoped>
/* Custom border width for better visibility */
.border-3 {
  border-width: 3px;
}

/* Smooth animation */
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

/* Backdrop blur fallback */
@supports not (backdrop-filter: blur(12px)) {
  .backdrop-blur-sm {
    background-color: rgba(255, 255, 255, 0.9);
  }
}
</style>
