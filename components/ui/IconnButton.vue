<template>
  <div class="bt-custom-button">
    <Button
      :class="buttonClass"
      :disabled="disabled"
      :raised="raised"
      @click="emit('click')"
    >
      <template #default>
        <div class="flex items-center justify-center gap-2">
          <Icon v-if="icon" :name="icon" :class="iconClass" />
          <span v-if="label" :class="labelClass">{{ label }}</span>
        </div>
      </template>
    </Button>
  </div>
</template>

<script setup>
import Button from 'primevue/button'
// Icon is auto-imported by Nuxt
const emit = defineEmits(['click']);

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: null
  },
  disabled: {
    type: Boolean,
    default: false
  },
  raised: {
    type: Boolean,
    default: true
  },
  buttonClass: {
    type: String,
    default:
      'w-52 h-14 p-4 rounded-full bg-gradient-to-r from-blue-800 to-purple-600 hover:bg-purple-50 flex items-center justify-center gap-2 transition-all duration-300'
  },
  iconClass: {
    type: String,
    default: 'text-2xl text-white'
  },
  labelClass: {
    type: String,
    default:
      'text-white font-normal'
  }
});
</script>

<style scoped>
.bt-custom-button button:hover {
  transform: translateY(-2px);
  border-color: #6b21a8;
}
</style>
