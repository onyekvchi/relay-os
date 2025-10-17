import { routes } from "~/routes"

export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated, clearAuth } = useAuthStore()
  
  if (!isAuthenticated) {
    clearAuth()
    return navigateTo(routes.signIn)
  }
})