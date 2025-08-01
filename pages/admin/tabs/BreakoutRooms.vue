<template>
  <div class="">
    <h2 class="text-lg font-semibold">Breakout Rooms</h2>
    <p class="text-gray-400 mb-6">Configure additional spaces for workshops or meetings</p>
    
    <!-- Dynamically rendered Breakout Room Forms -->
    <TransitionGroup name="room-list" tag="div">
      <BreakoutRoomForm
        v-for="(room, index) in rooms"
        :key="room.id"
        v-model="rooms[index]"
        :room-index="index"
        @remove-room="removeRoom"
      />
    </TransitionGroup>

    <!-- Add Breakout Room Button -->
    <div class="flex justify-end mt-6">
      <Button
        @click="addRoom"
        class="add-room-btn"
      >
        <Icon icon="mdi:plus" class="mr-2" />
        Add Breakout Room
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { Icon } from "@iconify/vue"
import Button from "primevue/button"
import BreakoutRoomForm from '~/components/common/BreakoutRoomForm.vue' // Import the new component

const loading = ref(false)

// Array to hold multiple breakout room data
const rooms = ref([])

// Methods
const createNewRoom = () => ({
  id: Date.now() + Math.random(), // Unique ID for key
  name: '',
  capacity: null,
  description: ''
})

const addRoom = () => {
  rooms.value.push(createNewRoom())
  console.log('New breakout room added. Total rooms:', rooms.value.length)
}

const removeRoom = (index) => {
  rooms.value.splice(index, 1)
  console.log('Breakout room removed. Total rooms:', rooms.value.length)
}

onMounted(() => {
  // Add two initial breakout rooms when the component mounts
  addRoom() // Room 1
  addRoom() // Room 2
  
  // Simulate initial loading (if needed, though not directly used here)
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
})
</script>

<style scoped>
.add-room-btn {
  @apply bg-gradient-to-r from-purple-600 to-indigo-600 text-white;
  @apply hover:from-purple-700 hover:to-indigo-700;
  @apply px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl;
  @apply transition-all duration-300 ease-in-out border-0;
}

.add-room-btn:hover {
  transform: translateY(-2px);
}

/* Transition for adding/removing rooms */
.room-list-enter-active,
.room-list-leave-active {
  transition: all 0.5s ease;
}
.room-list-enter-from,
.room-list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
.room-list-leave-active {
  position: absolute; /* Ensures smooth removal without jumping */
  width: 100%;
}
</style>
