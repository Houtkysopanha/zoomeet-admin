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
                <Icon name="heroicons:eye" class="text-2xl" />
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
                <Icon name="heroicons:document-arrow-down" class="text-2xl text-purple-800" />
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
                <Icon name="heroicons:paper-airplane" class="text-2xl" />
                <span>Publish Event</span>
              </template>
            </Button>
          </div>
        </div>
      </div>
    </div>

    <div class="min-h-0">
      <!-- Enhanced Tab Menu -->
      <div class="mb-6 w-full">
        <div class="flex space-x-2 bg-gray-100 p-2 rounded-full">
          <button
            v-for="(item, index) in items"
            :key="index"
            @click="changeTab(index)"
            :disabled="isChangingTab"
            :class="[
              'flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-full font-semibold transition-all duration-300 ease-in-out',
              activeIndex === index
                ? 'bg-gradient-to-r from-blue-800 to-purple-600 text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:text-purple-600 hover:bg-white hover:shadow-md',
              isChangingTab ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            ]"
          >
            <i :class="item.icon" class="text-lg"></i>
            <span>{{ item.label }}</span>
          </button>
        </div>
      </div>

      <!-- Dynamic Content with Smooth Transitions -->
      <div class="relative overflow-hidden">
        <div
          :class="[
            'rounded-3xl transition-all duration-300 ease-in-out',
            activeIndex === 1 ? '' : 'bg-white shadow-lg p-4'
          ]"
        >
          <!-- Render all components with smooth fade transitions -->
          <Transition
            name="tab-fade"
            mode="out-in"
            appear
          >
            <div
              :key="activeIndex"
              class="min-h-[400px] relative"
            >
              <!-- Loading Overlay for Tab Content -->
              <div
                v-if="isChangingTab"
                class="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10"
              >
                <LoadingSpinner size="md" color="purple" text="Loading tab..." />
              </div>

              <div v-if="activeIndex === 0 && tabComponents[0]" class="tab-content">
                <BasicInfor />
              </div>
              <div v-else-if="activeIndex === 1 && tabComponents[1]" class="tab-content">
                <Agenda />
              </div>
              <div v-else-if="activeIndex === 2 && tabComponents[2]" class="tab-content">
                <TicketPacket />
              </div>
              <div v-else-if="activeIndex === 3 && tabComponents[3]" class="tab-content">
                <BreakoutRooms />
              </div>
              <div v-else-if="activeIndex === 4 && tabComponents[4]" class="tab-content">
                <SettingPolicy />
              </div>
              <div v-else class="tab-content flex items-center justify-center p-8">
                <LoadingSpinner size="lg" color="purple" text="Loading tab content..." />
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
// Icon is auto-imported by Nuxt
import Button from 'primevue/button'
import BasicInfor from '~/pages/admin/tabs/BasicInfor.vue'
import Agenda from '~/pages/admin/tabs/Agenda.vue'
import TicketPacket from '~/pages/admin/tabs/TicketPacket.vue'
import BreakoutRooms from '~/pages/admin/tabs/BreakoutRooms.vue'
import SettingPolicy from '~/pages/admin/tabs/SettingPolicy.vue'

// Toast removed - not needed for tab switching

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
const isChangingTab = ref(false)
const isLoading = ref(false)

// Match tab index with component
const tabComponents = [
  BasicInfor,
  Agenda,
  TicketPacket,
  BreakoutRooms,
  SettingPolicy
]

// Methods
const changeTab = async (index) => {
  // Prevent rapid tab switching
  if (isChangingTab.value) return

  if (index >= 0 && index < tabComponents.length && activeIndex.value !== index) {
    isChangingTab.value = true
    isLoading.value = true

    try {
      // Use nextTick to ensure DOM is ready
      await nextTick()

      // Simulate loading time for smooth transition
      await new Promise(resolve => setTimeout(resolve, 200))

      activeIndex.value = index
    } catch (error) {
      console.error('Tab change error:', error)
    } finally {
      // Reset the flags after a short delay
      setTimeout(() => {
        isChangingTab.value = false
        isLoading.value = false
      }, 100)
    }
  }
}

definePageMeta({
  layout: "admin",
})
</script>

<style scoped>
/* Smooth Tab Fade Transitions */
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(15px) scale(0.98);
}

.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-15px) scale(0.98);
}

.tab-fade-enter-to,
.tab-fade-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Tab content animation */
.tab-content {
  animation: slideInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced Button Styles */
.bt-preview button:hover {
  transform: translateY(-2px);
  transition: all 0.2s ease-in-out;
}

.bt-saveDraft button:hover {
  transform: translateY(-2px);
  border-color: #6b21a8;
  transition: all 0.2s ease-in-out;
}

/* Tab button smooth transitions */
button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

button:hover {
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}

/* Container smooth transitions */
.rounded-3xl {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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