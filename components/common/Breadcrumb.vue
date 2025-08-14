<template>
  <nav class="flex items-center space-x-2 :text-base text-gray-600 text-3xl font-bold">
    <template v-for="(item, index) in items" :key="index">
      <NuxtLink
        v-if="item.to && index !== items.length - 1"
        :to="item.to"
        class="hover:text-purple-600 transition-colors duration-200"
      >
        {{ item.text }}
      </NuxtLink>
      <span
        v-else-if="index === items.length - 1"
        class="text-purple-600 text-3xl font-bold"
      >
        {{ item.text }}
      </span>
      <span
        v-else
        class="hover:text-purple-600 transition-colors duration-200 cursor-pointer"
        @click="handleClick(item)"
      >
        {{ item.text }}
      </span>
      <i
        v-if="index < items.length - 1"
        class="pi pi-chevron-right text-gray-400 text-xs"
      ></i>
    </template>
  </nav>
</template>

<script setup>
const props = defineProps({
  items: {
    type: Array,
    required: true,
    // Each item should have { text: string, to?: string }
  },
});

const emit = defineEmits(['itemClick']);

const handleClick = (item) => {
  emit('itemClick', item);
};
</script>
