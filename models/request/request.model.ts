import type { User } from "../user/user.model"
import type { Workflow, WorkflowApproval, WorkflowApprovalStatus } from "../workflow/workflow.model"

export type Request = {
  id: string,
  workflowId: string,
  workflow: Workflow,
  createdBy: User,
  status: RequestStatus
  context: Record<string, any>,
  activeSteps: string[],
  createdAt: string,
  updatedAt: string,
  // Legacy properties for backward compatibility
  type: Workflow,
  initiatorId: string,
  initiator: User
  fieldValues: Record<string, any>,
  observers: User[]
  logs: RequestLog[],
  approvals: RequestWorkflowApproval[]
}

export enum RequestStatus {
  awaitingApproval = "Awaiting Approval",
  changesRequested = "Changes Requested",
  awaitingAction = "Awaiting Action",
  completed = "Completed",
  rejected = "Rejected",
  cancelled = "Cancelled"
}

export type RequestLog = {
  id: string,
  action: RequestAction,
  userId: string,
  user: User,
  comment?: string,
  createdAt: string
}

export enum RequestAction {
  create, approve, requestChange, reject, cancel, complete, comment, update
}

export type RequestWorkflowApproval = {
  id: string,
  workflowApprovalId: string,
  workflowApproval: WorkflowApproval,
  status: WorkflowApprovalStatus
  createdAt: string,
  comment?: string
}
  