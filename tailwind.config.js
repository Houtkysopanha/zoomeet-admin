/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
       backgroundImage: {
        'custom-gradient': 'linear-gradient(79deg, #4D66A6 7.31%, #B61EEB 98.95%)',
      },
    },
  },
  plugins: [],
}

