/**
 * Simplified workspace member type for UI components
 * Maps from WorkspaceMemberDTO for display purposes
 */
export interface WorkspaceMember {
  id: string
  firstName: string
  lastName: string
  email: string
  role?: string
}
