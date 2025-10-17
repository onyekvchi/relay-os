import { routes } from '~/routes'

export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return navigateTo(routes.dashboard)
  }
})