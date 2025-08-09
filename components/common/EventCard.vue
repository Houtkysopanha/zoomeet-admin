<template>
  <!-- Main card container -->
  <div class=" bg-transparent rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-3 md:p-4 ">
    <!-- Top section: Image and Event Details -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-10">
      <!-- Left side: Image with overlay text -->
      <div class="relative w-full rounded-xl overflow-hidden shadow-md h-48 md:h-40">
        <img
          :src="imageSrc"
          :alt="altText"
          class="w-full h-full lg:h-full lg:w-full object-cover"
          :onerror="`this.onerror=null;this.src='${fallbackImage}';`"
        />
        <!-- <div class="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 opacity-70"></div> -->
        <div class="absolute inset-0 flex flex-col justify-center items-start p-2 text-white text-left">
          <p class="text-xs md:text-sm font-light mb-1">{{ overlayText1 }}</p>
          <p class="text-xl md:text-2xl font-bold leading-tight">{{ overlayText2 }}</p>
          <p class="text-xs md:text-sm">{{ overlayText3 }}</p>
        </div>
      </div>

      <!-- Right side: Event Title, Owner, Location -->
      <div class="flex flex-col  p-1">
        <h2 class="text-lg md:text-xl font-semibold text-gray-800 mb-5 leading-tight">{{ eventTitle }}</h2>
        <div class="flex items-center text-gray-600 mb-5">
          <i class="pi pi-user text-base mr-1"></i>
          <span class="text-sm md:text-base">Owner: {{ owner }}</span>
        </div>
        <div class="flex items-center text-gray-600">
          <i class="pi pi-map-marker text-base mr-1"></i>
          <span class="text-sm md:text-base">{{ location }}</span>
        </div>
      </div>
    </div>

    <!-- Bottom section: Date and Time -->
    <div class="flex flex-col sm:flex-row justify-around items-center bg-white p-6 h-30 rounded-xl shadow-md">
      <div class="flex flex-col items-center text-center mb-2 sm:mb-0">
        <p class="text-gray-500 text-xs font-medium">Date</p>
        <p class="text-gray-800 text-base md:text-lg font-semibold">{{ date }}</p>
      </div>

      <!-- Vertical separator (visible on larger screens) -->
      <div class="hidden sm:block w-px bg-gray-300 h-10 mx-3"></div>
      <!-- Horizontal separator (visible on smaller screens) -->
      <div class="block sm:hidden w-full h-px bg-gray-300 my-1"></div>

      <div class="flex flex-col items-center text-center">
        <p class="text-gray-500 text-xs font-medium">Time</p>
        <p class="text-gray-800 text-base md:text-lg font-semibold">{{ time }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
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
  time: { type: String, default: '10:00 AM GMT+7' }
})
</script>

<style scoped>
/*
  No custom CSS is needed as Tailwind handles the styling.
  Scoped styles can be added here if further customization is required.
*/
</style>