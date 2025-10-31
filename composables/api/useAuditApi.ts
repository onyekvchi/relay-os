import { HttpMethod, type ApiResponse } from '~/types/api'

export function useAuditApi() {
  const { $api } = useNuxtApp()
  const { getCurrentWorkspaceId } = useAuthStore()

  const getAuditEvents = (filters?: { 
    event_type?: string; 
    from_date?: string; 
    to_date?: string;
    page?: number;
    limit?: number;
  }) =>
    $api<ApiResponse<any[]>>(`/workspaces/${getCurrentWorkspaceId}/audit/events`, {
      query: filters
    })

  return {
    getAuditEvents
  }
}