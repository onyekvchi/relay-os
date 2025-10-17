# MSW Mock Setup

This directory contains Mock Service Worker (MSW) configuration with persistent mock data using `@mswjs/data`.

## Structure

- **`db.ts`** - Mock database schema and seed data using @mswjs/data
- **`handlers.ts`** - MSW request handlers for API endpoints
- **`server.ts`** - MSW server setup for Node.js (tests)
- **`browser.ts`** - MSW worker setup for browser (development)
- **`factories.ts`** - Helper functions to create mock data

## Usage

### In Development

MSW is automatically enabled in development mode. The mock API will intercept requests to `http://localhost:8000/api/v1`.

**Demo Credentials:**
- Email: `demo@relayos.com`
- Password: Any password (mock doesn't validate)

### In Tests

MSW is automatically configured in the test setup (`tests/setup.ts`). All tests will use the mock API.

### Creating Mock Data

Use the factory functions to create mock data:

```typescript
import { createMockUser, createAuthenticatedSession, resetDatabase } from '~/mocks/factories'

// Create a user
const user = createMockUser({
  name: 'John Doe',
  email: 'john@example.com'
})

// Create authenticated session
const { user, token } = createAuthenticatedSession()

// Reset database
resetDatabase()
```

### Accessing the Database

The mock database persists data during a session:

```typescript
import { db } from '~/mocks/db'

// Query users
const users = db.user.findMany({
  where: {
    email: {
      contains: '@relayos.com'
    }
  }
})

// Update a user
db.user.update({
  where: {
    id: { equals: 'user-1' }
  },
  data: {
    name: 'Updated Name'
  }
})

// Delete a user
db.user.delete({
  where: {
    id: { equals: 'user-1' }
  }
})
```

## Available Endpoints

### Auth Endpoints

- `POST /api/v1/login` - User login
- `POST /api/v1/register` - User registration
- `GET /api/v1/verify-email?token=xxx` - Verify email
- `POST /api/v1/resend-verification` - Resend verification email
- `POST /api/v1/forgot-password` - Request password reset
- `POST /api/v1/reset-password` - Reset password

## Disabling MSW

To disable MSW in development, set the environment variable:

```bash
NUXT_PUBLIC_ENABLE_MSW=false npm run dev
```

## Adding New Endpoints

1. Add the model to `db.ts`
2. Create handlers in `handlers.ts`
3. Add factory functions in `factories.ts`

Example:

```typescript
// db.ts
export const db = factory({
  // ... existing models
  request: {
    id: primaryKey(String),
    userId: String,
    title: String,
    description: String,
    status: String,
    createdAt: () => new Date().toISOString(),
  }
})

// handlers.ts
http.get(`${API_BASE}/requests`, () => {
  const requests = db.request.getAll()
  return HttpResponse.json({
    success: true,
    data: requests
  })
})

// factories.ts
export function createMockRequest(overrides) {
  return db.request.create({
    id: `request-${Date.now()}`,
    ...overrides
  })
}
```
