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
                v-model="eventName"
                @blur="() => { try { validateField('name', eventName, 'required') } catch(e) { console.error('Validation error:', e) } }"
                @input="() => { try { clearFieldError('name') } catch(e) { console.error('Clear error:', e) } }"
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
                v-model="category"
                :options="categories"
                optionLabel="label"
                optionValue="value"
                @change="() => { try { clearFieldError('category_id') } catch(e) { console.error('Clear error:', e) } }"
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
            <Textarea
              v-model="description"
              @blur="() => { try { validateField('description', description, 'required') } catch(e) { console.error('Validation error:', e) } }"
              @input="() => { try { clearFieldError('description') } catch(e) { console.error('Clear error:', e) } }"
              :class="[
                'w-full p-2 mt-1 bg-gray-100 rounded-2xl',
                getFieldError('description') ? 'border-red-500 border-2' : ''
              ]"
              placeholder="Describe your event..."
              rows="4"
            />
            <small v-if="getFieldError('description')" class="text-red-500">{{ getFieldError('description') }}</small>
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
                v-model="startDate"
                @date-select="() => { try { clearFieldError('start_date') } catch(e) { console.error('Clear error:', e) } }"
                :class="[
                  'w-full p-3 mt-1 bg-gray-100 rounded-2xl',
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
                v-model="endDate"
                showIcon
                placeholder="31/07/2025 17:00"
                iconDisplay="input"
                @date-select="() => { try { clearFieldError('end_date') } catch(e) { console.error('Clear error:', e) } }"
                :class="[
                  'w-full p-3 mt-1 bg-gray-100 rounded-2xl',
                  getFieldError('end_date') ? 'border-red-500 border-2' : ''
                ]"
                dateFormat="dd/mm/yy"
                showTime
                hourFormat="24"
              />
              <small v-if="getFieldError('end_date')" class="text-red-500">{{ getFieldError('end_date') }}</small>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Location <span class="text-red-500">*</span></label>
              <InputText
                v-model="location"
                @blur="() => { try { validateField('location', location, 'required') } catch(e) { console.error('Validation error:', e) } }"
                @input="() => { try { clearFieldError('location') } catch(e) { console.error('Clear error:', e) } }"
                :class="[
                  'w-full p-3 mt-1 bg-gray-100 rounded-2xl',
                  getFieldError('location') ? 'border-red-500 border-2' : ''
                ]"
                placeholder="Enter location"
              />
              <small v-if="getFieldError('location')" class="text-red-500">{{ getFieldError('location') }}</small>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Map URL</label>
              <InputText
                v-model="mapUrl"
                @blur="() => { try { validateField('map_url', mapUrl, 'url') } catch(e) { console.error('Validation error:', e) } }"
                @input="() => { try { clearFieldError('map_url') } catch(e) { console.error('Clear error:', e) } }"
                :class="[
                  'w-full p-3 mt-1 bg-gray-100 rounded-2xl',
                  getFieldError('map_url') ? 'border-red-500 border-2' : ''
                ]"
                placeholder="Enter map URL"
              />
              <small v-if="getFieldError('map_url')" class="text-red-500">{{ getFieldError('map_url') }}</small>
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
                Event Slug <span class="text-red-500">*</span></label>
              <div class="flex gap-4 ">
                <InputText
                  v-model="eventSlug"
                  @blur="() => { try { validateField('event_slug', eventSlug, 'required') } catch(e) { console.error('Validation error:', e) } }"
                  @input="() => { try { validateSlug() } catch(e) { console.error('Slug validation error:', e) } }"
                  :class="[
                    'w-full p-3 h-12 rounded-2xl bg-gray-100 border-gray-200 focus:border-purple-400 focus:ring-purple-400',
                    getFieldError('event_slug') ? 'border-red-500 border-2' : ''
                  ]"
                  placeholder="my-awesome-event"
                />
                <Button icon="pi pi-refresh" text rounded size="small" class=" bg-gray-100 rounded-2xl h-12 w-20 transform -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors duration-200" @click="generateSlug" title="Generate new slug" />
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
            Link (Zoom, Google Meet, etc.) <span class="text-red-500">*</span></label>
          <InputText
            v-model="onlineLinkMeeting"
            @blur="() => { try { validateField('online_link_meeting', onlineLinkMeeting, 'required'); if (onlineLinkMeeting) validateField('online_link_meeting', onlineLinkMeeting, 'url') } catch(e) { console.error('Validation error:', e) } }"
            @input="() => { try { clearFieldError('online_link_meeting') } catch(e) { console.error('Clear error:', e) } }"
            :class="[
              'w-full p-3 h-12 rounded-2xl bg-gray-100 border-gray-200 focus:border-purple-400 focus:ring-purple-400',
              getFieldError('online_link_meeting') ? 'border-red-500 border-2' : ''
            ]"
            placeholder="paste link here"
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
                    <Button icon="pi pi-pencil" text rounded size="small" class="action-btn edit-btn" @click="editChair(slotProps.data)" title="Edit Chair" />
                    <span class="text-gray-300">|</span>
                    <Button icon="pi pi-trash" text rounded size="small" class="action-btn delete-btn" @click="deleteChair(slotProps.data)" title="Delete Chair" />
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

      <!-- Chair Form Dialog -->
      <ChairForm
        :visible="showChairDialog"
        @update:visible="showChairDialog = $event"
        :chair="selectedChair"
        :is-edit="isEditingChair"
        @save="handleChairSave"
      />

      <!-- <section class="Member mt-10">
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center gap-3">
            <div class="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
            <Icon name="heroicons:user-group" class="text-sm text-white" />
          </div>
            <h2 class="text-lg font-semibold text-purple-700">Member</h2>
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
                    <Button icon="pi pi-trash" text rounded size="small" class="action-btn delete-btn" @click="deleteChair(slotProps.data)" title="Delete Chair" />
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
      </section> -->

      <div class="border border-gray-200 my-5"></div>

      <section class="cover">
        <UploadPhoto
          label="Cover Image (Required)"
          :multiple="false"
          @file-selected="coverImageFile = $event"
          @file-removed="coverImageFile = null"
        />
      </section>
      <section class="event-bg mt-10">
        <UploadPhoto
          label="Event Background (Optional)"
          :multiple="false"
          @file-selected="eventBackgroundFile = $event"
          @file-removed="eventBackgroundFile = null"
        />
      </section>
      <section class="card-bg mt-10">
        <UploadPhoto
          label="Card Background (Optional)"
          :multiple="false"
          @file-selected="cardBackgroundFile = $event"
          @file-removed="cardBackgroundFile = null"
        />
      </section>

      <!-- Update Button for Draft Mode -->
      <div v-if="isUpdateMode" class="mt-8 pt-6 border-t border-gray-200">
        <div class="flex justify-center">
          <Button
            @click="handleUpdateDraft"
            :disabled="loading"
            :class="[
              'px-8 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-3',
              loading
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
            ]"
          >
            <Icon v-if="loading" name="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
            <Icon v-else name="heroicons:pencil-square" class="w-5 h-5" />
            {{ loading ? 'Updating...' : 'Update Draft' }}
          </Button>
        </div>
        <p class="text-center text-sm text-gray-500 mt-2">
          Update your event information and save as draft
        </p>
      </div>

      <!-- Note: Save and Publish buttons are now in the main Create Event page header -->
    </div>
  </div>
</template>

<script setup>
import './css/style.css'
import { ref, computed, onMounted, onUnmounted, watch, inject } from "vue";
// Icon is auto-imported by Nuxt
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
import UploadPhoto from '~/components/common/UploadPhoto.vue'
import ChairForm from '~/components/common/ChairForm.vue'
import { createEvent, updateEvent, getEventDetails } from '@/composables/api'
import { useFormValidation } from '~/composables/useFormValidation'

const toast = useToast()
const router = useRouter()

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

// Inject event creation state from parent
const eventCreationState = inject('eventCreationState')

const loading = ref(false)

// Form Data - Initialize with empty values
const eventName = ref("")
const category = ref(null)
const description = ref("")
const startDate = ref(null)
const endDate = ref(null)
const location = ref("")
const mapUrl = ref("")
const company = ref("")
const organizer = ref("")
const onlineLinkMeeting = ref('')
const eventSlug = ref('')

// File uploads and publish status
const isPublished = ref(false)
const coverImageFile = ref(null)
const eventBackgroundFile = ref(null)
const cardBackgroundFile = ref(null)

// Track if we're in update mode
const isUpdateMode = ref(false)
const currentEventId = ref(null)

// Load existing event data if available
onMounted(async () => {
  if (eventCreationState?.eventId?.value) {
    currentEventId.value = eventCreationState.eventId.value
    isUpdateMode.value = true
    
    try {
      console.log('📋 Loading existing event data for editing:', currentEventId.value)
      const response = await getEventDetails(currentEventId.value)
      
      if (response && response.data) {
        const eventData = response.data
        
        // Populate form fields with existing data
        eventName.value = eventData.name || ''
        category.value = eventData.category_id || null
        description.value = eventData.description || ''
        location.value = eventData.location || ''
        mapUrl.value = eventData.map_url || ''
        company.value = eventData.company || ''
        organizer.value = eventData.organizer || ''
        eventSlug.value = eventData.event_slug || ''
        onlineLinkMeeting.value = eventData.online_link_meeting || ''
        
        // Load chairs data if available
        if (eventData.chairs && Array.isArray(eventData.chairs)) {
          chairs.value = eventData.chairs.map(chair => ({
            id: chair.id || Date.now() + Math.random(),
            name: chair.name || '',
            position: chair.position || '',
            company: chair.company || '',
            sort_order: chair.sort_order || 1,
            avatar: chair.profile_image || '',
            profile_image: chair.profile_image || null
          }));
        }
        isPublished.value = eventData.is_published === 1 || eventData.is_published === '1'
        
        // Parse dates
        if (eventData.start_date) {
          startDate.value = new Date(eventData.start_date)
        }
        if (eventData.end_date) {
          endDate.value = new Date(eventData.end_date)
        }
        
        console.log('✅ Event data loaded for editing')
      }
    } catch (error) {
      console.error('❌ Failed to load event data:', error)
      toast.add({
        severity: 'error',
        summary: 'Load Failed',
        detail: 'Failed to load event data for editing',
        life: 3000
      })
    }
  }
})

// Event listeners for parent component actions
const handleSaveDraft = () => {
  isPublished.value = false
  submitEvent()
}

const handlePublishEvent = () => {
  isPublished.value = true
  submitEvent()
}

// Handle update draft button click
const handleUpdateDraft = () => {
  isPublished.value = false
  submitEvent()
}

// Add event listeners when component mounts
onMounted(() => {
  window.addEventListener('saveDraft', handleSaveDraft)
  window.addEventListener('publishEvent', handlePublishEvent)
})

// Remove event listeners when component unmounts
onUnmounted(() => {
  window.removeEventListener('saveDraft', handleSaveDraft)
  window.removeEventListener('publishEvent', handlePublishEvent)
})

// Category Options (updated with value for category_id)
const categories = ref([
  { label: "Conference", value: 1 },
  { label: "Workshop", value: 2 },
  { label: "Seminar", value: 3 },
  { label: "Networking", value: 4 },
])

const member = ref(null);
const members = ref(['Kim', 'ly', 'meng']) // Kept from original, not part of event creation form

// Computed URL based on slug
const generatedUrl = computed(() => {
  return `https://eticket.asia/e/${eventSlug.value}`
})

// Methods
const validateSlug = () => {
  try {
    // Clear any existing error first
    clearFieldError('event_slug')
    
    // Remove invalid characters and convert to lowercase
    eventSlug.value = eventSlug.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '')
  } catch (error) {
    console.error('Error in validateSlug:', error)
  }
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

// Helper to format date for API (match Postman format exactly)
const formatDateForApi = (date, isEndDate = false) => {
  if (!date) return null;
  const d = new Date(date);

  // If it's an end date and no time is set, set it to end of day
  if (isEndDate && d.getHours() === 0 && d.getMinutes() === 0) {
    d.setHours(17, 0, 0, 0); // Default to 5 PM like Postman
  }
  // If it's a start date and no time is set, set it to start of day
  else if (!isEndDate && d.getHours() === 0 && d.getMinutes() === 0) {
    d.setHours(9, 0, 0, 0); // Default to 9 AM like Postman
  }

  // Return format exactly like Postman: "2025-10-01 09:00:00"
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// Submit Event Function - SUPPORTS BOTH CREATE AND UPDATE
const submitEvent = async () => {
  loading.value = true;
  try {
    // Clear previous errors
    clearErrors()
    
    // Comprehensive validation using the validation composable
    const eventDataToValidate = {
      name: eventName.value,
      category_id: category.value,
      description: description.value,
      start_date: startDate.value,
      end_date: endDate.value,
      location: location.value,
      event_slug: eventSlug.value,
      map_url: mapUrl.value,
      online_link_meeting: onlineLinkMeeting.value
    }
    
    const validationErrors = validateBasicInfo(eventDataToValidate)
    
    // Check for validation errors
    if (Object.keys(validationErrors).length > 0) {
      // Set field errors
      Object.entries(validationErrors).forEach(([field, error]) => {
        setFieldError(field, error)
      })
      
      toast.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fix the highlighted errors before saving.',
        life: 4000
      });
      loading.value = false;
      return;
    }
    
    // Additional date range validation
    if (startDate.value && endDate.value) {
      const dateError = validateDateRange(startDate.value, endDate.value)
      if (dateError) {
        setFieldError('date_range', dateError)
        toast.add({
          severity: 'error',
          summary: 'Date Error',
          detail: dateError,
          life: 3000
        });
        loading.value = false;
        return;
      }
    }

    // Cover Image is REQUIRED for new events, optional for updates
    if (!isUpdateMode.value && !coverImageFile.value) {
      toast.add({
        severity: 'error',
        summary: 'Cover Image Required',
        detail: 'Please upload a cover image. This field is required for event creation.',
        life: 5000
      });
      return;
    }

    // Prepare event data object
    const eventData = {
      name: eventName.value,
      category_id: category.value,
      description: description.value,
      start_date: formatDateForApi(startDate.value, false),
      end_date: formatDateForApi(endDate.value, true),
      location: location.value,
      event_slug: eventSlug.value,
      is_published: isPublished.value ? '1' : '0'
    };

    // Add optional fields
    eventData.map_url = mapUrl.value ? mapUrl.value.trim() : '';
    eventData.company = company.value ? company.value.trim() : '';
    eventData.organizer = organizer.value ? organizer.value.trim() : '';

    // Add online_link_meeting - required field
    eventData.online_link_meeting = onlineLinkMeeting.value ? onlineLinkMeeting.value.trim() : '';
    
    // Add chairs array if any chairs exist - ALWAYS include chairs array
    eventData.chairs = chairs.value && chairs.value.length > 0
      ? chairs.value.map(chair => {
          // Validate chair data
          if (!chair.name || !chair.position || !chair.company) {
            throw new Error(`Chair validation failed: All chairs must have name, position, and company filled.`)
          }
          
          return {
            name: chair.name.trim(),
            position: chair.position.trim(),
            company: chair.company.trim(),
            sort_order: chair.sort_order || 1,
            profile_image: chair.profile_image || null
          }
        })
      : [];
    
    // Debug logging for chairs
    console.log('🪑 Chairs data being sent:', {
      chairsCount: chairs.value?.length || 0,
      chairsData: eventData.chairs
    });

    // Add file uploads ONLY if they exist
    if (coverImageFile.value && coverImageFile.value instanceof File) {
      eventData.cover_image = coverImageFile.value;
    }
    if (eventBackgroundFile.value && eventBackgroundFile.value instanceof File) {
      eventData.event_background = eventBackgroundFile.value;
    }
    if (cardBackgroundFile.value && cardBackgroundFile.value instanceof File) {
      eventData.card_background = cardBackgroundFile.value;
    }

    // Debug logging
    console.log('📋 Event data being sent:', eventData);
    console.log('🔄 Update mode:', isUpdateMode.value);
    console.log('🆔 Current event ID:', currentEventId.value);

    let result;
    
    if (isUpdateMode.value && currentEventId.value) {
      // UPDATE existing event
      console.log('📝 Updating existing event...');
      result = await updateEvent(currentEventId.value, eventData);
    } else {
      // CREATE new event
      console.log('🆕 Creating new event...');
      result = await createEvent(eventData);
    }

    console.log('✅ Event operation result:', result);

    // Handle the normalized API response
    if (result && result.success) {
      const responseEventData = result.data;
      const eventId = responseEventData?.id;

      // Update parent state
      if (eventCreationState && eventCreationState.setBasicInfoCompleted) {
        eventCreationState.setBasicInfoCompleted(true, eventId, responseEventData);
      }

      // Update local state for future updates
      if (!isUpdateMode.value && eventId) {
        isUpdateMode.value = true;
        currentEventId.value = eventId;
      }

      const actionText = isPublished.value ? 'Published' : 'Saved as Draft';
      const operationText = isUpdateMode.value ? 'Updated' : 'Created';
      
      toast.add({
        severity: 'success',
        summary: `Event ${operationText} Successfully! 🎉`,
        detail: `${result.message} - ${actionText}`,
        life: 5000
      });

      console.log(`🎉 Event ${operationText.toLowerCase()} successfully:`, responseEventData);

      // Store the event ID for ticket creation and persistence
      if (eventId) {
        localStorage.setItem('currentEventId', eventId.toString());
        localStorage.setItem('currentEventName', responseEventData?.name || eventName.value || 'Unnamed Event');
        console.log('✅ Event ID ready for ticket creation:', eventId);
      }

    } else {
      // Handle failed operation
      const errorMessage = result?.message || `Failed to ${isUpdateMode.value ? 'update' : 'create'} event`;
      
      // Show detailed validation errors if available
      if (result?.validationErrors && Object.keys(result.validationErrors).length > 0) {
        console.error('🚨 Server validation errors:', result.validationErrors);
        
        // Set field errors from server response
        Object.entries(result.validationErrors).forEach(([field, messages]) => {
          const errorMsg = Array.isArray(messages) ? messages.join(', ') : messages;
          setFieldError(field, errorMsg);
        });
        
        toast.add({
          severity: 'error',
          summary: 'Validation Errors from Server',
          detail: 'Please check the highlighted fields and fix the errors.',
          life: 6000
        });
      } else {
        toast.add({
          severity: 'error',
          summary: `Event ${isUpdateMode.value ? 'Update' : 'Creation'} Failed`,
          detail: errorMessage,
          life: 5000
        });
      }
      
      console.error(`❌ Event ${isUpdateMode.value ? 'update' : 'creation'} failed:`, result);
    }
  } catch (error) {
    console.error(`Event ${isUpdateMode.value ? 'update' : 'creation'} error:`, error);
    
    // Handle different types of errors
    let errorMessage = `Failed to ${isUpdateMode.value ? 'update' : 'create'} event`;
    let errorSummary = 'Network Error';
    
    if (error.message) {
      errorMessage = error.message;
      
      // Customize error summary based on error type
      if (error.message.includes('Authentication')) {
        errorSummary = 'Authentication Error';
      } else if (error.message.includes('Validation')) {
        errorSummary = 'Validation Error';
      } else if (error.message.includes('Permission')) {
        errorSummary = 'Permission Error';
      }
    }
    
    toast.add({ 
      severity: 'error', 
      summary: errorSummary, 
      detail: errorMessage, 
      life: 5000 
    });
  } finally {
    loading.value = false;
  }
};

// Chair management
const chairs = ref([])
const showChairDialog = ref(false)
const selectedChair = ref(null)
const isEditingChair = ref(false)

// Methods for chair management
const addChair = () => {
  try {
    console.log('🪑 Adding new chair')
    selectedChair.value = null
    isEditingChair.value = false
    showChairDialog.value = true
    console.log('✅ Add chair dialog opened')
  } catch (error) {
    console.error('❌ Error opening add chair dialog:', error)
    toast.add({
      severity: 'error',
      summary: 'Add Failed',
      detail: 'Unable to open add dialog. Please try again.',
      life: 3000
    })
  }
}

const editChair = (chair) => {
  try {
    console.log('🪑 Editing chair:', chair)
    
    // Ensure we have valid chair data
    if (!chair || typeof chair !== 'object') {
      console.error('❌ Invalid chair data for editing:', chair)
      toast.add({
        severity: 'error',
        summary: 'Edit Failed',
        detail: 'Invalid chair data. Please try again.',
        life: 3000
      })
      return
    }
    
    // Create a clean copy of chair data
    selectedChair.value = {
      id: chair.id || null,
      name: chair.name || '',
      position: chair.position || '',
      company: chair.company || '',
      sort_order: chair.sort_order || 1,
      profile_image: chair.profile_image || null,
      avatar: chair.avatar || ''
    }
    
    isEditingChair.value = true
    showChairDialog.value = true
    
    console.log('✅ Chair edit dialog opened for:', chair.name)
  } catch (error) {
    console.error('❌ Error opening chair edit dialog:', error)
    toast.add({
      severity: 'error',
      summary: 'Edit Failed',
      detail: 'Unable to open edit dialog. Please try again.',
      life: 3000
    })
  }
}

const deleteChair = (chair) => {
  try {
    console.log('🗑️ Deleting chair:', chair.name)
    
    const index = chairs.value.findIndex(c => c.id === chair.id)
    if (index > -1) {
      chairs.value.splice(index, 1)
      console.log('✅ Chair deleted successfully:', chair.name)
      toast.add({
        severity: 'success',
        summary: 'Chair Deleted',
        detail: `${chair.name} has been removed successfully.`,
        life: 3000
      })
    } else {
      console.error('❌ Chair not found for deletion:', chair.id)
      toast.add({
        severity: 'error',
        summary: 'Delete Failed',
        detail: 'Chair not found. Please refresh and try again.',
        life: 3000
      })
    }
  } catch (error) {
    console.error('❌ Error deleting chair:', error)
    toast.add({
      severity: 'error',
      summary: 'Delete Failed',
      detail: 'Unable to delete chair. Please try again.',
      life: 4000
    })
  }
}

const handleChairSave = (chairData) => {
  try {
    console.log('🪑 Saving chair data:', chairData)
    
    // Ensure avatar is properly set for display in the profile column
    const processedChairData = { ...chairData }
    
    // If there's a profile_image file but no avatar URL, create one
    if (processedChairData.profile_image &&
        typeof processedChairData.profile_image === 'object' &&
        processedChairData.profile_image.constructor &&
        processedChairData.profile_image.constructor.name === 'File' &&
        !processedChairData.avatar) {
      try {
        processedChairData.avatar = URL.createObjectURL(processedChairData.profile_image)
        console.log('🖼️ Created avatar URL for profile display:', processedChairData.avatar)
      } catch (error) {
        console.error('❌ Error creating avatar URL:', error)
      }
    }
    
    if (isEditingChair.value) {
      // Update existing chair
      const index = chairs.value.findIndex(c => c.id === chairData.id)
      if (index > -1) {
        chairs.value[index] = processedChairData
        console.log('✅ Chair updated successfully:', chairData.name)
        toast.add({
          severity: 'success',
          summary: 'Chair Updated',
          detail: `${chairData.name} has been updated successfully.`,
          life: 3000
        })
      } else {
        console.error('❌ Chair not found for update:', chairData.id)
        toast.add({
          severity: 'error',
          summary: 'Update Failed',
          detail: 'Chair not found. Please try again.',
          life: 3000
        })
      }
    } else {
      // Add new chair with proper avatar display
      chairs.value.push(processedChairData)
      console.log('✅ Chair added successfully with avatar:', {
        name: chairData.name,
        hasAvatar: !!processedChairData.avatar,
        hasProfileImage: !!processedChairData.profile_image
      })
      toast.add({
        severity: 'success',
        summary: 'Chair Added',
        detail: `${chairData.name} has been added successfully.`,
        life: 3000
      })
    }
    
    showChairDialog.value = false
  } catch (error) {
    console.error('❌ Error handling chair save:', error)
    toast.add({
      severity: 'error',
      summary: 'Save Failed',
      detail: 'Unable to save chair information. Please try again.',
      life: 4000
    })
  }
}

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