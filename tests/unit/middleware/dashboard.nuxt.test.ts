import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { vi, describe, it, beforeEach, expect } from 'vitest'
import dashboardMiddleware from '~/middleware/dashboard'
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
  const mockTo = { path: routes.dashboard, name: 'dashboard' } as any
  const mockFrom = { path: routes.signIn, name: 'signIn' } as any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Authenticated User', () => {
    it('should allow access when user is authenticated', () => {
      const mockClearAuth = vi.fn()
      
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true,
        clearAuth: mockClearAuth
      })

      const result = dashboardMiddleware(mockTo, mockFrom)

      expect(result).toBeUndefined()
      expect(mockClearAuth).not.toHaveBeenCalled()
      expect(mockNavigateTo).not.toHaveBeenCalled()
    })
  })

  describe('Unauthenticated User', () => {
    it('should redirect to signin when user is not authenticated', () => {
      const mockClearAuth = vi.fn()
      
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        clearAuth: mockClearAuth
      })

      dashboardMiddleware(mockTo, mockFrom)

      expect(mockClearAuth).toHaveBeenCalled()
      expect(mockNavigateTo).toHaveBeenCalledWith(routes.signIn)
    })

    it('should clear auth state before redirecting', () => {
      const mockClearAuth = vi.fn()
      
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        clearAuth: mockClearAuth
      })

      dashboardMiddleware(mockTo, mockFrom)

      expect(mockClearAuth).toHaveBeenCalledBefore(mockNavigateTo as any)
    })
  })

  describe('Route Context', () => {
    it('should work with different route destinations', () => {
      const mockClearAuth = vi.fn()
      const protectedRoute = { path: routes.dashboard, name: 'dashboard' } as any

      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        clearAuth: mockClearAuth
      })

      dashboardMiddleware(protectedRoute, mockFrom)

      expect(mockNavigateTo).toHaveBeenCalledWith(routes.signIn)
    })

    it('should work with different source routes', () => {
      const mockClearAuth = vi.fn()
      const differentFrom = { path: routes.dashboard, name: 'dashboard' } as any

      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        clearAuth: mockClearAuth
      })

      dashboardMiddleware(mockTo, differentFrom)

      expect(mockNavigateTo).toHaveBeenCalledWith(routes.signIn)
    })
  })
})
