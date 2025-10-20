import type { Workflow } from '@/models/workflow/workflow.model'
import type { Request } from '@/models/request/request.model'
import type { ActivityLog } from '@/models/dashboard/dashboard.model'
import type { WorkflowDTO } from '@/models/workflow/workflow.dto'
import type { RequestDTO } from '@/models/request/request.dto'
import type { ActivityLogDTO } from '@/models/dashboard'
import { WorkflowMapper } from '@/models/workflow'
import { RequestMapper } from '@/models/request'
import { UserMapper } from '@/models/user'
import { DashboardMapper } from '@/models/dashboard'
import type { ApiResponse } from '@/types/api'
import { HttpMethod } from '@/types/api'

/**
 * Composable for dashboard API operations
 */
export function useDashboardApi() {
  /**
   * Get popular workflows for dashboard
   * Returns top 3 active workflows
   */
  const getPopularWorkflows = () => {
    return useApi<Workflow[]>('/dashboard/popular-workflows', {
      method: HttpMethod.GET,
      transform: (response: ApiResponse<WorkflowDTO[]>) => {
        if (!response?.data) return []
        return WorkflowMapper.toModelList(response.data)
      },
    })
  }

  /**
   * Get pending actions for dashboard
   * Returns requests awaiting current user's approval
   */
  const getPendingActions = () => {
    return useApi<Request[]>('/dashboard/pending-actions', {
      method: HttpMethod.GET,
      transform: (response: ApiResponse<RequestDTO[]>) => {
        if (!response?.data) return []
        return RequestMapper.toModelList(response.data)
      },
    })
  }

  /**
   * Get recent activity for dashboard
   * Returns last 8 activity logs
   */
  const getRecentActivity = () => {
    return useApi<ActivityLog[]>('/dashboard/recent-activity', {
      method: HttpMethod.GET,
      transform: (response: ApiResponse<ActivityLogDTO[]>) => {
        if (!response?.data) return []
        return response.data.map(a => ({
          id: a.id,
          requestId: a.request_id,
          request: RequestMapper.toModel(a.request),
          action: DashboardMapper['mapAction'](a.action),
          userId: a.user_id,
          user: a.user ? UserMapper.toModel(a.user) : {} as any,
          comment: a.comment,
          createdAt: a.created_at
        }))
      },
    })
  }

  return {
    getPopularWorkflows,
    getPendingActions,
    getRecentActivity
  }
}
