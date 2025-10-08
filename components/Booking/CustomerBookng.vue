<template>
  <div class="">
    <!-- Main Content Area -->
    <div class="w-full">
      <!-- Customer Information -->
      <div class="bg-white rounded-2xl p-6 mb-8">
        <!-- Error Message -->
        <div v-if="bookingError" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div class="flex items-center">
            <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 text-red-600 mr-3" />
            <div>
              <h3 class="text-red-800 font-medium">Error</h3>
              <p class="text-red-600 text-sm mt-1">{{ bookingError }}</p>
            </div>
          </div>
        </div>

        <!-- Success Message -->
        <div v-if="bookingSuccess" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div class="flex items-center">
            <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-600 mr-3" />
            <div>
              <h3 class="text-green-800 font-medium">Success!</h3>
              <p class="text-green-600 text-sm mt-1">Your booking has been completed successfully.</p>
            </div>
          </div>
        </div>

        <div class="flex justify-between items-center">
          <div class="header">
            <h2 class="text-xl font-semibold text-gray-800 mb-1">
          Customer Information
        </h2>
        <p class="text-gray-500 mb-3">Enter customer detail for booking</p>
        
          </div>
          <div class="flex gap-3 button-save">
             <Button 
               @click="saveCustomerInfo"
               :disabled="!isCustomerInfoComplete || isCreatingAccount"
               :class="[
                 'rounded-full p-2 px-8 transition-all duration-200',
                 (isCustomerInfoComplete && !isCreatingAccount)
                   ? 'bg-purple-700 text-white hover:bg-purple-800' 
                   : 'bg-gray-300 text-gray-500 cursor-not-allowed'
               ]"
             >
              <Icon 
                :name="isCreatingAccount ? 'eos-icons:loading' : 'mingcute:save-fill'" 
                :class="['w-5 mr-2 h-5', isCreatingAccount ? 'animate-spin' : '']" 
              />
              {{ isCreatingAccount ? 'Checking...' : 'Save' }}
              </Button>
              
              <Button 
                @click="clearCustomerInfo"
                v-if="customerInfo?.fullName || customerInfo?.phoneNumber || customerInfo?.email"
                class="rounded-full p-2 px-6 bg-gray-500 text-white hover:bg-gray-600 transition-all duration-200"
              >
                <Icon name="heroicons:trash" class="w-5 mr-2 h-5" />
                Clear
              </Button>
          </div>
        </div>
        <!-- Tab-like headers -->
        <div class="flex border-b border-gray-200 mb-6">
          <button 
            @click="handleTabSwitch('phone')"
            :class="[
              'flex-1 px-4 py-2 font-medium transition-all duration-200',
              activeTab === 'phone' 
                ? 'text-purple-600 border-b-2 border-purple-600' 
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            Phone Number
          </button>
          <button 
            @click="handleTabSwitch('email')"
            :class="[
              'flex-1 px-4 py-2 font-medium transition-all duration-200 cursor-pointer',
              activeTab === 'email' 
                ? 'text-purple-600 border-b-2 border-purple-600' 
                : 'text-gray-500 hover:text-gray-700'
            ]"
            style="pointer-events: auto; user-select: none;"
          >
            Email
          </button>
        </div>

        <!-- Phone Number Tab Content -->
        <div v-show="activeTab === 'phone'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Phone Number Input -->
          <div>
            <PhoneNumber
            v-model="customerInfo.phoneNumber"
            />
          </div>

          <!-- Full Name Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <InputText
              v-model="customerInfo.fullName"
              placeholder="Full name"
              class="w-full p-3 bg-neutral-100 border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        <!-- Email Tab Content -->
        <div v-show="activeTab === 'email'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Email Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <InputText
              v-model="customerInfo.email"
              placeholder="Email address"
              type="email"
              class="w-full p-3 border border-gray-200 rounded-lg bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <!-- Full Name Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <InputText
              v-model="customerInfo.fullName"
              placeholder="Full name"
              class="w-full p-3 border border-gray-200 rounded-lg bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      <!-- Select Event -->
      <div>
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-4">
            <div>
              <h2 class="text-xl font-semibold text-gray-800 mb-1">
                Select Event
              </h2>
              <p class="text-gray-500">Choose the event for booking</p>
            </div>
            <div>
              <span
                class="text-blue-600 font-medium px-3 py-1 rounded-full bg-blue-50"
              >
                <span v-if="isLoading">Loading events...</span>
                <span v-else
                  >Now {{ events.length }} event{{
                    events.length !== 1 ? "s" : ""
                  }}
                  available</span
                >
              </span>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <!-- Layout Toggle Buttons -->
            <div class="flex bg-gray-100 rounded-lg p-1">
              <Button
                @click="layoutView = 'grid'"
                :class="[
                  'p-2 !rounded-md transition-all duration-200',
                  layoutView === 'grid'
                    ? '!bg-white !shadow-sm !text-purple-600'
                    : '!bg-transparent !text-gray-500 hover:!text-gray-700',
                ]"
                severity="secondary"
                text
                title="Grid View"
              >
                <Icon name="heroicons:squares-2x2" class="w-5 h-5" />
              </Button>
              <Button
                @click="layoutView = 'column'"
                :class="[
                  'p-2 !rounded-md transition-all duration-200',
                  layoutView === 'column'
                    ? '!bg-white !shadow-sm !text-purple-600'
                    : '!bg-transparent !text-gray-500 hover:!text-gray-700',
                ]"
                severity="secondary"
                text
                title="Column View"
              >
                <Icon name="heroicons:list-bullet" class="w-5 h-5" />
              </Button>
            </div>
            <div class="relative">
              <Icon
                name="heroicons:magnifying-glass"
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
              />
              <InputText
                v-model="searchQuery"
                placeholder="Search"
                class="pl-10 pr-4 py-3 border border-blue-300 rounded-full w-80 bg-gray-50"
              />
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center items-center py-12">
          <div class="text-center">
            <div
              class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"
            ></div>
            <p class="text-gray-600">Loading events...</p>
          </div>
        </div>

        <!-- Error State -->
        <div
          v-else-if="errorMessage"
          class="bg-red-50 border border-red-200 rounded-lg p-6 mb-6"
        >
          <div class="flex items-center">
            <Icon
              name="heroicons:exclamation-triangle"
              class="w-6 h-6 text-red-600 mr-3"
            />
            <div>
              <h3 class="text-red-800 font-medium">Error Loading Events</h3>
              <p class="text-red-600 mt-1">{{ errorMessage }}</p>
              <button
                @click="loadEvents()"
                class="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>

        <!-- No Events State -->
        <div v-else-if="events.length === 0" class="text-center py-12">
          <Icon
            name="heroicons:calendar-x-mark"
            class="w-16 h-16 text-gray-400 mx-auto mb-4"
          />
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            No Events Available
          </h3>
          <p class="text-gray-600">
            There are currently no events available for booking.
          </p>
        </div>

        <!-- Event Cards - Grid Layout -->
        <div
          v-else-if="layoutView === 'grid'"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <div
            v-for="event in filteredEvents"
            :key="event.id"
            :class="[
              'rounded-2xl overflow-hidden shadow-sm transition-all duration-200 bg-[#fff6]',
              event.isEnded 
                ? '' 
                : 'hover:shadow-lg cursor-pointer'
            ]"
            @click="!event.isEnded && selectEvent(event)"
          >
            <div class="relative overflow-hidden aspect-[16/9]">
              <img
                :src="event.image"
                :alt="event.title"
                class="w-full h-full object-cover"
              />
              <!-- Event Ended Indicator -->
              <div
  v-if="event.isEnded"
  class="absolute bottom-3 left-3 flex items-center space-x-1 bg-[#E5E6F7] text-[#333E54] px-3 py-1 rounded-full text-xs font-semibold shadow-lg"
>
<Icon name="radix-icons:dot-filled" class="w-5 h-5" />
  <span>Event has Ended</span>
</div>

            </div>
            <div class="p-4 flex-1 flex flex-col">
              <h3
                class="font-semibold text-gray-800 mb-3 text-sm leading-tight line-clamp-2 flex-grow"
              >
                {{ event.title }}
              </h3>
              <div class="flex items-start text-gray-600 mb-4 min-h-[20px]">
                <Icon
                  name="heroicons:map-pin"
                  class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0"
                />
                <span class="text-sm leading-tight line-clamp-2">{{ event.location }}</span>
              </div>
              <div
                class="flex flex-col sm:flex-row justify-around items-center bg-white border border-white p-3 rounded-xl shadow-md"
              >
                <div
                  class="flex flex-col items-center text-center mb-2 sm:mb-0"
                >
                  <p class="text-gray-500 text-xs font-medium">Date</p>
                  <p class="text-gray-800 text-base md:text-xs ">
                    {{ event.date }}
                  </p>
                </div>

                <!-- Vertical separator (visible on larger screens) -->
                <div class="hidden sm:block w-px bg-gray-300 h-10 mx-3"></div>
                <!-- Horizontal separator (visible on smaller screens) -->
                <div class="block sm:hidden w-full h-px bg-gray-300 my-1"></div>

                <div class="flex flex-col items-center text-center">
                  <p class="text-gray-500 text-xs font-medium">Time</p>
                  <p class="text-gray-800 text-base md:text-xs ">
                    {{ event.time }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Event Cards - Column Layout -->
        <div v-else-if="layoutView === 'column'" class="space-y-4">
          <div
            v-for="event in filteredEvents"
            :key="event.id"
            :class="[
              'border border-gray-200 rounded-2xl overflow-hidden transition-all duration-200 bg-white flex',
              event.isEnded 
            ]"
            @click="!event.isEnded && selectEvent(event)"
          >
            <div
              class="w-48 h-36 sm:w-52 sm:h-40 md:w-[18rem] md:h-36 relative overflow-hidden flex-shrink-0"
            >
              <img
                :src="event.image"
                :alt="event.title"
                class="w-full h-full object-cover rounded-l-2xl"
              />
              <!-- Event Ended Indicator -->
              <div
  v-if="event.isEnded"
  class="absolute bottom-3 left-3 flex items-center space-x-1 bg-[#E5E6F7] text-[#333E54] px-3 py-1 rounded-full text-xs font-semibold shadow-lg"
>
<Icon name="radix-icons:dot-filled" class="w-5 h-5" />
  <span>Event has Ended</span>
</div>
            </div>
            <div class="flex-1 p-4 flex flex-col justify-between min-h-[144px]">
              <div>
                <h3
                  class="font-semibold text-gray-800 mb-2 text-base leading-tight line-clamp-2"
                >
                  {{ event.title }}
                </h3>
                <div class="flex items-start text-gray-600 mb-3">
                  <Icon
                    name="heroicons:map-pin"
                    class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0"
                  />
                  <span class="text-sm line-clamp-1">{{ event.location }}</span>
                </div>
              </div>
              <div class="flex gap-8 text-sm mt-auto">
                <div>
                  <div class="text-gray-500 mb-1">Date</div>
                  <div class="font-medium text-gray-800 text-xs">
                    {{ event.date }}
                  </div>
                </div>
                <div>
                  <div class="text-gray-500 mb-1">Time</div>
                  <div class="font-medium text-gray-800 text-xs">
                    {{ event.time }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Detail Sidebar Component -->
        <!-- Event Detail Sidebar Component -->
    <EventDetail
      :visible="visible"
      :selected-event="selectedEvent"
      :customer-info="customerInfo"
      :existing-user-data="existingUserData"
      :current-customer-id="currentCustomerId"
      :active-customer-tab="activeTab"
      :is-customer-info-complete="isCustomerInfoComplete"
      :is-processing-booking="isProcessingBooking"
      @update:visible="visible = $event"
      @complete-booking="handleCompleteBooking"
      @book-now="handleBookNowClick"
    />

    <!-- Authentication Modals -->
    
    <!-- Account Not Found Modal -->
    <div v-if="showAccountNotFoundModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-6 w-[30rem] max-w-md mx-4 relative shadow-2xl">
       <div class="header flex justify-between items-center">
         <!-- Close Button -->
        <button 
          @click="showAccountNotFoundModal = false"
          class="absolute top-6 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Icon name="mdi:close" class="w-6 h-6" />
        </button>   
         <!-- Not Found Icon -->
        <div class="flex justify-start items-center space-x-2 mb-4">
          <img :src="accNotFound" width="30px" alt="">
          <h3 class="text-lg font-semibold text-gray-900 ">Account Not Found</h3>
        </div>
       </div>
        
        <!-- Modal Content -->
        <div class="text-start">
          <p class="text-gray-600 mb-2">
            The phone number or email you entered 
            <span class="font-medium text-gray-800">'{{ activeTab === 'phone' ? customerInfo.phoneNumber : customerInfo.email }}'</span> 
            is not linked to any etickets.asia account.
          </p>
          <p class="text-gray-600 mb-6">
            Try entering a different email or phone, or create a new account to continue booking.
          </p>
          
          <!-- Action Buttons -->
          <div class="flex justify-center items-center space-x-2">
            <button
              @click="handleTryAgain"
              class="w-full px-4 py-3 border border-purple-600 text-purple-600 rounded-full font-medium hover:bg-purple-50 transition-colors"
            >
              Try again
            </button>
            <button
              @click="handleCreateAccountFromNotFound"
              class="w-full px-4 py-3 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition-colors"
            >
              Create account
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Register Account Modal -->
    <div v-if="showRegisterModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4 relative">
        <button 
          @click="handleCloseRegisterModal"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <Icon name="heroicons:x-mark" class="w-6 h-6" />
        </button>
        
        <div class="text-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Register account to booking</h3>
        </div>
        
        <!-- Tab Headers -->
        <div class="flex border-b border-gray-200 mb-6">
          <button 
            @click="handleRegisterTabSwitch('phone')"
            :class="[
              'flex-1 px-4 py-2 font-medium transition-all duration-200',
              registerActiveTab === 'phone' 
                ? 'text-purple-600 border-b-2 border-purple-600' 
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            Phone Number
          </button>
          <button 
            @click="handleRegisterTabSwitch('email')"
            :class="[
              'flex-1 px-4 py-2 font-medium transition-all duration-200',
              registerActiveTab === 'email' 
                ? 'text-purple-600 border-b-2 border-purple-600' 
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            Email
          </button>
        </div>
        
        <!-- Form Step -->
        <div v-if="registrationStep === 'form'" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">First name</label>
            <input
              v-model="registerForm.firstName"
              type="text"
              placeholder="Enter first name"
              class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Last name</label>
            <input
              v-model="registerForm.lastName"
              type="text"
              placeholder="Enter last name"
              class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          
          <!-- Phone Number Field - Show when phone tab is active -->
          <div v-show="registerActiveTab === 'phone'">
           <PhoneNumber
            v-model="registerForm.phoneNumber"
            />
          </div>
          
          <!-- Email Field - Show when email tab is active -->
          <div v-show="registerActiveTab === 'email'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="registerForm.email"
              type="email"
              placeholder="Enter email address"
              class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          

          
          <!-- Error Message -->
          <div v-if="authError" class="text-red-600 text-sm">
            {{ authError }}
          </div>
          
          <!-- Register Button -->
          <button
            @click="handleRegisterAccount"
            :disabled="isCreatingAccount || !isRegisterFormValid"
            class="w-full py-3 px-4 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Icon 
              :name="isCreatingAccount ? 'eos-icons:loading' : 'heroicons:user-plus'" 
              :class="['w-5 h-5 mr-2 inline', isCreatingAccount ? 'animate-spin' : '']"
            />
            {{ isCreatingAccount ? 'Sending OTP...' : 'Register' }}
          </button>
        </div>
        
        <!-- OTP Step -->
        <div v-else-if="registrationStep === 'otp'" class="space-y-4">
          <div class="text-center">
            <p class="text-gray-600 mb-6">
              Enter the 6-digit verification code sent to 
              <span class="font-medium">
                {{ registerActiveTab === 'phone' ? registerForm.phoneNumber : registerForm.email }}
              </span>
            </p>
            
            <!-- OTP Input -->
            <div class="mb-4">
              <input
                v-model="registerForm.otp"
                type="text"
                maxlength="6"
                placeholder="Enter 6-digit code"
                class="w-full px-4 py-3 text-center text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            <!-- Countdown -->
            <div class="text-sm text-gray-500 mb-6">
              <span v-if="registrationOTPForm.countdown > 0">
                Resend code: {{ Math.floor(registrationOTPForm.countdown / 60) }}:{{ String(registrationOTPForm.countdown % 60).padStart(2, '0') }} Seconds
              </span>
              <button 
                v-else
                @click="handleResendRegistrationOTP"
                :disabled="isCreatingAccount"
                class="text-purple-600 hover:text-purple-700 disabled:opacity-50"
              >
                {{ isCreatingAccount ? 'Sending...' : "Didn't receive code? Resend code" }}
              </button>
            </div>
            
            <!-- Error Message -->
            <div v-if="authError" class="text-red-600 text-sm mb-4">
              {{ authError }}
            </div>
            
            <!-- Verify Button -->
            <button
              @click="handleVerifyRegistrationOTP"
              :disabled="isCreatingAccount || !registerForm.otp || registerForm.otp.length < 6"
              class="w-full py-3 px-4 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Icon 
                :name="isCreatingAccount ? 'eos-icons:loading' : 'heroicons:check'" 
                :class="['w-5 h-5 mr-2 inline', isCreatingAccount ? 'animate-spin' : '']"
              />
              {{ isCreatingAccount ? 'Verifying...' : 'Verify OTP' }}
            </button>            <!-- Back Button -->
            <button
              @click="registrationStep = 'form'"
              :disabled="isCreatingAccount"
              class="w-full mt-3 py-2 px-4 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              ← Back to form
            </button>
          </div>
        </div>
      </div>
    </div>



    <!-- Create Password Modal -->
    <div v-if="showCreatePasswordModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4 relative">
        <button 
          @click="showCreatePasswordModal = false"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <Icon name="heroicons:x-mark" class="w-6 h-6" />
        </button>
        
        <div class="text-center">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Create password</h3>
          
          <p class="text-gray-600 mb-6">
            Your phone number has been verified! Now create a secure password for your account.
          </p>
          
          <div class="space-y-4 text-left">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                v-model="registerForm.password"
                type="password"
                placeholder="Enter new password"
                class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="Confirm new password"
                class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            <!-- Error Message -->
            <div v-if="authError" class="text-red-600 text-sm">
              {{ authError }}
            </div>
            
            <!-- Create Password Button -->
            <button
              @click="handleCreatePasswordAfterOTP"
              :disabled="isCreatingAccount || !registerForm.password || registerForm.password.length < 8 || registerForm.password !== registerForm.confirmPassword"
              class="w-full py-3 px-4 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Icon 
                :name="isCreatingAccount ? 'eos-icons:loading' : 'heroicons:key'" 
                :class="['w-5 h-5 mr-2 inline', isCreatingAccount ? 'animate-spin' : '']"
              />
              {{ isCreatingAccount ? 'Creating Account...' : 'Create Password' }}
            </button>
          </div>
        </div>
      </div>
    </div>



    <!-- Account Found Modal -->
    <div v-if="showUserExistsModal && existingUserData" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-6 w-[30rem] max-w-md mx-4 relative shadow-2xl">
       <div class="header flex justify-between items-center">
         <!-- Close Button -->
        <button 
          @click="showUserExistsModal = false"
          class="absolute top-6 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Icon name="mdi:close" class="w-6 h-6" />
        </button>   
         <!-- Success Icon -->
        <div class="flex justify-start items-center space-x-2 mb-4">
          <img :src="accFound" width="30px" alt="">
          <h3 class="text-lg font-semibold text-gray-900 ">Account Found</h3>
        </div>
       </div>
        <!-- Modal Content -->
        <div class="text-start">
          <p class="text-gray-600">
            We found an account registered to {{ existingUserData.identifier }}.
          </p>
          <p class="text-gray-600 mb-6">
            Please confirm identity to continue with booking.
          </p>
          
          <!-- User Info Display -->
          <div class="bg-purple-50 rounded-lg p-2 mb-6 text-left">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-purple-600 font-semibold text-sm">
                  {{ existingUserData.fullName ? existingUserData.fullName.charAt(0).toUpperCase() : 'K' }}
                </span>
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ existingUserData.fullName }}</p>
                <p class="text-sm text-gray-500">{{ existingUserData.identifier }}</p>
              </div>
            </div>
          </div>
          
          <!-- Action Button -->
          <button
            @click="handleConfirmAndContinue"
            class="w-full px-4 py-3 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition-colors"
          >
            Confirm and continue
          </button>
        </div>
      </div>
    </div>

    <!-- Account Success Modal -->
    <div v-if="showAccountSuccessModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4 relative">
        <button 
          @click="showAccountSuccessModal = false"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <Icon name="heroicons:x-mark" class="w-6 h-6" />
        </button>
        
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Icon name="heroicons:check" class="w-8 h-8 text-green-600" />
          </div>
          
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Account was created successfully!</h3>
          
          <p class="text-gray-600 mb-8">
            The account has been completely registered using 
            <span class="font-medium">{{ registerForm.phoneNumber || registerForm.email }}</span>. 
            The customer has securely completed their password setup.
          </p>
          
          <button
            @click="handleSuccessComplete"
            class="w-full py-3 px-4 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>

    <!-- Instruct Customer Modal -->
    <div v-if="showInstructCustomerModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4 relative">
        <button 
          @click="showInstructCustomerModal = false"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <Icon name="heroicons:x-mark" class="w-6 h-6" />
        </button>
        
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <div class="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <span class="text-white font-bold text-sm">K</span>
            </div>
          </div>
          
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Instruct the customer</h3>
          
          <p class="text-gray-600 mb-8">
            Please turn the screen towards the customer and hand them the keyboard so they can securely type and confirm their password.
          </p>
          
          <button
            @click="handleInstructionOK"
            class="w-full py-3 px-4 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>

    <!-- reCAPTCHA container (invisible) -->
    <div id="recaptcha-container"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick, onBeforeUnmount } from "vue";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import { useToast } from "primevue/usetoast";
import EventDetail from "./EventDetail.vue";
import { 
  fetchEvents, 
  createOrderReservation,
  checkCustomerExists,
} from "@/composables/api";
import { sendEmailOtp } from "@/composables/useEmailAuth";
// Firebase composable
const { sendOtp, submitOtp, registerUser, registerUserWithEmail,submitWithEmail  } = useFirebase();
import img1 from "@/assets/image/poster-manage-booking.png";
import accFound from "@/assets/image/acc-found.png";
import accNotFound from "@/assets/image/acc-notfound.png";
import accSuccess from "@/assets/image/acc-sucess.png";
import PhoneNumber from "../PhoneNumber.vue";

// Customer information
const customerInfo = ref({
  fullName: "",
  phoneNumber: "",
  email: "",
});

// Active tab state
const activeTab = ref('phone');

// Booking state
const isProcessingBooking = ref(false);
const bookingError = ref("");
const bookingSuccess = ref(false);

// Authentication modal states
const showRegisterModal = ref(false);
const showCreatePasswordModal = ref(false);
const showAccountSuccessModal = ref(false);
const showUserExistsModal = ref(false);
const showAccountNotFoundModal = ref(false);

// User exists modal data
const existingUserData = ref(null);

// Customer ID for linking orders (avoid user confusion)
const currentCustomerId = ref(null);

// Instruct customer modal
const showInstructCustomerModal = ref(false);

// Authentication form data
const registerForm = ref({
  firstName: "",
  lastName: "",
  phoneNumber: "",
  email: "",
  password: "",
  confirmPassword: "",
  otp: ""
});

// Register modal tab state
const registerActiveTab = ref('phone');
// Registration step state
const registrationStep = ref('form'); // 'form', 'otp', 'success'

// Registration OTP state
const registrationOTPForm = ref({
  countdown: 0,
  countdownInterval: null
});



// Authentication processing states
const isCreatingAccount = ref(false);
const authError = ref("");


// PrimeVue Toast
const toast = useToast();

// Search functionality
const searchQuery = ref("");

// Layout state: 'grid' for 3-column, 'column' for single column
const layoutView = ref("grid");

// Events data from API
const events = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");

// Function to format date for display
const formatEventDate = (startDate, endDate) => {
  if (!startDate) return "Date not available";

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  const options = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };

  if (end && start.getTime() !== end.getTime()) {
    return `${start.toLocaleDateString(
      "en-US",
      options
    )} - ${end.toLocaleDateString("en-US", options)}`;
  }

  return start.toLocaleDateString("en-US", options);
};

// Function to format time for display
const formatEventTime = (startDate) => {
  if (!startDate) return "Time not available";

  const date = new Date(startDate);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });
};

// Function to get event image
const getEventImage = (event) => {
  return (
    event.cover_image_url ||
    event.card_background_url ||
    event.event_background_url ||
    img1
  );
};

// Transform API event data to component format
const transformEventData = (apiEvents) => {
  return apiEvents.map((event) => ({
    id: event.id,
    title: event.name || "Untitled Event",
    location: event.location || "Location TBD",
    date: formatEventDate(event.start_date, event.end_date),
    time: formatEventTime(event.start_date),
    image: getEventImage(event),
    isEnded: event.is_ended || false,
    // Keep original API data for reference
    _originalData: event,
  }));
};

// Load events from API
const loadEvents = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const response = await fetchEvents();

    if (response.data.success && Array.isArray(response.data.data)) {
      events.value = transformEventData(response.data.data);
    } else {
      throw new Error(response.data.message || "Failed to load events");
    }
  } catch (error) {
    errorMessage.value =
      error.message || "Failed to load events. Please try again.";
    // Keep empty array on error
    events.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Load customer info from localStorage
const loadCustomerInfo = () => {
  if (process.client) {
    try {
      const saved = localStorage.getItem('customerInfo');
      if (saved) {
        const parsed = JSON.parse(saved);
        customerInfo.value = {
          fullName: parsed.fullName || "",
          phoneNumber: parsed.phoneNumber || "",
          email: parsed.email || "",
        };
        
        // Load customer_id if available to maintain customer context
        if (parsed.customer_id) {
          currentCustomerId.value = parsed.customer_id;
        }
      }
    } catch (error) {
    }
  }
};

// Load events when component mounts
onMounted(async () => {
  // Load customer info first
  loadCustomerInfo();
  
  // Then load events
  await loadEvents();
  
  // Check if there's an eventId in the URL and auto-select that event
  if (process.client) {
    const route = useRoute();
    const eventId = route.query.eventId;
    
    if (eventId && events.value.length > 0) {
      // Find the event with matching ID
      const eventToSelect = events.value.find(event => 
        event._originalData.id === eventId
      );
      
      if (eventToSelect) {
        selectEvent(eventToSelect);
      }
    }
  }
});

// Computed property for filtered events
const filteredEvents = computed(() => {
  if (!searchQuery.value) return events.value;
  return events.value.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Sidebar state
const visible = ref(false);
const selectedEvent = ref(null);

// Methods
const selectEvent = (event) => {
  // Pass the original API data which contains the proper ID and all fields
  const eventForDetail = {
    id: event._originalData.id,
    title: event.title,
    date: event.date,
    time: event.time,
    location: event.location,
    image: event.image,
    // Include any other fields that EventDetail might need
    name: event._originalData.name,
    event_slug: event._originalData.event_slug,
    start_date: event._originalData.start_date,
    end_date: event._originalData.end_date,
    ...event._originalData // Include all original data
  };
  
  selectedEvent.value = eventForDetail;
  visible.value = true;

  
  // Update URL to include event ID for proper ticket loading
  if (process.client && event._originalData.id) {
    const router = useRouter();
    const route = useRoute();
    
    // Update the URL query parameter to include the event ID
    router.replace({
      ...route,
      query: {
        ...route.query,
        eventId: event._originalData.id
      }
    });
  }
};

// Validate customer information
const validateCustomerInfo = () => {
  const errors = [];
  
  if (!customerInfo.value?.fullName?.trim()) {
    errors.push('Full name is required');
  }
  
  if (activeTab.value === 'phone') {
    if (!customerInfo.value?.phoneNumber?.trim()) {
      errors.push('Phone number is required');
    } else {
      // Basic phone number validation (should contain only digits and common separators)
      const phoneRegex = /^[0-9\s\-\+\(\)]{8,15}$/;
      if (!phoneRegex.test(customerInfo.value?.phoneNumber?.trim() || '')) {
        errors.push('Please enter a valid phone number');
      }
    }
  } else if (activeTab.value === 'email') {
    if (!customerInfo.value?.email?.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.value?.email || '')) {
      errors.push('Please enter a valid email address');
    }
  }
  
  return errors;
};

// Check if customer info is complete
const isCustomerInfoComplete = computed(() => {
  const errors = validateCustomerInfo();
  return errors.length === 0;
});

// Check if register form is valid
const isRegisterFormValid = computed(() => {
  if (!registerForm.value.firstName || !registerForm.value.lastName) {
    return false;
  }
  
  if (registerActiveTab.value === 'phone') {
    return registerForm.value.phoneNumber && registerForm.value.phoneNumber.trim().length > 0;
  } else if (registerActiveTab.value === 'email') {
    const email = registerForm.value.email && registerForm.value.email.trim();
    if (!email) return false;
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  return false;
});

// Check if password is valid for final account creation
const isPasswordValid = computed(() => {
  return registerForm.value.password && 
         registerForm.value.password.length >= 8 && 
         registerForm.value.password === registerForm.value.confirmPassword;
});

// Generate transaction ID
const generateTransactionId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `TXN${timestamp}${random}`.toUpperCase();
};

// Handle booking completion from EventDetail component
const handleCompleteBooking = async (bookingDetails) => {
  
  // Validate customer information first
  const validationErrors = validateCustomerInfo();
  if (validationErrors.length > 0) {
    bookingError.value = validationErrors.join(', ');
    toast.add({
      severity: 'error',
      summary: 'Customer Information Required',
      detail: validationErrors.join(', '),
      life: 5000
    });
    return;
  }
  
  // IMPORTANT: Check if customer validation was done
  // If currentCustomerId is null, we need to check customer existence first
  if (!currentCustomerId.value) {
    
    try {
      let identifier = '';
      let loginType = '';

      if (activeTab.value === "phone") {
        identifier = customerInfo.value?.phoneNumber?.replace(/^\+/, '') || ''; 
        loginType = 'phone';
      } else if (activeTab.value === "email") {
        identifier = customerInfo.value?.email || '';
        loginType = 'email';
      }

      const customerCheck = await checkCustomerExists(identifier, loginType);
      
      if (customerCheck.exists === true) {
        // Set customer_id for order linking
        currentCustomerId.value = customerCheck.customer_id;
      } else {
      }
      
    } catch (error) {
      console.warn('⚠️ Could not verify customer existence, proceeding as new customer:', error.message);
    }
  }
  
  // Check if an event is selected
  if (!selectedEvent.value || !selectedEvent.value.id) {
    bookingError.value = 'Please select an event first';
    toast.add({
      severity: 'error',
      summary: 'Event Required',
      detail: 'Please select an event first',
      life: 5000
    });
    return;
  }
  
  // Check if tickets are selected
  if (!bookingDetails.tickets || bookingDetails.tickets.length === 0) {
    bookingError.value = 'Please select at least one ticket';
    toast.add({
      severity: 'error',
      summary: 'Tickets Required',
      detail: 'Please select at least one ticket',
      life: 5000
    });
    return;
  }
  
  isProcessingBooking.value = true;
  bookingError.value = "";
  bookingSuccess.value = false;
  
  try {
    // Prepare order data according to API specification
    const orderData = {
      event_id: selectedEvent.value?.id, // CRITICAL: Include event_id
      coupon: bookingDetails.paymentSummary?.voucherCode || null,
      ticket_types: bookingDetails.tickets.map(ticket => ({
        ticket_type_id: ticket.id,
        quantity: ticket.quantity
      })),
      payment_method: bookingDetails.paymentMethod,
      transaction_id: bookingDetails.paymentMethod === 'offline' 
        ? null 
        : (bookingDetails.transactionId && String(bookingDetails.transactionId).trim() 
           ? String(bookingDetails.transactionId).trim() 
           : generateTransactionId()),
      phone_number: activeTab.value === 'phone' ? customerInfo.value?.phoneNumber?.trim() || null : null,
      email: activeTab.value === 'email' ? customerInfo.value?.email?.trim() : null, 
      full_name: customerInfo.value?.fullName?.trim() || '',
      customer_id: currentCustomerId.value // IMPORTANT: Link order to existing customer if found
    };


    // Debug: Check why customer_id might be missing
    if (!currentCustomerId.value) {
      console.warn('⚠️ No customer ID found! User may not have gone through validation flow.');
    }

    // Create the order reservation
    const result = await createOrderReservation(orderData);
  
    
    if (result.success) {
      bookingSuccess.value = true;
      visible.value = false; // Close the sidebar
      
      // Optional: Show success message with order details
      showSuccessMessage(result);
      
      // Reset form after successful booking
      resetBookingForm();
    } else {
      throw new Error(result.error || 'Failed to create order');
    }
    
  } catch (error) {
    console.error('❌ Booking failed:', error);
    bookingError.value = error.message || 'Failed to complete booking. Please try again.';
    toast.add({
      severity: 'error',
      summary: 'Booking Failed',
      detail: error.message || 'Failed to complete booking. Please try again.',
      life: 8000
    });
  } finally {
    isProcessingBooking.value = false;
  }
};

// Show success message
const showSuccessMessage = (result) => {
  const orderInfo = result.data || {};
  const orderId = result.order_id || orderInfo.id || 'N/A';
  const customerId = result.customer_id || orderInfo.customer_id || currentCustomerId.value;

  
  let successDetail = `Your booking has been confirmed! Order ID: ${orderId}`;
  if (customerId) {
    successDetail = `Booking confirmed for customer #${customerId}! Order ID: ${orderId}`;
  }
  
  toast.add({
    severity: 'success',
    summary: 'Booking Successful',
    detail: successDetail,
    life: 5000
  });
  
};

// Reset booking form
const resetBookingForm = () => {
  // Clear customer info
  customerInfo.value = {
    fullName: "",
    phoneNumber: "",
    email: "",
  };
  
  // Clear customer_id and existing user data
  currentCustomerId.value = null;
  existingUserData.value = null;
  
  // Clear from localStorage as well
  if (process.client) {
    localStorage.removeItem('customerInfo');
  }
  
  // Reset form states
  bookingError.value = "";
  bookingSuccess.value = false;
  
  // Close sidebar and clear selected event
  selectedEvent.value = null;
  visible.value = false;
  clearEventFromUrl();
  
};

// Save customer information and check if user exists
const saveCustomerInfo = async () => {
  // Only validate contact information (phone/email) for user existence check
  // Full name validation will be done later during booking completion
  const contactValidationErrors = [];
  
  if (activeTab.value === 'phone') {
    if (!customerInfo.value?.phoneNumber?.trim()) {
      contactValidationErrors.push('Phone number is required');
    } else {
      // Basic phone number validation (should contain only digits and common separators)
      const phoneRegex = /^[0-9\s\-\+\(\)]{8,15}$/;
      if (!phoneRegex.test(customerInfo.value?.phoneNumber?.trim() || '')) {
        contactValidationErrors.push('Please enter a valid phone number');
      }
    }
  } else if (activeTab.value === 'email') {
    if (!customerInfo.value?.email?.trim()) {
      contactValidationErrors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.value?.email || '')) {
      contactValidationErrors.push('Please enter a valid email address');
    }
  }
  
  if (contactValidationErrors.length > 0) {
    bookingError.value = contactValidationErrors.join(', ');
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: contactValidationErrors.join(', '),
      life: 5000
    });
    return;
  }
  
  bookingError.value = "";
  bookingSuccess.value = false;
  authError.value = "";
  
  try {
    let identifier = '';
    let loginType = '';

    if (activeTab.value === "phone") {
      identifier = customerInfo.value?.phoneNumber?.replace(/^\+/, '') || ''; 
      loginType = 'phone';
    } else if (activeTab.value === "email") {
      identifier = customerInfo.value?.email || '';
      loginType = 'email';
    }


    // Use the new checkCustomerExists function for better handling
    const customerCheck = await checkCustomerExists(identifier, loginType);
    
    
    if (customerCheck.exists === true) {
      // User exists - store customer_id and show Account Found modal
      currentCustomerId.value = customerCheck.customer_id;
      existingUserData.value = {
        identifier: customerCheck.identifier || '',
        fullName: customerCheck.full_name || customerCheck.name || '', // Use name from API response
        name: customerCheck.full_name || customerCheck.name || '', // Also store as name for compatibility
        loginType: customerCheck.loginType || activeTab.value || 'phone',
        customer_id: customerCheck.customer_id, // IMPORTANT: customer_id from check-user-info API
        phone_number: customerCheck.phone_number,
        email: customerCheck.email,
        userData: customerCheck.userData, // Complete user data from API
        originalResponse: customerCheck.originalResponse, // Full API response
        ...customerCheck
      };
      
      showUserExistsModal.value = true;
      
    } else {
      // User doesn't exist - clear customer_id and show Account Not Found modal
      currentCustomerId.value = null;
      console.log('❌ Customer not found for:', identifier);
      showAccountNotFoundModal.value = true;
    }
    
  } catch (error) {
    console.error('❌ Error checking customer existence:', error);
    authError.value = error.message || 'Failed to check customer information';
    bookingError.value = authError.value;
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: authError.value,
      life: 5000
    });
  }
};

// Proceed to registration flow
const proceedToRegistration = () => {
  registerActiveTab.value = activeTab.value;
  
  // Reset registration state
  registrationStep.value = 'form';
  
  // Pre-populate register form with existing customer info
  registerForm.value = {
    firstName: customerInfo.value?.fullName?.split(' ')[0] || "",
    lastName: customerInfo.value?.fullName?.split(' ').slice(1).join(' ') || "",
    phoneNumber: customerInfo.value?.phoneNumber || "",
    email: customerInfo.value?.email || "",
    password: "",
    confirmPassword: "",
    otp: ""
  };
  
  // Show registration modal
  showRegisterModal.value = true;
  
};

// Handle user exists confirmation - use existing user
const handleUseExistingUser = () => {
  if (!existingUserData.value) {
    showUserExistsModal.value = false;
    return;
  }
  
  showUserExistsModal.value = false;
  
  // Store customer_id for order linking
  currentCustomerId.value = existingUserData.value.customer_id;
  
  // Update customer info with confirmed data
  customerInfo.value = {
    fullName: existingUserData.value.fullName || existingUserData.value.full_name || existingUserData.value.name || '',
    phoneNumber: existingUserData.value.loginType === 'phone' ? existingUserData.value.identifier : '',
    email: existingUserData.value.loginType === 'email' ? existingUserData.value.identifier : ''
  };
  
  // Save existing user info to localStorage
  if (process.client) {
    localStorage.setItem('customerInfo', JSON.stringify({
      ...customerInfo.value,
      customer_id: currentCustomerId.value
    }));
  }
  
  
  toast.add({
    severity: 'success',
    summary: 'Customer Information Confirmed',
    detail: `Welcome back, ${customerInfo.value.fullName}! Your information has been confirmed.`,
    life: 5000
  });
  
};

// Handle Account Not Found modal - Try Again
const handleTryAgain = () => {
  showAccountNotFoundModal.value = false;
  // Reset the form so user can try again
  customerInfo.value.phoneNumber = "";
  customerInfo.value.email = "";
  authError.value = "";
  bookingError.value = "";
};

// Handle Account Not Found modal - Create Account
const handleCreateAccountFromNotFound = () => {
  showAccountNotFoundModal.value = false;
  proceedToRegistration();
};

// Handle Account Found modal - Confirm and Continue
const handleConfirmAndContinue = () => {
  if (!existingUserData.value) {
    return;
  }
  
  showUserExistsModal.value = false;
  
  // Store customer_id for order linking
  currentCustomerId.value = existingUserData.value.customer_id;
  
  // Update customer info with confirmed data
  customerInfo.value = {
    fullName: existingUserData.value.fullName || existingUserData.value.full_name || existingUserData.value.name || '',
    phoneNumber: existingUserData.value.loginType === 'phone' ? existingUserData.value.identifier : '',
    email: existingUserData.value.loginType === 'email' ? existingUserData.value.identifier : ''
  };
  
  // Save existing user info to localStorage
  if (process.client) {
    localStorage.setItem('customerInfo', JSON.stringify({
      ...customerInfo.value,
      customer_id: currentCustomerId.value
    }));
  }
  
  toast.add({
    severity: 'success',
    summary: 'Account Confirmed',
    detail: `Welcome back, ${customerInfo.value.fullName}! Ready to proceed with booking.`,
    life: 5000
  });
};

// Handle user exists confirmation - create new account (legacy - kept for compatibility)
const handleCreateNewAccount = () => {
  showUserExistsModal.value = false;
  proceedToRegistration();
};

// === TAB SWITCHING FUNCTIONS ===

// Handle tab switching with debugging
const handleTabSwitch = (tab) => {
  activeTab.value = tab;
  
  // Clear any existing errors when switching tabs
  bookingError.value = "";
  authError.value = "";

};

// === AUTHENTICATION MODAL FUNCTIONS ===



// Handle register modal close
const handleCloseRegisterModal = () => {
  showRegisterModal.value = false;
  authError.value = "";
  registrationStep.value = 'form';
  
  // Clear countdown
  if (registrationOTPForm.value.countdownInterval) {
    clearInterval(registrationOTPForm.value.countdownInterval);
  }
  
  // Reset register form
  registerForm.value = {
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: ""
  };
};

// Handle register modal tab switching
const handleRegisterTabSwitch = (tab) => {

  registerActiveTab.value = tab;
  authError.value = ""; // Clear any errors when switching tabs

  
  // Force reactivity update
  nextTick(() => {
  });
};

// Handle register form submission (send OTP - Phone or Email)
const handleRegisterAccount = async () => {  
  // Validate form data based on active tab
  if (!registerForm.value.firstName || !registerForm.value.lastName) {
    authError.value = 'Please fill in first name and last name';
    return;
  }
  
  if (registerActiveTab.value === 'phone') {
    if (!registerForm.value.phoneNumber) {
      authError.value = 'Please enter phone number';
      return;
    }
  } else if (registerActiveTab.value === 'email') {
    if (!registerForm.value.email) {
      authError.value = 'Please enter email address';
      return;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerForm.value.email)) {
      authError.value = 'Please enter a valid email address';
      return;
    }
  }  try {
    authError.value = '';
    isCreatingAccount.value = true;
    
    let otpResult;
    let identifier;
    
    if (registerActiveTab.value === 'phone') {
      // Send Firebase Phone OTP
      identifier = registerForm.value.phoneNumber;
      otpResult = await sendOtp(identifier);
    } else if (registerActiveTab.value === 'email') {
      // Send Firebase Email OTP
      identifier = registerForm.value.email;
      otpResult = await sendEmailOtp(identifier);
    }
        
    // Move to OTP verification step
    registrationStep.value = 'otp';
    startRegistrationOTPCountdown();
    
    // Show success message
    toast.add({
      severity: 'success',
      summary: 'OTP Sent',
      detail: `Verification code sent to ${identifier}`,
      life: 5000
    });
    
  } catch (error) {
    console.error('❌ Firebase OTP error:', error);
    authError.value = error.message || 'Failed to send OTP. Please try again.';
    
    // Show different message for configuration errors
    let toastDetail = error.message;
    let toastSummary = 'OTP Error';
    
    if (error.message.includes('Firebase configuration error')) {
      toastSummary = 'Firebase Setup Required';
      toastDetail = 'Please check Firebase Console: Enable Phone Authentication and add authorized domains.';
    }
    
    toast.add({
      severity: 'error',
      summary: toastSummary,
      detail: toastDetail,
      life: 10000
    });
  } finally {
    isCreatingAccount.value = false;
  }
};



// Verify OTP and create account (Phone or Email)
const handleVerifyRegistrationOTP = async () => {
  
  if (!registerForm.value.otp || registerForm.value.otp.length < 6) {
    authError.value = "Please enter a valid 6-digit OTP";
    return;
  }
  
  try {
    authError.value = '';
    isCreatingAccount.value = true;
    
    let otpResult;
    let identifier;
    let loginType;
    
    if (registerActiveTab.value === 'phone') {
      // Verify Firebase Phone OTP
      identifier = registerForm.value.phoneNumber;
      otpResult = await submitOtp(registerForm.value.otp, registerForm.value.firstName, registerForm.value.lastName, identifier);
    } else if (registerActiveTab.value === 'email') {
      // Verify Firebase Email OTP
      identifier = registerForm.value.email;
      loginType = 'email';
      const emailResult = await submitWithEmail(registerForm.value.otp, registerForm.value.firstName, registerForm.value.lastName, identifier);
      
      if (emailResult.success) {
          otpResult = {
          success: true,
          userData: {
            uid: emailResult.uid || `email_${Date.now()}`, // Generate UID if not provided
            firstName: registerForm.value.firstName,
            lastName: registerForm.value.lastName,
            identifier: identifier,
            login_type: 'email',
            idToken: emailResult.userData.idToken || null
          }
        };
      } else {
        otpResult = { error: emailResult.message || 'Invalid email OTP' };
      }
    }
    
    if (otpResult.error) {
      authError.value = otpResult.error;
      return;
    }
    // Step 2: Register user in backend using appropriate method
    let registrationResult;
    
    if (registerActiveTab.value === 'phone') {
      registrationResult = await registerUser(otpResult.userData);
    } else if (registerActiveTab.value === 'email') {
      registrationResult = await registerUserWithEmail(otpResult.userData);

    } else {
      // Fallback
      registrationResult = await registerUser(otpResult.userData);
    }
    
    if (!registrationResult.success) {
      if (registrationResult.code === 'USER_EXISTS') {
        // User already exists, this is actually fine for our flow

        toast.add({
          severity: 'info',
          summary: 'Account Found',
          detail: 'Account already exists. Please create a password to complete setup.',
          life: 5000
        });
      } else {
        authError.value = registrationResult.error;
        return;
      }
    } else {
      toast.add({
        severity: 'success',
        summary: 'Account Created',
        detail: 'Account created successfully. Please set your password.',
        life: 5000
      });
    }
    
    // Clear OTP timer
    if (registrationOTPForm.value.countdownInterval) {
      clearInterval(registrationOTPForm.value.countdownInterval);
    }
    
    // Close register modal and show instruction modal first
    showRegisterModal.value = false;
    showInstructCustomerModal.value = true;
    
    // Reset registration step for next time
    registrationStep.value = 'form';
    
    
  } catch (error) {
    console.error('❌ Error in registration flow:', error);
    authError.value = error.message || 'Failed to complete registration. Please try again.';
    
    toast.add({
      severity: 'error',
      summary: 'Registration Failed',
      detail: authError.value,
      life: 5000
    });
  } finally {
    isCreatingAccount.value = false;
  }
};

// Resend registration OTP (Phone or Email)
const handleResendRegistrationOTP = async () => {
  
  try {
    authError.value = '';
    isCreatingAccount.value = true;
    
    let identifier;
    
    if (registerActiveTab.value === 'phone') {
      // Resend Firebase Phone OTP
      identifier = registerForm.value.phoneNumber;
      await sendOtp(identifier);
    } else if (registerActiveTab.value === 'email') {
      // Resend Firebase Email OTP
      identifier = registerForm.value.email;
      await sendEmailOtp(identifier);
    }
    
    // Restart countdown
    startRegistrationOTPCountdown();
    
    toast.add({
      severity: 'success',
      summary: 'OTP Resent',
      detail: `New verification code sent to your ${registerActiveTab.value}`,
      life: 3000
    });
    
  } catch (error) {
    console.error('❌ Error resending Firebase registration OTP:', error);
    authError.value = error.message || 'Failed to resend OTP. Please try again.';
  } finally {
    isCreatingAccount.value = false;
  }
};

// Start registration OTP countdown timer
const startRegistrationOTPCountdown = () => {
  registrationOTPForm.value.countdown = 120; // 2 minutes
  
  if (registrationOTPForm.value.countdownInterval) {
    clearInterval(registrationOTPForm.value.countdownInterval);
  }
  
  registrationOTPForm.value.countdownInterval = setInterval(() => {
    registrationOTPForm.value.countdown--;
    
    if (registrationOTPForm.value.countdown <= 0) {
      clearInterval(registrationOTPForm.value.countdownInterval);
      registrationOTPForm.value.countdownInterval = null;
    }
  }, 1000);
};

// Removed unused OTP countdown function

const handleCreatePasswordAfterOTP = async () => {
  // Validate password
  if (!registerForm.value.password || registerForm.value.password.length < 8) {
    authError.value = "Password must be at least 8 characters";
    return;
  }

  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    authError.value = "Passwords do not match";
    return;
  }

  authError.value = "";
  isCreatingAccount.value = true;
  
  // Get identifier based on registration type
  let identifier;
  if (registerActiveTab.value === 'phone') {
    identifier = registerForm.value.phoneNumber.replace(/^\+/, '');
  } else {
    identifier = registerForm.value.email;
  }
  
  try {
    // Build body for update password API
    const body = {
      identifier: identifier,
      new_password: registerForm.value.password
    };

    const config = useRuntimeConfig();
    const baseUrl = config.public.apiBaseUrl;

    // Call register API
    await $fetch(`${baseUrl}/update-user-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
    });

    // Close create password modal and show success modal
    showCreatePasswordModal.value = false;
    showAccountSuccessModal.value = true;

    // Save customer info to localStorage
    if (process.client) {
      localStorage.setItem('customerInfo', JSON.stringify(customerInfo.value));
    }
  } catch (error) {
    console.error('❌ Error creating account:', error);
    authError.value = error.message || 'Failed to create account';
  } finally {
    isCreatingAccount.value = false;
  }
};


// Handle success modal completion
const handleSuccessComplete = () => {
  showAccountSuccessModal.value = false;
  
  toast.add({
    severity: 'success',
    summary: 'Account Ready',
    detail: 'You can now proceed with booking!',
    life: 3000
  });
};

// Handle instruction modal OK button
const handleInstructionOK = () => {
  showInstructCustomerModal.value = false;
  showCreatePasswordModal.value = true;
};

// Clear customer information
const clearCustomerInfo = () => {
  customerInfo.value = {
    fullName: "",
    phoneNumber: "",
    email: "",
  };
  
  // Clear customer_id to avoid confusion
  currentCustomerId.value = null;
  existingUserData.value = null;
  
  // Clear from localStorage as well
  if (process.client) {
    localStorage.removeItem('customerInfo');
  }
  
  // Clear any error states
  bookingError.value = "";
  bookingSuccess.value = false;
  
  
  toast.add({
    severity: 'info',
    summary: 'Information Cleared',
    detail: 'Customer information has been cleared.',
    life: 3000
  });
  
};

const handleBookNowClick = (event) => {
  // You can add further logic here, e.g., navigate to a booking page
  // or open a booking form modal.
  visible.value = false; // Close the sidebar after clicking book now
  clearEventFromUrl();
};

// Clear event ID from URL when sidebar is closed
const clearEventFromUrl = () => {
  if (process.client) {
    const router = useRouter();
    const route = useRoute();
    
    // Remove the eventId from query parameters
    const newQuery = { ...route.query };
    delete newQuery.eventId;
    
    router.replace({
      ...route,
      query: newQuery
    });
  }
};

// Watch for sidebar visibility changes
watch(visible, (newVisible) => {
  if (!newVisible) {
    // Clear URL when sidebar is closed
    clearEventFromUrl();
  }
});

// Cleanup countdown timer on unmount
onUnmounted(() => {
  if (registrationOTPForm.value.countdownInterval) {
    clearInterval(registrationOTPForm.value.countdownInterval);
  }
});

// Cleanup on unmount
onBeforeUnmount(() => {
  if (registrationOTPForm.value.countdownInterval) {
    clearInterval(registrationOTPForm.value.countdownInterval);
  }
  try { 
    if (typeof window !== 'undefined' && window.recaptchaVerifier && typeof window.recaptchaVerifier.clear === 'function') {
      window.recaptchaVerifier.clear();
    }
  } catch(e) {
    console.warn('Error clearing recaptcha:', e);
  }
})

</script>

<style scoped>
/* PrimeVue component overrides for consistent styling */
:deep(.p-inputtext) {
  @apply focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-neutral-100;
}
/* Remove border and focus styles for phone input */
:deep(.p-inputtext.border-0) {
  border: none !important;
  box-shadow: none !important;
}
:deep(.p-inputtext.border-0:focus) {
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
}
/* Ensure input text next to flag is not rounded on left */
:deep(.p-inputtext.\!rounded-l-none) {
  @apply rounded-l-none;
}
/* Custom button styling for layout toggle */
:deep(.p-button) {
  @apply transition-all duration-200;
}

/* Text clamping for consistent card heights */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  max-height: calc(2 * 1.4em);
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Grid layout image aspect ratio */
.aspect-\[16\/9\] {
  aspect-ratio: 16 / 9;
}

/* Ensure consistent image loading and transitions */
img {
  transition: transform 0.3s ease;
}

/* Hover effects for better interactivity */
.cursor-pointer:hover img {
  transform: scale(1.05);
}

/* Responsive adjustments for mobile */
@media (max-width: 768px) {
  .grid-cols-1.md\:grid-cols-2.lg\:grid-cols-3 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  /* Column layout adjustments for mobile */
  .space-y-4 > div {
    flex-direction: column;
  }

  .space-y-4 > div .w-48 {
    width: 100%;
    height: 200px;
  }

  .space-y-4 > div img {
    border-radius: 1rem 1rem 0 0;
  }
}

/* Ensure cards have consistent minimum height in grid */
.grid .bg-\[\#FFFFFF\] {
  min-height: 350px;
  display: flex;
  flex-direction: column;
}

.grid .bg-\[\#FFFFFF\] .p-4 {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* Modal animation styles */
.fixed.inset-0 {
  animation: fadeIn 0.2s ease-out;
}

.fixed.inset-0 > div {
  animation: slideUp 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

/* Input focus styles for modals */
.fixed input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.5);
}

/* Button loading state */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
