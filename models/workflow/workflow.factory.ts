import { WorkflowFieldType, type Workflow } from './workflow.model'
import { UserRole } from '../user/user.model'
import { mockUser } from '../user/user.factory'

export function mockWorkflow(params: Partial<Workflow> = {}): Workflow {
  const actor = mockUser({ firstName: 'Raymond', lastName: 'Tukpe', email: 'r.tukpe@relayos.com', role: UserRole.WorkspaceManager })
  const approver1 = mockUser({ firstName: 'Agbani', lastName: 'Darego', email: 'a.darego@relayos.com', role: UserRole.Admin })
  const approver2 = mockUser({ firstName: 'Ireti', lastName: 'Doyle', email: 'i.doyle@relayos.com', role: UserRole.Admin })
  
  return {
    id: params.id ?? `workflow-${Date.now()}`,
    name: params.name ?? 'Pricing Change Request',
    description: params.description,
    isArchived: params.isArchived ?? false,
    createdBy: params.createdBy ?? mockUser(),
    createdAt: params.createdAt ?? new Date().toISOString(),
    updatedAt: params.updatedAt ?? new Date().toISOString(),
    fields: params.fields ?? [{
      id: 'field-1',
      label: 'Merchant name',
      type: WorkflowFieldType.string,
      description: 'Whose pricing do you want to change?',
      required: true,
      order: 0
    }, {
      id: 'field-2',
      label: 'Old price',
      type: WorkflowFieldType.amount,
      description: 'How much were they paying before?',
      required: true,
      order: 1
    }, {
      id: 'field-3',
      label: 'New price',
      type: WorkflowFieldType.amount,
      description: 'How much do we want to change it to?',
      required: true,
      order: 2
    }, {
      id: 'field-4',
      label: 'Reason for the change',
      type: WorkflowFieldType.text,
      description: 'How are we justifying this change?',
      required: true,
      order: 3
    }],
    approvals: params.approvals ?? [
      {
        id: 'approval-1',
        approverId: approver1.id,
        approver: approver1,
        order: 0
      },
      {
        id: 'approval-2',
        approverId: approver2.id,
        approver: approver2,
        order: 1
      }
    ],
    action: params.action ?? {
      id: 'action-1',
      actorId: actor.id,
      actor
    }
  }
}
