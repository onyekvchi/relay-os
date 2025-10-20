import type { Request } from '@/models/request/request.model'
import type { 
  RequestDTO, 
  CreateRequestRequest, 
  ApproveRequestRequest, 
  RejectRequestRequest, 
  RequestChangesRequest 
} from '@/models/request/request.dto'
import { RequestMapper } from '@/models/request/request.mapper'
import type { ApiResponse } from '@/types/api'
import { HttpMethod } from '@/types/api'

/**
 * Composable for request API operations
 */

const { $api } = useNuxtApp()

export function useRequestsApi() {
  /**
   * Fetch all requests with optional filters
   * @param filters - Optional filters (status, workflow_id)
   */
  const getRequests = (filters?: { status?: string; workflow_id?: string }) => {
    return useApi<Request[]>('/requests', {
      query: filters,
      method: HttpMethod.GET,
      transform: (response: ApiResponse<RequestDTO[]>) => {
        if (!response?.data) return []
        return RequestMapper.toDomainList(response.data)
      },
    })
  }

  /**
   * Fetch a single request by ID
   * @param id - Request ID
   */
  const getRequest = (id: string) => {
    return useApi<Request | null>(`/requests/${id}`, {
      method: HttpMethod.GET,
      transform: (response: ApiResponse<RequestDTO>) => {
        if (!response?.data) return null
        return RequestMapper.toDomain(response.data)
      },
    })
  }

  /**
   * Create a new request
   * @param data - Request creation data
   */
  const createRequest = async (data: CreateRequestRequest) => {
    return $api<ApiResponse<RequestDTO>>('/requests', {
      method: HttpMethod.POST,
      body: data,
    }).then(response => RequestMapper.toDomain(response.data!))
  }

  /**
   * Approve a request
   * @param id - Request ID
   * @param data - Approval data (approval_id, optional comment)
   */
  const approveRequest = async (id: string, data: ApproveRequestRequest) => {
    return $api<ApiResponse<RequestDTO>>(`/requests/${id}/approve`, {
      method: HttpMethod.POST,
      body: data,
    }).then(response => RequestMapper.toDomain(response.data!))
  }

  /**
   * Reject a request
   * @param id - Request ID
   * @param data - Rejection data (approval_id, reason)
   */
  const rejectRequest = async (id: string, data: RejectRequestRequest) => {
    return $api<ApiResponse<RequestDTO>>(`/requests/${id}/reject`, {
      method: HttpMethod.POST,
      body: data,
    }).then(response => RequestMapper.toDomain(response.data!))
  }

  /**
   * Request changes on a request
   * @param id - Request ID
   * @param data - Request changes data (reason)
   */
  const requestChanges = async (id: string, data: RequestChangesRequest) => {
    return $api<ApiResponse<RequestDTO>>(`/requests/${id}/request-changes`, {
      method: HttpMethod.POST,
      body: data,
    }).then(response => RequestMapper.toDomain(response.data!))
  }

  /**
   * Complete a request (action taker)
   * @param id - Request ID
   * @param comment - Optional completion comment
   */
  const completeRequest = async (id: string, comment?: string) => {
    return $api<ApiResponse<RequestDTO>>(`/requests/${id}/complete`, {
      method: HttpMethod.POST,
      body: { comment },
    }).then(response => RequestMapper.toDomain(response.data!))
  }

  /**
   * Add a comment to a request
   * @param id - Request ID
   * @param comment - Comment text
   */
  const addComment = async (id: string, comment: string) => {
    return $api<ApiResponse<RequestDTO>>(`/requests/${id}/comment`, {
      method: HttpMethod.POST,
      body: { comment },
    }).then(response => RequestMapper.toDomain(response.data!))
  }

  return {
    getRequests,
    getRequest,
    createRequest,
    approveRequest,
    rejectRequest,
    requestChanges,
    completeRequest,
    addComment,
  }
}
