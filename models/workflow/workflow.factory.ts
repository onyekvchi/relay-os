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
    workflowKey: params.workflowKey ?? 'pricing_change',
    version: params.version ?? 1,
    status: params.status ?? 'published',
    startKey: params.startKey ?? 'start',
    description: params.description ?? 'Request workflow for pricing changes',
    createdBy: params.createdBy ?? mockUser(),
    createdAt: params.createdAt ?? new Date().toISOString(),
    updatedAt: params.updatedAt ?? new Date().toISOString(),
    fields: params.fields ?? [{
      id: 'field-1',
      key: 'merchant_name',
      label: 'Merchant name',
      type: WorkflowFieldType.short_text,
      description: 'Whose pricing do you want to change?',
      required: true,
      position: 0
    }, {
      id: 'field-2',
      key: 'old_price',
      label: 'Old price',
      type: WorkflowFieldType.amount,
      description: 'How much were they paying before?',
      required: true,
      position: 1
    }, {
      id: 'field-3',
      key: 'new_price',
      label: 'New price',
      type: WorkflowFieldType.amount,
      description: 'How much do we want to change it to?',
      required: true,
      position: 2
    }, {
      id: 'field-4',
      key: 'reason',
      label: 'Reason for the change',
      type: WorkflowFieldType.long_text,
      description: 'How are we justifying this change?',
      required: true,
      position: 3
    }],
    steps: params.steps ?? [
      {
        key: 'approval_1',
        type: 'approval',
        assignees: [approver1.id],
        next: 'approval_2'
      },
      {
        key: 'approval_2',
        type: 'approval',
        assignees: [approver2.id],
        next: 'action_1'
      },
      {
        key: 'action_1',
        type: 'action',
        assignee: actor.id
      }
    ]
  }
}
