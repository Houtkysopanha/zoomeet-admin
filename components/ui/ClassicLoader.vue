<template>
  <div
    v-if="visible"
    :class="[
      'fixed inset-0 z-50 flex items-center justify-center',
      'bg-white/90 backdrop-blur-sm'
    ]"
  >
    <div class="text-center">
      <div class="relative">
        <div
          :class="[
            'relative mx-auto rounded-full border-4 border-purple-300/50',
            sizeClasses.outer
          ]"
        >
          <svg 
            :class="[
              'absolute inset-0 transform -rotate-90',
              sizeClasses.svg
            ]"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              :r="radius"
              stroke="rgba(147, 51, 234, 0.2)"
              stroke-width="4"
              fill="none"
            />
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

          <div
            :class="[
              'absolute inset-4 rounded-full border-2 border-purple-300/50 border-t-purple-600 animate-spin',
              sizeClasses.inner
            ]"
          ></div>

          <div
            :class="[
              'absolute inset-0 flex flex-col items-center justify-center text-purple-700',
              sizeClasses.content
            ]"
          >
            <div v-if="showLogo" class="mb-2">
              <img
                :src="logoSrc"
                alt="eTicket Asia"
                :class="sizeClasses.logo"
                class="object-contain"
              />
            </div>

            <div 
              :class="[
                'font-bold tabular-nums',
                sizeClasses.percentage
              ]"
            >
              {{ Math.round(currentProgress) }}%
            </div>

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

      <div
        v-if="statusText"
        class="mt-6 text-purple-600 text-sm font-medium"
      >
        {{ statusText }}
      </div>

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
            <svg v-if="index < currentStep" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            <span v-else>{{ index + 1 }}</span>
          </div>
          {{ step }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
// Use a more descriptive name for the imported image.
import logoImage from '@/assets/image/logo1.png';

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number,
    default: 0
  },
  text: {
    type: String,
    default: 'Loading...'
  },
  statusText: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'lg',
    validator: (value) => ['md', 'lg', 'xl'].includes(value)
  },
  showText: {
    type: Boolean,
    default: true
  },
  showLogo: {
    type: Boolean,
    default: true
  },
  showDots: {
    type: Boolean,
    default: true
  },
  showSteps: {
    type: Boolean,
    default: false
  },
  steps: {
    type: Array,
    default: () => []
  },
  currentStep: {
    type: Number,
    default: 0
  },
  logoSrc: {
    type: String,
    default: logoImage
  }
});

const currentProgress = ref(props.progress);

// Use a cleaner, more reliable watch with a direct transition
watch(() => props.progress, (newProgress) => {
  currentProgress.value = newProgress;
});

const sizeClasses = computed(() => {
  const sizes = {
    md: {
      outer: 'w-24 h-24',
      svg: 'w-24 h-24',
      inner: 'w-16 h-16',
      logo: 'w-10 h-10',
      percentage: 'text-xl',
      text: 'text-sm'
    },
    lg: {
      outer: 'w-32 h-32',
      svg: 'w-32 h-32',
      inner: 'w-24 h-24',
      logo: 'w-14 h-14',
      percentage: 'text-3xl',
      text: 'text-base'
    },
    xl: {
      outer: 'w-44 h-44',
      svg: 'w-44 h-44',
      inner: 'w-32 h-32',
      logo: 'w-20 h-20',
      percentage: 'text-4xl',
      text: 'text-lg'
    }
  };
  // Use a default size if the prop is invalid, though the validator prevents this.
  return sizes[props.size] || sizes.lg;
});


// Circle calculations
const radius = 46;
const circumference = 2 * Math.PI * radius;

const strokeDashoffset = computed(() => {
  const progress = Math.max(0, Math.min(100, currentProgress.value));
  return circumference - (progress / 100) * circumference;
});

// Floating dots positioning
const getDotStyle = (index) => {
  const angle = (index - 1) * 45;
  const dotRadius = 60; // Renamed for clarity
  const x = 50 + dotRadius * Math.cos((angle * Math.PI) / 180);
  const y = 50 + dotRadius * Math.sin((angle * Math.PI) / 180);
  
  return {
    left: `${x}%`,
    top: `${y}%`,
    transform: 'translate(-50%, -50%)',
    animationDelay: `${(index - 1) * 0.2}s` // Start delay from 0s for the first dot
  };
};
</script>

<style scoped>
/* Scoped styles remain largely the same, but comments are added for clarity. */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Loader glow effect */
svg circle:nth-child(2) {
  filter: drop-shadow(0 0 8px rgba(147, 51, 234, 0.7));
}

/* Inner spinner with glow */
.animate-spin {
  border-top-color: #9333ea;
  filter: drop-shadow(0 0 6px rgba(147, 51, 234, 0.8));
}

/* Gradient text for percentage */
.tabular-nums {
  background: linear-gradient(90deg, #6a11cb, #2575fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
}

/* Floating dots animation */
@keyframes float {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.4);
    opacity: 1;
  }
}

/* Removed redundant individual dot animations.
   Instead, use a single class with `animation-delay` set in JS. */
.dot {
  animation: float 2s ease-in-out infinite;
}

/* Floating dots glow */
[class*="dot-"] {
  box-shadow: 0 0 10px rgba(147, 51, 234, 0.7);
}

/* Backdrop blur fallback */
@supports not (backdrop-filter: blur(12px)) {
  .backdrop-blur-sm {
    background-color: rgba(255, 255, 255, 0.9);
  }
}
</style>