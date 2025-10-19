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

export const sampleUser: User = {
  firstName: "Ciroma",
  lastName: "Adekunle",
  email: "c.adekunle@relayos.com",
  phonenumber: "+234 809 623 7816",
  role: UserRole.User
}

export const sampleAdminUsers: User[] = [{
  firstName: "Agbani",
  lastName: "Darego",
  email: "a.darego@relayos.com",
  phonenumber: "+234 809 623 7816",
  role: UserRole.Admin
},
{
  firstName: "Ireti",
  lastName: "Doyle",
  email: "i.doyle@relayos.com",
  phonenumber: "+234 809 623 7816",
  role: UserRole.Admin
}]

export const sampleWorkspaceManager = {
  firstName: "Raymond",
  lastName: "Tukpe",
  email: "r.tukpe@relayos.com",
  phonenumber: "+234 809 623 7816",
  role: UserRole.WorkspaceManager
}

export function createSampleUser(params: Partial<User> = {}): User {
  return {
    firstName: params.firstName ?? "Ciroma",
    lastName: params.lastName ??  "Adekunle",
    email: params.email ?? "c.adekunle@relayos.com",
    phonenumber: params.phonenumber ?? "+234 809 623 7816",
    role: params.role ?? UserRole.User
  }
}