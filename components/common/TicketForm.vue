<template>
  <div class="ticket-form-container" :data-ticket-index="ticketIndex">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-purple-700 font-medium flex items-center">
        <Icon name="mdi:ticket-confirmation" class="text-2xl mr-2" />
        Ticket {{ ticketIndex + 1 }}
        <span v-if="modelValue?.ticket_type_id" class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
          Existing
        </span>
        <span v-else class="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
          New
        </span>
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
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Ticket Name <span class="text-red-500">*</span>
      </label>
      <InputText
        v-model="localTicketName"
        class="w-full p-3 bg-gray-100 rounded-2xl"
        :class="{ 'p-invalid': isValidating && !localTicketName?.trim() }"
        placeholder="Enter ticket name (e.g., VIP Pass, Early Bird)"
        @input="handleNameInput"
      />
      <small v-if="isValidating && !localTicketName?.trim()" class="text-red-500">
        Ticket name is required
      </small>
    </div>

    <!-- Price and Quantity Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Price <span class="text-red-500">*</span>
        </label>
        <InputNumber
          v-model="ticketData.price"
          mode="decimal"
          :minFractionDigits="2"
          :maxFractionDigits="2"
          :min="0"
          class="w-full bg-gray-100 rounded-2xl"
          :class="{ 'p-invalid': isValidating && (ticketData.price === null || ticketData.price < 0) }"
          inputClass="w-full p-3 bg-gray-100 rounded-2xl"
          placeholder="Enter price (e.g., 99.99)"
          @update:modelValue="updatePrice"
        />
        <small v-if="isValidating && (ticketData.price === null || ticketData.price < 0)" class="text-red-500">
          Price must be 0 or greater
        </small>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Total Available <span class="text-red-500">*</span>
        </label>
        <InputNumber
          v-model="ticketData.quantity"
          showButtons
          buttonLayout="horizontal"
          :min="1"
          :useGrouping="false"
          class="w-full bg-gray-100 rounded-2xl"
          :class="{ 'p-invalid': isValidating && (ticketData.quantity === null || ticketData.quantity < 1) }"
          inputClass="w-full p-3 bg-gray-100 rounded-2xl"
          placeholder="Enter quantity (minimum 1)"
          @update:modelValue="updateQuantity"
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

    <!-- Ticket Tag/Description -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">Description <span class="text-red-500">*</span></label>
      <Textarea
        v-model="localTicketDescription"
        class="w-full p-3 bg-gray-100 rounded-2xl"
        :class="{ 'p-invalid': isValidating && !ticketData.description?.trim() }"
        placeholder="Describe the ticket (e.g., VIP pass includes meet & greet)"
        rows="2"
        @input="handleDescriptionInput"
      />
      <small v-if="isValidating && !localTicketDescription?.trim()" class="text-red-500">
        Description is required
      </small>
    </div>

    <!-- Debug Info (only in development) -->
    <div v-if="$config.public.environment === 'development'" class="mb-4 p-3 bg-gray-50 rounded-lg text-xs">
      <details>
        <summary class="cursor-pointer text-gray-600">Debug Info (Ticket {{ ticketIndex + 1 }})</summary>
        <div class="mt-2 space-y-1 text-gray-500">
          <div><strong>ID:</strong> {{ ticketData.id }}</div>
          <div><strong>Ticket Type ID:</strong> {{ ticketData.ticket_type_id }}</div>
          <div><strong>Name:</strong> "{{ ticketData.name }}"</div>
          <div><strong>Description:</strong> "{{ ticketData.description }}"</div>
          <div><strong>Tag:</strong> "{{ ticketData.tag }}"</div>
          <div><strong>Price:</strong> {{ ticketData.price }}</div>
          <div><strong>Quantity:</strong> {{ ticketData.quantity }}</div>
          <div><strong>Is Validating:</strong> {{ isValidating }}</div>
          <div><strong>Local Name:</strong> "{{ localTicketName }}"</div>
          <div><strong>Local Description:</strong> "{{ localTicketDescription }}"</div>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue"
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

// Enhanced validation state management
const isValidating = ref(false)

// Local reactive refs for better data binding
const localTicketName = ref('')
const localTicketDescription = ref('')

// Watch for validation trigger from parent
watch(() => props.modelValue?.isValidating, (newValidating) => {
  if (newValidating) {
    isValidating.value = true
    console.log('🔍 Ticket Form Validation triggered for:', props.modelValue?.name || `Ticket ${props.ticketIndex + 1}`)
  }
}, { immediate: true })

// Watch parent validation attempts and reset validation state
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    const hasEmptyName = !newVal.name?.trim()
    const hasEmptyDescription = !newVal.description?.trim()
    const hasInvalidPrice = newVal.price === null || newVal.price === undefined || isNaN(parseFloat(newVal.price)) || parseFloat(newVal.price) < 0
    const hasInvalidQuantity = newVal.quantity === null || newVal.quantity === undefined || isNaN(parseInt(newVal.quantity)) || parseInt(newVal.quantity) < 1
    
    // Auto-validate if parent triggers validation
    if (newVal.isValidating) {
      isValidating.value = true
    }
    
    // Reset validation if all fields are valid
    if (!hasEmptyName && !hasEmptyDescription && !hasInvalidPrice && !hasInvalidQuantity) {
      isValidating.value = false
    }
    
    // Enhanced logging for debugging
    console.log('🔍 Enhanced Ticket Form Validation:', {
      ticketIndex: props.ticketIndex,
      ticketName: newVal.name || `Ticket ${props.ticketIndex + 1}`,
      hasEmptyName,
      hasEmptyDescription,
      hasInvalidPrice,
      hasInvalidQuantity,
      isValidating: isValidating.value,
      rawData: {
        name: newVal.name,
        description: newVal.description,
        price: newVal.price,
        quantity: newVal.quantity
      }
    })
  }
}, { deep: true })

const ticketData = computed({
  get: () => {
    // Safely access nested properties to prevent "ticket.data.o.name" errors
    const modelValue = props.modelValue || {}
    const data = {
      ...modelValue,
      // Ensure proper data types and defaults with safe property access
      name: modelValue.name || '',
      description: modelValue.description || modelValue.tag || '',
      price: modelValue.price !== null && modelValue.price !== undefined ? parseFloat(modelValue.price) || 0 : 0,
      quantity: modelValue.quantity !== null && modelValue.quantity !== undefined ? parseInt(modelValue.quantity) || 1 : 1
    }
    
    console.log('📝 TicketForm computed get:', {
      ticketIndex: props.ticketIndex,
      original: modelValue,
      computed: data
    })
    
    return data
  },
  set: (value) => {
    console.log('📝 TicketForm computed set:', {
      ticketIndex: props.ticketIndex,
      value
    })
    emit('update:modelValue', value)
  }
})

// Handle price updates
const updatePrice = (value) => {
  const parsedPrice = value !== null && value !== undefined ? parseFloat(value) : 0
  console.log('💰 Updating price:', {
    ticketIndex: props.ticketIndex,
    raw: value,
    parsed: parsedPrice
  })
  
  emit('update:modelValue', {
    ...props.modelValue,
    price: !isNaN(parsedPrice) ? Math.max(0, parsedPrice) : 0
  })
}

// Handle quantity updates
const updateQuantity = (value) => {
  const parsedQuantity = value !== null && value !== undefined ? parseInt(value) : 1
  console.log('🔢 Updating quantity:', {
    ticketIndex: props.ticketIndex,
    raw: value,
    parsed: parsedQuantity
  })
  
  const newValue = !isNaN(parsedQuantity) ? Math.max(1, parsedQuantity) : 1
  
  emit('update:modelValue', {
    ...props.modelValue,
    quantity: newValue
  })
}

// Initialize local refs with prop values - with safe property access
watch(() => props.modelValue, (newValue) => {
  if (newValue && typeof newValue === 'object') {
    localTicketName.value = newValue.name || ''
    localTicketDescription.value = newValue.description || newValue.tag || ''
  } else {
    // Reset to empty if no valid value
    localTicketName.value = ''
    localTicketDescription.value = ''
  }
}, { immediate: true })

// Handle name input with immediate reactivity
const handleNameInput = (event) => {
  const value = event.target.value
  localTicketName.value = value
  
  console.log('📝 Updating name (enhanced):', {
    ticketIndex: props.ticketIndex,
    value,
    localValue: localTicketName.value
  })
  
  emit('update:modelValue', {
    ...props.modelValue,
    name: value
  })
}

// Handle description input with immediate reactivity
const handleDescriptionInput = (event) => {
  const value = event.target.value
  localTicketDescription.value = value
  
  console.log('📝 Updating description (enhanced):', {
    ticketIndex: props.ticketIndex,
    value,
    localValue: localTicketDescription.value
  })
  
  emit('update:modelValue', {
    ...props.modelValue,
    description: value,
    tag: value // Also update tag for API compatibility
  })
}

// Handle name updates (legacy support)
const updateName = (event) => {
  handleNameInput(event)
}

// Handle description updates (legacy support)
const updateDescription = (event) => {
  handleDescriptionInput(event)
}
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
