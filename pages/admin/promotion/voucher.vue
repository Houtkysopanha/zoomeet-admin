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
        <div v-if="eventCardData">
          <EventCard
            :imageSrc="eventCardData.imageSrc"
            :altText="eventCardData.altText"
            :eventTitle="eventCardData.title"
            :owner="eventCardData.owner"
            :location="eventCardData.location"
            :date="eventCardData.date"
            :time="eventCardData.time"
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
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-xl font-semibold text-gray-800">
                  {{ editingPromotion ? 'Edit Promotion Rule' : 'Promotion Rules' }}
                </h3>
                <p class="text-gray-600 text-sm mt-1">
                  {{ editingPromotion ? 'Update your "Buy X Get Y Free" promotion rule' : 'Set up "Buy X Get Y Free" promotion rules' }}
                </p>
              </div>
              <button
                v-if="editingPromotion"
                @click="cancelEditPromotion"
                type="button"
                class="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel Edit
              </button>
            </div>

            <!-- Loading Indicator for Ticket Types -->
            <div v-if="isLoadingTicketTypes" class="flex items-center justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span class="ml-3 text-gray-600">Loading ticket types...</span>
            </div>

            <form v-else @submit.prevent="editingPromotion ? updatePromotionData() : generateBuyXGetY()" class="space-y-5">
              <!-- Buy Condition Section -->
              <div>
                <h4 class="text-lg font-semibold text-gray-800 mb-4">Buy Condition</h4>
                
                <!-- Ticket Type -->
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Ticket Type</label>
                  <select
                    v-model="buyXGetYForm.ticketTypeId"
                    @change="updateTicketTypeName('buy')"
                    :disabled="isLoadingTicketTypes || !hasTicketTypes"
                    class="w-full px-4 py-3 bg-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                  >
                    <option value="" disabled>
                      {{ ticketTypesDisplayMessage }}
                    </option>
                    <option 
                      v-for="ticketType in availableTicketTypes" 
                      :key="ticketType.id"
                      :value="ticketType.id"
                      :disabled="ticketType.available <= 0"
                    >
                      {{ ticketType.displayText }}
                    </option>
                  </select>
                  <p v-if="ticketTypesError" class="text-red-500 text-sm mt-1 flex items-center justify-between">
                    <span>{{ ticketTypesError }}</span>
                    <button 
                      @click="retryFetchTicketTypes"
                      type="button"
                      class="ml-2 text-purple-600 hover:text-purple-700 underline text-xs"
                    >
                      Retry
                    </button>
                  </p>
                  <p v-else-if="!hasTicketTypes && !isLoadingTicketTypes" class="text-amber-600 text-sm mt-1">
                    Please create ticket types for this event first.
                  </p>
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
                    v-model="buyXGetYForm.freeTicketTypeId"
                    @change="updateTicketTypeName('free')"
                    :disabled="isLoadingTicketTypes || !hasTicketTypes"
                    class="w-full px-4 py-3 bg-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                  >
                    <option value="" disabled>
                      {{ ticketTypesDisplayMessage }}
                    </option>
                    <option 
                      v-for="ticketType in availableTicketTypes" 
                      :key="ticketType.id"
                      :value="ticketType.id"
                    >
                      {{ ticketType.displayText }}
                    </option>
                  </select>
                  <p v-if="ticketTypesError" class="text-red-500 text-sm mt-1 flex items-center justify-between">
                    <span>{{ ticketTypesError }}</span>
                    <button 
                      @click="retryFetchTicketTypes"
                      type="button"
                      class="ml-2 text-purple-600 hover:text-purple-700 underline text-xs"
                    >
                      Retry
                    </button>
                  </p>
                  <p v-else-if="!hasTicketTypes && !isLoadingTicketTypes" class="text-amber-600 text-sm mt-1">
                    Please create ticket types for this event first.
                  </p>
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

              <!-- Optional Fields Section -->
              <div>
                <h4 class="text-lg font-semibold text-gray-800 mb-4">Additional Details (Optional)</h4>
                
                <!-- Promotion Name -->
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Promotion Name</label>
                  <input
                    v-model="buyXGetYForm.name"
                    type="text"
                    placeholder="Auto-generated if left empty"
                    class="w-full px-4 py-3 bg-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <!-- Description -->
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    v-model="buyXGetYForm.description"
                    placeholder="Auto-generated if left empty"
                    rows="3"
                    class="w-full px-4 py-3 bg-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  ></textarea>
                </div>

                <!-- Date Range -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Start Date -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      v-model="buyXGetYForm.startDate"
                      type="date"
                      class="w-full px-4 py-3 bg-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <!-- End Date -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      v-model="buyXGetYForm.endDate"
                      type="date"
                      class="w-full px-4 py-3 bg-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <!-- Generate Button -->
              <button
                type="submit"
                :disabled="(editingPromotion ? isUpdatingPromotion : isCreatingPromotion) || !buyXGetYForm.ticketTypeId || !buyXGetYForm.freeTicketTypeId || !buyXGetYForm.buyQuantity || !buyXGetYForm.getQuantity"
                class="w-full py-3 bg-gradient-to-r from-blue-700 to-purple-600 text-white rounded-2xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div v-if="editingPromotion ? isUpdatingPromotion : isCreatingPromotion" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <i v-else :class="editingPromotion ? 'pi pi-check' : 'pi pi-plus'"></i>
                <span>
                  {{ editingPromotion 
                    ? (isUpdatingPromotion ? 'Updating...' : 'Update Promotion')
                    : (isCreatingPromotion ? 'Creating...' : 'Add Promotion')
                  }}
                </span>
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
            <button
              v-if="activeTab === 'buyxgety'"
              @click="fetchPromotions(true)"
              :disabled="isLoadingPromotions"
              class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh promotions list"
            >
              <i class="pi pi-refresh" :class="{ 'animate-spin': isLoadingPromotions }"></i>
              Refresh
            </button>
            
            <!-- Debug Test Buttons -->
            <div v-if="activeTab === 'buyxgety'" class="flex gap-2 ml-4">
              <button
                @click="testEndpoints"
                :disabled="isLoadingPromotions"
                class="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors disabled:opacity-50"
                title="Test API endpoints"
              >
                🔍 Test API
              </button>
              <button
                v-if="promotions.length > 0"
                @click="updatePromotionSimpleTest(promotions[0])"
                :disabled="isLoadingPromotions"
                class="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors disabled:opacity-50"
                title="Test simple update"
              >
                🔄 Test Update
              </button>
              <button
                v-if="promotions.length > 1"
                @click="deletePromotionSimpleTest(promotions[promotions.length - 1])"
                :disabled="isLoadingPromotions"
                class="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors disabled:opacity-50"
                title="Test simple delete (last promotion)"
              >
                🗑️ Test Delete
              </button>
            </div>
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
            <!-- Loading indicator for promotions -->
            <div v-if="isLoadingPromotions" class="flex items-center justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span class="ml-3 text-gray-600">Loading promotions...</span>
            </div>
            
            <!-- Error state for promotions -->
            <div v-else-if="promotionsError" class="flex flex-col items-center justify-center py-8">
              <div class="text-red-500 text-center">
                <i class="pi pi-exclamation-triangle text-2xl mb-2"></i>
                <p class="text-sm">{{ promotionsError }}</p>
                <button 
                  @click="fetchPromotions" 
                  class="mt-2 text-purple-600 hover:text-purple-700 underline text-xs"
                >
                  Retry
                </button>
              </div>
            </div>
            
            <!-- Empty state for promotions -->
            <div v-else-if="!isLoadingPromotions && filteredPromotions.length === 0" class="flex flex-col items-center justify-center py-8">
              <div class="text-gray-500 text-center">
                <i class="pi pi-info-circle text-2xl mb-2"></i>
                <p class="text-sm">No promotions found for this event.</p>
                <p class="text-xs text-gray-400 mt-1">Create your first promotion using the form above.</p>
              </div>
            </div>
            
            <!-- Promotion items -->
            <div
              v-else
              v-for="promotion in filteredPromotions"
              :key="promotion.id"
              class="p-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors bg-white"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1 space-y-3">
                  <div class="flex items-center space-x-3">
                    <span class="font-semibold text-gray-800 text-lg">{{ promotion.name }}</span>
                    <span
                      :class="[
                        'px-3 py-1 rounded-full text-xs font-medium',
                        promotion.status === 'Active' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      ]"
                    >
                      {{ promotion.status }}
                    </span>
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

                  <div class="text-xs text-gray-500">
                    <div>Valid: {{ promotion.validFrom }} - {{ promotion.validUntil }}</div>
                    <div v-if="promotion.description" class="mt-1">{{ promotion.description }}</div>
                  </div>
                </div>
                
                <div class="flex items-center space-x-2 ml-4">
                  <!-- Edit Button -->
                  <button
                    @click="startEditPromotion(promotion)"
                    :class="[
                      'p-2 rounded-lg border transition-colors',
                      editingPromotion?.id === promotion.id
                        ? 'bg-blue-50 text-blue-600 border-blue-200'
                        : 'text-gray-600 border-gray-300 hover:bg-gray-50 hover:text-gray-800'
                    ]"
                    :title="editingPromotion?.id === promotion.id ? 'Currently editing' : 'Edit promotion'"
                  >
                    <i class="pi pi-pencil text-sm"></i>
                  </button>
                  
                  <!-- Checkbox -->
                  <input 
                    type="checkbox" 
                    v-model="promotion.selected" 
                    class="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  >
                </div>
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

    <!-- Toast Notifications -->
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="showSuccessToast"
        class="fixed top-4 right-4 z-50 max-w-sm w-full bg-green-500 text-white rounded-lg shadow-lg p-4"
      >
        <div class="flex items-center">
          <i class="pi pi-check-circle text-xl mr-3"></i>
          <div class="flex-1">
            <p class="font-medium">Success</p>
            <p class="text-sm opacity-90">{{ toastMessage }}</p>
          </div>
          <button @click="showSuccessToast = false" class="ml-3 text-white hover:text-gray-200">
            <i class="pi pi-times"></i>
          </button>
        </div>
      </div>
    </Transition>

    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="showErrorToast"
        class="fixed top-4 right-4 z-50 max-w-sm w-full bg-red-500 text-white rounded-lg shadow-lg p-4"
      >
        <div class="flex items-center">
          <i class="pi pi-exclamation-triangle text-xl mr-3"></i>
          <div class="flex-1">
            <p class="font-medium">Error</p>
            <p class="text-sm opacity-90">{{ toastMessage }}</p>
          </div>
          <button @click="showErrorToast = false" class="ml-3 text-white hover:text-gray-200">
            <i class="pi pi-times"></i>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import EventCard from '~/components/common/EventCard.vue'
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import Calendar from 'primevue/calendar'
import IconnButton from '~/components/ui/IconnButton.vue'
import { getEventDetails, getEventTicketTypes, createPromotion, getEventPromotions, deletePromotion, updatePromotion, updatePromotionSimple, deletePromotionSimple, testPromotionEndpoints, getSinglePromotion } from '~/composables/api'

// Layout
definePageMeta({
  layout: 'admin'
})

// Get route access
const route = useRoute()

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
const eventId = ref(null)
const ticketTypes = ref([])
const isLoadingTicketTypes = ref(false)
const ticketTypesError = ref(null)
const router = useRouter()
const loading = ref(false)
const eventCardData = ref(null)
const isCreatingPromotion = ref(false)
const isLoadingPromotions = ref(false)
const promotionsError = ref(null)
const showSuccessToast = ref(false)
const showErrorToast = ref(false)
const toastMessage = ref('')
const editingPromotion = ref(null)
const isUpdatingPromotion = ref(false)

const loadEventCard = async () => {
  if (!eventId.value) {
    console.warn('⚠️ No event ID available for loading event card')
    // Set a default event card
    eventCardData.value = {
      imageSrc: '/assets/image/poster-manage-booking.png',
      altText: 'Event',
      title: 'Promotion Rules',
      owner: 'Event Organizer',
      location: 'Event Location',
      date: 'Event Date',
      time: 'Event Time'
    }
    return
  }

  try {
    const eventResponse = await getEventDetails(eventId.value)
    const event = eventResponse.data

    eventCardData.value = {
      imageSrc: event.cover_image_url || '/assets/image/poster-manage-booking.png',
      altText: event.name || 'Event',
      title: event.name || 'Untitled Event',
      owner: event.organizer || 'Unknown Organizer',
      location: event.location || 'No location specified',
      date: event.start_date
        ? new Date(event.start_date).toLocaleDateString()
        : 'No date specified',
      time: event.start_date
        ? new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'No time specified'
    }
  } catch (err) {
    console.error("❌ Failed to fetch event details:", err)
    
    // Set fallback event card data
    eventCardData.value = {
      imageSrc: '/assets/image/poster-manage-booking.png',
      altText: 'Event',
      title: 'Unable to load event details',
      owner: 'Unknown',
      location: 'Unknown',
      date: 'Unknown',
      time: 'Unknown'
    }
  }
}



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
  ticketTypeId: '',
  buyQuantity: '',
  freeTicketType: '',
  freeTicketTypeId: '',
  getQuantity: '',
  name: '',
  description: '',
  startDate: '',
  endDate: ''
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
const promotionTypes = ref([])

// Sample vouchers data
const vouchers = ref([])

// Sample promotions data
const promotions = ref([])

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

// Computed property for available ticket types with enhanced display
const availableTicketTypes = computed(() => {
  return ticketTypes.value.map(ticketType => ({
    id: ticketType.id,
    name: ticketType.name,
    price: ticketType.price,
    total: ticketType.inventory?.total || 0,
    sold: ticketType.inventory?.sold || 0,
    available: (ticketType.inventory?.total || 0) - (ticketType.inventory?.sold || 0),
    displayText: `${ticketType.name} - $${ticketType.price} (${(ticketType.inventory?.total || 0) - (ticketType.inventory?.sold || 0)} available)`
  }))
})

// Check if we have any ticket types available
const hasTicketTypes = computed(() => {
  return !isLoadingTicketTypes.value && ticketTypes.value.length > 0
})

// Error message for ticket types
const ticketTypesDisplayMessage = computed(() => {
  if (isLoadingTicketTypes.value) {
    return 'Loading ticket types...'
  }
  if (ticketTypesError.value) {
    return ticketTypesError.value
  }
  if (!hasTicketTypes.value) {
    return 'No ticket types available. Please create ticket types first.'
  }
  return 'Select ticket type'
})

// Methods
const fetchTicketTypes = async (retryCount = 0) => {
  if (!eventId.value) {
    console.warn('No event ID available for fetching ticket types')
    return
  }

  isLoadingTicketTypes.value = true
  ticketTypesError.value = null

  try {
    const response = await getEventTicketTypes(eventId.value)
    
    if (response?.success && response?.data?.ticket_types) {
      ticketTypes.value = response.data.ticket_types.filter(ticketType => ticketType.is_active)
      console.log('✅ Ticket types fetched successfully:', ticketTypes.value)
    } else {
      throw new Error('Invalid response format')
    }
  } catch (error) {
    console.error('❌ Failed to fetch ticket types:', error)
    
    // Retry logic for network errors
    if (retryCount < 2 && (error.message.includes('fetch') || error.message.includes('network'))) {
      console.log(`🔄 Retrying ticket types fetch (attempt ${retryCount + 1}/3)...`)
      setTimeout(() => fetchTicketTypes(retryCount + 1), 1000 * (retryCount + 1))
      return
    }
    
    ticketTypesError.value = error.message || 'Failed to load ticket types'
    ticketTypes.value = []
  } finally {
    isLoadingTicketTypes.value = false
  }
}

const retryFetchTicketTypes = () => {
  fetchTicketTypes(0)
}

// Toast notification helpers
const showSuccess = (message) => {
  toastMessage.value = message
  showSuccessToast.value = true
  setTimeout(() => {
    showSuccessToast.value = false
  }, 3000)
}

const showError = (message) => {
  toastMessage.value = message
  showErrorToast.value = true
  setTimeout(() => {
    showErrorToast.value = false
  }, 5000)
}

// Edit promotion functionality
const startEditPromotion = (promotion) => {
  console.log('📝 Starting to edit promotion:', promotion)
  console.log('📝 Promotion ID being used:', promotion.id)
  console.log('📝 Backend ID for comparison:', promotion.backendId)
  
  // Find the original ticket types to get their IDs
  const buyTicketType = ticketTypes.value.find(t => t.name === promotion.ticketType)
  const freeTicketType = ticketTypes.value.find(t => t.name === promotion.freeTicketType)
  
  console.log('🎫 Found buy ticket type:', buyTicketType)
  console.log('🎫 Found free ticket type:', freeTicketType)
  
  if (!buyTicketType || !freeTicketType) {
    showError('Could not find the ticket types for this promotion. Please refresh the page and try again.')
    return
  }
  
  editingPromotion.value = { ...promotion }
  
  // Populate the form with current promotion data
  buyXGetYForm.value = {
    ticketType: promotion.ticketType,
    ticketTypeId: buyTicketType?.id || '',
    buyQuantity: promotion.buyQuantity.toString(),
    freeTicketType: promotion.freeTicketType,
    freeTicketTypeId: freeTicketType?.id || '',
    getQuantity: promotion.getQuantity.toString(),
    name: promotion.name,
    description: promotion.description || '',
    startDate: promotion.validFrom ? convertDisplayDateToISO(promotion.validFrom) : '',
    endDate: promotion.validUntil ? convertDisplayDateToISO(promotion.validUntil) : ''
  }
  
  // Scroll to form
  document.querySelector('.bg-white.rounded-2xl')?.scrollIntoView({ behavior: 'smooth' })
}

const cancelEditPromotion = () => {
  editingPromotion.value = null
  
  // Reset form to default values
  buyXGetYForm.value = {
    ticketType: '',
    ticketTypeId: '',
    buyQuantity: '',
    freeTicketType: '',
    freeTicketTypeId: '',
    getQuantity: '',
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
}

const updatePromotionData = async () => {
  if (!editingPromotion.value || !eventId.value) {
    console.error('❌ No promotion being edited or no event ID')
    return
  }

  // Validate required fields
  if (!buyXGetYForm.value.ticketTypeId || !buyXGetYForm.value.freeTicketTypeId || 
      !buyXGetYForm.value.buyQuantity || !buyXGetYForm.value.getQuantity) {
    showError('Please fill in all required fields')
    return
  }

  isUpdatingPromotion.value = true

  try {
    const buyTicketType = ticketTypes.value.find(t => t.id === buyXGetYForm.value.ticketTypeId)
    const freeTicketType = ticketTypes.value.find(t => t.id === buyXGetYForm.value.freeTicketTypeId)

    if (!buyTicketType || !freeTicketType) {
      throw new Error('Selected ticket types not found')
    }

    const promotionName = buyXGetYForm.value.name || 
      `Buy ${buyXGetYForm.value.buyQuantity} ${buyTicketType.name} Get ${buyXGetYForm.value.getQuantity} ${freeTicketType.name} Free`

    const promotionDescription = buyXGetYForm.value.description || 
      `Buy ${buyXGetYForm.value.buyQuantity} ${buyTicketType.name} tickets, get ${buyXGetYForm.value.getQuantity} ${freeTicketType.name} free`

    // Fix: format dates to ISO8601 with time
    // 📅 IMPORTANT: Format dates correctly for the server (YYYY-MM-DD format)
    const formatDateForServer = (dateInput) => {
      if (!dateInput) return new Date().toISOString().split('T')[0]
      
      // If it's already a string in YYYY-MM-DD format, return as-is
      if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        return dateInput
      }
      
      // Convert Date object or other formats to YYYY-MM-DD
      const date = new Date(dateInput)
      if (isNaN(date.getTime())) {
        console.warn('⚠️ Invalid date provided, using today:', dateInput)
        return new Date().toISOString().split('T')[0]
      }
      
      return date.toISOString().split('T')[0]
    }
    
    const startDate = formatDateForServer(buyXGetYForm.value.startDate)
    const endDate = formatDateForServer(buyXGetYForm.value.endDate) || 
                   new Date(new Date().getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    // Validate date logic
    if (new Date(endDate) <= new Date(startDate)) {
      showToast('⚠️ End date must be after start date', 'warn')
      return
    }

    const promotionData = {
      ticket_type_id: buyXGetYForm.value.ticketTypeId,
      free_ticket_type_id: buyXGetYForm.value.freeTicketTypeId,
      name: promotionName,
      description: promotionDescription,
      buy_quantity: parseInt(buyXGetYForm.value.buyQuantity, 10),
      free_quantity: parseInt(buyXGetYForm.value.getQuantity, 10),
      is_active: true,
      start_date: startDate,
      end_date: endDate
    }

    console.log('🎯 Sending update payload:', promotionData)
    console.log('📅 Date formats - Start:', startDate, 'End:', endDate)

    const promoId = editingPromotion.value.backendId || editingPromotion.value.id
    const response = await updatePromotion(eventId.value, promoId, promotionData)

    if (response.success) {
      await fetchPromotions()
      cancelEditPromotion()
      showSuccess('Promotion updated successfully!')
    } else {
      throw new Error(response.message || 'Failed to update promotion')
    }
  } catch (error) {
    console.error('❌ Failed to update promotion:', error)
    showError(`Failed to update promotion: ${error.message}`)
  } finally {
    isUpdatingPromotion.value = false
  }
}


// Helper function to convert display date (DD/MM/YYYY) to ISO date (YYYY-MM-DD)
const convertDisplayDateToISO = (displayDate) => {
  if (!displayDate) return ''
  
  try {
    // Handle DD/MM/YYYY format
    const parts = displayDate.split('/')
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0')
      const month = parts[1].padStart(2, '0')
      const year = parts[2]
      return `${year}-${month}-${day}`
    }
    
    // If already in ISO format, return as is
    if (displayDate.includes('-') && displayDate.length === 10) {
      return displayDate
    }
    
    return ''
  } catch (error) {
    console.warn('Failed to convert date:', displayDate)
    return ''
  }
}

// Helper method to update ticket type names when IDs are selected
const updateTicketTypeName = (type) => {
  if (type === 'buy' && buyXGetYForm.value.ticketTypeId) {
    const ticketType = ticketTypes.value.find(t => t.id === buyXGetYForm.value.ticketTypeId)
    if (ticketType) {
      buyXGetYForm.value.ticketType = ticketType.name
    }
  } else if (type === 'free' && buyXGetYForm.value.freeTicketTypeId) {
    const ticketType = ticketTypes.value.find(t => t.id === buyXGetYForm.value.freeTicketTypeId)
    if (ticketType) {
      buyXGetYForm.value.freeTicketType = ticketType.name
    }
  }
}

// Fetch promotions from backend
// Test endpoints to debug API issues
const testEndpoints = async () => {
  if (!selectedEventId.value || !promotions.value.length) {
    showToast('Please select an event and ensure promotions exist', 'warn')
    return
  }
  
  const testPromotion = promotions.value[0]
  const promotionId = testPromotion.id || testPromotion.backendId || testPromotion.promotionId
  
  if (!promotionId) {
    showToast('No valid promotion ID found for testing', 'error')
    return
  }
  
  try {
    isLoadingPromotions.value = true
    showToast('🔍 Testing API endpoints...', 'info')
    
    const results = await testPromotionEndpoints(selectedEventId.value, promotionId)
    console.log('🧪 Endpoint test results:', results)
    
    // Try to get single promotion
    try {
      const singlePromotion = await getSinglePromotion(selectedEventId.value, promotionId)
      console.log('✅ Single promotion fetch:', singlePromotion)
      showToast('Endpoint testing complete - check console for details', 'success')
    } catch (error) {
      console.log('❌ Single promotion fetch failed:', error)
      showToast('Endpoint testing complete - check console for details', 'warn')
    }
    
  } catch (error) {
    console.error('❌ Endpoint testing failed:', error)
    showToast('Endpoint testing failed', 'error')
  } finally {
    isLoadingPromotions.value = false
  }
}

// Simple update method for testing
const updatePromotionSimpleTest = async (promotion) => {
  if (!selectedEventId.value) {
    showToast('Please select an event first', 'warn')
    return
  }
  
  const promotionId = promotion.id || promotion.backendId || promotion.promotionId
  if (!promotionId) {
    showToast('❌ No valid promotion ID found', 'error')
    return
  }
  
  try {
    isLoadingPromotions.value = true
    showToast('🔄 Testing simple update...', 'info')
    
    // Use the same data structure as create
    const updateData = {
      name: promotion.name,
      description: promotion.description || '',
      type: promotion.type,
      status: promotion.status || 'active',
      start_date: promotion.start_date,
      end_date: promotion.end_date,
      rules: promotion.rules
    }
    
    const result = await updatePromotionSimple(selectedEventId.value, promotionId, updateData)
    console.log('✅ Simple update result:', result)
    showToast('✅ Simple update successful!', 'success')
    
    // Refresh promotions
    await fetchPromotions(true)
    
  } catch (error) {
    console.error('❌ Simple update failed:', error)
    showToast(`❌ Simple update failed: ${error.message}`, 'error')
  } finally {
    isLoadingPromotions.value = false
  }
}

// Simple delete method for testing
const deletePromotionSimpleTest = async (promotion) => {
  if (!selectedEventId.value) {
    showToast('Please select an event first', 'warn')
    return
  }
  
  const promotionId = promotion.id || promotion.backendId || promotion.promotionId
  if (!promotionId) {
    showToast('❌ No valid promotion ID found', 'error')
    return
  }
  
  try {
    isLoadingPromotions.value = true
    showToast('🗑️ Testing simple delete...', 'info')
    
    const result = await deletePromotionSimple(selectedEventId.value, promotionId)
    console.log('✅ Simple delete result:', result)
    showToast('✅ Simple delete successful!', 'success')
    
    // Refresh promotions
    await fetchPromotions(true)
    
  } catch (error) {
    console.error('❌ Simple delete failed:', error)
    showToast(`❌ Simple delete failed: ${error.message}`, 'error')
  } finally {
    isLoadingPromotions.value = false
  }
}

const fetchPromotions = async (forceRefresh = false) => {
  if (!eventId.value) {
    console.warn('No event ID available for fetching promotions')
    return
  }

  if (forceRefresh) {
    console.log('🔄 Force refreshing promotions...')
  }

  isLoadingPromotions.value = true
  promotionsError.value = null

  try {
    const response = await getEventPromotions(eventId.value)
    
    if (response.success && response.data) {
      // Transform backend promotion data to match our UI format
      const backendPromotions = Array.isArray(response.data) ? response.data : []
      console.log('🔍 Raw promotion data from backend:', backendPromotions)
      
      // Validate that all promotions have valid IDs
      const validPromotions = backendPromotions.filter(promotion => {
        if (!promotion.id) {
          console.warn('⚠️ Promotion missing ID:', promotion)
          return false
        }
        return true
      })
      
      promotions.value = validPromotions.map(promotion => {
        console.log('🔍 Processing promotion:', promotion)
        return {
          id: promotion.id,
          backendId: promotion.id, // Keep original ID for debugging
          name: promotion.name,
          buyQuantity: promotion.buy_quantity,
          getQuantity: promotion.free_quantity,
          ticketType: promotion.ticket_type?.name || 'Unknown',
          freeTicketType: promotion.free_ticket_type?.name || 'Unknown',
          offerType: 'free',
          discountPercentage: 0,
          status: promotion.is_active ? 'Active' : 'Inactive',
          usedCount: promotion.used_count || 0,
          maxUses: promotion.max_uses || 1000,
          validFrom: promotion.start_date ? new Date(promotion.start_date).toLocaleDateString('en-GB') : '14/08/2025',
          validUntil: promotion.end_date ? new Date(promotion.end_date).toLocaleDateString('en-GB') : '14/12/2025',
          selected: false,
          type: `buy${promotion.buy_quantity}get${promotion.free_quantity}`,
          description: promotion.description
        }
      })
      
      console.log('✅ Promotions transformed for UI:', promotions.value)
    }
  } catch (error) {
    console.error('❌ Failed to fetch promotions:', error)
    promotionsError.value = error.message || 'Failed to load promotions'
  } finally {
    isLoadingPromotions.value = false
  }
}

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

const generateBuyXGetY = async () => {
  if (!eventId.value) {
    console.error('❌ No event ID available for creating promotion')
    return
  }

  // Validate form data
  if (!buyXGetYForm.value.ticketTypeId || !buyXGetYForm.value.freeTicketTypeId || 
      !buyXGetYForm.value.buyQuantity || !buyXGetYForm.value.getQuantity) {
    console.error('❌ Missing required form data')
    return
  }

  isCreatingPromotion.value = true

  try {
    // Generate promotion name and description if not provided
    const buyTicketType = ticketTypes.value.find(t => t.id === buyXGetYForm.value.ticketTypeId)
    const freeTicketType = ticketTypes.value.find(t => t.id === buyXGetYForm.value.freeTicketTypeId)
    
    if (!buyTicketType || !freeTicketType) {
      throw new Error('Selected ticket types not found')
    }

    const promotionName = buyXGetYForm.value.name || 
      `Buy ${buyXGetYForm.value.buyQuantity} ${buyTicketType.name} Get ${buyXGetYForm.value.getQuantity} ${freeTicketType.name} Free`
    
    const promotionDescription = buyXGetYForm.value.description || 
      `Buy ${buyXGetYForm.value.buyQuantity} ${buyTicketType.name} tickets, get ${buyXGetYForm.value.getQuantity} ${freeTicketType.name} free`

    // Prepare promotion data for API
    const promotionData = {
      ticket_type_id: buyXGetYForm.value.ticketTypeId,
      free_ticket_type_id: buyXGetYForm.value.freeTicketTypeId,
      name: promotionName,
      description: promotionDescription,
      buy_quantity: parseInt(buyXGetYForm.value.buyQuantity),
      free_quantity: parseInt(buyXGetYForm.value.getQuantity),
      is_active: true,
      start_date: buyXGetYForm.value.startDate || new Date().toISOString().split('T')[0],
      end_date: buyXGetYForm.value.endDate || new Date(new Date().getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }

    console.log('🎯 Creating promotion with data:', promotionData)

    const response = await createPromotion(eventId.value, promotionData)
    
    if (response.success) {
      console.log('✅ Promotion created successfully')
      
      // Refresh promotions list
      await fetchPromotions()
      
      // Reset form and edit state
      cancelEditPromotion()
      
      // Show success message (you can add a toast notification here)
      showSuccess('Promotion created successfully!')
    } else {
      throw new Error(response.message || 'Failed to create promotion')
    }
  } catch (error) {
    console.error('❌ Failed to create promotion:', error)
    // Show error message (you can add a toast notification here)
    showError(`Failed to create promotion: ${error.message}`)
  } finally {
    isCreatingPromotion.value = false
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

const deleteSelected = async () => {
  if (activeTab.value === 'voucher') {
    vouchers.value = vouchers.value.filter(voucher => !voucher.selected)
  } else {
    // Handle promotion deletion with backend API
    const selectedPromotions = promotions.value.filter(promotion => promotion.selected)
    
    if (selectedPromotions.length === 0) {
      return
    }

    const confirmDelete = confirm(`Are you sure you want to delete ${selectedPromotions.length} promotion(s)?`)
    if (!confirmDelete) {
      return
    }

    try {
      // Delete promotions from backend
      console.log('🗑️ Selected promotions to delete:', selectedPromotions)
      console.log('🗑️ Event ID:', eventId.value)
      
      // Validate that all selected promotions have valid IDs
      const invalidPromotions = selectedPromotions.filter(p => !p.id || p.id === 'undefined')
      if (invalidPromotions.length > 0) {
        throw new Error(`Some promotions have invalid IDs. Please refresh the page and try again.`)
      }
      
      const deletePromises = selectedPromotions.map(promotion => {
        console.log(`🗑️ Deleting promotion: ${promotion.id} (${promotion.name})`)
        console.log(`🗑️ Backend ID: ${promotion.backendId || 'not available'}`)
        return deletePromotion(eventId.value, promotion.id)
      })
      
      await Promise.all(deletePromises)
      
      // Refresh promotions list
      await fetchPromotions()
      
      console.log('✅ Selected promotions deleted successfully')
      showSuccess(`${selectedPromotions.length} promotion(s) deleted successfully`)
    } catch (error) {
      console.error('❌ Failed to delete promotions:', error)
      showError(`Failed to delete promotions: ${error.message}`)
    }
  }
}

// Lifecycle
onMounted(async () => {
  // Set default dates for voucher form as Date objects for Calendar component
  const today = new Date()
  const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
  const threeMonthsFromNow = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)
  
  voucherForm.value.validFrom = today
  voucherForm.value.validUntil = nextMonth

  // Set default dates for promotion form as ISO date strings for HTML date inputs
  buyXGetYForm.value.startDate = today.toISOString().split('T')[0]
  buyXGetYForm.value.endDate = threeMonthsFromNow.toISOString().split('T')[0]

  // Get event ID from route params or query
  // Try to get event ID from various sources
  if (route.params.id) {
    eventId.value = route.params.id
  } else if (route.query.eventId) {
    eventId.value = route.query.eventId
  } else if (route.query.event_id) {
    eventId.value = route.query.event_id
  } else if (process.client) {
    // Try to get from localStorage as fallback
    const storedEventId = localStorage.getItem('currentEventId')
    if (storedEventId) {
      eventId.value = storedEventId
    }
  }

  console.log('🎯 Event ID found:', eventId.value)

  // Load event card data
  await loadEventCard()

  // Fetch ticket types if we have an event ID
  if (eventId.value) {
    console.log('🎫 Fetching ticket types for event:', eventId.value)
    fetchTicketTypes()
    
    // Also fetch existing promotions
    console.log('🎯 Fetching promotions for event:', eventId.value)
    fetchPromotions()
  } else {
    console.warn('⚠️ No event ID found for fetching ticket types and promotions')
  }
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