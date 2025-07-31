import PrimeVue from 'primevue/config'
import { defineNuxtPlugin } from '#app'
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import Badge from 'primevue/badge';
import BadgeDirective from 'primevue/badgedirective';
import DataTable from 'primevue/datatable'
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';   // optional
import Row from 'primevue/row';     

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, { ripple: true })
  nuxtApp.vueApp.use(ToastService)
  nuxtApp.vueApp.component('Toast', Toast)
  nuxtApp.vueApp.directive('Badge', BadgeDirective)
  nuxtApp.vueApp.component('Badge', Badge)
  nuxtApp.vueApp.component('DataTable', DataTable)
  nuxtApp.vueApp.component('Column', Column)
  nuxtApp.vueApp.component('ColumnGroup', ColumnGroup)
  nuxtApp.vueApp.component('Row', Row)
})
