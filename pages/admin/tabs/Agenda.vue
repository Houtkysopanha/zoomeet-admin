<template>
  <div class="">
    <h2 class="text-lg font-semibold">Event Agenda</h2>
    <p class="text-gray-400 mb-6">Manage the schedule and details for each session of your event.</p>
    
    <!-- Dynamically rendered Session Forms -->
    <TransitionGroup name="session-list" tag="div">
      <SessionForm
        v-for="(session, index) in sessions"
        :key="session.id"
        v-model="sessions[index]"
        :session-index="index"
        @remove-session="removeSession"
      />
    </TransitionGroup>

    <!-- Add Session Button -->
    <div class="flex justify-end mt-6">
      <Button
        @click="addSession"
        class="add-session-btn"
      >
        <Icon icon="mdi:plus" class="mr-2" />
        Add Agenda
      </Button>
    </div>
  </div>
</template>

<script setup>
import './css/style.css' // Assuming this file exists for global styles
import { ref, onMounted } from "vue"
import { Icon } from "@iconify/vue"
import Button from "primevue/button"
import SessionForm from '~/components/common/SessionForm.vue' // Import the new component

const loading = ref(false)

// Array to hold multiple session data
const sessions = ref([])

// Methods
const createNewSession = () => ({
  id: Date.now() + Math.random(), // More robust unique ID
  date: null,
  startTime: null,
  endTime: null,
  title: '',
  speaker: '',
  description: ''
})

const addSession = () => {
  sessions.value.push(createNewSession())
  console.log('New session added. Total sessions:', sessions.value.length)
}

const removeSession = (index) => {
  sessions.value.splice(index, 1)
  console.log('Session removed. Total sessions:', sessions.value.length)
}

onMounted(() => {
  // Add two initial sessions when the component mounts
  addSession() // Session 1
  addSession() // Session 2
  
  // Simulate initial loading
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
})
</script>

<style scoped>
/* Custom styling for form elements */
:deep(.p-calendar) {
  @apply bg-gray-100 rounded-2xl;
}

:deep(.p-calendar .p-inputtext) {
  @apply p-3 bg-transparent border-0;
}

:deep(.p-dropdown) {
  @apply p-3;
}

:deep(.p-dropdown .p-dropdown-label) {
  @apply bg-transparent;
}

.add-session-btn {
  @apply bg-gradient-to-r from-purple-600 to-indigo-600 text-white;
  @apply hover:from-purple-700 hover:to-indigo-700;
  @apply px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl;
  @apply transition-all duration-300 ease-in-out border-0;
}

.add-session-btn:hover {
  transform: translateY(-2px);
}

/* Section headers */
.header h3 {
  @apply border-b border-purple-200 pb-2;
}

/* Transition for adding/removing sessions */
.session-list-enter-active,
.session-list-leave-active {
  transition: all 0.5s ease;
}
.session-list-enter-from,
.session-list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
.session-list-leave-active {
  position: absolute; /* Ensures smooth removal without jumping */
  width: 100%;
}
</style>
