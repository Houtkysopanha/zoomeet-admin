<template>
  <div class="w-full max-w-md mx-auto">
    <div class="bg-white rounded-xl shadow-2xl p-8">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-extrabold text-gray-900">Admin Portal</h2>
        <p class="text-gray-500 mt-2">Sign in to manage your account</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="Enter your username"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          class="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors font-medium"
        >
          Sign In
        </button>
      </form>

      <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p class="text-sm text-blue-800 font-medium mb-2">Demo Credentials:</p>
        <p class="text-sm text-blue-700">
          <strong>Username:</strong> admin<br />
          <strong>Password:</strong> admin
        </p>
      </div>

      <!-- Toast Container -->
      <Toast />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useMotion } from "@vueuse/motion";
import { useToast } from "primevue/usetoast";

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

