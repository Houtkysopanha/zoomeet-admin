<template>
  <div class="min-h-screen bg-gray-100/50 flex items-center justify-center p-4">

    <div class="w-full max-w-full h-full  mx-auto grid grid-cols-1 lg:grid-cols-2 bg-white rounded-2xl   overflow-hidden">
      
      <div class="p-8 lg:p-12 bg-gray-100/50 hidden lg:flex flex-col justify-between">
        <div>
          <div class="mb-10">
            <img :src="logo" alt="etickets.asia Logo" class=" h-auto w-auto mb-6" />
            <h1 class="text-3xl font-bold text-gray-800">
              Manage your events, ticketing and reporting in one place
            </h1>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div class="bg-white p-4 rounded-lg border border-gray-200 transition hover:shadow-xl hover:-translate-y-1 shadow-lg shadow-purple-600/20">
              <Icon name="ep:checked" class="text-xl text-purple-600 mb-2" />
              <h3 class="font-semibold text-gray-700">Event Service</h3>
              <p class="text-sm text-gray-500 mt-1">Create and manage events with customizable options</p>
            </div>
            <div class="bg-white p-4 rounded-lg border border-gray-200 transition hover:shadow-xl hover:-translate-y-1 shadow-lg shadow-purple-600/20">
              <Icon name="fluent:ticket-diagonal-28-filled" class="text-xl text-purple-600 mb-2" />
              <h3 class="font-semibold text-gray-700">Booking Service</h3>
              <p class="text-sm text-gray-500 mt-1">Simplify ticket reservations and secure payments</p>
            </div>
            <div class="bg-white p-4 rounded-lg border border-gray-200 transition hover:shadow-xl hover:-translate-y-1 shadow-lg shadow-purple-600/20">
               <Icon name="icon-park-solid:check-one" class="text-xl text-purple-600 mb-2" />
              <h3 class="font-semibold text-gray-700">Check-in Service</h3>
              <p class="text-sm text-gray-500 mt-1">Fast and seamless attendee check-in at events</p>
            </div>
            <div class="bg-white p-4 rounded-lg border border-gray-200 transition hover:shadow-xl hover:-translate-y-1 shadow-lg shadow-purple-600/20">
               <Icon name="mdi:chart-bar" class="text-xl text-purple-600 mb-2" />
              <h3 class="font-semibold text-gray-700">Report</h3>
              <p class="text-sm text-gray-500 mt-1">Track sales, attendance, and performance insights</p>
            </div>
          </div>
            <div class="mt-10 mx-auto">
          <p class="text-sm text-center text-gray-600 mx-auto mb-4">
            If you have any questions, please contact our support <br>
          </p>
          <p class="text-sm text-center text-gray-600 mx-auto ">team via <a href="mailto:info@etickets.asia" class="font-semibold text-purple-600 hover:underline">info@etickets.asia</a></p>
        </div>
        </div>

      </div>

      <div ref="formRef" class="p-8 lg:p-12 w-full flex flex-col justify-center rounded-2xl">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Login to your account</h2>
        
          <div class="flex border-b border-gray-200 mb-6">
            <button
              @click="currentTab = 'phone'" 
              :class="[
                'py-2 px-1 mr-6 text-sm font-semibold transition-colors duration-200',
                currentTab === 'phone' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'
              ]"
              role="tab"
              :aria-selected="currentTab === 'phone'"
            >
              Phone Number
            </button>
            <button
              @click="currentTab = 'email'"
              :class="[
                'py-2 px-1 text-sm font-semibold transition-colors duration-200',
                currentTab === 'email' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'
              ]"
              role="tab"
              :aria-selected="currentTab === 'email'"
            >
              Email
            </button>
          </div>
          
          <form @submit.prevent="handleLogin" class="space-y-6">
            <div v-if="currentTab === 'phone'">
              <label for="phone-number" class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div class="flex items-center">
                <div class="flex items-center border border-r-0 border-gray-300 rounded-l-md bg-gray-50 px-3 py-2 text-sm text-gray-600">
                  <Icon name="twemoji:flag-cambodia" class="mr-2" />
                  <span>+855</span>
                </div>
                <input
                  id="phone-number"
                  v-model="phoneNumber"
                  type="text"
                  required
                  class="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-r-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="12 345 678"
                />
              </div>
            </div>
            
            <div v-if="currentTab === 'email'">
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="email"
                v-model="email"
                type="text"
                required
                class="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                id="password"
                v-model="password"
                type="password"
                required
                class="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter password"
              />
            </div>
            
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded">
                <label for="remember-me" class="ml-2 block text-gray-900">Remember me</label>
              </div>
              <a href="#" class="font-medium text-purple-600 hover:text-purple-500">Forgot password?</a>
            </div>

            <button
              type="submit"
              :disabled="isLoading"
              :class="[
                'w-full py-2.5 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 font-semibold flex items-center justify-center text-base shadow-lg text-white',
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:from-purple-700 hover:to-fuchsia-600'
              ]"
            >
              <LoadingSpinner v-if="isLoading" size="sm" color="white" :showText="false" class="mr-2" />
              {{ isLoading ? 'Logging In...' : 'Login' }}
            </button>

            <div class="text-center text-sm">
              <p class="text-gray-600">
                Don't have an account? 
                <a href="#" class="font-medium text-purple-600 hover:underline">Sign up</a>
              </p>
            </div>
            
            <div class="text-center">
              <p class="text-xs text-gray-400">Copyright ©2025 by etickets.asia</p>
            </div>
          </form>
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
import { Icon } from '#components';

// Use a placeholder or your actual logo path
import logo from '@/assets/image/finalize-logo.jpg'; // UPDATE THIS PATH

definePageMeta({
  layout: "default",
});

// Your script block remains the same, no changes needed here.
const email = ref("");
const phoneNumber = ref(""); 
const password = ref("");
const currentTab = ref("phone");
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
    isLoading.value = true
    classicLoader.show('Connecting to server...', [
      'Connecting to server',
      'Authenticating credentials',
      'Loading dashboard'
    ])
    const identifier = currentTab.value === 'email' ? email.value : phoneNumber.value;
    console.log('🔑 Login attempt:', { 
      identifier: identifier,
      method: currentTab.value 
    })
    if (!identifier || !password.value) {
      throw new Error('Please fill in all required fields')
    }
    await new Promise(resolve => setTimeout(resolve, 500))
    classicLoader.updateProgress(25, 'Authenticating credentials...')
    const data = await login(identifier, password.value)
    console.log('📥 Login response received:', data)
    classicLoader.updateProgress(60, 'Verifying account...')
    let token = null;
    let userData = {};
    if (data?.tokens?.access_token) {
      token = data.tokens.access_token;
      userData = data.user || {};
    } else if (data?.access_token) {
      token = data.access_token;
      userData = data.user || {};
    } else if (data?.token) {
      token = data.token;
      userData = data.user || {};
    } else {
      console.error('❌ Invalid login response structure:', data)
      throw new Error('Invalid server response. Missing access token.')
    }
    const user = {
      username: identifier,
      message: data.message || 'Login successful',
      loginTime: new Date().toISOString(),
      ...userData
    }
    if (!token) {
      console.error('No token found in response structure:', data)
      throw new Error("Missing access token in login response. Please check your credentials.");
    }
    classicLoader.updateProgress(85, 'Loading dashboard...')
    const { setAuth, getToken } = useAuth();
    setAuth({ token, user });
    const savedToken = getToken();
    if (!savedToken) {
      throw new Error('Failed to save authentication token');
    }
    console.log('✅ Authentication successful:', { 
      savedTokenLength: savedToken.length,
      user: { ...user, token: '[REDACTED]' }
    });
    classicLoader.updateProgress(100, 'Complete!')
    toast.add({
      severity: "success",
      summary: "Login Success",
      detail: "Welcome!",
      life: 2000,
    });
    await new Promise(resolve => setTimeout(resolve, 500))
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
    isLoading.value = false
    classicLoader.hide()
  }
}
</script>