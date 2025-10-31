import type { Request, RequestLog, RequestWorkflowApproval, RequestStatus, RequestAction } from './request.model'
import type { WorkflowApprovalStatus } from '../workflow/workflow.model'
import type { RequestDTO, CreateRequestRequest } from './request.dto'
import { WorkflowMapper } from '../workflow/workflow.mapper'
import { UserMapper } from '../user/user.mapper'

/**
 * RequestMapper - Transforms between UI models and API DTOs for step-based workflow system
 */
export class RequestMapper {
  /**
   * Convert API DTO to UI Model
   */
  static toModel(dto: RequestDTO): Request {
    return {
      id: dto.id,
      workflowId: dto.workflow_id,
      workflow: WorkflowMapper.toModel(dto.workflow),
      createdBy: UserMapper.toModel(dto.created_by),
      status: dto.status as RequestStatus,
      context: dto.context,
      activeSteps: dto.active_steps,
      createdAt: dto.created_at,
      updatedAt: dto.updated_at,
      // Legacy properties for backward compatibility
      type: WorkflowMapper.toModel(dto.workflow),
      initiatorId: dto.created_by.id,
      initiator: UserMapper.toModel(dto.created_by),
      fieldValues: dto.context,
      observers: [],
      logs: [],
      approvals: []
    }
  }

  /**
   * Convert UI Model to API DTO (for create)
   */
  static toCreateDTO(request: {
    workflow_id: string
    context: Record<string, any>
    observers?: string[]
  }): CreateRequestRequest {
    return {
      workflow_id: request.workflow_id,
      context: request.context,
      observers: request.observers
    }
  }

  /**
   * Convert array of DTOs to array of models
   */
  static toModelList(dtos: RequestDTO[]): Request[] {
    return dtos.map(dto => this.toModel(dto))
  }
}
