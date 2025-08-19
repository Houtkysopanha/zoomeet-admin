<template>
  <div class="bg-purple-50 rounded-lg p-4 space-y-3 relative border border-purple-100">
    <button
      v-if="showRemoveButton"
      @click="$emit('remove')"
      type="button"
      class="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
      aria-label="Remove speaker"
    >
      <NuxtIcon name="heroicons:x-mark" class="w-5 h-5" />
    </button>
    <div>
      <label :for="`speaker-name-${id}`" class="block text-sm font-medium text-purple-700 mb-1">Speaker/Presenters name</label>
      <InputText
        :id="`speaker-name-${id}`"
        :modelValue="speaker.name"
        @update:modelValue="updateSpeaker('name', $event)"
        placeholder="speaker name"
        class="w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-gray-800 placeholder-gray-400"
      />
    </div>
    <div>
      <label :for="`about-speaker-${id}`" class="block text-sm font-medium text-purple-700 mb-1">About Speaker</label>
      <InputText
        :id="`about-speaker-${id}`"
        :modelValue="speaker.about"
        @update:modelValue="updateSpeaker('about', $event)"
        placeholder="About speaker"
        class="w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-gray-800 placeholder-gray-400"
      />
    </div>
  </div>
</template>

<script setup>
import InputText from 'primevue/inputtext';

const props = defineProps({
  speaker: {
    type: Object,
    required: true,
    default: () => ({ name: '', about: '' }),
  },
  id: {
    type: [String, Number],
    required: true,
  },
  showRemoveButton: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:speaker', 'remove']);

const updateSpeaker = (field, value) => {
  emit('update:speaker', { ...props.speaker, [field]: value });
};
</script>

<style scoped>
/* No specific scoped styles needed as Tailwind handles most of it */
</style>
