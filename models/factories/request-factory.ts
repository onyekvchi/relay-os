import { RequestAction, RequestStatus, type Request } from '@/models/request'
import { mockUser } from '@/models/factories/user-factory'
import { mockWorkflow } from '@/models/factories/workflow-factory'

export function mockRequest(params: Partial<Request> = {}): Request {
  return {
    id: params.id ?? Math.random().toString(36).substring(7),
    type: params.type ?? mockWorkflow(),
    initiator: params.initiator ?? mockUser(),
    status: params.status ?? RequestStatus.awaitingApproval,
    observers: params.observers ?? [],
    createdAt: params.createdAt ?? '2025-10-15T08:30:00.000000Z',
    logs: params.logs ?? []
  }
}
