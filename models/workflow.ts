import type { User } from "@/models/user"

export type Workflow = {
  name: string,
  fields: WorkflowField[],
  steps: WorkflowApprovalGroup[]
  action: WorkflowAction
}

export type WorkflowField = {
  label: string,
  type: WorkflowFieldType
  description: string
  // TODO: figure out how to add constraints to fields
}

export enum WorkflowFieldType {
  string, text, amount, integer, decimal, list, user, entity,
}

export enum WorkflowApprovalStatus {
  pending, approved
}

export type WorkflowApproval = {
  approver: User
  status: WorkflowApprovalStatus
}

export type WorkflowApprovalGroup = {
  status: WorkflowApprovalStatus,
  approvals: WorkflowApproval[]
}

export enum WorkflowActionStatus {
  pending, completed
}

export type WorkflowAction = {
  status: WorkflowActionStatus,
  actor: User
}