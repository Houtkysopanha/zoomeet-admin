<template>
  <div class="max-w-[90rem]">
    <div v-if="loading && events.length === 0" class="text-center py-8">
      <p class="text-gray-500">Loading events...</p>
    </div>

    <div v-else-if="events.length === 0" class="text-center py-8">
      <p class="text-gray-500">No events found</p>
    </div>

    <div v-else class="pb-2">
      <div class="event-wrapper">
        <div class="event-scroll-container">
          <div
            v-for="event in events"
            :key="event.id"
            :class="[
              'event-card bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center space-x-4 cursor-pointer transition-all duration-200 hover:shadow-md h-24 p-2 min-w-[280px] sm:min-w-[320px] lg:min-w-[350px]',
              selectedEvent?.id === event.id
                ? 'ring-2 ring-purple-500 bg-purple-50'
                : 'hover:bg-gray-50'
            ]"
            @click="handleEventSelect(event)"
          >
            <img
              :src="event.cover_image_url || defaultPoster"
              :alt="event.name"
              class="w-28 h-20 rounded-xl object-cover flex-shrink-0"
              @error="$event.target.src = defaultPoster"
            />
            <div class="flex-1 min-w-0">
              <h3 class="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                {{ event.name }}
              </h3>

              <div class="flex items-center text-xs text-gray-500 mb-1">
                <Icon name="heroicons:map-pin" class="w-3 h-3 mr-1" />
                <span class="truncate">{{ event.location || 'Location TBD' }}</span>
              </div>

              <div class="flex items-center text-xs text-gray-500">
                <Icon name="heroicons:calendar" class="w-3 h-3 mr-1" />
                <span class="truncate">{{ formatEventDate(event.start_date) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import defaultPoster from "@/assets/image/poster-manage-booking.png"

// Props
const props = defineProps({
  events: {
    type: Array,
    default: () => []
  },
  selectedEvent: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['select-event'])

// Methods
const handleEventSelect = (event) => {
  emit('select-event', event)
}

const formatEventDate = (dateString) => {
  if (!dateString) return 'Date TBD'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return dateString
  }
}
</script>

<style scoped>
/* keep two-line clamp */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* wrapper should NOT hide overflow (so page Y-scroll still works) */
.event-wrapper {
  width: 100%;
  position: relative;
  overflow: visible; /* allow parent page to scroll vertically */
}

/* horizontal scroll container */
.event-scroll-container {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 0.25rem;   /* visual spacing */
  overflow-x: auto;          /* enable X scroll */
  overflow-y: visible;       /* do not block vertical scrolling */
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch; /* smooth on iOS */
  contain: layout style;     /* limits repaint scope for perf */
}

/* each card aligns to center when snapping */
.event-card {
  flex-shrink: 0;            /* keep width, allow horizontal scrolling */
  scroll-snap-align: center;
  /* min-width is defined in the template via Tailwind min-w-[350px] */
}

/* optional: hide scrollbar visually but keep scrolling */
.event-scroll-container::-webkit-scrollbar {
  height: 6px;
}
.event-scroll-container::-webkit-scrollbar-track {
  background: transparent;
}
.event-scroll-container::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.08);
  border-radius: 999px;
}
.event-scroll-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0,0,0,0.12);
}

/* Firefox and IE/Edge */
.event-scroll-container {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: thin;    /* Firefox (thin) */
}

/* you can override to fully hide scrollbar if desired:
.event-scroll-container { scrollbar-width: none; }
.event-scroll-container::-webkit-scrollbar { display: none; }
*/
</style>
