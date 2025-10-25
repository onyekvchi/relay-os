// MSW Configuration for Safari compatibility
// This file is loaded before the service worker to ensure proper initialization

if (typeof window !== 'undefined') {
  // Safari fix: Ensure service worker is supported
  if (!('serviceWorker' in navigator)) {
    console.warn('⚠️ Service Workers are not supported in this browser. MSW will not work.')
  }

  // Safari fix: Handle service worker update issues
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 Service Worker controller changed, reloading...')
      // Optionally reload to ensure fresh state
      // window.location.reload()
    })
  }
}
