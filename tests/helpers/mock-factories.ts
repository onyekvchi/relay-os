import type { UserData } from '~/types/auth'

export const createMockUser = (overrides: Partial<UserData> = {}): UserData => ({
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  email_verified_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  unread_emails_count: 0,
  ...overrides,
})

export const createMockAuthState = (overrides = {}) => ({
  user: createMockUser(),
  token: 'mock-jwt-token',
  expiry: Date.now() + 1000 * 60 * 60, // 1 hour from now
  ...overrides,
})
