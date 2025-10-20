import { RequestAction, RequestStatus, type Request } from './request.model'
import { mockUser } from '../user/user.factory'
import { mockWorkflow } from "../workflow/workflow.factory"
import { WorkflowApprovalStatus } from '../workflow/workflow.model'

export function mockRequest(params: Partial<Request> = {}): Request {
  const workflow = params.type ?? mockWorkflow()
  const initiator = params.initiator ?? mockUser()
  
  return {
    id: params.id ?? `request-${Math.random().toString(36).substring(7)}`,
    workflowId: params.workflowId ?? workflow.id,
    type: workflow,
    initiatorId: params.initiatorId ?? initiator.id,
    initiator,
    status: params.status ?? RequestStatus.awaitingApproval,
    fieldValues: params.fieldValues ?? {
      'Merchant name': 'Acme Corp',
      'Old price': '1000',
      'New price': '1200',
      'Reason for the change': 'Market adjustment'
    },
    observers: params.observers ?? [],
    createdAt: params.createdAt ?? new Date().toISOString(),
    updatedAt: params.updatedAt ?? new Date().toISOString(),
    logs: params.logs ?? [
      {
        id: 'log-1',
        action: RequestAction.create,
        userId: initiator.id,
        user: initiator,
        comment: undefined,
        createdAt: new Date().toISOString()
      }
    ],
    approvals: params.approvals ?? workflow.approvals.map((approval, index) => ({
      id: `approval-${index + 1}`,
      workflowApprovalId: approval.id,
      workflowApproval: approval,
      status: WorkflowApprovalStatus.pending,
      createdAt: new Date().toISOString(),
      comment: undefined
    }))
  }
}
