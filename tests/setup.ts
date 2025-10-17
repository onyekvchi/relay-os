import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from '~/mocks/server'
import { seedDatabase } from '~/mocks/db'

// Establish API mocking before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
  console.log('🔶 MSW Server started for tests')
})

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => {
  server.resetHandlers()
  // Reseed database after each test
  seedDatabase()
})

// Clean up after the tests are finished
afterAll(() => {
  server.close()
})
