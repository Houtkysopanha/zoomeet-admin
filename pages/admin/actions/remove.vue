<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold text-red-700 mb-4">Remove Booking</h1>
    <p class="mb-2">Booking Ref No: {{ bookingRefNo }}</p>
    <!-- Add your remove logic and UI here -->
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const bookingRefNo = route.query.bookingRefNo
</script>
