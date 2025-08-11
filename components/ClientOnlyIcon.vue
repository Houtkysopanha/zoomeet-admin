<template>
  <ClientOnly>
    <Icon v-if="name && name.trim()" :name="name" :class="iconClass" />
    <template #fallback>
      <span :class="iconClass">•</span>
    </template>
  </ClientOnly>
</template>

<script setup>
const props = defineProps({
  name: {
    type: String,
    default: null
  },
  class: {
    type: String,
    default: ''
  }
})

const iconClass = computed(() => props.class)
</script>
