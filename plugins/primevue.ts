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
import TabMenu from 'primevue/tabmenu';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Textarea from 'primevue/textarea';
import Calendar from 'primevue/calendar';
import Sidebar from 'primevue/sidebar';
import Divider from 'primevue/divider'
import Tooltip from 'primevue/tooltip'
import ConfirmationService from 'primevue/confirmationservice';


export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, { ripple: true })
  nuxtApp.vueApp.use(ToastService)
  nuxtApp.vueApp.use(ConfirmationService)
  nuxtApp.vueApp.component('Toast', Toast)
  nuxtApp.vueApp.directive('Badge', BadgeDirective)
  nuxtApp.vueApp.component('Badge', Badge)
  nuxtApp.vueApp.component('DataTable', DataTable)
  nuxtApp.vueApp.component('Column', Column)
  nuxtApp.vueApp.component('ColumnGroup', ColumnGroup)
  nuxtApp.vueApp.component('Row', Row),
  nuxtApp.vueApp.component('TabMenu', TabMenu),
  nuxtApp.vueApp.component('InputText', InputText),
  nuxtApp.vueApp.component('Dropdown', Dropdown),
  nuxtApp.vueApp.component('Textarea', Textarea),
  nuxtApp.vueApp.component('Calendar', Calendar)
  nuxtApp.vueApp.component('Sidebar', Sidebar),
  nuxtApp.vueApp.component('Divider', Divider)
  nuxtApp.vueApp.directive('tooltip', Tooltip)
})
