export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  const enableMSW = config.public.enableMSW !== false // Default to true in dev

  // Only enable MSW in development
  if (enableMSW) {
    try {
      const { worker } = await import('~/mocks/browser')
      const { seedDatabase, isSeeded } = await import('~/mocks/db')
      const { seedDemoData } = await import('~/mocks/factories')

      // Only seed if not already seeded (prevents data loss on hot reload)
      if (!isSeeded()) {
        seedDatabase()
        seedDemoData()
        console.log('🌱 Database seeded')
      } else {
        console.log('✅ Database already seeded, skipping')
      }

      // Start the worker with Safari-compatible options
      await worker.start({
        onUnhandledRequest: 'bypass',
        // Safari compatibility: Use quiet mode to avoid console spam
        quiet: false,
        // Increase timeout for slower connections
        waitUntilReady: true,
        // Safari fix: Ensure service worker updates properly
        serviceWorker: {
          url: '/mockServiceWorker.js',
          options: {
            scope: '/',
          },
        },
      })

      // Verify worker is actually intercepting
      const handlers = worker.listHandlers()
      console.log('🔶 MSW enabled for API mocking')
      console.log(`   ${handlers.length} handlers registered`)
      console.log('   Demo user: demo@relayos.com (any password)')

      // Safari fix: Ensure service worker stays active
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          console.log('✅ Service Worker ready:', registration.active?.state)
        })
      }
    } catch (error) {
      console.error('❌ Failed to start MSW:', error)
      console.error('   API requests will fail. Check service worker registration.')
    }
  }
})
