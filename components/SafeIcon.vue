<template>
  <Icon v-if="name && name.trim()" :name="name" :class="iconClass" />
  <span v-else-if="fallback" :class="iconClass">{{ fallback }}</span>
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
  },
  fallback: {
    type: String,
    default: '•'
  }
})

const iconClass = computed(() => props.class)
</script>
