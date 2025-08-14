<template>
  <div class=" bg-[#F8F8FF] p-4 ">
    <!-- Header with Tabs -->
    <div class="flex items-center justify-between mb-6 mt-2">
      <h1 class="text-3xl font-bold text-purple-600">Booking Service</h1>
      <div class="flex items-center gap-4">
        <!-- Tabs (Custom HTML/Tailwind with gradient) -->
        <div class="flex bg-gray-100 rounded-full ">
          <button
            @click="activeTab = 'customer'"
            :class="[
              'px-6 py-2 rounded-full font-medium transition-all duration-300 ease-in-out',
              activeTab === 'customer'
                ? 'bg-gradient-to-r from-blue-800 to-purple-600 text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:text-purple-600 hover:bg-white hover:shadow-md',
            ]"
          >
            Book for Customer
          </button>
          <button
            @click="activeTab = 'payment'"
            :class="[
              'px-6 py-2 rounded-full font-medium transition-all duration-300 ease-in-out',
              activeTab === 'payment'
                ? 'bg-gradient-to-r from-blue-800 to-purple-600 text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:text-purple-600 hover:bg-white hover:shadow-md',
            ]"
          >
            Cash Payment
          </button>
        </div>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <CustomerBooking v-if="activeTab === 'customer'" />
      <CashPayment v-else-if="activeTab === 'payment'" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CustomerBooking from '~/components/Booking/CustomerBookng.vue'
import CashPayment from '~/components/Booking/CasePayement.vue'

definePageMeta({
  layout: "admin",
})

// Active tab state
const activeTab = ref('customer') // 'customer' or 'payment'
</script>

<style scoped>
/* No specific scoped styles needed here, as children components handle their own. */
</style>
