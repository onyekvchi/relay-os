/**
 * DashboardMapper - Transforms between UI models and API DTOs
 */

import type { DashboardData, ActivityLog } from './dashboard.model'
import type { DashboardDataDTO, ActivityLogDTO } from './dashboard.dto'
import { WorkflowMapper } from '../workflow/workflow.mapper'
import { RequestMapper } from '../request/request.mapper'
import { UserMapper } from '../user/user.mapper'
import { RequestAction } from '../request/request.model'

export class DashboardMapper {
  /**
   * Convert API DTO to UI Model
   */
  static toModel(dto: DashboardDataDTO): DashboardData {
    return {
      popularWorkflows: dto.popular_workflows.map(w => WorkflowMapper.toModel(w)),
      pendingActions: dto.pending_actions.map(r => RequestMapper.toModel(r)),
      recentActivity: dto.recent_activity.map(a => this.activityToModel(a))
    }
  }

  private static activityToModel(dto: ActivityLogDTO): ActivityLog {
    return {
      id: dto.id,
      requestId: dto.request_id,
      request: RequestMapper.toModel(dto.request),
      action: this.mapAction(dto.action),
      userId: dto.user_id,
      user: UserMapper.toModel(dto.user),
      comment: dto.comment,
      createdAt: dto.created_at
    }
  }

  private static mapAction(action: string): RequestAction {
    const actionMap: Record<string, RequestAction> = {
      'create': RequestAction.create,
      'approve': RequestAction.approve,
      'request_change': RequestAction.requestChange,
      'reject': RequestAction.reject,
      'cancel': RequestAction.cancel,
      'complete': RequestAction.complete,
      'comment': RequestAction.comment,
      'update': RequestAction.update
    }
    return actionMap[action] || RequestAction.update
  }
}
