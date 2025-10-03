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
      // Verify Firebase OTP
      const result = await confirmationResult.value.confirm(otpDigits)
      const user = result.user
      let formattedPhone = phoneNumber.replace(/^\+/, ''); 
      const idToken = await result.user.getIdToken()
      
      // Return the verified user data for further processing
      return {
        success: true,
        userData: {
          uid: user.uid,
          firstName: firstName,
          lastName: lastName,
          identifier: formattedPhone,
          login_type: 'phone',
          idToken: idToken
        }
      }
    
    } catch (err) {
      console.error('Firebase OTP verification error:', err)
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
  // Register user after OTP verification (Phone with Firebase token)
  // ------------------------
  const registerUser = async (userData) => {
    try {
      const config = useRuntimeConfig()
      const baseUrl = config.public.apiBaseUrl
      
      const response = await $fetch(`${baseUrl}/register`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userData.idToken}`,
          'Content-Type': 'application/json',
        },
        body: {
          uid: userData.uid,
          firstName: userData.firstName,
          lastName: userData.lastName,
          identifier: userData.identifier,
          login_type: userData.login_type
        },
      })
      
      return { success: true, data: response }
    } catch (err) {
      console.error('Registration error:', err)
      
      // Handle 409 conflict (user already exists)
      if (err.status === 409) {
        return { 
          success: false, 
          error: 'User already exists. Please try logging in instead.',
          code: 'USER_EXISTS'
        }
      }
      
      return { 
        success: false, 
        error: err.message || 'Failed to register user. Please try again.' 
      }
    }
  }

  // ------------------------
  // Register user with email (without Firebase token)
  // ------------------------
  const registerUserWithEmail = async (userData) => {
    try {
      const config = useRuntimeConfig()
      const baseUrl = config.public.apiBaseUrl
      
      console.log('📧 Registering user with email (no Firebase token):', userData.identifier)
      
      const response = await $fetch(`${baseUrl}/register`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userData.idToken}`,
          skipAuth: true,
          'Content-Type': 'application/json',
        },
        body: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          identifier: userData.identifier,
          login_type: userData.login_type,
          // Generate a unique UID for email users
          uid: userData.uid
        },
      })
      
      console.log('✅ Email registration successful')
      return { success: true, data: response }
    } catch (err) {
      console.error('❌ Email registration error:', err)
      
      // Handle 409 conflict (user already exists)
      if (err.status === 409) {
        return { 
          success: false, 
          error: 'User already exists. Please try logging in instead.',
          code: 'USER_EXISTS'
        }
      }
      
      return { 
        success: false, 
        error: err.message || 'Failed to register user. Please try again.' 
      }
    }
  }

  // ------------------------
  // Expose
  // ------------------------
  return {
    initializeRecaptcha,
    sendOtp,
    submitOtp,
    registerUser,
    registerUserWithEmail,
  }
}
