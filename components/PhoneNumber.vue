<template>
  <div class="w-full relative" ref="phoneInputContainer">
    <label class="self-stretch justify-start text-zinc-800 text-md mb-3 font-normal leading-7 ">
      Phone Number
    </label>
    
    <div class="relative mt-2">
      <div class="flex items-center bg-neutral-100 rounded-lg p-2" >
        <!-- Country Flag and Code -->
        <div class="flex items-center bg-neutral-100 cursor-pointer" @click="toggleDropdown">
          <div class="w-3 h-2 sm:w-8 sm:h-6 rounded-sm overflow-hidden mr-2 sm:mr-3 flex-shrink-0">
            <img 
              :src="selectedCountry.flagUrl"
              :alt="selectedCountry.name"
              class="w-full h-full object-cover"
              @error="handleImageError"
            />
          </div>
          <div class="w-px h-6 sm:h-8 ml-2 bg-gray-300 mr-2 sm:mr-4"></div>
          <span class="text-gray-600 font-medium text-xs sm:text-base mr-2 sm:mr-3">{{ selectedCountry.code }}</span>
          
        </div>
        
        <!-- Vertical Divider -->
        
        <!-- Phone Number Input -->
        <input
          v-model="phoneNumber"
          @input="formatPhoneNumber"
          type="tel"
          placeholder="Enter phone number"
          class="flex-1 w-full md:p-2 bg-transparent border-0 outline-none text-gray-800 text-sm sm:text-base placeholder-gray-400"
        />
      </div>
      
      <!-- Dropdown Menu with Teleport to body -->
      <Teleport to="body">
       <div
          v-if="isDropdownOpen"
          :style="dropdownStyle"
          class="fixed bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-hidden"
          style="z-index: 9999;"
        >
          <!-- Search Input -->
          <div class="p-3 border-b border-gray-200 bg-gray-50">
            <input
              v-model="searchQuery"
              ref="searchInput"
              type="text"
              placeholder="Search countries..."
              class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
              @keydown.escape="closeDropdown"
            />
          </div>
          
          <!-- Countries List -->
          <div class="overflow-y-auto max-h-48">
            <button
              v-for="country in filteredCountries"
              :key="country.code + country.name"
              @click="selectCountry(country)"
              class="w-full flex items-center px-3 py-3 hover:bg-blue-50 focus:outline-none focus:bg-blue-50 text-left transition-colors duration-150"
              :class="{ 'bg-blue-50': selectedCountry.code === country.code }"
            >
              <div class="w-5 h-3 sm:w-6 sm:h-4 rounded-sm overflow-hidden mr-3 flex-shrink-0">
                <img 
                  :src="country.flagUrl"
                  :alt="country.name"
                  class="w-full h-full object-cover"
                  @error="handleImageError"
                />
              </div>
              <span class="flex-1 text-xs font-medium text-gray-800">{{ country.name }}</span>
              <span class="text-xs sm:text-xs text-gray-500 font-medium">{{ country.code }}</span>
            </button>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';

const emit = defineEmits(['update:modelValue', 'change']);
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
});
const phoneNumber = ref('');
const selectedCountry = ref({
  name: 'Cambodia',
  code: '+855',
  flagUrl: 'https://flagcdn.com/w40/kh.png',
});

const isDropdownOpen = ref(false);
const searchQuery = ref('');
const phoneInputContainer = ref(null);
const searchInput = ref(null);
const dropdownStyle = ref({});

const countries = ref([
  { name: 'Cambodia', code: '+855', flagUrl: 'https://flagcdn.com/w40/kh.png' },
  { name: 'United States', code: '+1', flagUrl: 'https://flagcdn.com/w40/us.png' },
  { name: 'United Kingdom', code: '+44', flagUrl: 'https://flagcdn.com/w40/gb.png' },
  { name: 'Canada', code: '+1', flagUrl: 'https://flagcdn.com/w40/ca.png' },
  { name: 'Australia', code: '+61', flagUrl: 'https://flagcdn.com/w40/au.png' },
  { name: 'Germany', code: '+49', flagUrl: 'https://flagcdn.com/w40/de.png' },
  { name: 'France', code: '+33', flagUrl: 'https://flagcdn.com/w40/fr.png' },
  { name: 'Italy', code: '+39', flagUrl: 'https://flagcdn.com/w40/it.png' },
  { name: 'Spain', code: '+34', flagUrl: 'https://flagcdn.com/w40/es.png' },
  { name: 'Netherlands', code: '+31', flagUrl: 'https://flagcdn.com/w40/nl.png' },
  { name: 'Belgium', code: '+32', flagUrl: 'https://flagcdn.com/w40/be.png' },
  { name: 'Switzerland', code: '+41', flagUrl: 'https://flagcdn.com/w40/ch.png' },
  { name: 'Austria', code: '+43', flagUrl: 'https://flagcdn.com/w40/at.png' },
  { name: 'Sweden', code: '+46', flagUrl: 'https://flagcdn.com/w40/se.png' },
  { name: 'Norway', code: '+47', flagUrl: 'https://flagcdn.com/w40/no.png' },
  { name: 'Denmark', code: '+45', flagUrl: 'https://flagcdn.com/w40/dk.png' },
  { name: 'Finland', code: '+358', flagUrl: 'https://flagcdn.com/w40/fi.png' },
  { name: 'Japan', code: '+81', flagUrl: 'https://flagcdn.com/w40/jp.png' },
  { name: 'South Korea', code: '+82', flagUrl: 'https://flagcdn.com/w40/kr.png' },
  { name: 'China', code: '+86', flagUrl: 'https://flagcdn.com/w40/cn.png' },
  { name: 'India', code: '+91', flagUrl: 'https://flagcdn.com/w40/in.png' },
  { name: 'Brazil', code: '+55', flagUrl: 'https://flagcdn.com/w40/br.png' },
  { name: 'Mexico', code: '+52', flagUrl: 'https://flagcdn.com/w40/mx.png' },
  { name: 'Argentina', code: '+54', flagUrl: 'https://flagcdn.com/w40/ar.png' },
  { name: 'South Africa', code: '+27', flagUrl: 'https://flagcdn.com/w40/za.png' },
  { name: 'Egypt', code: '+20', flagUrl: 'https://flagcdn.com/w40/eg.png' },
  { name: 'Nigeria', code: '+234', flagUrl: 'https://flagcdn.com/w40/ng.png' },
  { name: 'Kenya', code: '+254', flagUrl: 'https://flagcdn.com/w40/ke.png' },
  { name: 'UAE', code: '+971', flagUrl: 'https://flagcdn.com/w40/ae.png' },
  { name: 'Saudi Arabia', code: '+966', flagUrl: 'https://flagcdn.com/w40/sa.png' },
  { name: 'Turkey', code: '+90', flagUrl: 'https://flagcdn.com/w40/tr.png' },
  { name: 'Russia', code: '+7', flagUrl: 'https://flagcdn.com/w40/ru.png' },
  { name: 'Poland', code: '+48', flagUrl: 'https://flagcdn.com/w40/pl.png' },
  { name: 'Czech Republic', code: '+420', flagUrl: 'https://flagcdn.com/w40/cz.png' },
  { name: 'Hungary', code: '+36', flagUrl: 'https://flagcdn.com/w40/hu.png' },
  { name: 'Romania', code: '+40', flagUrl: 'https://flagcdn.com/w40/ro.png' },
  { name: 'Greece', code: '+30', flagUrl: 'https://flagcdn.com/w40/gr.png' },
  { name: 'Portugal', code: '+351', flagUrl: 'https://flagcdn.com/w40/pt.png' },
  { name: 'Ireland', code: '+353', flagUrl: 'https://flagcdn.com/w40/ie.png' },
  { name: 'New Zealand', code: '+64', flagUrl: 'https://flagcdn.com/w40/nz.png' },
  { name: 'Singapore', code: '+65', flagUrl: 'https://flagcdn.com/w40/sg.png' },
  { name: 'Malaysia', code: '+60', flagUrl: 'https://flagcdn.com/w40/my.png' },
  { name: 'Thailand', code: '+66', flagUrl: 'https://flagcdn.com/w40/th.png' },
  { name: 'Philippines', code: '+63', flagUrl: 'https://flagcdn.com/w40/ph.png' },
  { name: 'Indonesia', code: '+62', flagUrl: 'https://flagcdn.com/w40/id.png' },
  { name: 'Vietnam', code: '+84', flagUrl: 'https://flagcdn.com/w40/vn.png' },
]);

const filteredCountries = computed(() => {
  if (!searchQuery.value) return countries.value;
  return countries.value.filter(country =>
    country.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    country.code.includes(searchQuery.value)
  );
});

const calculateDropdownPosition = () => {
  if (!phoneInputContainer.value) return;
  const rect = phoneInputContainer.value.getBoundingClientRect();
  const inputRect = phoneInputContainer.value.querySelector('.flex.items-center').getBoundingClientRect();
  dropdownStyle.value = {
    top: `${inputRect.bottom + window.scrollY + 10}px`,
    left: `${inputRect.left + window.scrollX}px`,
    width: `${inputRect.width}px`,
    minWidth: '300px',
    position: 'absolute',
  };
};

const toggleDropdown = async () => {
  isDropdownOpen.value = !isDropdownOpen.value;
  if (isDropdownOpen.value) {
    searchQuery.value = '';
    calculateDropdownPosition();
    await nextTick();
    if (searchInput.value) {
      searchInput.value.focus();
    }
  }
};

const closeDropdown = () => {
  isDropdownOpen.value = false;
  searchQuery.value = '';
};

const selectCountry = (country) => {
  selectedCountry.value = country;
  closeDropdown();
  emitChange();
};

const formatPhoneNumber = () => {
  let value = phoneNumber.value.replace(/\D/g, '');
  if (selectedCountry.value.code === '+1') {
    if (value.length >= 6) {
      value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
    } else if (value.length >= 3) {
      value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
    }
  }
  phoneNumber.value = value;
  emitChange();
};

const emitChange = () => { 
  const cleanNumber = phoneNumber.value.replace(/\D/g, '').replace(/^0+/, '');
  const fullNumber = `${selectedCountry.value.code}${cleanNumber}`;

  if (cleanNumber.length >= 6) {
    const fullPhoneCookie = useCookie('phoneNumberCook')
    fullPhoneCookie.value = fullNumber

    const countryCodeCookie = useCookie('country_code')
    countryCodeCookie.value = selectedCountry.value.code
  }

  emit('update:modelValue', fullNumber)
  emit('change', {
    countryCode: selectedCountry.value.code,
    phoneNumber: fullNumber,
    fullNumber: `${selectedCountry.value.code} ${fullNumber}`,
    country: selectedCountry.value,
  })
}



  watch([phoneNumber, selectedCountry], () => {
    emitChange();
  });

const handleImageError = (event) => {
  event.target.style.display = 'none';
};

const handleClickOutside = (event) => {
  if (phoneInputContainer.value && !phoneInputContainer.value.contains(event.target)) {
    closeDropdown();
  }
};

const handleKeydown = (event) => {
  if (event.key === 'Escape' && isDropdownOpen.value) {
    closeDropdown();
  }
};

const handleWindowEvents = () => {
  if (isDropdownOpen.value) {
    calculateDropdownPosition();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleKeydown);
  window.addEventListener('resize', handleWindowEvents);
  window.addEventListener('scroll', handleWindowEvents);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('resize', handleWindowEvents);
  window.removeEventListener('scroll', handleWindowEvents);
});

defineExpose({
  phoneNumber
})
</script>
<style scoped>
/* Ensure proper positioning */
.relative {
  position: relative;
}

/* Custom scrollbar styling */
:deep(.overflow-y-auto) {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}

:deep(.overflow-y-auto::-webkit-scrollbar) {
  width: 6px;
}

:deep(.overflow-y-auto::-webkit-scrollbar-track) {
  background: #f7fafc;
}

:deep(.overflow-y-auto::-webkit-scrollbar-thumb) {
  background-color: #cbd5e0;
  border-radius: 3px;
}
</style>