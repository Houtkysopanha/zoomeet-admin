<template>
  <div class="p-6 bg-[#F8F8FF]">
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl text-gray-400 mb-2">
            Event / <span class="text-3xl font-bold text-[#7A49C9]">Create Event</span>
          </h1>
        </div>
        <div class="date-range-picker flex space-x-4 items-center">
          <div class="bt-preview">
            <Button
              class="w-52 h-14 p-4 rounded-full text-white bg-[#9E9E9E] hover:bg-[#8E8E8E] flex items-center justify-center gap-2 transition-all duration-300"
              raised
            >
              <template #default>
                <Icon icon="mdi:eye" class="text-2xl" />
                <span>Preview</span>
              </template>
            </Button>
          </div>
          <div class="bt-saveDraft">
            <Button
              class="w-52 h-14 p-4 rounded-full bg-white border-2 border-purple-800 hover:bg-purple-50 flex items-center justify-center gap-2 transition-all duration-300"
              raised
            >
              <template #default>
                <Icon icon="mdi:content-save" class="text-2xl text-purple-800" />
                <span class="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent font-semibold">
                  Save Draft
                </span>
              </template>
            </Button>
          </div>
          <div class="bt-publishEvent">
            <Button
              class="w-52 h-14 p-4 rounded-full text-white bg-gradient-to-t from-indigo-600 to-indigo-400 hover:from-indigo-700 hover:to-indigo-500 flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
              raised
            >
              <template #default>
                <Icon icon="mdi:publish" class="text-2xl" />
                <span>Publish Event</span>
              </template>
            </Button>
          </div>
        </div>
      </div>
    </div>

    <div class=" min-h-screen">
      <!-- Enhanced Tab Menu -->
      <div class="mb-6 w-full">
        <div class="flex space-x-2 bg-gray-100 p-2 rounded-full">
          <button
            v-for="(item, index) in items"
            :key="index"
            @click="changeTab(index)"
            :class="[
              'flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-full font-semibold transition-all duration-300 ease-in-out',
              activeIndex === index
                ? 'bg-gradient-to-r from-blue-800 to-purple-600 text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:text-purple-600 hover:bg-white hover:shadow-md'
            ]"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ 
              opacity: 1, 
              y: 0,
              transition: { 
                delay: index * 100,
                duration: 500,
                ease: 'easeOut'
              }
            }"
            :hover="{ scale: activeIndex === index ? 1.05 : 1.02, y: -2 }"
            :tap="{ scale: 0.98 }"
          >
            <i :class="item.icon" class="text-lg"></i>
            <span>{{ item.label }}</span>
          </button>
        </div>
      </div>

      <!-- Dynamic Content with Smooth Transitions -->
      <div class="relative">
        <Transition
          name="tab-content"
          mode="out-in"
          @enter="onEnter"
          @leave="onLeave"
        >
          <div
            :key="activeIndex"
            :class="[
    'rounded-3xl ',
    activeIndex === 1 ? '' : 'bg-white shadow-lg p-4'
  ]"
            v-motion
            :initial="{ opacity: 0, x: 50 }"
            :enter="{ 
              opacity: 1, 
              x: 0,
              transition: { duration: 400, ease: 'easeOut' }
            }"
          >
            <component :is="tabComponents[activeIndex]" />
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import { useMotion } from '@vueuse/motion'
import BasicInfor from '~/pages/admin/tabs/BasicInfor.vue'
import Agenda from '~/pages/admin/tabs/Agenda.vue'
import TicketPacket from '~/pages/admin/tabs/TicketPacket.vue'
import { definePageMeta } from '#imports'
import BreakoutRooms from '~/pages/admin/tabs/BreakoutRooms.vue'
import SettingPolicy from './tabs/SettingPolicy.vue'

const toast = useToast()

// Tab Menu Items
const items = ref([
  { label: 'Basic Info', icon: 'pi pi-info-circle' },
  { label: 'Agenda', icon: 'pi pi-calendar' },
  { label: 'Ticket Package', icon: 'pi pi-ticket' },
  { label: 'Breakout Room', icon: 'pi pi-video' },
  { label: 'Setting & Policies', icon: 'pi pi-cog' }
])

// Active Tab Index
const activeIndex = ref(0)

// Match tab index with component
const tabComponents = [
  BasicInfor,
  Agenda,
  TicketPacket,
  BreakoutRooms,
  SettingPolicy
  // Add other components here as you create them
  // AgendaComponent,
  // TicketPackageComponent,
  // BreakoutRoomComponent,
  // SettingsPoliciesComponent,
]

// Methods
const changeTab = (index) => {
  if (activeIndex.value !== index) {
    activeIndex.value = index
    toast.info(`Switched to ${items.value[index].label}`)
  }
}

const onEnter = (el) => {
  el.style.opacity = '0'
  el.style.transform = 'translateX(30px)'
}

const onLeave = (el) => {
  el.style.opacity = '0'
  el.style.transform = 'translateX(-30px)'
}

definePageMeta({
  middleware: "auth",
  layout: "admin",
})
</script>

<style scoped>
/* Tab Content Transitions */
.tab-content-enter-active,
.tab-content-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-content-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.tab-content-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

.tab-content-enter-to,
.tab-content-leave-from {
  opacity: 1;
  transform: translateX(0);
}

/* Enhanced Button Styles */
.bt-preview button:hover {
  transform: translateY(-2px);
}

.bt-saveDraft button:hover {
  transform: translateY(-2px);
  border-color: #6b21a8;
}

.bt-publishEvent button:hover {
  transform: translateY(-2px);
}

/* Custom gradient for text */
.bg-custom-gradient {
  background: linear-gradient(135deg, #7c3aed, #3b82f6);
}

/* Smooth transitions for all interactive elements */
* {
  transition-property: transform, box-shadow, background-color, border-color, color, opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Active tab indicator animation */
@keyframes activeTab {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1.05);
  }
}

/* Loading state for tab content */
.tab-loading {
  opacity: 0.7;
  pointer-events: none;
}
</style>