import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFunctions } from 'firebase/functions'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const firebaseConfig = {
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    projectId: config.public.firebaseProjectId,
    storageBucket: config.public.firebaseStorageBucket,
    messagingSenderId: config.public.firebaseMessagingSenderId,
    appId: config.public.firebaseAppId,
    measurementId: config.public.firebaseMeasurementId
  }

  const app = initializeApp(firebaseConfig)
  const auth = getAuth(app)
  const functions = getFunctions(app)

  // Make Firebase available globally via Nuxt app
  nuxtApp.provide('firebase', { app, auth, functions })
})
