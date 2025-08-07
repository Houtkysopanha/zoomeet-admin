<template>
  <div class=" w-[35rem] p-4">
    <div class="mx-auto">
      <div class="text-center mb-8">
        <img :src="logo" alt="Logo" class=" w-80 h-auto mx-auto mb-4 filter drop-shadow-lg" />
      </div>
      <div ref="formRef" class="bg-gray-800 rounded-2xl text-center shadow-2xl p-8 space-y-6 border border-gray-700">
        <h2 class="text-3xl font-extrabold text-white">Admin Portal</h2>
        <p class="text-gray-400 mt-1 text-base">Sign in to manage your account</p>
        
        <div class="border-t border-gray-700"></div>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label for="username" class="text-base font-medium text-gray-300 mb-2 flex items-center">
              <i class="pi pi-user mr-3 text-purple-400 text-lg"></i>
              Username
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
              <i class="pi pi-lock mr-3 text-purple-400 text-lg"></i>
              Password
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
            <i class="pi pi-sign-in mr-3 text-xl"></i>
            Sign In
          </button>
        </form>

        <div class="mt-6 p-4 text-start bg-gray-700 rounded-lg border border-gray-600">
          <p class="text-base text-gray-200 font-medium mb-2 flex items-center">
            <i class="pi pi-info-circle mr-3 text-purple-400 text-lg"></i>
            Demo Credentials:
          </p>
          <p class="text-sm text-gray-300">
            <strong>Username:</strong> admin<br />
            <strong>Password:</strong> Welcome.1#!
          </p>
        </div>
      </div>
      <Toast />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { login } from '@/composables/api';
import { useRouter } from "vue-router";
import { useMotion } from "@vueuse/motion";
import { useToast } from "primevue/usetoast";
import Toast from 'primevue/toast'; // Ensure Toast component is imported
import logo from '@/assets/image/logo.png';
import { definePageMeta } from '#imports';

definePageMeta({
  layout: "default"
});

const username = ref("");
const password = ref("");
const router = useRouter();
const formRef = ref(null);
const toast = useToast();

async function handleLogin() {
  try {
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
  }
}
</script>