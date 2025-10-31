import type { Request } from '@/models/request/request.model'
import type { 
  RequestDTO, 
  CreateRequestRequest, 
  ApproveRequestRequest, 
  RejectRequestRequest, 
  RequestChangesRequest,
  ExecuteRequestRequest
} from '@/models/request/request.dto'
import { RequestMapper } from '@/models/request/request.mapper'
import type { ApiResponse } from '@/types/api'
import { HttpMethod } from '@/types/api'

/**
 * Composable for request API operations
 */
export function useRequestsApi() {
  const { $api } = useNuxtApp()
  const { getCurrentWorkspaceId } = useAuthStore()

  const getRequests = (filters?: { status?: string; workflow_id?: string }) => {
    return useApi<Request[]>(`/workspaces/${getCurrentWorkspaceId}/requests`, {
      query: filters,
      method: HttpMethod.GET,
      transform: (response: ApiResponse<RequestDTO[]>) => {
        if (!response?.data) return []
        return RequestMapper.toModelList(response.data)
      },
    })
  }

  /**
   * Fetch a single request by ID
   * @param id - Request ID
   */
  const getRequest = (id: string) => {
    return useApi<Request | null>(`/workspaces/${getCurrentWorkspaceId}/requests/${id}`, {
      method: HttpMethod.GET,
      transform: (response: ApiResponse<RequestDTO>) => {
        if (!response?.data) return null
        return RequestMapper.toModel(response.data)
      },
    })
  }

  /**
   * Create a new request
   * @param data - Request creation data
   */
  const createRequest = (data: CreateRequestRequest) => {
    return $api<ApiResponse<RequestDTO>>(`/workspaces/${getCurrentWorkspaceId}/requests`, {
      method: HttpMethod.POST,
      body: data,
    }).then(response => RequestMapper.toModel(response.data!))
  }

  /**
   * Approve a request
   * @param id - Request ID
   * @param data - Approval data (approval_id, optional comment)
   */
  const approveRequest = (id: string, data: ApproveRequestRequest) => {
    return $api<ApiResponse<RequestDTO>>(`/workspaces/${getCurrentWorkspaceId}/requests/${id}/approve`, {
      method: HttpMethod.POST,
      body: data,
    }).then(response => RequestMapper.toModel(response.data!))
  }

  const rejectRequest = (id: string, data: RejectRequestRequest) => {
    return $api<ApiResponse<RequestDTO>>(`/workspaces/${getCurrentWorkspaceId}/requests/${id}/reject`, {
      method: HttpMethod.POST,
      body: data,
    }).then(response => RequestMapper.toModel(response.data!))
  }

  const requestChanges = (id: string, data: RequestChangesRequest) => {
    return $api<ApiResponse<RequestDTO>>(`/workspaces/${getCurrentWorkspaceId}/requests/${id}/request-changes`, {
      method: HttpMethod.POST,
      body: data,
    }).then(response => RequestMapper.toModel(response.data!))
  }

  const executeRequest = (id: string, data: ExecuteRequestRequest) => {
    return $api<ApiResponse<RequestDTO>>(`/workspaces/${getCurrentWorkspaceId}/requests/${id}/execute`, {
      method: HttpMethod.POST,
      body: data,
    }).then(response => RequestMapper.toModel(response.data!))
  }

  const cancelRequest = (id: string, comment?: string) => {
    return $api<ApiResponse<RequestDTO>>(`/workspaces/${getCurrentWorkspaceId}/requests/${id}/cancel`, {
      method: HttpMethod.POST,
      body: { comment },
    }).then(response => RequestMapper.toModel(response.data!))
  }

  /**
   * Get comments for a request
   * @param id - Request ID
   */
  const getComments = (id: string) => {
    return $api<ApiResponse<any[]>>(`/workspaces/${getCurrentWorkspaceId}/requests/${id}/comments`, {
      method: HttpMethod.GET,
    })
  }

  /**
   * Add a comment to a request
   * @param id - Request ID
   * @param comment - Comment text
   * @param step_key - Optional step context for the comment
   */
  const addComment = (id: string, comment: string, step_key?: string) => {
    return $api<ApiResponse<RequestDTO>>(`/workspaces/${getCurrentWorkspaceId}/requests/${id}/comments`, {
      method: HttpMethod.POST,
      body: { comment, step_key },
    }).then(response => RequestMapper.toModel(response.data!))
  }

  /**
   * Update request context
   * @param id - Request ID
   * @param context_updates - Context fields to update
   */
  const updateContext = (id: string, context_updates: Record<string, any>) => {
    return $api<ApiResponse<{ context: Record<string, any> }>>(`/workspaces/${getCurrentWorkspaceId}/requests/${id}/context`, {
      method: HttpMethod.PATCH,
      body: context_updates,
    })
  }

  /**
   * Preview next steps for a request
   * @param id - Request ID
   */
  const previewNextSteps = (id: string) => {
    return $api<ApiResponse<{ next_steps: any[] }>>(`/workspaces/${getCurrentWorkspaceId}/requests/${id}/next-steps`, {
      method: HttpMethod.GET,
    })
  }

  /**
   * Manage observers for a request
   * @param id - Request ID
   * @param data - Observers to add/remove
   */
  const manageObservers = (id: string, data: { add?: string[]; remove?: string[] }) => {
    return $api<ApiResponse<{ observers: any[] }>>(`/workspaces/${getCurrentWorkspaceId}/requests/${id}/observers`, {
      method: HttpMethod.POST,
      body: data,
    })
  }

  return {
    getRequests,
    getRequest,
    createRequest,
    approveRequest,
    rejectRequest,
    requestChanges,
    executeRequest,
    cancelRequest,
    getComments,
    addComment,
    updateContext,
    previewNextSteps,
    manageObservers,
  }
}
