import type { 
  RequestDTO, 
  CreateRequestRequest, 
  ApproveRequestRequest, 
  RejectRequestRequest, 
  RequestChangesRequest 
} from '@/models/request/request.dto'
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
    return useApi<ApiResponse<RequestDTO[]>>('/requests', {
      query: filters,
      method: HttpMethod.GET,
    })
  }

  /**
   * Fetch a single request by ID
   * @param id - Request ID
   */
  const getRequest = (id: string) => {
    return useApi<ApiResponse<RequestDTO>>(`/requests/${id}`, {
      method: HttpMethod.GET,
    })
  }

  /**
   * Create a new request
   * @param data - Request creation data
   */
  const createRequest = (data: CreateRequestRequest) => {
    return $api<ApiResponse<RequestDTO>>('/requests', {
      method: HttpMethod.POST,
      body: data,
    })
  }

  /**
   * Approve a request
   * @param id - Request ID
   * @param data - Approval data (approval_id, optional comment)
   */
  const approveRequest = (id: string, data: ApproveRequestRequest) => {
    return $api<ApiResponse<RequestDTO>>(`/requests/${id}/approve`, {
      method: HttpMethod.POST,
      body: data,
    })
  }

  /**
   * Reject a request
   * @param id - Request ID
   * @param data - Rejection data (approval_id, reason)
   */
  const rejectRequest = (id: string, data: RejectRequestRequest) => {
    return $api<ApiResponse<RequestDTO>>(`/requests/${id}/reject`, {
      method: HttpMethod.POST,
      body: data,
    })
  }

  /**
   * Request changes on a request
   * @param id - Request ID
   * @param data - Request changes data (reason)
   */
  const requestChanges = (id: string, data: RequestChangesRequest) => {
    return $api<ApiResponse<RequestDTO>>(`/requests/${id}/request-changes`, {
      method: HttpMethod.POST,
      body: data,
    })
  }

  /**
   * Complete a request (action taker)
   * @param id - Request ID
   * @param comment - Optional completion comment
   */
  const completeRequest = (id: string, comment?: string) => {
    return $api<ApiResponse<RequestDTO>>(`/requests/${id}/complete`, {
      method: HttpMethod.POST,
      body: { comment },
    })
  }

  /**
   * Add a comment to a request
   * @param id - Request ID
   * @param comment - Comment text
   */
  const addComment = (id: string, comment: string) => {
    return $api<ApiResponse<RequestDTO>>(`/requests/${id}/comment`, {
      method: HttpMethod.POST,
      body: { comment },
    })
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
