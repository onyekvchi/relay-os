import type { Request, RequestLog, RequestWorkflowApproval, RequestStatus, RequestAction } from './request.model'
import type { WorkflowApprovalStatus } from '../workflow/workflow.model'
import type { RequestDTO, RequestLogDTO, RequestApprovalDTO, CreateRequestRequest } from './request.dto'
import { WorkflowMapper } from '../workflow/workflow.mapper'
import { UserMapper } from '../user/user.mapper'

/**
 * RequestMapper - Transforms between UI models and API DTOs
 * Backend includes nested workflow and user objects, so no separate fetching needed
 */
export class RequestMapper {
  /**
   * Convert API DTO to UI Model
   * DTO already includes all nested objects
   */
  static toDomain(dto: RequestDTO): Request {
    return {
      id: dto.id,
      workflowId: dto.workflow_id,
      type: WorkflowMapper.toDomain(dto.workflow),  // ← Use nested workflow from DTO
      initiatorId: dto.initiator_id,
      initiator: UserMapper.toDomain(dto.initiator),  // ← Use nested user from DTO
      status: dto.status as RequestStatus,
      fieldValues: dto.field_values,
      observers: dto.observers.map(u => UserMapper.toDomain(u)),  // ← Use nested users from DTO
      createdAt: dto.created_at,
      updatedAt: dto.updated_at,
      logs: dto.logs.map(log => this.logToDomain(log)),
      approvals: dto.approvals.map(approval => this.approvalToDomain(approval))
    }
  }

  private static logToDomain(dto: RequestLogDTO): RequestLog {
    return {
      id: dto.id,
      action: dto.action as unknown as RequestAction,
      userId: dto.user_id,
      user: UserMapper.toDomain(dto.user),  // ← Use nested user from DTO
      comment: dto.comment,
      createdAt: dto.created_at
    }
  }

  private static approvalToDomain(dto: RequestApprovalDTO): RequestWorkflowApproval {
    return {
      id: dto.id,
      workflowApprovalId: dto.workflow_approval_id,
      workflowApproval: {
        id: dto.workflow_approval.id,
        approverId: dto.workflow_approval.approver_id,
        approver: UserMapper.toDomain(dto.workflow_approval.approver),  // ← Use nested user from DTO
        order: dto.workflow_approval.order
      },
      status: dto.status as unknown as WorkflowApprovalStatus,
      createdAt: dto.actioned_at || new Date().toISOString(),
      comment: dto.comment
    }
  }

  /**
   * Convert UI Model to API DTO (for create)
   */
  static toCreateDTO(request: {
    workflow_id: string
    field_values: Record<string, any>
    observer_ids?: string[]
  }): CreateRequestRequest {
    return {
      workflow_id: request.workflow_id,
      field_values: request.field_values,
      observer_ids: request.observer_ids
    }
  }

  /**
   * Convert array of DTOs to array of models
   */
  static toDomainList(dtos: RequestDTO[]): Request[] {
    return dtos.map(dto => this.toDomain(dto))
  }
}
