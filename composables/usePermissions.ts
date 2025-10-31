import type { User } from '@/models/user/user.model'
import type { Request } from '@/models/request/request.model'
import { UserRole } from '@/models/user/user.model'

/**
 * Simplified role-based permissions composable for the frontend
 */
export function usePermissions() {
  const authStore = useAuthStore()
  const currentUser = computed(() => authStore.user)

  // ============================================
  // Role Checks
  // ============================================

  /**
   * Check if current user is an Admin
   */
  const isAdmin = computed(() => {
    return currentUser.value?.role === UserRole.Admin
  })

  /**
   * Check if current user is Workspace Manager or Admin
   */
  const isWorkspaceManagerOrAdmin = computed(() => {
    return currentUser.value?.role === UserRole.Admin || 
           currentUser.value?.role === UserRole.WorkspaceManager
  })

  /**
   * Check if current user is Finance Approver
   */
  const isFinanceApprover = computed(() => {
    return currentUser.value?.role === UserRole.FinanceApprover
  })

  /**
   * Check if current user is a regular User
   */
  const isRegularUser = computed(() => {
    return currentUser.value?.role === UserRole.User
  })

  // ============================================
  // Workflow Permissions (based on role)
  // ============================================

  /**
   * Can create/edit/delete workflows
   * Only Admin and Workspace Manager
   */
  const canManageWorkflows = computed(() => {
    return isWorkspaceManagerOrAdmin.value
  })

  // ============================================
  // Team Permissions (based on role)
  // ============================================

  /**
   * Can add team members
   * Only Admin and Workspace Manager
   */
  const canAddTeamMembers = computed(() => {
    return isAdmin.value || isWorkspaceManagerOrAdmin.value
  })

  /**
   * Can remove team members
   * Only Admin
   */
  const canRemoveTeamMembers = computed(() => {
    return isAdmin.value
  })

  /**
   * Can update user roles
   * Only Admin
   */
  const canUpdateUserRoles = computed(() => {
    return isAdmin.value
  })

  // ============================================
  // Workspace Permissions (based on role)
  // ============================================

  /**
   * Can update workspace settings
   * Only Admin and Workspace Manager
   */
  const canUpdateWorkspace = computed(() => {
    return isAdmin.value || isWorkspaceManagerOrAdmin.value
  })

  /**
   * Check if current user can view a specific request
   */
  const canViewRequest = (request: Request): boolean => {
    if (!currentUser.value) return false

    // Admins can see all requests
    if (isAdmin.value) return true

    // Users can see their own requests
    if (request.initiator.id === currentUser.value.id) return true

    // Users can see requests they need to approve
    const hasApproval = request.approvals?.some(
      approval => approval.workflowApproval?.approver?.id === currentUser.value!.id
    )
    if (hasApproval) return true

    // Users can see requests where they are assigned to active steps
    const hasActiveStepAssignment = request.activeSteps?.some(stepKey => {
      const step = request.workflow?.steps?.find(s => s.key === stepKey)
      return step?.assignees?.includes(currentUser.value?.id || '') || step?.assignee === currentUser.value?.id
    })
    if (hasActiveStepAssignment) return true

    // Users can see requests where they are observers
    const isObserver = request.observers?.some(
      observer => observer.id === currentUser.value?.id
    )
    if (isObserver) return true

    return false
  }

  /**
   * Check if current user can approve a specific request
   * Admin, Workspace Manager, and Finance Approver can approve
   */
  const canApproveRequest = (request: Request): boolean => {
    if (!currentUser.value) return false
    
    // Only Admin, Workspace Manager, and Finance Approver can approve
    if (!isAdmin.value && !isWorkspaceManagerOrAdmin.value && !isFinanceApprover.value) {
      return false
    }

    // Cannot approve own requests
    if (request.initiator.id === currentUser.value.id) return false

    // Must be the current approver (status is 'Pending' from WorkflowApprovalStatus enum)
    const currentApproval = request.approvals?.find(
      approval => approval.status === 'Pending' && approval.workflowApproval?.approver?.id === currentUser.value!.id
    )

    return !!currentApproval
  }

  /**
   * Check if current user can complete a specific request
   * Only Admin and Workspace Manager can complete
   */
  const canCompleteRequest = (request: Request): boolean => {
    if (!currentUser.value) return false
    
    // Only Admin and Workspace Manager can complete
    if (!isAdmin.value && !isWorkspaceManagerOrAdmin.value) {
      return false
    }

    // Must be assigned as an actor
    // Check if user is assigned to any active step
    return request.activeSteps?.some(stepKey => {
      const step = request.workflow?.steps?.find(s => s.key === stepKey)
      return step?.assignees?.includes(currentUser.value?.id || '') || step?.assignee === currentUser.value?.id
    }) || false
  }

  /**
   * Check if current user can edit/cancel a specific request
   */
  const canEditRequest = (request: Request): boolean => {
    if (!currentUser.value) return false

    // Admins can edit any request
    if (isAdmin.value) return true

    // Users can only edit their own requests
    if (request.initiator.id !== currentUser.value.id) return false

    // Can only edit if status allows it
    return request.status === 'Changes Requested' || request.status === 'Awaiting Approval'
  }

  return {
    // Current user
    currentUser,
    
    // Role checks
    isAdmin,
    isWorkspaceManagerOrAdmin,
    isFinanceApprover,
    isRegularUser,
    
    // Workflow permissions
    canManageWorkflows,
    
    // Team permissions
    canAddTeamMembers,
    canRemoveTeamMembers,
    canUpdateUserRoles,
    
    // Workspace permissions
    canUpdateWorkspace,
    
    // Request-specific permissions
    canViewRequest,
    canApproveRequest,
    canCompleteRequest,
    canEditRequest,
  }
}
