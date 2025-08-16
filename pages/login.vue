<template>
  <div class="flex items-center justify-center p-4 bg-cover bg-center min-h-full">
    <div class="w-full max-w-md lg:max-w-lg mx-auto">
      <div class="text-center mb-6 lg:mb-8">
        <img
          :src="logo1"
          alt="Logo"
          class="w-64 sm:w-80 lg:w-96 h-auto mx-auto mb-4 filter drop-shadow-lg"
        />
      </div>

      <div
        ref="formRef"
        class="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl text-center shadow-2xl p-6 lg:p-8 space-y-6 border border-gray-700 relative overflow-hidden"
      >
        <div class="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-fuchsia-900/20 opacity-30 pointer-events-none"></div>
        <h2 class="text-2xl lg:text-3xl font-extrabold text-white relative z-10">Business Portal</h2>
        <p class="text-gray-400 mt-1 text-sm lg:text-base relative z-10">Sign in to manage your account</p>

        <div class="border-t border-gray-700 relative z-10"></div>

        <!-- Tab Navigation -->
        <div class="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 mb-6 relative z-10">
          <button
            @click="currentTab = 'username-password'"
            :class="{
              'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white': currentTab === 'username-password',
              'bg-gray-700 text-gray-300 hover:bg-gray-600': currentTab !== 'username-password'
            }"
            class="py-2 px-4 lg:px-6 rounded-full font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 text-sm lg:text-base"
            aria-controls="username-password-form"
            :aria-selected="currentTab === 'username-password'"
            role="tab"
          >
            <i class="pi pi-user mr-2"></i>
            <span class="hidden sm:inline">Username</span>
            <span class="sm:hidden">Username</span>
          </button>
          <button
            @click="currentTab = 'phone-number'"
            :class="{
              'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white': currentTab === 'phone-number',
              'bg-gray-700 text-gray-300 hover:bg-gray-600': currentTab !== 'phone-number'
            }"
            class="py-2 px-4 lg:px-6 rounded-full font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 text-sm lg:text-base"
            aria-controls="phone-number-form"
            :aria-selected="currentTab === 'phone-number'"
            role="tab"
          >
            <i class="pi pi-phone mr-2"></i>
            <span class="hidden sm:inline">Phone Number</span>
            <span class="sm:hidden">Phone</span>
          </button>
        </div>

        <!-- Username/Password Form -->
        <form v-if="currentTab === 'username-password'" @submit.prevent="handleLogin" class="space-y-4 lg:space-y-5 relative z-10" id="username-password-form" role="tabpanel">
          <div>
            <label for="username" class="text-sm lg:text-base font-medium text-gray-300 mb-2 flex items-center">
              <i class="pi pi-user mr-2 lg:mr-3 text-purple-400 text-base lg:text-lg"></i> Username
            </label>
            <input
              id="username"
              v-model="username"
              type="text"
              required
              class="w-full px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 placeholder-gray-400"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label for="password" class="text-sm lg:text-base font-medium text-gray-300 mb-2 flex items-center">
              <i class="pi pi-lock mr-2 lg:mr-3 text-purple-400 text-base lg:text-lg"></i> Password
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="w-full px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 placeholder-gray-400"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            :disabled="isLoading"
            :class="[
              'w-full py-2 lg:py-3 px-4 rounded-lg focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 font-semibold flex items-center justify-center text-base lg:text-lg shadow-lg',
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white hover:from-purple-700 hover:to-fuchsia-700'
            ]"
          >
            <LoadingSpinner
              v-if="isLoading"
              size="sm"
              color="gray"
              :showText="false"
              class="mr-2"
            />
            <i v-else class="pi pi-sign-in mr-2 lg:mr-3 text-lg lg:text-xl"></i>
            {{ isLoading ? 'Signing In...' : 'Sign In' }}
          </button>
        </form>

        <!-- Phone Number Form -->
        <form v-else-if="currentTab === 'phone-number'" @submit.prevent="handleLogin" class="space-y-4 lg:space-y-5 relative z-10" id="phone-number-form" role="tabpanel">
          <div>
            <label for="phone-number" class="text-sm lg:text-base font-medium text-gray-300 mb-2 flex items-center">
              <i class="pi pi-phone mr-2 lg:mr-3 text-purple-400 text-base lg:text-lg"></i> Phone Number
            </label>
            <input
              id="phone-number"
              v-model="phoneNumber"
              type="tel"
              required
              class="w-full px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 placeholder-gray-400"
              placeholder="Enter your phone number"
            />
          </div>
            <div>
            <label for="password" class="text-sm lg:text-base font-medium text-gray-300 mb-2 flex items-center">
              <i class="pi pi-lock mr-2 lg:mr-3 text-purple-400 text-base lg:text-lg"></i> Password
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="w-full px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 placeholder-gray-400"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            :disabled="isLoading"
            :class="[
              'w-full py-2 lg:py-3 px-4 rounded-lg focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 font-semibold flex items-center justify-center text-base lg:text-lg shadow-lg',
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white hover:from-purple-700 hover:to-fuchsia-700'
            ]"
          >
            <LoadingSpinner
              v-if="isLoading"
              size="sm"
              color="gray"
              :showText="false"
              class="mr-2"
            />
            <i v-else class="pi pi-sign-in mr-2 lg:mr-3 text-lg lg:text-xl"></i>
            {{ isLoading ? 'Signing In...' : 'Sign In with Phone' }}
          </button>
        </form>

        <div class="mt-4 lg:mt-6 p-3 lg:p-4 text-start bg-gray-700 rounded-lg border border-gray-600 relative z-10">
          <p class="text-sm lg:text-base text-gray-200 font-medium mb-2 flex items-center">
            <i class="pi pi-info-circle mr-2 lg:mr-3 text-purple-400 text-base lg:text-lg"></i> Welcome.
          </p>
          <!-- <p class="text-xs lg:text-sm text-gray-300">
            <strong>Username:</strong> admin<br />
            <strong>Password:</strong> Welcome.1#!
          </p>
          <p class="text-xs lg:text-sm text-gray-300 mt-2">
            <strong>Phone (any):</strong> 123-456-7890
          </p> -->
        </div>
      </div>

      <Toast />
    </div>
  </div>

</template>

<script setup>
import { ref, onMounted } from "vue";
import { login } from '@/composables/api'; // Your API call helper
import { useMotion } from "@vueuse/motion";
import { useToast } from "primevue/usetoast";
import Toast from 'primevue/toast';
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue';
import { classicLoader } from '~/composables/useClassicLoader.js';

// Images
import logo1 from '@/assets/image/eticketsasia.png';

definePageMeta({
  layout: "default",
});

const username = ref("");
const password = ref("");
const phoneNumber = ref("");
const currentTab = ref("username-password");
const isLoading = ref(false);

const formRef = ref(null);
const toast = useToast();

const { apply: applyMotion, set: setMotion } = useMotion(formRef, {
  initial: { x: 0 },
  shake: {
    x: [-10, 10, -8, 8, -6, 6, -4, 4, 0],
    transition: { duration: 0.5, ease: "easeInOut" },
  },
});

onMounted(() => {
  setMotion("initial");
});

const applyShake = () => {
  if (formRef.value) {
    applyMotion("shake");
  }
};

async function handleLogin() {
  try {
    // Show classic loading
    isLoading.value = true
    classicLoader.show('Connecting to server...', [
      'Connecting to server',
      'Authenticating credentials',
      'Loading dashboard'
    ])

    console.log('🔑 Login attempt:', { 
      username: username.value,
      method: currentTab.value 
    })

    // Validate input
    const identifier = currentTab.value === 'username-password' ? username.value : phoneNumber.value
    if (!identifier || !password.value) {
      throw new Error('Please fill in all required fields')
    }

    // Simulate initial progress
    await new Promise(resolve => setTimeout(resolve, 500))
    classicLoader.updateProgress(25, 'Authenticating credentials...')

    // Attempt login
    const data = await login(identifier, password.value)
    console.log('📥 Login response received:', data)

    // Update progress
    classicLoader.updateProgress(60, 'Verifying account...')

    // Validate response structure - handle both direct token and nested structure
    let token = null;
    let userData = {};
    
    // Check for token in different possible locations
    if (data?.tokens?.access_token) {
      // Nested structure
      token = data.tokens.access_token;
      userData = data.user || {};
    } else if (data?.access_token) {
      // Direct token
      token = data.access_token;
      userData = data.user || {};
    } else if (data?.token) {
      // Alternative token field
      token = data.token;
      userData = data.user || {};
    } else {
      console.error('❌ Invalid login response structure:', data)
      throw new Error('Invalid server response. Missing access token.')
    }

    // Extract token and user info
    const user = {
      username: identifier,
      message: data.message || 'Login successful',
      loginTime: new Date().toISOString(),
      // Add any additional user info from the response
      ...userData
    }

    console.log('Extracted token info:', {
      token: token ? 'present' : 'missing',
      user,
      tokenLength: token ? token.length : 0
    })

    if (!token) {
      console.error('No token found in response structure:', data)
      throw new Error("Missing access token in login response. Please check your credentials.");
    }

    // Update progress
    classicLoader.updateProgress(85, 'Loading dashboard...')

    // Use the auth composable to set authentication data and verify it was saved
    const { setAuth, getToken } = useAuth();
    setAuth({ token, user });
    
    // Verify token was saved correctly
    const savedToken = getToken();
    if (!savedToken) {
      throw new Error('Failed to save authentication token');
    }
    
    // Log successful auth (without exposing token)
    console.log('✅ Authentication successful:', { 
      savedTokenLength: savedToken.length,
      user: { ...user, token: '[REDACTED]' }
    });

    // Final progress
    classicLoader.updateProgress(100, 'Complete!')

    toast.add({
      severity: "success",
      summary: "Login Success",
      detail: "Welcome to the Admin Panel!",
      life: 2000,
    });

    // Small delay to show completion
    await new Promise(resolve => setTimeout(resolve, 500))

    // Handle redirect parameter
    const route = useRoute()
    const redirectTo = route.query.redirect

    if (redirectTo && redirectTo.startsWith('/admin')) {
      await navigateTo(redirectTo)
    } else {
      await navigateTo("/admin/dashboard")
    }
  } catch (error) {
    console.error('Login error:', error)

    toast.add({
      severity: "error",
      summary: "Login Failed",
      detail: error.message || "Invalid credentials",
      life: 3000,
    });
    applyShake();
  } finally {
    // Always hide loading
    isLoading.value = false
    classicLoader.hide()
  }
}

</script>

