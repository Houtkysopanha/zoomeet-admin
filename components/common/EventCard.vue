<template>
  <!-- Main card container -->
  <div class=" bg-transparent rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-3 md:p-4 ">
    <!-- Top section: Image and Event Details -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
      <!-- Left side: Image with overlay text -->
      <div class="relative w-full rounded-xl overflow-hidden shadow-md h-48 sm:h-52 md:h-[8rem] md:mb-5 ">
        <img
          :src="displayImageSrc"
          :alt="altText"
          class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          :onerror="`this.onerror=null;this.src='${fallbackImage}';`"
        />
      </div>

      <!-- Right side: Event Title, Owner, Location -->
      <div class="flex flex-col p-1 space-y-3">
        <h2 class="text-lg md:text-md font-semibold text-gray-800 leading-tight line-clamp-2">{{ eventTitle }}</h2>
        
        <!-- Owner section with proper icon alignment -->
        <div class="flex items-start text-gray-600">
          <i class="pi pi-user text-blue-950 font-medium text-sm mr-2 mt-0.5 flex-shrink-0"></i>
          <div class="flex-1 min-w-0">
            <span class="text-sm text-blue-950 font-medium md:text-sm break-words">
              <span class="text-gray-600 md:text-sm">Owner:</span> {{ owner }}
            </span>
          </div>
        </div>
        
        <!-- Location section with proper icon alignment -->
        <div class="flex items-start text-gray-600">
          <i class="pi pi-map-marker text-blue-950 font-medium text-base mr-2 mt-0.5 flex-shrink-0"></i>
          <div class="flex-1 min-w-0">
            <span class="text-sm text-blue-950 font-medium md:text-sm break-words">{{ location }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom section: Date and Time -->
    <div class="flex flex-col sm:flex-row justify-around items-center bg-[#F8F8FF] border border-white p-3 rounded-xl shadow-md">
      <div class="flex flex-col items-center text-center mb-2 sm:mb-0">
        <p class="text-gray-500 text-xs font-medium">Date</p>
        <p class="text-gray-800 text-base md:text-sm font-semibold">{{ formattedDate }}</p>
      </div>

      <!-- Vertical separator (visible on larger screens) -->
      <div class="hidden sm:block w-px bg-gray-300 h-10 mx-3"></div>
      <!-- Horizontal separator (visible on smaller screens) -->
      <div class="block sm:hidden w-full h-px bg-gray-300 my-1"></div>

      <div class="flex flex-col items-center text-center">
        <p class="text-gray-500 text-xs font-medium">Time</p>
        <p class="text-gray-800 text-base md:text-sm font-semibold">{{ formattedTime }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatEventDateRange, formatEventTime } from '~/utils/dateFormatter'

const props = defineProps({
  imageSrc: { type: String, default: '' },
  altText: { type: String, default: 'Promotional Image' },
  fallbackImage: { type: String, default: '' },
  overlayText1: { type: String, default: '' },
  overlayText2: { type: String, default: '' },
  overlayText3: { type: String, default: '' },
  eventTitle: { type: String, default: 'Navigating the future of cybersecurity in Cambodia 2015' },
  owner: { type: String, default: 'An Sovanvichka' },
  location: { type: String, default: 'Hayatt Regency, Phnom Penh' },
  date: { type: String, default: '14-16 July, 2025' },
  time: { type: String, default: '10:00 AM GMT+7' },
  // FIXED: Add support for event data with chairs
  eventData: { type: Object, default: null },
  chairs: { type: Array, default: () => [] },
  // Add raw date props for proper formatting
  startDate: { type: String, default: null },
  endDate: { type: String, default: null }
})

// FIXED: Enhanced image source logic to handle cover image, card background, and chair images
const displayImageSrc = computed(() => {
  // Priority 1: Explicit imageSrc prop
  if (props.imageSrc && props.imageSrc.trim()) {
    return props.imageSrc
  }
  
  // Priority 2: Event data cover image
  if (props.eventData?.cover_image_url) {
    return props.eventData.cover_image_url
  }
  
  // Priority 3: Event data card background
  if (props.eventData?.card_background_url) {
    return props.eventData.card_background_url
  }
  
  // Priority 4: Event data event background
  if (props.eventData?.event_background_url) {
    return props.eventData.event_background_url
  }
  
  // Priority 5: First chair image with profile_image_url (excluding placeholders)
  if (props.chairs && props.chairs.length > 0) {
    const chairWithImage = props.chairs.find(chair => {
      if (!chair.profile_image_url || typeof chair.profile_image_url !== 'string') return false;
      const trimmedUrl = chair.profile_image_url.trim();
      if (trimmedUrl === '') return false;
      
      const lowercaseUrl = trimmedUrl.toLowerCase();
      const isPlaceholder = lowercaseUrl === 'null' ||
                           lowercaseUrl === 'undefined' ||
                           lowercaseUrl.includes('default') || 
                           lowercaseUrl.includes('placeholder') || 
                           lowercaseUrl.includes('avatar.png') ||
                           lowercaseUrl.includes('no-image') ||
                           lowercaseUrl.includes('not-found') ||
                           lowercaseUrl.includes('blank') ||
                           lowercaseUrl.includes('empty');
      return !isPlaceholder;
    });
    
    if (chairWithImage) {
      return chairWithImage.profile_image_url
    }
  }
  
  // Priority 6: Event data chairs (excluding placeholders)
  if (props.eventData?.chairs && props.eventData.chairs.length > 0) {
    const chairWithImage = props.eventData.chairs.find(chair => {
      if (!chair.profile_image_url || typeof chair.profile_image_url !== 'string') return false;
      const trimmedUrl = chair.profile_image_url.trim();
      if (trimmedUrl === '') return false;
      
      const lowercaseUrl = trimmedUrl.toLowerCase();
      const isPlaceholder = lowercaseUrl === 'null' ||
                           lowercaseUrl === 'undefined' ||
                           lowercaseUrl.includes('default') || 
                           lowercaseUrl.includes('placeholder') || 
                           lowercaseUrl.includes('avatar.png') ||
                           lowercaseUrl.includes('no-image') ||
                           lowercaseUrl.includes('not-found') ||
                           lowercaseUrl.includes('blank') ||
                           lowercaseUrl.includes('empty');
      return !isPlaceholder;
    });
    
    if (chairWithImage) {
      return chairWithImage.profile_image_url
    }
  }
  
  // Fallback to default fallback image
  return props.fallbackImage || '/assets/image/not-found.png'
})

// Computed property for formatted date
const formattedDate = computed(() => {
  // Use raw date props if available
  if (props.startDate) {
    return formatEventDateRange(props.startDate, props.endDate)
  }
  
  // Use event data if available
  if (props.eventData?.start_date) {
    return formatEventDateRange(props.eventData.start_date, props.eventData.end_date)
  }
  
  // Fallback to prop date
  return props.date
})

// Computed property for formatted time
const formattedTime = computed(() => {
  // Use event data if available
  if (props.eventData?.start_date) {
    return formatEventTime(props.eventData)
  }
  
  // Use start date prop if available
  if (props.startDate) {
    return formatEventTime({ start_date: props.startDate })
  }
  
  // Fallback to prop time
  return props.time
})
</script>

<style scoped>
/* Line clamp utility for text truncation */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Ensure text breaks properly in long words */
.break-words {
  word-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
}

/* Smooth transitions for interactive elements */
.transition-transform {
  transition: transform 0.3s ease;
}

/* Improve text shadow for overlay text */
.drop-shadow-lg {
  filter: drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1));
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .line-clamp-2 {
    -webkit-line-clamp: 3;
    line-clamp: 3;
  }
}
</style>