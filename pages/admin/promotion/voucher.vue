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

            <form @submit.prevent="generateVoucher()" class="space-y-5">
              <!-- Voucher Code -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Voucher Code <span class="text-red-500">*</span></label>
                <input
                  v-model="voucherForm.code"
                  type="text"
                  placeholder="SAVE10"
                  class="w-full px-4 py-3 bg-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  maxlength="20"
                  required
                  @input="voucherForm.code = voucherForm.code.toUpperCase()"
                />
                <p class="text-xs text-gray-500 mt-1">Letters and numbers only, no spaces (will be converted to uppercase)</p>
              </div>

              <!-- Discount Type -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Discount Type <span class="text-red-500">*</span></label>
                <select
                  v-model="voucherForm.type"
                  class="w-full px-4 py-3 bg-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="fixed">Fixed Amount ($)</option>
                  <option value="percent">Percentage (%)</option>
                </select>
              </div>

              <!-- Discount Value -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Value <span class="text-red-500">*</span>
                  <span class="text-sm text-gray-500">
                    {{ voucherForm.type === 'percent' ? '(%)' : '($)' }}
                  </span>
                </label>
                <input
                  v-model="voucherForm.value"
                  type="number"
                  step="0.01"
                  min="0.01"
                  :max="voucherForm.type === 'percent' ? '100' : '10000'"
                  placeholder="10"
                  class="w-full px-4 py-3 bg-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <p class="text-xs text-gray-500 mt-1">
                  {{ voucherForm.type === 'percent' ? 'Enter percentage (1-100)' : 'Enter dollar amount' }}
                </p>
              </div>

              <!-- Usage Limit -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Usage Limit <span class="text-red-500">*</span></label>
                <input
                  v-model="voucherForm.usage_limit"
                  type="number"
                  min="1"
                  placeholder="10"
                  class="w-full px-4 py-3 bg-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <p class="text-xs text-gray-500 mt-1">Number of times this voucher can be used</p>
              </div>

              <!-- Date Fields Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Valid From -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Valid from <span class="text-red-500">*</span></label>
                  <Calendar
                    v-model="voucherForm.valid_from"
                    placeholder="Select start date"
                    dateFormat="dd/mm/yy"
                    :minDate="new Date()"
                    class="w-full"
                    inputClass="w-full px-4 py-3 bg-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <!-- Valid Until / Expires At -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Valid until <span class="text-red-500">*</span></label>
                  <Calendar
                    v-model="voucherForm.expires_at"
                    placeholder="Select expiration date"
                    dateFormat="dd/mm/yy"
                    :minDate="voucherForm.valid_from || new Date()"
                    class="w-full"
                    inputClass="w-full px-4 py-3 bg-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <!-- Active Status -->
              <div class="flex items-center space-x-3">
                <input
                  v-model="voucherForm.is_active"
                  type="checkbox"
                  id="voucherActive"
                  class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label for="voucherActive" class="text-sm font-medium text-gray-700">
                  Active (voucher can be used immediately)
                </label>
              </div>

              <!-- Generate Button -->
              <button
                type="submit"
                :disabled="isCreatingCoupon"
                class="w-full py-3 bg-gradient-to-r from-blue-700 to-purple-600 text-white rounded-2xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i v-if="isCreatingCoupon" class="pi pi-spin pi-spinner"></i>
                <i v-else class="pi pi-gift"></i>
                <span>{{ isCreatingCoupon ? 'Creating...' : 'Generate Voucher' }}</span>
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
              v-if="activeTab === 'voucher'"
              @click="fetchCoupons(true)"
              :disabled="isLoadingCoupons"
              class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50 mr-2"
              title="Refresh vouchers list"
            >
              <i class="pi pi-refresh" :class="{ 'animate-spin': isLoadingCoupons }"></i>
              Refresh
            </button>
            <button
              v-if="activeTab === 'voucher'"
              @click="debugEventIsolation"
              class="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
              title="Test event isolation"
            >
              <i class="pi pi-info-circle"></i>
              Debug
            </button>
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
            <!-- Loading State -->
            <div v-if="isLoadingCoupons" class="flex items-center justify-center py-12">
              <div class="text-center">
                <i class="pi pi-spin pi-spinner text-2xl text-purple-600 mb-2"></i>
                <p class="text-gray-600">Loading vouchers...</p>
              </div>
            </div>

            <!-- Error State -->
            <div v-else-if="couponsError" class="flex items-center justify-center py-12">
              <div class="text-center">
                <i class="pi pi-exclamation-triangle text-2xl text-red-500 mb-2"></i>
                <p class="text-red-600 mb-3">{{ couponsError }}</p>
                <div class="space-x-2">
                  <button
                    @click="fetchCoupons(true)"
                    class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Retry
                  </button>
                  <button
                    @click="debugCoupons()"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Debug
                  </button>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else-if="!filteredVouchers.length" class="flex items-center justify-center py-12">
              <div class="text-center">
                <i class="pi pi-gift text-3xl text-gray-400 mb-3"></i>
                <p class="text-gray-600 mb-2">No vouchers created yet</p>
                <p class="text-sm text-gray-500">Create your first voucher using the form above</p>
              </div>
            </div>

            <!-- Voucher Items -->
            <div
              v-else
              v-for="voucher in filteredVouchers"
              :key="voucher.id"
              class="p-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors bg-white"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1 space-y-3">
                  <div class="flex items-center space-x-3">
                    <span class="font-semibold text-gray-800 text-lg">
                      {{ voucher.coupon_type === 'percent' ? voucher.discount + '%' : '$' + voucher.discount }} Voucher
                    </span>
                    <span
                      :class="[
                        'px-3 py-1 rounded-full text-xs font-medium',
                        voucher.status === 'Used' || voucher.usage_limit <= 0 ? 'bg-red-100 text-red-700' :
                        voucher.status === 'Unused' ? 'bg-green-100 text-green-700' :
                        voucher.status === 'Inactive' || !voucher.is_active ? 'bg-gray-100 text-gray-700' :
                        'bg-green-100 text-green-700'
                      ]"
                    >
                      {{ voucher.status }}
                    </span>
                  </div>
                  
                  <div class="flex items-center space-x-4">
                    <span class="text-sm text-gray-600 font-medium">Voucher code: {{ voucher.code }}</span>
                    <span class="text-xs bg-gray-50 text-gray-700 px-3 py-1 border border-gray-200 rounded-full">
                      Discount {{ voucher.coupon_type === 'percent' ? voucher.discount + '%' : '$' + voucher.discount }}
                    </span>
                    <span class="text-xs bg-blue-50 text-blue-700 px-3 py-1 border border-blue-200 rounded-full">
                      {{ voucher.usage_limit }} uses left
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
import { ref, computed, onMounted, watch } from 'vue'
import EventCard from '~/components/common/EventCard.vue'
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import Calendar from 'primevue/calendar'
import { getEventDetails, getEventTicketTypes, createPromotion, getEventPromotions, updatePromotion, deletePromotion, createCoupon, getCoupons } from '~/composables/api'

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

// Voucher-specific reactive data
const isCreatingCoupon = ref(false)
const isLoadingCoupons = ref(false)
const couponsError = ref(null)

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



// Voucher form - Updated to match API fields
const voucherForm = ref({
  event_id: '',
  code: '',
  type: 'fixed', // fixed or percent
  value: '',
  usage_limit: '',
  valid_from: '',
  expires_at: '',
  is_active: true
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

// Voucher types for filter - will be populated dynamically from actual voucher data
const voucherTypes = ref([
  { label: 'All Vouchers', value: 'all', count: 'View All' }
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

// Fetch coupons for the event
const fetchCoupons = async (forceRefresh = false) => {
  if (!eventId.value) {
    console.warn('No event ID available for fetching coupons')
    return
  }

  if (forceRefresh) {
    console.log('🔄 Force refreshing coupons for event:', eventId.value)
  }

  isLoadingCoupons.value = true
  couponsError.value = null

  try {
    const response = await getCoupons(eventId.value)
    
    if (response.success && response.data) {
      // Handle both array and object responses
      let couponsArray = []
      
      if (Array.isArray(response.data)) {
        couponsArray = response.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        couponsArray = response.data.data
      } else if (response.data.coupons && Array.isArray(response.data.coupons)) {
        couponsArray = response.data.coupons
      } else {
        console.log('⚠️ Unexpected response format:', response.data)
        couponsArray = []
      }

      // IMPORTANT: Filter coupons by current event ID to ensure isolation
      const currentEventCoupons = couponsArray.filter(coupon => {
        const couponEventId = coupon.event_id
        const matches = couponEventId === eventId.value
        console.log(`🔍 Coupon ${coupon.code}: event_id=${couponEventId}, current=${eventId.value}, matches=${matches}`)
        return matches
      })

      console.log(`📊 Total coupons from API: ${couponsArray.length}, Filtered for current event: ${currentEventCoupons.length}`)

      // Transform API data to match UI expectations
      vouchers.value = currentEventCoupons.map(coupon => ({
        id: coupon.id,
        name: `${coupon.type === 'percent' ? coupon.value + '%' : '$' + coupon.value} Voucher`,
        code: coupon.code,
        discount: parseFloat(coupon.value), // Parse as number since API returns string
        status: coupon.is_active ? (coupon.usage_limit > coupon.used ? 'Unused' : 'Used') : 'Inactive',
        validFrom: formatDateForDisplay(coupon.valid_from || coupon.created_at),
        validUntil: formatDateForDisplay(coupon.expires_at),
        selected: false,
        type: coupon.value.toString(),
        usage_limit: coupon.usage_limit,
        used: coupon.used || 0,
        is_active: coupon.is_active,
        expires_at: coupon.expires_at,
        valid_from: coupon.valid_from,
        coupon_type: coupon.type,
        event_id: coupon.event_id // Store event_id for reference
      }))
      
      console.log('✅ Coupons fetched and filtered for current event:', vouchers.value)
      
      // Update voucher types for filtering
      updateVoucherTypes()
    } else {
      vouchers.value = []
      console.log('ℹ️ No coupons found for this event')
      
      // Reset voucher types to default
      voucherTypes.value = [
        { label: 'All Vouchers', value: 'all', count: 'View All' }
      ]
    }
  } catch (error) {
    console.error('❌ Failed to fetch coupons:', error)
    couponsError.value = error.message || 'Failed to load coupons'
    vouchers.value = []
  } finally {
    isLoadingCoupons.value = false
  }
}

// Helper function to format date for display
const formatDateForDisplay = (dateString) => {
  if (!dateString) return '14/08/2025'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '14/08/2025'
    
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    
    return `${day}/${month}/${year}`
  } catch (error) {
    console.warn('Failed to format date:', dateString)
    return '14/08/2025'
  }
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
  // Find the original ticket types to get their IDs
  const buyTicketType = ticketTypes.value.find(t => t.name === promotion.ticketType)
  const freeTicketType = ticketTypes.value.find(t => t.name === promotion.freeTicketType)
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
  if (!eventId.value || !editingPromotion.value) return
  isUpdatingPromotion.value = true
  try {
    // Validate form data before sending
    if (!buyXGetYForm.value.ticketTypeId || !buyXGetYForm.value.freeTicketTypeId || 
        !buyXGetYForm.value.buyQuantity || !buyXGetYForm.value.getQuantity || 
        !buyXGetYForm.value.name) {
      showError('Please fill in all required fields')
      return
    }

    const response = await updatePromotion(eventId.value, editingPromotion.value.id, {
      ticket_type_id: buyXGetYForm.value.ticketTypeId,
      free_ticket_type_id: buyXGetYForm.value.freeTicketTypeId,
      buy_quantity: parseInt(buyXGetYForm.value.buyQuantity),
      free_quantity: parseInt(buyXGetYForm.value.getQuantity),
      name: buyXGetYForm.value.name,
      description: buyXGetYForm.value.description || '',
      start_date: buyXGetYForm.value.startDate,
      end_date: buyXGetYForm.value.endDate,
      is_active: true
    })

    if (response.success) {
      showSuccess('Promotion updated successfully!')
      await fetchPromotions(true)
      cancelEditPromotion()
    } else {
      showError(response.message || 'Failed to update promotion')
    }
  } catch (err) {
    console.error('❌ Update failed:', err)
    showError(`Update failed: ${err.message}`)
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
// Simple update method for testing
// Simple delete method for testing
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

const generateVoucher = async () => {
  if (!eventId.value) {
    console.error('❌ No event ID available for creating voucher')
    showError('Event ID is required to create voucher')
    return
  }

  // Validate form data
  if (!voucherForm.value.code || !voucherForm.value.value || !voucherForm.value.usage_limit) {
    showError('Please fill in all required fields: Code, Value, and Usage Limit')
    return
  }

  // Validate voucher code format (alphanumeric, no spaces, allow common formats)
  const codePattern = /^[A-Za-z0-9]+$/
  if (!codePattern.test(voucherForm.value.code)) {
    showError('Voucher code must contain only letters and numbers, no spaces or special characters')
    return
  }

  // Validate value (must be positive number)
  const value = parseFloat(voucherForm.value.value)
  if (isNaN(value) || value <= 0) {
    showError('Value must be a positive number')
    return
  }

  // Validate usage limit (must be positive integer)
  const usageLimit = parseInt(voucherForm.value.usage_limit)
  if (isNaN(usageLimit) || usageLimit <= 0) {
    showError('Usage limit must be a positive number')
    return
  }

  // Validate date fields
  if (!voucherForm.value.valid_from) {
    showError('Valid from date is required')
    return
  }

  if (!voucherForm.value.expires_at) {
    showError('Valid until date is required')
    return
  }

  // Validate that expires_at is after valid_from
  const validFromDate = new Date(formatDateForAPI(voucherForm.value.valid_from))
  const expiresAtDate = new Date(formatDateForAPI(voucherForm.value.expires_at))
  
  if (expiresAtDate <= validFromDate) {
    showError('Valid until date must be after valid from date')
    return
  }

  isCreatingCoupon.value = true

  try {
    // Prepare voucher data according to API specification
    const couponData = {
      event_id: eventId.value,
      code: voucherForm.value.code.toUpperCase().trim(),
      type: voucherForm.value.type, // 'fixed' or 'percent'
      value: value,
      usage_limit: usageLimit,
      valid_from: formatDateForAPI(voucherForm.value.valid_from),
      expires_at: formatDateForAPI(voucherForm.value.expires_at),
      is_active: voucherForm.value.is_active !== undefined ? voucherForm.value.is_active : true
    }

    console.log('🎫 Creating voucher with data:', couponData)

    const response = await createCoupon(eventId.value, couponData)

    if (response.success) {
      showSuccess('Voucher created successfully!')
      
      // If the response contains the created voucher data, add it to our local list immediately
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        const newVoucher = response.data.data[0] // Get the first (and likely only) voucher
        if (newVoucher) {
          // Transform and add to local vouchers list immediately
          const transformedVoucher = {
            id: newVoucher.id,
            name: `${newVoucher.type === 'percent' ? newVoucher.value + '%' : '$' + newVoucher.value} Voucher`,
            code: newVoucher.code,
            discount: parseFloat(newVoucher.value),
            status: newVoucher.is_active ? (newVoucher.usage_limit > (newVoucher.used || 0) ? 'Unused' : 'Used') : 'Inactive',
            validFrom: formatDateForDisplay(newVoucher.valid_from || newVoucher.created_at),
            validUntil: formatDateForDisplay(newVoucher.expires_at),
            selected: false,
            type: newVoucher.value.toString(),
            usage_limit: newVoucher.usage_limit,
            used: newVoucher.used || 0,
            is_active: newVoucher.is_active,
            expires_at: newVoucher.expires_at,
            valid_from: newVoucher.valid_from,
            coupon_type: newVoucher.type,
            event_id: newVoucher.event_id || eventId.value // Ensure event_id is preserved for filtering
          }
          
          // Add to the beginning of the vouchers array
          vouchers.value.unshift(transformedVoucher)
          
          // Update filter types
          updateVoucherTypes()
          
          console.log('✅ Added new voucher to local list:', transformedVoucher)
        }
      }
      
      // Reset form
      voucherForm.value = {
        event_id: eventId.value,
        code: '',
        type: 'fixed',
        value: '',
        usage_limit: '',
        valid_from: new Date(), // Today
        expires_at: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        is_active: true
      }

      // Still try to refresh from server, but don't rely on it
      try {
        await fetchCoupons(true)
      } catch (fetchError) {
        console.warn('⚠️ Failed to fetch updated coupons list, but voucher was created:', fetchError)
        // Don't show error since we already have the voucher in the list
      }
    } else {
      throw new Error(response.message || 'Failed to create voucher')
    }
  } catch (error) {
    console.error('❌ Failed to create voucher:', error)
    showError(`Failed to create voucher: ${error.message}`)
  } finally {
    isCreatingCoupon.value = false
  }
}

// Helper function to format date for API (YYYY-MM-DD format)
const formatDateForAPI = (dateInput) => {
  if (!dateInput) return new Date().toISOString().split('T')[0]
  
  // If it's a Date object from Calendar component
  if (dateInput instanceof Date) {
    return dateInput.toISOString().split('T')[0]
  }
  
  // If it's already a string in YYYY-MM-DD format, return as-is
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return dateInput
  }
  
  // Try to parse and convert
  try {
    const date = new Date(dateInput)
    if (isNaN(date.getTime())) {
      console.warn('⚠️ Invalid date, using today:', dateInput)
      return new Date().toISOString().split('T')[0]
    }
    return date.toISOString().split('T')[0]
  } catch (error) {
    console.warn('⚠️ Date parsing failed, using today:', dateInput)
    return new Date().toISOString().split('T')[0]
  }
}

// Update voucher types for filtering based on actual data
const updateVoucherTypes = () => {
  const typeMap = new Map()
  
  // Count vouchers by type
  vouchers.value.forEach(voucher => {
    const key = voucher.type
    const label = voucher.coupon_type === 'percent' ? `${voucher.discount}% Voucher` : `$${voucher.discount} Voucher`
    
    if (typeMap.has(key)) {
      typeMap.get(key).count++
    } else {
      typeMap.set(key, {
        label: label,
        value: key,
        count: 1
      })
    }
  })
  
  // Convert to array and add 'All' option
  const types = [
    { label: 'All Vouchers', value: 'all', count: `${vouchers.value.length} Total` }
  ]
  
  // Add individual types
  typeMap.forEach(type => {
    types.push({
      label: type.label,
      value: type.value,
      count: `${type.count} Created`
    })
  })
  
  voucherTypes.value = types
}

// Debug function to help troubleshoot coupon fetching
const debugCoupons = async () => {
  if (!eventId.value) {
    console.log('❌ No event ID for debugging')
    return
  }
  
  console.log('🔍 DEBUGGING COUPON ENDPOINTS')
  console.log('Event ID:', eventId.value)
  
  // Test direct API calls to understand the issue
  const headers = await createAuthHeaders()
  
  const testEndpoints = [
    `/api/admin/coupons?event_id=${eventId.value}`,
    `/api/admin/coupons/?event_id=${eventId.value}`,
    `/api/admin/events/${eventId.value}/coupons`,
    `/api/admin/coupons/event/${eventId.value}`,
  ]
  
  for (const endpoint of testEndpoints) {
    try {
      console.log(`🔍 Testing: ${endpoint}`)
      const response = await $fetch(endpoint, {
        method: 'GET',
        headers
      })
      console.log(`✅ SUCCESS: ${endpoint}`, response)
    } catch (error) {
      console.log(`❌ FAILED: ${endpoint}`, error.status, error.message)
    }
  }
  
  showError('Check the console for debug information')
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
  if (!eventId.value) return
  
  if (activeTab.value === 'voucher') {
    const selectedVouchers = vouchers.value.filter(v => v.selected)
    
    if (selectedVouchers.length === 0) {
      showError('No vouchers selected for deletion')
      return
    }
    
    // For now, show message that voucher deletion is not available
    showError('Voucher deletion is not available yet. Please contact support to delete vouchers.')
    return
  }
  
  // Handle promotion deletion (existing code)
  const selectedPromotions = promotions.value.filter(p => p.selected)

  if (selectedPromotions.length === 0) {
    showError('No promotions selected for deletion')
    return
  }

  try {
    console.log('🗑️ Deleting promotions:', selectedPromotions.map(p => ({ id: p.id, name: p.name })))
    
    for (const promo of selectedPromotions) {
      console.log(`🗑️ Deleting promotion: ${promo.id} (${promo.name})`)
      await deletePromotion(eventId.value, promo.id)
      console.log(`✅ Successfully deleted promotion: ${promo.id}`)
    }
    
    showSuccess('Selected promotions deleted successfully!')
    await fetchPromotions(true)
  } catch (err) {
    console.error('❌ Delete failed:', err)
    showError(`Failed to delete: ${err.message}`)
  }
}

// Debug function to test event isolation
const debugEventIsolation = async () => {
  console.log('🔍 DEBUGGING EVENT ISOLATION')
  console.log('Current Event ID:', eventId.value)
  console.log('Route params:', route.params)
  console.log('Route query:', route.query)
  
  // Show current vouchers in memory
  console.log('📊 Current vouchers in memory:', vouchers.value.length)
  vouchers.value.forEach((voucher, index) => {
    console.log(`  ${index + 1}. ${voucher.code} (event_id: ${voucher.event_id}) - Matches current: ${voucher.event_id === eventId.value}`)
  })
  
  // Fetch fresh data and check what comes from API
  try {
    console.log('🔄 Fetching fresh data from API...')
    const response = await getCoupons(eventId.value)
    
    if (response.success && response.data) {
      let rawCoupons = []
      
      if (Array.isArray(response.data)) {
        rawCoupons = response.data
      } else if (response.data.data) {
        rawCoupons = response.data.data
      }
      
      console.log('📡 Raw API response contains:', rawCoupons.length, 'coupons')
      
      // Check event IDs in raw response
      const eventGroups = {}
      rawCoupons.forEach(coupon => {
        const eventId = coupon.event_id
        if (!eventGroups[eventId]) {
          eventGroups[eventId] = []
        }
        eventGroups[eventId].push(coupon.code)
      })
      
      console.log('📊 Coupons grouped by event_id:')
      Object.keys(eventGroups).forEach(eid => {
        const isCurrentEvent = eid === eventId.value
        console.log(`  Event ${eid} ${isCurrentEvent ? '(CURRENT)' : ''}: ${eventGroups[eid].length} coupons - [${eventGroups[eid].join(', ')}]`)
      })
      
      alert(`Debug complete! Check console for details.\n\nCurrent Event: ${eventId.value}\nTotal API Coupons: ${rawCoupons.length}\nFiltered for Current Event: ${(eventGroups[eventId.value] || []).length}`)
    }
  } catch (error) {
    console.error('❌ Debug API call failed:', error)
    alert('Debug API call failed. Check console for details.')
  }
}

onMounted(async () => {
  // Set default dates for voucher form as Date objects for Calendar component
  const today = new Date()
  const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
  const threeMonthsFromNow = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)
  
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

  // Watch for route changes and refresh data for new events
  watch(() => route.params.id, async (newEventId, oldEventId) => {
    if (newEventId && newEventId !== oldEventId) {
      console.log('🔄 Event changed from', oldEventId, 'to', newEventId)
      eventId.value = newEventId
      
      // Clear existing data
      vouchers.value = []
      promotions.value = []
      
      // Store new event ID
      if (process.client) {
        localStorage.setItem('currentEventId', newEventId)
      }
      
      // Refresh data for new event
      await Promise.all([
        fetchEventInfo(),
        fetchTicketTypes(),
        fetchCoupons(true),
        fetchPromotions(true)
      ])
    }
  }, { immediate: false })

  // Initialize voucher form with event ID and default values
  if (eventId.value) {
    voucherForm.value = {
      event_id: eventId.value,
      code: '',
      type: 'fixed',
      value: '',
      usage_limit: '',
      valid_from: today, // Date object for Calendar component
      expires_at: nextMonth, // Date object for Calendar component
      is_active: true
    }
  }

  // Load event card data
  await loadEventCard()

  // Fetch data if we have an event ID
  if (eventId.value) {
    fetchTicketTypes()
    
    // Fetch existing promotions for Buy X Get Y tab
    fetchPromotions()
    
    // Fetch existing coupons for Voucher tab
    fetchCoupons()
  } else {
    console.warn('⚠️ No event ID found for fetching data')
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