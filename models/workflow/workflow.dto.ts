/**
 * Workflow DTOs - API layer types
 * These match the backend API structure exactly
 * Backend includes nested user objects
 */

import type { UserDTO } from '../user/user.dto'

export interface WorkflowDTO {
  id: string
  name: string
  workflow_key?: string
  version?: number
  status?: 'draft' | 'published' | 'archived'
  start_key?: string
  description?: string
  fields: WorkflowFieldDTO[]
  steps?: StepDTO[]
  approvals: WorkflowApprovalDTO[]
  action: WorkflowActionDTO
  is_archived: boolean
  created_by: UserDTO
  created_at: string
  updated_at: string
}

export interface WorkflowFieldDTO {
  id?: string
  key: string
  label: string
  type: 'short_text' | 'long_text' | 'currency' | 'amount' | 'select' | 'multi_select' | 'date' | 'datetime' | 'boolean' | 'email' | 'url'
  description?: string
  required: boolean
  position: number
  options?: string[]
}

export interface StepDTO {
  key: string
  type: 'approval' | 'action' | 'gateway:exclusive' | 'gateway:parallel' | 'system_task'
  assignees?: string[]
  assignee?: string
  condition?: string
  next?: string
  branches?: BranchDTO[]
}

export interface BranchDTO {
  condition: string
  to: string
}

export interface WorkflowApprovalDTO {
  id: string
  approver_id: string
  approver: UserDTO
  order: number
}

export interface WorkflowActionDTO {
  id: string
  actor_id: string
  actor: UserDTO
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
