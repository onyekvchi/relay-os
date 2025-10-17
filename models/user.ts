export type User = {
  firstName: string,
  lastName: string,
  email: string,
  phonenumber: string,
  role: UserRole
}

export enum UserRole {
  admin, user, finance, IT
}

export const sampleUser = {
  firstName: "Ciroma",
  lastName: "Adekunle",
  email: "c.adekunle@relayos.com",
  phonenumber: "+234 809 623 7816",
  role: UserRole.user
}