<template>
  <div class="ticket-form-container ">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-purple-700 font-medium flex items-center">
        <Icon name="mdi:ticket-confirmation" class="text-2xl mr-2" />
        Ticket {{ ticketIndex + 1 }}
      </h3>
      <Button
        v-if="ticketIndex > 0"
        icon="pi pi-trash"
        text
        rounded
        severity="danger"
        size="small"
        @click="$emit('remove-ticket', ticketIndex)"
        title="Remove Ticket Package"
      />
    </div>
    
    <!-- Ticket Name -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">Ticket Name</label>
      <InputText
        v-model="ticketData.name"
        class="w-full p-3 bg-gray-100 rounded-2xl"
        placeholder="ticket name"
      />
    </div>

    <!-- Price and Quantity Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Price</label>
        <InputNumber
          v-model="ticketData.price"
          mode="currency"
          currency="USD"
          locale="en-US"
          class="w-full  bg-gray-100 rounded-2xl"
          inputClass="w-full p-3 bg-gray-100 rounded-2xl"
          placeholder="ticket price"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
        <InputNumber
          v-model="ticketData.quantity"
          showButtons
          buttonLayout="horizontal"
          :min="0"
          class="w-full bg-gray-100 rounded-2xl"
          inputClass="w-full p-3 bg-gray-100 rounded-2xl"
          placeholder="ticket quantity"
        >
          <template #incrementbutton>
            <Button icon="pi pi-plus" class="p-button-text p-button-secondary" />
          </template>
          <template #decrementbutton>
            <Button icon="pi pi-minus" class="p-button-text p-button-secondary" />
          </template>
        </InputNumber>
      </div>
    </div>

    <!-- Ticket Description -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">Ticket Description</label>
      <Textarea
        v-model="ticketData.description"
        class="w-full p-3 bg-gray-100 rounded-2xl"
        placeholder="Brief description of this ticket"
        rows="4"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
// Icon is auto-imported by Nuxt
import Button from "primevue/button"
import InputText from "primevue/inputtext"
import InputNumber from "primevue/inputnumber"
import Textarea from "primevue/textarea"

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  ticketIndex: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue', 'remove-ticket'])

const ticketData = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<style scoped>
/* Custom styling for form elements */
:deep(.p-inputtext),
:deep(.p-inputnumber-input),
:deep(.p-textarea) {
  @apply bg-gray-100 rounded-2xl;
}

:deep(.p-inputnumber .p-inputnumber-input) {
  @apply p-3;
}

:deep(.p-inputnumber-button) {
  @apply bg-gray-200 hover:bg-gray-300 text-gray-700;
}

.ticket-form-container {
  @apply transition-all duration-300 ease-in-out;
}
</style>
