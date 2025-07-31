<template>
  <div class="p-6 bg-white rounded-2xl shadow-md">
    <h2 class="text-xl font-semibold text-gray-900 mb-4">Recent events</h2>

    <DataTable
      :value="visibleEvents"
      class="p-datatable-sm"
      responsiveLayout="scroll"
      :rowClass="getRowClass"
    >
      <Column header="Event name">
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

      <Column header="Revenue">
        <template #body="slotProps">
          <div class="text-right text-sm font-semibold text-gray-900">
            {{ slotProps.data.revenue }}
          </div>
        </template>
      </Column>
    </DataTable>

    <div class="mt-4 flex justify-center">
      <Button
        v-if="!showAll"
        label="Show more"
        icon="pi pi-chevron-down"
        class="p-button-text text-blue-600 hover:text-blue-800"
        @click="showMore"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'

const events = ref([
  {
    name: 'Navigating the future of cybersecurity in Cambodia 2015',
    date: '14–16 July, 2025',
    revenue: '$1,280',
    image: 'https://via.placeholder.com/40x40.png?text=1',
  },
  {
    name: 'Navigating the future of cybersecurity in Cambodia 2015',
    date: '14–16 July, 2025',
    revenue: '$1,280',
    image: 'https://via.placeholder.com/40x40.png?text=2',
  },
  {
    name: 'Navigating the future of cybersecurity in Cambodia 2015',
    date: '14–16 July, 2025',
    revenue: '$1,280',
    image: 'https://via.placeholder.com/40x40.png?text=3',
  },
  {
    name: 'Boeung Mealia Meeting fan concert follow up new album diss strack',
    date: '16 July, 2025',
    revenue: '$1,280',
    image: 'https://via.placeholder.com/40x40.png?text=4',
  },
  {
    name: 'Asian Music showcase festival 2025',
    date: '14–16 July, 2025',
    revenue: '$1,280',
    image: 'https://via.placeholder.com/40x40.png?text=5',
  },
  {
    name: 'Navigating the future of cybersecurity in Cambodia 2015',
    date: '14–16 July, 2025',
    revenue: '$1,280',
    image: 'https://via.placeholder.com/40x40.png?text=6',
  },
  {
    name: 'World business summit - There are many variations',
    date: '14–16 July, 2025',
    revenue: '$1,280',
    image: 'https://via.placeholder.com/40x40.png?text=7',
  },
])

const showAll = ref(false)

const visibleEvents = computed(() => {
  return showAll.value ? events.value : events.value.slice(0, 5)
})

// Add blur or faded class to last few hidden rows
function getRowClass(data, index) {
  if (!showAll.value && index >= 5) {
    return 'faded-row'
  }
  return ''
}

function showMore() {
  showAll.value = true
}
</script>

<style scoped>
/* Fade effect for last rows before clicking Show more */
.faded-row {
  opacity: 0.4;
  background: linear-gradient(to right, rgba(96, 165, 250, 0.1), transparent);
  transition: opacity 0.3s;
}
</style>


import { defineNuxtPlugin } from '#app'
import PrimeVue from 'primevue/config'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue)
  nuxtApp.vueApp.component('DataTable', DataTable)
  nuxtApp.vueApp.component('Column', Column)
  nuxtApp.vueApp.component('Button', Button)
})
