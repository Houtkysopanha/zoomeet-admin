export default defineNuxtPlugin(() => {
  // Quill is loaded on demand in the component
  // This plugin ensures client-side only loading
  if (process.client) {
    // Register Quill globally if needed for other components
    return {
      provide: {
        quill: () => import('quill')
      }
    }
  }
})