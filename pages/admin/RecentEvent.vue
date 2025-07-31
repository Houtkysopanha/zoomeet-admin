<template>
  <!-- Recent event News -->
  <div class="p-6 bg-transparent rounded-2xl shadow-sm border border-gray-200 h-[calc(80vh-8rem)] overflow-hidden flex flex-col">
    <h2 class="text-xl font-semibold text-gray-900 ">Recent events</h2>

    <div class="flex-1 overflow-y-auto">
      <DataTable
        :value="visibleEvents"
        class="p-datatable-sm p-3"
        responsiveLayout="scroll"
        :rowClass="getRowClass"
        :loading="loading"
      >
        <Column header="Event name" >
          <template #body="slotProps">
            <div class="flex items-start space-x-3">
              <img
                :src="slotProps.data.image"
                class="w-10 h-10 rounded-lg object-cover"
                alt="event"
              />
              <div class="text-sm text-gray-800 leading-tight">
                {{ slotProps.data.name }}
              </div>
            </div>
          </template>
        </Column>

        <Column field="date" header="Date" class="text-sm text-gray-700" />

        <Column header="Revenue" headerClass="text-center">
          <template #body="slotProps">
            <div class="text-sm font-semibold text-gray-900">
              {{ slotProps.data.revenue }}
            </div>
          </template>
        </Column>
      </DataTable>

      <div class="mt-4 flex justify-center">
        <Button
          v-if="!showAll && events.length > visibleEvents.length"
          label="Show more"
          icon="pi pi-chevron-down"
          :loading="loading"
          class="p-button-text  text-blue-900  px-6 py-2  hover:from-blue-600 hover:to-blue-800 hover:shadow-lg transition-all duration-300"
          style="margin-top: -2rem; position: relative; z-index: 10;"
          @click="showMore"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import img from '@/assets/image/poster-manage-booking.png'

const events = ref([
  {
    name: 'Navigating the future of cybersecurity in Cambodia 2015',
    date: '14–16 July, 2025',
    revenue: '$1,280',
    image: img,
  },
  {
    name: 'Navigating the future of cybersecurity in Cambodia 2015',
    date: '14–16 July, 2025',
    revenue: '$1,280',
    image: img,
  },
  {
    name: 'Navigating the future of cybersecurity in Cambodia 2015',
    date: '14–16 July, 2025',
    revenue: '$1,280',
    image: img,
  },
  {
    name: 'Boeung Mealia Meeting fan concert follow up new album diss strack',
    date: '16 July, 2025',
    revenue: '$1,280',
    image: img,
  },
  {
    name: 'Asian Music showcase festival 2025',
    date: '14–16 July, 2025',
    revenue: '$1,280',
    image: img,
  },
  {
    name: 'Navigating the future of cybersecurity in Cambodia 2015',
    date: '14–16 July, 2025',
    revenue: '$1,280',
    image: img,
  },
  {
    name: 'World business summit - There are many variations',
    date: '14–16 July, 2025',
    revenue: '$1,280',
    image: img,
  },
])

const showAll = ref(false)
const loading = ref(false)

const visibleEvents = computed(() => {
  return showAll.value ? events.value : events.value.slice(0, 5)
})

function getRowClass(data, index) {
  if (!showAll.value && index >= 5) {
    return 'faded-row'
  }
  return ''
}

function showMore() {
  loading.value = true
  setTimeout(() => {
    showAll.value = true
    loading.value = false
  }, 500)
}
</script>

<style scoped>
.faded-row {
  opacity: 0.5;
  pointer-events: none;
  user-select: none;
}

/* Fix header and allow body to scroll */
:deep(.p-datatable .p-datatable-thead) {
  position: sticky;
  top: 0;
  background-color: #F6F9F9;
  z-index: 1;
}

:deep(.p-datatable .p-datatable-tbody) {
  overflow-y: auto;
  max-height: calc(80vh - 12rem); /* Adjust based on header and padding */
}

:deep(.p-datatable thead > tr > th) {
  background-color: #F6F9F9;
  border-bottom: 1px solid #e5e7eb;
  padding: 15px;
  border-radius: 10px;
}

:deep(.p-datatable-tbody > tr > td) {
  background-color: #F8F8FF;
  padding: 15px;
}

/* Add bottom border to each data row */
:deep(.p-datatable-tbody > tr) {
  border-bottom: 1px solid #e5e7eb;
}

:deep(.p-datatable thead > tr > th:nth-child(2)) {
  text-align: left;
}

:deep(.p-datatable thead > tr > th:nth-child(3)) {
  text-align: right;
}

/* Remove border from last row if you want */
:deep(.p-datatable-tbody > tr:last-child) {
  border-bottom: none;
}

</style>