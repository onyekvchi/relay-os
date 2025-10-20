/**
 * Dashboard Models - UI layer types for dashboard data
 */

import type { Workflow } from '../workflow/workflow.model'
import type { Request, RequestAction } from '../request/request.model'
import type { User } from '../user/user.model'

export interface DashboardData {
  popularWorkflows: Workflow[]
  pendingActions: Request[]
  recentActivity: ActivityLog[]
}

export interface ActivityLog {
  id: string
  requestId: string
  request: Request
  action: RequestAction
  userId: string
  user: User
  comment?: string
  createdAt: string
}
