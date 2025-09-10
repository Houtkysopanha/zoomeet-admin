<template>
  <div class="min-h-screen p-6 md:p-10 font-sans">
    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Left Panel: List of Created Agenda -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">List of Created Agenda</h2>
        <p class="text-gray-500 mb-6">View and manage your complete event schedule</p>

        <TabView class="mb-6">
          <TabPanel header="Day 1">
            <h3 class="text-lg font-semibold text-gray-700 mb-4">August</h3>
            <div class="space-y-4">
              <div v-for="item in agendaItems" :key="item.id" class="bg-gray-50 rounded-lg p-4 shadow-sm">
                <div class="flex items-start space-x-4">
                  <div class="flex flex-col items-center text-center text-gray-600">
                    <span class="text-sm font-semibold">{{ item.day }}</span>
                    <span class="text-2xl font-bold text-purple-600">{{ item.date }}</span>
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center text-gray-500 text-sm">
                        <NuxtIcon name="heroicons:clock" class="w-4 h-4 mr-1" />
                        <span>{{ item.time }}</span>
                      </div>
                      <div class="flex space-x-2">
                        <button class="text-gray-400 hover:text-purple-600 transition-colors">
                          <NuxtIcon name="heroicons:pencil-square" class="w-5 h-5" />
                        </button>
                        <button class="text-gray-400 hover:text-red-500 transition-colors">
                          <NuxtIcon name="heroicons:trash" class="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ item.title }}</h3>
                    <div v-if="item.speakers.length > 0" class="space-y-1">
                      <div v-for="(speaker, sIdx) in item.speakers" :key="sIdx" class="text-sm text-gray-700">
                        <span class="font-medium">{{ speaker.name }}</span> | {{ speaker.title }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>
          <TabPanel header="Day 2">
            <p class="text-gray-500 text-center py-8">No agenda items for Day 2 yet.</p>
          </TabPanel>
        </TabView>
      </div>

      <!-- Right Panel: Event Agenda Form -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Event Agenda</h2>
        <p class="text-gray-500 mb-6">Create a new agenda item for your event</p>

        <form @submit.prevent="addAgenda" class="space-y-6">
          <div>
            <label for="date" class="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <Calendar
              id="date"
              v-model="eventForm.date"
              dateFormat="dd/mm/yy"
              showIcon
              class="w-full"
              inputClass="p-inputtext p-component w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-gray-800 placeholder-gray-400"
              iconClass="p-button-icon pi pi-calendar text-gray-500"
            />
          </div>

          <div>
            <label for="time" class="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <div class="relative">
              <InputText
                id="time"
                v-model="eventForm.timeRange"
                placeholder="09:30 AM - 10:30 AM"
                class="w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500 pr-10 text-gray-800 placeholder-gray-400"
              />
              <NuxtIcon name="heroicons:clock" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            </div>
          </div>

          <div>
            <label for="session-title" class="block text-sm font-medium text-gray-700 mb-1">Session Title</label>
            <InputText
              id="session-title"
              v-model="eventForm.sessionTitle"
              placeholder="Enter section title"
              class="w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-gray-800 placeholder-gray-400"
            />
          </div>

          <div>
            <label for="venue" class="block text-sm font-medium text-gray-700 mb-1">Venue/Hall</label>
            <InputText
              id="venue"
              v-model="eventForm.venue"
              placeholder="venue/hall"
              class="w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-gray-800 placeholder-gray-400"
            />
          </div>

          <div>
            <label for="room-number" class="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
            <InputText
              id="room-number"
              v-model="eventForm.roomNumber"
              placeholder="room number"
              class="w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-gray-800 placeholder-gray-400"
            />
          </div>

          <div>
            <label for="event-description" class="block text-sm font-medium text-gray-700 mb-1">Event Description</label>
            <Textarea
              id="event-description"
              v-model="eventForm.eventDescription"
              placeholder="Brief description of this session"
              rows="4"
              class="w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-gray-800 placeholder-gray-400"
            />
          </div>

          <!-- Speakers/Presenters Section -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-800">Speakers/Presenters</h3>
            <SpeakerInput
              v-for="(speaker, index) in eventForm.speakers"
              :key="index"
              :speaker="speaker"
              :id="index"
              :show-remove-button="eventForm.speakers.length > 1"
              @update:speaker="eventForm.speakers[index] = $event"
              @remove="removeSpeakerField(index)"
            />
            <button
              @click="addSpeakerField"
              type="button"
              class="w-full flex items-center justify-center py-3 px-4 border border-purple-400 text-purple-600 rounded-xl hover:bg-purple-50 transition-colors font-semibold"
            >
              <NuxtIcon name="heroicons:plus" class="w-5 h-5 mr-2" />
              Add More
            </button>
          </div>

          <button
            type="submit"
            class="w-full flex items-center justify-center py-3 px-6 rounded-xl shadow-lg text-white font-semibold
                   bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 transition-all duration-300 ease-in-out"
          >
            <NuxtIcon name="heroicons:document-plus" class="w-5 h-5 mr-2" />
            Add Agenda
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, } from 'vue';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Calendar from 'primevue/calendar';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
// import { useToast } from 'vue3-toastify';
import SpeakerInput from '~/components/common/SpeakerInput.vue';

// Placeholder data for the agenda list
const agendaItems = ref([
  {
    id: 1,
    day: 'Wed',
    date: '02',
    time: '10:00 AM - 10:15 AM GTM+7',
    title: 'Registration & Welcome Coffee',
    speakers: [],
  },
  {
    id: 2,
    day: 'Wed',
    date: '02',
    time: '10:00 AM - 10:15 AM GTM+7',
    title: 'Cambodia cyber threats and challenges',
    speakers: [
      { name: 'Mr. Chea Line', title: 'Cybersecurity Specialist, General Department of Digital Technology and Media, Ministry of Post and Telecommunication' },
    ],
  },
  {
    id: 3,
    day: 'Wed',
    date: '02',
    time: '10:00 AM - 10:15 AM GTM+7',
    title: 'Panel Discussion: AI Ethics and Future Implications',
    speakers: [
      { name: 'Mr. Chea Line', title: 'Cybersecurity Specialist, General Department of Digital Technology and Media, Ministry of Post and Telecommunication' },
      { name: 'Mr. Chea Line', title: 'Cybersecurity Specialist, General Department of Digital Technology and Media, Ministry of Post and Telecommunication' },
      { name: 'Mr. Chea Line', title: 'Cybersecurity Specialist, General Department of Digital Technology and Media, Ministry of Post and Telecommunication' },
    ],
  },
]);

// Form state for Event Agenda
const eventForm = ref({
  date: null,
  timeRange: '',
  sessionTitle: '',
  venue: '',
  roomNumber: '',
  eventDescription: '',
  speakers: [{ name: '', about: '' }], // Initial speaker field
});

// Function to add a new speaker field
const addSpeakerField = () => {
  eventForm.value.speakers.push({ name: '', about: '' });
};

// Function to remove a speaker field
const removeSpeakerField = (index) => {
  eventForm.value.speakers.splice(index, 1);
};

// Placeholder function for adding agenda item
const addAgenda = () => {
  console.log('Adding Agenda:', eventForm.value);
  const toast = useToast();
  toast.success('Agenda item added (simulated)!', {
    position: 'top-right',
    timeout: 3000,
  });
  // Reset form after submission (optional)
  eventForm.value = {
    date: null,
    timeRange: '',
    sessionTitle: '',
    venue: '',
    roomNumber: '',
    eventDescription: '',
    speakers: [{ name: '', about: '' }],
  };
};

const showTimeSelector = ref(false)

// Generate time options (every 30 minutes)
const timeOptions = ref([
  '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
  '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
  '8:00 PM', '8:30 AM', '9:00 PM', '9:30 PM', '10:00 PM'
])

// Computed formatted time range
const formattedTimeRange = computed(() => {
  if (sessionData.value.startTime && sessionData.value.endTime) {
    return `${sessionData.value.startTime} - ${sessionData.value.endTime}`
  }
  return ''
})

// Methods
const updateTimeRange = () => {
  // This will trigger the computed property to update
  // No explicit action needed here as computed property handles it
}

// Close time selector if start/end times are selected
watch(() => [sessionData.value.startTime, sessionData.value.endTime], () => {
  if (sessionData.value.startTime && sessionData.value.endTime) {
    showTimeSelector.value = false
  }
})
</script>

<style>
/* Global styles for PrimeVue components and general layout */
/* Ensure PrimeVue's default styles are imported, e.g., in app.vue or a global CSS file */
@import "primevue/resources/themes/lara-light-purple/theme.css"; /* Or your chosen theme */
@import "primevue/resources/primevue.min.css";
@import "primeicons/primeicons.css";

/* Custom Tailwind overrides or additions for PrimeVue components */
.p-inputtext {
  @apply px-4 py-2.5; /* Adjust padding for inputs */
}

.p-calendar .p-inputtext {
  @apply pr-10; /* Space for the calendar icon */
}

.p-calendar .p-datepicker-trigger {
  @apply absolute right-3 top-1/2 -translate-y-1/2 text-gray-500;
}

.p-tabview .p-tabview-nav {
  @apply border-b border-gray-200;
}

.p-tabview .p-tabview-nav li .p-tabview-nav-link {
  @apply px-4 py-2 text-gray-600 font-medium rounded-t-lg;
}

.p-tabview .p-tabview-nav li.p-highlight .p-tabview-nav-link {
  @apply text-purple-600 border-b-2 border-purple-600;
}

/* Ensure NuxtIcon is styled correctly */
.nuxt-icon svg {
  width: 1em;
  height: 1em;
  display: inline-block;
  vertical-align: middle;
}
</style>