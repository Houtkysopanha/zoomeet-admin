<template>
  <div
    v-if="visible"
    :class="[
      'fixed inset-0 z-50 flex items-center justify-center',
      'bg-white/90 backdrop-blur-sm'
    ]"
  >
    <div class="text-center">
      <!-- Main Loading Container -->
      <div class="relative">
        <!-- Outer Ring -->
        <div
          :class="[
            'relative mx-auto rounded-full border-4 border-purple-300/50',
            sizeClasses.outer
          ]"
        >
          <!-- Progress Ring -->
          <svg 
            :class="[
              'absolute inset-0 transform -rotate-90',
              sizeClasses.svg
            ]"
            viewBox="0 0 100 100"
          >
            <!-- Background Circle -->
            <circle
              cx="50"
              cy="50"
              :r="radius"
              stroke="rgba(147, 51, 234, 0.2)"
              stroke-width="4"
              fill="none"
            />
            <!-- Progress Circle -->
            <circle
              cx="50"
              cy="50"
              :r="radius"
              stroke="#9333ea"
              stroke-width="4"
              fill="none"
              stroke-linecap="round"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="strokeDashoffset"
              class="transition-all duration-500 ease-out"
            />
          </svg>

          <!-- Inner Spinner -->
          <div
            :class="[
              'absolute inset-4 rounded-full border-2 border-purple-300/50 border-t-purple-600 animate-spin',
              sizeClasses.inner
            ]"
          ></div>

          <!-- Center Content -->
          <div
            :class="[
              'absolute inset-0 flex flex-col items-center justify-center text-purple-700',
              sizeClasses.content
            ]"
          >
            <!-- eTicket Asia Logo -->
            <div v-if="showLogo" class="mb-2">
              <img
                :src="logoSrc"
                alt="eTicket Asia"
                :class="sizeClasses.logo"
                class="object-contain"
              />
            </div>

            <!-- Percentage -->
            <div 
              :class="[
                'font-bold tabular-nums',
                sizeClasses.percentage
              ]"
            >
              {{ Math.round(currentProgress) }}%
            </div>

            <!-- Loading Text -->
            <div 
              v-if="showText"
              :class="[
                'font-medium opacity-90 mt-1',
                sizeClasses.text
              ]"
            >
              {{ text }}
            </div>
          </div>
        </div>

        <!-- Floating Dots Animation -->
        <div v-if="showDots" class="absolute inset-0 pointer-events-none">
          <div
            v-for="i in 8"
            :key="i"
            :class="[
              'absolute w-2 h-2 bg-purple-500 rounded-full animate-pulse',
              `dot-${i}`
            ]"
            :style="getDotStyle(i)"
          ></div>
        </div>
      </div>

      <!-- Status Text -->
      <div
        v-if="statusText"
        class="mt-6 text-purple-600 text-sm font-medium"
      >
        {{ statusText }}
      </div>

      <!-- Progress Steps -->
      <div v-if="showSteps && steps.length" class="mt-4 space-y-2">
        <div
          v-for="(step, index) in steps"
          :key="index"
          :class="[
            'flex items-center text-sm',
            index < currentStep ? 'text-purple-700' : 'text-purple-400'
          ]"
        >
          <div
            :class="[
              'w-4 h-4 rounded-full mr-3 flex items-center justify-center text-xs',
              index < currentStep ? 'bg-purple-600 text-white' : 'bg-purple-200'
            ]"
          >
            <i v-if="index < currentStep" class="pi pi-check"></i>
            <span v-else>{{ index + 1 }}</span>
          </div>
          {{ step }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import logoImage from '@/assets/image/eticketsasia.png'

// Props
const props = defineProps({
  // Visibility
  visible: {
    type: Boolean,
    default: false
  },
  
  // Progress (0-100)
  progress: {
    type: Number,
    default: 0
  },
  
  // Loading text
  text: {
    type: String,
    default: 'Loading...'
  },
  
  // Status text
  statusText: {
    type: String,
    default: ''
  },
  
  // Size variant
  size: {
    type: String,
    default: 'lg',
    validator: (value) => ['md', 'lg', 'xl'].includes(value)
  },
  
  // Show text
  showText: {
    type: Boolean,
    default: true
  },
  
  // Show logo
  showLogo: {
    type: Boolean,
    default: true
  },
  
  // Show floating dots
  showDots: {
    type: Boolean,
    default: true
  },
  
  // Show progress steps
  showSteps: {
    type: Boolean,
    default: false
  },
  
  // Progress steps
  steps: {
    type: Array,
    default: () => []
  },
  
  // Current step
  currentStep: {
    type: Number,
    default: 0
  },
  
  // Logo source
  logoSrc: {
    type: String,
    default: logoImage
  }
})

// Reactive progress for smooth animation
const currentProgress = ref(0)

// Watch progress changes for smooth animation
watch(() => props.progress, (newProgress) => {
  const duration = 500 // Animation duration in ms
  const steps = 30 // Number of animation steps
  const stepDuration = duration / steps
  const progressDiff = newProgress - currentProgress.value
  const stepSize = progressDiff / steps
  
  let step = 0
  const animate = () => {
    if (step < steps) {
      currentProgress.value += stepSize
      step++
      setTimeout(animate, stepDuration)
    } else {
      currentProgress.value = newProgress
    }
  }
  animate()
}, { immediate: true })

// Size configurations
const sizeClasses = computed(() => {
  const sizes = {
    md: {
      outer: 'w-24 h-24',
      svg: 'w-24 h-24',
      inner: 'w-16 h-16',
      content: 'text-center',
      logo: 'w-6 h-6',
      percentage: 'text-lg',
      text: 'text-xs'
    },
    lg: {
      outer: 'w-32 h-32',
      svg: 'w-32 h-32',
      inner: 'w-24 h-24',
      content: 'text-center',
      logo: 'w-8 h-8',
      percentage: 'text-2xl',
      text: 'text-sm'
    },
    xl: {
      outer: 'w-40 h-40',
      svg: 'w-40 h-40',
      inner: 'w-32 h-32',
      content: 'text-center',
      logo: 'w-10 h-10',
      percentage: 'text-3xl',
      text: 'text-base'
    }
  }
  return sizes[props.size]
})

// Circle calculations
const radius = 46
const circumference = 2 * Math.PI * radius

const strokeDashoffset = computed(() => {
  const progress = Math.max(0, Math.min(100, currentProgress.value))
  return circumference - (progress / 100) * circumference
})

// Floating dots positioning
const getDotStyle = (index) => {
  const angle = (index - 1) * 45 // 8 dots, 45 degrees apart
  const radius = 60 // Distance from center
  const x = 50 + radius * Math.cos((angle * Math.PI) / 180)
  const y = 50 + radius * Math.sin((angle * Math.PI) / 180)
  
  return {
    left: `${x}%`,
    top: `${y}%`,
    transform: 'translate(-50%, -50%)',
    animationDelay: `${index * 0.2}s`
  }
}
</script>

<style scoped>
/* Smooth animations */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Floating dots animation */
@keyframes float {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 1;
  }
}

.dot-1 { animation: float 2s ease-in-out infinite; }
.dot-2 { animation: float 2s ease-in-out infinite 0.25s; }
.dot-3 { animation: float 2s ease-in-out infinite 0.5s; }
.dot-4 { animation: float 2s ease-in-out infinite 0.75s; }
.dot-5 { animation: float 2s ease-in-out infinite 1s; }
.dot-6 { animation: float 2s ease-in-out infinite 1.25s; }
.dot-7 { animation: float 2s ease-in-out infinite 1.5s; }
.dot-8 { animation: float 2s ease-in-out infinite 1.75s; }

/* Backdrop blur fallback */
@supports not (backdrop-filter: blur(12px)) {
  .backdrop-blur-sm {
    background-color: rgba(255, 255, 255, 0.9);
  }
}
</style>
