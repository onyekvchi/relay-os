export type User = {
  firstName: string,
  lastName: string,
  email: string,
  phonenumber: string,
  role: UserRole
}

export enum UserRole {
  Admin = "Admin",
  WorkspaceManager = "Workspace Manager",
  FinanceApprover = "Finance Approver",
  User = "User"
}