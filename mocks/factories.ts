import { db } from './db'

/**
 * Factory functions for creating mock data
 */

export function createMockUser(overrides?: Partial<{
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  role: string
  email_verified_at: string | null | undefined
}>) {
  return db.user.create({
    id: overrides?.id || `user-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    first_name: overrides?.first_name || 'Test',
    last_name: overrides?.last_name || 'User',
    email: overrides?.email || `test-${Date.now()}@example.com`,
    phone_number: overrides?.phone_number || '+234 800 000 0000',
    role: overrides?.role || 'User',
    email_verified_at: overrides?.email_verified_at !== undefined
      ? overrides.email_verified_at ?? undefined
      : new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
}

export function createMockToken(userId: string, overrides?: Partial<{
  token: string
  expiresAt: string
}>) {
  return db.token.create({
    id: `token-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    userId,
    token: overrides?.token || `token-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    expiresAt: overrides?.expiresAt || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  })
}

/**
 * Create a complete authenticated user session
 */
export function createAuthenticatedSession(userOverrides?: Parameters<typeof createMockUser>[0]) {
  const user = createMockUser(userOverrides)
  const token = createMockToken(user.id)

  return {
    user,
    token: token.token,
  }
}

/**
 * Reset the database and optionally seed with initial data
 */
export function resetDatabase(seed = true) {
  db.user.deleteMany({ where: {} })
  db.token.deleteMany({ where: {} })
  db.workflow.deleteMany({ where: {} })
  db.workflowField.deleteMany({ where: {} })
  db.workflowApproval.deleteMany({ where: {} })
  db.workflowAction.deleteMany({ where: {} })
  db.request.deleteMany({ where: {} })
  db.requestLog.deleteMany({ where: {} })
  db.requestApproval.deleteMany({ where: {} })

  if (seed) {
    const { seedDatabase } = require('./db')
    return seedDatabase()
  }
}

/**
 * Create a mock workflow with fields, approvals, and action
 */
export function createMockWorkflow(overrides?: Partial<{
  id: string
  name: string
  description: string
  is_archived: boolean
  created_by_id: string
  fields: Array<{ label: string; type: string; description: string; required: boolean }>
  approver_ids: string[]
  actor_id: string
}>) {
  const workflowId = overrides?.id || `workflow-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
  
  // Create workflow
  const workflow = db.workflow.create({
    id: workflowId,
    name: overrides?.name || 'Test Workflow',
    description: overrides?.description || 'A test workflow',
    is_archived: overrides?.is_archived || false,
    created_by_id: overrides?.created_by_id || 'user-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  // Create fields
  const fields = overrides?.fields || [
    { label: 'Field 1', type: 'string', description: 'Test field', required: true },
  ]
  
  fields.forEach((field, index) => {
    db.workflowField.create({
      id: `field-${workflowId}-${index}`,
      workflow_id: workflowId,
      label: field.label,
      type: field.type,
      description: field.description,
      required: field.required,
      order: index,
    })
  })

  // Create approvals
  const approverIds = overrides?.approver_ids || ['user-2']
  approverIds.forEach((approverId, index) => {
    db.workflowApproval.create({
      id: `approval-${workflowId}-${index}`,
      workflow_id: workflowId,
      approver_id: approverId,
      order: index,
    })
  })

  // Create action
  db.workflowAction.create({
    id: `action-${workflowId}`,
    workflow_id: workflowId,
    actor_id: overrides?.actor_id || 'user-2',
  })

  return workflow
}

/**
 * Create a mock request with logs and approvals
 */
export function createMockRequest(overrides?: Partial<{
  id: string
  workflow_id: string
  initiator_id: string
  status: string
  field_values: Record<string, any>
  observer_ids: string[]
}>) {
  const requestId = overrides?.id || `request-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
  const workflowId = overrides?.workflow_id || 'workflow-1'
  const initiatorId = overrides?.initiator_id || 'user-4'
  
  // Create request
  const request = db.request.create({
    id: requestId,
    workflow_id: workflowId,
    initiator_id: initiatorId,
    status: overrides?.status || 'Awaiting Approval',
    field_values: JSON.stringify(overrides?.field_values || { 'Field 1': 'Test value' }),
    observer_ids: JSON.stringify(overrides?.observer_ids || []),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  // Create initial log
  db.requestLog.create({
    id: `log-${requestId}-1`,
    request_id: requestId,
    action: 'create',
    user_id: initiatorId,
    comment: null,
    created_at: new Date().toISOString(),
  })

  // Create request approvals based on workflow approvals
  const workflowApprovals = db.workflowApproval.findMany({
    where: { workflow_id: { equals: workflowId } },
  })

  workflowApprovals.forEach((approval, index) => {
    db.requestApproval.create({
      id: `req-approval-${requestId}-${index}`,
      request_id: requestId,
      workflow_approval_id: approval.id,
      status: 'Pending',
      comment: null,
      actioned_at: null,
      actioned_by_id: null,
    })
  })

  return request
}

/**
 * Seed the database with initial demo data
 * Creates a demo user that can always be used for login
 */
export function seedDemoData() {
  // Check if demo user already exists
  const existingDemo = db.user.findFirst({
    where: { email: { equals: 'demo@relayos.com' } }
  })

  if (existingDemo) {
    return // Demo user already exists
  }

  // Create demo user (Admin role for full access)
  createMockUser({
    id: 'demo-user',
    first_name: 'Demo',
    last_name: 'User',
    email: 'demo@relayos.com',
    phone_number: '+234 800 123 4567',
    role: 'Admin'
  })

  console.log('✅ Demo user created: demo@relayos.com (password: any)')
}
