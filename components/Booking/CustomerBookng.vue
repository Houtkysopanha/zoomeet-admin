<template>
  <div class="">
    <!-- Main Content Area -->
    <div class="w-full">
      <!-- Customer Information -->
      <div class="bg-white rounded-2xl p-6 mb-8">
        <!-- Error Message -->
        <div v-if="bookingError" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div class="flex items-center">
            <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 text-red-600 mr-3" />
            <div>
              <h3 class="text-red-800 font-medium">Error</h3>
              <p class="text-red-600 text-sm mt-1">{{ bookingError }}</p>
            </div>
          </div>
        </div>

        <!-- Success Message -->
        <div v-if="bookingSuccess" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div class="flex items-center">
            <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-600 mr-3" />
            <div>
              <h3 class="text-green-800 font-medium">Success!</h3>
              <p class="text-green-600 text-sm mt-1">Your booking has been completed successfully.</p>
            </div>
          </div>
        </div>

        <div class="flex justify-between items-center">
          <div class="header">
            <h2 class="text-xl font-semibold text-gray-800 mb-1">
          Customer Information
        </h2>
        <p class="text-gray-500 mb-3">Enter customer detail for booking</p>
        
          </div>
          <div class="flex gap-3 button-save">
             <Button 
               @click="saveCustomerInfo"
               :disabled="!isCustomerInfoComplete"
               :class="[
                 'rounded-full p-2 px-8 transition-all duration-200',
                 isCustomerInfoComplete 
                   ? 'bg-purple-700 text-white hover:bg-purple-800' 
                   : 'bg-gray-300 text-gray-500 cursor-not-allowed'
               ]"
             >
              <Icon name="mingcute:save-fill" class="w-5 mr-2 h-5" />
              Save
              </Button>
              
              <Button 
                @click="clearCustomerInfo"
                v-if="customerInfo.fullName || customerInfo.phoneNumber || customerInfo.email"
                class="rounded-full p-2 px-6 bg-gray-500 text-white hover:bg-gray-600 transition-all duration-200"
              >
                <Icon name="heroicons:trash" class="w-5 mr-2 h-5" />
                Clear
              </Button>
          </div>
        </div>
        <!-- Tab-like headers -->
        <div class="flex border-b border-gray-200 mb-6">
          <button 
            @click="activeTab = 'phone'"
            :class="[
              'flex-1 px-4 py-2 font-medium transition-all duration-200',
              activeTab === 'phone' 
                ? 'text-purple-600 border-b-2 border-purple-600' 
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            Phone Number
          </button>
          <button 
            @click="activeTab = 'email'"
            :class="[
              'flex-1 px-4 py-2 font-medium transition-all duration-200',
              activeTab === 'email' 
                ? 'text-purple-600 border-b-2 border-purple-600' 
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            Email
          </button>
        </div>

        <!-- Phone Number Tab Content -->
        <div v-if="activeTab === 'phone'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Phone Number Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div class="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
              <!-- Country Flag and Code -->
              <div class="flex items-center px-3 py-3 bg-white border-r border-gray-200">
                <img
                  :src="flat"
                  alt="Cambodia"
                  class="w-5 h-5 mr-2"
                />
                <span class="text-gray-700 text-sm font-medium">+855</span>
              </div>
              <!-- Phone Input -->
              <InputText
                v-model="customerInfo.phoneNumber"
                placeholder=""
                class="flex-1 p-3 border-0 focus:ring-0 bg-white"
              />
            </div>
          </div>

          <!-- Full Name Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <InputText
              v-model="customerInfo.fullName"
              placeholder="Full name"
              class="w-full p-3 border border-gray-200 rounded-lg bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        <!-- Email Tab Content -->
        <div v-else-if="activeTab === 'email'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Email Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <InputText
              v-model="customerInfo.email"
              placeholder="Email address"
              type="email"
              class="w-full p-3 border border-gray-200 rounded-lg bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <!-- Full Name Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <InputText
              v-model="customerInfo.fullName"
              placeholder="Full name"
              class="w-full p-3 border border-gray-200 rounded-lg bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
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
      :customer-info="customerInfo"
      :active-customer-tab="activeTab"
      :is-customer-info-complete="isCustomerInfoComplete"
      :is-processing-booking="isProcessingBooking"
      @complete-booking="handleCompleteBooking"
      @book-now="handleBookNowClick"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";

import InputText from "primevue/inputtext";
import Button from "primevue/button";
import { useToast } from "primevue/usetoast";
// Import the new EventDetailSidebar component
import EventDetail from "./EventDetail.vue";
// Import the API function for fetching events
import { fetchEvents, createOrderReservation } from "@/composables/api";

import img1 from "@/assets/image/poster-manage-booking.png";
import flat from "@/assets/image/cambodia.png";

// Customer information
const customerInfo = ref({
  fullName: "",
  phoneNumber: "",
  email: "",
});

// Active tab state
const activeTab = ref('phone');

// Booking state
const isProcessingBooking = ref(false);
const bookingError = ref("");
const bookingSuccess = ref(false);

// PrimeVue Toast
const toast = useToast();

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

// Load customer info from localStorage
const loadCustomerInfo = () => {
  if (process.client) {
    try {
      const saved = localStorage.getItem('customerInfo');
      if (saved) {
        const parsed = JSON.parse(saved);
        customerInfo.value = {
          fullName: parsed.fullName || "",
          phoneNumber: parsed.phoneNumber || "",
          email: parsed.email || "",
        };
        console.log('📋 Loaded customer info from localStorage:', customerInfo.value);
      }
    } catch (error) {
      console.warn('Failed to load customer info from localStorage:', error);
    }
  }
};

// Load events when component mounts
onMounted(async () => {
  // Load customer info first
  loadCustomerInfo();
  
  // Then load events
  await loadEvents();
  
  // Check if there's an eventId in the URL and auto-select that event
  if (process.client) {
    const route = useRoute();
    const eventId = route.query.eventId;
    
    if (eventId && events.value.length > 0) {
      // Find the event with matching ID
      const eventToSelect = events.value.find(event => 
        event._originalData.id === eventId
      );
      
      if (eventToSelect) {
        console.log('🔗 Auto-selecting event from URL:', eventToSelect);
        selectEvent(eventToSelect);
      }
    }
  }
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
  // Pass the original API data which contains the proper ID and all fields
  const eventForDetail = {
    id: event._originalData.id,
    title: event.title,
    date: event.date,
    time: event.time,
    location: event.location,
    image: event.image,
    // Include any other fields that EventDetail might need
    name: event._originalData.name,
    event_slug: event._originalData.event_slug,
    start_date: event._originalData.start_date,
    end_date: event._originalData.end_date,
    ...event._originalData // Include all original data
  };
  
  selectedEvent.value = eventForDetail;
  visible.value = true;
  
  console.log('🎯 Selected event for detail:', eventForDetail);
  
  // Update URL to include event ID for proper ticket loading
  if (process.client && event._originalData.id) {
    const router = useRouter();
    const route = useRoute();
    
    // Update the URL query parameter to include the event ID
    router.replace({
      ...route,
      query: {
        ...route.query,
        eventId: event._originalData.id
      }
    });
  }
};

// Validate customer information
const validateCustomerInfo = () => {
  const errors = [];
  
  if (!customerInfo.value.fullName.trim()) {
    errors.push('Full name is required');
  }
  
  if (activeTab.value === 'phone') {
    if (!customerInfo.value.phoneNumber.trim()) {
      errors.push('Phone number is required');
    } else {
      // Basic phone number validation (should contain only digits and common separators)
      const phoneRegex = /^[0-9\s\-\+\(\)]{8,15}$/;
      if (!phoneRegex.test(customerInfo.value.phoneNumber.trim())) {
        errors.push('Please enter a valid phone number');
      }
    }
  } else if (activeTab.value === 'email') {
    if (!customerInfo.value.email.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.value.email)) {
      errors.push('Please enter a valid email address');
    }
  }
  
  return errors;
};

// Check if customer info is complete
const isCustomerInfoComplete = computed(() => {
  const errors = validateCustomerInfo();
  return errors.length === 0;
});

// Generate transaction ID
const generateTransactionId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `TXN${timestamp}${random}`.toUpperCase();
};

// Handle booking completion from EventDetail component
const handleCompleteBooking = async (bookingDetails) => {
  console.log('🎯 Handling complete booking:', bookingDetails);
  console.log('🔍 Transaction ID received:', {
    value: bookingDetails.transactionId,
    type: typeof bookingDetails.transactionId,
    paymentMethod: bookingDetails.paymentMethod
  });
  
  // Validate customer information first
  const validationErrors = validateCustomerInfo();
  if (validationErrors.length > 0) {
    bookingError.value = validationErrors.join(', ');
    toast.add({
      severity: 'error',
      summary: 'Customer Information Required',
      detail: validationErrors.join(', '),
      life: 5000
    });
    return;
  }
  
  // Check if an event is selected
  if (!selectedEvent.value || !selectedEvent.value.id) {
    bookingError.value = 'Please select an event first';
    toast.add({
      severity: 'error',
      summary: 'Event Required',
      detail: 'Please select an event first',
      life: 5000
    });
    return;
  }
  
  // Check if tickets are selected
  if (!bookingDetails.tickets || bookingDetails.tickets.length === 0) {
    bookingError.value = 'Please select at least one ticket';
    toast.add({
      severity: 'error',
      summary: 'Tickets Required',
      detail: 'Please select at least one ticket',
      life: 5000
    });
    return;
  }
  
  isProcessingBooking.value = true;
  bookingError.value = "";
  bookingSuccess.value = false;
  
  try {
    // Prepare order data according to API specification
    const orderData = {
      event_id: selectedEvent.value?.id, // CRITICAL: Include event_id
      coupon: bookingDetails.paymentSummary?.voucherCode || null,
      ticket_types: bookingDetails.tickets.map(ticket => ({
        ticket_type_id: ticket.id,
        quantity: ticket.quantity
      })),
      payment_method: bookingDetails.paymentMethod,
      transaction_id: bookingDetails.paymentMethod === 'offline' 
        ? null 
        : (bookingDetails.transactionId && String(bookingDetails.transactionId).trim() 
           ? String(bookingDetails.transactionId).trim() 
           : generateTransactionId()),
      phone_number: activeTab.value === 'phone' ? `+855${customerInfo.value.phoneNumber.trim()}` : null,
      email: activeTab.value === 'email' ? customerInfo.value.email.trim() : null, 
      full_name: customerInfo.value.fullName.trim()
    };

    console.log('📋 Creating order with data:', orderData);
    console.log('🔍 API will be called with endpoint:', '/orders/reserve');

    // Create the order reservation
    const result = await createOrderReservation(orderData);
    
    console.log('📨 API Response received:', result);
    
    if (result.success) {
      console.log('✅ Order created successfully:', result);
      bookingSuccess.value = true;
      visible.value = false; // Close the sidebar
      
      // Optional: Show success message with order details
      showSuccessMessage(result);
      
      // Reset form after successful booking
      resetBookingForm();
    } else {
      throw new Error(result.error || 'Failed to create order');
    }
    
  } catch (error) {
    console.error('❌ Booking failed:', error);
    bookingError.value = error.message || 'Failed to complete booking. Please try again.';
    toast.add({
      severity: 'error',
      summary: 'Booking Failed',
      detail: error.message || 'Failed to complete booking. Please try again.',
      life: 8000
    });
  } finally {
    isProcessingBooking.value = false;
  }
};

// Show success message
const showSuccessMessage = (result) => {
  const orderInfo = result.data || {};
  const orderId = result.order_id || orderInfo.id || 'N/A';
  
  toast.add({
    severity: 'success',
    summary: 'Booking Successful',
    detail: `Your booking has been confirmed! Order ID: ${orderId}`,
    life: 5000
  });
  
  console.log('🎉 Booking completed successfully!', result);
};

// Reset booking form
const resetBookingForm = () => {
  // Clear customer info
  customerInfo.value = {
    fullName: "",
    phoneNumber: "",
    email: "",
  };
  
  // Clear from localStorage as well
  if (process.client) {
    localStorage.removeItem('customerInfo');
  }
  
  // Reset form states
  bookingError.value = "";
  bookingSuccess.value = false;
  
  // Close sidebar and clear selected event
  selectedEvent.value = null;
  visible.value = false;
  clearEventFromUrl();
  
  console.log('🔄 Booking form reset successfully');
};

// Save customer information
const saveCustomerInfo = () => {
  const validationErrors = validateCustomerInfo();
  if (validationErrors.length > 0) {
    bookingError.value = validationErrors.join(', ');
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: validationErrors.join(', '),
      life: 5000
    });
    return;
  }
  
  bookingError.value = "";
  bookingSuccess.value = false;
  
  // Save to localStorage for persistence
  if (process.client) {
    localStorage.setItem('customerInfo', JSON.stringify(customerInfo.value));
  }
  
  toast.add({
    severity: 'success',
    summary: 'Information Saved',
    detail: 'Customer information saved successfully!',
    life: 3000
  });
  
  console.log('💾 Customer info saved:', customerInfo.value);
};

// Clear customer information
const clearCustomerInfo = () => {
  customerInfo.value = {
    fullName: "",
    phoneNumber: "",
    email: "",
  };
  
  // Clear from localStorage as well
  if (process.client) {
    localStorage.removeItem('customerInfo');
  }
  
  // Clear any error states
  bookingError.value = "";
  bookingSuccess.value = false;
  
  toast.add({
    severity: 'info',
    summary: 'Information Cleared',
    detail: 'Customer information has been cleared.',
    life: 3000
  });
  
  console.log('🗑️ Customer info cleared');
};

const handleBookNowClick = (event) => {
  // You can add further logic here, e.g., navigate to a booking page
  // or open a booking form modal.
  visible.value = false; // Close the sidebar after clicking book now
  clearEventFromUrl();
};

// Clear event ID from URL when sidebar is closed
const clearEventFromUrl = () => {
  if (process.client) {
    const router = useRouter();
    const route = useRoute();
    
    // Remove the eventId from query parameters
    const newQuery = { ...route.query };
    delete newQuery.eventId;
    
    router.replace({
      ...route,
      query: newQuery
    });
  }
};

// Watch for sidebar visibility changes
watch(visible, (newVisible) => {
  if (!newVisible) {
    // Clear URL when sidebar is closed
    clearEventFromUrl();
  }
});
</script>

<style scoped>
/* PrimeVue component overrides for consistent styling */
:deep(.p-inputtext) {
  @apply focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-white;
}
/* Remove border and focus styles for phone input */
:deep(.p-inputtext.border-0) {
  border: none !important;
  box-shadow: none !important;
}
:deep(.p-inputtext.border-0:focus) {
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
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
