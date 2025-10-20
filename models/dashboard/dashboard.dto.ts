/**
 * Dashboard DTOs - API layer types for dashboard data
 */

import type { WorkflowDTO } from '../workflow/workflow.dto'
import type { RequestDTO } from '../request/request.dto'
import type { UserDTO } from '../user/user.dto'

export interface DashboardDataDTO {
  popular_workflows: WorkflowDTO[]
  pending_actions: RequestDTO[]
  recent_activity: ActivityLogDTO[]
}

export interface ActivityLogDTO {
  id: string
  request_id: string
  request: RequestDTO
  action: string  // 'create', 'approve', 'reject', etc.
  user_id: string
  user: UserDTO
  comment?: string
  created_at: string
}
