<template>
  <div class="relative min-h-screen flex justify-center items-center px-4 py-10 animated-gradient">
    <!-- Background Icons -->
    <div class="absolute inset-0 overflow-hidden">
      <Icon icon="heroicons:cube" class="bg-icon absolute top-10 left-10 text-4xl" />
      <Icon icon="heroicons:ticket" class="bg-icon absolute bottom-20 right-20 text-5xl" />
      <Icon icon="heroicons:ticket" class="bg-icon absolute top-1/3 right-1/4 text-6xl" />
      <Icon icon="heroicons:cube" class="bg-icon absolute bottom-10 left-1/3 text-3xl" />
      <Icon icon="mdi:diamond" class="bg-icon absolute top-1/4 left-1/2 text-4xl" />
      <Icon icon="heroicons:cube" class="bg-icon absolute bottom-1/4 right-1/3 text-5xl" />
      <Icon icon="mdi:triangle-outline" class="bg-icon absolute top-3/4 left-1/4 text-4xl" />
    </div>

    <!-- Page Content -->
    <slot />
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';
</script>

<style scoped>
.animated-gradient {
  background: linear-gradient(120deg, #e0f2fe, #ede9fe, #e0e7ff);
  background-size: 300% 300%;
  animation: gradient 10s ease infinite;
}

@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Icon styling for subtle effect */
.bg-icon {
  opacity: 0.15;
  color: #6366f1; /* Soft indigo */
}
</style>
