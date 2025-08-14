<template>
  <div 
    :class="[
      'flex flex-col items-center justify-center',
      fullScreen ? 'fixed inset-0 bg-white/90 backdrop-blur-sm z-50' : '',
      containerClass
    ]"
  >
    <!-- eTicket Asia Branded Loading -->
    <div class="text-center">
      <!-- Logo with Animated Ring -->
      <div class="relative mb-6">
        <div 
          :class="[
            'relative mx-auto flex items-center justify-center rounded-full bg-white shadow-lg',
            logoContainerClasses
          ]"
        >
          <img 
            :src="logoSrc" 
            alt="eTicket Asia" 
            :class="[
              'object-contain',
              logoImageClasses
            ]"
          />
          <!-- Animated Ring -->
          <div 
            :class="[
              'absolute inset-0 rounded-full border-solid animate-spin',
              ringClasses
            ]"
          ></div>
          <!-- Pulse Effect -->
          <div 
            :class="[
              'absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 opacity-20 animate-pulse',
              pulseClasses
            ]"
          ></div>
        </div>
      </div>

      <!-- Brand Text -->
      <div class="mb-4">
        <h3 :class="brandTextClasses">
          eTicket Asia
        </h3>
        <p :class="subtitleClasses">
          Event Management System
        </p>
      </div>
      
      <!-- Loading Text -->
      <div 
        v-if="showText" 
        :class="[
          'mb-4 font-medium',
          textSizeClasses,
          'text-gray-600'
        ]"
      >
        {{ text }}
      </div>

      <!-- Progress Bar -->
      <div v-if="showProgress && progress !== null" class="w-64 mx-auto">
        <div class="bg-gray-200 rounded-full h-2 mb-2">
          <div 
            class="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        <div class="text-sm text-gray-500">{{ progress }}% Complete</div>
      </div>

      <!-- Loading Dots Animation -->
      <div v-if="showDots" class="flex justify-center space-x-1 mt-4">
        <div 
          v-for="i in 3" 
          :key="i"
          :class="[
            'w-2 h-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 animate-bounce',
            `animation-delay-${i * 200}`
          ]"
          :style="{ animationDelay: `${i * 0.2}s` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import logoImage from '@/assets/image/eticketsasia.png'

// Props
const props = defineProps({
  // Size variants
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
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
  
  // Show loading dots
  showDots: {
    type: Boolean,
    default: true
  },
  
  // Custom container classes
  containerClass: {
    type: String,
    default: ''
  },

  // Custom logo source
  logoSrc: {
    type: String,
    default: logoImage
  }
})

// Computed classes
const logoContainerClasses = computed(() => {
  const sizes = {
    sm: 'w-16 h-16 p-3',
    md: 'w-20 h-20 p-4',
    lg: 'w-24 h-24 p-5',
    xl: 'w-32 h-32 p-6'
  }
  return sizes[props.size]
})

const logoImageClasses = computed(() => {
  const sizes = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  }
  return sizes[props.size]
})

const ringClasses = computed(() => {
  const sizes = {
    sm: 'border-2 border-purple-400 border-t-transparent',
    md: 'border-3 border-purple-500 border-t-transparent',
    lg: 'border-4 border-purple-600 border-t-transparent',
    xl: 'border-4 border-purple-700 border-t-transparent'
  }
  return sizes[props.size]
})

const pulseClasses = computed(() => {
  const sizes = {
    sm: '-inset-1',
    md: '-inset-2',
    lg: '-inset-3',
    xl: '-inset-4'
  }
  return sizes[props.size]
})

const brandTextClasses = computed(() => {
  const sizes = {
    sm: 'text-lg font-bold text-gray-800',
    md: 'text-xl font-bold text-gray-800',
    lg: 'text-2xl font-bold text-gray-800',
    xl: 'text-3xl font-bold text-gray-800'
  }
  return sizes[props.size]
})

const subtitleClasses = computed(() => {
  const sizes = {
    sm: 'text-xs text-gray-500',
    md: 'text-sm text-gray-500',
    lg: 'text-base text-gray-500',
    xl: 'text-lg text-gray-500'
  }
  return sizes[props.size]
})

const textSizeClasses = computed(() => {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }
  return sizes[props.size]
})
</script>

<style scoped>
/* Custom border width for better visibility */
.border-3 {
  border-width: 3px;
}

/* Enhanced animations */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translateY(0);
  }
  40%, 43% {
    transform: translateY(-8px);
  }
  70% {
    transform: translateY(-4px);
  }
  90% {
    transform: translateY(-2px);
  }
}

.animate-spin {
  animation: spin 2s linear infinite;
}

.animate-bounce {
  animation: bounce 1.4s ease-in-out infinite;
}

/* Backdrop blur fallback */
@supports not (backdrop-filter: blur(12px)) {
  .backdrop-blur-sm {
    background-color: rgba(255, 255, 255, 0.95);
  }
}
</style>
