/**
 * Workflow DTOs - API layer types
 * These match the backend API structure exactly
 * Backend includes nested user objects
 */

import type { UserDTO } from '../user/user.dto'

export interface WorkflowDTO {
  id: string
  name: string
  description?: string
  fields: WorkflowFieldDTO[]
  approvals: WorkflowApprovalDTO[]
  action: WorkflowActionDTO
  is_archived: boolean
  created_by: UserDTO
  created_at: string
  updated_at: string
}

export interface WorkflowFieldDTO {
  id: string
  label: string
  type: string  // 'string', 'text', 'amount', etc.
  description: string
  required: boolean
  order: number
}

export interface WorkflowApprovalDTO {
  id: string
  approver_id: string
  approver: UserDTO        // ← Backend includes full user object
  order: number
}

export interface WorkflowActionDTO {
  id: string
  actor_id: string
  actor: UserDTO           // ← Backend includes full user object
}

export interface CreateWorkflowRequest {
  name: string
  description?: string
  fields: Omit<WorkflowFieldDTO, 'id'>[]
  approvals: Array<{ approver_id: string; order: number }>  // Array of approvals with order
  action_actor_id: string
}

export interface UpdateWorkflowRequest {
  name?: string
  description?: string
  fields?: Omit<WorkflowFieldDTO, 'id'>[]
  approvals?: Array<{ approver_id: string; order: number }>
  action_actor_id?: string
  is_archived?: boolean
}
