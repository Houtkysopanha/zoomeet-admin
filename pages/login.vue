<template>
  <div class="w-full max-w-md mx-auto">
   <div class="text-center mb-6">
        <img :src="logo" alt="Logo" class=" w-72 h-auto mx-auto mb-4" />
      </div>

      <div ref="formRef" class="bg-white rounded-xl text-center shadow-2xl p-5 space-y-5">
         <h2 class="text-2xl font-extrabold text-gray-900">Admin Portal</h2>
        <p class="text-gray-500 mt-1 text-sm">Sign in to manage your account</p>
          <div class="border border-gray-500"></div>
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label for="username" class="text-sm font-medium text-gray-700 mb-4 flex items-center">
              <i class="pi pi-user mr-2 text-indigo-600"></i>
              Username
            </label>
            <input
              id="username"
              v-model="username"
              type="text"
              required
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label for="password" class="text-sm font-medium text-gray-700 mb-4 flex items-center">
              <i class="pi pi-lock mr-2 text-indigo-600"></i>
              Password
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            class="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors font-medium flex items-center justify-center text-sm"
          >
            <i class="pi pi-sign-in mr-2"></i>
            Sign In
          </button>
        </form>

        <div class="mt-4 p-3 text-start bg-blue-50 rounded-lg border border-blue-200">
          <p class="text-sm text-blue-800 font-medium mb-1 flex items-center">
            <i class="pi pi-info-circle mr-2"></i>
            Demo Credentials:
          </p>
          <p class="text-sm text-blue-700">
            <strong>Username:</strong> admin<br />
            <strong>Password:</strong> admin
          </p>
        </div>
      </div>

      <Toast />
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useMotion } from "@vueuse/motion";
import { useToast } from "primevue/usetoast";
import logo from '@/assets/image/logo.png'

definePageMeta({
  layout: "default"
})

const username = ref("");
const password = ref("");
const router = useRouter();
const formRef = ref(null);
const toast = useToast();

async function handleLogin() {
  if (username.value === "admin" && password.value === "admin") {
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
  } else {
    toast.add({
      severity: "error",
      summary: "Login Failed",
      detail: "Invalid credentials",
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

