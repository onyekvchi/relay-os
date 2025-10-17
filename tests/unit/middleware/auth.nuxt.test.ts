import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { vi, describe, it, beforeEach, expect } from 'vitest'
import authMiddleware from '~/middleware/auth'
import { routes } from '~/routes'

const { mockUseAuthStore, mockNavigateTo } = vi.hoisted(() => {
  return {
    mockUseAuthStore: vi.fn(),
    mockNavigateTo: vi.fn(),
  }
})

mockNuxtImport('useAuthStore', () => mockUseAuthStore)
mockNuxtImport('navigateTo', () => mockNavigateTo)

describe('Auth Middleware', () => {
  const mockTo = { path: routes.signIn, name: 'signIn' } as any
  const mockFrom = { path: routes.dashboard, name: 'dashboard' } as any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Authenticated User', () => {
    it('should redirect to dashboard when user is authenticated', () => {
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true
      })

      authMiddleware(mockTo, mockFrom)

      expect(mockNavigateTo).toHaveBeenCalledWith(routes.dashboard)
    })

    it('should redirect authenticated users away from signin page', () => {
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true
      })

      authMiddleware(mockTo, mockFrom)

      expect(mockNavigateTo).toHaveBeenCalledWith(routes.dashboard)
    })

    it('should redirect authenticated users away from any auth page', () => {
      const signupRoute = { path: '/signup', name: 'signup' } as any

      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true
      })

      authMiddleware(signupRoute, mockFrom)

      expect(mockNavigateTo).toHaveBeenCalledWith(routes.dashboard)
    })
  })

  describe('Unauthenticated User', () => {
    it('should allow access when user is not authenticated', () => {
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false
      })

      const result = authMiddleware(mockTo, mockFrom)

      expect(result).toBeUndefined()
      expect(mockNavigateTo).not.toHaveBeenCalled()
    })

    it('should not redirect unauthenticated users from signin page', () => {
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false
      })

      authMiddleware(mockTo, mockFrom)

      expect(mockNavigateTo).not.toHaveBeenCalled()
    })
  })

  describe('Route Context', () => {
    it('should work with different auth page destinations', () => {
      const forgotPasswordRoute = { path: '/forgot-password', name: 'forgot-password' } as any

      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true
      })

      authMiddleware(forgotPasswordRoute, mockFrom)

      expect(mockNavigateTo).toHaveBeenCalledWith(routes.dashboard)
    })

    it('should work with different source routes', () => {
      const differentFrom = { path: '/landing', name: 'landing' } as any

      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true
      })

      authMiddleware(mockTo, differentFrom)

      expect(mockNavigateTo).toHaveBeenCalledWith(routes.dashboard)
    })
  })
})
