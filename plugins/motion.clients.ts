import { MotionPlugin } from '@vueuse/motion'

export default defineNuxtPlugin((nuxtApp) => {
  // Only register on client side to avoid SSR issues
  if (import.meta.client) {
    nuxtApp.vueApp.use(MotionPlugin)
  }
})
