export type User = {
  id: string,
  firstName: string,
  lastName: string,
  email: string,
  phonenumber: string,
  role: UserRole,
  createdAt: string,
  updatedAt: string
}

export enum UserRole {
  Admin = "Admin",
  WorkspaceManager = "Workspace Manager",
  FinanceApprover = "Finance Approver",
  User = "User"
}