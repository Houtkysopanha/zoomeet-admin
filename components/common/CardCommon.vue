<template>
  <div
    :class="[
      'event-stats-card rounded-xl border p-4 lg:p-6 bg-card' ,
      disabled
        ? 'bg-orange-50 border-gray-200 cursor-not-allowed opacity-75'
        : 'bg-card border-gray-100 cursor-pointer'
    ]"
    @click="handleClick"
  >
    <div class="flex items-center justify-between mb-3 lg:mb-4">
      <div
        :class="[
          'text-base lg:text-xl font-medium mb-1 truncate pr-2',
          disabled ? 'text-blue-950' : 'text-blue-950'
        ]"
      >
        {{ title }}
      </div>
      <Icon
        :name="icon"
        :class="[
          'w-8 h-8 lg:w-10 lg:h-10 flex-shrink-0',
          disabled
            ? 'bg-gradient-to-t from-blue-900 to-purple-800'
            : 'bg-gradient-to-t from-blue-900 to-purple-800'
        ]"
      />
    </div>
    <div
      :class="[
        'text-xl lg:text-2xl font-bold mb-2',
        disabled ? 'text-gray-800' : 'text-gray-800'
      ]"
    >
      {{ count }}
    </div>
    <div class="flex items-center space-x-2 text-xs lg:text-sm">
      <span
        v-if="weekChange !== null"
        :class="[
          'truncate',
          disabled ? 'text-gray-500' : 'text-gray-500'
        ]"
      >
        {{ weekChange }}
      </span>
    </div>
  </div>
</template>

<script setup>
// import Icon from 'primevue/icon'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  count: {
    type: [Number, String],
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  weekChange: {
    type: [Number, String],
    default: null, // Optional, can be null if no change
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click'])

const handleClick = () => {
  if (!props.disabled) {
    emit('click')
  }
}
</script>

<style scoped>
.event-stats-card {
  transition: transform 0.2s ease-in-out, opacity 0.2s ease-in-out;
}
.bg-card{
  background-color: #F5F5F5;
  border: 1.5px solid #EBEDF0;
}
.event-stats-card:not(.cursor-not-allowed):hover {
  transform: translateY(-2px);
}
.event-stats-card.cursor-not-allowed:hover {
  transform: none;
}
</style>