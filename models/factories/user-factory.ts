import { UserRole, type User } from '@/models/user'

export function mockUser(params: Partial<User> = {}): User {
  return {
    firstName: params.firstName ?? 'Pam',
    lastName: params.lastName ?? 'Beesly',
    email: params.email ?? 'p.beesly@relayos.com',
    phonenumber: params.phonenumber ?? '+234 802 000 0002',
    role: params.role ?? UserRole.User
  }
}