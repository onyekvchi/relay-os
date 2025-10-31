import type { Workflow, WorkflowField, WorkflowFieldType } from './workflow.model'
import type { WorkflowDTO, WorkflowFieldDTO, CreateWorkflowRequest } from './workflow.dto'
import { UserMapper } from '../user/user.mapper'

/**
 * WorkflowMapper - Transforms between UI models and API DTOs for step-based workflows
 */
export class WorkflowMapper {
  /**
   * Convert API DTO to UI Model
   */
  static toModel(dto: WorkflowDTO): Workflow {
    return {
      id: dto.id,
      name: dto.name,
      workflowKey: dto.workflow_key,
      version: dto.version,
      status: dto.status,
      startKey: dto.start_key,
      description: dto.description,
      fields: dto.fields
        .sort((a, b) => a.position - b.position)
        .map(f => this.fieldToModel(f)),
      steps: dto.steps,
      createdBy: UserMapper.toModel(dto.created_by),
      createdAt: dto.created_at,
      updatedAt: dto.updated_at
    }
  }

  private static fieldToModel(dto: WorkflowFieldDTO): WorkflowField {
    return {
      id: dto.id,
      key: dto.key,
      label: dto.label,
      type: dto.type as WorkflowFieldType,
      description: dto.description,
      required: dto.required,
      position: dto.position,
      options: dto.options
    }
  }

  /**
   * Convert UI Model to API DTO (for create)
   */
  static toCreateDTO(workflow: {
    name: string
    workflow_key: string
    start_key: string
    description?: string
    fields: WorkflowFieldDTO[]
    steps: any[]
  }): CreateWorkflowRequest {
    return {
      name: workflow.name,
      workflow_key: workflow.workflow_key,
      start_key: workflow.start_key,
      description: workflow.description,
      fields: workflow.fields,
      steps: workflow.steps
    }
  }

  /**
   * Convert array of DTOs to array of models
   */
  static toModelList(dtos: WorkflowDTO[]): Workflow[] {
    return dtos.map(dto => this.toModel(dto))
  }
}
