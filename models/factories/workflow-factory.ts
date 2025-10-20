import { WorkflowActionStatus, WorkflowApprovalStatus, WorkflowFieldType, type Workflow } from '@/models/workflow'
import { UserRole } from '@/models/user'
import { mockUser } from './user-factory'

export function mockWorkflow(params: Partial<Workflow> = {}): Workflow {
  return {
    name: params.name ?? 'Pricing Change Request',
    fields: params.fields ?? [{
      label: 'Merchant name',
      type: WorkflowFieldType.string,
      description: 'Whose pricing do you want to change?'
    }, {
      label: 'Old price',
      type: WorkflowFieldType.amount,
      description: 'How much were they paying before?'
    }, {
      label: 'New price',
      type: WorkflowFieldType.amount,
      description: 'How much do we want to change it to?'
    }, {
      label: 'Reason for the change',
      type: WorkflowFieldType.text,
      description: 'How are we justifying this change?'
    }],
    steps: params.steps ?? [
      {
        status: WorkflowApprovalStatus.pending,
        approvals: [{
          approver: mockUser({ firstName: 'Agbani', lastName: 'Darego', email: 'a.darego@relayos.com', role: UserRole.Admin }),
          status: WorkflowApprovalStatus.pending
        }]
      },
      {
        status: WorkflowApprovalStatus.pending,
        approvals: [{
          approver: mockUser({ firstName: 'Ireti', lastName: 'Doyle', email: 'i.doyle@relayos.com', role: UserRole.Admin }),
          status: WorkflowApprovalStatus.pending
        }]
      }
    ],
    action: params.action ?? {
      actor: mockUser({ firstName: 'Raymond', lastName: 'Tukpe', email: 'r.tukpe@relayos.com', role: UserRole.WorkspaceManager }),
      status: WorkflowActionStatus.pending
    }
  }
}
