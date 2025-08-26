<template>
  <div class="min-h-screen bg-gray-50 p-4 md:p-6">
    <!-- Breadcrumb -->
    
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div class="mb-3">
      <Breadcrumb :items="breadcrumbItems" />
    </div>
      <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <button 
          @click="activeTab = 'voucher'"
          :class="[
            'w-full sm:w-auto px-6 py-2 rounded-full font-medium transition-colors',
            activeTab === 'voucher' 
              ? 'bg-gradient-to-r from-blue-700 to-purple-600 text-white hover:bg-purple-700' 
              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
          ]"
        >
          Voucher Code
        </button>
        <button 
          @click="activeTab = 'buyxgety'"
          :class="[
            'w-full sm:w-auto px-6 py-2 rounded-full font-medium transition-colors',
            activeTab === 'buyxgety' 
              ? 'bg-gradient-to-r from-blue-700 to-purple-600 text-white hover:bg-purple-700' 
              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
          ]"
        >
          Buy X Get Y
        </button>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Left Side - Event Card & Form -->
      <div class="space-y-8">
        <!-- Event Card -->
        <div>
          <EventCard
            :imageSrc="eventData.cover_image_url || '/assets/image/poster-manage-booking.png'"
            :eventTitle="eventData.title || 'Navigating the future of cybersecurity in Cambodia 2015'"
            :owner="eventData.owner || 'An Sovanvichka'"
            :location="eventData.location || 'Hayatt Regency, Phnom Penh'"
            :date="eventData.date || '14-16 July, 2025'"
            :time="eventData.time || '10:00 AM GMT+7'"
            :overlayText1="'CYBERSEC'"
            :overlayText2="'IMPEX & STORAGEO'"
            :overlayText3="'MONGADOG'"
          />
        </div>

        <!-- Form Section - Voucher Code Tab -->
        <div v-if="activeTab === 'voucher'">
          <div class="bg-white rounded-2xl p-6">
            <h3 class="text-xl font-semibold text-gray-800 mb-4">Vouchers & Discounts</h3>
            <p class="text-gray-600 text-sm mb-6">Create discount vouchers for your event</p>

            <form @submit.prevent="generateVoucher" class="space-y-5">
              <!-- Voucher Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Voucher Name</label>
                <input
                  v-model="voucherForm.name"
                  type="text"
                  placeholder="Enter"
                  class="w-full px-4 py-3 bg-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <!-- Discount Type -->
             <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                <input
                  v-model="voucherForm.discountType"
                  type="text"
                  placeholder="Enter"
                  class="w-full px-4 py-3 bg-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <!-- Discount Value -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Discount Value</label>
                <input
                  v-model="voucherForm.discountValue"
                  type="number"
                  placeholder="Enter"
                  class="w-full px-4 py-3 bg-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <!-- Number of Vouchers -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Number of Vouchers</label>
                <input
                  v-model="voucherForm.numberOfVouchers"
                  type="number"
                  placeholder="Enter"
                  class="w-full px-4 py-3 bg-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <!-- Date Inputs Grid -->
                <!-- Valid From -->
                <div class="mb-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Valid from</label>
                  <Calendar
                    v-model="voucherForm.validFrom"
                    placeholder="Select date"
                    dateFormat="dd/mm/yy"
                    class="w-full"
                    inputClass="w-full px-4 py-3 bg-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <!-- Valid Until -->
                <div class="mb-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Valid until</label>
                  <Calendar
                    v-model="voucherForm.validUntil"
                    placeholder="Select date"
                    dateFormat="dd/mm/yy"
                    class="w-full"
                    inputClass="w-full px-4 py-3 bg-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

              <!-- Generate Button -->
              <button
                type="submit"
                class="w-full py-3 bg-gradient-to-r from-blue-700 to-purple-600 text-white rounded-2xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 mt-6"
              >
                <i class="pi pi-gift"></i>
                <span>Generate Voucher</span>
              </button>
            </form>
          </div>
        </div>

        <!-- Form Section - Buy X Get Y Tab -->
        <div v-if="activeTab === 'buyxgety'">
          <div class="bg-white rounded-2xl p-6">
            <h3 class="text-xl font-semibold text-gray-800 mb-4">Promotion Rules</h3>
            <p class="text-gray-600 text-sm mb-6">Set up "Buy X Get Y Free" promotion rules</p>

            <form @submit.prevent="generateBuyXGetY" class="space-y-5">
              <!-- Buy Condition Section -->
              <div>
                <h4 class="text-lg font-semibold text-gray-800 mb-4">Buy Condition</h4>
                
                <!-- Ticket Type -->
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Ticket Type</label>
                  <select
                    v-model="buyXGetYForm.ticketType"
                    class="w-full px-4 py-3 bg-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select ticket type</option>
                    <option value="premium">Premium</option>
                    <option value="normal">Normal</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>

                <!-- Quantity -->
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input
                    v-model="buyXGetYForm.buyQuantity"
                    type="number"
                    placeholder="1"
                    min="1"
                    class="w-full px-4 py-3 bg-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <!-- Get Reward Section -->
              <div>
                <h4 class="text-lg font-semibold text-gray-800 mb-4">Get Reward</h4>
                
                <!-- Free Ticket Type -->
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Free Ticket Type</label>
                  <select
                    v-model="buyXGetYForm.freeTicketType"
                    class="w-full px-4 py-3 bg-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select free ticket type</option>
                    <option value="premium">Premium</option>
                    <option value="normal">Normal</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>

                <!-- Free Quantity -->
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Free Quantity</label>
                  <input
                    v-model="buyXGetYForm.getQuantity"
                    type="number"
                    placeholder="1"
                    min="1"
                    class="w-full px-4 py-3 bg-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <!-- Generate Button -->
              <button
                type="submit"
                class="w-full py-3 bg-gradient-to-r from-blue-700 to-purple-600 text-white rounded-2xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 mt-6"
              >
                <i class="pi pi-plus"></i>
                <span>Add Promotion</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Right Side - Voucher Rules -->
      <div>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-fit">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-xl font-semibold text-gray-800">
              {{ activeTab === 'voucher' ? 'Voucher Rules' : 'Promotion Rules' }}
            </h3>
          </div>
          <p class="text-gray-600 text-sm mb-6">
            {{ activeTab === 'voucher' 
                ? 'All voucher rules configured for your event. You can add more rules above or remove existing ones...' 
                : 'All promotional offers configured for your event. You can add more offers above or remove existing ones...' 
            }}
          </p>
          <div class="relative mb-4" v-if="activeTab === 'voucher'">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search"
                class="pl-10 w-full rounded-full pr-4 py-3 border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <i class="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>

          <!-- Filter Buttons for Vouchers -->
          <div v-if="activeTab === 'voucher'" class="mb-6">
            <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                v-for="type in voucherTypes"
                :key="type.label"
                @click="selectedVoucherType = type.value"
                :class="[
                  'px-4 py-3 rounded-2xl text-sm font-medium transition-colors flex-shrink-0 whitespace-nowrap',
                  selectedVoucherType === type.value
                    ? 'bg-purple-100 text-purple-700 border border-purple-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                ]"
              >
                <div class="text-left">
                  <div class="flex items-center space-x-2">
                    <span>{{ type.label }}</span>
                    <span class="text-xs bg-red-50 text-red-700 px-2 py-1 border border-red-200 rounded-full">{{ type.count }}</span>
                  </div>
                  <div class="text-xs mt-1">Num. of voucher: 100</div>
                </div>
              </button>
            </div>
          </div>

          <!-- Filter Buttons for Promotions -->
          <div v-if="activeTab === 'buyxgety'" class="mb-6">
            <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                v-for="type in promotionTypes"
                :key="type.label"
                @click="selectedPromotionType = type.value"
                :class="[
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors flex-shrink-0 whitespace-nowrap',
                  selectedPromotionType === type.value
                    ? 'bg-purple-100 text-purple-700 border border-purple-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                ]"
              >
                {{ type.label }}
                <span class="ml-1 text-xs">{{ type.count }}</span>
              </button>
            </div>
          </div>

          <!-- Voucher List -->
          <div v-if="activeTab === 'voucher'" class="space-y-4 h-[520px] overflow-y-auto">
            <div
              v-for="voucher in filteredVouchers"
              :key="voucher.id"
              class="p-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors bg-white"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1 space-y-3">
                  <div class="flex items-center space-x-3">
                    <span class="font-semibold text-gray-800 text-lg">Voucher name: {{ voucher.name }}</span>
                    <span
                      :class="[
                        'px-3 py-1 rounded-full text-xs font-medium',
                        voucher.status === 'Used' ? 'bg-red-100 text-red-700' :
                        voucher.status === 'Unused' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      ]"
                    >
                      {{ voucher.status }}
                    </span>
                  </div>
                  
                  <div class="flex items-center space-x-4">
                    <span class="text-sm text-gray-600 font-medium">Voucher code: {{ voucher.code }}</span>
                    <span class="text-xs bg-gray-50 text-gray-700 px-3 py-1 border border-gray-200 rounded-full">
                      Discount {{ voucher.discount }}%
                    </span>
                  </div>
                  
                  <div class="text-xs text-gray-500 space-y-1">
                    <div>Valid until: {{ voucher.validUntil }} | Valid from: {{ voucher.validFrom }}</div>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  v-model="voucher.selected" 
                  class="mt-2 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                >
              </div>
            </div>
          </div>

          <!-- Promotion List -->
          <div v-if="activeTab === 'buyxgety'" class="space-y-4 h-[520px] overflow-y-auto">
            <div
              v-for="promotion in filteredPromotions"
              :key="promotion.id"
              class="p-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors bg-white"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1 space-y-3">
                  <div class="flex items-center space-x-3">
                    <span class="font-semibold text-gray-800 text-lg">Rule {{ promotion.id }}</span>
                  </div>
                  
                  <div class="flex items-center space-x-4">
                    <span class="text-sm text-gray-600 font-medium">
                      Buy {{ promotion.buyQuantity }}
                    </span>
                    <span class="text-xs bg-purple-50 text-purple-700 px-3 py-1 border border-purple-200 rounded-full">
                      {{ promotion.ticketType }}
                    </span>
                  </div>
                  
                  <div class="flex items-center space-x-4">
                    <span class="text-sm text-gray-600 font-medium">
                      Get {{ promotion.getQuantity }}
                    </span>
                    <span class="text-xs bg-green-50 text-green-700 px-3 py-1 border border-green-200 rounded-full">
                      {{ promotion.freeTicketType }}
                    </span>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  v-model="promotion.selected" 
                  class="mt-2 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                >
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col space-y-3 mt-6">
            <button
              @click="selectAll"
              class="w-full py-3 text-purple-600 border border-purple-300 rounded-2xl font-medium hover:bg-purple-50 transition-colors"
            >
              Select All
            </button>
          </div>
          
        </div>
        <div class="mt-4">
          <button
            @click="deleteSelected"
            class="w-full py-3 bg-red-100 text-red-600 rounded-2xl font-medium hover:bg-red-200 transition-colors flex items-center justify-center space-x-2"
          >
            <i class="pi pi-trash"></i>
            <span>{{ activeTab === 'voucher' ? 'Delete Voucher' : 'Delete Promotion' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import EventCard from '~/components/common/EventCard.vue'
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import Calendar from 'primevue/calendar'
import IconnButton from '~/components/ui/IconnButton.vue'

// Layout
definePageMeta({
  layout: 'admin'
})

// Breadcrumb items
const breadcrumbItems = ref([
  { text: 'Events', to: '/admin/event' },
  { text: 'Promotion Rules' }
])

// Reactive data
const isToggleOn = ref(false)
const searchQuery = ref('')
const selectedVoucherType = ref('all')
const selectedPromotionType = ref('all')
const activeTab = ref('voucher') // 'voucher' or 'buyxgety'

// Voucher form
const voucherForm = ref({
  name: '',
  discountType: '',
  discountValue: '',
  numberOfVouchers: '',
  validFrom: '',
  validUntil: ''
})

// Buy X Get Y form
const buyXGetYForm = ref({
  ticketType: '',
  buyQuantity: '',
  freeTicketType: '',
  getQuantity: ''
})

// Event data
const eventData = ref({
  title: 'Navigating the future of cybersecurity in Cambodia 2015',
  owner: 'An Sovanvichka',
  location: 'Hayatt Regency, Phnom Penh',
  date: '14-16 July, 2025',
  time: '10:00 AM GMT+7',
  cover_image_url: '/assets/image/poster-manage-booking.png'
})

// Voucher types for filter
const voucherTypes = ref([
  { label: '10% Voucher', value: '10', count: 'Used 10' },
  { label: '30% Voucher', value: '30', count: 'Used 10' },
  { label: '50% Voucher', value: '50', count: 'Unused' },
  { label: '20% Voucher', value: '20', count: 'Used 5' },
  { label: '15% Voucher', value: '15', count: 'Unused' },
  { label: '25% Voucher', value: '25', count: 'Used 8' },
  { label: '40% Voucher', value: '40', count: 'Unused' },
  { label: '60% Voucher', value: '60', count: 'Used 3' }
])

// Promotion types for filter
const promotionTypes = ref([
  { label: 'Buy 2 Get 1', value: 'buy2get1', count: 'Active 5' },
  { label: 'Buy 3 Get 1', value: 'buy3get1', count: 'Active 3' },
  { label: 'Buy 5 Get 2', value: 'buy5get2', count: 'Inactive 2' },
  { label: 'Buy 4 Get 1', value: 'buy4get1', count: 'Active 7' },
  { label: 'Buy 6 Get 2', value: 'buy6get2', count: 'Inactive 1' },
  { label: 'Buy 10 Get 3', value: 'buy10get3', count: 'Active 2' }
])

// Sample vouchers data
const vouchers = ref([
  {
    id: 1,
    name: 'Student Voucher',
    code: 'EVENTLNTG10',
    discount: 10,
    status: 'Used',
    validFrom: '14/08/2025',
    validUntil: '14/07/2025',
    selected: false,
    type: '10'
  },
  {
    id: 2,
    name: 'Student Voucher',
    code: 'EVENTLNTG10',
    discount: 10,
    status: 'Unused',
    validFrom: '14/08/2025',
    validUntil: '14/07/2025',
    selected: false,
    type: '10'
  },
  {
    id: 3,
    name: 'Student Voucher',
    code: 'EVENTLNTG10',
    discount: 10,
    status: 'Unused',
    validFrom: '14/08/2025',
    validUntil: '14/07/2025',
    selected: false,
    type: '10'
  },
  {
    id: 4,
    name: 'Student Voucher',
    code: 'EVENTLNTG10',
    discount: 10,
    status: 'Unused',
    validFrom: '14/08/2025',
    validUntil: '14/07/2025',
    selected: false,
    type: '10'
  },
  {
    id: 5,
    name: 'Student Voucher',
    code: 'EVENTLNTG10',
    discount: 10,
    status: 'Unused',
    validFrom: '14/08/2025',
    validUntil: '14/07/2025',
    selected: false,
    type: '10'
  }
])

// Sample promotions data
const promotions = ref([
  {
    id: 1,
    name: 'Buy 10 Premium Get 5 Normal',
    buyQuantity: 10,
    getQuantity: 5,
    ticketType: 'Premium',
    freeTicketType: 'Normal',
    offerType: 'free',
    discountPercentage: 0,
    status: 'Active',
    usedCount: 15,
    maxUses: 100,
    validFrom: '14/08/2025',
    validUntil: '14/12/2025',
    selected: false,
    type: 'buy10get5'
  },
  {
    id: 2,
    name: 'Buy 5 Premium Get 2 Normal',
    buyQuantity: 5,
    getQuantity: 2,
    ticketType: 'Premium',
    freeTicketType: 'Normal',
    offerType: 'free',
    discountPercentage: 0,
    status: 'Active',
    usedCount: 8,
    maxUses: 50,
    validFrom: '14/08/2025',
    validUntil: '14/11/2025',
    selected: false,
    type: 'buy5get2'
  },
  {
    id: 3,
    name: 'Buy 3 Premium Get 1 Normal',
    buyQuantity: 3,
    getQuantity: 1,
    ticketType: 'Premium',
    freeTicketType: 'Normal',
    offerType: 'free',
    discountPercentage: 0,
    status: 'Active',
    usedCount: 0,
    maxUses: 20,
    validFrom: '14/08/2025',
    validUntil: '14/10/2025',
    selected: false,
    type: 'buy3get1'
  }
])

// Computed properties
const filteredVouchers = computed(() => {
  let filtered = vouchers.value

  // Filter by search query
  if (searchQuery.value) {
    filtered = filtered.filter(voucher =>
      voucher.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      voucher.code.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Filter by voucher type
  if (selectedVoucherType.value !== 'all') {
    filtered = filtered.filter(voucher => voucher.type === selectedVoucherType.value)
  }

  return filtered
})

const filteredPromotions = computed(() => {
  let filtered = promotions.value

  // Filter by search query
  if (searchQuery.value) {
    filtered = filtered.filter(promotion =>
      promotion.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Filter by promotion type
  if (selectedPromotionType.value !== 'all') {
    filtered = filtered.filter(promotion => promotion.type === selectedPromotionType.value)
  }

  return filtered
})

// Methods
const generateVoucher = () => {
  // Generate voucher logic
  console.log('Generating voucher:', voucherForm.value)
  
  // Format dates for display
  const formatDate = (date) => {
    if (!date) return '14/08/2025'
    if (date instanceof Date) {
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }
    return date
  }
  
  // Add new voucher to the list
  const newVoucher = {
    id: vouchers.value.length + 1,
    name: voucherForm.value.name || 'Student Voucher',
    code: `EVENT${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    discount: parseInt(voucherForm.value.discountValue) || 10,
    status: 'Unused',
    validFrom: formatDate(voucherForm.value.validFrom),
    validUntil: formatDate(voucherForm.value.validUntil),
    selected: false,
    type: voucherForm.value.discountValue || '10'
  }
  
  vouchers.value.unshift(newVoucher)
  
  // Reset form
  voucherForm.value = {
    name: '',
    discountType: 'percentage',
    discountValue: '',
    numberOfVouchers: '',
    validFrom: new Date(),
    validUntil: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
  }
}

const generateBuyXGetY = () => {
  // Generate Buy X Get Y promotion logic
  console.log('Generating promotion:', buyXGetYForm.value)
  
  // Add new promotion to the list
  const newPromotion = {
    id: promotions.value.length + 1,
    name: `Buy ${buyXGetYForm.value.buyQuantity} ${buyXGetYForm.value.ticketType} Get ${buyXGetYForm.value.getQuantity} ${buyXGetYForm.value.freeTicketType}`,
    buyQuantity: parseInt(buyXGetYForm.value.buyQuantity) || 1,
    getQuantity: parseInt(buyXGetYForm.value.getQuantity) || 1,
    ticketType: buyXGetYForm.value.ticketType || 'Normal',
    freeTicketType: buyXGetYForm.value.freeTicketType || 'Normal',
    offerType: 'free',
    discountPercentage: 0,
    status: 'Active',
    usedCount: 0,
    maxUses: 100,
    validFrom: '14/08/2025',
    validUntil: '14/12/2025',
    selected: false,
    type: `buy${buyXGetYForm.value.buyQuantity}get${buyXGetYForm.value.getQuantity}`
  }
  
  promotions.value.unshift(newPromotion)
  
  // Reset form
  buyXGetYForm.value = {
    ticketType: '',
    buyQuantity: '',
    freeTicketType: '',
    getQuantity: ''
  }
}

const selectAll = () => {
  if (activeTab.value === 'voucher') {
    const allSelected = filteredVouchers.value.every(voucher => voucher.selected)
    filteredVouchers.value.forEach(voucher => {
      voucher.selected = !allSelected
    })
  } else {
    const allSelected = filteredPromotions.value.every(promotion => promotion.selected)
    filteredPromotions.value.forEach(promotion => {
      promotion.selected = !allSelected
    })
  }
}

const deleteSelected = () => {
  if (activeTab.value === 'voucher') {
    vouchers.value = vouchers.value.filter(voucher => !voucher.selected)
  } else {
    promotions.value = promotions.value.filter(promotion => !promotion.selected)
  }
}

// Lifecycle
onMounted(() => {
  // Set default dates for voucher form as Date objects for Calendar component
  const today = new Date()
  const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
  
  voucherForm.value.validFrom = today
  voucherForm.value.validUntil = nextMonth
})
</script>

<style scoped>
/* Custom scrollbar for voucher list */
.h-\[520px\]::-webkit-scrollbar {
  width: 6px;
}

.h-\[520px\]::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.h-\[520px\]::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.h-\[520px\]::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Hide scrollbar for filter buttons */
.scrollbar-hide {
  -ms-overflow-style: none;  /* Internet Explorer 10+ */
  scrollbar-width: none;  /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Safari and Chrome */
}
</style>