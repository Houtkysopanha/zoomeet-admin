import { onMounted } from 'vue'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'

export default function useFirebase() {
  const router = useRouter()
  const nuxtApp = useNuxtApp()
  const auth = nuxtApp.$firebase.auth
  const confirmationResult = ref(null)


  // ------------------------
  // Initialize reCAPTCHA
  // ------------------------
  const initializeRecaptcha = () => {
    const setupRecaptcha = (containerId = 'recaptcha-container') => {
    //   try {
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear()
          window.recaptchaVerifier = null
        }

        window.recaptchaVerifier = new RecaptchaVerifier(auth,
          containerId, // ✅ first arg is the container ID or element
          {
            size: 'invisible',
            useRecaptchaEnterprise: false,
            callback: () => console.log('✅ reCAPTCHA solved'),
            'expired-callback': () => {
              console.warn('⚠️ reCAPTCHA expired, reinitializing...')
              setupRecaptcha(containerId)
            }
          },
           // ✅ third arg is your auth instance
        )
        window.recaptchaVerifier.render().then(widgetId => {
          window.recaptchaWidgetId = widgetId
          console.log('📌 reCAPTCHA ready:', widgetId)
        })
    //   } catch (err) {
    //     console.error('❌ Failed to initialize reCAPTCHA:', err)
    //   }
    }

    setupRecaptcha()
  }

  onMounted(() => initializeRecaptcha())

  // ------------------------
  // Send OTP
  // ------------------------
  const sendOtp = async (phoneNumber) => {
    try {
      // ------------------------
      // PHONE OTP
      // ------------------------
    //   if (activeTab.value === 'phone') {
        if (!window.recaptchaVerifier) initializeRecaptcha()
        confirmationResult.value = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)
    //   }

      // ------------------------
      // EMAIL OTP
      // ------------------------
      

    } catch (err) {
      console.error('❌ Error sending OTP:', err)
    } 
  }

  const submitOtp = async (otpDigits, firstName, lastName, phoneNumber) => {
    if (!confirmationResult.value ) {
      return { error: 'Session expired. Please try again.' }
    }
    try {
      let body = {}
      const idToken = ref('')

    //   if (tab.value === 'phone') {
        const result = await confirmationResult.value.confirm(otpDigits)
        const user = result.user
        let formattedPhone = phoneNumber.replace(/^\+/, ''); 

        idToken.value = await result.user.getIdToken()
        body = {
          uid: user.uid,
          firstName: firstName,
          lastName: lastName,
          identifier: formattedPhone,
          login_type: 'phone'
        }
    //   }
      
      const config = useRuntimeConfig()
      const baseUrl = config.public.apiBaseUrl  
        // Only call register API in registration flow
        await $fetch(`${baseUrl}/register`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${idToken.value}`,
            'Content-Type': 'application/json',
          },
          body: body,
        })
    
    
    } catch (err) {
      console.error(err)
      return { error: 'Invalid OTP. Please try again.' }
    } 
  }




//   return {
//     tab,
//     otpDigits,
//     otpInputs,
//     countdown,
//     isSubmitting,
//     identifier,
//     phonenumber,
//     confirmationResult,
//     resendCode,
//     submitOtp,
//     startCountdown,
//     isOtpComplete
//   }
  // ------------------------
  // Expose
  // ------------------------
  return {
    initializeRecaptcha,
    sendOtp,
    submitOtp,
  }
}
