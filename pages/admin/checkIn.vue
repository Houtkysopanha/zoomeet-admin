<template>
  <div class="min-h-screen flex bg-[#F8F8FF] flex-col items-center p-6 overflow-y-hidden">
    <div
      class="relative w-full bg-gradient-to-r from-[#6A3ABF] to-[#A060F0] py-20 text-center rounded-3xl shadow-xl transform transition-all duration-500 hover:scale-[1.02]"
    >
      <Icon name="heroicons:ticket" class="absolute top-8 left-10 text-white/20 w-12 h-12 " />
      <Icon name="heroicons:ticket" class="absolute top-1/2 left-20 text-white/20 w-16 h-16 " />
      <Icon name="heroicons:ticket" class="absolute bottom-10 left-40 text-white/20 w-10 h-10" />
      <Icon name="heroicons:cube" class="absolute top-16 right-16 text-white/20 w-20 h-20 " />
      <Icon name="heroicons:cube" class="absolute bottom-8 right-32 text-white/20 w-14 h-14" />
      <Icon name="heroicons:ticket" class="absolute bottom-1/4 right-20 text-white/20 w-16 h-16" />
      <h1 class="text-5xl font-extrabold text-white mb-6 relative z-10 drop-shadow-lg">
        Search Identity Verification Tickets
      </h1>
      <p class="text-xl text-white/90 mb-10 relative z-10 drop-shadow-md">
        Search by booking reference, phone number, or ID to verify ticket holder identity
      </p>
      <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 z-20 w-full max-w-5xl">
        <div class="flex w-full bg-[#F8F8FF] rounded-xl shadow-lg overflow-hidden">
          <Button
            class="flex-1 p-5 bg-[#F8F8FF] text-lg border-none rounded-l-xl text-gray-400 hover:text-purple-600 hover:border-1  hover:bg-gray-50 transition-all duration-200 cursor-pointer text-left"
            @click="performGeneralSearch"
          >
            Search identity tickets
          </Button>
          <div
            v-if="!showSearchForm"
            label="Search"
            class="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white py-3 px-6 rounded-r-xl transition-all duration-200 flex items-center gap-2 text-lg font-semibold shadow-md"
          >
            <Icon name="heroicons:magnifying-glass" class="w-5 h-5" />
            Search
          </div>
        </div>
      </div>
    </div>
    <div class="flex-1 w-full mt-12 p-2">
      <Transition name="slide-fade" mode="out-in">
        <!-- Search Form with Tabs -->
        <div v-if="!searchPerformed && showSearchForm" key="searchForm" class="bg-[#F8F8FF] rounded-xl shadow-lg p-6 max-w-5xl mx-auto">
          <!-- Tab Navigation -->
          <div class="flex w-full mb-4 border-b border-gray-200">
            <button
              @click="activeTab = 'phone'"
              :class="[
                'flex-1 px-4 py-3 font-medium text-base transition-all duration-300 text-center',
                activeTab === 'phone'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              ]"
            >
              Phone Number
            </button>
            <button
              @click="activeTab = 'email'"
              :class="[
                'flex-1 px-4 py-3 font-medium text-base transition-all duration-300 text-center',
                activeTab === 'email'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              ]"
            >
              Email
            </button>
          </div>

          <!-- Tab Content -->
          <div class="space-y-4">
            <!-- General Error Message -->
            <div v-if="formErrors.general" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div class="flex items-center">
                <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 text-red-500 mr-2" />
                <span class="text-red-700 text-sm font-medium">{{ formErrors.general }}</span>
              </div>
            </div>

            <!-- Phone Number Tab -->
            <div v-if="activeTab === 'phone'" class="space-y-4">
              <div class="w-full">
                <label for="phoneNumber" class="block text-gray-700 text-sm font-medium mb-2">Phone number</label>
                <InputText
                  id="phoneNumber"
                  v-model="phoneNumber"
                  placeholder="+855 93984640"
                  :class="[
                    'w-full p-3 rounded-lg border focus:ring-1 focus:ring-purple-500 focus:border-purple-500 focus:outline-none text-gray-800 transition-all duration-200',
                    formErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  ]"
                />
                <div v-if="formErrors.phone" class="mt-1 text-red-600 text-sm flex items-center">
                  <Icon name="heroicons:exclamation-circle" class="w-4 h-4 mr-1" />
                  {{ formErrors.phone }}
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="bookingReference" class="block text-gray-700 text-sm font-medium mb-2">Booking Reference No.</label>
                  <InputText
                    id="bookingReference"
                    v-model="bookingReference"
                    :disabled="!!ticketId"
                    placeholder="ZM2025001"
                    :class="[
                      'w-full p-3 rounded-lg border focus:ring-1 focus:ring-purple-500 focus:border-purple-500 focus:outline-none text-gray-800 transition-all duration-200',
                      formErrors.bookingRef ? 'border-red-300 bg-red-50' : 'border-gray-300',
                      !!ticketId ? 'disabled:bg-gray-100 disabled:cursor-not-allowed' : ''
                    ]"
                  />
                  <div v-if="formErrors.bookingRef" class="mt-1 text-red-600 text-sm flex items-center">
                    <Icon name="heroicons:exclamation-circle" class="w-4 h-4 mr-1" />
                    {{ formErrors.bookingRef }}
                  </div>
                </div>
                <div>
                  <label for="ticketId" class="block text-gray-700 text-sm font-medium mb-2">Ticket No.</label>
                  <InputText
                    id="ticketId"
                    v-model="ticketId"
                    :disabled="!!bookingReference"
                    placeholder="Ticket ID"
                    :class="[
                      'w-full p-3 rounded-lg border focus:ring-1 focus:ring-purple-500 focus:border-purple-500 focus:outline-none text-gray-800 transition-all duration-200',
                      formErrors.ticketId ? 'border-red-300 bg-red-50' : 'border-gray-300',
                      !!bookingReference ? 'disabled:bg-gray-100 disabled:cursor-not-allowed' : ''
                    ]"
                  />
                  <div v-if="formErrors.ticketId" class="mt-1 text-red-600 text-sm flex items-center">
                    <Icon name="heroicons:exclamation-circle" class="w-4 h-4 mr-1" />
                    {{ formErrors.ticketId }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Email Tab -->
            <div v-if="activeTab === 'email'" class="space-y-4">
              <div class="w-full">
                <label for="email" class="block text-gray-700 text-sm font-medium mb-2">Email</label>
                <InputText
                  id="email"
                  v-model="email"
                  placeholder="example@email.com"
                  :class="[
                    'w-full p-3 rounded-lg border focus:ring-1 focus:ring-purple-500 focus:border-purple-500 focus:outline-none text-gray-800 transition-all duration-200',
                    formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  ]"
                />
                <div v-if="formErrors.email" class="mt-1 text-red-600 text-sm flex items-center">
                  <Icon name="heroicons:exclamation-circle" class="w-4 h-4 mr-1" />
                  {{ formErrors.email }}
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="bookingReferenceEmail" class="block text-gray-700 text-sm font-medium mb-2">Booking Reference No.</label>
                  <InputText
                    id="bookingReferenceEmail"
                    v-model="bookingReferenceEmail"
                    :disabled="!!ticketIdEmail"
                    placeholder="ZM2025001"
                    :class="[
                      'w-full p-3 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none text-gray-800 transition-all duration-200',
                      formErrors.bookingRef ? 'border-red-300 bg-red-50' : 'border-gray-300',
                      !!ticketIdEmail ? 'disabled:bg-gray-100 disabled:cursor-not-allowed' : ''
                    ]"
                  />
                  <div v-if="formErrors.bookingRef" class="mt-1 text-red-600 text-sm flex items-center">
                    <Icon name="heroicons:exclamation-circle" class="w-4 h-4 mr-1" />
                    {{ formErrors.bookingRef }}
                  </div>
                </div>
                <div>
                  <label for="ticketIdEmail" class="block text-gray-700 text-sm font-medium mb-2">Ticket No.</label>
                  <InputText
                    id="ticketIdEmail"
                    v-model="ticketIdEmail"
                    :disabled="!!bookingReferenceEmail"
                    placeholder="Ticket ID"
                    :class="[
                      'w-full p-3 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none text-gray-800 transition-all duration-200',
                      formErrors.ticketId ? 'border-red-300 bg-red-50' : 'border-gray-300',
                      !!bookingReferenceEmail ? 'disabled:bg-gray-100 disabled:cursor-not-allowed' : ''
                    ]"
                  />
                  <div v-if="formErrors.ticketId" class="mt-1 text-red-600 text-sm flex items-center">
                    <Icon name="heroicons:exclamation-circle" class="w-4 h-4 mr-1" />
                    {{ formErrors.ticketId }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Search Button -->
            <div class="flex justify-end mt-6">
              <Button
                label="Search"
                :disabled="!canSearch"
                class="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white py-3 px-8 rounded-lg hover:from-purple-700 hover:to-fuchsia-700 transition-all duration-200 flex items-center gap-2 text-lg font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                @click="performDetailedSearch(1)"
              >
                <Icon name="heroicons:magnifying-glass" class="w-5 h-5" />
                Search
              </Button>
            </div>
          </div>
        </div>

        <!-- Initial empty state with illustration -->
        <div v-else-if="!searchPerformed && !showSearchForm" key="emptyState" class="flex flex-col items-center justify-center min-h-[500px] space-y-8">
          <!-- Search illustration -->
          <div class="relative">
            <!-- Main magnifying glass circle -->
            <div class="w-32 h-32 border-4 border-gray-300 rounded-full relative">
              <!-- Documents inside the magnifying glass -->
              <div class="absolute top-4 left-4 w-6 h-8 bg-gray-200 rounded-sm"></div>
              <div class="absolute top-6 right-4 w-6 h-6 bg-gray-300 rounded-sm"></div>
              <div class="absolute bottom-4 left-6 w-8 h-6 bg-gray-250 rounded-sm"></div>
              <!-- Small decorative elements -->
              <div class="absolute -top-2 -left-2 w-3 h-3 bg-blue-200 rounded-full"></div>
              <div class="absolute -top-1 right-2 w-2 h-2 bg-purple-200 rounded-full"></div>
              <div class="absolute bottom-2 -right-2 w-2 h-2 bg-gray-300 rounded-full"></div>
            </div>
            <!-- Magnifying glass handle -->
            <div class="absolute -bottom-6 -right-6 w-8 h-8 border-4 border-gray-400 rounded-full bg-gray-300 transform rotate-45"></div>
            <!-- Decorative dots around -->
            <div class="absolute -top-4 left-1/2 w-1 h-1 bg-gray-400 rounded-full"></div>
            <div class="absolute top-1/2 -left-6 w-1 h-1 bg-gray-400 rounded-full"></div>
            <div class="absolute top-1/2 -right-6 w-1 h-1 bg-gray-400 rounded-full"></div>
            <div class="absolute -bottom-8 left-1/4 w-1 h-1 bg-gray-400 rounded-full"></div>
          </div>
          
          <!-- Empty state text -->
          <div class="text-center space-y-2">
            <h3 class="text-xl font-medium text-gray-600">Search for tickets</h3>
            <p class="text-gray-500 text-sm">Enter search criteria above to find tickets</p>
          </div>
        </div>
        
        <!-- Loading state -->
        <div v-else-if="loading" key="loading" class="flex items-center justify-center min-h-[400px]">
          <div class="flex flex-col items-center space-y-4">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <div class="text-xl text-gray-600">Searching tickets...</div>
          </div>
        </div>
        
        <!-- Error state -->
        <div v-else-if="hasSearchError" key="error" class="flex flex-col items-center justify-center min-h-[400px] space-y-6">
          <div class="relative">
            <!-- Error icon -->
            <div class="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
              <Icon name="heroicons:exclamation-triangle" class="w-12 h-12 text-red-500" />
            </div>
          </div>
          
          <div class="text-center space-y-3 max-w-md">
            <h3 class="text-xl font-semibold text-gray-900">No Results Found</h3>
            <p class="text-gray-600">{{ searchError }}</p>
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                label="Search Again"
                class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-all duration-200"
                @click="goBackToSearch"
              />
              <Button
                label="Clear & New Search"
                class="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200"
                outlined
                @click="goBackToSearch"
              />
            </div>
          </div>
        </div>
        
        <!-- Search results -->
        <div v-else key="results" class="mx-auto">
          <!-- Results Summary Bar -->
          <div class="flex justify-between items-center mb-6 rounded-lg p-4 ">
            <div class="flex items-center space-x-6">
              <span class="text-gray-700 font-medium">Total number ({{ totalResults }})</span>
              <span class="text-gray-400">|</span>
              <span class="text-gray-700 font-medium">Assign ({{ searchResults.filter(r => r.isAssigned).length }})</span>
              <span class="text-gray-400">|</span>
              <span class="text-gray-700 font-medium">Unassign ({{ searchResults.filter(r => !r.isAssigned).length }})</span>
              <span class="text-gray-400">|</span>
              <span class="text-gray-700 font-medium">Check-in ({{ searchResults.filter(r => r.status === 'Check-in').length }})</span>
              <span class="text-gray-400">|</span>
              <span class="text-gray-700 font-medium">Page {{ currentPage }} of {{ lastPage }}</span>
            </div>
            <Button
              label="Print Tickets"
              icon="pi pi-print"
              disabled
              class="bg-gray-200 border border-gray-300 text-gray-400 px-4 py-2 rounded-lg cursor-not-allowed opacity-50"
              outlined
              @click="() => {}"
            />
          </div>

         <!-- Ticket Cards -->
<div class="space-y-4">
  <div
    v-for="result in searchResults"
    :key="result.id"
    class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
  >
    <div class="flex flex-col md:flex-row">
      <!-- Left: Event Image and Info -->
      <div class="flex flex-col md:flex-row flex-1">
        <!-- Event Poster -->
        <div class="relative w-full md:w-56 lg:w-64 mt-5 overflow-hidden">
          <img 
            :src="result.image" 
            :alt="result.eventTitle"
            class="w-full object-cover"
          />
          <!-- Status Badge -->
          <div class="absolute top-[0.5rem] left-[0.5rem]">
            <span 
              v-if="result.status === 'Check-in'"
              class="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium"
            >
              ✓ Check-in
            </span>
            <span 
              v-else
              class="bg-gray-400 text-white px-3 py-1 rounded-full text-xs font-medium"
            >
              Not Check-in
            </span>
          </div>
          <!-- Event Title Overlay -->
          <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-white/50 to-[#1D2346]/90 p-3">
            <h3 class="text-white font-semibold text-sm leading-tight truncate">{{ result.eventTitle || '-' }}</h3>
            <p class="text-white text-xs mt-1 truncate">Owner: {{ result.owner || '-' }}</p>
          </div>
        </div>

        <!-- Ticket Details -->
        <div class="flex-1 p-4 md:p-6">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <!-- First Column -->
            <div class="space-y-3">
              <div>
                <span class="text-gray-500 text-xs">Ticket Holder</span>
                <p class="font-semibold text-gray-900 text-sm">{{ result.ticketHolder || '-' }}</p>
              </div>
              <div>
                <span class="text-gray-500 text-xs">Phone Number / Email</span>
                <p class="font-semibold text-gray-900 text-sm truncate">{{ result.phoneNumberOrEmail || '-' }}</p>
              </div>
            </div>

            <!-- Second Column -->
            <div class="space-y-3">
              <div>
                <span class="text-gray-500 text-xs">Booking Ref</span>
                <p class="font-semibold text-gray-900 text-sm">{{ result.bookingRef || '-' }}</p>
              </div>
              <div>
                <span class="text-gray-500 text-xs">Ticket ID</span>
                <p class="font-semibold text-gray-900 text-sm">{{ result.ticketId || '-' }}</p>
              </div>
            </div>

            <!-- Third Column -->
            <div class="space-y-3">
              <div>
                <span class="text-gray-500 text-xs">Ticket Type</span>
                <p class="font-semibold text-gray-900 text-sm">{{ result.ticketType || '-' }}</p>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <span class="text-gray-500 text-xs">Gate</span>
                  <p class="font-semibold text-gray-900 text-sm">{{ result.gate || '-'}}</p>
                </div>
                <div>
                  <span class="text-gray-500 text-xs">Seat Number</span>
                  <p class="font-semibold text-gray-900 text-sm">{{ result.seatNumber || '-' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Row - Event Details -->
          <div class="mt-2 pt-2 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <span class="text-gray-500 text-xs">Location</span>
              <p class="font-semibold text-gray-900 text-sm">{{ result.location || '-' }}</p>
            </div>
            <div>
              <span class="text-gray-500 text-xs">Date</span>
              <p class="font-semibold text-gray-900 text-sm">{{ result.date || '-' }}</p>
            </div>
            <div>
              <span class="text-gray-500 text-xs">Time</span>
              <p class="font-semibold text-gray-900 text-sm">{{ result.time || '-' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: QR Code and Actions -->
      <div class="w-full md:w-44 p-4 border-t md:border-t-0 md:border-l border-gray-100 flex flex-col items-center justify-center space-y-3">
        <div class="text-center">
          <p class="text-gray-700 font-medium mb-2 text-sm">Scan to Enter</p>
          <QRCodeGenerator 
            :value="result.qrCode || result.ticketId || `ticket-${result.id}`"
            :size="90"
            container-class="mx-auto"
            :options="{
              errorCorrectionLevel: 'M',
              margin: 1,
              color: { dark: '#374151', light: '#FFFFFF' }
            }"
          />
        </div>
        
        <!-- Action Button -->
        <Button
          :label="result.isAssigned ? 'Re-assign' : 'Assign Ticket'"
          :class="[
            'w-full py-2 px-3 rounded-full text-xs font-medium transition-all duration-200 flex items-center justify-center gap-2',
            result.isAssigned 
              ? 'bg-gray-500 text-white hover:bg-gray-600' 
              : 'bg-purple-600 text-white hover:bg-purple-700'
          ]"
          @click="openAssignModal(result)"
        >
          <Icon :name="result.isAssigned ? 'heroicons:arrow-path' : 'icon-park-solid:ticket'" class="w-4 h-4" /> 
          {{ result.isAssigned ? 'Re-assign' : 'Assign Ticket' }}
        </Button>
      </div>
    </div>
  </div>
</div>


          <!-- Pagination -->
          <div v-if="lastPage > 1" class="flex justify-center items-center space-x-2 mt-8 mb-4">
            <!-- Previous Button -->
            <Button
              :disabled="currentPage === 1"
              class="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="goToPage(currentPage - 1)"
            >
              <Icon name="heroicons:chevron-left" class="w-4 h-4" />
            </Button>

            <!-- Page Numbers -->
            <template v-for="page in getPaginationRange()" :key="page">
              <Button
                v-if="page !== '...'"
                :class="[
                  'px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200',
                  page === currentPage
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                ]"
                @click="goToPage(page)"
              >
                {{ page }}
              </Button>
              <span v-else class="px-2 py-2 text-gray-500">...</span>
            </template>

            <!-- Next Button -->
            <Button
              :disabled="currentPage === lastPage"
              class="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="goToPage(currentPage + 1)"
            >
              <Icon name="heroicons:chevron-right" class="w-4 h-4" />
            </Button>
          </div>

          <!-- Results Per Page Info -->
          <div v-if="totalResults > 0" class="text-center text-sm text-gray-600 mt-4">
            Showing {{ ((currentPage - 1) * perPage) + 1 }} to {{ Math.min(currentPage * perPage, totalResults) }} of {{ totalResults }} results
          </div>
        </div>
      </Transition>
    </div>

    <!-- Assign Ticket Modal -->
    <div v-if="showAssignModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col modal-transition">
        <!-- Modal Content - Scrollable -->
        <div class="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 modal-body modal-content-spacing">
          <!-- Modal Header -->
          <div>
            <h2 class="text-xl font-bold text-gray-900">
              {{ selectedTicket?.isAssigned ? 'Re-assign Ticket' : 'Assign Ticket' }}
            </h2>
            <p class="text-gray-600 text-sm mt-1">
              {{ selectedTicket?.isAssigned ? 'Update ticket holder information' : 'Complete Ticket Holder\'s Information' }}
            </p>
          </div>

          <!-- General Error Message -->
          <div v-if="assignFormErrors.general" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-start">
              <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <span class="text-red-700 text-sm font-medium">{{ assignFormErrors.general }}</span>
            </div>
          </div>

          <!-- Name Field -->
          <div>
            <label class="block text-gray-700 text-sm font-medium mb-2">Name <span class="text-red-500">*</span></label>
            <InputText
              v-model="assignForm.name"
              placeholder="Enter full name"
              :class="[
                'w-full p-3 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none',
                assignFormErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
              ]"
            />
            <div v-if="assignFormErrors.name" class="mt-1 text-red-600 text-sm flex items-start">
              <Icon name="heroicons:exclamation-circle" class="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
              <span>{{ assignFormErrors.name }}</span>
            </div>
          </div>

          <!-- Phone Number Field -->
          <div>
            <label class="block text-gray-700 text-sm font-medium mb-2">
              Phone Number 
              <span class="text-gray-500 text-xs">(Phone OR Email required)</span>
            </label>
            <div class="flex phone-input-container">
              <div class="flex items-center bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg px-3 min-w-fit phone-prefix">
                <img src="https://flagcdn.com/kh.svg" alt="Cambodia" class="w-5 h-3 mr-2 flex-shrink-0">
                <span class="text-sm font-medium whitespace-nowrap">+855</span>
              </div>
              <InputText
                v-model="localPhoneNumber"
                @input="formatLocalPhoneNumber"
                placeholder="97 6028 424"
                type="tel"
                :class="[
                  'flex-1 p-3 border rounded-r-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none min-w-0 phone-input',
                  assignFormErrors.phone_number ? 'border-red-300 bg-red-50' : 'border-gray-300'
                ]"
              />
            </div>
            <div v-if="assignFormErrors.phone_number" class="mt-1 text-red-600 text-sm flex items-start">
              <Icon name="heroicons:exclamation-circle" class="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
              <span>{{ assignFormErrors.phone_number }}</span>
            </div>
          </div>

          <!-- Email Field -->
          <div>
            <label class="block text-gray-700 text-sm font-medium mb-2">
              Email 
              <span class="text-gray-500 text-xs">(Phone OR Email required)</span>
            </label>
            <InputText
              v-model="assignForm.email"
              placeholder="e.g. info@gmail.com"
              :class="[
                'w-full p-3 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none',
                assignFormErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
              ]"
            />
            <div v-if="assignFormErrors.email" class="mt-1 text-red-600 text-sm flex items-start">
              <Icon name="heroicons:exclamation-circle" class="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
              <span>{{ assignFormErrors.email }}</span>
            </div>
          </div>

          <!-- Identity Document Section (Hidden with opacity) -->
          <div class="opacity-30 pointer-events-none">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Identity Document</h3>
            <p class="text-gray-500 text-sm mb-4">We will need your ID to verify that you are over 18 years old</p>
            
            <label class="block text-gray-700 text-sm font-medium mb-2">ID Card/Passport number</label>
            <InputText
              v-model="assignForm.id_card_no"
              placeholder="e.g. 1100546873"
              disabled
              :class="[
                'w-full p-3 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none bg-gray-100 cursor-not-allowed',
                assignFormErrors.id_card_no ? 'border-red-300 bg-red-50' : 'border-gray-300'
              ]"
            />
            <div v-if="assignFormErrors.id_card_no" class="mt-1 text-red-600 text-sm flex items-start">
              <Icon name="heroicons:exclamation-circle" class="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
              <span>{{ assignFormErrors.id_card_no }}</span>
            </div>
          </div>

          <!-- Upload Identity Section (Hidden with opacity) -->
          <div class="opacity-30 pointer-events-none">
            <label class="block text-gray-700 text-sm font-medium mb-2">Upload Identity</label>
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
              <Icon name="heroicons:photo" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p class="text-gray-400 mb-2">Drop your image here, or <span class="text-gray-400 font-medium">browse</span></p>
              <p class="text-gray-400 text-xs">*Maximum file size: below 10MB</p>
              <p class="text-gray-400 text-xs">*Banner resolution must be 1920 Width x 1440 Height</p>
            </div>
          </div>

          </div>
        
        <!-- Modal Footer - Fixed at bottom -->
        <div class="border-t border-gray-100 p-6 md:p-8 bg-gray-50 rounded-b-xl modal-footer">
          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-3">
            <Button
              label="Cancel"
              class="w-full sm:flex-1 py-3 px-6 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 order-2 sm:order-1"
              @click="closeAssignModal"
            />
            <Button
              :label="selectedTicket?.isAssigned ? 'Update Assignment' : 'Assign Ticket'"
              class="w-full sm:flex-1 py-3 px-6 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-all duration-200 order-1 sm:order-2"
              @click="completeAssignment"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { definePageMeta } from '#imports'
import img from '@/assets/image/poster-manage-booking.png'
import TicketCard from '~/components/common/TicketCard.vue'
import QRCodeGenerator from '~/components/common/QRCodeGenerator.vue'
import Divider from 'primevue/divider'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { 
  formatSingleDate, 
  formatTime, 
  formatEventDateRange,
  isValidDate 
} from '@/utils/dateFormatter'

definePageMeta({
  layout: 'admin',
})

const generalSearchQuery = ref('')
const loading = ref(false)
const searchResults = ref([])
const searchPerformed = ref(false) // New state to control initial view
const showSearchForm = ref(false) // Control search form visibility
const activeTab = ref('phone') // Active tab state

// Pagination states
const currentPage = ref(1)
const perPage = ref(20)
const totalResults = ref(0)
const lastPage = ref(1)

// Error and validation states
const searchError = ref('')
const hasSearchError = ref(false)
const formErrors = ref({
  phone: '',
  email: '',
  bookingRef: '',
  ticketId: '',
  general: ''
})

// Helper function to clear all form errors
const clearErrors = () => {
  formErrors.value = {
    phone: '',
    email: '',
    bookingRef: '',
    ticketId: '',
    general: ''
  }
  searchError.value = ''
  hasSearchError.value = false
}

// Validation functions
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const isValidPhoneNumber = (phone) => {
  // Remove spaces, dashes, and plus signs for validation
  const cleanPhone = phone.replace(/[\s\-\+]/g, '')
  // Check if it's a valid Cambodia phone number (starts with 855 or just the local number)
  const phoneRegex = /^(\+?855)?[1-9]\d{7,8}$/
  return phoneRegex.test(cleanPhone)
}

// Function to format local phone number (without +855) and update assignForm
const formatLocalPhoneNumber = () => {
  // Remove all non-digit characters
  let value = localPhoneNumber.value.replace(/\D/g, '')
  
  // Limit to 9 digits (Cambodia local numbers are typically 8-9 digits)
  if (value.length > 9) {
    value = value.substring(0, 9)
  }
  
  // Format the number with spaces for better readability
  if (value.length >= 6) {
    value = value.replace(/(\d{2})(\d{4})(\d+)/, '$1 $2 $3')
  } else if (value.length >= 2) {
    value = value.replace(/(\d{2})(\d+)/, '$1 $2')
  }
  
  localPhoneNumber.value = value
  
  // Update the phone number in assignForm (ONLY the number, no +855 prefix)
  const cleanValue = value.replace(/\s/g, '') // Remove spaces
  assignForm.value.phone_number = cleanValue // Store only the number without +855
}

// Function to validate local phone numbers (8-9 digits)
const isValidLocalPhoneNumber = (localPhone) => {
  const cleanPhone = localPhone.replace(/\s/g, '') // Remove spaces
  return /^[1-9]\d{7,8}$/.test(cleanPhone) // 8-9 digits starting with 1-9
}

const validateForm = () => {
  clearErrors()
  let isValid = true

  const currentPhone = activeTab.value === 'phone' ? phoneNumber.value.trim() : ''
  const currentEmail = activeTab.value === 'email' ? email.value.trim() : ''
  const currentBookingRef = activeTab.value === 'phone' ? bookingReference.value.trim() : bookingReferenceEmail.value.trim()
  const currentTicketId = activeTab.value === 'phone' ? ticketId.value.trim() : ticketIdEmail.value.trim()

  // Check if at least one field is provided
  if (!currentPhone && !currentEmail && !currentBookingRef && !currentTicketId) {
    formErrors.value.general = 'Please enter at least one search criteria to find tickets.'
    isValid = false
    return isValid
  }

  // Validate phone number if provided
  if (currentPhone && !isValidPhoneNumber(currentPhone)) {
    formErrors.value.phone = 'Please enter a valid Cambodia phone number (e.g., +855 12 345 6789 or 012 345 6789)'
    isValid = false
  }

  // Validate email if provided
  if (currentEmail && !isValidEmail(currentEmail)) {
    formErrors.value.email = 'Please enter a valid email address (e.g., example@email.com)'
    isValid = false
  }

  // Validate booking reference if provided
  if (currentBookingRef && currentBookingRef.length < 3) {
    formErrors.value.bookingRef = 'Booking reference must be at least 3 characters long'
    isValid = false
  }

  // Validate ticket ID if provided
  if (currentTicketId && currentTicketId.length < 3) {
    formErrors.value.ticketId = 'Ticket ID must be at least 3 characters long'
    isValid = false
  }

  return isValid
}

// Modal states
const showAssignModal = ref(false)
const selectedTicket = ref(null)

// Watch for check-in status changes and show toast alerts
watch(searchResults, (newResults, oldResults) => {
  if (!oldResults || oldResults.length === 0) return
  
  // Compare each ticket to detect status changes
  newResults.forEach((newTicket) => {
    const oldTicket = oldResults.find(old => old.id === newTicket.id)
    
    if (oldTicket) {
      // Check if status changed from "Not Check-in" to "Check-in"
      if (oldTicket.status === 'Not Check-in' && newTicket.status === 'Check-in') {
        // Get ticket holder name for personalized message
        const holderName = newTicket.ticketHolder && newTicket.ticketHolder !== '-' 
          ? newTicket.ticketHolder 
          : 'Guest'
        
        // Show success toast alert
        toast.success(`🎉 Check-in successful! Welcome ${holderName}!`, {
          position: toast.POSITION.TOP_RIGHT,
          timeout: 4000,
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        })
        
      }
      
      // Also handle reverse case (check-out) if needed
      else if (oldTicket.status === 'Check-in' && newTicket.status === 'Not Check-in') {
        const holderName = newTicket.ticketHolder && newTicket.ticketHolder !== '-' 
          ? newTicket.ticketHolder 
          : 'Guest'
        
        toast.info(`ℹ️ ${holderName} has been checked out`, {
          position: toast.POSITION.TOP_RIGHT,
          timeout: 3000
        })
        
      }
    }
  })
}, { deep: true })

// Polling function to refresh ticket status periodically
const pollTicketStatus = async () => {
  if (!searchPerformed.value || loading.value || searchResults.value.length === 0) {
    return
  }
  
  try {
    // Re-run the search quietly to get updated statuses
    const { searchCheckIns } = await import('@/composables/api')
    
    // Get current search parameters
    const currentPhone = activeTab.value === 'phone' ? phoneNumber.value.trim() : ''
    const currentEmail = activeTab.value === 'email' ? email.value.trim() : ''
    const currentBookingRef = activeTab.value === 'phone' ? bookingReference.value.trim() : bookingReferenceEmail.value.trim()
    const currentTicketId = activeTab.value === 'phone' ? ticketId.value.trim() : ticketIdEmail.value.trim()
    
    if (!currentPhone && !currentEmail && !currentBookingRef && !currentTicketId) {
      return // No search criteria to poll with
    }
    
    const searchParams = {}
    if (currentPhone) searchParams.phone_number = currentPhone
    if (currentEmail) searchParams.email = currentEmail
    if (currentTicketId) searchParams.ticket_no = currentTicketId
    if (currentBookingRef) searchParams.order_number = currentBookingRef
    
    const response = await searchCheckIns(searchParams, currentPage.value, perPage.value)
    
    if (response.success && response.data) {
      // Store old results for comparison
      const oldResults = [...searchResults.value]
      
      // Update search results with new data (this will trigger the watcher)
      searchResults.value = response.data.map(ticket => ({
        id: ticket.id,
        assignmentId: ticket.id,
        status: ticket.attendance?.checked_in ? 'Check-in' : 'Not Check-in',
        isAssigned: ticket.is_assigned || !!(ticket.name || ticket.email || ticket.phone_number),
        image: ticket.event?.cover_image_url || img,
        eventTitle: ticket.event?.name || '-',
        owner: ticket.event?.company || '-',
        ticketHolder: ticket.name || '-',
        bookingRef: ticket.order?.order_number || '-',
        phoneNumberOrEmail: ticket.phone_number 
          ? (ticket.phone_number.startsWith('+855') ? ticket.phone_number : `+855${ticket.phone_number}`)
          : (ticket.email || '-'),
        ticketId: ticket.ticket_no || '-',
        location: ticket.event?.location || '-',
        ticketType: ticket.ticket_type?.name || '-',
        date: ticket.event?.start_date && ticket.event?.end_date 
          ? formatEventDateRange(ticket.event.start_date, ticket.event.end_date)
          : ticket.event?.start_date 
            ? formatSingleDate(ticket.event.start_date)
            : '-',
        gate: ticket.gate || '-',
        time: ticket.event?.start_date ? formatTime(ticket.event.start_date) : '-',
        seatNumber: ticket.seat_number || '-',
        price: ticket.ticket_type?.price || '-',
        qrCode: ticket.qr_code || '-',
        checkedInTime: ticket.attendance?.time || '-',
        idCardNo: ticket.id_card_no || '-',
        passportNo: ticket.passport_no || '-',
      }))
    }
  } catch (error) {
    // Silently handle polling errors to avoid disrupting user experience
    console.warn('⚠️ Status polling failed:', error.message)
  }
}

// Set up polling interval when component mounts
let pollingInterval = null

onMounted(() => {
  // Start polling every 3 seconds when search results are displayed
  pollingInterval = setInterval(pollTicketStatus, 3000)
})

onUnmounted(() => {
  // Clean up polling when component unmounts
  if (pollingInterval) {
    clearInterval(pollingInterval)
  }
})

// Form fields
const phoneNumber = ref('')
const email = ref('')
const bookingReference = ref('')
const ticketId = ref('')
const bookingReferenceEmail = ref('')
const ticketIdEmail = ref('')

// Watch for mutual exclusivity between booking reference and ticket ID
watch(bookingReference, (newValue) => {
  if (newValue) {
    ticketId.value = ''
    clearErrors() // Clear errors when user starts typing
  }
})

watch(ticketId, (newValue) => {
  if (newValue) {
    bookingReference.value = ''
    clearErrors() // Clear errors when user starts typing
  }
})

watch(bookingReferenceEmail, (newValue) => {
  if (newValue) {
    ticketIdEmail.value = ''
    clearErrors() // Clear errors when user starts typing
  }
})

watch(ticketIdEmail, (newValue) => {
  if (newValue) {
    bookingReferenceEmail.value = ''
    clearErrors() // Clear errors when user starts typing
  }
})

// Clear errors when user switches tabs
watch(activeTab, () => {
  clearErrors()
})

// Clear errors when user types in input fields
watch(phoneNumber, () => {
  if (formErrors.value.phone) {
    formErrors.value.phone = ''
    formErrors.value.general = ''
  }
})

watch(email, () => {
  if (formErrors.value.email) {
    formErrors.value.email = ''
    formErrors.value.general = ''
  }
})

// Assign form fields
const assignForm = ref({
  name: '',
  phone_number: '',
  email: '',
  id_card_no: ''
})

// Local phone number for display (without +855 prefix)
const localPhoneNumber = ref('')

const assignFormErrors = ref({
  name: '',
  phone_number: '',
  email: '',
  id_card_no: '',
  general: ''
})

const validateAssignForm = () => {
  assignFormErrors.value = {
    name: '',
    phone_number: '',
    email: '',
    id_card_no: '',
    general: ''
  }
  
  let isValid = true

  // Name validation
  if (!assignForm.value.name.trim()) {
    assignFormErrors.value.name = 'Name is required'
    isValid = false
  } else if (assignForm.value.name.trim().length < 2) {
    assignFormErrors.value.name = 'Name must be at least 2 characters long'
    isValid = false
  }

  // Phone OR Email validation (at least one is required)
  const hasPhone = localPhoneNumber.value.trim() // Use local phone number
  const hasEmail = assignForm.value.email.trim()
  
  if (!hasPhone && !hasEmail) {
    assignFormErrors.value.general = 'Please provide either a phone number or email address'
    isValid = false
  }

  // Phone number validation (if provided) - validate local number
  if (hasPhone && !isValidLocalPhoneNumber(localPhoneNumber.value)) {
    assignFormErrors.value.phone_number = 'Please enter a valid phone number (8-9 digits, e.g., 97 6028 424)'
    isValid = false
  }

  // Email validation (if provided and no phone, or if phone is invalid)
  if (hasEmail && !isValidEmail(assignForm.value.email)) {
    assignFormErrors.value.email = 'Please enter a valid email address'
    isValid = false
  }

  // ID number validation (optional for now)
  // if (!assignForm.value.id_card_no.trim()) {
  //   assignFormErrors.value.id_card_no = 'ID card/passport number is required'
  //   isValid = false
  // } else if (assignForm.value.id_card_no.trim().length < 5) {
  //   assignFormErrors.value.id_card_no = 'ID number must be at least 5 characters long'
  //   isValid = false
  // }

  return isValid
}

// Computed property to check if search is allowed
const canSearch = computed(() => {
  const currentPhone = activeTab.value === 'phone' ? phoneNumber.value : ''
  const currentEmail = activeTab.value === 'email' ? email.value : ''
  const currentBookingRef = activeTab.value === 'phone' ? bookingReference.value : bookingReferenceEmail.value
  const currentTicketId = activeTab.value === 'phone' ? ticketId.value : ticketIdEmail.value
  
  return !!(currentPhone || currentEmail || currentBookingRef || currentTicketId)
})

const performGeneralSearch = () => {
  // Clear any previous errors
  clearErrors()
  // Show the search form when search button is clicked
  showSearchForm.value = true
  searchPerformed.value = false
  // Reset pagination and errors
  currentPage.value = 1
  hasSearchError.value = false
  searchError.value = ''
}

const performDetailedSearch = async (page = 1) => {
  // Validate form first
  if (!validateForm()) {
    return // Stop execution if validation fails
  }

  loading.value = true
  searchPerformed.value = true
  showSearchForm.value = false
  hasSearchError.value = false
  searchError.value = ''
  
  try {
    // Get current tab's form values
    const currentPhone = activeTab.value === 'phone' ? phoneNumber.value.trim() : ''
    const currentEmail = activeTab.value === 'email' ? email.value.trim() : ''
    const currentBookingRef = activeTab.value === 'phone' ? bookingReference.value.trim() : bookingReferenceEmail.value.trim()
    const currentTicketId = activeTab.value === 'phone' ? ticketId.value.trim() : ticketIdEmail.value.trim()
    
    // Build search parameters object
    const searchParams = {}
    
    if (currentPhone) searchParams.phone_number = currentPhone
    if (currentEmail) searchParams.email = currentEmail
    if (currentTicketId) searchParams.ticket_no = currentTicketId
    if (currentBookingRef) searchParams.order_number = currentBookingRef
    
    
    // Use the API function from composables with pagination
    const { searchCheckIns } = await import('@/composables/api')
    const response = await searchCheckIns(searchParams, page, perPage.value)
    
    
    if (response.success && response.data) {
      // Update pagination state
      currentPage.value = response.meta.current_page
      totalResults.value = response.meta.total
      lastPage.value = response.meta.last_page
      
      // Transform API response to match UI format
      searchResults.value = response.data.map(ticket => ({
        id: ticket.id,
        assignmentId: ticket.id, // This will be used for the API call
        status: ticket.attendance?.checked_in ? 'Check-in' : 'Not Check-in',
        isAssigned: ticket.is_assigned || !!(ticket.name || ticket.email || ticket.phone_number),
        image: ticket.event?.cover_image_url || img, // Use event image if available, fallback to default
        eventTitle: ticket.event?.name || '-',
        owner: ticket.event?.company|| '-',
        ticketHolder: ticket.name || '-',
        bookingRef: ticket.order?.order_number || '-',
        phoneNumberOrEmail: ticket.phone_number 
          ? (ticket.phone_number.startsWith('+855') ? ticket.phone_number : `+855${ticket.phone_number}`)
          : (ticket.email || '-'),
        ticketId: ticket.ticket_no || '-',
        location: ticket.event?.location || '-',
        ticketType: ticket.ticket_type?.name || '-',
        date: ticket.event?.start_date && ticket.event?.end_date 
          ? formatEventDateRange(ticket.event.start_date, ticket.event.end_date)
          : ticket.event?.start_date 
            ? formatSingleDate(ticket.event.start_date)
            : '-',
        gate: ticket.gate || '-',
        time: ticket.event?.start_date ? formatTime(ticket.event.start_date) : '-',
        seatNumber: ticket.seat_number || '-',
        price: ticket.ticket_type?.price || '-',
        qrCode: ticket.qr_code || '-',
        checkedInTime: ticket.attendance?.time || '-',
        idCardNo: ticket.id_card_no || '-',
        passportNo: ticket.passport_no || '-',
      }))
      
      
      // Show message if no results found but search was successful
      if (searchResults.value.length === 0) {
        hasSearchError.value = true
        searchError.value = 'No tickets found matching your search criteria. Please check your search terms and try again.'
        toast.info('No tickets found matching your search criteria', {
          position: toast.POSITION.TOP_RIGHT,
          timeout: 3000
        })
      } else {
        // Show success toast for found results
        toast.success(`Found ${totalResults.value} ticket${totalResults.value === 1 ? '' : 's'}`, {
          position: toast.POSITION.TOP_RIGHT,
          timeout: 2000
        })
      }
    } else {
      searchResults.value = []
      totalResults.value = 0
      hasSearchError.value = true
      searchError.value = response.message || 'No tickets found matching your search criteria. Please verify your search information and try again.'
      console.warn('⚠️ No data found in API response:', response.message)
      
      toast.warning('No tickets found. Please check your search criteria.', {
        position: toast.POSITION.TOP_RIGHT,
        timeout: 3000
      })
    }
    
  } catch (error) {
    console.error('❌ Search failed:', error)
    
    hasSearchError.value = true
    searchError.value = 'Unable to search tickets at the moment. Please check your internet connection and try again.'
    searchResults.value = []
    totalResults.value = 0
    
    console.log('❌ Search error displayed to user:', searchError.value)
    
    toast.error('Search failed. Please check your connection and try again.', {
      position: toast.POSITION.TOP_RIGHT,
      timeout: 4000
    })
  }
  
  loading.value = false
}

// Function to handle pagination
const goToPage = (page) => {
  if (page >= 1 && page <= lastPage.value && page !== currentPage.value) {
    performDetailedSearch(page)
  }
}

// Function to calculate pagination range for display
const getPaginationRange = () => {
  const delta = 2 // Number of pages to show on each side of current page
  const range = []
  const rangeWithDots = []

  for (let i = Math.max(2, currentPage.value - delta); i <= Math.min(lastPage.value - 1, currentPage.value + delta); i++) {
    range.push(i)
  }

  if (currentPage.value - delta > 2) {
    rangeWithDots.push(1, '...')
  } else {
    rangeWithDots.push(1)
  }

  rangeWithDots.push(...range)

  if (currentPage.value + delta < lastPage.value - 1) {
    rangeWithDots.push('...', lastPage.value)
  } else {
    rangeWithDots.push(lastPage.value)
  }

  // Remove duplicates and handle edge cases
  return rangeWithDots.filter((item, index, arr) => {
    if (item === '...') return true
    if (typeof item === 'number') {
      return item <= lastPage.value && arr.indexOf(item) === index
    }
    return true
  })
}

const openAssignModal = (ticket) => {
  selectedTicket.value = ticket
  showAssignModal.value = true
  
  // Pre-fill form with existing data if re-assigning
  if (ticket.isAssigned) {
    assignForm.value = {
      name: ticket.ticketHolder || '',
      phone_number: '', // Will be set by formatLocalPhoneNumber
      email: ticket.phoneNumberOrEmail && ticket.phoneNumberOrEmail.includes('@') ? ticket.phoneNumberOrEmail : '',
      id_card_no: ticket.idCardNo !== '-' ? ticket.idCardNo : ''
    }
    
    // Extract local phone number if it's a phone number
    if (ticket.phoneNumberOrEmail && !ticket.phoneNumberOrEmail.includes('@')) {
      // It's a phone number (not email)
      let localNumber = ticket.phoneNumberOrEmail
      
      // Remove +855 prefix if it exists
      if (localNumber.startsWith('+855')) {
        localNumber = localNumber.replace('+855', '').trim()
      }
      
      // Format the local number for display
      if (localNumber.length >= 6) {
        localPhoneNumber.value = localNumber.replace(/(\d{2})(\d{4})(\d+)/, '$1 $2 $3')
      } else if (localNumber.length >= 2) {
        localPhoneNumber.value = localNumber.replace(/(\d{2})(\d+)/, '$1 $2')
      } else {
        localPhoneNumber.value = localNumber
      }
      // Update the assignForm phone number (without +855)
      formatLocalPhoneNumber()
    } else {
      localPhoneNumber.value = ''
    }
  } else {
    // Reset form for new assignment
    assignForm.value = {
      name: '',
      phone_number: '',
      email: '',
      id_card_no: ''
    }
    localPhoneNumber.value = ''
  }
  
  // Reset errors
  assignFormErrors.value = {
    name: '',
    phone_number: '',
    email: '',
    id_card_no: '',
    general: ''
  }
}

const closeAssignModal = () => {
  showAssignModal.value = false
  selectedTicket.value = null
  localPhoneNumber.value = '' // Reset local phone number
}

const completeAssignment = async () => {
  if (!validateAssignForm()) {
    return // Stop if validation fails
  }

  if (!selectedTicket.value) {
    console.error('No ticket selected for assignment')
    toast.error('No ticket selected for assignment')
    return
  }

  try {
    // Show loading state (you can add a loading indicator here)
    const isReassignment = selectedTicket.value.isAssigned
    
    // Import and call the API function
    const { assignTicket } = await import('@/composables/api')
    
    // Implement phone priority logic: if both phone and email are provided, prioritize phone
    const hasPhone = localPhoneNumber.value.trim() // Use local phone number for checking
    const hasEmail = assignForm.value.email.trim()
    
    let contactMethod = ''
    if (hasPhone) {
      // For display, show with +855 prefix
      contactMethod = `+855${assignForm.value.phone_number}`
    } else if (hasEmail) {
      contactMethod = assignForm.value.email.trim()
    }
    
    // Prepare form data with priority logic
    const formData = {
      name: assignForm.value.name.trim()
    }
    
    // Add contact information based on priority (phone first)
    if (hasPhone) {
      // Send only the number without +855 to server
      formData.phone_number = assignForm.value.phone_number // This contains only the number
      // Also include email if provided, but phone takes priority for display
      if (hasEmail) {
        formData.email = assignForm.value.email.trim()
      }
    } else if (hasEmail) {
      formData.email = assignForm.value.email.trim()
    }
    
    // Only include id_card_no if it's provided
    if (assignForm.value.id_card_no && assignForm.value.id_card_no.trim()) {
      formData.id_card_no = assignForm.value.id_card_no.trim()
    }
    
    
    const response = await assignTicket(selectedTicket.value.assignmentId, formData)

    if (response.success) {
      // Update the ticket in the search results
      selectedTicket.value.ticketHolder = assignForm.value.name.trim()
      // Prioritize phone for display, fallback to email
      selectedTicket.value.phoneNumberOrEmail = contactMethod
      selectedTicket.value.idCardNo = assignForm.value.id_card_no.trim() || '-'
      selectedTicket.value.isAssigned = true

      
      closeAssignModal()
      
      // Show success toast
      const action = isReassignment ? 'reassigned' : 'assigned'
      toast.success(`Ticket ${action} successfully to ${assignForm.value.name}!`, {
        position: toast.POSITION.TOP_RIGHT,
        timeout: 3000
      })
      
    } else {
      throw new Error(response.message || 'Assignment failed')
    }
    
  } catch (error) {
    console.error('❌ Failed to assign ticket:', error)
    
    // Set a general error that will be displayed in the modal
    assignFormErrors.value.general = error.message || 'Failed to assign ticket. Please try again.'
    
    // Show error toast
    toast.error(error.message || 'Failed to assign ticket. Please try again.', {
      position: toast.POSITION.TOP_RIGHT,
      timeout: 5000
    })
  }
}

const navigateToPrintTickets = () => {
  navigateTo('/admin/print-tickets')
}

const goBackToSearch = () => {
  // Reset all states to initial
  showSearchForm.value = true
  searchPerformed.value = false
  hasSearchError.value = false
  searchError.value = ''
  searchResults.value = []
  totalResults.value = 0
  currentPage.value = 1
  
  // Clear form fields
  phoneNumber.value = ''
  email.value = ''
  bookingReference.value = ''
  ticketId.value = ''
  bookingReferenceEmail.value = ''
  ticketIdEmail.value = ''
  
  // Clear any form errors
  clearErrors()
}

const assignTicket = (ticket) => {
  // Toggle ticket status
  if (ticket.status === 'Check-in') {
    ticket.status = 'Not Check-in'
  } else {
    ticket.status = 'Check-in'
  }
}

// The assignTicket function is now part of TicketDetailsCard.vue,
// but if you need to call it from the parent, you'd emit an event from the child.
// For now, I've kept the console.log in the child component.
</script>

<style scoped>
/* Custom animations (retained from your original code) */
:deep(.p-button) {
  border: none !important;
  box-shadow: none !important;
}

/* Smooth slide and fade transitions */
.slide-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-fade-enter-from {
  transform: translateY(-20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

/* Fade transition for existing elements */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Modal responsive adjustments */
@media (max-width: 640px) {
  .modal-content {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }
}

/* Ensure phone input doesn't break on small screens */
@media (max-width: 480px) {
  .phone-input-container {
    flex-direction: column;
  }
  
  .phone-prefix {
    border-radius: 0.5rem 0.5rem 0 0 !important;
    border-right: 1px solid #d1d5db !important;
  }
  
  .phone-input {
    border-radius: 0 0 0.5rem 0.5rem !important;
    border-top: none !important;
  }
}

/* Modal scrolling behavior */
.modal-body {
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f9fafb;
}

.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f9fafb;
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Ensure modal footer stays at bottom */
.modal-footer {
  flex-shrink: 0;
}

/* Better spacing for modal content */
.modal-content-spacing > * + * {
  margin-top: 1.5rem;
}

/* Smooth transitions for modal elements */
.modal-transition {
  transition: all 0.2s ease-in-out;
}

/* Ensure buttons remain accessible on small screens */
@media (max-height: 600px) {
  .modal-body {
    max-height: calc(60vh - 120px);
  }
}

@media (max-height: 500px) {
  .modal-body {
    max-height: calc(50vh - 100px);
  }
}
</style>