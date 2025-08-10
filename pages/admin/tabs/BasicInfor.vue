<template>
  <div class="">
    <h2 class="text-lg font-semibold">Event Information</h2>
    <p class="text-gray-400 mb-6">Basic detail about your event</p>

    <div>
      <section class="about-event">
        <div class="mb-6">
          <div class="header">
            <h3 class="text-purple-700 font-medium mb-2 flex items-center">
              <Icon icon="fluent:info-12-filled" class="text-2xl mr-2" />
              About Event
            </h3>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Event Name</label>
              <InputText v-model="eventName" class="w-full p-3 mt-1 bg-gray-100 rounded-2xl" placeholder="Enter event name" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Category</label>
              <Dropdown v-model="category" :options="categories" optionLabel="label" optionValue="value" class="w-full p-1 mt-1 bg-gray-100 rounded-2xl" placeholder="Select category" />
            </div>
          </div>
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700">Event Description</label>
            <Textarea v-model="description" class="w-full p-2 mt-1 bg-gray-100 rounded-2xl" placeholder="Describe your event..." rows="4" />
          </div>
        </div>
        <div class="mb-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Start Date</label>
              <Calendar showIcon iconDisplay="input" placeholder="31/07/2025" v-model="startDate" class="w-full p-3 mt-1 bg-gray-100 rounded-2xl" dateFormat="dd/mm/yy" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">End Date</label>
              <Calendar v-model="endDate" showIcon placeholder="31/07/2025" iconDisplay="input" class="w-full p-3 mt-1 bg-gray-100 rounded-2xl" dateFormat="dd/mm/yy" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Location</label>
              <InputText v-model="location" class="w-full p-3 mt-1 bg-gray-100 rounded-2xl" placeholder="Enter location" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Map URL</label>
              <InputText v-model="mapUrl" class="w-full p-3 mt-1 bg-gray-100 rounded-2xl" placeholder="Enter map URL" />
            </div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Company</label>
            <InputText v-model="company" class="w-full p-3 mt-1 bg-gray-100 rounded-2xl" placeholder="Company name" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Organizer</label>
            <InputText v-model="organizer" class="w-full p-3 mt-1 bg-gray-100 rounded-2xl" placeholder="Organization name" />
          </div>
        </div>
      </section>

      <section class="evenurl-slug">
        <div class="mx-auto mt-10">
          <div class="rounded-2xl ">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
                <i class="pi pi-link text-white text-sm"></i>
              </div>
              <h3 class="text-lg font-semibold text-purple-700">Event URL & Short Link</h3>
            </div>
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Event Slug</label>
              <div class="flex gap-4 ">
                <InputText v-model="eventSlug" placeholder="my-awesome-event" class="w-full p-3 h-12 rounded-2xl bg-gray-100 border-gray-200 focus:border-purple-400 focus:ring-purple-400" @input="validateSlug" />
                <Button icon="pi pi-refresh" text rounded size="small" class=" bg-gray-100 rounded-2xl h-12 w-20 transform -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors duration-200" @click="generateSlug" v-tooltip.top="'Generate new slug'" v-motion :hover="{ scale: 1.1, rotate: 180 }" :tap="{ scale: 0.9 }" />
              </div>
              <p class="text-xs text-gray-500 mt-2">
                This will be used to create your event's short URL. Only letters, numbers, and hyphens allowed.</p>
            </div>
            <div class=" p-4 bg-purple-50 border-2 border-purple-800  rounded-xl ">
              <label class="block text-sm font-medium text-purple-700 mb-3">
                Company</label>
              <div class="flex items-center gap-3">
                <div class="flex-1 bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                  <span class="text-sm text-gray-600 font-mono">
                    {{ generatedUrl }}</span>
                </div>
                <div class="flex gap-2">
                  <Button icon="pi pi-copy" text rounded size="small" class="text-gray-500 bg-white rounded-2xl h-12 w-20 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200" @click="copyUrl" v-tooltip.top="'Copy URL'" v-motion :hover="{ scale: 1.1 }" :tap="{ scale: 0.9 }" />
                  <Button icon="pi pi-external-link" text rounded size="small" class="text-gray-500 bg-white rounded-2xl h-12 w-20 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200" @click="openUrl" v-tooltip.top="'Open in new tab'" v-motion :hover="{ scale: 1.1 }" :tap="{ scale: 0.9 }" />
                </div>
              </div>
              <p class="text-xs text-purple-600 mt-3 flex items-center gap-1">
                <i class="pi pi-info-circle text-xs"></i>
                This URL will be active once your event is published</p>
            </div>
          </div>
        </div>
      </section>

      <section class="online mt-10">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
            <Icon icon="icon-park-solid:online-meeting" class="text-sm text-white" />
          </div>
          <h3 class="text-lg font-semibold text-purple-700">Online</h3>
        </div>
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Link (Zoom, Google Meet, etc.)</label>
          <InputText v-model="onlineLinkMeeting" placeholder="paste link here" class="w-full p-3 h-12 rounded-2xl bg-gray-100 border-gray-200 focus:border-purple-400 focus:ring-purple-400" />
        </div>
      </section>

      <section class="chair">
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <i class="pi pi-volume-up text-purple-600 text-lg"></i>
            </div>
            <h2 class="text-xl font-semibold text-gray-800">Chair</h2>
          </div>
          <Button @click="addChair" class="add-chair-btn">
            <template #default>
              <i class="pi pi-plus mr-2"></i>
              <span class="font-medium">Add Chair</span>
            </template>
          </Button>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="">
            <DataTable :value="chairs" :loading="loading" stripedRows responsiveLayout="scroll" class="custom-datatable" :emptyMessage="'No chairs added yet'">
              <Column field="name" header="Name" class="name-column">
                <template #body="slotProps">
                  <div class="flex items-center gap-4 py-2">
                    <Avatar :image="slotProps.data.avatar" :label="slotProps.data.name.charAt(0)" shape="circle" size="large" class="shadow-md hover:shadow-lg transition-shadow duration-200" />
                    <div>
                      <h3 class="font-semibold text-gray-900 hover:text-purple-600 transition-colors duration-200">
                        {{ slotProps.data.name }}</h3>
                      <p class="text-sm text-gray-500">{{ slotProps.data.position }}</p>
                    </div>
                  </div>
                </template>
              </Column>
              <Column field="company" header="Ministry/Company" class="company-column">
                <template #body="slotProps">
                  <span class="text-gray-700 font-medium">{{ slotProps.data.company }}</span>
                </template>
              </Column>
              <Column header="Action" class="action-column">
                <template #body="slotProps">
                  <div class="flex items-center justify-center gap-2">
                    <Button icon="pi pi-pencil" text rounded size="small" class="action-btn edit-btn" @click="editChair(slotProps.data)" v-tooltip.top="'Edit Chair'" />
                    <span class="text-gray-300">|</span>
                    <Button icon="pi pi-trash" text rounded size="small" class="action-btn delete-btn" @click="deleteChair(slotProps.data)" v-tooltip.top="'Delete Chair'" />
                  </div>
                </template>
              </Column>
              <template #empty>
                <div class="text-center py-12">
                  <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="pi pi-users text-2xl text-gray-400"></i>
                  </div>
                  <h3 class="text-lg font-medium text-gray-900 mb-2">No chairs added yet</h3>
                  <p class="text-gray-500 mb-6">Add your first chair to get started with event management.</p>
                  <Button @click="addChair" class="add-chair-btn">
                    <i class="pi pi-plus mr-2"></i>
                    Add First Chair</Button>
                </div>
              </template>
              <template #loading>
                <div class="flex items-center justify-center py-8">
                  <ProgressSpinner size="50" strokeWidth="4" fill="transparent" animationDuration="1s" />
                </div>
              </template>
            </DataTable>
          </div>
        </div>
      </section>

      <section class="Member mt-10">
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <i class="pi pi-volume-up text-purple-600 text-lg"></i>
            </div>
            <h2 class="text-xl font-semibold text-gray-800">Member</h2>
          </div>
          <div>
            <Dropdown v-model="member" :options="members" placeholder="Select Member" class="w-80 p-1 rounded-2xl focus:outline-none focus:bg-transparent bg-gray-100 transition-all duration-300" />
          </div>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="">
            <DataTable :value="chairs" :loading="loading" stripedRows responsiveLayout="scroll" class="custom-datatable" :emptyMessage="'No chairs added yet'">
              <Column field="name" header="Name" style="width: 35%;" class="name-column">
                <template #body="slotProps">
                  <div class="flex items-center gap-4 py-2">
                    <div>
                      <h3 class="font-semibold text-gray-900 hover:text-purple-600 transition-colors duration-200">
                        {{ slotProps.data.name }}</h3>
                    </div>
                  </div>
                </template>
              </Column>
              <Column field="company" header="POSITION" class="company-column">
                <template #body="slotProps">
                  <span class="text-gray-700 font-medium">{{ slotProps.data.company }}</span>
                </template>
              </Column>
              <Column header="Action" class="action-column">
                <template #body="slotProps">
                  <div class="flex items-center justify-center gap-2">
                    <Button icon="pi pi-trash" text rounded size="small" class="action-btn delete-btn" @click="deleteChair(slotProps.data)" v-tooltip.top="'Delete Chair'" />
                  </div>
                </template>
              </Column>
              <template #empty>
                <div class="text-center py-12">
                  <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="pi pi-users text-2xl text-gray-400"></i>
                  </div>
                  <h3 class="text-lg font-medium text-gray-900 mb-2">No chairs added yet</h3>
                  <p class="text-gray-500 mb-6">Add your first chair to get started with event management.</p>
                  <Button @click="addChair" class="add-chair-btn">
                    <i class="pi pi-plus mr-2"></i>
                    Add First Chair</Button>
                </div>
              </template>
              <template #loading>
                <div class="flex items-center justify-center py-8">
                  <ProgressSpinner size="50" strokeWidth="4" fill="transparent" animationDuration="1s" />
                </div>
              </template>
            </DataTable>
          </div>
        </div>
      </section>

      <div class="border border-gray-200 my-5"></div>

      <section class="cover">
        <UploadPhoto v-model:file="coverImageFile" />
      </section>
      <section class="event-bg mt-10">
        <UploadPhoto label="Event Background" v-model:file="eventBackgroundFile" />
      </section>
      <section class="card-bg mt-10">
        <UploadPhoto label="Card Background" v-model:file="cardBackgroundFile" />
      </section>

      <div class="flex items-center mt-6">
        <InputSwitch v-model="isPublished" inputId="isPublished" />
        <label for="isPublished" class="ml-2 text-sm font-medium text-gray-700">Publish Event</label>
      </div>

      <div class="flex justify-end mt-8">
        <Button label="Save Event" icon="pi pi-save" @click="submitEvent" class="p-button-primary" :loading="loading" />
      </div>
    </div>
  </div>
</template>

<script setup>
import './css/style.css'
import { ref, computed, onMounted, watch } from "vue";
import { Icon } from "@iconify/vue";
import Button from "primevue/button";
import { useToast } from "primevue/usetoast";
import { useRouter } from "vue-router";
import InputText from "primevue/inputtext";
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ProgressSpinner from 'primevue/progressspinner'
import Dropdown from "primevue/dropdown";
import Textarea from "primevue/textarea";
import Calendar from "primevue/calendar";
import Avatar from 'primevue/avatar'
import InputSwitch from 'primevue/inputswitch'; // Import InputSwitch
import UploadPhoto from '~/components/common/UploadPhoto.vue'
import { useRuntimeConfig } from '#app' // Import useRuntimeConfig

const toast = useToast()
const router = useRouter()
const runtimeConfig = useRuntimeConfig() // Get runtime config
const API_ADMIN_BASE_URL = runtimeConfig.public.apiAdminBaseUrl // Use from runtime config
const BEARER_TOKEN = runtimeConfig.public.bearerToken // Get bearer token

const loading = ref(false)

// Form Data
const eventName = ref("")
const category = ref(null)
const description = ref("")
const startDate = ref(null)
const endDate = ref(null)
const location = ref("")
const mapUrl = ref("")
const company = ref("")
const organizer = ref("")
const onlineLinkMeeting = ref(null) // Added for online link
const eventSlug = ref('') // Initialize empty for auto-generation

// New refs for file uploads and publish status
const isPublished = ref(false)
const coverImageFile = ref(null)
const eventBackgroundFile = ref(null)
const cardBackgroundFile = ref(null)

// Category Options (updated with value for category_id)
const categories = ref([
  { label: "Conference", value: 1 },
  { label: "Workshop", value: 2 },
  { label: "Seminar", value: 3 },
  { label: "Networking", value: 4 },
])

const members = ref(['Kim', 'ly', 'meng']) // Kept from original, not part of event creation form

// Computed URL based on slug
const generatedUrl = computed(() => {
  return `https://eticket.asia/e/${eventSlug.value}`
})

// Methods
const validateSlug = () => {
  // Remove invalid characters and convert to lowercase
  eventSlug.value = eventSlug.value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '')
}

const generateSlug = () => {
  if (eventName.value) {
    eventSlug.value = eventName.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '');
    toast.add({ severity: 'success', summary: 'Slug Generated', detail: 'Slug generated from event name!', life: 3000 });
  } else {
    const adjectives = ['awesome', 'amazing', 'fantastic', 'incredible', 'spectacular', 'wonderful']
    const nouns = ['event', 'conference', 'summit', 'meetup', 'workshop', 'seminar']
    const numbers = Math.floor(Math.random() * 999) + 1
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]
    eventSlug.value = `${randomAdjective}-${randomNoun}-${numbers}`
    toast.add({ severity: 'success', summary: 'Slug Generated', detail: 'Random slug generated!', life: 3000 });
  }
}

const copyUrl = async () => {
  try {
    await navigator.clipboard.writeText(generatedUrl.value)
    toast.add({ severity: 'success', summary: 'Copied!', detail: 'URL copied to clipboard!', life: 3000 })
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Copy Failed', detail: 'Failed to copy URL', life: 3000 })
  }
}

const openUrl = () => {
  window.open(generatedUrl.value, '_blank')
  toast.add({ severity: 'info', summary: 'Opening URL', detail: 'Opening URL in new tab', life: 3000 })
}

// Helper to format date for API
const formatDateForApi = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// Submit Event Function
const submitEvent = async () => {
  loading.value = true;
  try {
    // Basic validation
    if (!eventName.value || !category.value || !description.value || !startDate.value || !endDate.value || !location.value || !eventSlug.value) {
      toast.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill all required fields.', life: 3000 });
      return;
    }

    const formData = new FormData();
    formData.append('name', eventName.value);
    formData.append('category_id', category.value);
    formData.append('description', description.value);
    formData.append('start_date', formatDateForApi(startDate.value));
    formData.append('end_date', formatDateForApi(endDate.value));
    formData.append('location', location.value);
    formData.append('map_url', mapUrl.value || ''); // mapUrl can be null
    formData.append('company', company.value || '');
    formData.append('organizer', organizer.value || '');
    formData.append('event_slug', eventSlug.value);
    formData.append('online_link_meeting', onlineLinkMeeting.value || ''); // Add online link
    formData.append('is_published', isPublished.value ? '1' : '0');

    if (coverImageFile.value) {
      formData.append('cover_image', coverImageFile.value);
    }
    if (eventBackgroundFile.value) {
      formData.append('event_background_url', eventBackgroundFile.value); // API expects event_background_url
    }
    if (cardBackgroundFile.value) {
      formData.append('card_background_url', cardBackgroundFile.value); // API expects card_background_url
    }

    const url = `${API_ADMIN_BASE_URL}/events/create`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        // 'Content-Type': 'multipart/form-data' is automatically set by fetch when using FormData
      },
      body: formData,
    });

    // Log the raw response text for debugging
    const responseText = await response.text();
    console.log('Raw API Response:', responseText);

    // Check Content-Type header before parsing
    const contentType = response.headers.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Server did not return JSON. Content-Type:', contentType);
      toast.add({ severity: 'error', summary: 'Response Error', detail: `Server returned non-JSON response (${contentType}). Check console for details.`, life: 5000 });
      return; // Stop execution if not JSON
    }

    // Try to parse as JSON
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (jsonError) {
      console.error('Failed to parse response as JSON:', jsonError);
      toast.add({ severity: 'error', summary: 'Response Error', detail: 'Failed to parse response as JSON. Check console for details.', life: 5000 });
      return; // Stop execution if not JSON
    }

    if (response.ok && result.success) {
      toast.add({ severity: 'success', summary: 'Event Created', detail: result.message, life: 3000 });
      // Clear form fields
      eventName.value = '';
      category.value = null;
      description.value = '';
      startDate.value = null;
      endDate.value = null;
      location.value = '';
      mapUrl.value = '';
      company.value = '';
      organizer.value = '';
      onlineLinkMeeting.value = null;
      eventSlug.value = '';
      isPublished.value = false;
      coverImageFile.value = null;
      eventBackgroundFile.value = null;
      cardBackgroundFile.value = null;

      // Redirect to event list page
      router.push('/admin/events');
    } else {
      toast.add({ severity: 'error', summary: 'Creation Failed', detail: result.message || 'An error occurred.', life: 3000 });
    }
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Network Error', detail: error.message, life: 3000 });
  } finally {
    loading.value = false;
  }
};

// Sample chair data
const chairs = ref([
  { id: 1, name: 'H.E Liv Sophanarith', position: 'Secretary of State', company: 'Minister of Telecommunication Technology and Transport', avatar: '/placeholder.svg?height=60&width=60' },
  { id: 2, name: 'Sovanpahanvuth', position: 'Full Stack Developer/QA Testing', company: 'Prestige Consulting', avatar: '/placeholder.svg?height=60&width=60' }
])

// Methods for chair management (kept from original)
const addChair = () => { toast.add({ severity: 'info', summary: 'Add Chair', detail: 'Add Chair dialog to be implemented', life: 3000 }) }
const editChair = (chair) => { toast.add({ severity: 'info', summary: 'Edit Chair', detail: `Editing ${chair.name}...`, life: 3000 }) }
const deleteChair = (chair) => {
  toast.add({ severity: 'warn', summary: 'Confirm Deletion', detail: `Are you sure you want to delete ${chair.name}?`, life: 5000, closable: true });
  // For demo purposes, we'll remove after a delay
  setTimeout(() => {
    const index = chairs.value.findIndex(c => c.id === chair.id)
    if (index > -1) {
      chairs.value.splice(index, 1)
      toast.add({ severity: 'success', summary: 'Deleted', detail: `${chair.name} has been removed`, life: 3000 })
    }
  }, 1500)
}

onMounted(() => {
  // Simulate initial loading
  loading.value = false; // Set to false as this is a creation form, not loading existing data
})

// Watch for event name changes to suggest slug
watch(eventName, (newName) => {
  if (newName && !eventSlug.value) {
    generateSlug(); // Auto-generate slug if event name is entered and slug is empty
  }
});
</script>

<style scoped>
:deep(.p-calendar .p-inputtext) {
  @apply bg-transparent border-0;
}
</style>
