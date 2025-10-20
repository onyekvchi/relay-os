import type { Workflow, WorkflowField, WorkflowApproval, WorkflowAction, WorkflowFieldType } from './workflow.model'
import type { WorkflowDTO, WorkflowFieldDTO, WorkflowApprovalDTO, WorkflowActionDTO, CreateWorkflowRequest } from './workflow.dto'
import { UserMapper } from '../user/user.mapper'

/**
 * WorkflowMapper - Transforms between UI models and API DTOs
 * Backend includes nested user objects, so no separate fetching needed
 */
export class WorkflowMapper {
  /**
   * Convert API DTO to UI Model
   * DTO already includes all nested objects
   */
  static toDomain(dto: WorkflowDTO): Workflow {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      fields: dto.fields
        .sort((a, b) => a.order - b.order)
        .map(f => this.fieldToDomain(f)),
      approvals: dto.approvals
        .sort((a, b) => a.order - b.order)
        .map(a => this.approvalToDomain(a)),
      action: this.actionToDomain(dto.action),
      isArchived: dto.is_archived,
      createdBy: UserMapper.toDomain(dto.created_by),
      createdAt: dto.created_at,
      updatedAt: dto.updated_at
    }
  }

  private static fieldToDomain(dto: WorkflowFieldDTO): WorkflowField {
    return {
      id: dto.id,
      label: dto.label,
      type: dto.type as unknown as WorkflowFieldType,
      description: dto.description,
      required: dto.required,
      order: dto.order
    }
  }

  private static approvalToDomain(dto: WorkflowApprovalDTO): WorkflowApproval {
    return {
      id: dto.id,
      approverId: dto.approver_id,
      approver: UserMapper.toDomain(dto.approver),  // ← Use nested user from DTO
      order: dto.order
    }
  }

  private static actionToDomain(dto: WorkflowActionDTO): WorkflowAction {
    return {
      id: dto.id,
      actorId: dto.actor_id,
      actor: UserMapper.toDomain(dto.actor)  // ← Use nested user from DTO
    }
  }

  /**
   * Convert UI Model to API DTO (for create)
   */
  static toCreateDTO(workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'createdById' | 'isArchived'>): CreateWorkflowRequest {
    return {
      name: workflow.name,
      description: workflow.description,
      fields: workflow.fields.map((f, index) => ({
        label: f.label,
        type: String(f.type),
        description: f.description,
        required: f.required,
        order: index
      })),
      approval_ids: workflow.approvals
        .sort((a, b) => a.order - b.order)
        .map(a => a.approverId),
      action_actor_id: workflow.action.actorId
    }
  }

  /**
   * Convert array of DTOs to array of models
   */
  static toDomainList(dtos: WorkflowDTO[]): Workflow[] {
    return dtos.map(dto => this.toDomain(dto))
  }
}
