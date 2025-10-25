import type { User } from '~/models/user'
import { UserRole } from '~/models/user'

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-1',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  phoneNumber: '+234 800 000 0000',
  role: UserRole.User,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

export const createMockAuthState = (overrides = {}) => ({
  user: createMockUser(),
  token: 'mock-jwt-token',
  expiry: Date.now() + 1000 * 60 * 60, // 1 hour from now
  ...overrides,
})
