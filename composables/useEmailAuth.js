import { httpsCallable } from 'firebase/functions'

export async function sendEmailOtp(email) {
  const { $firebase } = useNuxtApp()  // Get plugin injection
  const fn = httpsCallable($firebase.functions, 'sendEmailOtp')
  const res = await fn({ email })
  return res.data
}

export const verifyEmailOtp = async (email, otp) => {
  const { $firebase } = useNuxtApp()  // Get plugin injection
  const fn = httpsCallable($firebase.functions, 'verifyEmailOtp')
  const res = await fn({ email, otp })
  return res.data
}
