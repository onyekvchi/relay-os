export type User = {
  id: string,
  firstName: string,
  lastName: string,
  email: string,
  phoneNumber?: string,
  role: UserRole,
  lastActiveWorkspaceId?: string | null,
  twofaEnabled?: boolean,
  emailVerifiedAt?: string | null,
  createdAt: string,
  updatedAt: string
}

export enum UserRole {
  Admin = "Admin",
  WorkspaceManager = "Workspace Manager",
  FinanceApprover = "Finance Approver",
  User = "User"
}