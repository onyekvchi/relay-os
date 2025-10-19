import { sampleAdminUsers, sampleWorkspaceManager, type User } from "@/models/user"

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

export function createSampleWorkflow(): Workflow {
  return {
    name: "Pricing Change Request",
    fields: [{
      label: "Merchant name",
      type: WorkflowFieldType.string,
      description: "Whose pricing do you want to change?"
    }, {
      label: "Old price",
      type: WorkflowFieldType.amount,
      description: "How much were they paying before?"
    }, {
      label: "New price",
      type: WorkflowFieldType.amount,
      description: "How much do we want to change it to?"
    }, {
      label: "Reason for the change",
      type: WorkflowFieldType.text,
      description: "How are we justifying this change?"
    }],
    steps: [
      {
        status: WorkflowApprovalStatus.pending,
        approvals: [{
          approver: sampleAdminUsers[0],
          status: WorkflowApprovalStatus.pending
        }]
      },
      {
        status: WorkflowApprovalStatus.pending,
        approvals: [{
          approver: sampleAdminUsers[1],
          status: WorkflowApprovalStatus.pending
        }]
      }
    ],
    action: {
      actor: sampleWorkspaceManager,
      status: WorkflowActionStatus.pending
    }
  }
}