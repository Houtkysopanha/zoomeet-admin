<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-2 sm:p-4">

    <!-- Enhanced responsive container with better breakpoints and animations -->
    <div 
      ref="containerRef"
      class="w-full max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden"
    >
      
      <!-- Enhanced left panel with better responsive behavior -->
      <div class="p-4 sm:p-6 lg:p-8 xl:p-12 bg-gradient-to-br from-gray-50 to-gray-100 hidden lg:flex flex-col justify-between">
        <div>
          <div ref="logoRef" class="mb-8 lg:mb-10">
            <img :src="logo" alt="etickets.asia Logo" class="h-auto w-auto mb-4 lg:mb-6" />
            <h1 class="text-2xl lg:text-3xl font-bold text-gray-800 leading-tight">
              Manage your events, ticketing and reporting in one place
            </h1>
          </div>

          <!-- Enhanced grid with staggered animations -->
          <div ref="cardsRef" class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div 
              v-for="(card, index) in serviceCards" 
              :key="index"
              :ref="el => cardRefs[index] = el"
              class="bg-white p-4 lg:p-6 rounded-lg border border-gray-200 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 shadow-lg shadow-purple-600/10 hover:shadow-purple-600/25 cursor-pointer group"
            >
              <NuxtIcon :name="card.icon" class="text-xl lg:text-2xl text-purple-600 mb-3 group-hover:scale-110 transition-transform duration-300" />
              <h3 class="font-semibold text-gray-700 mb-2">{{ card.title }}</h3>
              <p class="text-xs lg:text-sm text-gray-500">{{ card.description }}</p>
            </div>
          </div>

          <div ref="supportRef" class="mt-8 lg:mt-10">
            <p class="text-xs lg:text-sm text-center text-gray-600 mb-4">
              If you have any questions, please contact our support
            </p>
            <p class="text-xs lg:text-sm text-center text-gray-600">
              team via <a href="mailto:info@etickets.asia" class="font-semibold text-purple-600 hover:underline transition-colors duration-200">info@etickets.asia</a>
            </p>
          </div>
        </div>
      </div>

      <!-- Enhanced form section with better responsive padding and animations -->
      <div ref="formRef" class="p-4 sm:p-6 lg:p-8 xl:p-12 w-full flex flex-col justify-center">
        <div class="w-full max-w-md mx-auto lg:max-w-none">
          <!-- Enhanced header with animation -->
          <div ref="headerRef" class="mb-6 lg:mb-8">
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Login to your account</h2>
            <!-- Mobile logo for small screens -->
            <div class="lg:hidden mb-4">
              <img :src="logo" alt="etickets.asia Logo" class="h-12 w-auto" />
            </div>
          </div>
        
          <!-- Enhanced tabs with better mobile spacing -->
          <div ref="tabsRef" class="flex border-b border-gray-200 mb-6">
            <button
              @click="currentTab = 'phone'" 
              :class="[
                'py-2 px-1 mr-4 sm:mr-6 text-sm font-semibold transition-all duration-300 transform hover:scale-105',
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
                'py-2 px-1 text-sm font-semibold transition-all duration-300 transform hover:scale-105',
                currentTab === 'email' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'
              ]"
              role="tab"
              :aria-selected="currentTab === 'email'"
            >
              Email
            </button>
          </div>
          
          <!-- Enhanced form with better spacing and animations -->
          <form @submit.prevent="handleLogin" class="space-y-4 sm:space-y-6">
            <div v-if="currentTab === 'phone'" ref="phoneFieldRef">
              <label for="phone-number" class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div class="flex items-center">
                <div class="flex items-center border border-r-0 border-gray-300 rounded-l-md bg-gray-50 px-2 sm:px-3 py-2 text-sm text-gray-600">
                  <NuxtIcon name="twemoji:flag-cambodia" class="mr-1 sm:mr-2" />
                  <span class="text-xs sm:text-sm">+855</span>
                </div>
                <input
                  id="phone-number"
                  v-model="phoneNumber"
                  type="text"
                  required
                  class="w-full px-2 sm:px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-r-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder="12 345 678"
                />
              </div>
            </div>
            
            <div v-if="currentTab === 'email'" ref="emailFieldRef">
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="email"
                v-model="email"
                type="text"
                required
                class="w-full px-2 sm:px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                placeholder="you@example.com"
              />
            </div>

            <div ref="passwordFieldRef">
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div class="relative">
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  class="w-full px-2 sm:px-3 py-2 pr-10 text-sm text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  @click="togglePasswordVisibility"
                  class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none transition-all duration-200 hover:scale-110"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                >
                  <Icon
                    :name="showPassword ? 'heroicons:eye-slash-20-solid' : 'heroicons:eye-20-solid'"
                    class="h-4 w-4 sm:h-5 sm:w-5"
                  />
                </button>
              </div>
            </div>
            
            <!-- Enhanced options with better mobile layout -->
            <div ref="optionsRef" class="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm space-y-2 sm:space-y-0">
              <div class="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded transition-all duration-200">
                <label for="remember-me" class="ml-2 block text-gray-900">Remember me</label>
              </div>
              <a href="#" class="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200 hover:underline">Forgot password?</a>
            </div>

            <!-- Enhanced submit button with better animations -->
            <button
              ref="submitButtonRef"
              type="submit"
              :disabled="isLoading"
              :class="[
                'w-full py-2.5 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300 font-semibold flex items-center justify-center text-base shadow-lg text-white transform hover:scale-[1.02] active:scale-[0.98]',
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:from-purple-700 hover:to-fuchsia-600 hover:shadow-xl'
              ]"
            >
              <LoadingSpinner v-if="isLoading" size="sm" color="white" :showText="false" class="mr-2" />
              {{ isLoading ? 'Logging In...' : 'Login' }}
            </button>

            <!-- Enhanced footer links with better spacing -->
            <div ref="footerRef" class="text-center text-sm space-y-3">
              <p class="text-gray-600">
                Don't have an account? 
                <a href="#" class="font-medium text-purple-600 hover:underline transition-colors duration-200">Sign up</a>
              </p>
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
import { ref, onMounted, nextTick } from "vue";
import { useMotion } from "@vueuse/motion";
import { useToast } from "primevue/usetoast";
import { Icon } from '#components';
import Toast from 'primevue/toast';
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue';
import { classicLoader } from '~/composables/useClassicLoader.js';
import { login } from '@/composables/api';
import logo from '@/assets/image/finalize-logo.jpg';
import { definePageMeta } from '#app';
import { useRoute } from '#app';
import { useAuth } from '~/composables/useAuth';
import { navigateTo } from '#app';

definePageMeta({
  layout: "default",
});

const email = ref("");
const phoneNumber = ref(""); 
const password = ref("");
const currentTab = ref("phone");
const isLoading = ref(false);
const formRef = ref(null);
const showPassword = ref(false);

const toast = useToast();
const route = useRoute();
const { setAuth, getToken } = useAuth();

const { apply: applyMotion, set: setMotion } = useMotion(formRef, {
  initial: { x: 0 },
  shake: {
    x: [-10, 10, -8, 8, -6, 6, -4, 4, 0],
    transition: { duration: 0.5, ease: "easeInOut" },
  },
});

const serviceCards = [
  {
    icon: "ep:checked",
    title: "Event Service",
    description: "Create and manage events with customizable options"
  },
  {
    icon: "fluent:ticket-diagonal-28-filled", 
    title: "Booking Service",
    description: "Simplify ticket reservations and secure payments"
  },
  {
    icon: "icon-park-solid:check-one",
    title: "Check-in Service", 
    description: "Fast and seamless attendee check-in at events"
  },
  {
    icon: "mdi:chart-bar",
    title: "Report",
    description: "Track sales, attendance, and performance insights"
  }
];

const containerRef = ref(null);
const logoRef = ref(null);
const cardsRef = ref(null);
const cardRefs = ref([]);
const supportRef = ref(null);
const headerRef = ref(null);
const tabsRef = ref(null);
const phoneFieldRef = ref(null);
const emailFieldRef = ref(null);
const passwordFieldRef = ref(null);
const optionsRef = ref(null);
const submitButtonRef = ref(null);
const footerRef = ref(null);

const { apply: applyContainerMotion } = useMotion(containerRef, {
  initial: { opacity: 0, scale: 0.95 },
  enter: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  }
});

const { apply: applyFormMotion, set: setFormMotion } = useMotion(formRef, {
  initial: { x: 0 },
  shake: {
    x: [-10, 10, -8, 8, -6, 6, -4, 4, 0],
    transition: { duration: 0.5, ease: "easeInOut" },
  },
  enter: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, delay: 0.2 }
  }
});

onMounted(async () => {
  setFormMotion("initial");
  
  // Container entrance
  await nextTick();
  applyContainerMotion("enter");
  
  // Staggered card animations
  cardRefs.value.forEach((card, index) => {
    if (card) {
      const { apply } = useMotion(card, {
        initial: { opacity: 0, y: 20 },
        enter: { 
          opacity: 1, 
          y: 0,
          transition: { 
            duration: 0.4, 
            delay: 0.1 * index,
            ease: "easeOut" 
          }
        }
      });
      setTimeout(() => apply("enter"), 300 + (index * 100));
    }
  });
  
  // Form elements staggered animation
  const formElements = [headerRef, tabsRef, phoneFieldRef, emailFieldRef, passwordFieldRef, optionsRef, submitButtonRef, footerRef];
  formElements.forEach((elementRef, index) => {
    if (elementRef.value) {
      const { apply } = useMotion(elementRef, {
        initial: { opacity: 0, y: 10 },
        enter: { 
          opacity: 1, 
          y: 0,
          transition: { 
            duration: 0.3, 
            delay: 0.05 * index,
            ease: "easeOut" 
          }
        }
      });
      setTimeout(() => apply("enter"), 400 + (index * 50));
    }
  });
});

const applyShake = () => {
  if (formRef.value) {
    applyMotion("shake");
  }
};

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

async function handleLogin() {
  try {
    isLoading.value = true;
    classicLoader.show('Connecting to server...', [
      'Connecting to server',
      'Authenticating credentials',
      'Loading dashboard'
    ]);
    const identifier = currentTab.value === 'email' ? email.value : phoneNumber.value;
    if (!identifier || !password.value) {
      throw new Error('Please fill in all required fields');
    }
    await new Promise(resolve => setTimeout(resolve, 500));
    classicLoader.updateProgress(25, 'Authenticating credentials...');
    const data = await login(identifier, password.value);
    classicLoader.updateProgress(60, 'Verifying account...');
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
      throw new Error('Invalid server response. Missing access token.');
    }
    const user = {
      username: identifier,
      message: data.message || 'Login successful',
      loginTime: new Date().toISOString(),
      ...userData
    };
    if (!token) {
      throw new Error("Missing access token in login response. Please check your credentials.");
    }
    classicLoader.updateProgress(85, 'Loading dashboard...');
    setAuth({ token, user });
    const savedToken = getToken();
    if (!savedToken) {
      throw new Error('Failed to save authentication token');
    }
    classicLoader.updateProgress(100, 'Complete!');
    toast.add({
      severity: "success",
      summary: "Login Success",
      detail: "Welcome!",
      life: 2000,
    });
    await new Promise(resolve => setTimeout(resolve, 500));
    const redirectTo = route.query.redirect;
    if (redirectTo && redirectTo.startsWith('/admin')) {
      await navigateTo(redirectTo);
    } else {
      await navigateTo("/admin/dashboard");
    }
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Login Failed",
      detail: error.message || "Invalid credentials",
      life: 3000,
    });
    applyShake();
  } finally {
    isLoading.value = false;
    classicLoader.hide();
  }
}
</script>
