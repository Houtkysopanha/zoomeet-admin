<template>
  <div class="grid grid-cols-2 container">
    <div class="w-full">
      <img
          src="../assets/image/eticketsasia.png"
          class="w-30 sm:w-60 lg:w-45 h-auto mb-4 filter drop-shadow-lg"
        />
        <div class="justify-start text-neutral-800 text-2xl leading-10">Manage your events, ticketing and <br/>reporting in one place</div>
        <div class="grid grid-cols-2 gap-15 py-5">
        <div class="relative">
          <div class="w-72 absolute px-6 py-4 bg-white shadow-sm rounded-2xl z-10  gap-2.5">
            <div class="flex items-center gap-5 relative z-1">
              <img src="../assets/image/Group 228.png" alt="" class="w-12">
              <div class="text-center justify-start text-violet-700 text-xl font-bold leading-7">Event Service</div>            
            </div>            
              <div class="justify-start text-neutral-400 text-base font-normal leading-normal py-2">
                Create and manage events with <br/>customizable options
              </div>
          </div>
          <div class="absolute bottom-1 w-40 h-10 px-6 py-4 opacity-60 bg-violet-700 rounded-2xl blur-[32px] inline-flex flex-col justify-center items-center gap-2.5">
            <div class="flex-1 flex flex-col justify-start items-start gap-6">
              <div class="w-40 h-16"></div>
            </div>
          </div>
        </div>
        <div class="relative">
          <div class="w-72 absolute px-6 py-4 bg-white shadow-sm rounded-2xl z-10  gap-2.5">
            <div class="flex items-center gap-5 relative z-1">
              <img src="../assets/image/Group 228.png" alt="" class="w-12">
              <div class="text-center justify-start text-violet-700 text-xl font-bold leading-7">Event Service</div>            
            </div>            
              <div class="justify-start text-neutral-400 text-base font-normal leading-normal py-2">
                Create and manage events with <br/>customizable options
              </div>
          </div>
          <div class="absolute bottom-0 w-40 h-10 px-6 py-4 opacity-60 bg-violet-700 rounded-2xl blur-[32px] inline-flex flex-col justify-center items-center gap-2.5">
            <div class="flex-1 flex flex-col justify-start items-start gap-6">
              <div class="w-40 h-16"></div>
            </div>
          </div>
        </div>
        
            <!-- <div class="w-72 px-6 py-4 bg-white rounded-2xl inline-flex flex-col gap-2.5">
              <div class="flex items-center gap-5">
                <img src="../assets/image/Group 228 (1).png" alt="" class="w-12">
                <div class="text-center justify-start text-violet-700 text-xl font-bold leading-7">Booking Service</div>            </div>            
                <div class="justify-start text-neutral-400 text-base font-normal leading-normal py-2">
                  Simplify ticket reservations and <br/>secure payments</div>
            </div>
            <div class="w-72 px-6 py-2 bg-white rounded-2xl inline-flex flex-col  gap-2.5">
              <div class="flex items-center gap-5">
                <img src="../assets/image/Group 228 (2).png" alt="" class="w-12">
                <div class="text-center justify-start text-violet-700 text-xl font-bold leading-7">Check-in Service</div>            </div>            
                <div class="justify-start text-neutral-400 text-base font-normal leading-normal py-2">
                  Fast and seamless attendee <br/>check-in at events
            </div>
          </div>
          <div class="w-72 px-6 py-2 bg-white rounded-2xl inline-flex flex-col gap-2.5">
            <div class="flex items-center gap-5">
              <img src="../assets/image/Group 228 (3).png" alt="" class="w-12">
              <div class="text-center justify-start text-violet-700 text-xl font-bold leading-7">Report</div>            </div>            
              <div class="justify-start text-neutral-400 text-base font-normal leading-normal py-2">
                Track sales, attendance, and <br/>performance insights</div>
          </div> -->
        </div>
    </div>
    <div>h</div>
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
    const identifier = currentTab.value === 'username-password' ? username.value : username.value
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

