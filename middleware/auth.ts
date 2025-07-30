export default defineNuxtRouteMiddleware((to) => {
  // Only run on client side to access localStorage
  if (import.meta.client) {
    const auth = localStorage.getItem("auth");

    // If not authenticated and trying to access admin routes
    if (!auth && to.path.startsWith("/admin")) {
      return navigateTo("/login");
    }

    // If authenticated and trying to access login page, redirect to dashboard
    if (auth && to.path === "/login") {
      return navigateTo("/admin/dashboard");
    }
  }
});
