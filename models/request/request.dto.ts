/**
 * Request DTOs - API layer types
 * These match the backend API structure exactly
 * Backend includes nested workflow and user objects
 */

import type { WorkflowDTO } from '../workflow/workflow.dto'
import type { UserDTO } from '../user/user.dto'

export interface RequestDTO {
  id: string
  workflow_id: string
  workflow: WorkflowDTO
  status: 'running' | 'completed' | 'canceled' | 'failed'
  context: Record<string, any>
  active_steps?: string[]
  created_by: UserDTO
  created_at: string
  updated_at: string
  field_values?: Record<string, any>
  observer_ids?: string[]
  observers?: UserDTO[]
  logs?: RequestLogDTO[]
  approvals?: RequestApprovalDTO[]
}

export interface RequestLogDTO {
  id: string
  action: string
  user_id: string
  user: UserDTO
  comment?: string
  created_at: string
}

export interface RequestApprovalDTO {
  id: string
  workflow_approval_id: string
  workflow_approval: {
    id: string
    approver_id: string
    approver: UserDTO
    order: number
  }
  status: string  // 'pending', 'approved', 'rejected', 'changes_requested'
  comment?: string
  actioned_at?: string
  actioned_by_id?: string
}

export interface CreateRequestRequest {
  workflow_id: string
  context: Record<string, any>
  observers?: string[]
}

export interface ApproveRequestRequest {
  step_key: string
  comment?: string
  context_updates?: Record<string, any>
}

export interface RejectRequestRequest {
  step_key: string
  comment: string
}

export interface RequestChangesRequest {
  step_key: string
  comment: string
}

export interface ExecuteRequestRequest {
  step_key: string
  comment?: string
  context_updates?: Record<string, any>
}
