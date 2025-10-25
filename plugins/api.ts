import { routes } from "../routes";
import type { ApiError } from "~/types/api";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: config.public.apiBase,

    onRequest({ options }) {
      const authStore = useAuthStore()
      const token = authStore.getToken
      
      options.headers = new Headers(options.headers)
      options.headers.set('Accept', 'application/json')
      options.headers.set('Content-Type', 'application/json')
      
      if (token) {
        options.headers.set('Authorization', `Bearer ${token}`)
      }
    },

    onRequestError({ error, request, options }) {
      throw createApiError({
        message: 'Network error. Please check your connection and try again.',
        status: 0,
        url: typeof request === 'string' ? request : String(request),
        method: (options as any)?.method,
      })
    },

    async onResponseError({ response, request, options }) {
      const toast = useToast()

      if (response.status === 401) {
        const { clearAuth } = useAuthStore()
        await nuxtApp.runWithContext(() => {
          clearAuth()
          toast.add({
            title: 'Session Expired',
            description: 'Your session has expired. Please sign in again.',
            color: 'error',
          })
          navigateTo(routes.signIn)
        })
      }

      if (response.status === 403) {
        await nuxtApp.runWithContext(() => {
          const payload = response?._data as any | undefined
          const message = payload?.message || 'You do not have permission to perform this action.'
          
          toast.add({
            title: 'Permission Denied',
            description: message,
            color: 'error',
          })
        })
      }

      throw buildApiError(response, request, options)
    },
  })

  // Expose to useNuxtApp().$api
  return {
    provide: {
      api,
    },
  }
})

function createApiError(params: { message: string; status: number; code?: string; url?: string; method?: string }): ApiError {
  const err = new Error(params.message) as ApiError
  err.name = 'ApiError'
  err.status = params.status
  if (params.code) err.code = params.code
  if (params.url) err.url = params.url
  if (params.method) err.method = params.method
  return err
}

function buildApiError(response: any, request?: any, options?: any): ApiError {
  const defaultMessages: Record<number, string> = {
    400: 'Bad request. Please check the information and try again.',
    401: 'Your session has expired. Please sign in again.',
    403: 'You do not have permission to perform this action.',
    404: 'We could not find what you were looking for.',
    422: 'Some fields are invalid. Please review and try again.',
    429: 'Too many requests. Please wait a moment and try again.',
    500: 'Something went wrong on our side. Please try again later.',
    502: 'Bad gateway. Please try again later.',
    503: 'Service unavailable. Please try again later.',
    504: 'The request timed out. Please try again.',
  }

  const payload = response?._data as any | undefined
  const serverMessage = payload?.message || payload?.error_description || payload?.error
  const friendly = serverMessage || defaultMessages[response?.status] || 'Unexpected error. Please try again.'

  return createApiError({
    message: friendly,
    status: Number(response?.status ?? 0),
    code: payload?.code,
    url: typeof request === 'string' ? request : String(request ?? ''),
    method: options?.method,
  })
}
