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
  active_steps: string[]
  created_by: UserDTO
  created_at: string
  updated_at: string
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
