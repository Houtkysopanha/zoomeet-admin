<template>
  <div class="event-stats-card bg-card rounded-xl border border-gray-200 p-6">
   <div class="flex items-center justify-between mb-4">
     <div class=" text-xl text-blue-950  font-medium mb-1">{{ title }}</div>
         <Icon :name="icon" class="bg-gradient-to-t from-blue-900 to-purple-800 w-10 h-10" />
   </div>
    <div class="text-2xl font-bold text-gray-800 mb-2">{{ count }}</div>
    <div class="flex items-center space-x-2 text-gray-500 text-xs">
      <span v-if="weekChange !== null">{{ weekChange }} </span>
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
.bg-card{
  background-color: #F5F5F5;
}
.event-stats-card:hover {
  transform: translateY(-2px);
}
</style>