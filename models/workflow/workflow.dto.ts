/**
 * Workflow DTOs - API layer types
 * These match the backend API structure exactly
 * Backend includes nested user objects
 */

import type { UserDTO } from '../user/user.dto'

export interface WorkflowDTO {
  id: string
  name: string
  workflow_key: string
  version: number
  status: 'draft' | 'published' | 'archived'
  start_key: string
  description?: string
  fields: WorkflowFieldDTO[]
  steps: StepDTO[]
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

export interface CreateWorkflowRequest {
  name: string
  workflow_key: string
  start_key: string
  description?: string
  fields: WorkflowFieldDTO[]
  steps: StepDTO[]
}

export interface UpdateWorkflowRequest {
  name?: string
  start_key?: string
  description?: string
  fields?: WorkflowFieldDTO[]
  steps?: StepDTO[]
}
