import { db } from './db'

/**
 * User roles in the system
 */
export enum UserRole {
  Admin = 'Admin',
  WorkspaceManager = 'Workspace Manager',
  FinanceApprover = 'Finance Approver',
  User = 'User',
}

/**
 * Permission types
 */
export enum Permission {
  // Workflow permissions
  CREATE_WORKFLOW = 'create_workflow',
  UPDATE_WORKFLOW = 'update_workflow',
  DELETE_WORKFLOW = 'delete_workflow',
  VIEW_ALL_WORKFLOWS = 'view_all_workflows',
  
  // Request permissions
  CREATE_REQUEST = 'create_request',
  VIEW_OWN_REQUESTS = 'view_own_requests',
  VIEW_ALL_REQUESTS = 'view_all_requests',
  APPROVE_REQUEST = 'approve_request',
  COMPLETE_REQUEST = 'complete_request',
  
  // Team permissions
  ADD_TEAM_MEMBER = 'add_team_member',
  REMOVE_TEAM_MEMBER = 'remove_team_member',
  UPDATE_USER_ROLE = 'update_user_role',
  VIEW_TEAM = 'view_team',
  
  // Workspace permissions
  UPDATE_WORKSPACE = 'update_workspace',
  VIEW_WORKSPACE = 'view_workspace',
}

/**
 * Role-based permissions mapping
 */
const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.Admin]: [
    // Admins have ALL permissions
    Permission.CREATE_WORKFLOW,
    Permission.UPDATE_WORKFLOW,
    Permission.DELETE_WORKFLOW,
    Permission.VIEW_ALL_WORKFLOWS,
    Permission.CREATE_REQUEST,
    Permission.VIEW_OWN_REQUESTS,
    Permission.VIEW_ALL_REQUESTS,
    Permission.APPROVE_REQUEST,
    Permission.COMPLETE_REQUEST,
    Permission.ADD_TEAM_MEMBER,
    Permission.REMOVE_TEAM_MEMBER,
    Permission.UPDATE_USER_ROLE,
    Permission.VIEW_TEAM,
    Permission.UPDATE_WORKSPACE,
    Permission.VIEW_WORKSPACE,
  ],
  [UserRole.WorkspaceManager]: [
    // Workspace Managers can manage workflows and team
    Permission.CREATE_WORKFLOW,
    Permission.UPDATE_WORKFLOW,
    Permission.DELETE_WORKFLOW,
    Permission.VIEW_ALL_WORKFLOWS,
    Permission.CREATE_REQUEST,
    Permission.VIEW_OWN_REQUESTS,
    Permission.APPROVE_REQUEST,
    Permission.COMPLETE_REQUEST,
    Permission.ADD_TEAM_MEMBER,
    Permission.VIEW_TEAM,
    Permission.UPDATE_WORKSPACE,
    Permission.VIEW_WORKSPACE,
  ],
  [UserRole.FinanceApprover]: [
    // Finance Approvers can approve and view requests
    Permission.CREATE_REQUEST,
    Permission.VIEW_OWN_REQUESTS,
    Permission.APPROVE_REQUEST,
    Permission.VIEW_TEAM,
    Permission.VIEW_WORKSPACE,
    Permission.VIEW_ALL_WORKFLOWS,
  ],
  [UserRole.User]: [
    // Regular users can create and view their own requests
    Permission.CREATE_REQUEST,
    Permission.VIEW_OWN_REQUESTS,
    Permission.VIEW_TEAM,
    Permission.VIEW_WORKSPACE,
    Permission.VIEW_ALL_WORKFLOWS,
  ],
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user: any, permission: Permission): boolean {
  if (!user || !user.role) {
    return false
  }
  
  const userRole = user.role as UserRole
  const permissions = rolePermissions[userRole] || []
  
  return permissions.includes(permission)
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(user: any, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(user, permission))
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(user: any, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(user, permission))
}

/**
 * Check if a user can view a specific request
 */
export function canViewRequest(user: any, request: any): boolean {
  if (!user || !request) {
    return false
  }
  
  // Admins can see all requests
  if (hasPermission(user, Permission.VIEW_ALL_REQUESTS)) {
    return true
  }
  
  // Users can see their own requests
  if (request.initiator_id === user.id) {
    return true
  }
  
  // Users can see requests they need to approve
  const workflow = db.workflow.findFirst({
    where: { id: { equals: request.workflow_id } }
  })
  
  if (workflow) {
    const approvals = db.workflowApproval.findMany({
      where: { workflow_id: { equals: workflow.id } }
    })
    
    const isApprover = approvals.some(approval => approval.approver_id === user.id)
    if (isApprover) {
      return true
    }
    
    // Users can see requests they need to action
    const actions = db.workflowAction.findMany({
      where: { workflow_id: { equals: workflow.id } }
    })
    
    const isActor = actions.some(action => action.actor_id === user.id)
    if (isActor) {
      return true
    }
  }
  
  // Users can see requests where they are observers
  if (request.observer_ids && request.observer_ids.includes(user.id)) {
    return true
  }
  
  return false
}

/**
 * Check if a user can approve a specific request
 */
export function canApproveRequest(user: any, request: any): boolean {
  if (!user || !request) {
    return false
  }
  
  // Must have approve permission
  if (!hasPermission(user, Permission.APPROVE_REQUEST)) {
    return false
  }
  
  // Can't approve own requests
  if (request.initiator_id === user.id) {
    return false
  }
  
  // Check if user is the current approver
  const workflow = db.workflow.findFirst({
    where: { id: { equals: request.workflow_id } }
  })
  
  if (!workflow) {
    return false
  }
  
  const workflowApprovals = db.workflowApproval.findMany({
    where: { workflow_id: { equals: workflow.id } }
  }).sort((a, b) => a.order - b.order)
  
  const requestApprovals = db.requestApproval.findMany({
    where: { request_id: { equals: request.id } }
  })
  
  // Find the current pending approval step
  for (const workflowApproval of workflowApprovals) {
    const requestApproval = requestApprovals.find(
      ra => ra.workflow_approval_id === workflowApproval.id
    )
    
    if (!requestApproval || requestApproval.status === 'Pending') {
      // This is the current approval step
      return workflowApproval.approver_id === user.id
    }
  }
  
  return false
}

/**
 * Check if a user can complete a specific request
 */
export function canCompleteRequest(user: any, request: any): boolean {
  if (!user || !request) {
    return false
  }
  
  // Must have complete permission
  if (!hasPermission(user, Permission.COMPLETE_REQUEST)) {
    return false
  }
  
  // Check if user is assigned as an actor
  const workflow = db.workflow.findFirst({
    where: { id: { equals: request.workflow_id } }
  })
  
  if (!workflow) {
    return false
  }
  
  const actions = db.workflowAction.findMany({
    where: { workflow_id: { equals: workflow.id } }
  })
  
  return actions.some(action => action.actor_id === user.id)
}

/**
 * Check if a user can edit/cancel a specific request
 */
export function canEditRequest(user: any, request: any): boolean {
  if (!user || !request) {
    return false
  }
  
  // Admins can edit any request
  if (user.role === UserRole.Admin) {
    return true
  }
  
  // Users can only edit their own requests
  // And only if they haven't been approved yet
  if (request.initiator_id === user.id) {
    const allowedStatuses = ['Changes Requested', 'Awaiting Approval']
    return allowedStatuses.includes(request.status)
  }
  
  return false
}

/**
 * Filter requests based on user permissions
 */
export function filterRequestsByPermission(user: any, requests: any[]): any[] {
  if (!user) {
    return []
  }
  
  // Admins can see all requests
  if (hasPermission(user, Permission.VIEW_ALL_REQUESTS)) {
    return requests
  }
  
  // Filter requests based on user's access
  return requests.filter(request => canViewRequest(user, request))
}

/**
 * Check if user is Admin
 */
export function isAdmin(user: any): boolean {
  return user?.role === UserRole.Admin
}

/**
 * Check if user is Workspace Manager or Admin
 */
export function isWorkspaceManagerOrAdmin(user: any): boolean {
  return user?.role === UserRole.Admin || user?.role === UserRole.WorkspaceManager
}

/**
 * Check if user is Finance Approver
 */
export function isFinanceApprover(user: any): boolean {
  return user?.role === UserRole.FinanceApprover
}
