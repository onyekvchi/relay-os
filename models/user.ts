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

export const sampleUser: User = {
  firstName: "Ciroma",
  lastName: "Adekunle",
  email: "c.adekunle@relayos.com",
  phonenumber: "+234 809 623 7816",
  role: UserRole.user
}

export const sampleAdminUsers: User[] = [{
  firstName: "Agbani",
  lastName: "Darego",
  email: "a.darego@relayos.com",
  phonenumber: "+234 809 623 7816",
  role: UserRole.admin
},
{
  firstName: "Ireti",
  lastName: "Doyle",
  email: "i.doyle@relayos.com",
  phonenumber: "+234 809 623 7816",
  role: UserRole.admin
}]

export const sampleITUser = {
  firstName: "Raymond",
  lastName: "Tukpe",
  email: "r.tukpe@relayos.com",
  phonenumber: "+234 809 623 7816",
  role: UserRole.IT
}