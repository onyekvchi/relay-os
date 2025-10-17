import { db } from './db'

/**
 * Factory functions for creating mock data
 */

export function createMockUser(overrides?: Partial<{
  id: string
  name: string
  email: string
  email_verified_at: string | null | undefined
}>) {
  return db.user.create({
    id: overrides?.id || `user-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    name: overrides?.name || 'Test User',
    email: overrides?.email || `test-${Date.now()}@example.com`,
    email_verified_at: overrides?.email_verified_at !== undefined
      ? overrides.email_verified_at ?? undefined
      : new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
}

export function createMockToken(userId: string, overrides?: Partial<{
  token: string
  expiresAt: string
}>) {
  return db.token.create({
    id: `token-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    userId,
    token: overrides?.token || `token-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    expiresAt: overrides?.expiresAt || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  })
}

/**
 * Create a complete authenticated user session
 */
export function createAuthenticatedSession(userOverrides?: Parameters<typeof createMockUser>[0]) {
  const user = createMockUser(userOverrides)
  const token = createMockToken(user.id)

  return {
    user,
    token: token.token,
  }
}

/**
 * Reset the database and optionally seed with initial data
 */
export function resetDatabase(seed = true) {
  db.user.deleteMany({ where: {} })
  db.token.deleteMany({ where: {} })

  if (seed) {
    const { seedDatabase } = require('./db')
    return seedDatabase()
  }
}
