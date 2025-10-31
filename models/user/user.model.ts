export type User = {
  id: string,
  firstName: string,
  lastName: string,
  email: string,
  phoneNumber?: string,
  role: UserRole,
  lastActiveWorkspaceId?: string,
  twofaEnabled?: boolean,
  emailVerifiedAt?: string,
  createdAt: string,
  updatedAt: string
}

export enum UserRole {
  Admin = "Admin",
  WorkspaceManager = "Workspace Manager",
  FinanceApprover = "Finance Approver",
  User = "User"
}