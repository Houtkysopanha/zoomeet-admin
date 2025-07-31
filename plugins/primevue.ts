import PrimeVue from 'primevue/config'
import { defineNuxtPlugin } from '#app'
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import Badge from 'primevue/badge';
import BadgeDirective from 'primevue/badgedirective';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, { ripple: true })
  nuxtApp.vueApp.use(ToastService)
  nuxtApp.vueApp.component('Toast', Toast)
  nuxtApp.vueApp.directive('Badge', BadgeDirective)
  nuxtApp.vueApp.component('Badge', Badge)
})
