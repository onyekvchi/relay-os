import { factory, primaryKey, nullable } from '@mswjs/data'

export const db = factory({
  user: {
    id: primaryKey(String),
    name: String,
    email: String,
    email_verified_at: nullable(String),
    created_at: () => new Date().toISOString(),
    updated_at: () => new Date().toISOString(),
  },
  token: {
    id: primaryKey(String),
    userId: String,
    token: String,
    expiresAt: () => new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days
    createdAt: () => new Date().toISOString(),
  },
})

// Seed initial data
export function seedDatabase() {
  // Clear existing data
  db.user.deleteMany({ where: {} })
  db.token.deleteMany({ where: {} })

  // Create demo user
  const demoUser = db.user.create({
    id: 'user-1',
    name: 'Demo User',
    email: 'demo@relayos.com',
    email_verified_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  // Create demo token
  db.token.create({
    id: 'token-1',
    userId: demoUser.id,
    token: 'demo-token-123',
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  })

  return { demoUser }
}
