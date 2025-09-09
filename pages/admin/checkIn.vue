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
          <div class="flex-1 p-5 bg-[#F8F8FF] text-lg border-none rounded-l-xl text-gray-400 cursor-default select-none text-left">
            Search identity tickets
          </div>
          <Button
            v-if="!showSearchForm"
            label="Search"
            class="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white py-3 px-6 rounded-r-xl hover:from-purple-700 hover:to-fuchsia-700 transition-all duration-200 flex items-center gap-2 text-lg font-semibold shadow-md"
            @click="performGeneralSearch"
          >
            <Icon name="heroicons:magnifying-glass" class="w-5 h-5" />
            Search
          </Button>
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
                    'w-full p-3 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none text-gray-800 transition-all duration-200',
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
                  <label for="bookingReference" class="block text-gray-700 text-sm font-medium mb-2">Booking reference</label>
                  <InputText
                    id="bookingReference"
                    v-model="bookingReference"
                    :disabled="!!ticketId"
                    placeholder="ZM2025001"
                    :class="[
                      'w-full p-3 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none text-gray-800 transition-all duration-200',
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
                  <label for="ticketId" class="block text-gray-700 text-sm font-medium mb-2">Ticket ID</label>
                  <InputText
                    id="ticketId"
                    v-model="ticketId"
                    :disabled="!!bookingReference"
                    placeholder="Ticket ID"
                    :class="[
                      'w-full p-3 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none text-gray-800 transition-all duration-200',
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
                    'w-full p-3 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none text-gray-800 transition-all duration-200',
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
                  <label for="bookingReferenceEmail" class="block text-gray-700 text-sm font-medium mb-2">Booking reference</label>
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
                  <label for="ticketIdEmail" class="block text-gray-700 text-sm font-medium mb-2">Ticket ID</label>
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
              class="bg-white border border-purple-500 text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg transition-all duration-200"
              outlined
              @click="navigateToPrintTickets"
            />
          </div>

          <!-- Ticket Cards -->
          <div class="space-y-4">
            <div
              v-for="result in searchResults"
              :key="result.id"
              class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div class="flex">
                <!-- Left: Event Image and Info -->
                <div class="flex-1 flex">
                  <!-- Event Poster -->
                  <div class="relative overflow-hidden">
                    <img 
                      :src="result.image" 
                      :alt="result.eventTitle"
                      class="w-full h-full object-cover"
                    />
                    <!-- Status Badge -->
                    <div class="absolute top-3 left-3">
                      <span 
                        v-if="result.status === 'Check-in'"
                        class="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium"
                      >
                        ✓ Check-in
                      </span>
                      <span 
                        v-else
                        class="bg-gray-400 text-white px-3 py-1 rounded-full text-sm font-medium"
                      >
                        Not Check-in
                      </span>
                    </div>
                    <!-- Event Title Overlay -->
                    <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-white/50 to-[#1D2346] p-4">
                      <h3 class="text-white font-semibold text-sm leading-tight">{{ result.eventTitle || '-' }}</h3>
                      <p class="text-white/80 text-xs mt-1">Owner: {{ result.owner || '-' }}</p>
                      <p class="text-white/70 text-xs">{{ result.date || '-' }}</p>
                    </div>
                  </div>

                  <!-- Ticket Details -->
                  <div class="flex-1 p-6">
                    <div class="grid grid-cols-3 gap-8">
                      <!-- First Column -->
                      <div class="space-y-4">
                        <div>
                          <span class="text-gray-500 text-sm">Ticket Holder</span>
                          <p class="font-semibold text-gray-900">{{ result.ticketHolder || '-' }}</p>
                        </div>
                        <div>
                          <span class="text-gray-500 text-sm">Phone Number or Email</span>
                          <p class="font-semibold text-gray-900">{{ result.phoneNumberOrEmail || '-' }}</p>
                        </div>
                      </div>

                      <!-- Second Column -->
                      <div class="space-y-4">
                        <div>
                          <span class="text-gray-500 text-sm">Booking Ref</span>
                          <p class="font-semibold text-gray-900">{{ result.bookingRef || '-' }}</p>
                        </div>
                        <div>
                          <span class="text-gray-500 text-sm">Ticket ID</span>
                          <p class="font-semibold text-gray-900">{{ result.ticketId || '-' }}</p>
                        </div>
                      </div>

                      <!-- Third Column -->
                      <div class="space-y-4">
                        <div>
                          <span class="text-gray-500 text-sm">Ticket Type</span>
                          <p class="font-semibold text-gray-900">{{ result.ticketType || '-' }}</p>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                          <div>
                            <span class="text-gray-500 text-sm">Gate</span>
                            <p class="font-semibold text-gray-900">{{ result.gate || '-'}}</p>
                          </div>
                          <div>
                            <span class="text-gray-500 text-sm">Seat Number</span>
                            <p class="font-semibold text-gray-900 text-xs">{{ result.seatNumber || '-' }}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Bottom Row - Event Details -->
                    <div class="mt-6 pt-4 border-t border-gray-100">
                       <div>
                        <span class="text-gray-500 text-sm">Location</span>
                        <p class="font-semibold text-gray-900">{{ result.location || '-' }}</p>
                      </div>
                      <div class="grid grid-cols-3 gap-6">
                        <div>
                        <span class="text-gray-500 text-sm">Date</span>
                        <p class="font-semibold text-gray-900">{{ result.date || '-' }}</p>
                      </div>
                      <div>
                        <span class="text-gray-500 text-sm">Time</span>
                        <p class="font-semibold text-gray-900">{{ result.time || '-' }}</p>
                      </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Right: QR Code and Actions -->
                <div class="w-48 p-6 border-l border-gray-100 flex flex-col items-center justify-center space-y-4">
                  <div class="text-center">
                    <p class="text-gray-700 font-medium mb-3">Scan to Enter</p>
                    <!-- QR Code Generator -->
                    <QRCodeGenerator 
                      :value="result.qrCode || result.ticketId || `ticket-${result.id}`"
                      :size="96"
                      container-class="mx-auto"
                      :options="{
                        errorCorrectionLevel: 'M',
                        margin: 1,
                        color: {
                          dark: '#374151',
                          light: '#FFFFFF'
                        }
                      }"
                    />
                  </div>
                  
                  <!-- Action Button -->
                                    <!-- Action Button -->
                  <Button
                    :label="result.isAssigned ? 'Assigned' : 'Assign Ticket'"
                    :disabled="result.isAssigned"
                    :class="[
                      'w-full py-2 px-3 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2',
                      result.isAssigned 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    ]"
                    @click="openAssignModal(result)"
                  >
                    <Icon :name="result.isAssigned ? 'icon-park-solid:ticket' : 'icon-park-solid:ticket'" class="w-4 h-4" /> 
                    {{ result.isAssigned ? 'Assigned' : 'Assign Ticket' }}
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
    <div v-if="showAssignModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-8 max-w-[45rem] w-full mx-4 shadow-2xl">
        <div class="space-y-6">
          <!-- Modal Header -->
          <div>
            <h2 class="text-xl font-bold text-gray-900">Assign Ticket</h2>
            <p class="text-gray-600 text-sm mt-1">Complete Ticket Holder's Information</p>
          </div>

          <!-- General Error Message -->
          <div v-if="assignFormErrors.general" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-center">
              <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 text-red-500 mr-2" />
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
            <div v-if="assignFormErrors.name" class="mt-1 text-red-600 text-sm flex items-center">
              <Icon name="heroicons:exclamation-circle" class="w-4 h-4 mr-1" />
              {{ assignFormErrors.name }}
            </div>
          </div>

          <!-- Phone Number Field -->
          <div>
            <label class="block text-gray-700 text-sm font-medium mb-2">Phone Number <span class="text-red-500">*</span></label>
            <div class="flex">
              <div class="flex items-center bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg px-3">
                <img src="https://flagcdn.com/kh.svg" alt="Cambodia" class="w-5 h-3 mr-2">
                <span class="text-sm font-medium">+855</span>
              </div>
              <InputText
                v-model="assignForm.phone_number"
                placeholder="97 6028 424"
                :class="[
                  'flex-1 p-3 border rounded-r-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none',
                  assignFormErrors.phone_number ? 'border-red-300 bg-red-50' : 'border-gray-300'
                ]"
              />
            </div>
            <div v-if="assignFormErrors.phone_number" class="mt-1 text-red-600 text-sm flex items-center">
              <Icon name="heroicons:exclamation-circle" class="w-4 h-4 mr-1" />
              {{ assignFormErrors.phone_number }}
            </div>
          </div>

          <!-- Email Field -->
          <div>
            <label class="block text-gray-700 text-sm font-medium mb-2">Email (optional)</label>
            <InputText
              v-model="assignForm.email"
              placeholder="e.g. info@gmail.com"
              :class="[
                'w-full p-3 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none',
                assignFormErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
              ]"
            />
            <div v-if="assignFormErrors.email" class="mt-1 text-red-600 text-sm flex items-center">
              <Icon name="heroicons:exclamation-circle" class="w-4 h-4 mr-1" />
              {{ assignFormErrors.email }}
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
            <div v-if="assignFormErrors.id_card_no" class="mt-1 text-red-600 text-sm flex items-center">
              <Icon name="heroicons:exclamation-circle" class="w-4 h-4 mr-1" />
              {{ assignFormErrors.id_card_no }}
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

          <!-- Action Buttons -->
          <div class="flex gap-3 pt-4">
            <Button
              label="Cancel"
              class="flex-1 py-3 px-6 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
              @click="closeAssignModal"
            />
            <Button
              label="Assign Ticket"
              class="flex-1 py-3 px-6 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-all duration-200"
              @click="completeAssignment"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { definePageMeta } from '#imports'
import img from '@/assets/image/poster-manage-booking.png'
import TicketCard from '~/components/common/TicketCard.vue'
import QRCodeGenerator from '~/components/common/QRCodeGenerator.vue'
import Divider from 'primevue/divider'
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

  // Phone number validation
  if (!assignForm.value.phone_number.trim()) {
    assignFormErrors.value.phone_number = 'Phone number is required'
    isValid = false
  } else if (!isValidPhoneNumber(assignForm.value.phone_number)) {
    assignFormErrors.value.phone_number = 'Please enter a valid phone number'
    isValid = false
  }

  // Email validation (optional but if provided must be valid)
  if (assignForm.value.email.trim() && !isValidEmail(assignForm.value.email)) {
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
    
    console.log('🔍 Search parameters:', searchParams)
    console.log('📄 Searching page:', page)
    
    // Use the API function from composables with pagination
    const { searchCheckIns } = await import('@/composables/api')
    const response = await searchCheckIns(searchParams, page, perPage.value)
    
    console.log('✅ API Response:', response)
    
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
        image: ticket.event?.image || img, // Use event image if available, fallback to default
        eventTitle: ticket.event?.name || '-',
        owner: ticket.order?.customer?.name || '-',
        ticketHolder: ticket.name || ticket.order?.customer?.name || '-',
        bookingRef: ticket.order?.order_number || '-',
        phoneNumberOrEmail: ticket.phone_number || ticket.email || ticket.order?.customer?.email || ticket.order?.customer?.phone || '-',
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
      
      console.log('✅ Transformed results:', searchResults.value)
      
      // Show message if no results found but search was successful
      if (searchResults.value.length === 0) {
        hasSearchError.value = true
        searchError.value = 'No tickets found matching your search criteria. Please check your search terms and try again.'
      }
    } else {
      searchResults.value = []
      totalResults.value = 0
      hasSearchError.value = true
      searchError.value = response.message || 'No tickets found matching your search criteria. Please verify your search information and try again.'
      console.warn('⚠️ No data found in API response:', response.message)
    }
    
  } catch (error) {
    console.error('❌ Search failed:', error)
    
    hasSearchError.value = true
    searchError.value = 'Unable to search tickets at the moment. Please check your internet connection and try again.'
    searchResults.value = []
    totalResults.value = 0
    
    console.log('❌ Search error displayed to user:', searchError.value)
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
  // Reset form and errors
  assignForm.value = {
    name: '',
    phone_number: '',
    email: '',
    id_card_no: ''
  }
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
}

const completeAssignment = async () => {
  if (!validateAssignForm()) {
    return // Stop if validation fails
  }

  if (!selectedTicket.value) {
    console.error('No ticket selected for assignment')
    return
  }

  try {
    // Show loading state (you can add a loading indicator here)
    console.log('🎫 Starting ticket assignment for:', selectedTicket.value.assignmentId)
    
    // Import and call the API function
    const { assignTicket } = await import('@/composables/api')
    
    // Prepare form data (only include id_card_no if it has a value)
    const formData = {
      name: assignForm.value.name,
      phone_number: assignForm.value.phone_number,
      email: assignForm.value.email
    }
    
    // Only include id_card_no if it's provided
    if (assignForm.value.id_card_no && assignForm.value.id_card_no.trim()) {
      formData.id_card_no = assignForm.value.id_card_no
    }
    
    const response = await assignTicket(selectedTicket.value.assignmentId, formData)

    if (response.success) {
      // Update the ticket in the search results
      selectedTicket.value.ticketHolder = assignForm.value.name
      selectedTicket.value.phoneNumberOrEmail = assignForm.value.phone_number
      selectedTicket.value.email = assignForm.value.email
      selectedTicket.value.idCardNo = assignForm.value.id_card_no
      selectedTicket.value.isAssigned = true
      
      console.log('✅ Ticket assigned successfully:', {
        ticket: selectedTicket.value.bookingRef,
        holder: assignForm.value.name,
        phone: assignForm.value.phone_number,
        email: assignForm.value.email,
        idNumber: assignForm.value.id_card_no
      })
      
      closeAssignModal()
      
      // You can show a success toast notification here if you have one
      // toast.success('Ticket assigned successfully!')
      
    } else {
      throw new Error(response.message || 'Assignment failed')
    }
    
  } catch (error) {
    console.error('❌ Failed to assign ticket:', error)
    
    // Set a general error that will be displayed in the modal
    assignFormErrors.value.general = error.message || 'Failed to assign ticket. Please try again.'
    
    // You can show an error toast notification here if you have one
    // toast.error(error.message || 'Failed to assign ticket')
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
    console.log('Ticket unassigned:', ticket.bookingRef)
  } else {
    ticket.status = 'Check-in'
    console.log('Ticket assigned:', ticket.bookingRef)
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
</style>