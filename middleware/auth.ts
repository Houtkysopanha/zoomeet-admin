

export default defineNuxtRouteMiddleware((to) => {
  if (process.client) {
    const auth = localStorage.getItem("auth");
    if (!auth && to.path.startsWith("/admin")) {
      return navigateTo("/login");
    }
    if (auth && to.path === "/login") {
      return navigateTo("/admin/dashboard");
    }
  }
});
