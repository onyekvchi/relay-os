import type { UseFetchOptions } from 'nuxt/app'

export function useApi<T>(
  url: string | (() => string),
  options?: Omit<UseFetchOptions<any>, 'transform'> & { transform?: (input: any) => T },
) {
  return useFetch(url, {
    ...options,
    $fetch: useNuxtApp().$api as typeof $fetch
  }) as ReturnType<typeof useFetch<T>>
}