import type { User } from "../user/user.model"

export type Workflow = {
  id: string,
  name: string,
  description?: string,
  fields: WorkflowField[],
  approvals: WorkflowApproval[],
  action: WorkflowAction,
  isArchived: boolean,
  createdBy: User,
  createdAt: string,
  updatedAt: string
}

export type WorkflowField = {
  id: string,
  label: string,
  type: WorkflowFieldType
  description: string,
  required: boolean,
  order: number
  // TODO: figure out how to add constraints to fields
}

export enum WorkflowFieldType {
  string = 'string',
  text = 'text',
  amount = 'amount',
  integer = 'integer',
  decimal = 'decimal',
  list = 'list',
  user = 'user',
  entity = 'entity',
}

export type WorkflowAction = {
  id: string,
  actorId: string,
  actor: User
}

export type WorkflowApproval = {
  id: string,
  approverId: string,
  approver: User,
  order: number
}

export enum WorkflowApprovalStatus {
  pending = "Pending",
  approved = "Approved",
  rejected = "Rejected"
}
