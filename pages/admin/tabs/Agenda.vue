<template>
  <div class="min-h-screen font-sans">
    <div class="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      <!-- Left Panel: List of Created Agenda -->
      <div class=" bg-white p-4 rounded-3xl col-span-2">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">List of Created Agenda</h2>
        <p class="text-gray-500 mb-6">View and manage your complete event schedule</p>

        <TabView class="mb-6">
          <TabPanel header="Day 1">
            <div class="space-y-4">
              <div v-for="item in agendaItems" :key="item.id" class="border border-gray-200 rounded-xl p-4 ">
                <div class="flex items-start space-x-4">
                  <div class="flex flex-col items-center text-center text-gray-600">
                    <span class="text-sm font-semibold">{{ item.day }}</span>
                    <span class="text-2xl font-bold text-purple-600">{{ item.date }}</span>
                  </div>
                  <div class="flex-1 pl-4 border-l-2 border-gray-400">
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center text-gray-500 text-sm">
                        <Icon name="heroicons:clock" class="w-4 h-4 mr-1" />
                        <span>{{ item.time_start }}</span>
                      </div>
                      <div class="flex space-x-2">
                        <button @click="editAgenda(item)" class="text-gray-400 hover:text-purple-600 transition-colors">
                          <Icon name="heroicons:pencil-square" class="w-5 h-5" />
                        </button>
                        <button @click="deleteAgendaAction($event, item.id)" class="text-gray-400 hover:text-red-500 transition-colors">
                          <Icon name="heroicons:trash" class="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <h3 class="text-lg font-normal text-gray-800 mb-2">{{ item.title }}</h3>
                    <div v-if="item.speakers?.length > 0" class="space-y-1">
                      <div v-for="(speaker, sIdx) in item.speakers" :key="sIdx" class="text-sm text-gray-700">
                        <span class="font-medium">{{ speaker.name }}</span> | {{ speaker.about }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>
          <!-- <TabPanel header="Day 2">
            <p class="text-gray-500 text-center py-8">No agenda items for Day 2 yet.</p>
          </TabPanel> -->
        </TabView>
      </div>

      <!-- Right Panel: Event Agenda Form -->
      <div class="bg-white p-4 rounded-3xl">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Event Agenda</h2>
        <p class="text-gray-500 mb-6">{{ isEditMode ? 'Edit existing agenda item' : 'Create a new agenda item for your event' }}</p>

        <form @submit.prevent="createOrUpdateAgenda" class="space-y-6">
          <!-- Start Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Start Date <span class="text-red-500">*</span></label>
            <Calendar
              showIcon
              iconDisplay="input"
              placeholder="31/07/2025"
              v-model="eventForm.date"
              class="w-full mt-1 bg-gray-100 p-3 rounded-2xl"
              dateFormat="dd/mm/yy"
            />
          </div>

          <!-- Time -->
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-2">Time  <span class="text-red-500">*</span></label>
            <div class="relative">
              <Icon name="heroicons-outline:clock" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
              <InputText
                v-model="eventForm.time_start"
                type="time"
                class="w-full pl-10 bg-gray-100 p-1 rounded-2xl text-gray-800"
              />
            </div>
          </div>

          <!-- Session Title -->
          <div>
            <label for="session-title" class="block text-sm font-medium text-gray-700 mb-1">Session Title <span class="text-red-500">*</span></label>
            <InputText
              id="session-title"
              v-model="eventForm.title"
              placeholder="Enter session title"
              class="w-full bg-gray-100 p-3 rounded-2xl border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-gray-800 placeholder-gray-400"
            />
          </div>

          <!-- Venue -->
          <div>
            <label for="venue" class="block text-sm font-medium text-gray-700 mb-1">Venue/Hall</label>
            <InputText
              id="venue"
              v-model="eventForm.venue"
              placeholder="Venue or Hall"
              class="w-full bg-gray-100 p-3 rounded-2xl border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-gray-800 placeholder-gray-400"
            />
          </div>

          <!-- Room Number -->
          <div>
            <label for="room-number" class="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
            <InputText
              id="room-number"
              v-model="eventForm.room_no"
              placeholder="Room number"
              class="w-full bg-gray-100 p-3 rounded-2xl border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-gray-800 placeholder-gray-400"
            />
          </div>

          <!-- Description -->
          <div>
            <label for="event-description" class="block text-sm font-medium text-gray-700 mb-1">Event Description</label>
            <Textarea
              id="event-description"
              v-model="eventForm.description"
              placeholder="Brief description of this session"
              rows="4"
              class="w-full bg-gray-100 p-3 rounded-2xl border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-gray-800 placeholder-gray-400"
            />
          </div>

          <!-- Speakers -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-800">Speakers/Presenters</h3>
            <div class="form-speaker bg-[#F1EBF9] p-3 rounded-2xl border-2 border-purple-700">
              <div v-for="(speaker, index) in eventForm.speakers" :key="index" class="flex items-start gap-3">
                <div class="w-full space-y-2">
                  <div class="speaker namer">
                    <label for="speaker" class="block text-sm font-normal text-purple-700 mb-2">Speaker/Presenter Name</label>
                    <InputText
                      v-model="speaker.name"
                      placeholder="Speaker name"
                      class="w-full bg-white p-3 rounded-2xl border-gray-300 focus:border-purple-500"
                    />
                  </div>
                  <label for="about-speaker" class="block text-sm font-normal text-purple-700 mb-2">About Speaker</label>
                  <Textarea
                    v-model="speaker.about"
                    placeholder="About speaker"
                    class="w-full bg-white p-3 rounded-2xl border-gray-300 focus:border-purple-500"
                  />
                  <button
                    v-if="eventForm.speakers.length > 1"
                    type="button"
                    @click="removeSpeakerField(index)"
                    class="mt-2 text-red-500 hover:text-red-700"
                  >
                    <Icon name="heroicons:trash" class="w-5 h-5" />
                  </button>
                </div>
              </div>
              <button
                @click="addSpeakerField"
                type="button"
                class="w-full flex items-center justify-center mt-5 py-3 px-4 border border-purple-400 border-dashed text-purple-600 rounded-xl hover:bg-purple-50 transition-colors font-semibold"
              >
                <Icon name="heroicons:plus" class="w-5 h-5 mr-2" />
                Add More
              </button>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex space-x-4">
            <button
              type="submit"
              class="w-full flex items-center justify-center py-3 px-6 rounded-full shadow-lg text-white font-semibold
                    bg-gradient-to-r from-purple-600 to-blue-800 hover:from-purple-700 hover:to-purple-900 transition-all duration-300 ease-in-out"
            >
              <Icon name="heroicons:document-plus" class="w-5 h-5 mr-2" />
              {{ isEditMode ? 'Update Agenda' : 'Add Agenda' }}
            </button>
            <button
              v-if="isEditMode"
              type="button"
              @click="resetForm"
              class="w-full flex items-center justify-center py-3 px-6 rounded-full border border-gray-300 text-gray-600 font-semibold hover:bg-gray-100 transition-all"
            >
              <Icon name="heroicons:x-mark" class="w-5 h-5 mr-2" />
              Cancel
            </button>
          </div>
        </form>
      </div>

    </div>

    <ConfirmPopup></ConfirmPopup>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import ConfirmPopup from 'primevue/confirmpopup';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import SpeakerInput from '~/components/common/SpeakerInput.vue';
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import { getEventAgenda, createAgendaItems, updateAgendaItem, deleteAgenda } from '@/composables/api'
// Icon is auto-imported by Nuxt

const props = defineProps(['eventId'])

const toast = useToast();
const confirm = useConfirm();

const agendaItems = ref([]);
// Track edit mode and the ID of the agenda being edited
const isEditMode = ref(false);
const editingAgendaId = ref(null);

const eventForm = ref({
  date: null,
  time_start: null,
  time_end: null,
  title: null,
  venue: null,
  room_no: null,
  description: null,
  speakers: [{ name: null, about: null }],
});

// Reset form to initial state
const resetForm = () => {
  eventForm.value = {
    date: null,
    time_start: null,
    time_end: null,
    title: null,
    venue: null,
    room_no: null,
    description: null,
    speakers: [{ name: null, about: null }],
  };
  isEditMode.value = false;
  editingAgendaId.value = null;
};

// Populate form for editing
const editAgenda = (agenda) => {
  eventForm.value = {
    date: new Date(agenda.date), // Ensure date is a Date object for Calendar
    time_start: agenda.time_start,
    time_end: agenda.time_end,
    title: agenda.title,
    venue: agenda.venue,
    room_no: agenda.room_no,
    description: agenda.description,
    speakers: agenda.speakers?.length ? [...agenda.speakers] : [{ name: null, about: null }],
  };
  isEditMode.value = true;
  editingAgendaId.value = agenda.id;
};

// Handle form submission (create or update)
const createOrUpdateAgenda = async () => {
  try {
    let response;
    if (isEditMode.value) {
      // Update existing agenda
      response = await updateAgendaItem(props.eventId, editingAgendaId.value, eventForm.value);
    } else {
      // Create new agenda
      response = await createAgendaItems(props.eventId, eventForm.value);
    }

    if (response.success) {
      toast.add({
        severity: 'success',
        summary: isEditMode.value ? 'Agenda Updated' : 'Agenda Saved',
        detail: isEditMode.value ? 'Agenda item updated successfully.' : 'Agenda item saved successfully.',
        life: 3000,
      });
      // Reset form and fetch updated agenda list
      resetForm();
      const agendaResponse = await getEventAgenda(props.eventId);
      if (agendaResponse.success) {
        agendaItems.value = agendaResponse.data;
      }
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: isEditMode.value ? 'Agenda Update Failed' : 'Agenda Save Failed',
      detail: isEditMode.value ? 'Failed to update agenda item.' : 'Failed to save agenda item.',
      life: 3000,
    });
    console.error('Error:', error);
  }
};

// Handle delete agenda
const deleteAgendaAction = (event, agendaId) => {
  confirm.require({
    target: event.currentTarget,
    message: 'Do you want to delete this agenda?',
    icon: 'pi pi-info-circle',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true,
    },
    acceptProps: {
      label: 'Delete',
      severity: 'danger',
      class: 'text'
    },
    accept: async () => {
      try {
        const response = await deleteAgenda(props.eventId, agendaId);
        if (response.success) {
          toast.add({
            severity: 'success',
            summary: 'Agenda Deleted',
            detail: 'Agenda deleted successfully',
            life: 3000,
          });
          // Refresh agenda list
          const agendaResponse = await getEventAgenda(props.eventId);
          if (agendaResponse.success) {
            agendaItems.value = agendaResponse.data;
          }
          // Reset form if deleting the currently edited agenda
          if (editingAgendaId.value === agendaId) {
            resetForm();
          }
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Agenda Delete Failed',
          detail: 'Failed to delete agenda item.',
          life: 3000,
        });
        console.error('Failed to delete agenda item:', error);
      }
    },
    reject: () => {},
  });
};

// Check if agenda form is complete
const isAgendaComplete = computed(() => {
  return !!(
    eventForm.value.date &&
    eventForm.value.time_start &&
    eventForm.value.title &&
    eventForm.value.venue
  );
});

onMounted(async () => {
  if (!props.eventId) {
    console.error('No event ID provided');
    return;
  }

  try {
    const response = await getEventAgenda(props.eventId);
    if (response.success) {
      agendaItems.value = response.data;
    } else {
      console.error('Failed to fetch event agenda:', response.message);
    }
  } catch (error) {
    console.error('Failed to fetch event agenda:', error);
  }
});

const addSpeakerField = () => {
  eventForm.value.speakers.push({ name: '', about: '' });
};

const removeSpeakerField = (index) => {
  if (eventForm.value.speakers.length > 1) {
    eventForm.value.speakers.splice(index, 1);
  }
};

const updateTimeRange = () => {};
</script>

<style scoped>

:deep(.p-calendar .p-inputtext) {
  @apply bg-transparent border-0;
}
/* You can add scoped Tailwind overrides here if needed */
</style>
