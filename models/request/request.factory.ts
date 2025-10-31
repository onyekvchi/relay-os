import { RequestAction, RequestStatus, type Request } from './request.model'
import { mockUser } from '../user/user.factory'
import { mockWorkflow } from "../workflow/workflow.factory"
import { WorkflowApprovalStatus } from '../workflow/workflow.model'

export function mockRequest(params: Partial<Request> = {}): Request {
  const workflow = params.workflow ?? mockWorkflow()
  const createdBy = params.createdBy ?? mockUser()
  
  return {
    id: params.id ?? `request-${Math.random().toString(36).substring(7)}`,
    workflowId: params.workflowId ?? workflow.id,
    workflow,
    createdBy,
    status: params.status ?? RequestStatus.awaitingApproval,
    context: params.context ?? {
      'merchant_name': 'Acme Corp',
      'old_price': 1000,
      'new_price': 1200,
      'reason': 'Market adjustment'
    },
    activeSteps: params.activeSteps ?? ['approval_1'],
    createdAt: params.createdAt ?? new Date().toISOString(),
    updatedAt: params.updatedAt ?? new Date().toISOString(),
    // Legacy properties for backward compatibility
    type: workflow,
    initiatorId: createdBy.id,
    initiator: createdBy,
    fieldValues: params.context ?? {
      'merchant_name': 'Acme Corp',
      'old_price': 1000,
      'new_price': 1200,
      'reason': 'Market adjustment'
    },
    observers: params.observers ?? [],
    logs: params.logs ?? [
      {
        id: 'log-1',
        action: RequestAction.create,
        userId: createdBy.id,
        user: createdBy,
        comment: undefined,
        createdAt: new Date().toISOString()
      }
    ],
    approvals: params.approvals ?? []
  }
}
