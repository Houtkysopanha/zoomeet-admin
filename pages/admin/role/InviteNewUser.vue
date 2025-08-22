<template>
  <div class="p-4 bg-gray-50 min-h-screen font-sans text-gray-700">
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <Breadcrumb
            :items="[
              { text: 'Event', to: '/admin/event' },
              { text: 'Manage Team', to: '/admin/role/ManageTeam' },
            { text: 'Invite New User' }
            ]"
            class="mb-2"
          />
        </div>
        <IconnButton label="Send Invitation" icon="lets-icons:send-fill" @click="inviteUser()" />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-2xl p-10">
        <h2 class="text-xl font-semibold mb-2">Invite a team member</h2>
        <p class="text-sm text-gray-500 mb-6">Search by name or email or phone select a role and send an invitation.</p>
        
        <div class="space-y-6">
          <div>
            <label for="contact" class="block text-sm font-medium text-gray-700 mb-2">Phone Number or Email</label>
            <input
              type="text"
              id="contact"
              v-model="newUser.contact"
              placeholder="Enter phone number or email"
              class="w-full px-4 py-3 bg-gray-100 border-none rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              @input="validateContact"
            />
            <p v-if="contactError" class="text-xs text-red-500 mt-2">Type at least 3 characters</p>
          </div>

          <div>
            <label for="note" class="block text-sm font-medium text-gray-700 mb-2">Optional Note</label>
            <textarea
              id="note"
              v-model="newUser.note"
              placeholder="Take note"
              rows="4"
              class="w-full px-4 py-3 bg-gray-100 border-none rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
            ></textarea>
          </div>
        </div>

        <div v-if="!newUser.contact && !users.length" class="flex flex-col items-center justify-center mt-12 mb-4">
          <img src="../../../assets/image//not-found.png" alt="Not have user yet" class="w-32 h-32 opacity-70" />
          <p class="text-sm text-gray-400 mt-4">Not have user yet</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-10">
        <h2 class="text-xl font-semibold mb-2">Role Assignment</h2>
        <p class="text-sm text-gray-500 mb-6">Pick a permission for the team to access the team coordinator.</p>

        <div class="space-y-4">
          <div class="bg-white shadow-xl p-4 rounded-2xl ">
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-gray-800">Event Management</span>
              <InputSwitch v-model="permissions.eventManagement.enabled" />
            </div>
            <div class="border border-1 border-gray-200 my-5"></div>
             <p class="text-sm font-semibold text-gray-800">Permission</p>
            <div  class="flex flex-wrap gap-2 mt-3 ml-1">
              <span class="text-xs font-medium text-blue-900 bg-gray-100 px-3 py-1 rounded-full">Manage Event</span>
              <span class="text-xs font-medium text-blue-900 bg-gray-100 px-3 py-1 rounded-full">Manage Ticket</span>
              <span class="text-xs font-medium text-blue-900 bg-gray-100 px-3 py-1 rounded-full">Refund</span>
            </div>
          </div>

         <div class="bg-white shadow-xl p-4 rounded-2xl ">
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-gray-800">Booking</span>
              <InputSwitch v-model="permissions.booking.enabled" />
            </div>
            <div class="border border-1 border-gray-200 my-5"></div>
             <p class="text-sm font-semibold text-gray-800">Permission</p>
            <div  class="flex flex-wrap gap-2 mt-3 ml-1">
              <span class="text-xs font-medium text-blue-900 bg-gray-100 px-3 py-1 rounded-full">Staff Support Booking</span>
              <span class="text-xs font-medium text-blue-900 bg-gray-100 px-3 py-1 rounded-full">Cash Payment</span>
            
            </div>
          </div>

        <div class="bg-white shadow-xl p-4 rounded-2xl ">
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-gray-800">Check-In</span>
              <InputSwitch v-model="permissions.checkIn.enabled" />
            </div>
            <div class="border border-1 border-gray-200 my-5"></div>
             <p class="text-sm font-semibold text-gray-800">Permission</p>
            <div  class="flex flex-wrap gap-2 mt-3 ml-1">
              <span class="text-xs font-medium text-blue-900 bg-gray-100 px-3 py-1 rounded-full">Check-In Service</span>
            </div>
          </div>

          <div class="bg-white shadow-xl p-4 rounded-2xl ">
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-gray-800">Report</span>
              <InputSwitch v-model="permissions.report.enabled" />
            </div>
            <div class="border border-1 border-gray-200 my-5"></div>
             <p class="text-sm font-semibold text-gray-800">Permission</p>
            <div  class="flex flex-wrap gap-2 mt-3 ml-1">
              <span class="text-xs font-medium text-blue-900 bg-gray-100 px-3 py-1 rounded-full">Financial Report</span>
              <span class="text-xs font-medium text-blue-900 bg-gray-100 px-3 py-1 rounded-full">Business Insight</span>
              <span class="text-xs font-medium text-blue-900 bg-gray-100 px-3 py-1 rounded-full">Audit Log</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import InputSwitch from 'primevue/inputswitch';

const newUser = ref({ contact: '', note: '' });
const contactError = ref(false);
const users = ref([]);
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import IconnButton from '~/components/ui/IconnButton.vue'

const permissions = ref({
  eventManagement: { enabled: false },
  booking: { enabled: false },
  checkIn: { enabled: false },
  report: { enabled: false },
});

const validateContact = () => {
  contactError.value = newUser.value.contact.length > 0 && newUser.value.contact.length < 3;
};
definePageMeta({
  layout: "admin",
})
</script>

<style scoped>
/* PrimeVue overrides to match the UI */
:deep(.p-inputswitch .p-inputswitch-slider) {
  background: #e5e7eb; /* gray-200 */
  transition-duration: 200ms;
}

:deep(.p-inputswitch.p-inputswitch-checked .p-inputswitch-slider) {
  background: #7a49c9; /* Custom purple from the image */
}
</style>