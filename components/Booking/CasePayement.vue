<template>
  <div class="flex h-full">
    <!-- Left Column: Booking List -->
    <div class="flex-1 pr-8 overflow-y-auto">
      <h1 class="text-2xl font-bold text-gray-800">Orders</h1>
      <p class="text-gray-600 mb-6">View all orders from the system</p>

      <!-- Search, Filters, Sort -->
      <div class="flex items-center gap-4 mb-6">
        <div class="relative flex-1">
          <Icon name="heroicons:magnifying-glass" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <InputText 
            v-model="searchQuery" 
            placeholder="Search by name, email, or order number" 
            class="pl-10 pr-4 py-3 border border-gray-300 rounded-full w-full bg-white focus:ring-0 focus:ring-purple-500 focus:border-purple-500"
            @input="debouncedSearch" 
          />
        </div>
        <Button class="px-4 py-3 bg-white border border-gray-300 rounded-full bg-custom-gradient bg-clip-text text-transparent hover:bg-gray-100 flex items-center">
          <Icon name="heroicons:funnel" class="w-5 h-5 mr-2 bg-gradient-to-tr from-blue-900 to-purple-700" />
          Filters
        </Button>
        <Button class="px-4 py-3 bg-white border border-gray-300 rounded-full bg-custom-gradient bg-clip-text text-transparent hover:bg-gray-100 flex items-center">
          <Icon name="heroicons:arrows-up-down" class="w-5 h-5 mr-2 bg-gradient-to-tr from-blue-900 to-purple-700" />
          Sort
        </Button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-4">
        <div v-for="n in 3" :key="n" class="bg-white rounded-2xl shadow-sm p-4 animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div class="h-3 bg-gray-200 rounded w-full"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p class="text-red-600">{{ error }}</p>
        <Button 
          label="Retry" 
          class="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          @click="loadOrders"
        />
      </div>

      <!-- Empty State -->
      <div v-else-if="orders.length === 0" class="text-center py-12">
        <Icon name="heroicons:receipt-refund" class="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
        <p class="text-gray-500">No orders match your search criteria.</p>
      </div>

      <!-- Booking Cards List -->
      <div v-else class="space-y-4">
        <div v-for="order in orders" :key="order.id" class="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div class="p-4">
            <div class="flex justify-between items-center mb-2">
              <div class="flex items-center gap-2">
                <span class="font-semibold text-gray-800">{{ order.customer_name }}</span>
                <span class="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{{ order.order_number }}</span>
              </div>
              <span
  class="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium"
  :class="getStatusClass(order.status)"
>
  <Icon name="radix-icons:dot-filled" class="w-3 h-3" />
  <span>{{ formatStatus(order.status) }}</span>
</span>

            </div>
            <p class="text-sm text-gray-500 mb-3">
              Purchase Date: {{ formatDate(order.created_at) }}
            </p>
            <div class="border-t border-dashed border-gray-300 my-4"></div>
            <div class="mb-4">
              <p class="text-sm text-gray-500 mb-3 leading-3">Event</p>
              <div class="flex justify-between items-center cursor-pointer" @click="toggleExpand(order.id)">
                <span class="font-medium text-gray-800">{{ order.event?.name || 'Unknown Event' }}</span>
                <Icon 
                  :name="expandedBookings[order.id] ? 'mingcute:down-line' : 'mingcute:up-line'" 
                  class="w-5 h-5 text-gray-500" 
                />
              </div>
              <div class="border-b border-gray-300 my-4"></div>
              <Transition name="slide-fade">
               <div v-if="expandedBookings[order.id]" class="mt-3 text-gray-600 space-y-1">
  <!-- Use Grid with 2 columns -->
  <div class="grid grid-cols-2 gap-6 mb-4">
    <!-- Column 1 -->
    <div class="email break-words">
      <p class="text-sm text-gray-500">Email</p>
      <span class="font-medium text-gray-800">{{ order.customer_email || 'N/A' }}</span>
    </div>
    <!-- Column 2 -->
    <div class="total-ticket">
      <p class="text-sm text-gray-500">Total Tickets</p>
      <span class="font-medium text-gray-800">{{ order.ticket_count || 0 }}</span>
    </div>
  </div>

  <div class="grid grid-cols-2 gap-6">
    <!-- Column 1 -->
    <div class="number-phone break-words">
      <p class="text-sm text-gray-500">Phone Number</p>
      <span class="font-medium text-gray-800">{{ order.customer_phone_number || 'N/A' }}</span>
    </div>
    <!-- Column 2 -->
    <div class="payment-method">
      <p class="text-sm text-gray-500">Ticket Types</p>
      <div class="flex flex-wrap gap-2">
        <span 
          v-for="(item, index) in order.items" 
          :key="item.id"
          class="px-3 py-1 rounded-full text-xs font-medium"
          :class="getTicketTypeColor(index)"
        >
          {{ item.name }}
        </span>
      </div>
    </div>
  </div>

  <div class="border-b border-gray-300 my-4"></div>
</div>


              </Transition>
            </div>

            <div class="flex justify-between items-center">   
              <div>
                <p class="text-sm text-gray-500">Total Amount</p>
                <span class="text-xl font-bold text-gray-800">${{ order.total_amount.toFixed(2) }}</span>
              </div>
              <Button
                :label="order.status === 'pending' ? 'Pay Bill' : 'View Details'"
                :class="order.status === 'pending' ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-500 text-white hover:bg-gray-600'"
                class="px-5 py-2 rounded-full flex items-center"
                @click="selectBooking(order)"
                :disabled="processingOrder === order.id"
              >
                <Icon 
                  :name="order.status === 'pending' ? 'solar:bill-check-bold' : 'heroicons:eye'" 
                  class="w-5 h-5 mr-2" 
                />
                {{ processingOrder === order.id ? 'Processing...' : (order.status === 'pending' ? 'Pay Bill' : 'View Details') }}
              </Button>
            </div>
          </div>
        </div>
<div class="border-b border-gray-300 my-4"></div>
        <!-- Pagination Info (always show when data exists) -->
        <div v-if="pagination" class="mt-8 flex justify-between items-center">
          <!-- Pagination Summary -->
          <div class="text-center mb-6">
            <span class="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-full">
              Showing {{ pagination.from || 1 }} to {{ pagination.to || orders.length }} of {{ pagination.total || 0 }} orders
            </span>
          </div>
          
          <!-- Pagination Controls (only show if more than 1 page) -->
          <div v-if="pagination.total_pages > 1" class="flex justify-center items-center space-x-2">
            <!-- Previous Button -->
            <Button 
              :disabled="pagination.current_page === 1"
              class="px-4 py-2 rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="pagination.current_page === 1 
                ? 'bg-gray-100 text-gray-400 border border-gray-200' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600'"
              @click="changePage(pagination.current_page - 1)"
            >
              <Icon name="heroicons:chevron-left" class="w-4 h-4 mr-1" />
              Previous
            </Button>

            <!-- Page Numbers -->
            <div class="flex items-center space-x-1">
              <!-- Show first page if we're far from it -->
              <template v-if="pagination.current_page > 3">
                <Button
                  class="w-10 h-10 rounded-full font-medium transition-all duration-200 bg-white text-gray-700 border border-gray-300 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600"
                  @click="changePage(1)"
                >
                  1
                </Button>
                <span v-if="pagination.current_page > 4" class="px-5 text-gray-400">...</span>
              </template>

              <!-- Show pages around current page -->
              <template v-for="page in getVisiblePages()" :key="page">
                <Button
                  class="w-10 h-10 p-3 rounded-full font-medium transition-all duration-200"
                  :class="page === pagination.current_page
                    ? 'bg-gradient-to-r from-purple-600 to-purple-400 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600'"
                  @click="changePage(page)"
                >
                  {{ page }}
                </Button>
              </template>

              <!-- Show last page if we're far from it -->
              <template v-if="pagination.current_page < pagination.total_pages - 2">
                <span v-if="pagination.current_page < pagination.total_pages - 3" class="px-2 text-gray-400">...</span>
                <Button
                  class="w-10 h-10 rounded-full font-medium transition-all duration-200 bg-white text-gray-700 border border-gray-300 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600"
                  @click="changePage(pagination.total_pages)"
                >
                  {{ pagination.total_pages }}
                </Button>
              </template>
            </div>

            <!-- Next Button -->
            <Button 
              :disabled="pagination.current_page === pagination.total_pages"
              class="px-4 py-2 rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="pagination.current_page === pagination.total_pages 
                ? 'bg-gray-100 text-gray-400 border border-gray-200' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600'"
              @click="changePage(pagination.current_page + 1)"
            >
              Next
              <Icon name="heroicons:chevron-right" class="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
    <!-- Right Column: Receipt / Payment Details -->
    <div class="w-[30rem] bg-white p-4 rounded-2xl flex flex-col">
      <!-- Receipt (shown only when a booking is selected) -->
      <div v-if="selectedOrder" class="flex-grow">
        <div class="mb-6">
          <h2 class="text-xl font-bold text-gray-800">{{ selectedOrder.order_number }}</h2>
          <p class="text-gray-600">{{ selectedOrder.customer_name }}</p>
        </div>

       <!-- Order Summary -->
<div class="space-y-3 mb-6">
  <div v-if="selectedOrder.items && selectedOrder.items.length > 0" class="space-y-2">
    <div 
      v-for="(item, index) in selectedOrder.items" 
      :key="item.id" 
      class="bg-gray-100 rounded-2xl p-3 text-gray-700"
    >
      <!-- Grid Layout with 3 columns -->
      <div class="grid grid-cols-3 items-center gap-4">
        <!-- Column 1: Index + Item Name -->
        <div class="flex items-center space-x-3 overflow-hidden">
          <span class="text-sm p-1 text-black bg-white rounded-full min-w-[24px] text-center">
            {{ String(index + 1).padStart(2, '0') }}
          </span>
          <span class="text-sm font-medium text-gray-800 truncate">
            {{ item.name }}
          </span>
        </div>
        <!-- Column 2: Quantity -->
        <div class="text-center">
          <span class="font-medium">{{ item.quantity || 1 }}</span>
        </div>
        <!-- Column 3: Price -->
        <div class="text-right">
          <span class="font-medium">${{ (item.price || 0).toFixed(2) }}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Fallback when no items -->
  <div v-else class="bg-gray-100 rounded-2xl p-3 text-gray-700">
    <div class="grid grid-cols-3 items-center gap-4">
      <!-- Column 1 -->
      <div class="flex items-center space-x-3">
        <span class="text-sm p-1 text-black bg-white rounded-full min-w-[24px] text-center">
          01
        </span>
        <span class="text-sm truncate">Event Tickets</span>
      </div>
      <!-- Column 2 -->
      <div class="text-center">
        <span class="font-medium">{{ selectedOrder.ticket_count || 0 }}</span>
      </div>
      <!-- Column 3 -->
      <div class="text-right">
        <span class="font-medium">${{ (selectedOrder.total_amount || 0).toFixed(2) }}</span>
      </div>
    </div>
  </div>
</div>


        <!-- Order Details -->
        <div class="space-y-3 bg-gray-100 p-3 rounded-xl text-gray-700 mb-6">
          <div class="flex justify-between">
            <span>Subtotal</span>
            <span class="font-medium">${{ calculateSubtotal(selectedOrder).toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Tax {{ selectedOrder.tax_rate ? `${selectedOrder.tax_rate}%` : '0%' }}</span>
            <span class="font-medium">${{ (selectedOrder.tax_amount || 0).toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Voucher</span>
            <span class="font-medium">${{ (selectedOrder.voucher_amount || selectedOrder.promotion_amount || 0).toFixed(2) }}</span>
          </div>
          <div class="flex justify-between pt-4 pb-10 border-t border-dashed border-gray-300 text-lg font-semibold text-gray-800">
            <span>Total Amount</span>
            <span>${{ (selectedOrder.total_amount || 0).toFixed(2) }}</span>
          </div>

          <div class="flex justify-between pt-4 border-t border-dashed border-gray-300 text-lg font-semibold text-gray-800">
            <span>Received</span>
            <span>${{ (selectedOrder.total_amount || 0).toFixed(2) }}</span>
          </div>
        </div>
      </div>
      <div v-else class="flex-grow flex items-center justify-center text-gray-500">
        <div class="text-center">
          <Icon name="heroicons:clipboard-document-list" class="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p class="text-lg font-semibold">No order selected</p>
          <p class="text-sm">Select an order to view details and process payment</p>
        </div>
      </div>

      <!-- Fixed Payment Method and Order Button (always visible) -->
      <div class="mt-auto sticky bottom-4">
        <!-- Payment Method section disabled for now -->
        <h3 class="text-lg font-normal text-purple-600 mb-4">Payment Method</h3>
        <div class="grid grid-cols-2 gap-4 mb-8">
          <div
            :class="['flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all duration-200',
                     paymentMethod === 'cash' ? 'border-purple-600 bg-purple-50 shadow-md' : 'border-gray-300 bg-gray-50 hover:bg-gray-100']"
            @click="paymentMethod = 'cash'"
          >
            <Icon name="heroicons:currency-dollar" class="w-8 h-8 mb-2" :class="paymentMethod === 'cash' ? 'text-purple-600' : 'text-gray-600'" />
            <span class="text-sm font-medium" :class="paymentMethod === 'cash' ? 'text-purple-800' : 'text-gray-700'">Cash</span>
          </div>
          <div
            :class="['flex flex-col items-center p-4 border rounded-lg cursor-not-allowed transition-all duration-200 opacity-50',
                     'border-gray-300 bg-gray-100']"
          >
            <Icon name="heroicons:credit-card" class="w-8 h-8 mb-2 text-gray-400" />
            <span class="text-sm font-medium text-gray-500">KHQR</span>
          </div>
        </div>

        <!-- Complete Order button disabled for now -->
        <Button
          :label="selectedOrder?.status === 'pending' ? 'Complete Order' : 'Order Already Completed'"
          class="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-700 hover:to-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="completeOrder"
          :disabled="!selectedOrder || selectedOrder.status !== 'pending' || processingOrder === selectedOrder?.id"
        />

        <!-- KHQR Popup -->
        <Transition name="fade">
          <div v-if="showQrPopup" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white p-6 rounded-lg shadow-lg w-96">
              <h3 class="text-lg font-bold text-gray-800 mb-4">Scan KHQR Code</h3>
              <div class="flex justify-center mb-4">
                <div class="w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-500 rounded-lg">
                  <Icon name="heroicons:qr-code" class="w-24 h-24" />
                </div>
              </div>
              <p class="text-sm text-gray-600 mb-4">Scan the QR code with your payment app to complete the transaction.</p>
              <div class="flex justify-end space-x-2">
                <Button 
                  label="Cancel" 
                  class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600" 
                  @click="closeQrPopup" 
                />
                <Button 
                  label="Payment Complete" 
                  class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700" 
                  @click="confirmKhqrPayment" 
                />
              </div>
            </div>
          </div>
        </Transition>

        <!-- Status Selection Popup for Cash Payment -->
        <Transition name="fade">
          <div v-if="showStatusPopup" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <div class="mb-6">
                <Icon name="heroicons:clipboard-document-check" class="w-16 h-16 mx-auto text-purple-600 mb-4" />
                <h3 class="text-xl font-semibold text-gray-800 mb-2">Update Order Status</h3>
                <p class="text-gray-600 mb-4">Select the status for this cash payment order</p>
                
                <!-- Order Info -->
                <div class="bg-gray-50 rounded-xl p-4 mb-6">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm text-gray-600">Order Number:</span>
                    <span class="font-mono text-sm font-medium text-gray-800">#{{ selectedOrder?.order_number || selectedOrder?.id }}</span>
                  </div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm text-gray-600">Customer:</span>
                    <span class="font-medium text-gray-800 text-sm">{{ selectedOrder?.customer_name || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Amount:</span>
                    <span class="font-semibold text-gray-800">${{ (selectedOrder?.total_amount || 0).toFixed(2) }}</span>
                  </div>
                </div>

                <!-- Status Options -->
                <div class="space-y-3 mb-6">
                  <div 
                    v-for="status in ['completed', 'canceled', 'refunded']" 
                    :key="status"
                    class="flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200"
                    :class="selectedStatus === status 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'"
                    @click="selectedStatus = status"
                  >
                    <div class="flex items-center justify-center w-5 h-5 mr-3">
                      <div 
                        class="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                        :class="selectedStatus === status 
                          ? 'border-purple-500 bg-purple-500' 
                          : 'border-gray-300'"
                      >
                        <div v-if="selectedStatus === status" class="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center">
                        <Icon 
                          :name="status === 'completed' ? 'heroicons:check-circle' 
                                : status === 'canceled' ? 'heroicons:x-circle' 
                                : 'heroicons:arrow-path'" 
                          class="w-5 h-5 mr-2"
                          :class="status === 'completed' ? 'text-green-600' 
                                : status === 'canceled' ? 'text-red-600' 
                                : 'text-blue-600'"
                        />
                        <span class="font-medium capitalize">{{ status }}</span>
                      </div>
                      <p class="text-sm text-gray-500 mt-1">
                        {{ status === 'completed' ? 'Mark order as successfully completed' 
                          : status === 'canceled' ? 'Cancel this order' 
                          : 'Process refund for this order' }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="flex gap-3">
                <Button 
                  label="Cancel" 
                  class="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                  @click="closeStatusPopup"
                  :disabled="processingOrder === selectedOrder?.id"
                />
                <Button 
                  :label="processingOrder === selectedOrder?.id ? 'Processing...' : 'Confirm'"
                  class="flex-1 py-3 rounded-xl font-semibold text-white transition-all duration-200"
                  :class="selectedStatus === 'completed' ? 'bg-green-600 hover:bg-green-700' 
                        : selectedStatus === 'canceled' ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-blue-600 hover:bg-blue-700'"
                  @click="confirmStatusChange"
                  :disabled="processingOrder === selectedOrder?.id"
                />
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { fetchOrders, updateOrderStatus } from '@/composables/api.js'
import { useNotifications } from '@/composables/useNotifications.js'

// Composables
const { success: showSuccess, error: showError } = useNotifications()

// Reactive state
const orders = ref([])
const searchQuery = ref('')
const loading = ref(true)
const error = ref(null)
const expandedBookings = ref({})
const selectedOrder = ref(null)
const paymentMethod = ref('cash')
const showQrPopup = ref(false)
const showStatusPopup = ref(false)
const selectedStatus = ref('completed')
const processingOrder = ref(null)
const pagination = ref(null)
const currentPage = ref(1)

// Debounced search
let searchTimeout = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadOrders()
  }, 500)
}

// Load orders from API
const loadOrders = async () => {
  try {
    loading.value = true
    error.value = null
    
    const params = {
      per_page: 10,
      page: currentPage.value,
      search: searchQuery.value || undefined
    }
    

    const response = await fetchOrders(params)
    
    if (response.success) {
      orders.value = response.data
      pagination.value = response.pagination
      
    } else {
      throw new Error(response.message || 'Failed to load orders')
    }
  } catch (err) {
    error.value = err.message || 'Failed to load orders. Please try again.'
    orders.value = []
  } finally {
    loading.value = false
  }
}

// Change page
const changePage = (page) => {
  currentPage.value = page
  loadOrders()
}

// Get visible page numbers for pagination
const getVisiblePages = () => {
  if (!pagination.value) return []
  
  const current = pagination.value.current_page
  const total = pagination.value.total_pages
  const pages = []
  
  // Always show current page and 1-2 pages around it
  const start = Math.max(1, current - 1)
  const end = Math.min(total, current + 1)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (err) {
    return 'Invalid Date'
  }
}

// Format status
const formatStatus = (status) => {
  if (!status) return 'Unknown'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

// Get status class for styling
const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-50 text-yellow-700'
    case 'completed':
      return 'bg-green-50 text-green-700'
    case 'canceled':
    case 'cancelled':
      return 'bg-red-50 text-red-700'
    case 'refunded':
      return 'bg-blue-50 text-blue-700'
    default:
      return 'bg-gray-50 text-gray-700'
  }
}

// Format payment method
const formatPaymentMethod = (method) => {
  if (!method) return 'N/A'
  switch (method.toLowerCase()) {
    case 'offline':
      return 'Cash/Offline'
    case 'abapay':
      return 'ABA Pay'
    case 'khqr':
      return 'KHQR'
    default:
      return method.charAt(0).toUpperCase() + method.slice(1)
  }
}

// Format ticket types for display
const formatTicketTypes = (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return 'N/A'
  }
  
  return items.map(item => item.name).join(', ')
}

// Get ticket type color - simple rotating colors like in the photo
const getTicketTypeColor = (index) => {
  const colors = [
    'bg-purple-50 text-purple-800',  // Purple like "Premium" in photo
    'bg-blue-50 text-blue-800',     // Blue like "Executive" in photo  
    'bg-gray-50 text-gray-800'      // Gray like "Normal" in photo
  ]
  
  return colors[index % colors.length]
}

// Calculate subtotal from items
const calculateSubtotal = (order) => {
  if (!order) return 0
  
  // If we have individual items with prices and quantities
  if (order.items && Array.isArray(order.items) && order.items.length > 0) {
    return order.items.reduce((total, item) => {
      const price = parseFloat(item.price || 0)
      const quantity = parseInt(item.quantity || 1)
      return total + (price * quantity)
    }, 0)
  }
  
  // Fallback: calculate from total_amount minus tax and plus voucher
  const total = parseFloat(order.total_amount || 0)
  const tax = parseFloat(order.tax_amount || 0) 
  const voucher = parseFloat(order.voucher_amount || order.promotion_amount || 0)
  
  // Subtotal = Total - Tax + Voucher (since voucher reduces the total)
  return Math.max(0, total - tax + voucher)
}

// Toggle expand booking details
const toggleExpand = (orderId) => {
  expandedBookings.value[orderId] = !expandedBookings.value[orderId]
}

// Select booking for payment processing
const selectBooking = (order) => {
  selectedOrder.value = order
  paymentMethod.value = 'cash' // Reset payment method when selecting a new order
  showQrPopup.value = false // Ensure QR popup is closed
}

// Complete order payment
const completeOrder = async () => {
  if (!selectedOrder.value || selectedOrder.value.status !== 'pending') {
    return
  }

  if (paymentMethod.value === 'khqr') {
    showQrPopup.value = true // Show QR popup for KHQR payment
    return
  }

  // Show status selection popup for cash payment
  if (paymentMethod.value === 'cash') {
    showStatusPopup.value = true
    selectedStatus.value = 'completed' // Default to completed
    return
  }

  // Process other payment methods directly
  await processPayment('completed', paymentMethod.value)
}

// Process payment (either cash or KHQR)
const processPayment = async (status, method) => {
  if (!selectedOrder.value) return

  try {
    processingOrder.value = selectedOrder.value.id
    
    // Prepare items data for API call
    const items = selectedOrder.value.items || []
    
    // Prepare remark based on payment method
    const remark = method === 'cash' ? 'cash payment' : `${method} payment`
    
    const response = await updateOrderStatus(
      selectedOrder.value.id, 
      status, 
      method,
      items,
      remark
    )

    if (response.success) {
      // Update the order in the local list
      const orderIndex = orders.value.findIndex(o => o.id === selectedOrder.value.id)
      if (orderIndex !== -1) {
        orders.value[orderIndex].status = status
        orders.value[orderIndex].payment_method = method
      }

      // Update selected order
      selectedOrder.value.status = status
      selectedOrder.value.payment_method = method

      // Show success message
      showSuccess(`Order ${status} successfully!`)
      
      // Close popups
      showQrPopup.value = false
      showStatusPopup.value = false
    } else {
      throw new Error(response.message || 'Failed to process payment')
    }
  } catch (err) {
    console.error('Failed to process payment:', err)
    showError(err.message || 'Failed to process payment. Please try again.')
  } finally {
    processingOrder.value = null
  }
}

// Confirm KHQR payment
const confirmKhqrPayment = async () => {
  await processPayment('completed', 'khqr')
}

// Close QR popup
const closeQrPopup = () => {
  showQrPopup.value = false
}

// Close status popup
const closeStatusPopup = () => {
  showStatusPopup.value = false
  selectedStatus.value = 'completed'
}

// Confirm status change for cash payment
const confirmStatusChange = async () => {
  if (!selectedOrder.value || !selectedStatus.value) return
  
  console.log('Processing cash payment:', {
    orderId: selectedOrder.value.id,
    status: selectedStatus.value,
    paymentMethod: 'cash',
    remark: 'cash payment',
    statusType: typeof selectedStatus.value,
    possibleStatuses: ['completed', 'canceled', 'refunded']
  })
  
  // Process cash payment with selected status
  await processPayment(selectedStatus.value, 'cash')
}



// Load orders on component mount
onMounted(() => {
  loadOrders()
})

// Watch for search query changes
watch(searchQuery, () => {
  debouncedSearch()
})


</script>

<style scoped>
/* Transition styles for smooth expand/collapse */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

/* Transition for QR popup */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>