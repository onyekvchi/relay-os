// @vitest-environment nuxt
import { setActivePinia, createPinia } from 'pinia'
import { vi, describe, it, beforeEach, expect } from 'vitest'
import { useAuthStore } from '~/stores/auth'
import { createMockUser } from '~/tests/helpers/mock-factories'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const authStore = useAuthStore()
      
      expect(authStore.user).toBeNull()
      expect(authStore.token).toBeNull()
      expect(authStore.expiry).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
    })
  })

  describe('Authentication State', () => {
    it('should be authenticated when user, token, and valid expiry exist', () => {
      const authStore = useAuthStore()
      const mockUser = createMockUser()
      const mockToken = 'valid-token'
      
      authStore.setAuth({ user: mockUser, token: mockToken })
      
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.getUser).toEqual(mockUser)
      expect(authStore.getToken).toBe(mockToken)
      expect(authStore.getUserId).toBe(mockUser.id)
    })

    it('should not be authenticated when token is missing', () => {
      const authStore = useAuthStore()
      const mockUser = createMockUser()
      
      authStore.setUser(mockUser)
      
      expect(authStore.isAuthenticated).toBe(false)
    })

    it('should not be authenticated when user is missing', () => {
      const authStore = useAuthStore()
      
      authStore.setToken('valid-token')
      
      expect(authStore.isAuthenticated).toBe(false)
    })

    it('should not be authenticated when expiry is in the past', () => {
      const authStore = useAuthStore()
      const mockUser = createMockUser()
      
      authStore.setUser(mockUser)
      authStore.setToken('valid-token')
      authStore.expiry = Date.now() - 1000 // 1 second ago
      
      expect(authStore.isAuthenticated).toBe(false)
    })
  })

  describe('Auth Actions', () => {
    it('should set auth data correctly', () => {
      const authStore = useAuthStore()
      const mockUser = createMockUser()
      const mockToken = 'test-token'
      
      authStore.setAuth({ user: mockUser, token: mockToken })
      
      expect(authStore.user).toEqual(mockUser)
      expect(authStore.token).toBe(mockToken)
      expect(authStore.expiry).toBeGreaterThan(Date.now())
      expect(authStore.isAuthenticated).toBe(true)
    })

    it('should clear auth data correctly', () => {
      const authStore = useAuthStore()
      const mockUser = createMockUser()
      
      // Set auth first
      authStore.setAuth({ user: mockUser, token: 'test-token' })
      expect(authStore.isAuthenticated).toBe(true)
      
      // Clear auth
      authStore.clearAuth()
      
      expect(authStore.user).toBeNull()
      expect(authStore.token).toBeNull()
      expect(authStore.expiry).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
    })

    it('should set user individually', () => {
      const authStore = useAuthStore()
      const mockUser = createMockUser()
      
      authStore.setUser(mockUser)
      
      expect(authStore.user).toEqual(mockUser)
      expect(authStore.getUser).toEqual(mockUser)
    })

    it('should set token individually', () => {
      const authStore = useAuthStore()
      const mockToken = 'individual-token'
      
      authStore.setToken(mockToken)
      
      expect(authStore.token).toBe(mockToken)
      expect(authStore.getToken).toBe(mockToken)
    })
  })

  describe('Computed Properties', () => {
    it('should return correct user ID', () => {
      const authStore = useAuthStore()
      const mockUser = createMockUser()
      
      authStore.setUser(mockUser)
      
      expect(authStore.getUserId).toBe(mockUser.id)
    })

    it('should return undefined user ID when no user', () => {
      const authStore = useAuthStore()
      
      expect(authStore.getUserId).toBeUndefined()
    })
  })
})
