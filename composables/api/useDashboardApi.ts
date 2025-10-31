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
  const { getCurrentWorkspaceId } = useAuthStore()

  const getDashboardSummary = () => {
    return useApi<any>(`/workspaces/${getCurrentWorkspaceId}/dashboard/summary`, {
      method: HttpMethod.GET,
    })
  }

  const getPopularWorkflows = () => {
    return useApi<Workflow[]>(`/workspaces/${getCurrentWorkspaceId}/dashboard/popular`, {
      method: HttpMethod.GET,
      transform: (response: ApiResponse<WorkflowDTO[]>) => {
        if (!response?.data) return []
        return WorkflowMapper.toModelList(response.data)
      },
    })
  }

  const getPendingActions = () => {
    return useApi<Request[]>(`/workspaces/${getCurrentWorkspaceId}/dashboard/pending-actions`, {
      method: HttpMethod.GET,
      transform: (response: ApiResponse<RequestDTO[]>) => {
        if (!response?.data) return []
        return RequestMapper.toModelList(response.data)
      },
    })
  }

  const getRecentActivity = (limit = 20) => {
    return useApi<ActivityLog[]>(`/workspaces/${getCurrentWorkspaceId}/dashboard/activity`, {
      method: HttpMethod.GET,
      query: { limit },
      transform: (response: ApiResponse<ActivityLogDTO[]>) => {
        if (!response?.data) return []
        return response.data.map(a => DashboardMapper.activityToModel(a))
      },
    })
  }

  const getActivityFeed = (limit = 20) => {
    return useApi<ActivityLog[]>(`/workspaces/${getCurrentWorkspaceId}/dashboard/activity`, {
      method: HttpMethod.GET,
      query: { limit },
      transform: (response: ApiResponse<ActivityLogDTO[]>) => {
        if (!response?.data) return []
        return response.data.map(a => DashboardMapper.activityToModel(a))
      },
    })
  }

  return {
    getDashboardSummary,
    getPopularWorkflows,
    getPendingActions,
    getRecentActivity,
    getActivityFeed
  }
}
