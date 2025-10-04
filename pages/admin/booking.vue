<template>
  <div class=" bg-[#F8F8FF] p-4 ">
    <!-- Header with Tabs -->
    <div class="flex items-center justify-between mb-6 mt-2">
      <h1 class="text-3xl font-bold text-purple-600">Booking Service</h1>
      <div class="flex items-center gap-4">
        <!-- Tabs (Custom HTML/Tailwind with gradient) -->
        <div class="flex bg-gray-100 space-x-2 rounded-full ">
          <button
            @click="activeTab = 'customer'"
            :disabled="true"
            :class="[
              'px-6 py-2 rounded-full font-medium transition-all duration-300 ease-in-out cursor-not-allowed opacity-50',
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
      <div v-if="activeTab === 'customer'">
        <ClientOnly>
          <CustomerBooking />
          <template #fallback>
            <div class="flex items-center justify-center h-64">
              <div class="text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p class="text-gray-600">Loading booking form...</p>
              </div>
            </div>
          </template>
        </ClientOnly>
      </div>
      <div v-else-if="activeTab === 'payment'">
        <CashPayment />
      </div>
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
const activeTab = ref('payment') // 'customer' or 'payment'
</script>

<style scoped>
/* No specific scoped styles needed here, as children components handle their own. */
</style>
