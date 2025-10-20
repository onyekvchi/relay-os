import { UserRole, type User } from './user.model'

export function mockUser(params: Partial<User> = {}): User {
  return {
    id: params.id ?? `user-${Date.now()}`,
    firstName: params.firstName ?? 'Pam',
    lastName: params.lastName ?? 'Beesly',
    email: params.email ?? 'p.beesly@relayos.com',
    phonenumber: params.phonenumber ?? '+234 802 000 0002',
    role: params.role ?? UserRole.User,
    createdAt: params.createdAt ?? new Date().toISOString(),
    updatedAt: params.updatedAt ?? new Date().toISOString()
  }
}