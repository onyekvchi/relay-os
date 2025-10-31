import { factory, primaryKey, nullable, oneOf, manyOf } from '@mswjs/data'

// Track if database has been seeded to prevent data loss on hot reload
let _isSeeded = false

export const db = factory({
  // Auth & Users
  user: {
    id: primaryKey(String),
    first_name: String,
    last_name: String,
    email: String,
    phone_number: String,
    role: String, // 'Admin', 'Workspace Manager', 'Finance Approver', 'User'
    email_verified_at: nullable(String),
    created_at: () => new Date().toISOString(),
    updated_at: () => new Date().toISOString(),
  },
  token: {
    id: primaryKey(String),
    userId: String,
    token: String,
    expiresAt: () => new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: () => new Date().toISOString(),
  },

  // Workflows
  workflow: {
    id: primaryKey(String),
    name: String,
    workflow_key: String,
    version: Number,
    status: String, // 'draft', 'published', 'archived'
    start_key: String,
    description: nullable(String),
    steps: String, // JSON stringified array
    created_by_id: String,
    created_at: () => new Date().toISOString(),
    updated_at: () => new Date().toISOString(),
  },
  workflowField: {
    id: primaryKey(String),
    workflow_id: String,
    key: String,
    label: String,
    type: String, // 'short_text', 'long_text', 'currency', 'amount', 'select', 'multi_select', 'date', 'datetime', 'boolean', 'email', 'url'
    description: String,
    required: Boolean,
    position: Number,
    options: nullable(String), // JSON stringified array
  },
  workflowApproval: {
    id: primaryKey(String),
    workflow_id: String,
    approver_id: String,
    order: Number,
  },
  workflowAction: {
    id: primaryKey(String),
    workflow_id: String,
    actor_id: String,
  },

  // Requests
  request: {
    id: primaryKey(String),
    workflow_id: String,
    initiator_id: String,
    status: String, // 'pending', 'completed', 'rejected', 'cancelled'
    field_values: String, // JSON stringified (legacy for context)
    active_steps: String, // JSON stringified array
    observer_ids: String, // JSON stringified array
    created_at: () => new Date().toISOString(),
    updated_at: () => new Date().toISOString(),
  },
  requestLog: {
    id: primaryKey(String),
    request_id: String,
    action: String, // 'create', 'approve', 'requestChange', 'reject', 'cancel', 'complete', 'comment', 'update'
    user_id: String,
    comment: nullable(String),
    created_at: () => new Date().toISOString(),
  },
  requestApproval: {
    id: primaryKey(String),
    request_id: String,
    workflow_approval_id: String,
    status: String, // 'Pending', 'Approved', 'Rejected'
    comment: nullable(String),
    actioned_at: nullable(String),
    actioned_by_id: nullable(String),
  },
})

// Seed initial data
export function seedDatabase() {
  // Clear existing data
  db.user.deleteMany({ where: {} })
  db.token.deleteMany({ where: {} })
  db.workflow.deleteMany({ where: {} })
  db.workflowField.deleteMany({ where: {} })
  db.workflowApproval.deleteMany({ where: {} })
  db.workflowAction.deleteMany({ where: {} })
  db.request.deleteMany({ where: {} })
  db.requestLog.deleteMany({ where: {} })
  db.requestApproval.deleteMany({ where: {} })

  // Create demo users with different roles (The Office cast)
  const admin = db.user.create({
    id: 'user-1',
    first_name: 'Michael',
    last_name: 'Scott',
    email: 'm.scott@relayos.com',
    phone_number: '+234 800 000 0001',
    role: 'Admin',
    email_verified_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  const workspaceManager = db.user.create({
    id: 'user-2',
    first_name: 'Dwight',
    last_name: 'Schrute',
    email: 'd.schrute@relayos.com',
    phone_number: '+234 800 000 0002',
    role: 'Workspace Manager',
    email_verified_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  const financeApprover = db.user.create({
    id: 'user-3',
    first_name: 'Angela',
    last_name: 'Martin',
    email: 'a.martin@relayos.com',
    phone_number: '+234 800 000 0003',
    role: 'Finance Approver',
    email_verified_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  const regularUser = db.user.create({
    id: 'user-4',
    first_name: 'Jim',
    last_name: 'Halpert',
    email: 'j.halpert@relayos.com',
    phone_number: '+234 800 000 0004',
    role: 'User',
    email_verified_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  // Create demo token for admin
  db.token.create({
    id: 'token-1',
    userId: admin.id,
    token: 'demo-token-123',
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  })

  // Create sample workflows
  const pricingWorkflow = db.workflow.create({
    id: 'workflow-1',
    name: 'Pricing Change Request',
    description: 'Request to change customer pricing',
    workflow_key: 'pricing_change',
    version: 1,
    status: 'published',
    start_key: 'start',
    steps: JSON.stringify([]),
    created_by_id: workspaceManager.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  // Add fields to pricing workflow
  db.workflowField.create({
    id: 'field-1-1',
    workflow_id: pricingWorkflow.id,
    label: 'Merchant name',
    type: 'short_text',
    description: 'Whose pricing do you want to change?',
    required: true,
    key: 'merchant_name',
    position: 0,
    options: null,
  })

  db.workflowField.create({
    id: 'field-1-2',
    workflow_id: pricingWorkflow.id,
    label: 'Old price',
    type: 'amount',
    description: 'How much were they paying before?',
    required: true,
    key: 'old_price',
    position: 1,
    options: null,
  })

  db.workflowField.create({
    id: 'field-1-3',
    workflow_id: pricingWorkflow.id,
    label: 'New price',
    type: 'amount',
    description: 'How much do we want to change it to?',
    required: true,
    key: 'new_price',
    position: 2,
    options: null,
  })

  db.workflowField.create({
    id: 'field-1-4',
    workflow_id: pricingWorkflow.id,
    label: 'Reason for the change',
    type: 'long_text',
    description: 'How are we justifying this change?',
    required: true,
    key: 'reason',
    position: 3,
    options: null,
  })

  // Add approvals
  // Approval system replaced by step-based workflow



  // Create sample requests
  const request1 = db.request.create({
    id: 'request-1',
    workflow_id: pricingWorkflow.id,
    initiator_id: regularUser.id,
    status: 'Awaiting Approval',
    field_values: JSON.stringify({
      'Merchant name': 'Acme Corp',
      'Old price': '5000',
      'New price': '4500',
      'Reason for the change': 'Customer requested a discount due to volume increase.'
    }),
    observer_ids: JSON.stringify([]),
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  })

  // Add log for request creation
  db.requestLog.create({
    id: 'log-1-1',
    request_id: request1.id,
    action: 'create',
    user_id: regularUser.id,
    comment: null,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  })

  // Create request approvals
  db.requestApproval.create({
    id: 'req-approval-1-1',
    request_id: request1.id,
    workflow_approval_id: 'approval-1-1',
    status: 'Pending',
    comment: null,
    actioned_at: null,
    actioned_by_id: null,
  })

  db.requestApproval.create({
    id: 'req-approval-1-2',
    request_id: request1.id,
    workflow_approval_id: 'approval-1-2',
    status: 'Pending',
    comment: null,
    actioned_at: null,
    actioned_by_id: null,
  })

  // Create a completed request
  const request2 = db.request.create({
    id: 'request-2',
    workflow_id: pricingWorkflow.id,
    initiator_id: regularUser.id,
    status: 'Completed',
    field_values: JSON.stringify({
      'Merchant name': 'TechStart Inc',
      'Old price': '3000',
      'New price': '2500',
      'Reason for the change': 'Early adopter discount program.'
    }),
    observer_ids: JSON.stringify([]),
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  })

  // Add logs for completed request
  db.requestLog.create({
    id: 'log-2-1',
    request_id: request2.id,
    action: 'create',
    user_id: regularUser.id,
    comment: null,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  })

  db.requestLog.create({
    id: 'log-2-2',
    request_id: request2.id,
    action: 'approve',
    user_id: admin.id,
    comment: 'Approved - looks good',
    created_at: new Date(Date.now() - 4.5 * 24 * 60 * 60 * 1000).toISOString(),
  })

  db.requestLog.create({
    id: 'log-2-3',
    request_id: request2.id,
    action: 'approve',
    user_id: financeApprover.id,
    comment: 'Final approval granted',
    created_at: new Date(Date.now() - 4.2 * 24 * 60 * 60 * 1000).toISOString(),
  })

  db.requestLog.create({
    id: 'log-2-4',
    request_id: request2.id,
    action: 'complete',
    user_id: workspaceManager.id,
    comment: 'Pricing updated in system',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  })

  // Create approvals for completed request
  db.requestApproval.create({
    id: 'req-approval-2-1',
    request_id: request2.id,
    workflow_approval_id: 'approval-1-1',
    status: 'Approved',
    comment: 'Approved - looks good',
    actioned_at: new Date(Date.now() - 4.5 * 24 * 60 * 60 * 1000).toISOString(),
    actioned_by_id: admin.id,
  })

  db.requestApproval.create({
    id: 'req-approval-2-2',
    request_id: request2.id,
    workflow_approval_id: 'approval-1-2',
    status: 'Approved',
    comment: 'Final approval granted',
    actioned_at: new Date(Date.now() - 4.2 * 24 * 60 * 60 * 1000).toISOString(),
    actioned_by_id: financeApprover.id,
  })

  // Mark as seeded
  _isSeeded = true
  
  return { admin, workspaceManager, financeApprover, regularUser, pricingWorkflow, request1, request2 }
}

/**
 * Check if database has been seeded
 * Prevents data loss on hot module reload
 */
export function isSeeded(): boolean {
  return _isSeeded
}

/**
 * Reset the seeded flag (useful for tests)
 */
export function resetSeededFlag(): void {
  _isSeeded = false
}
