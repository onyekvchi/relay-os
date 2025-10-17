export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  const enableMSW = config.public.enableMSW !== false // Default to true in dev

  // Only enable MSW in development
  if (process.env.NODE_ENV === 'development' && enableMSW) {
    const { worker } = await import('~/mocks/browser')
    const { seedDatabase } = await import('~/mocks/db')

    // Seed the database
    seedDatabase()

    // Start the worker
    await worker.start({
      onUnhandledRequest: 'bypass', // Don't warn about unhandled requests
    })

    console.log('🔶 MSW enabled for API mocking')
    console.log('   Demo user: demo@relayos.com (any password)')
  }
})
