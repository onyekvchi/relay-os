import type { User } from "../user/user.model"

export type Workflow = {
  id: string,
  name: string,
  workflowKey: string,
  version: number,
  status: 'draft' | 'published' | 'archived',
  startKey: string,
  description?: string,
  fields: WorkflowField[],
  steps: any[],
  createdBy: User,
  createdAt: string,
  updatedAt: string
}

export type WorkflowField = {
  id?: string,
  key: string,
  label: string,
  type: WorkflowFieldType
  description?: string,
  required: boolean,
  position: number,
  options?: string[]
}

export enum WorkflowFieldType {
  short_text = 'short_text',
  long_text = 'long_text',
  currency = 'currency',
  amount = 'amount',
  select = 'select',
  multi_select = 'multi_select',
  date = 'date',
  datetime = 'datetime',
  boolean = 'boolean',
  email = 'email',
  url = 'url',
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
