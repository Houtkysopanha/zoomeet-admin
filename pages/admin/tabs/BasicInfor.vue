<template>
  <div class="">
    <h2 class="text-lg font-semibold">Event Information</h2>
    <p class="text-gray-400 mb-6">Basic detail about your event</p>

    <div>
      <section class="about-event">
        <div class="mb-6">
          <div class="header">
            <h3 class="text-purple-700 font-medium mb-2 flex items-center">
              <Icon name="heroicons:information-circle" class="text-2xl mr-2" />
              About Event
            </h3>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Event Name <span class="text-red-500">*</span></label>
              <InputText
                v-model="formData.eventName"
                :class="[
                  'w-full p-3 mt-1 bg-gray-100 rounded-2xl',
                  getFieldError('name') ? 'border-red-500 border-2' : ''
                ]"
                placeholder="Enter event name"
              />
              <small v-if="getFieldError('name')" class="text-red-500">{{ getFieldError('name') }}</small>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Category <span class="text-red-500">*</span></label>
              <Dropdown
                v-model="formData.category"
                :options="categories"
                optionLabel="label"
                optionValue="value"
                :loading="isLoadingCategories"
                :class="[
                  'w-full p-1 mt-1 bg-gray-100 rounded-2xl',
                  getFieldError('category_id') ? 'border-red-500 border-2' : ''
                ]"
                placeholder="Select category"
              />
              <small v-if="getFieldError('category_id')" class="text-red-500">{{ getFieldError('category_id') }}</small>
            </div>
          </div>
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700">Event Description <span class="text-red-500">*</span></label>
            <div class="mt-1">
              <ClientOnly>
                <QuillEditor
                  v-model="formData.description"
                  :sendHtml="true"
                  placeholder="Describe your event..."
                  :error="getFieldError('description')"
                  min-height="120px"
                />
                <template #fallback>
                  <Textarea
                    v-model="formData.description"
                    :class="[
                      'w-full p-2 bg-gray-100 rounded-2xl',
                      getFieldError('description') ? 'border-red-500 border-2' : ''
                    ]"
                    placeholder="Describe your event..."
                    rows="4"
                  />
                </template>
              </ClientOnly>
            </div>
          </div>
        </div>
        <div class="mb-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Start Date & Time <span class="text-red-500">*</span></label>
              <Calendar
                showIcon
                iconDisplay="input"
                placeholder="31/07/2025 09:00"
                v-model="formData.startDate"
                :class="[
                  'w-full p-3 mt-1 bg-gray-100 ring-0 rounded-2xl',
                  getFieldError('start_date') ? 'border-red-500 border-2' : ''
                ]"
                dateFormat="dd/mm/yy"
                showTime
                hourFormat="24"
              />
              <small v-if="getFieldError('start_date')" class="text-red-500">{{ getFieldError('start_date') }}</small>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">End Date & Time <span class="text-red-500">*</span></label>
              <Calendar
                v-model="formData.endDate"
                showIcon
                placeholder="31/07/2025 17:00"
                iconDisplay="input"
                :class="[
                  'w-full p-3 mt-1 bg-gray-100 rounded-2xl',
                  getFieldError('end_date') || getFieldError('date_range') ? 'border-red-500 border-2' : ''
                ]"
                dateFormat="dd/mm/yy"
                showTime
                hourFormat="24"
              />
              <small v-if="getFieldError('end_date')" class="text-red-500">{{ getFieldError('end_date') }}</small>
              <small v-if="getFieldError('date_range')" class="text-red-500">{{ getFieldError('date_range') }}</small>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Location <span class="text-red-500">*</span></label>
              <InputText
                v-model="formData.location"
                :class="[
                  'w-full p-3 mt-1 bg-gray-100 rounded-2xl',
                  getFieldError('location') ? 'border-red-500 border-2' : ''
                ]"
                placeholder="Enter location"
              />
              <small v-if="getFieldError('location')" class="text-red-500">{{ getFieldError('location') }}</small>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Map URL <span class="text-gray-400">(Optional)</span></label>
              <InputText
                v-model="formData.mapUrl"
                :class="[
                  'w-full p-3 mt-1 bg-gray-100 rounded-2xl',
                  getFieldError('map_url') ? 'border-red-500 border-2' : ''
                ]"
                placeholder="https://maps.google.com/... (optional)"
              />
              <small v-if="getFieldError('map_url')" class="text-red-500">{{ getFieldError('map_url') }}</small>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Company <span class="text-red-500">*</span></label>
            <InputText
              v-model="formData.company"
              :class="[
                'w-full p-3 mt-1 bg-gray-100 rounded-2xl',
                getFieldError('company') ? 'border-red-500 border-2' : ''
              ]"
              placeholder="Enter company name"
            />
            <small v-if="getFieldError('company')" class="text-red-500">{{ getFieldError('company') }}</small>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Organizer <span class="text-red-500">*</span></label>
            <InputText
              v-model="formData.organizer"
              :class="[
                'w-full p-3 mt-1 bg-gray-100 rounded-2xl',
                getFieldError('organizer') ? 'border-red-500 border-2' : ''
              ]"
              placeholder="Enter organizer name"
            />
            <small v-if="getFieldError('organizer')" class="text-red-500">{{ getFieldError('organizer') }}</small>
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
                Event Slug <span class="text-red-500">*</span></label>
              <div class="flex items-center gap-3">
                <div class="flex-1">
                  <InputText
                    v-model="formData.eventSlug"
                    :class="[
                      'w-full p-3 h-12 rounded-2xl bg-gray-100 border-gray-200 focus:border-purple-400 focus:ring-purple-400',
                      getFieldError('event_slug') ? 'border-red-500 border-2' : ''
                    ]"
                    placeholder="my-awesome-event"
                  />
                </div>
                <Button 
                  icon="pi pi-refresh" 
                  text 
                  rounded 
                  size="small" 
                  class="flex-shrink-0 bg-gray-100 rounded-2xl h-12 w-12 flex items-center justify-center text-gray-400 hover:text-purple-600 transition-colors duration-200" 
                  @click="generateSlug" 
                  title="Generate new slug" 
                />
              </div>
              <small v-if="getFieldError('event_slug')" class="text-red-500">{{ getFieldError('event_slug') }}</small>
              <p class="text-xs text-gray-500 mt-2">
                This will be used to create your event's short URL. Only letters, numbers, and hyphens allowed.</p>
            </div>
            <div class=" p-4 bg-purple-50 border-2 border-purple-800  rounded-xl ">
              <label class="block text-sm font-medium text-purple-700 mb-3">
                Preview URL</label>
              <div class="flex items-center gap-3">
                <div class="flex-1 bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                  <span class="text-sm text-gray-600 font-mono">
                    {{ generatedUrl }}</span>
                </div>
                <div class="flex gap-2">
                  <Button icon="pi pi-copy" text rounded size="small" class="text-gray-500 bg-white rounded-2xl h-12 w-20 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200" @click="copyUrl" title="Copy URL" />
                  <Button icon="pi pi-external-link" text rounded size="small" class="text-gray-500 bg-white rounded-2xl h-12 w-20 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200" @click="openUrl" title="Open in new tab" />
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
            <Icon name="heroicons:video-camera" class="text-sm text-white" />
          </div>
          <h3 class="text-lg font-semibold text-purple-700">Online</h3>
        </div>
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Link (Zoom, Google Meet, etc.) <span class="text-gray-400">(Optional)</span></label>
          <InputText
            v-model="formData.onlineLinkMeeting"
            :class="[
              'w-full p-3 h-12 rounded-2xl bg-gray-100 border-gray-200 focus:border-purple-400 focus:ring-purple-400',
              getFieldError('online_link_meeting') ? 'border-red-500 border-2' : ''
            ]"
            placeholder="https://zoom.us/... (optional)"
          />
          <small v-if="getFieldError('online_link_meeting')" class="text-red-500">{{ getFieldError('online_link_meeting') }}</small>
        </div>
      </section>

      <section class="chair">
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center gap-3">
            <div class="w-6 h-6 bg-purple-600 rounded-lg flex items-center justify-center">
            <Icon name="heroicons:megaphone" class="text-sm text-white" />
            </div>
            <h2 class="text-lg font-semibold text-purple-700">Chair</h2>
          </div>
          <Button @click="openChairDialog()" class="add-chair-btn">
            <template #default>
              <i class="pi pi-plus mr-2"></i>
              <span class="font-medium">Add Chair</span>
            </template>
          </Button>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="">
            <ClientOnly>
              <DataTable :value="formData.chairs" :loading="isLoadingData" stripedRows responsiveLayout="scroll" class="custom-datatable" :emptyMessage="'No chairs added yet'">
                <Column field="name" header="Name" class="name-column">
                  <template #body="slotProps">
                    <div class="flex items-center gap-4 py-2">
                      <div class="relative">
                        <img
                          v-if="getChairImageSrc(slotProps.data)"
                          :src="getChairImageSrc(slotProps.data)"
                          :alt="slotProps.data.name"
                          class="w-12 h-12 rounded-full object-cover shadow-md hover:shadow-lg transition-shadow duration-200 border-2 border-gray-200"
                          @error="handleChairImageError"
                        />
                        <Avatar
                          v-else
                          :label="slotProps.data.name.charAt(0)"
                          shape="circle"
                          size="large"
                          class="shadow-md hover:shadow-lg transition-shadow duration-200 bg-purple-600 text-white"
                        />
                      </div>
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
                      <Button icon="pi pi-pencil" text rounded size="small" class="action-btn edit-btn" @click="openChairDialog(slotProps.data, slotProps.index)" title="Edit Chair" />
                      <span class="text-gray-300">|</span>
                      <Button icon="pi pi-trash" text rounded size="small" class="action-btn delete-btn" @click="deleteChair(slotProps.index)" title="Delete Chair" />
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
                    <Button @click="openChairDialog()" class="add-chair-btn">
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
              <template #fallback>
                <div class="flex items-center justify-center py-8">
                  <div class="text-gray-500">Loading chairs...</div>
                </div>
              </template>
            </ClientOnly>
          </div>
        </div>
      </section>

      <!-- Chair Form Dialog -->
      <ChairForm
        :visible="showChairDialog"
        @update:visible="showChairDialog = $event"
        :chair="editingChair"
        :is-edit="editingChairIndex >= 0"
        @save="handleChairSaved"
      />

      <div class="border border-gray-200 my-5"></div>

      <section class="cover">
        <UploadPhoto
          label="Cover Image (Required)"
          :multiple="false"
          :existing-image-url="getCoverImageUrl()"
          @file-selected="handleCoverImageUpload"
          @file-removed="handleCoverImageRemoved"
          @existing-image-removed="handleCoverImageRemoved"
        />
        <small v-if="getFieldError('cover_image')" class="text-red-500 mt-2 block">{{ getFieldError('cover_image') }}</small>
      </section>
      <section class="event-bg mt-10">
        <UploadPhoto
          label="Event Background (Optional)"
          :multiple="false"
          @file-selected="handleEventBackgroundUpload"
          @file-removed="formData.eventBackgroundFile = null"
        />
      </section>
      <section class="card-bg mt-10">
        <UploadPhoto
          label="Card Background (Optional)"
          :multiple="false"
          @file-selected="handleCardBackgroundUpload"
          @file-removed="formData.cardBackgroundFile = null"
        />
      </section>

      <!-- Note: All save and update actions are handled by the main page buttons -->
    </div>
    
    <!-- Confirmation Dialog -->
    <ConfirmDialog />
  </div>
</template>

<script setup>
import './css/style.css'
import { ref, reactive, computed, onMounted, onBeforeUnmount, inject, watch, nextTick } from 'vue'
import { useToast } from "primevue/usetoast"
import { useConfirm } from "primevue/useconfirm"
import { useEventStore } from '~/composables/useEventStore'
import { useEventTabsStore } from '~/composables/useEventTabs'
import { fetchCategories, deleteChair as deleteChairAPI } from '~/composables/api'
import { useAuth } from '~/composables/useAuth'
import { useFormValidation } from '~/composables/useFormValidation'

// Import PrimeVue components
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Avatar from 'primevue/avatar'
import ProgressSpinner from 'primevue/progressspinner'
import ConfirmDialog from 'primevue/confirmdialog'

// Import custom components
import ChairForm from '~/components/common/ChairForm.vue'
import UploadPhoto from '~/components/common/UploadPhoto.vue'
import QuillEditor from '~/components/common/QuillEditor.vue'

// UUID generator with fallback for older browsers
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback UUID v4 generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const toast = useToast()
const confirm = useConfirm()
const eventStore = useEventStore()
const tabsStore = useEventTabsStore()
const { getToken } = useAuth()

// Form validation
const {
  errors,
  hasErrors,
  clearErrors,
  clearFieldError,
  setFieldError,
  getFieldError,
  validateField,
  validateBasicInfo,
  validateDateRange
} = useFormValidation()

// Inject parent state
const eventCreationState = inject('eventCreationState')

// Form data - reactive object for better reactivity
const formData = reactive({
  eventName: '',
  category: null,
  description: '',
  startDate: null,
  endDate: null,
  location: '',
  mapUrl: '',
  company: '',
  organizer: '',
  onlineLinkMeeting: null,
  eventSlug: '',
  coverImageFile: null,
  eventBackgroundFile: null,
  cardBackgroundFile: null,
  chairs: [],
  members: []
})

// UI state
const isSubmitting = ref(false)
const categories = ref([])
const isLoadingCategories = ref(false)
const showChairDialog = ref(false)
const editingChair = ref(null)
const editingChairIndex = ref(-1)
const isLoadingData = ref(false)

// Computed properties
const isEditMode = computed(() => eventCreationState?.isEditMode?.value || false)
const eventId = computed(() => eventCreationState?.eventId?.value || null)

// Computed URL based on slug
const generatedUrl = computed(() => {
  return `https://etickets.asia/${formData.eventSlug}`
})

// Load categories and data on mount
onMounted(async () => {
  await loadCategories()
  await loadExistingData()
  
  // Listen for save events
  window.addEventListener('saveDraft', handleSaveDraft)
  window.addEventListener('saveCurrentTab', handleSaveCurrentTab)
})

function parseLocalDate(dateString) {
  if (!dateString) return null;

  // Take only date + time (ignore timezone part if present)
  const [datePart, timePart] = dateString.split("T");
  if (!timePart) return new Date(dateString); // fallback

  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);

  // Construct Date in local timezone (no UTC shift)
  return new Date(year, month - 1, day, hour, minute, second || 0);
}

// Enhanced data loading with comprehensive source checking and File object restoration
const loadExistingData = async () => {
  if (isLoadingData.value) return
  
  isLoadingData.value = true
  
  try {
    // Priority 1: Check tabs store for saved data
    const tabData = tabsStore.getTabData(0) // Basic Info tab
    
    if (tabData && Object.keys(tabData).length > 0 && tabData.eventName) {
      
      // Load data from tabs store
      Object.assign(formData, {
        eventName: tabData.eventName || '',
        category: tabData.category || null,
        description: tabData.description || '',
        startDate: tabData.startDate ? new Date(tabData.startDate) : null,
        endDate: tabData.endDate ? new Date(tabData.endDate) : null,
        location: tabData.location || '',
        mapUrl: tabData.mapUrl || '',
        company: tabData.company || '',
        organizer: tabData.organizer || '',
        onlineLinkMeeting: tabData.onlineLinkMeeting || null,
        eventSlug: tabData.eventSlug || '',
        chairs: tabData.chairs || [],
        members: tabData.members || []
      })
      
      // Initialize or get chairFileObjects Map
      let chairFileObjects;
      if (tabData.chairFileObjects instanceof Map) {
        chairFileObjects = tabData.chairFileObjects;
      } else {
        // Create new Map if not exists or not a Map
        chairFileObjects = new Map();
        
        // Convert array or object to Map if needed
        if (Array.isArray(tabData.chairFileObjects)) {
          tabData.chairFileObjects.forEach(item => {
            if (item && item.id && item.fileObject instanceof File) {
              chairFileObjects.set(item.id, item.fileObject);
            }
          });
        } else if (tabData.chairFileObjects && typeof tabData.chairFileObjects === 'object') {
          Object.entries(tabData.chairFileObjects).forEach(([id, fileObject]) => {
            if (fileObject instanceof File) {
              chairFileObjects.set(id, fileObject);
            }
          });
        }
      }

      // Restore File objects and create avatars (client-side only)
      formData.chairs.forEach(chair => {
        const fileObject = chairFileObjects.get(chair.id);
        if (fileObject instanceof File) {
          chair.profile_image = fileObject;
          // Only create object URLs on client-side
          if (process.client) {
            chair.avatar = URL.createObjectURL(fileObject);
          }
        } else if (chair.profile_image_url) {
          chair.avatar = chair.profile_image_url;
        }
      });

      // Update tabs store with the proper Map
      tabsStore.saveTabData(0, {
        ...tabData,
        chairFileObjects
      });
      
      return
    }
    
    // Priority 2: Check event store for current event
    if (eventStore.currentEvent && eventStore.currentEvent.id) {
      
      const event = eventStore.currentEvent
      Object.assign(formData, {
        eventName: event.name || '',
        category: event.category_id || null,
        description: event.description || '',
        startDate: event.start_date ? parseLocalDate(event.start_date) : null,
        endDate: event.end_date ? parseLocalDate(event.end_date) : null,
        location: event.location || '',
        mapUrl: event.map_url || '',
        company: event.company || '',
        organizer: event.organizer || '',
        onlineLinkMeeting: event.online_link_meeting || null,
        eventSlug: event.event_slug || '',
        chairs: event.chairs || [],
        members: event.members || []
      })
      
      // Save this data to tabs store for future use
      tabsStore.saveTabData(0, {
        ...formData,
        eventId: event.id,
        isComplete: true,
        lastSaved: new Date().toISOString()
      })
      
      return
    }
    
    // Priority 3: If we have an eventId but no data, try to reload from API
    if (eventId.value && isEditMode.value) {
      
      try {
        await eventStore.loadEventById(eventId.value)
        
        if (eventStore.currentEvent) {
          const event = eventStore.currentEvent
          Object.assign(formData, {
            eventName: event.name || '',
            category: event.category_id || null,
            description: event.description || '',
            startDate: event.start_date ? parseLocalDate(event.start_date) : null,
endDate: event.end_date ? parseLocalDate(event.end_date) : null,

            location: event.location || '',
            mapUrl: event.map_url || '',
            company: event.company || '',
            organizer: event.organizer || '',
            onlineLinkMeeting: event.online_link_meeting || null,
            eventSlug: event.event_slug || '',
            chairs: event.chairs || [],
            members: event.members || []
          })
          
          // Save to tabs store
          tabsStore.saveTabData(0, {
            ...formData,
            eventId: event.id,
            isComplete: true,
            lastSaved: new Date().toISOString()
          })
          
        }
      } catch (error) {
        // Failed to reload event data from API
      }
    }
    
  } catch (error) {
    toast.add({
      severity: 'warn',
      summary: 'Data Loading Issue',
      detail: 'Some data may not have loaded properly. Please check your inputs.',
      life: 3000
    })
  } finally {
    isLoadingData.value = false
  }
}

// Watch for tab switching to reload data
watch(() => tabsStore.activeTab, async (newTab, oldTab) => {
  if (newTab === 0 && oldTab !== 0) {
    await nextTick() // Wait for DOM updates
    await loadExistingData()
  }
})

// Watch for event changes to reload data
watch(() => eventId.value, async (newEventId, oldEventId) => {
  if (newEventId && newEventId !== oldEventId) {
    await nextTick()
    await loadExistingData()
  }
})

// Load categories from API
const loadCategories = async () => {
  if (isLoadingCategories.value) return
  
  isLoadingCategories.value = true
  try {
    const response = await fetchCategories()
    
    // Handle the nested response structure: response.data.data
    let categoriesData = null
    if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
      categoriesData = response.data.data
    } else if (response && response.data && Array.isArray(response.data)) {
      categoriesData = response.data
    } else if (response && Array.isArray(response)) {
      categoriesData = response
    }
    
    if (categoriesData && Array.isArray(categoriesData)) {
      categories.value = categoriesData.map(cat => ({
        label: cat.name,
        value: cat.id
      }))
    } else {
      // Fallback categories
      categories.value = [
        { label: "Conference", value: 1 },
        { label: "Workshop", value: 2 },
        { label: "Music & Concerts", value: 3 },
        { label: "Sports & Fitness", value: 4 },
        { label: "Arts & Culture", value: 5 },
        { label: "Business & Technology", value: 6 },
        { label: "Education & Workshops", value: 7 },
        { label: "Family & Kids", value: 8 },
        { label: "Nightlife & Social", value: 9 },
        { label: "Film & Media", value: 10 },
        { label: "Spiritual & Wellness", value: 11 },
      ]
      toast.add({
        severity: 'warn',
        summary: 'Categories Load Issue',
        detail: 'Using default categories. API response structure may have changed.',
        life: 3000
      })
    }
  } catch (error) {
    // Fallback categories
    categories.value = [
      { label: "Conference", value: 1 },
      { label: "Workshop", value: 2 },
      { label: "Music & Concerts", value: 3 },
      { label: "Sports & Fitness", value: 4 },
      { label: "Arts & Culture", value: 5 },
      { label: "Business & Technology", value: 6 },
      { label: "Education & Workshops", value: 7 },
      { label: "Family & Kids", value: 8 },
      { label: "Nightlife & Social", value: 9 },
      { label: "Film & Media", value: 10 },
      { label: "Spiritual & Wellness", value: 11 },
    ]
    toast.add({
      severity: 'error',
      summary: 'Failed to Load Categories',
      detail: 'Could not load event categories. Using default categories.',
      life: 5000
    })
  } finally {
    isLoadingCategories.value = false
  }
}

// Handle save current tab data (for tab switching)
const handleSaveCurrentTab = async (event) => {
  const detail = event?.detail
  if (detail && detail.eventId && detail.eventId !== eventId.value) {
    return
  }
  
  // Save current form data to tabs store
  tabsStore.saveTabData(0, {
    ...formData,
    lastSaved: new Date().toISOString(),
    hasUnsavedChanges: false
  })
  
}

// Enhanced save draft function with better error handling and update support
const handleSaveDraft = async () => {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  
  try {

    // Check if the slug is available (only if we have a slug)
    
    // Validate required fields (added Company and Organizer as required)
    const requiredFields = [
      { field: 'eventName', label: 'Event Name' },
      { field: 'category', label: 'Category' },
      { field: 'description', label: 'Description' },
      { field: 'startDate', label: 'Start Date' },
      { field: 'endDate', label: 'End Date' },
      { field: 'location', label: 'Location' },
      { field: 'company', label: 'Company' },
      { field: 'organizer', label: 'Organizer' }
    ]
    
    const missingFields = requiredFields.filter(({ field }) => {
      const value = formData[field]
      // Handle different types of empty values
      if (value === null || value === undefined || value === '') {
        return true
      }
      // For arrays, check if empty
      if (Array.isArray(value) && value.length === 0) {
        return true
      }
      return false
    })
    
    
    if (missingFields.length > 0) {
      // Set field-specific errors
      missingFields.forEach(({ field, label }) => {
        setFieldError(field, `${label} is required`);
      });

      // Show a single toast with clear guidance
      if (missingFields.length === 1) {
        toast.add({
          severity: 'warn',
          summary: 'Required Field Missing',
          detail: `Please fill in the ${missingFields[0].label.toLowerCase()} field to continue.`,
          life: 3000
        });
      } else {
        const fieldCount = missingFields.length;
        toast.add({
          severity: 'warn',
          summary: 'Required Fields Missing',
          detail: `Please fill in all ${fieldCount} required fields to continue.`,
          life: 3000
        });
      }
      return;
    }
    
    // Enhanced date validation
    if (formData.startDate && formData.endDate) {
      // Check if dates are the same
      if (formData.startDate.getTime() === formData.endDate.getTime()) {
        setFieldError('date_range', 'Start time and end time cannot be the same')
        toast.add({
          severity: 'warn',
          summary: 'Invalid Event Time',
          detail: 'Please set different start and end times for your event',
          life: 4000
        })
        return
      }
      
      // Check if end date is before start date
      if (formData.startDate > formData.endDate) {
        setFieldError('date_range', 'Event must end after it starts')
        toast.add({
          severity: 'warn',
          summary: 'Invalid Event Time',
          detail: 'The event end time must be after the start time',
          life: 4000
        })
        return
      }
    }
    
    // Validate URLs if provided
    const urlRegex = /^https?:\/\/.+/
    if (formData.mapUrl && !urlRegex.test(formData.mapUrl)) {
      toast.add({
        severity: 'warn',
        summary: 'Invalid Map URL',
        detail: 'Map URL must be a valid URL starting with http:// or https://',
        life: 4000
      })
      return
    }
    
    if (formData.onlineLinkMeeting && !urlRegex.test(formData.onlineLinkMeeting)) {
      toast.add({
        severity: 'warn',
        summary: 'Invalid Online Meeting URL',
        detail: 'Online meeting URL must be a valid URL starting with http:// or https://',
        life: 4000
      })
      return
    }
    
    // Check for cover image requirement
    if (!formData.coverImageFile && !getCoverImageUrl()) {
      setFieldError('cover_image', 'Cover image is required')
      toast.add({
        severity: 'warn',
        summary: 'Cover Image Required',
        detail: 'Please upload a cover image for your event',
        life: 4000
      })
      return
    }
    function toLocalISOString(date) {
  if (!date) return null;
  const pad = (n) => String(n).padStart(2, "0");
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds())
  );
}
    // FIXED: Prepare data for API with explicit chair IDs and profile images
const eventData = {
  name: formData.eventName,
  category_id: formData.category,
  description: formData.description,
start_date: toLocalISOString(formData.startDate),
end_date: toLocalISOString(formData.endDate),
  location: formData.location,
  map_url: formData.mapUrl || null,
  company: formData.company || null,
  organizer: formData.organizer || null,
  online_link_meeting: formData.onlineLinkMeeting || null,
  chairs: [],
  members: formData.members || [],
  cover_image: formData.coverImageFile || null,
  event_background: formData.eventBackgroundFile || null,
  card_background: formData.cardBackgroundFile || null
};

// Get chairFileObjects Map from tabs store
const tabData = tabsStore.getTabData(0);
const chairFileObjects = tabData?.chairFileObjects instanceof Map ? 
  tabData.chairFileObjects : new Map();


// Prepare chair data with ID preservation and proper image handling
eventData.chairs = formData.chairs.map((chair, index) => {
  // Use existing ID or server ID to prevent duplicates
  const chairId = chair.id ?? null; // only keep real ID

  
  // Build chair data preserving existing information
  const chairData = {
    id: chairId,
    event_id: chair.event_id || null,
    name: chair.name || '',
    position: chair.position || '',
    company: chair.company || '',
    sort_order: parseInt(chair.sort_order) || 1,
    // Preserve existing profile_image_url if it exists
    profile_image_url: chair.profile_image_url || null
  };

  // Get file object from the Map using the preserved ID
  const storedFile = chairFileObjects.get(chairId);
  
  // Handle profile image with explicit checks
  if (chair.profile_image instanceof File) {
    chairData.profile_image = chair.profile_image;
  } else if (storedFile instanceof File) {
    chairData.profile_image = storedFile;
  } else if (chair.profile_image_url) {
    chairData.profile_image_url = chair.profile_image_url;
  }

  return chairData;
});
  

    // CRITICAL: Enhanced chair data handling with improved file preservation
    if (formData.chairs && Array.isArray(formData.chairs)) {
      // Get chairFileObjects Map from tabsStore
      const chairFileObjects = tabsStore.getTabData(0)?.chairFileObjects || new Map()
      
      eventData.chairs = formData.chairs.map(chair => {
        // Get stored file object from Map using chair ID
        const fileObject = chairFileObjects.get(chair.id)
        
        // Priority chain for profile_image
        let profileImage = null
        let profileImageUrl = null
        
        // Try each source in order of preference
        if (fileObject instanceof File) {
          // Priority 1: File object from chairFileObjects
          profileImage = fileObject
        } else if (chair.profile_image instanceof File) {
          // Priority 2: Direct File object on chair
          profileImage = chair.profile_image
        } else {
          // Priority 3: Handle existing URL or explicit removal
          // FIXED: Always set profileImageUrl to signal intent to API
          profileImageUrl = chair.profile_image_url || ''  // Empty string signals removal
        }
        
        return {
          id: chair.id, // Keep original ID if it exists
          name: chair.name,
          position: chair.position,
          company: chair.company,
          sort_order: chair.sort_order || 1,
          profile_image: profileImage,
          profile_image_url: profileImageUrl,
          // Remove display-only fields
          avatar: undefined,
          hasFileObject: undefined,
          fileObjectName: undefined
        }
      })
    }
    


    // Only include event_slug if it's new or has changed (to avoid "already taken" error)
    if (!isEditMode.value || (isEditMode.value && formData.eventSlug && formData.eventSlug !== eventStore.currentEvent?.event_slug)) {
      eventData.event_slug = formData.eventSlug || null
    }
    
    let result
    
    if (isEditMode.value && eventId.value) {
      // Update existing event
      const { updateEvent } = await import('@/composables/api')
      result = await updateEvent(eventId.value, eventData)
    } else {
      // Create new event
      const { createEvent } = await import('@/composables/api')
      result = await createEvent(eventData)
    }
    
    if (result && result.success !== false && (result.id || result.data?.id)) {
      // Handle both direct response and wrapped response
      const eventData = result.data || result
      
      // Update local state
      const updatedEvent = {
        ...eventData,
        category_name: categories.value.find(cat => cat.value === eventData.category_id)?.label || 'Unknown'
      }
      
      // Update event store
      eventStore.setCurrentEvent(updatedEvent)
      
      // Update tabs store with the saved data
      tabsStore.saveTabData(0, {
        ...formData,
        eventId: eventData.id,
        isComplete: true,
        lastSaved: new Date().toISOString(),
        hasUnsavedChanges: false
      })
      
      // Mark tab as completed
      tabsStore.markTabComplete(0)
      tabsStore.clearTabModifications(0)
      
      // Update parent state - CRITICAL: Set edit mode after creating event
      if (eventCreationState?.setBasicInfoCompleted) {
        eventCreationState.setBasicInfoCompleted(true, eventData.id, updatedEvent)
      }
      
      // Update parent event data
      if (eventCreationState?.updateEventData) {
        eventCreationState.updateEventData(updatedEvent)
      }

      // IMPORTANT: Force edit mode after successful creation/update
      if (!isEditMode.value && eventData.id) {
        // Update the parent component's edit mode state
        if (eventCreationState?.isEditMode) {
          eventCreationState.isEditMode.value = true
        }
      }
      
      // More focused toast management
      const toastKey = isEditMode.value ? 'event-update' : 'event-create';
      const existingToasts = document.querySelectorAll('.p-toast-message');
      const hasRecentToast = Array.from(existingToasts).some(toast => 
        toast.dataset.key === toastKey
      );
      
      if (!hasRecentToast) {
        if (isEditMode.value) {
          toast.add({
            severity: 'success',
            summary: 'Changes Saved',
            detail: 'Your event has been updated successfully.',
            life: 3000,
            data: { key: toastKey }
          });
        } else {
          toast.add({
            severity: 'success',
            summary: 'Event Created',
            detail: 'Great! Your event has been created. You can now add more details.',
            life: 4000,
            data: { key: toastKey }
          });
        }
      }
      
    } else {
      throw new Error('Invalid response from server')
    }
    
  } catch (error) {
    
    // Handle API response errors (from our enhanced error handling)
    if (error.success === false) {
      
      // Handle specific error types from our API wrapper
      switch (error.errorType) {
        case 'FILE_TOO_LARGE':
          toast.add({
            severity: 'error',
            summary: 'Files Too Large 📁',
            detail: error.message,
            life: 8000
          })
          return
          
        case 'NETWORK_ERROR':
          toast.add({
            severity: 'error',
            summary: 'Connection Error 🌐',
            detail: 'Please check your internet connection and try again.',
            life: 6000
          })
          return
          
        case 'AUTH_ERROR':
          toast.add({
            severity: 'error',
            summary: 'Authentication Required 🔐',
            detail: 'Please login again to continue.',
            life: 5000
          })
          // Redirect to login after delay
          setTimeout(() => {
            const router = useRouter()
            router.push('/login')
          }, 2000)
          return
          
        case 'SERVER_ERROR':
          toast.add({
            severity: 'error',
            summary: 'Server Error 🔧',
            detail: 'The server is experiencing issues. Please try again later.',
            life: 6000
          })
          return
          
        case 'VALIDATION_ERROR':
          // Set field errors from server response
          if (error.validationErrors && Object.keys(error.validationErrors).length > 0) {
            Object.entries(error.validationErrors).forEach(([field, messages]) => {
              const errorMsg = Array.isArray(messages) ? messages.join(', ') : messages
              setFieldError(field, errorMsg)
            })
          }
          
          toast.add({
            severity: 'error',
            summary: 'Validation Errors ❌',
            detail: error.message || 'Please check the highlighted fields and fix the errors.',
            life: 8000
          })
          return
      }
      
      // Handle validation errors (fallback)
      if (error.validationErrors && Object.keys(error.validationErrors).length > 0) {
        // Set field errors from server response
        Object.entries(error.validationErrors).forEach(([field, messages]) => {
          const errorMsg = Array.isArray(messages) ? messages.join(', ') : messages
          setFieldError(field, errorMsg)
        })
        
        toast.add({
          severity: 'error',
          summary: 'Validation Errors',
          detail: 'Please check the highlighted fields and fix the errors.',
          life: 6000
        })
        return
      }
      
      // Generic API error
      toast.add({
        severity: 'error',
        summary: 'Save Failed',
        detail: error.message || 'Failed to save event. Please try again.',
        life: 5000
      })
      return
    }
    
    // Handle legacy error format (direct HTTP errors)
    if (error.status === 422 && error.data?.errors) {
      // Set field errors from server response
      Object.entries(error.data.errors).forEach(([field, messages]) => {
        const errorMsg = Array.isArray(messages) ? messages.join(', ') : messages
        setFieldError(field, errorMsg)
      })
      
      toast.add({
        severity: 'error',
        summary: 'Validation Errors',
        detail: 'Please check the highlighted fields and fix the errors.',
        life: 6000
      })
      return
    }
    
    // Enhanced error handling with user-friendly messages
    let errorMessage = 'There was a problem saving your event. Please try again.'
    
    if (error.message?.includes('slug') || error.message?.includes('URL') || error.status === 422) {
      // Handle slug already taken error
      if (error.message?.includes('already') || error.message?.includes('taken') || 
          error.data?.errors?.event_slug?.includes('taken')) {
        setFieldError('event_slug', 'This URL is already taken')
        errorMessage = 'The event URL you chose is already in use. Please try a different one.'
      }
    } else if (error.message?.includes('Authentication')) {
      errorMessage = 'Your session has expired. Please login again to continue.'
    } else if (error.message?.includes('validation')) {
      errorMessage = 'Please check the highlighted fields and fix any errors.'
    } else if (error.message?.includes('CORS') || error.message?.includes('network')) {
      errorMessage = 'Connection problem. Please check your internet and try again.'
    } else if (error.message?.includes('413') || error.message?.includes('too large')) {
      errorMessage = 'Your images are too large. Please compress them and try again.'
    } else if (error.message) {
      // Try to make technical errors more user-friendly
      errorMessage = error.message
        .replace(/HTTP \d+/g, '')
        .replace(/API|server|endpoint/gi, 'system')
        .replace(/invalid/gi, 'incorrect')
        .replace(/error|exception/gi, 'problem')
        .trim()
    }
    
    toast.add({
      severity: 'error',
      summary: 'Save Failed',
      detail: errorMessage,
      life: 5000
    })
  } finally {
    isSubmitting.value = false
  }
}

// Handle update draft (for edit mode)
const handleUpdateDraft = async () => {
  await handleSaveDraft()
}

// Chair management functions
const openChairDialog = (chair = null, index = -1) => {
  editingChair.value = chair ? { ...chair } : null
  editingChairIndex.value = index
  showChairDialog.value = true
}

const ensureLocalKey = (chair) => {
  if (!chair.localKey) chair.localKey = generateUUID();
  return chair;
};

const handleChairSaved = (chairData) => {
  const isEdit = editingChairIndex.value >= 0;

  // Never invent an ID. Keep server ID if present, else null.
  const existing = isEdit ? formData.chairs[editingChairIndex.value] : null;

  // Keep a stable localKey for mapping (do NOT send to API)
  const localKey = existing?.localKey || generateUUID();

  // Helper function to check if an image was intentionally removed
  const imageWasRemoved = (chairData, existing) => {
    // If editing and both profile_image_url and avatar are explicitly null/empty
    // and no new file was uploaded, then image was intentionally removed
    const wasRemoved = isEdit && 
           chairData.profile_image_url === null && 
           (chairData.avatar === '' || chairData.avatar === null) &&
           !(chairData.profile_image instanceof File) &&
           (existing?.profile_image_url || existing?.avatar);
    
    if (wasRemoved) {
    }
    
    return wasRemoved;
  };

  const processed = {
    // server id – only if we really have one
    id: (chairData.id ?? existing?.id) ?? null,
    event_id: chairData.event_id ?? existing?.event_id ?? null,
    localKey,               // client-only, not sent to API
    name: chairData.name || existing?.name || '',
    position: chairData.position || existing?.position || '',
    company: chairData.company || existing?.company || '',
    sort_order: parseInt(chairData.sort_order ?? existing?.sort_order ?? 1) || 1,

    // Handle image logic properly for removal
    profile_image: chairData.profile_image instanceof File
      ? chairData.profile_image
      : null,
    profile_image_url: chairData.profile_image instanceof File
      ? null
      : imageWasRemoved(chairData, existing)
        ? null  // Image was intentionally removed
        : (chairData.profile_image_url ?? existing?.profile_image_url ?? null),

    // for preview only
    avatar: chairData.profile_image instanceof File && process.client
      ? URL.createObjectURL(chairData.profile_image)
      : imageWasRemoved(chairData, existing)
        ? null  // Image was intentionally removed
        : (chairData.avatar ?? existing?.avatar ?? chairData.profile_image_url ?? null),
  };

  if (isEdit) formData.chairs[editingChairIndex.value] = processed;
  else formData.chairs.push(processed);

  // Merge file map by localKey (not by id)
  const tab0 = tabsStore.getTabData(0) || {};
  const fileMap = (tab0.chairFileObjects instanceof Map) ? tab0.chairFileObjects : new Map();

  if (processed.profile_image instanceof File) {
    fileMap.set(localKey, processed.profile_image);
  } else if (imageWasRemoved(chairData, existing)) {
    // Remove from file map if image was intentionally removed
    fileMap.delete(localKey);
  }

  tabsStore.saveTabData(0, {
    ...formData,
    chairs: formData.chairs.map(c => ({ ...c, hasFileObject: undefined, fileObjectName: undefined })),
    chairFileObjects: fileMap,
  });
  tabsStore.markTabModified(0);

  showChairDialog.value = false;
  editingChair.value = null;
  editingChairIndex.value = -1;

  toast.add({
    severity: 'success',
    summary: isEdit ? 'Chair Updated' : 'Chair Added',
    detail: `${processed.name} has been ${isEdit ? 'updated' : 'added'} successfully.`,
    life: 3000
  });
};


const deleteChair = async (index) => {
  const chair = formData.chairs[index]
  
  // Show PrimeVue confirmation dialog
  confirm.require({
    message: `Are you sure you want to delete ${chair.name}? This action cannot be undone.`,
    header: 'Delete Chair',
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined',
    rejectLabel: 'Cancel',
    acceptLabel: 'Delete',
    accept: async () => {
      try {
        // If chair has an ID and we have an event ID, delete from server first
        if (chair.id && eventStore.currentEvent?.id) {

          
          await deleteChairAPI(eventStore.currentEvent.id, chair.id)
          
          toast.add({
            severity: 'success',
            summary: 'Chair Deleted',
            detail: `${chair.name} has been deleted from the server successfully.`,
            life: 3000
          })
        }
        
        // Remove from local array
        formData.chairs.splice(index, 1)
        
        // Save to tabs store
        tabsStore.saveTabData(0, { chairs: formData.chairs })
        tabsStore.markTabModified(0)
        
        // Show success message for local removal
        if (!chair.id) {
          toast.add({
            severity: 'success',
            summary: 'Chair Removed',
            detail: 'Chair has been removed successfully',
            life: 2000
          })
        }
      } catch (error) {
        console.error('❌ Error deleting chair:', error)
        
        toast.add({
          severity: 'error',
          summary: 'Delete Failed',
          detail: error.message || 'Failed to delete chair. Please try again.',
          life: 4000
        })
      }
    }
  })
}

// Get chair image source with proper handling - FIXED for profile_image_url
const getChairImageSrc = (chair) => {
  if (!chair) {
    return null;
  }

  try {
    // Helper function to check if URL is a placeholder/default image
    const isPlaceholderImage = (url) => {
      if (!url || typeof url !== 'string') return true;
      const trimmedUrl = url.trim();
      if (trimmedUrl === '') return true;
      
      const lowercaseUrl = trimmedUrl.toLowerCase();
      return lowercaseUrl === 'null' ||
             lowercaseUrl === 'undefined' ||
             lowercaseUrl.includes('default') || 
             lowercaseUrl.includes('placeholder') || 
             lowercaseUrl.includes('avatar.png') ||
             lowercaseUrl.includes('no-image') ||
             lowercaseUrl.includes('not-found') ||
             lowercaseUrl.includes('blank') ||
             lowercaseUrl.includes('empty');
    };

    // Priority 1: Avatar URL (pre-created object URL or existing image URL from API)
    // This is set during chair creation and when loading from API
    if (chair.avatar && typeof chair.avatar === 'string' && chair.avatar.trim() && !isPlaceholderImage(chair.avatar)) {
      return chair.avatar;
    }

    // Priority 2: profile_image_url from API (when avatar is not set)
    if (chair.profile_image_url && typeof chair.profile_image_url === 'string' && chair.profile_image_url.trim() && !isPlaceholderImage(chair.profile_image_url)) {
      return chair.profile_image_url.startsWith('http')
        ? chair.profile_image_url
        : `${window.location.origin}${chair.profile_image_url}`;
    }

    // Priority 3: File object (newly uploaded) - create object URL
    // This should only happen for new uploads before saving
    if (chair.profile_image instanceof File && process.client) {
      return URL.createObjectURL(chair.profile_image);
    }

    // Priority 4: Legacy photo field (fallback) - but exclude placeholders
    if (chair.photo && typeof chair.photo === 'string' && chair.photo.trim() && !isPlaceholderImage(chair.photo)) {
      return chair.photo.startsWith('http')
        ? chair.photo
        : `${window.location.origin}${chair.photo}`;
    }
    
    return null;
  } catch (error) {
    console.error('Error in getChairImageSrc:', error);
    return null;
  }
};

// Handle chair image load errors
const handleChairImageError = (event) => {
  event.target.style.display = 'none'
}

// Validate image file
const validateImageFile = (file, maxSize = 2) => {
  if (!file) return { isValid: false, error: 'No file provided' };

  // Check if it's a File object
  if (!(file instanceof File)) {
    return { isValid: false, error: 'Invalid file format' };
  }

  // Check file size (maxSize in MB)
  const maxSizeBytes = maxSize * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `Image size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds ${maxSize}MB limit`
    };
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return { isValid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
  }

  return { isValid: true };
};

// File upload handlers
const handleCoverImageUpload = (file) => {
  try {
    const validation = validateImageFile(file, 2); // 2MB limit
    if (!validation.isValid) {
      toast.add({
        severity: 'error',
        summary: 'Cover Image Error',
        detail: validation.error,
        life: 5000
      });
      return;
    }

    formData.coverImageFile = file;
    clearFieldError('cover_image');
    tabsStore.markTabModified(0);

    // Save to tabs store immediately
    tabsStore.saveTabData(0, {
      ...formData,
      lastSaved: new Date().toISOString(),
      hasUnsavedChanges: true
    });

    toast.add({
      severity: 'success',
      summary: 'Cover Image Added',
      detail: `Image size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      life: 3000
    });
  } catch (error) {
    console.error('Error handling cover image:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to process cover image. Please try again.',
      life: 4000
    });
  }
}

const handleCoverImageRemoved = () => {
  formData.coverImageFile = null;
  tabsStore.markTabModified(0);
  
  // Save to tabs store immediately
  tabsStore.saveTabData(0, {
    ...formData,
    lastSaved: new Date().toISOString(),
    hasUnsavedChanges: true
  });

  toast.add({
    severity: 'info',
    summary: 'Cover Image Removed',
    detail: 'Cover image has been removed',
    life: 3000
  });
}

const handleEventBackgroundUpload = (file) => {
  try {
    const validation = validateImageFile(file, 2); // 2MB limit
    if (!validation.isValid) {
      toast.add({
        severity: 'error',
        summary: 'Background Image Error',
        detail: validation.error,
        life: 5000
      });
      return;
    }

    formData.eventBackgroundFile = file;
    tabsStore.markTabModified(0);
    
    // Save to tabs store immediately
    tabsStore.saveTabData(0, {
      ...formData,
      lastSaved: new Date().toISOString(),
      hasUnsavedChanges: true
    });

    toast.add({
      severity: 'success',
      summary: 'Background Image Added',
      detail: `Image size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      life: 3000
    });
  } catch (error) {
    console.error('Error handling background image:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to process background image. Please try again.',
      life: 4000
    });
  }
}

const handleCardBackgroundUpload = (file) => {
  try {
    const validation = validateImageFile(file, 2); // 2MB limit
    if (!validation.isValid) {
      toast.add({
        severity: 'error',
        summary: 'Card Background Error',
        detail: validation.error,
        life: 5000
      });
      return;
    }

    formData.cardBackgroundFile = file;
    tabsStore.markTabModified(0);
    
    // Save to tabs store immediately
    tabsStore.saveTabData(0, {
      ...formData,
      lastSaved: new Date().toISOString(),
      hasUnsavedChanges: true
    });

    toast.add({
      severity: 'success',
      summary: 'Card Background Added',
      detail: `Image size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      life: 3000
    });
  } catch (error) {
    console.error('Error handling card background:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to process card background image. Please try again.',
      life: 4000
    });
  }
}

// Get cover image URL for display
const getCoverImageUrl = () => {
  // Priority 1: New uploaded file
  if (formData.coverImageFile instanceof File) {
    return URL.createObjectURL(formData.coverImageFile)
  }
  
  // Priority 2: Existing image from event data
  if (eventStore.currentEvent?.cover_image_url) {
    return eventStore.currentEvent.cover_image_url
  }
  
  return null
}

// Slug validation methods
const validateSlug = () => {
  try {
    // Clear any existing error first
    clearFieldError('event_slug')
    
    // If slug is empty, return false
    if (!formData.eventSlug) {
      setFieldError('event_slug', 'Event URL is required')
      return false
    }
    
    // Remove invalid characters and convert to lowercase
    formData.eventSlug = formData.eventSlug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '')

    // If slug is empty after cleaning, return false
    if (!formData.eventSlug) {
      setFieldError('event_slug', 'Event URL must contain letters, numbers, or hyphens')
      return false
    }

    return true
  } catch (error) {
    console.error('Error in validateSlug:', error)
    setFieldError('event_slug', 'Error validating URL format')
    return false
  }
}

const generateSlug = () => {
  try {
    let newSlug = ''
    
    if (formData.eventName && formData.eventName.trim()) {
      newSlug = formData.eventName
        .toLowerCase()
        .trim()
        // Replace spaces and special characters with hyphens
        .replace(/\s+/g, '-')
        // Remove non-ASCII characters (including Khmer) and keep only letters, numbers, hyphens
        .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
        .replace(/[^a-z0-9-]/g, '')
        .replace(/--+/g, '-')
        .replace(/^-|-$/g, '')
    }
    
    // If the event name only contains non-ASCII characters (like Khmer), generate a random slug
    if (!newSlug || newSlug.length === 0) {
      const adjectives = ['awesome', 'amazing', 'fantastic', 'incredible', 'spectacular', 'wonderful']
      const nouns = ['event', 'conference', 'summit', 'meetup', 'workshop', 'seminar']
      const numbers = Math.floor(Math.random() * 999) + 1
      const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
      const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]
      newSlug = `${randomAdjective}-${randomNoun}-${numbers}`
      
      toast.add({ 
        severity: 'info', 
        summary: 'Slug Generated', 
        detail: 'Generated random slug (original name contains special characters)', 
        life: 3000 
      })
    } else {
      toast.add({ 
        severity: 'success', 
        summary: 'Slug Generated', 
        detail: 'Slug generated from event name!', 
        life: 3000 
      })
    }
    
    formData.eventSlug = newSlug
  } catch (error) {
    console.error('Error generating slug:', error)
    toast.add({ 
      severity: 'error', 
      summary: 'Slug Generation Failed', 
      detail: 'Could not generate slug. Please enter manually.', 
      life: 4000 
    })
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

// Watch for form changes to mark tab as modified and save changes
watch(formData, () => {
  tabsStore.markTabModified(0)
  
  // Save current form data to tabs store immediately
  tabsStore.saveTabData(0, {
    ...formData,
    eventId: eventId.value,
    lastSaved: new Date().toISOString(),
    hasUnsavedChanges: true
  })
}, { deep: true })

// Watch for event name changes to suggest slug with debouncing
let slugGenerationTimeout = null
let lastProcessedName = ''

watch(() => formData.eventName, (newName) => {
  // Clear previous timeout
  if (slugGenerationTimeout) {
    clearTimeout(slugGenerationTimeout)
  }
  
  // Only generate slug if:
  // 1. Event name exists and has changed significantly
  // 2. Slug field is empty (user hasn't manually entered one)
  // 3. It's different from the last processed name
  if (newName && 
      newName.trim() !== lastProcessedName && 
      (!formData.eventSlug || formData.eventSlug.trim() === '')) {
    
    // Debounce the slug generation to avoid multiple triggers
    slugGenerationTimeout = setTimeout(() => {
      lastProcessedName = newName.trim()
      generateSlug()
    }, 800) // Wait 800ms after user stops typing
  }
})

// Cleanup on unmount
onBeforeUnmount(() => {
  window.removeEventListener('saveDraft', handleSaveDraft)
  window.removeEventListener('saveCurrentTab', handleSaveCurrentTab)
})
</script>

<style scoped>

:deep(.p-calendar .p-inputtext) {
  background: transparent !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

:deep(.p-calendar .p-inputtext:focus) {
  outline: none !important;
  box-shadow: none !important;
  border: none !important;
}

</style>