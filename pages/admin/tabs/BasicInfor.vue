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
            <Textarea
              v-model="formData.description"
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
                v-model="formData.startDate"
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
              <div class="flex gap-4 ">
                <InputText
                  v-model="formData.eventSlug"
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
  </div>
</template>

<script setup>
import './css/style.css'
import { ref, reactive, computed, onMounted, onBeforeUnmount, inject, watch, nextTick } from 'vue'
import { useEventStore } from '~/composables/useEventStore'
import { useEventTabsStore } from '~/composables/useEventTabs'
import { fetchCategories } from '~/composables/api'
import { useAuth } from '~/composables/useAuth'

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

// Import custom components
import ChairForm from '~/components/common/ChairForm.vue'
import UploadPhoto from '~/components/common/UploadPhoto.vue'

const eventStore = useEventStore()
const tabsStore = useEventTabsStore()
const { getToken } = useAuth()



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

// Enhanced data loading with comprehensive source checking and File object restoration
const loadExistingData = async () => {
  if (isLoadingData.value) return
  
  isLoadingData.value = true
  
  try {
    // Priority 1: Check tabs store for saved data
    const tabData = tabsStore.getTabData(0) // Basic Info tab
    
    if (tabData && Object.keys(tabData).length > 0 && tabData.eventName) {
      console.log('📋 Loading data from tabs store:', {
        hasChairs: !!tabData.chairs,
        chairCount: tabData.chairs?.length || 0,
        hasFileObjects: !!tabData.chairFileObjects
      })
      
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
      
      // CRITICAL FIX: Enhanced File object restoration system
      if (tabData.chairFileObjects && Array.isArray(tabData.chairFileObjects)) {
        console.log('🪑 Restoring File objects for chairs:', {
          fileObjectsCount: tabData.chairFileObjects.length,
          chairsCount: formData.chairs.length,
          fileDetails: tabData.chairFileObjects.map(f => ({
            name: f.name,
            hasFile: f.fileObject instanceof File,
            fileName: f.fileObject?.name
          }))
        })
        
        tabData.chairFileObjects.forEach(fileData => {
          // Try multiple matching strategies
          let chairIndex = -1
          
          // Strategy 1: Match by name
          chairIndex = formData.chairs.findIndex(c => c.name === fileData.name)
          
          // Strategy 2: Match by index if name match fails
          if (chairIndex === -1 && typeof fileData.index === 'number') {
            chairIndex = fileData.index
          }
          
          // Strategy 3: Match by chairId if available
          if (chairIndex === -1 && fileData.chairId) {
            chairIndex = formData.chairs.findIndex(c => c.id === fileData.chairId)
          }
          
          if (chairIndex >= 0 && chairIndex < formData.chairs.length && fileData.fileObject instanceof File) {
            // CRITICAL: Restore both File object and display URL
            formData.chairs[chairIndex].profile_image = fileData.fileObject
            formData.chairs[chairIndex].avatar = URL.createObjectURL(fileData.fileObject)
            
            // Mark as having a File object for tracking
            formData.chairs[chairIndex]._hasFileObject = true
            formData.chairs[chairIndex]._fileRestored = true
            
            console.log(`✅ Restored File object for chair ${chairIndex + 1}: ${fileData.name} (${fileData.fileObject.name})`)
          } else {
            console.warn(`⚠️ Could not restore File object for chair: ${fileData.name}`, {
              chairIndex,
              chairExists: chairIndex >= 0 && chairIndex < formData.chairs.length,
              isFile: fileData.fileObject instanceof File
            })
          }
        })
        
        console.log('🪑 File restoration complete:', {
          totalChairs: formData.chairs.length,
          chairsWithRestoredFiles: formData.chairs.filter(c => c._fileRestored).length
        })
      }
      
      return
    }
    
    // Priority 2: Check event store for current event
    if (eventStore.currentEvent && eventStore.currentEvent.id) {
      
      const event = eventStore.currentEvent
      Object.assign(formData, {
        eventName: event.name || '',
        category: event.category_id || null,
        description: event.description || '',
        startDate: event.start_date ? new Date(event.start_date) : null,
        endDate: event.end_date ? new Date(event.end_date) : null,
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
            startDate: event.start_date ? new Date(event.start_date) : null,
            endDate: event.end_date ? new Date(event.end_date) : null,
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
    console.error('Data loading error:', error)
    toast.warn('Data Loading Issue', 'Some data may not have loaded properly. Please check your inputs.')
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
      console.warn('Categories API response structure changed, using defaults')
      // Don't show toast for fallback categories in production
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
    console.error('Failed to load categories:', error)
    // Only show error toast for critical category loading failures
    toast.error('Categories Unavailable', 'Using default event categories')
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
      const fieldNames = missingFields.map(({ label }) => label).join(', ')
      toast.warn('Missing Required Fields', `Please fill in: ${fieldNames}`)
      return
    }
    
    // Validate dates
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      toast.warn('Invalid Date Range', 'End date must be after start date')
      return
    }
    
    // Validate URLs if provided
    const urlRegex = /^https?:\/\/.+/
    if (formData.mapUrl && !urlRegex.test(formData.mapUrl)) {
      toast.warn('Invalid Map URL', 'Map URL must start with http:// or https://')
      return
    }
    
    if (formData.onlineLinkMeeting && !urlRegex.test(formData.onlineLinkMeeting)) {
      toast.warn('Invalid Meeting URL', 'Online meeting URL must start with http:// or https://')
      return
    }
    
    // Check for cover image requirement
    if (!formData.coverImageFile && !getCoverImageUrl()) {
      setFieldError('cover_image', 'Cover image is required')
      toast.warn('Cover Image Required', 'Please upload a cover image for your event')
      return
    }
    
    // CRITICAL FIX: Enhanced data preparation with File object preservation
    console.log('💾 Preparing event data for save - BEFORE processing:', {
      chairsCount: formData.chairs.length,
      chairsWithFiles: formData.chairs.filter(c => c.profile_image instanceof File).length,
      chairsWithUrls: formData.chairs.filter(c => c.profile_image_url).length,
      chairsWithRestoredFiles: formData.chairs.filter(c => c._fileRestored).length
    })
    
    // Get File objects from tabs store as backup
    const tabData = tabsStore.getTabData(0)
    const chairFileObjectsMap = new Map()
    
    if (tabData?.chairFileObjects) {
      tabData.chairFileObjects.forEach(fileData => {
        if (fileData.fileObject instanceof File) {
          chairFileObjectsMap.set(fileData.name, fileData.fileObject)
        }
      })
      console.log('💾 Found File objects in tabs store:', chairFileObjectsMap.size)
    }
    
    const eventData = {
      name: formData.eventName,
      category_id: formData.category,
      description: formData.description,
      start_date: formData.startDate?.toISOString(),
      end_date: formData.endDate?.toISOString(),
      location: formData.location,
      map_url: formData.mapUrl || null,
      company: formData.company || null,
      organizer: formData.organizer || null,
      online_link_meeting: formData.onlineLinkMeeting || null,
      // CRITICAL: Enhanced chair processing with File object recovery
      chairs: formData.chairs.map((chair, index) => {
        let profileImage = null
        
        // Priority 1: Use File object from chair data
        if (chair.profile_image instanceof File) {
          profileImage = chair.profile_image
          console.log(`🪑 Chair ${index + 1} (${chair.name}): Using File from chair data - ${chair.profile_image.name}`)
        }
        // Priority 2: Recover File object from tabs store
        else if (chairFileObjectsMap.has(chair.name)) {
          profileImage = chairFileObjectsMap.get(chair.name)
          console.log(`🪑 Chair ${index + 1} (${chair.name}): Recovered File from tabs store - ${profileImage.name}`)
        }
        // Priority 3: No File object, preserve URL if available
        else if (chair.profile_image_url) {
          console.log(`🪑 Chair ${index + 1} (${chair.name}): Using existing URL - ${chair.profile_image_url}`)
        }
        else {
          console.log(`🪑 Chair ${index + 1} (${chair.name}): No image data`)
        }
        
        return {
          ...chair,
          // CRITICAL: Preserve File objects for API upload
          profile_image: profileImage,
          // Keep profile_image_url for existing images from API
          profile_image_url: chair.profile_image_url || null,
          // Remove display-only fields
          avatar: undefined,
          _hasFileObject: undefined,
          _fileRestored: undefined
        }
      }) || [],
      members: formData.members || [],
      // Include file fields for proper upload
      cover_image: formData.coverImageFile || null,
      event_background: formData.eventBackgroundFile || null,
      card_background: formData.cardBackgroundFile || null
    }
    
    console.log('💾 Final event data prepared for API:', {
      chairsCount: eventData.chairs.length,
      chairsWithFiles: eventData.chairs.filter(c => c.profile_image instanceof File).length,
      chairsWithUrls: eventData.chairs.filter(c => c.profile_image_url).length,
      chairDetails: eventData.chairs.map((c, i) => ({
        index: i + 1,
        name: c.name,
        hasFile: c.profile_image instanceof File,
        hasUrl: !!c.profile_image_url,
        fileName: c.profile_image instanceof File ? c.profile_image.name : null,
        imageUrl: c.profile_image_url || 'none'
      }))
    })

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
    console.log(result)
    
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
      
      // Show success toast with optimized deduplication
      toast.success(
        isEditMode.value ? 'Event Updated! 💾' : 'Event Created! 🎉',
        isEditMode.value
          ? 'Your changes have been saved successfully. You can continue editing other sections.'
          : 'Your event has been created successfully. You can now add agenda and tickets.'
      )
      
    } else {
      throw new Error('Invalid response from server')
    }
    
  } catch (error) {
    
    // Handle API response errors (from our enhanced error handling)
    if (error.success === false) {
      
      // Handle specific error types from our API wrapper
      switch (error.errorType) {
        case 'FILE_TOO_LARGE':
          toast.criticalError('Files Too Large 📁', error.message)
          return
          
        case 'NETWORK_ERROR':
          toast.criticalError('Connection Error 🌐', 'Please check your internet connection and try again.')
          return
          
        case 'AUTH_ERROR':
          toast.criticalError('Authentication Required 🔐', 'Please login again to continue.')
          // Redirect to login after delay
          setTimeout(() => {
            const router = useRouter()
            router.push('/login')
          }, 2000)
          return
          
        case 'SERVER_ERROR':
          toast.criticalError('Server Error 🔧', 'The server is experiencing issues. Please try again later.')
          return
          
        case 'VALIDATION_ERROR':
          // Set field errors from server response
          if (error.validationErrors && Object.keys(error.validationErrors).length > 0) {
            Object.entries(error.validationErrors).forEach(([field, messages]) => {
              const errorMsg = Array.isArray(messages) ? messages.join(', ') : messages
              setFieldError(field, errorMsg)
            })
          }
          
          toast.error('Validation Errors ❌', error.message || 'Please check the highlighted fields and fix the errors.')
          return
      }
      
      // Handle validation errors (fallback)
      if (error.validationErrors && Object.keys(error.validationErrors).length > 0) {
        // Set field errors from server response
        Object.entries(error.validationErrors).forEach(([field, messages]) => {
          const errorMsg = Array.isArray(messages) ? messages.join(', ') : messages
          setFieldError(field, errorMsg)
        })
        
        toast.error('Validation Errors', 'Please check the highlighted fields and fix the errors.')
        return
      }
      
      // Generic API error
      toast.error('Save Failed', error.message || 'Failed to save event. Please try again.')
      return
    }
    
    // Handle legacy error format (direct HTTP errors)
    if (error.status === 422 && error.data?.errors) {
      // Set field errors from server response
      Object.entries(error.data.errors).forEach(([field, messages]) => {
        const errorMsg = Array.isArray(messages) ? messages.join(', ') : messages
        setFieldError(field, errorMsg)
      })
      
      toast.error('Validation Errors', 'Please check the highlighted fields and fix the errors.')
      return
    }
    
    // Handle other legacy errors
    let errorMessage = 'Failed to save event. Please try again.'
    if (error.message?.includes('Authentication')) {
      errorMessage = 'Please login again to continue.'
    } else if (error.message?.includes('validation')) {
      errorMessage = 'Please check your input and try again.'
    } else if (error.message?.includes('CORS')) {
      errorMessage = 'Network connection error. Please check your internet connection.'
    } else if (error.message?.includes('413') || error.message?.includes('too large')) {
      errorMessage = 'Files are too large. Please compress your images and try again.'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    toast.error('Save Failed', errorMessage)
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

const handleChairSaved = (chairData) => {
  console.log('🪑 Chair saved with data:', chairData)
  
  // FIXED: Enhanced chair data processing with better File object preservation
  const processedChairData = {
    ...chairData,
    // CRITICAL: Preserve the File object for profile_image with better detection
    profile_image: (chairData.profile_image instanceof File ||
                   (chairData.profile_image && typeof chairData.profile_image === 'object' &&
                    chairData.profile_image.constructor && chairData.profile_image.constructor.name === 'File'))
                   ? chairData.profile_image : null,
    // Keep avatar for display purposes - preserve existing avatar if no new image
    avatar: chairData.avatar || (chairData.profile_image instanceof File ? URL.createObjectURL(chairData.profile_image) : ''),
    // Preserve existing profile_image_url from API if available
    profile_image_url: chairData.profile_image_url || null,
    // Ensure all required fields are present
    name: chairData.name || '',
    position: chairData.position || '',
    company: chairData.company || '',
    sort_order: chairData.sort_order || 1,
    // Preserve unique identifier for tracking
    id: chairData.id || Date.now() + Math.random()
  }
  
  console.log('🪑 Processed chair data:', {
    ...processedChairData,
    profile_image: processedChairData.profile_image ? `[File] ${processedChairData.profile_image.name}` : null,
    profile_image_url: processedChairData.profile_image_url || 'none',
    avatar: processedChairData.avatar ? 'present' : 'none'
  })
  
  if (editingChairIndex.value >= 0) {
    // FIXED: Update existing chair while preserving File objects from other chairs
    const existingChair = formData.chairs[editingChairIndex.value]
    
    // Preserve File objects from existing chair if no new image uploaded
    if (!processedChairData.profile_image && existingChair.profile_image instanceof File) {
      processedChairData.profile_image = existingChair.profile_image
      processedChairData.avatar = existingChair.avatar || URL.createObjectURL(existingChair.profile_image)
      console.log('🪑 Preserved existing File object for chair:', processedChairData.name)
    }
    
    formData.chairs[editingChairIndex.value] = processedChairData
    console.log('🪑 Updated chair at index:', editingChairIndex.value)
  } else {
    // Add new chair
    formData.chairs.push(processedChairData)
    console.log('🪑 Added new chair, total chairs:', formData.chairs.length)
  }
  
  // FIXED: Enhanced tabs store saving with File object preservation
  const chairsForStorage = formData.chairs.map(chair => ({
    ...chair,
    // Mark File objects for special handling
    hasFileObject: chair.profile_image instanceof File,
    fileObjectName: chair.profile_image instanceof File ? chair.profile_image.name : null
  }))
  
  // CRITICAL FIX: Enhanced File object preservation system
  const chairFileObjects = formData.chairs
    .map((chair, index) => {
      if (chair.profile_image instanceof File) {
        return {
          name: chair.name,
          fileObject: chair.profile_image,
          index: index,
          chairId: chair.id || `chair_${index}`,
          timestamp: Date.now()
        }
      }
      return null
    })
    .filter(Boolean)
  
  console.log('💾 Saving chair data with File objects:', {
    totalChairs: formData.chairs.length,
    chairsWithFiles: chairFileObjects.length,
    fileDetails: chairFileObjects.map(f => ({
      name: f.name,
      fileName: f.fileObject.name,
      fileSize: f.fileObject.size
    }))
  })
  
  tabsStore.saveTabData(0, {
    chairs: chairsForStorage,
    chairFileObjects: chairFileObjects,
    lastChairUpdate: new Date().toISOString()
  })
  tabsStore.markTabModified(0)
  
  showChairDialog.value = false
  editingChair.value = null
  editingChairIndex.value = -1
  
  toast.success(
    editingChairIndex.value >= 0 ? 'Chair Updated' : 'Chair Added',
    `${processedChairData.name} has been ${editingChairIndex.value >= 0 ? 'updated' : 'added'} successfully.`
  )
}

const deleteChair = (index) => {
  formData.chairs.splice(index, 1)
  
  // Save to tabs store
  tabsStore.saveTabData(0, { chairs: formData.chairs })
  tabsStore.markTabModified(0)
  
  toast.success('Chair Removed', 'Chair has been removed successfully')
}

// Get chair image source with proper handling - FIXED for profile_image_url
const getChairImageSrc = (chair) => {
  if (!chair) return null
  
  try {
    // Priority 1: File object (newly uploaded)
    if (chair.photo instanceof File) {
      console.log(`🖼️ Chair ${chair.name}: Using photo File object`)
      return URL.createObjectURL(chair.photo)
    }
    
    // Priority 2: profile_image File object
    if (chair.profile_image instanceof File) {
      console.log(`🖼️ Chair ${chair.name}: Using profile_image File object`)
      return URL.createObjectURL(chair.profile_image)
    }
    
    // Priority 3: CRITICAL FIX - profile_image_url field (from API response)
    if (chair.profile_image_url && typeof chair.profile_image_url === 'string' && chair.profile_image_url.trim()) {
      console.log(`🖼️ Chair ${chair.name}: Using profile_image_url from API: ${chair.profile_image_url}`)
      if (chair.profile_image_url.startsWith('http')) {
        return chair.profile_image_url
      }
      return `${window.location.origin}${chair.profile_image_url}`
    }
    
    // Priority 4: Avatar URL (existing or generated)
    if (chair.avatar && typeof chair.avatar === 'string' && chair.avatar.trim()) {
      console.log(`🖼️ Chair ${chair.name}: Using avatar URL`)
      return chair.avatar
    }
    
    // Priority 5: Photo URL string
    if (chair.photo && typeof chair.photo === 'string' && chair.photo.trim()) {
      console.log(`🖼️ Chair ${chair.name}: Using photo URL string`)
      if (chair.photo.startsWith('http')) {
        return chair.photo
      }
      return `${window.location.origin}${chair.photo}`
    }
    
    // Priority 6: Profile image URL (from API) - legacy field
    if (chair.profile_image && typeof chair.profile_image === 'string' && chair.profile_image.trim()) {
      console.log(`🖼️ Chair ${chair.name}: Using profile_image URL string`)
      if (chair.profile_image.startsWith('http')) {
        return chair.profile_image
      }
      return `${window.location.origin}${chair.profile_image}`
    }
    
    // Priority 7: photo_url field (from API) - legacy field
    if (chair.photo_url && typeof chair.photo_url === 'string' && chair.photo_url.trim()) {
      console.log(`🖼️ Chair ${chair.name}: Using photo_url from API`)
      if (chair.photo_url.startsWith('http')) {
        return chair.photo_url
      }
      return `${window.location.origin}${chair.photo_url}`
    }
    
    console.log(`🖼️ Chair ${chair.name}: No image source found`)
    return null
  } catch (error) {
    console.error(`🖼️ Chair ${chair.name}: Error getting image source:`, error)
    return null
  }
}

// Handle chair image load errors
const handleChairImageError = (event) => {
  event.target.style.display = 'none'
}

// File upload handlers
const handleCoverImageUpload = (file) => {
  formData.coverImageFile = file
  clearFieldError('cover_image') // Clear any existing error
  tabsStore.markTabModified(0)
  
  // Save to tabs store immediately
  tabsStore.saveTabData(0, {
    ...formData,
    lastSaved: new Date().toISOString(),
    hasUnsavedChanges: true
  })
}

const handleCoverImageRemoved = () => {
  formData.coverImageFile = null
  tabsStore.markTabModified(0)
  
  // Save to tabs store immediately
  tabsStore.saveTabData(0, {
    ...formData,
    lastSaved: new Date().toISOString(),
    hasUnsavedChanges: true
  })
}

const handleEventBackgroundUpload = (file) => {
  formData.eventBackgroundFile = file
  tabsStore.markTabModified(0)
  
  // Save to tabs store immediately
  tabsStore.saveTabData(0, {
    ...formData,
    lastSaved: new Date().toISOString(),
    hasUnsavedChanges: true
  })
}

const handleCardBackgroundUpload = (file) => {
  formData.cardBackgroundFile = file
  tabsStore.markTabModified(0)
  
  // Save to tabs store immediately
  tabsStore.saveTabData(0, {
    ...formData,
    lastSaved: new Date().toISOString(),
    hasUnsavedChanges: true
  })
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

// Enhanced slug validation with better error handling
const validateSlug = () => {
  try {
    if (!formData.eventSlug) return
    
    // Clear any existing error first
    clearFieldError('event_slug')
    
    // Enhanced slug validation for Khmer text support
    let cleanSlug = formData.eventSlug
      .toLowerCase()
      .trim()
      // Remove Khmer characters and other non-ASCII
      .replace(/[\u1780-\u17FF]/g, '') // Remove Khmer Unicode range
      .replace(/[^\w\s-]/g, '') // Keep only word chars, spaces, hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    
    // If slug becomes empty after cleaning, generate a random one
    if (!cleanSlug) {
      const timestamp = Date.now().toString(36)
      cleanSlug = `event-${timestamp}`
    }
    
    // Ensure minimum length
    if (cleanSlug.length < 3) {
      cleanSlug = `${cleanSlug}-${Date.now().toString(36).slice(-3)}`
    }
    
    formData.eventSlug = cleanSlug
  } catch (error) {
    console.error('Slug validation error:', error)
    // Fallback to timestamp-based slug
    formData.eventSlug = `event-${Date.now().toString(36)}`
  }
}

const generateSlug = () => {
  try {
    if (formData.eventName && formData.eventName.trim()) {
      // Enhanced slug generation with Khmer text handling
      let baseSlug = formData.eventName
        .toLowerCase()
        .trim()
        // Remove Khmer characters
        .replace(/[\u1780-\u17FF]/g, '')
        // Replace common words with shorter versions
        .replace(/\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/g, '')
        // Clean up
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      
      // If nothing remains after cleaning, use fallback
      if (!baseSlug || baseSlug.length < 3) {
        const adjectives = ['awesome', 'amazing', 'fantastic', 'incredible', 'spectacular', 'wonderful']
        const nouns = ['event', 'conference', 'summit', 'meetup', 'workshop', 'seminar']
        const numbers = Math.floor(Math.random() * 999) + 1
        const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
        const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]
        baseSlug = `${randomAdjective}-${randomNoun}-${numbers}`
      }
      
      formData.eventSlug = baseSlug
      // Only show toast if slug was actually generated
      if (baseSlug !== formData.eventName.toLowerCase()) {
        toast.success('Slug Generated', 'Event URL slug created successfully')
      }
    } else {
      // Generate random slug when no event name
      const timestamp = Date.now().toString(36)
      const randomNum = Math.floor(Math.random() * 999) + 1
      formData.eventSlug = `event-${timestamp}-${randomNum}`
      toast.success('Slug Generated', 'Random event URL created')
    }
  } catch (error) {
    console.error('Slug generation error:', error)
    // Fallback slug
    formData.eventSlug = `event-${Date.now().toString(36)}`
    toast.error('Slug Generation Failed', 'Using fallback URL slug')
  }
}

const copyUrl = async () => {
  try {
    if (!generatedUrl.value) {
      toast.warn('No URL', 'Please generate a slug first')
      return
    }
    
    await navigator.clipboard.writeText(generatedUrl.value)
    toast.success('Copied!', 'Event URL copied to clipboard')
  } catch (err) {
    console.error('Copy failed:', err)
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea')
      textArea.value = generatedUrl.value
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      toast.success('Copied!', 'Event URL copied to clipboard')
    } catch (fallbackErr) {
      toast.error('Copy Failed', 'Please copy the URL manually')
    }
  }
}

const openUrl = () => {
  try {
    if (!generatedUrl.value) {
      toast.warn('No URL', 'Please generate a slug first')
      return
    }
    
    window.open(generatedUrl.value, '_blank', 'noopener,noreferrer')
  } catch (error) {
    console.error('Failed to open URL:', error)
    toast.error('Failed to Open', 'Could not open URL in new tab')
  }
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

// Watch for event name changes to suggest slug
watch(() => formData.eventName, (newName) => {
  if (newName && !formData.eventSlug) {
    generateSlug(); // Auto-generate slug if event name is entered and slug is empty
  }
});

// Cleanup on unmount
onBeforeUnmount(() => {
  window.removeEventListener('saveDraft', handleSaveDraft)
  window.removeEventListener('saveCurrentTab', handleSaveCurrentTab)
})
</script>

<style scoped>
:deep(.p-calendar .p-inputtext) {
  @apply bg-transparent border-0;
}
</style>