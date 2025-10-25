import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from '~/mocks/server'
import { seedDatabase, resetSeededFlag } from '~/mocks/db'

// Establish API mocking before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
  console.log('🔶 MSW Server started for tests')
})

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => {
  server.resetHandlers()
  // Reset seeded flag and reseed database after each test
  resetSeededFlag()
  seedDatabase()
})

// Clean up after the tests are finished
afterAll(() => {
  server.close()
})
