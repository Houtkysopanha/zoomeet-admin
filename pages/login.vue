<template>
  <div class="grid grid-cols-2 container py-6 gap-20">
    <div class="w-full ">
      <img
          src="../assets/image/finalize-logo.jpg"
          class="w-30 sm:w-60 lg:w-45 h-auto mb-4 filter drop-shadow-lg"
        />
        <div class="justify-start text-neutral-800 text-2xl leading-10">Manage your events, ticketing and <br/>reporting in one place</div>
      <div class="grid grid-cols-2 gap-15 py-5">
        <div class="relative">
          <div class="w-72 absolute px-6 py-4 bg-white shadow-sm rounded-2xl z-10  gap-2.5">
            <div class="flex items-center gap-5 relative z-1">
              <img src="../assets/image/event-store.png" alt="" class="w-12">
              <div class="text-center justify-start text-violet-700 text-xl font-bold leading-7">Event Service</div>            
            </div>            
              <div class="justify-start text-neutral-400 text-base font-normal leading-normal py-2">
                Create and manage events with <br/>customizable options
              </div>
          </div>
          <div class="absolute top-[120px] left-[-10px] w-40 h-10 px-6 py-4 opacity-60 bg-violet-700 rounded-2xl blur-[32px] inline-flex flex-col justify-center items-center gap-2.5">
            <div class="flex-1 flex flex-col justify-start items-start gap-6">
              <div class="w-40 h-16"></div>
            </div>
          </div>
        </div>
        <div class="relative">
          <div class="w-72 absolute px-6 py-4 bg-white shadow-sm rounded-2xl z-10  gap-2.5">
            <div class="flex items-center gap-5 relative z-1">
              <img src="../assets/image/Booking.png" alt="" class="w-12">
              <div class="text-center justify-start text-violet-700 text-xl font-bold leading-7">Booking Service</div>            
            </div>            
              <div class="justify-start text-neutral-400 text-base font-normal leading-normal py-2">
                 Simplify ticket reservations and <br/>secure payments
              </div>
          </div>
          <div class="absolute top-[120px] left-[-10px] w-40 h-10 px-6 py-4 opacity-60 bg-violet-700 rounded-2xl blur-[32px] inline-flex flex-col justify-center items-center gap-2.5">
            <div class="flex-1 flex flex-col justify-start items-start gap-6">
              <div class="w-40 h-16"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-15" style="padding-top: 200px;">
        <div class="relative">
          <div class="w-72 absolute px-6 py-4 bg-white shadow-sm rounded-2xl z-10  gap-2.5">
            <div class="flex items-center gap-5 relative z-1">
              <img src="../assets/image/checking-service.png" alt="" class="w-12">
              <div class="text-center justify-start text-violet-700 text-xl font-bold leading-7">Event Service</div>            
            </div>            
              <div class="justify-start text-neutral-400 text-base font-normal leading-normal py-2">
                Create and manage events with <br/>customizable options
              </div>
          </div>
          <div class="absolute top-[120px] left-[-10px] w-40 h-10 px-6 py-4 opacity-60 bg-violet-700 rounded-2xl blur-[32px] inline-flex flex-col justify-center items-center gap-2.5">
            <div class="flex-1 flex flex-col justify-start items-start gap-6">
              <div class="w-40 h-16"></div>
            </div>
          </div>
        </div>
        <div class="relative">
          <div class="w-72 absolute px-6 py-4 bg-white shadow-sm rounded-2xl z-10  gap-2.5">
            <div class="flex items-center gap-5 relative z-1">
              <img src="../assets/image/report.png" alt="" class="w-12">
              <div class="text-center justify-start text-violet-700 text-xl font-bold leading-7">Booking Service</div>            
            </div>            
              <div class="justify-start text-neutral-400 text-base font-normal leading-normal py-2">
                 Simplify ticket reservations and <br/>secure payments
              </div>
          </div>
          <div class="absolute top-[120px] left-[-10px] w-40 h-10 px-6 py-4 opacity-60 bg-violet-700 rounded-2xl blur-[32px] inline-flex flex-col justify-center items-center gap-2.5">
            <div class="flex-1 flex flex-col justify-start items-start gap-6">
              <div class="w-40 h-16"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="w-full flex justify-center py-5 px-15">
      <div class="w-full p-5 bg-white rounded-[20px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.03)]">
        <div class="justify-start text-neutral-800 text-2xl leading-10">Login to your account</div>
          <div class=" mb-6 grid grid-cols-2 py-5">
            <button
              @click="currentTab = 'phone'" 
              :class="[
                'py-2 px-1 mr-6 font-semibold transition-colors duration-200 self-stretch text-center justify-start text-lg leading-loose',
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
                'py-2 px-1 mr-6 font-semibold transition-colors duration-200 self-stretch text-center justify-start text-lg leading-loose',
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
              <PhoneNumber v-model="phoneNumber"/>
            </div>
            
            <div v-if="currentTab === 'email'">
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="email"
                v-model="email"
                type="text"
                required
                class="w-full p-4 text-sm text-gray-900 bg-neutral-100  rounded-lg"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label for="password" class="self-stretch justify-start text-zinc-800 text-md mb-3 font-normal leading-7">Password</label>
              <input
                id="password"
                v-model="password"
                type="password"
                required
                class="w-full text-sm border-0 bg-neutral-100 text-gray-900 p-4 rounded-lg focus:ring-0"
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
import PhoneNumber from "~/components/PhoneNumber.vue";
definePageMeta({
  layout: "default",
});

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
    const identifier = currentTab.value === 'email' ? email.value : phoneNumber.value.replace(/^\+/, '');
    if (!identifier || !password.value) {
      throw new Error('Please fill in all required fields')
    }
    await new Promise(resolve => setTimeout(resolve, 500))
    classicLoader.updateProgress(25, 'Authenticating credentials...')
    const data = await login(identifier, password.value)
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
      throw new Error('Invalid server response. Missing access token.')
    }
    const user = {
      username: identifier,
      message: data.message || 'Login successful',
      loginTime: new Date().toISOString(),
      ...userData
    }
    if (!token) {
      throw new Error("Missing access token in login response. Please check your credentials.");
    }
    classicLoader.updateProgress(85, 'Loading dashboard...')
    const { setAuth, getToken } = useAuth();
    setAuth({ token, user });
    const savedToken = getToken();
    if (!savedToken) {
      throw new Error('Failed to save authentication token');
    }
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