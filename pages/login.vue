<template>
  <div class=" flex items-center justify-center p-4 bg-cover bg-center" :style="{ backgroundImage: `url(${abstractPattern})` }">
    <div class="w-[600px] mx-auto">
      <div class="text-center mb-8">
        <img :src="logo1" alt="Logo" class="w-96 h-auto mx-auto mb-4 filter drop-shadow-lg" />
      </div>

      <div ref="formRef" class="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl text-center shadow-2xl p-8 space-y-6 border border-gray-700 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-fuchsia-900/20 opacity-30 pointer-events-none"></div>
        <h2 class="text-3xl font-extrabold text-white relative z-10">Admin Portal</h2>
        <p class="text-gray-400 mt-1 text-base relative z-10">Sign in to manage your account</p>

        <div class="border-t border-gray-700 relative z-10"></div>

        <!-- Tab Navigation -->
        <div class="flex justify-center space-x-4 mb-6 relative z-10">
          <button
            @click="currentTab = 'username-password'"
            :class="{
              'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white': currentTab === 'username-password',
              'bg-gray-700 text-gray-300 hover:bg-gray-600': currentTab !== 'username-password'
            }"
            class="py-2 px-6 rounded-full font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            aria-controls="username-password-form"
            :aria-selected="currentTab === 'username-password'"
            role="tab"
          >
            <i class="pi pi-user mr-2"></i> Username/Password
          </button>
          <button
            @click="currentTab = 'phone-number'"
            :class="{
              'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white': currentTab === 'phone-number',
              'bg-gray-700 text-gray-300 hover:bg-gray-600': currentTab !== 'phone-number'
            }"
            class="py-2 px-6 rounded-full font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            aria-controls="phone-number-form"
            :aria-selected="currentTab === 'phone-number'"
            role="tab"
          >
            <i class="pi pi-phone mr-2"></i> Phone Number
          </button>
        </div>

        <!-- Username/Password Form -->
        <form v-if="currentTab === 'username-password'" @submit.prevent="handleLogin" class="space-y-5 relative z-10" id="username-password-form" role="tabpanel">
          <div>
            <label for="username" class="text-base font-medium text-gray-300 mb-2 flex items-center">
              <i class="pi pi-user mr-3 text-purple-400 text-lg"></i> Username
            </label>
            <input
              id="username"
              v-model="username"
              type="text"
              required
              class="w-full px-4 py-3 text-base bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 placeholder-gray-400"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label for="password" class="text-base font-medium text-gray-300 mb-2 flex items-center">
              <i class="pi pi-lock mr-3 text-purple-400 text-lg"></i> Password
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="w-full px-4 py-3 text-base bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 placeholder-gray-400"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            class="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-fuchsia-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 font-semibold flex items-center justify-center text-lg shadow-lg"
          >
            <i class="pi pi-sign-in mr-3 text-xl"></i> Sign In
          </button>
        </form>

        <!-- Phone Number Form -->
        <form v-else-if="currentTab === 'phone-number'" @submit.prevent="handlePhoneLogin" class="space-y-5 relative z-10" id="phone-number-form" role="tabpanel">
          <div>
            <label for="phone-number" class="text-base font-medium text-gray-300 mb-2 flex items-center">
              <i class="pi pi-phone mr-3 text-purple-400 text-lg"></i> Phone Number
            </label>
            <input
              id="phone-number"
              v-model="phoneNumber"
              type="tel"
              required
              class="w-full px-4 py-3 text-base bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 placeholder-gray-400"
              placeholder="Enter your phone number"
            />
          </div>
          <button
            type="submit"
            class="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-fuchsia-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 font-semibold flex items-center justify-center text-lg shadow-lg"
          >
            <i class="pi pi-sign-in mr-3 text-xl"></i> Sign In with Phone
          </button>
        </form>

        <div class="mt-6 p-4 text-start bg-gray-700 rounded-lg border border-gray-600 relative z-10">
          <p class="text-base text-gray-200 font-medium mb-2 flex items-center">
            <i class="pi pi-info-circle mr-3 text-purple-400 text-lg"></i> Demo Credentials:
          </p>
          <p class="text-sm text-gray-300">
            <strong>Username:</strong> admin<br />
            <strong>Password:</strong> Welcome.1#!
          </p>
          <p class="text-sm text-gray-300 mt-2">
            <strong>Phone (any):</strong> 123-456-7890
          </p>
        </div>
      </div>

      <Toast />
    </div>
  </div>
  
</template>

<script setup>
import { ref } from "vue";
import { login } from '@/composables/api'; // Assuming this composable exists
import { useRouter } from "vue-router";
import { useMotion } from "@vueuse/motion";
import { useToast } from "primevue/usetoast";
import Toast from 'primevue/toast';

// Import images
import logo1 from '@/assets/image/eticketsasia.png';
// import abstractPattern from '@/public/images/abstract-pattern.png'; 

definePageMeta({
  layout: "default",
  // middleware: 'auth'
});

const username = ref("");
const password = ref("");
const phoneNumber = ref("");
const currentTab = ref("username-password"); // 'username-password' or 'phone-number'

const router = useRouter();
const formRef = ref(null);
const toast = useToast();

const applyShake = () => {
  if (formRef.value) {
    const { apply } = useMotion(formRef);
    apply({
      initial: { x: 0 },
      shake: {
        x: [-10, 10, -8, 8, -6, 6, -4, 4, 0],
        transition: {
          duration: 500,
          ease: "easeInOut",
        },
      },
    });
    apply("shake");
  }
};

async function handleLogin() {
  try {
    // Use your existing login composable
    const data = await login(username.value, password.value); 
    localStorage.setItem("auth", "true");
    toast.add({
      severity: "success",
      summary: "Login Success",
      detail: "Welcome, Admin!",
      life: 3000,
    });
    setTimeout(() => {
      router.push("/admin/dashboard");
    }, 1000);
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Login Failed",
      detail: error.message || "Invalid credentials",
      life: 3000,
    });
    applyShake();
  }
}

async function handlePhoneLogin() {
  try {
    if (phoneNumber.value.length < 10) {
      throw new Error("Please enter a valid phone number.");
    }
    // Simulate API response for phone login
    const { setAuth } = useAuth();
    const data = { token: 'phone-token', role: 'admin', phone: phoneNumber.value };
    setAuth(data);
    toast.add({
      severity: "success",
      summary: "Phone Login Success",
      detail: `Welcome, user with phone ${phoneNumber.value}!`,
      life: 2000,
    });
    await navigateTo("/admin/dashboard");
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Phone Login Failed",
      detail: error.message || "Invalid phone number or OTP",
      life: 3000,
    });
    applyShake();
  }
}
</script>

<style scoped>
/* Add any custom styles here if needed, though Tailwind should cover most */
</style>
