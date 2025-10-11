<template>
  <Sidebar
    v-model:visible="visible"
    :header="selectedEvent ? selectedEvent.title : 'Event Details'"
    position="right"
    class="w-full md:w-[450px] text-black rounded-l-2xl lg:w-[500px] p-0"
  >
    <!-- Use the closeicon slot to customize the close button -->
    <template #closeicon>
      <button @click="visible = false" class="p-sidebar-close p-link">
        <Icon
          name="hugeicons:arrow-left-03"
          class="w-8 h-8 text-black hover:text-gray-700"
        />
      </button>
    </template>

    <div class="flex flex-col h-full">
      <!-- Header Section -->
      <div class="bg-white pb-4 shadow-sm relative">
        <div class="text-sm text-gray-600">
          <div class="flex space-x-5 mb-5">
            <div>Date | {{ selectedEvent?.date }}</div>
            <div>Time | {{ selectedEvent?.time }}</div>
          </div>
          <div class="flex space-x-5 mb-5">
            <div>
              <div class="text-sm text-gray-500">Booking name</div>
              <div
                :class="[
                  'text-sm font-bold leading-5 flex items-center gap-1',
                  getBookingName()
                    ? 'text-gray-800'
                    : 'text-orange-600',
                ]"
              >
                <!-- <Icon
                  v-if="!getBookingName()"
                  name="heroicons:exclamation-triangle"
                  class="w-4 h-4"
                /> -->
                {{
                  getBookingName() ||
                  "-"
                }}
              </div>
            </div>
            <div>
              <div class="text-sm text-gray-500">Email/Phone Number</div>
              <div
                :class="[
                  'text-sm font-bold leading-5 flex items-center gap-1',
                  hasCustomerContact() ? 'text-gray-800' : 'text-orange-600',
                ]"
              >
                <!-- <Icon
                  v-if="!hasCustomerContact()"
                  name="heroicons:exclamation-triangle"
                  class="w-4 h-4"
                /> -->
                {{ getCustomerContact()  }}
              </div>
            </div>
          </div>
          <div class="border border-gray-300 my-8"></div>
        </div>
        <!-- Tabs -->
        <div class="flex space-x-2 p-1 rounded-full">
          <button
            @click="activeDetailTab = 'ticket'"
            :class="[
              'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full font-semibold transition-all duration-300 ease-in-out',
              activeDetailTab === 'ticket'
                ? 'bg-gradient-to-r from-purple-600 to-purple-400 text-white shadow-md'
                : 'text-gray-600 hover:text-purple-600 hover:bg-white',
            ]"
          >
            <Icon name="heroicons:ticket" class="w-5 h-5" />
            <span>Select Ticket</span>
          </button>
          <button
            @click="activeDetailTab = 'breakout'"
            disabled= "false"
            :class="[
              'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full font-semibold transition-all duration-300 ease-in-out cursor-not-allowed',
              activeDetailTab === 'breakout'
                ? 'bg-gradient-to-r from-purple-600 to-purple-400 text-white shadow-md'
                : 'text-gray-600 hover:text-purple-600 hover:bg-white',
            ]"
          >
            <Icon name="heroicons:building-library" class="w-5 h-5" />
            <span>Breakout Room</span>
          </button>
        </div>
      </div>

      <!-- Content Area (Scrollable) -->
      <div class="flex-1 overflow-y-auto mt-6">
        <div v-if="activeDetailTab === 'ticket'">
          <!-- Loading State for Tickets -->
          <div
            v-if="ticketsLoading"
            class="flex justify-center items-center py-8"
          >
            <div class="text-center">
              <div
                class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mb-2"
              ></div>
              <p class="text-gray-600 text-sm">Loading ticket types...</p>
            </div>
          </div>

          <!-- Error State for Tickets -->
          <div
            v-else-if="ticketsError"
            class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
          >
            <div class="flex items-center">
              <Icon
                name="heroicons:exclamation-triangle"
                class="w-5 h-5 text-red-600 mr-2"
              />
              <div>
                <h4 class="text-red-800 font-medium text-sm">
                  Failed to load ticket types
                </h4>
                <p class="text-red-600 text-xs mt-1">{{ ticketsError }}</p>
              </div>
            </div>
          </div>

          <!-- No Tickets Available -->
          <div v-else-if="tickets.length === 0" class="text-center py-8">
            <Icon
              name="heroicons:ticket"
              class="w-12 h-12 text-gray-400 mx-auto mb-3"
            />
            <h3 class="text-lg font-medium text-gray-900 mb-1">
              No Tickets Available
            </h3>
            <p class="text-gray-600 text-sm">
              This event doesn't have any ticket types configured yet.
            </p>
          </div>

        <!-- Ticket Selection -->
<div v-else class="space-y-4 mb-8">
  <div v-for="ticket in tickets" :key="ticket.id" class="space-y-2">
    
    <!-- Ticket Card -->
    <div class="bg-white rounded-xl shadow-lg p-4 relative">
      <!-- Dynamic Ticket Type Badge -->
      <div
        :class="[
          'absolute top-0 left-0 px-3 py-2 rounded-lg text-xs font-semibold text-white',
          getTicketTypeBadgeColor(ticket.type),
        ]"
      >
        {{ ticket.type }}
      </div>

      <div class="pt-6">
        <!-- Ticket Description -->
        <p class="text-gray-700 mb-3 text-sm leading-relaxed">
          {{ ticket.description || "No description available" }}
        </p>

        <div class="flex items-center justify-between">
          <!-- Price Display -->
          <div class="flex flex-col">
            <span class="text-2xl font-bold text-purple-600">
              ${{ formatPrice(ticket.price) }}
            </span>
          </div>

          <!-- Quantity Controls -->
          <div class="flex items-center space-x-3">
            <Button
              icon="pi pi-minus"
              class="!w-8 !h-8 !min-w-0 !min-h-0 !p-0 text-gray-600 border border-gray-300 hover:bg-gray-50 hover:border-purple-300 transition-colors duration-200"
              @click="updateQuantity(ticket.id, -1)"
              :disabled="ticket.quantity === 0 || !isTicketAvailable(ticket)"
            />
            <span
              class="text-lg font-semibold text-gray-800 w-8 text-center bg-gray-50 py-1 rounded"
            >
              {{ ticket.quantity }}
            </span>
            <Button
              icon="pi pi-plus"
              class="!w-8 !h-8 !min-w-0 !min-h-0 !p-0 text-white bg-purple-600 border border-purple-600 hover:bg-purple-700 transition-colors duration-200"
              @click="updateQuantity(ticket.id, 1)"
              :disabled="!canAddTicket(ticket)"
            />
          </div>
        </div>

        <!-- Sold out or inactive indicator -->
        <div
          v-if="!isTicketAvailable(ticket)"
          class="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg"
        >
          <div class="flex items-center text-red-700 text-sm">
            <Icon
              name="heroicons:exclamation-triangle"
              class="w-4 h-4 mr-2"
            />
            <span v-if="!ticket.is_active">
              This ticket type is currently inactive
            </span>
            <span v-else>
              This ticket type is currently sold out
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Reward Box (outside the card, but tied to ticket) -->
    <div
      v-if="getApplicablePromotions(ticket.id).length > 0"
      class="p-3 bg-purple-50 border border-purple-300 rounded-lg"
    >
      <div class="flex items-center space-x-2">
        <img :src="star" alt="star" class="w-6 h-6" />
        <div class="text-purple-700 text-xs">
          <span class="font-medium">
            {{ getApplicablePromotions(ticket.id)[0].description }}
          </span>
        </div>
      </div>
    </div>
  </div>
</div>

        </div>

        <div v-else-if="activeDetailTab === 'breakout'">
          <!-- Breakout Room Content -->
          <div class="space-y-4 mb-8">
            <div
              v-for="room in breakoutRooms"
              :key="room.id"
              class="bg-white rounded-xl border border-gray-200 shadow-md p-4 relative"
            >
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="font-semibold text-gray-800 mb-8">
                    {{ room.title }}
                  </h4>
                  <div class="flex items-center text-gray-600 text-sm mb-1">
                    <Icon name="heroicons:clock" class="w-4 h-4 mr-1" />
                    <span>{{ room.time }}</span>
                  </div>
                  <div class="flex items-center text-gray-600 text-sm">
                    <Icon name="heroicons:user" class="w-4 h-4 mr-1" />
                    <span
                      >{{ room.speaker }} | Joined
                      {{ room.joinedPeople }} people</span
                    >
                  </div>
                </div>
                <span
                  class="px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r from-blue-800 to-purple-600"
                >
                  {{ room.roomNumber }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <!-- Payment Summary -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            Payment Summary
          </h3>
          <div class="space-y-3 text-gray-700">
            <div class="flex justify-between">
              <span>Subtotal</span>
              <span class="font-medium">${{ subtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <InputText
                v-model="voucherCode"
                placeholder="Enter Voucher code"
                class="flex-1 p-3 rounded-lg bg-gray-100 mr-2 cursor-not-allowed opacity-50"
                disabled
              />
              <Button
                label="Apply"
                class="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed opacity-50"
                disabled
              />
            </div>
            <div class="flex justify-between">
              <span>Discount {{ (discountRate * 100).toFixed(0) }}%</span>
              <span class="font-medium">-${{ discount.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Tax {{ (taxRate * 100).toFixed(0) }}%</span>
              <span class="font-medium">${{ tax.toFixed(2) }}</span>
            </div>
            <div
              class="flex justify-between pt-4 border-t border-gray-200 text-lg font-bold text-gray-800"
            >
              <span>Total</span>
              <span>${{ total.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Payment Method -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            Payment Method
          </h3>
          <div class="space-y-4">
            <div class="flex items-center">
              <RadioButton
                v-model="paymentMethod"
                inputId="offline"
                value="offline"
              />
              <label for="offline" class="ml-2 text-gray-700"
                >Cash/Offline Payment</label
              >
            </div>
            <div class="flex items-center cursor-not-allowed opacity-50">
              <RadioButton
                v-model="paymentMethod"
                inputId="abapay"
                value="abapay"
                disabled
              />
              <label for="abapay" class="ml-2 text-gray-500 cursor-not-allowed">ABA Pay</label>
            </div>

            <!-- Transaction ID field for ABA Pay -->
            <div v-if="paymentMethod === 'abapay'" class="mt-3 ml-6">
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >ABA Transaction ID *</label
              >
              <InputText
                v-model="transactionId"
                placeholder="Enter ABA transaction ID"
                class="w-full p-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                :class="{
                  'border-red-300 focus:border-red-500 focus:ring-red-500':
                    paymentMethod === 'abapay' && !transactionId,
                }"
              />
              <p
                v-if="paymentMethod === 'abapay' && !transactionId"
                class="text-red-600 text-sm mt-1"
              >
                Transaction ID is required for ABA Pay
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Fixed Payment Summary, Method, and Button -->
      <div class="bg-white">
        <!-- Customer Info Status -->
        <div
          v-if="!props.isCustomerInfoComplete"
          class="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4"
        >
          <div class="flex items-center">
            <Icon
              name="heroicons:exclamation-triangle"
              class="w-4 h-4 text-orange-600 mr-2"
            />
            <span class="text-orange-800 text-sm font-medium"
              >Please complete customer information first</span
            >
          </div>
        </div>

        <!-- Payment Info Status -->
        <div
          v-if="!isPaymentInfoComplete"
          class="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4"
        >
          <div class="flex items-center">
            <Icon
              name="heroicons:exclamation-triangle"
              class="w-4 h-4 text-orange-600 mr-2"
            />
            <span class="text-orange-800 text-sm font-medium"
              >Please enter ABA transaction ID</span
            >
          </div>
        </div>



        <!-- Footer Button -->
        <Button
          :label="
            props.isProcessingBooking ? 'Processing...' : 'Complete Booking'
          "
          :disabled="
            !props.isCustomerInfoComplete ||
            props.isProcessingBooking ||
            !hasSelectedTickets ||
            !isPaymentInfoComplete
          "
          :class="[
            'w-full py-3 rounded-xl font-semibold transition-all duration-200',
            props.isCustomerInfoComplete &&
            hasSelectedTickets &&
            isPaymentInfoComplete &&
            !props.isProcessingBooking
              ? 'text-white bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-700 hover:to-purple-500'
              : 'text-gray-500 bg-gray-300 cursor-not-allowed',
          ]"
          @click="handleCompleteBooking"
        >
          <Icon
            v-if="props.isProcessingBooking"
            name="eos-icons:loading"
            class="w-5 h-5 mr-2 animate-spin"
          />
        </Button>
      </div>
    </div>
  </Sidebar>
</template>
<script setup>
import { ref, computed, onMounted, watch } from "vue";
import Sidebar from "primevue/sidebar";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import RadioButton from "primevue/radiobutton";
import star from "@/assets/image/star.png";
// Import API functions
import { getEventTicketTypes, getEventPromotions } from "~/composables/api"; // adjust path if needed

const props = defineProps({
  visible: { type: Boolean, required: true },
  selectedEvent: { type: Object, default: null },
  customerInfo: { type: Object, default: () => ({}) },
  existingUserData: { type: Object, default: null },
  currentCustomerId: { type: [String, Number], default: null },
  activeCustomerTab: { type: String, default: "phone" },
  isCustomerInfoComplete: { type: Boolean, default: false },
  isProcessingBooking: { type: Boolean, default: false },
});

const emit = defineEmits(["update:visible", "complete-booking"]);

// v-model handling for sidebar
const visible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value),
});

const activeDetailTab = ref("ticket");

// Tickets from API
const tickets = ref([]);
const ticketsLoading = ref(false);
const ticketsError = ref("");

// Organizers from API
const organizers = ref([]);

// Promotions from API
const promotions = ref([]);
const appliedPromotions = ref([]);

// Helper function to get ticket type badge color
const getTicketTypeBadgeColor = (ticketType) => {
  const type = ticketType?.toLowerCase() || "";

  if (type.includes("premium") || type.includes("vip")) {
    return "bg-gradient-to-r from-[#FFA100] to-[#FFCA61]";
  } else if (type.includes("executive") || type.includes("business")) {
    return "bg-gradient-to-r from-[#8E2DE2] to-[#FF6B81]";
  } else if (type.includes("standard") || type.includes("regular")) {
    return "bg-gradient-to-r from-[#4F46E5] to-[#7C3AED]";
  } else if (type.includes("early") || type.includes("bird")) {
    return "bg-gradient-to-r from-[#059669] to-[#10B981]";
  } else {
    return "bg-gradient-to-r from-[#6B7280] to-[#9CA3AF]";
  }
};

// Helper function to format price
const formatPrice = (price) => {
  return Number(price).toFixed(2);
};

// Helper function to calculate available tickets
const getAvailability = (ticket) => {
  if (!ticket.inventory) return 0;
  // Calculate available = total - sold (reserved can be negative)
  return Math.max(0, ticket.inventory.total - ticket.inventory.sold);
};

// Check if ticket is available for purchase
const isTicketAvailable = (ticket) => {
  if (!ticket.is_active) return false;
  return getAvailability(ticket) > 0;
};

// Check if we can add more of this ticket type
const canAddTicket = (ticket) => {
  if (!isTicketAvailable(ticket)) return false;

  // Check if adding one more would exceed available inventory
  const available = getAvailability(ticket);
  return ticket.quantity + 1 <= available;
};

// Breakout rooms (this could be fetched from API as well)
const breakoutRooms = ref([
  {
    id: 1,
    title: "Tech Innovation Workshop",
    time: "10:00 AM - 11:30 AM",
    speaker: "Dr. Sarah Chen",
    joinedPeople: 25,
    roomNumber: "Room A",
  },
  {
    id: 2,
    title: "Digital Marketing Strategies",
    time: "2:00 PM - 3:30 PM",
    speaker: "Mark Johnson",
    joinedPeople: 18,
    roomNumber: "Room B",
  },
]);

// Watch event and fetch tickets when sidebar opens
watch(
  () => props.selectedEvent,
  async (newEvent) => {

    if (newEvent?.id) {
  

      ticketsLoading.value = true;
      ticketsError.value = "";

      try {
        const res = await getEventTicketTypes(newEvent.id);


        // Handle the correct API response format
        let ticketList = [];
        if (
          res?.success &&
          res?.data?.ticket_types &&
          Array.isArray(res.data.ticket_types)
        ) {
          // New API format: { success: true, data: { ticket_types: [...] } }
          ticketList = res.data.ticket_types;
        } else if (Array.isArray(res)) {
          // Fallback: Direct array
          ticketList = res;
        } else if (res?.data && Array.isArray(res.data)) {
          // Fallback: { data: [...] }
          ticketList = res.data;
        } else if (res?.ticketTypes && Array.isArray(res.ticketTypes)) {
          // Fallback: { ticketTypes: [...] }
          ticketList = res.ticketTypes;
        } else {
          ticketList = [];
        }


        // Extract organizers if available
        if (
          res?.success &&
          res?.data?.organizers &&
          Array.isArray(res.data.organizers)
        ) {
          organizers.value = res.data.organizers;
        } else {
          organizers.value = [];
        }

        // Fetch promotions separately
        try {
          const promotionsRes = await getEventPromotions(newEvent.id);

          if (
            promotionsRes?.success &&
            promotionsRes?.data &&
            Array.isArray(promotionsRes.data)
          ) {
            const now = new Date();
            promotions.value = promotionsRes.data.filter((promo) => {
              const startDate = new Date(promo.start_date);
              const endDate = new Date(promo.end_date);
              const isActive =
                promo.is_active && now >= startDate && now <= endDate;

              return isActive;
            });
          } else {
            promotions.value = [];
          }
        } catch (promotionError) {
          console.error("❌ Failed to fetch promotions:", promotionError);
          promotions.value = [];
        }

        tickets.value = ticketList.map((ticket) => ({
          id: ticket.id,
          event_id: ticket.event_id,
          type: ticket.name || ticket.type || "Standard",
          description:
            ticket.tag || ticket.description || "No description available",
          price: Number(ticket.price) || 0,
          quantity: 0,
          is_active: ticket.is_active,
          sort_order: ticket.sort_order,
          breakout_room_ids: ticket.breakout_room_ids,
          // Enhanced inventory information from the new API format
          inventory: ticket.inventory
            ? {
                id: ticket.inventory.id,
                ticket_type_id: ticket.inventory.ticket_type_id,
                total: ticket.inventory.total,
                available: ticket.inventory.total - ticket.inventory.sold, // Calculate available
                reserved: ticket.inventory.reserved,
                sold: ticket.inventory.sold,
                created_at: ticket.inventory.created_at,
                updated_at: ticket.inventory.updated_at,
              }
            : null,
          // Keep original ticket data for reference
          _original: ticket,
        }));
      } catch (err) {
        console.error("❌ Failed to load tickets:", err);
        ticketsError.value = err.message || "Failed to load ticket types";
        tickets.value = []; // Clear tickets on error
        organizers.value = []; // Clear organizers on error
        promotions.value = []; // Clear promotions on error
        appliedPromotions.value = []; // Clear applied promotions on error
      } finally {
        ticketsLoading.value = false;
      }
    } else {
      tickets.value = [];
      organizers.value = [];
      promotions.value = [];
      appliedPromotions.value = [];
      ticketsError.value = "";
      ticketsLoading.value = false;
    }
  },
  { immediate: true }
);

const updateQuantity = (ticketId, change) => {
  const ticket = tickets.value.find((t) => t.id === ticketId);
  if (ticket) {
    const newQuantity = ticket.quantity + change;

    // Ensure we don't go below 0
    if (newQuantity < 0) return;

    // Check availability for increase
    if (change > 0 && !canAddTicket(ticket)) {
      console.warn("Cannot add more tickets - exceeds available inventory");
      return;
    }

    ticket.quantity = newQuantity;
  }
};

// Check if a promotion applies to a specific ticket type
const getApplicablePromotions = (ticketTypeId) => {
  return promotions.value.filter(
    (promo) => promo.ticket_type_id === ticketTypeId
  );
};

// Note: Promotion application logic removed - only display is kept

// Get promotion info for display only (no application logic)
const getPromotionDisplay = (ticket) => {
  const applicablePromos = getApplicablePromotions(ticket.id);
  if (applicablePromos.length === 0) return null;

  const promo = applicablePromos[0]; // Take first applicable promotion
  return {
    promotion: promo,
    applied: null, // No application logic
    freeTickets: 0, // No calculation
  };
};

// Payment logic
const voucherCode = ref("");
const appliedVoucher = ref(false);
const discountRate = ref(0);
const taxRate = ref(0);
const paymentMethod = ref("offline");
const transactionId = ref("");

// Check if any tickets are selected
const hasSelectedTickets = computed(() =>
  tickets.value.some((ticket) => ticket.quantity > 0)
);

// Check if payment information is complete
const isPaymentInfoComplete = computed(() => {
  if (paymentMethod.value === "abapay") {
    return transactionId.value && transactionId.value.trim().length > 0;
  }
  return true; // offline payment doesn't require transaction ID
});

const subtotal = computed(() => {
  let total = 0;

  tickets.value.forEach((ticket) => {
    if (ticket.quantity > 0) {
      // Just charge for the tickets selected - promotions don't change the base price
      // The promotion gives free tickets of potentially different types
      total += ticket.price * ticket.quantity;
    }
  });

  return total;
});
const discount = computed(() => subtotal.value * discountRate.value);
const tax = computed(() => (subtotal.value - discount.value) * taxRate.value);
const total = computed(() => subtotal.value - discount.value + tax.value);

const applyVoucher = () => {
  if (voucherCode.value.toLowerCase() === "v0discount") {
    discountRate.value = 0.1;
    appliedVoucher.value = true;
  } else {
    discountRate.value = 0;
    appliedVoucher.value = false;
  }
};

// Check if customer has contact information
const hasCustomerContact = () => {
  if (!props.customerInfo) return false;

  // Check based on active tab
  if (props.activeCustomerTab === "email") {
    return props.customerInfo.email && props.customerInfo.email.trim();
  } else {
    return (
      props.customerInfo.phoneNumber && props.customerInfo.phoneNumber.trim()
    );
  }
};

// Get customer contact information (email or phone)
const getCustomerContact = () => {
  if (!props.customerInfo) {
    return "-";
  }

  // Show based on active tab preference
  if (props.activeCustomerTab === "email") {
    if (props.customerInfo.email && props.customerInfo.email.trim()) {
      return props.customerInfo.email.trim();
    }
    return "-";
  } else {
    // Default to phone tab
    if (
      props.customerInfo.phoneNumber &&
      props.customerInfo.phoneNumber.trim()
    ) {
      return `+${props.customerInfo.phoneNumber.trim()}`;
    }
    return "-";
  }
};

// Get booking name - prioritize authenticated user's name over manual input
const getBookingName = () => {;

  // 1. First priority: Use authenticated user's name from existingUserData (when user ALREADY EXISTS)
  if (props.existingUserData?.fullName || props.existingUserData?.full_name || props.existingUserData?.name) {
    const authenticatedName = props.existingUserData.fullName || props.existingUserData.full_name || props.existingUserData.name;
    return authenticatedName;
  }
  
  // 2. Second priority: If we have a customer ID but no existingUserData, 
  //    this means account was just CREATED - construct from firstName + lastName (NOT fullName field)
  if (props.currentCustomerId && props.customerInfo) {
    
    // For NEW USERS: ALWAYS construct from firstName + lastName (ignore fullName field)
    const firstName = props.customerInfo.firstName || props.customerInfo.first_name || '';
    const lastName = props.customerInfo.lastName || props.customerInfo.last_name || '';
    
    
    if (firstName && lastName) {
      const constructedName = `${firstName} ${lastName}`.trim();

      return constructedName;
    }
    
    // If only one name is available
    if (firstName || lastName) {
      const constructedName = `${firstName} ${lastName}`.trim();

      return constructedName;
    }
    
    // Fallback to name field if firstName/lastName not available
    if (props.customerInfo.name) {

      return props.customerInfo.name;
    }
    
    // Last fallback to fullName for new users (should not be used normally)
    if (props.customerInfo.fullName) {
      console.log('⚠️ NEW USER Using fullName fallback (unexpected):', props.customerInfo.fullName);
      return props.customerInfo.fullName;
    }
  }
  
  // 3. Third priority: Manual entry case (no customer ID, but has customerInfo)
  if (props.customerInfo && !props.currentCustomerId) {
    // For manual entry, also prioritize firstName + lastName construction
    const firstName = props.customerInfo.firstName || props.customerInfo.first_name || '';
    const lastName = props.customerInfo.lastName || props.customerInfo.last_name || '';
    
    if (firstName || lastName) {
      const constructedName = `${firstName} ${lastName}`.trim();

      return constructedName;
    }
    
    // Fallback to fullName for manual entry
    if (props.customerInfo.fullName) {

      return props.customerInfo.fullName;
    }
    
    // Fallback to name field if available
    if (props.customerInfo.name) {

      return props.customerInfo.name;
    }
  }
  
  // 4. No authenticated user - return null to show warning
  console.log('⚠️ No authenticated user name available for booking');
  return null;
};

const handleCompleteBooking = () => {
  const bookingDetails = {
    event: props.selectedEvent,
    tickets: tickets.value
      .filter((t) => t.quantity > 0)
      .map((ticket) => ({
        ...ticket,
        // Promotion display info kept but no application logic
        promotionInfo: getPromotionDisplay(ticket),
      })),
    customer: {
      // Include the constructed full name for reservation
      fullName: getBookingName(),
      contact: getCustomerContact(),
      customerId: props.currentCustomerId,
      customerInfo: props.customerInfo,
      existingUserData: props.existingUserData,
    },
    paymentSummary: {
      subtotal: subtotal.value,
      discount: discount.value,
      tax: tax.value,
      total: total.value,
      voucherCode: voucherCode.value,
      appliedVoucher: appliedVoucher.value,
    },
    paymentMethod: paymentMethod.value,
    transactionId:
      paymentMethod.value === "abapay"
        ? transactionId.value.trim() || null
        : null,
  };
  emit("complete-booking", bookingDetails);
};
</script>
<style scoped>
/* Custom gradient for text */

/* PrimeVue component overrides for consistent styling */
:deep(.p-sidebar-content) {
  padding: 0 !important; /* Remove default padding to control it manually */
}
:deep(.p-button.p-button-text) {
  background-color: transparent !important;
  border-color: transparent !important;
  color: inherit !important;
}
:deep(.p-button.p-button-text:hover) {
  background-color: var(--surface-hover) !important;
}
:deep(.p-inputtext) {
  @apply focus:ring-0 focus:ring-purple-500 focus:border-purple-500;
}
:deep(.p-radiobutton .p-radiobutton-box) {
  border-color: #d1d5db; /* gray-300 */
}
:deep(.p-radiobutton .p-radiobutton-box.p-highlight) {
  border-color: #8b5cf6; /* purple-500 */
  background-color: #8b5cf6; /* purple-500 */
}
:deep(.p-radiobutton .p-radiobutton-box.p-highlight .p-radiobutton-icon) {
  background-color: #ffffff; /* white dot */
}
</style>
