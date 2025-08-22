<template>
  <div class="p-4 bg-[#F8F8FF] min-h-screen">
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <Breadcrumb
            :items="[
              { text: 'Event', to: '/admin/event' },
              { text: 'Manage Team' }
            ]"
            class="mb-2"
          />
        </div>
        <IconnButton label="Invite new user" icon="mingcute:user-add-2-fill" @click="inviteUser()" />
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
      <EventCard
        :image-src="poster"
        alt-text="Cybersecurity Event 2025"
        event-title="Cybersecurity Summit 2025"
        owner="John Doe"
        location="Sokha Hotel, Phnom Penh"
        date="20-22 August, 2025"
        time="9:00 AM GMT+7"
      />
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CardCommon
          v-for="(stat, index) in eventStats"
          :key="index"
          :title="stat.title"
          :count="stat.count"
          :icon="stat.icon"
          :weekChange="stat.weekChange"
            :style="index !== 0 ? { visibility: 'hidden' } : {}"
        />
      </div>
    </div>

    <!-- Filters and Search -->
     <div class="mb-6 flex items-center justify-between mt-10  rounded-lg">
     <div class="flex items-center space-x-4">
  <div class="relative w-full">
    <div class="border border-gray-300 rounded-full overflow-hidden flex">
      <div class="relative flex-1">
        <Icon name="i-heroicons-magnifying-glass" class="absolute w-8 h-8 left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search"
          class="w-full pl-14  border-0 focus:ring-0 focus:outline-none bg-transparent p-3 rounded-full"
        />
      </div>
      <div class=" relative space-x-5">
     <Icon name="mynaui:filter" class="absolute w-8 h-8 left-3 top-1/2 bg-gradient-to-t from-blue-900 to-purple-800 transform -translate-y-1/2 text-grad" />
       <Button
          label="Filters"
          class="p-button-outlined px-5  text-purple-600 border-purple-600 w-full h-full rounded-none p-3"
          @click="toggleFilters"
        />
      </div>
    </div>
  </div>
</div>

    <div class="flex items-center space-x-4">
  <div class="relative">
    <!-- <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium">Sort</span> -->
    <Dropdown
      v-model="sortOption"
      :options="sortOptions"
      optionLabel="label"
      optionValue="value"
      class="w-30 p-dropdown-sm border bg-transparent border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg"
      @change="applySort"
    >
      <template #value="slotProps">
       <!-- <i class="pi pi-sort-amount-up mr-2 text-black"></i> -->
        <span v-if="slotProps.value" class="">{{ slotProps.value }}</span>
        <span v-else class="ml-14 text-black"></span>
      </template>
    </Dropdown>
    <span class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></span>
  </div>
    <p class="text-xl font-normal text-gray-700">Show</p>
  <Dropdown
    v-model="itemsPerPage"
    :options="pageOptions"
    optionLabel="label"
    optionValue="value"
    placeholder=""
    class=" border border-gray-300 bg-transparent rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
    @change="applyPageChange"
  />
  <span class="text-lg text-gray-700  border-l pl-2 border-gray-500"> Show {{ currentPage * itemsPerPage - (itemsPerPage - 1) }} to {{ Math.min(currentPage * itemsPerPage, totalItems) }} of {{ totalItems }}</span>
</div>
    </div>

    <!-- Datatable -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
        <DataTable
          :value="users"
          :paginator="true"
          :rows="itemsPerPage"
          :totalRecords="users.length"
          dataKey="id"
          class="p-datatable-gridlines"
          scrollable
          responsiveLayout="scroll"
        >
        <Column field="user" header="User" sortable class="text-[14px] border-b border-gray-300 ">
          <template #body="{ data }">
            <div class="flex items-center gap-2 ">
              <img :src="data.avatar" alt="User Avatar" class="w-8 h-8 rounded-full" />
              <div>
                 <span>{{ data.user }}</span>
            <p class="text-[12px] text-gray-600 text-justify pr-6">
              <span>{{ data.email }}</span>
            </p>
              </div>
            </div>
          </template>
        </Column>
        <Column field="phoneNumber" header="Phone Number" sortable class="text-[14px] border-b border-gray-300 "></Column>
        <Column field="optionalNote" header="Optional Note" class="text-[14px] border-b border-gray-300 "></Column>
        <Column field="permissions" header="Permissions" class="text-[14px] border-b border-gray-300 ">
          <template #body="{ data }">
            <span v-for="(perm, index) in data.permissions" :key="index" class="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full mr-1">
              {{ perm }}
            </span>
          </template>
        </Column>
        <Column field="status" header="Status" class="text-[14px] border-b border-gray-300 ">
          <template #body="{ data }">
            <span :class="['px-2 py-1 rounded-full text-xs font-medium', {
              'bg-green-100 text-green-800': data.status === 'Active',
              'bg-red-100 text-red-800': data.status === 'Inactive'
            }]">
              {{ data.status }}
            </span>
          </template>
        </Column>
        <Column header="Actions" class="text-[14px] border-b border-gray-300 ">
          <template #body="{ data }">
            <Button
              icon="pi pi-ellipsis-v"
              class="p-button-text p-button-sm text-gray-500"
              @click="toggleMenu($event, data)"
            />
            <Menu ref="menu" :model="menuItems" :popup="true" />
          </template>
        </Column>
      </DataTable>
    </div>
    <!-- Invite User Dialog -->
    <Dialog v-model:visible="showInviteDialog" header="Invite New User" :modal="true" class="w-full md:w-1/2">
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700">Email</label>
        <InputText v-model="newUser.email" class="mt-1 w-full rounded-md" />
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700">Role</label>
        <Dropdown v-model="newUser.role" :options="roles" optionLabel="name" class="w-full mt-1 rounded-md" />
      </div>
      <div class="flex justify-end gap-2">
        <Button label="Cancel" class="p-button-text" @click="showInviteDialog = false" />
        <Button label="Invite" class="p-button-purple rounded-full" @click="inviteUser" />
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { navigateTo } from '#app' // Nuxt 3 navigation helper
import IconnButton from '~/components/ui/IconnButton.vue'
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import EventCard from '~/components/common/EventCard.vue'
import CardCommon from '~/components/common/CardCommon.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import Menu from 'primevue/menu'
import Button from 'primevue/button' // Import PrimeVue Button
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import poster from '@/assets/image/poster-manage-booking.png'

const router = useRouter()
const toast = useToast()

// const goToManageTicket = () => {
//   router.push('/InviteNewUser')
// }
const teamStats = [
  { title: 'Total Members', count: '23', icon: 'material-symbols-light:people', weekChange: '2' },
  { title: 'Active Users', count: '10', icon: 'mdi:account-check', weekChange: '1' },
];

const users = ref([
  { id: 1, user: 'Olivia Ryhe', email: 'test@gmail.com', avatar: poster, phoneNumber: '0123456789', optionalNote: 'Help manage event booking', permissions: ['Check-in Service', 'Booking Service'], status: 'Active' },
  { id: 2, user: 'Phoenix Baker', email: 'test@gmail.com', avatar: poster, phoneNumber: '0123456789', optionalNote: 'Help manage event booking', permissions: ['Event Management', 'Booking Service'], status: 'Active' },
  { id: 3, user: 'Lana Steiner', email: 'test@gmail.com', avatar: poster, phoneNumber: '0123456789', optionalNote: 'Help manage event booking', permissions: ['Check-in Service', 'Booking Service'], status: 'Inactive' },
  { id: 4, user: 'Candice Wu', email: 'test@gmail.com', avatar: poster, phoneNumber: '0123456789', optionalNote: 'Help manage event booking', permissions: ['Check-in Service'], status: 'Active' },
  { id: 5, user: 'Natali Craig', email: 'test@gmail.com', avatar: poster, phoneNumber: '0123456789', optionalNote: 'Help manage event booking', permissions: ['Check-in Service'], status: 'Inactive' },
  { id: 6, user: 'Drew Cano', email: 'test@gmail.com', avatar: poster, phoneNumber: '0123456789', optionalNote: 'Help manage event booking', permissions: ['Report', 'Event Service'], status: 'Inactive' },
]);

const roles = ref([
  { name: 'Admin', id: 1 },
  { name: 'Editor', id: 2 },
  { name: 'Viewer', id: 3 },
]);

const eventStats = [
  { title: 'Team', count: '28', icon: 'fluent:people-team-24-filled', weekChange: '2' },
  { title: 'Total Booking', count: '23', icon: 'material-symbols-light:order-approve', weekChange: '2', },
  { title: 'Total Refund', count: '5', icon: 'mdi:recurring-payment', weekChange: '2' },
  { title: 'Fail Payment', count: '24', icon: 'icon-park-outline:database-fail', weekChange: '2' },
]

const searchQuery = ref('')
const itemsPerPage = ref(10)

const currentPage = ref(1)
const totalItems = ref(206) // Example total, replace with actual count from API


const sortOption = ref('Sort') // Initialize to null or a default value
const sortOptions = ref([
  { label: 'Booking Name (Asc)', value: 'bookingName-asc' },
  { label: 'Booking Name (Desc)', value: 'bookingName-desc' },
  { label: 'Purchase Date (Asc)', value: 'purchaseDate-asc' },
  { label: 'Purchase Date (Desc)', value: 'purchaseDate-desc' },
])

const pageOptions = ref([
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '50', value: 50 },
])

const filteredBookings = computed(() => {
  let result = [...bookings.value]

  // Apply search filter
  if (searchQuery.value) {
    const lowerCaseQuery = searchQuery.value.toLowerCase()
    result = result.filter(booking =>
      Object.values(booking).some(value =>
        String(value).toLowerCase().includes(lowerCaseQuery)
      )
    )
  }

  // Apply client-side sorting based on sortOption
  if (sortOption.value) {
    const [field, order] = sortOption.value.split('-')
    result = result.sort((a, b) => {
      let valueA = a[field] || ''
      let valueB = b[field] || ''

      // Handle date comparison if the field is a date
      if (field === 'purchaseDate') {
        valueA = new Date(valueA).getTime()
        valueB = new Date(valueB).getTime()
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return order === 'asc' ? valueA.localeCompare(valueB) : -valueA.localeCompare(valueB)
      } else {
        return order === 'asc' ? valueA - valueB : valueB - valueA
      }
    })
  }

  return result
})

const paginatedBookings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredBookings.value.slice(start, end)
})

const applySort = () => {
  currentPage.value = 1; // Reset to first page on sort change
  // Sorting is handled by the computed property `filteredBookings`
}

const applyPageChange = (event) => {
  itemsPerPage.value = event.value
  currentPage.value = 1 // Reset to first page on items per page change
}

const filteredUsers = computed(() => {
  let result = [...users.value];
  if (searchQuery.value) {
    const lowerCaseQuery = searchQuery.value.toLowerCase();
    result = result.filter(user =>
      Object.values(user).some(value =>
        String(value).toLowerCase().includes(lowerCaseQuery)
      )
    );
  }
  if (sortOption.value) {
    const [field, order] = sortOption.value.split('-');
    result.sort((a, b) => {
      let valueA = a[field];
      let valueB = b[field];
      return order === 'asc' ? valueA.localeCompare(valueB) : -valueA.localeCompare(valueB);
    });
  }
  return result;
});

const toggleFilters = () => {
  // Implement filter modal/sidebar logic here
  toast.add({ severity: 'info', summary: 'Filters', detail: 'Filter functionality to be implemented', life: 3000 })
}

const menu = ref()
const selectedUserForMenu = ref(null)

const editPermission = (userData) => {
  // Route to Edit Permission page with user data
  router.push({
    path: '/admin/role/EditPermission',
    query: {
      userId: userData.id,
      userName: userData.user
    }
  })
}

const menuItems = ref([
  { label: 'Edit Permission', icon: 'pi pi-pencil', command: () => editPermission(selectedUserForMenu.value) },
  { label: 'Disable', icon: 'pi pi-times', command: () => toast.add({ severity: 'warn', summary: 'Disable', detail: 'User disabled', life: 3000 }) },
  { label: 'Remove', icon: 'pi pi-trash', command: () => toast.add({ severity: 'warn', summary: 'Remove', detail: 'User removed', life: 3000 }) },
]);

const toggleMenu = (event, data) => {
  selectedUserForMenu.value = data;
  menu.value.toggle(event);
};

const inviteUser = () => {
  // Route to the Invite New User page (static route for now)
  router.push('/admin/role/InviteNewUser');
};
definePageMeta({
  layout: "admin",
})
</script>

<style scoped>
/* Existing styles */
:deep(.p-calendar) {
  background: transparent !important;
}
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
:deep(.p-datatable .p-datatable-thead > tr) {
  background-color: #F6F9F9;
  color: #667085;
}
:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: transparent;
  color: inherit;
  transition: background-color 0.3s ease;
  padding-top: 1rem; /* Added padding */
  padding-bottom: 1rem; /* Added padding */
}
:deep(.p-datatable .p-datatable-tbody > tr > td) {
  background-color: white;
  color: #1F2937;
  padding-top: 20px;
  padding-bottom: 20px;
}
:deep(.p-datatable .p-datatable-tbody > tr:hover > td) {
  background-color: #E6F2FF;
  transition: background-color 0.3s ease;
}
/* Custom menu styling */
:deep(.p-menu .p-menuitem-link) {
  padding: 0.75rem 1rem;
  display: flex; /* Added for icon alignment */
  align-items: center; /* Added for icon alignment */
  gap: 0.5rem; /* Space between icon and text */
}
:deep(.p-menu .p-menuitem-link:hover) {
  background-color: #f3f4f6;
}
:deep(.p-menu .p-menuitem-separator) {
  margin: 0.25rem 0;
}

/* New styles for search and dropdown */
:deep(.p-dropdown) {
  border-radius: 0.5rem; /* Rounded corners */
  border: 1px solid #D1D5DB; /* Border color */
  box-shadow: none; /* No shadow */
}

:deep(.p-dropdown:not(.p-disabled):focus) {
  outline: 0 none;
  outline-offset: 0;
  box-shadow: 0 0 0 0.2rem rgba(122, 73, 201, 0.25); /* Custom focus ring */
  border-color: #7A49C9; /* Custom border color on focus */
}

:deep(.p-dropdown .p-dropdown-label) {
  padding: 0.5rem 0.75rem; /* Adjust padding */
}

:deep(.p-dropdown-trigger) {
  width: 2rem; /* Adjust trigger width */
}

:deep(.p-dropdown-panel .p-dropdown-items-wrapper) {
  border-radius: 0.5rem;
  overflow: hidden;
}

:deep(.p-dropdown-panel .p-dropdown-item) {
  padding: 0.75rem 1rem;
}

:deep(.p-dropdown-panel .p-dropdown-item:hover) {
  background-color: #f3f4f6;
}

/* PrimeVue DataTable specific overrides for better visual match */
:deep(.p-datatable .p-datatable-header) {
  padding: 0; /* Remove default header padding as we have custom search/filters above */
  border-bottom: none; /* Remove default header border */
}

:deep(.p-datatable .p-datatable-wrapper) {
  border-radius: 0.5rem; /* Apply border-radius to the table wrapper */
  overflow: hidden; /* Ensure content respects border-radius */
}

:deep(.p-datatable .p-datatable-tfoot > tr > td) {
  background-color: white; /* Ensure footer background matches body */
}

:deep(.p-paginator) {
  background-color: white; /* Ensure paginator background matches body */
  border-top: 1px solid #e5e7eb; /* Add a subtle border to separate from table */
  padding: 1rem;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
  @apply bg-gradient-to-tr from-[#4D66A6] to-[#B61EEB] text-white border-none;
  border-color: linear-gradient(79deg, #4D66A6 7.31%, #B61EEB 98.95%);
  border-radius: 10px;
  color: white;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page:not(.p-highlight):hover) {
  background-color: #e6f2ff; /* Hover color for pages */
  color: #7A49C9;
}

:deep(.p-paginator .p-paginator-first,
.p-paginator .p-paginator-prev,
.p-paginator .p-paginator-next,
.p-paginator .p-paginator-last) {
  border-radius: 0.5rem; /* Rounded buttons */
}

:deep(.p-paginator .p-paginator-first:hover,
.p-paginator .p-paginator-prev:hover,
.p-paginator .p-paginator-next:hover,
.p-paginator .p-paginator-last:hover) {
  background-color: #e6f2ff; /* Hover color for navigation buttons */
  color: #7A49C9;
}

:deep(.p-column-header-content) {
  display: flex;
  align-items: center;
  gap: 0.25rem; /* Space between text and sort icon */
}

/* Custom button styling for Filters */
.p-button-purple {
  background: linear-gradient(to top, #4A00B0, #7A49C9); /* Adjusted gradient for better visibility */
  color: white !important; /* Ensure text is white */
  border-color: #7A49C9 !important;
}

.p-button-purple:hover {
  background: linear-gradient(to top, #3A0090, #6A39B9); /* Darker hover state */
}
</style>
