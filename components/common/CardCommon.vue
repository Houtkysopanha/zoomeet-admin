<template>
  <div class="event-stats-card bg-[#F5F5F5] rounded-xl border border-gray-200 p-6">
   <div class="flex items-center justify-between mb-4">
     <div class=" text-xl  font-bold mb-1">{{ title }}</div>
         <Icon :name="icon" class="text-purple-500 w-10 h-10" />
   </div>
    <div class="text-2xl font-bold text-gray-800 mb-2">{{ count }}</div>
    <div class="flex items-center space-x-2 text-gray-500 text-xs">
      <span v-if="weekChange !== null">+{{ weekChange }} this week</span>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
// import Icon from 'primevue/icon'

defineProps({
  title: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  weekChange: {
    type: Number,
    default: null, // Optional, can be null if no change
  },
})
</script>

<style scoped>
.event-stats-card {
  transition: transform 0.2s ease-in-out;
}

.event-stats-card:hover {
  transform: translateY(-2px);
}
</style>