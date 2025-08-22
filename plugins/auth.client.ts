export default defineNuxtPlugin(async (nuxtApp) => {
  console.log('🔐 Initializing auth plugin...');
  
  try {
    const { initAuth, getToken } = useAuth();
    
    // Initialize auth state
    await initAuth();
    
    // Verify auth state
    const token = getToken();
    if (token) {
    } else {
      console.log('ℹ️ No token found during initialization');
    }

  } catch (error) {
    console.error('❌ Auth plugin initialization error:', error);
    // Don't throw, just log - we don't want to break the app if auth init fails
  }
});
