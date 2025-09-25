<template>
  <div class="">
    <!-- Main Content Area -->
    <div class="w-full">
      <!-- Customer Information -->
      <div class="bg-white rounded-2xl p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-1">
          Customer Information
        </h2>
        <p class="text-gray-500 mb-6">Enter customer detail for booking</p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="grid-cols-1">
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Full Name</label
            >
            <InputText
              v-model="customerInfo.fullName"
              placeholder="ZM2025001"
              class="w-full p-3 rounded-lg bg-gray-100"
            />
          </div>
          <div class="grid-cols-1">
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Phone Number</label
            >
            <div class="flex">
              <!-- Prefix section -->
              <div class="flex items-center px-3 bg-gray-100 rounded-l-lg">
                <img
                  :src="flat"
                  alt="Cambodia"
                  class="w-8 h-8 mr-2 rounded-sm"
                />
                <span class="text-gray-600 border-l-2 px-1 border-gray-600"
                  >+855</span
                >
              </div>
              <!-- Input section -->
              <InputText
                v-model="customerInfo.phoneNumber"
                class="flex-1 p-3 bg-gray-100 rounded-lg !rounded-l-none"
              />
            </div>
          </div>
          <div class="grid-cols-1">
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Email</label
            >
            <InputText
              v-model="customerInfo.email"
              placeholder="Email"
              class="w-full p-3 rounded-lg bg-gray-100"
            />
          </div>
        </div>
      </div>

      <!-- Select Event -->
      <div>
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-4">
            <div>
              <h2 class="text-xl font-semibold text-gray-800 mb-1">
                Select Event
              </h2>
              <p class="text-gray-500">Choose the event for booking</p>
            </div>
            <div>
              <span
                class="text-blue-600 font-medium px-3 py-1 rounded-full bg-blue-50"
              >
                <span v-if="isLoading">Loading events...</span>
                <span v-else
                  >Now {{ events.length }} event{{
                    events.length !== 1 ? "s" : ""
                  }}
                  available</span
                >
              </span>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <!-- Layout Toggle Buttons -->
            <div class="flex bg-gray-100 rounded-lg p-1">
              <Button
                @click="layoutView = 'grid'"
                :class="[
                  'p-2 !rounded-md transition-all duration-200',
                  layoutView === 'grid'
                    ? '!bg-white !shadow-sm !text-purple-600'
                    : '!bg-transparent !text-gray-500 hover:!text-gray-700',
                ]"
                severity="secondary"
                text
                title="Grid View"
              >
                <Icon name="heroicons:squares-2x2" class="w-5 h-5" />
              </Button>
              <Button
                @click="layoutView = 'column'"
                :class="[
                  'p-2 !rounded-md transition-all duration-200',
                  layoutView === 'column'
                    ? '!bg-white !shadow-sm !text-purple-600'
                    : '!bg-transparent !text-gray-500 hover:!text-gray-700',
                ]"
                severity="secondary"
                text
                title="Column View"
              >
                <Icon name="heroicons:list-bullet" class="w-5 h-5" />
              </Button>
            </div>
            <div class="relative">
              <Icon
                name="heroicons:magnifying-glass"
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
              />
              <InputText
                v-model="searchQuery"
                placeholder="Search"
                class="pl-10 pr-4 py-3 border border-blue-300 rounded-full w-80 bg-gray-50"
              />
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center items-center py-12">
          <div class="text-center">
            <div
              class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"
            ></div>
            <p class="text-gray-600">Loading events...</p>
          </div>
        </div>

        <!-- Error State -->
        <div
          v-else-if="errorMessage"
          class="bg-red-50 border border-red-200 rounded-lg p-6 mb-6"
        >
          <div class="flex items-center">
            <Icon
              name="heroicons:exclamation-triangle"
              class="w-6 h-6 text-red-600 mr-3"
            />
            <div>
              <h3 class="text-red-800 font-medium">Error Loading Events</h3>
              <p class="text-red-600 mt-1">{{ errorMessage }}</p>
              <button
                @click="loadEvents()"
                class="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>

        <!-- No Events State -->
        <div v-else-if="events.length === 0" class="text-center py-12">
          <Icon
            name="heroicons:calendar-x-mark"
            class="w-16 h-16 text-gray-400 mx-auto mb-4"
          />
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            No Events Available
          </h3>
          <p class="text-gray-600">
            There are currently no events available for booking.
          </p>
        </div>

        <!-- Event Cards - Grid Layout -->
        <div
          v-else-if="layoutView === 'grid'"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <div
            v-for="event in filteredEvents"
            :key="event.id"
            class="rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer bg-[#fff6]"
            @click="selectEvent(event)"
          >
            <div class="relative overflow-hidden aspect-[16/9]">
              <img
                :src="event.image"
                :alt="event.title"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="p-4 flex-1 flex flex-col">
              <h3
                class="font-semibold text-gray-800 mb-3 text-sm leading-tight line-clamp-2 flex-grow"
              >
                {{ event.title }}
              </h3>
              <div class="flex items-start text-gray-600 mb-4 min-h-[20px]">
                <Icon
                  name="heroicons:map-pin"
                  class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0"
                />
                <span class="text-sm leading-tight line-clamp-2">{{ event.location }}</span>
              </div>
              <div
                class="flex flex-col sm:flex-row justify-around items-center bg-white border border-white p-3 rounded-xl shadow-md"
              >
                <div
                  class="flex flex-col items-center text-center mb-2 sm:mb-0"
                >
                  <p class="text-gray-500 text-xs font-medium">Date</p>
                  <p class="text-gray-800 text-base md:text-xs ">
                    {{ event.date }}
                  </p>
                </div>

                <!-- Vertical separator (visible on larger screens) -->
                <div class="hidden sm:block w-px bg-gray-300 h-10 mx-3"></div>
                <!-- Horizontal separator (visible on smaller screens) -->
                <div class="block sm:hidden w-full h-px bg-gray-300 my-1"></div>

                <div class="flex flex-col items-center text-center">
                  <p class="text-gray-500 text-xs font-medium">Time</p>
                  <p class="text-gray-800 text-base md:text-xs ">
                    {{ event.time }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Event Cards - Column Layout -->
        <div v-else-if="layoutView === 'column'" class="space-y-4">
          <div
            v-for="event in filteredEvents"
            :key="event.id"
            class="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer bg-white flex"
            @click="selectEvent(event)"
          >
            <div
              class="w-48 h-36 sm:w-52 sm:h-40 md:w-[18rem] md:h-36 relative overflow-hidden flex-shrink-0"
            >
              <img
                :src="event.image"
                :alt="event.title"
                class="w-full h-full object-cover rounded-l-2xl"
              />
            </div>
            <div class="flex-1 p-4 flex flex-col justify-between min-h-[144px]">
              <div>
                <h3
                  class="font-semibold text-gray-800 mb-2 text-base leading-tight line-clamp-2"
                >
                  {{ event.title }}
                </h3>
                <div class="flex items-start text-gray-600 mb-3">
                  <Icon
                    name="heroicons:map-pin"
                    class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0"
                  />
                  <span class="text-sm line-clamp-1">{{ event.location }}</span>
                </div>
              </div>
              <div class="flex gap-8 text-sm mt-auto">
                <div>
                  <div class="text-gray-500 mb-1">Date</div>
                  <div class="font-medium text-gray-800 text-xs">
                    {{ event.date }}
                  </div>
                </div>
                <div>
                  <div class="text-gray-500 mb-1">Time</div>
                  <div class="font-medium text-gray-800 text-xs">
                    {{ event.time }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Detail Sidebar Component -->
    <EventDetail
      v-model:visible="visible"
      :selected-event="selectedEvent"
      @book-now="handleBookNowClick"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

import InputText from "primevue/inputtext";
import Button from "primevue/button";
// Import the new EventDetailSidebar component
import EventDetail from "./EventDetail.vue";
// Import the API function for fetching events
import { fetchEvents } from "@/composables/api";

import img1 from "@/assets/image/poster-manage-booking.png";
import flat from "@/assets/image/cambodia.png";

// Customer information
const customerInfo = ref({
  fullName: "ZM2025001",
  phoneNumber: "",
  email: "",
});

// Search functionality
const searchQuery = ref("");

// Layout state: 'grid' for 3-column, 'column' for single column
const layoutView = ref("grid");

// Events data from API
const events = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");

// Function to format date for display
const formatEventDate = (startDate, endDate) => {
  if (!startDate) return "Date not available";

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  const options = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };

  if (end && start.getTime() !== end.getTime()) {
    return `${start.toLocaleDateString(
      "en-US",
      options
    )} - ${end.toLocaleDateString("en-US", options)}`;
  }

  return start.toLocaleDateString("en-US", options);
};

// Function to format time for display
const formatEventTime = (startDate) => {
  if (!startDate) return "Time not available";

  const date = new Date(startDate);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });
};

// Function to get event image
const getEventImage = (event) => {
  return (
    event.cover_image_url ||
    event.card_background_url ||
    event.event_background_url ||
    img1
  );
};

// Transform API event data to component format
const transformEventData = (apiEvents) => {
  return apiEvents.map((event) => ({
    id: event.id,
    title: event.name || "Untitled Event",
    location: event.location || "Location TBD",
    date: formatEventDate(event.start_date, event.end_date),
    time: formatEventTime(event.start_date),
    image: getEventImage(event),
    // Keep original API data for reference
    _originalData: event,
  }));
};

// Load events from API
const loadEvents = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const response = await fetchEvents();

    if (response.data.success && Array.isArray(response.data.data)) {
      events.value = transformEventData(response.data.data);
    } else {
      throw new Error(response.data.message || "Failed to load events");
    }
  } catch (error) {
    console.error("Error loading events:", error);
    errorMessage.value =
      error.message || "Failed to load events. Please try again.";
    // Keep empty array on error
    events.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Load events when component mounts
onMounted(() => {
  loadEvents();
});

// Computed property for filtered events
const filteredEvents = computed(() => {
  if (!searchQuery.value) return events.value;
  return events.value.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Sidebar state
const visible = ref(false);
const selectedEvent = ref(null);

// Methods
const selectEvent = (event) => {
  selectedEvent.value = event;
  visible.value = true;
};

const handleBookNowClick = (event) => {
  // You can add further logic here, e.g., navigate to a booking page
  // or open a booking form modal.
  visible.value = false; // Close the sidebar after clicking book now
};
</script>

<style scoped>
/* PrimeVue component overrides for consistent styling */
:deep(.p-inputtext) {
  @apply focus:ring-0 focus:ring-purple-500 focus:border-purple-500;
}
/* Ensure input text next to flag is not rounded on left */
:deep(.p-inputtext.\!rounded-l-none) {
  @apply rounded-l-none;
}
/* Custom button styling for layout toggle */
:deep(.p-button) {
  @apply transition-all duration-200;
}

/* Text clamping for consistent card heights */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  max-height: calc(2 * 1.4em);
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Grid layout image aspect ratio */
.aspect-\[16\/9\] {
  aspect-ratio: 16 / 9;
}

/* Ensure consistent image loading and transitions */
img {
  transition: transform 0.3s ease;
}

/* Hover effects for better interactivity */
.cursor-pointer:hover img {
  transform: scale(1.05);
}

/* Responsive adjustments for mobile */
@media (max-width: 768px) {
  .grid-cols-1.md\:grid-cols-2.lg\:grid-cols-3 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  /* Column layout adjustments for mobile */
  .space-y-4 > div {
    flex-direction: column;
  }

  .space-y-4 > div .w-48 {
    width: 100%;
    height: 200px;
  }

  .space-y-4 > div img {
    border-radius: 1rem 1rem 0 0;
  }
}

/* Ensure cards have consistent minimum height in grid */
.grid .bg-\[\#FFFFFF\] {
  min-height: 350px;
  display: flex;
  flex-direction: column;
}

.grid .bg-\[\#FFFFFF\] .p-4 {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>
