export function useQueryParams() {
  const route = useRoute()
  
  const search = computed(() => route.query.search as string | undefined || '')
  const status = computed(() => route.query.status as string | undefined || 'all')
  const page = computed(() => parseInt(route.query.page as string) || 1)
  
  const getQueryParams = () => {
    const params: any = {
      page: page.value,
      per_page: 20,
      search: search.value || undefined,
      status: status.value !== 'all' ? status.value : undefined
    }
    
    return params
  }
  
  const watchQueryParams = (callback: () => void, watchParams = ['search', 'status', 'page']) => {
    watch(
      () => watchParams.map(param => route.query[param]),
      callback,
      { deep: true }
    )
  }
  
  return {
    search,
    status,
    page,
    getQueryParams,
    watchQueryParams
  }
}
