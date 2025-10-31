import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { createMockUser } from '~/tests/helpers/mock-factories'
import SigninForm from '~/components/auth/signin-form.vue'
import { nextTick } from 'vue'
import { routes } from '~/routes'

const { mockLogin, mockSetAuth, mockNavigateTo } = vi.hoisted(() => {
  return {
    mockLogin: vi.fn(),
    mockSetAuth: vi.fn(),
    mockNavigateTo: vi.fn(),
  }
})

mockNuxtImport('useAuthApi', () => {
  return () => ({
    login: mockLogin,
  })
})

mockNuxtImport('useAuthStore', () => {
  return () => ({
    setAuth: mockSetAuth,
  })
})

mockNuxtImport('navigateTo', () => mockNavigateTo)

describe('SigninForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLogin.mockClear()
    mockSetAuth.mockClear()
    mockNavigateTo.mockClear()
  })

  describe('Form Submission', () => {
    it('should prevent submission when form fields are empty', async () => {
      const wrapper = await mountSuspended(SigninForm)
      
      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.exists()).toBe(true)
      
      await submitButton.trigger('click')
      await nextTick()
      
      expect(mockLogin).not.toHaveBeenCalled()
      expect(mockSetAuth).not.toHaveBeenCalled()
      expect(mockNavigateTo).not.toHaveBeenCalled()
    })

    it('should log user in and navigate to dashboard on successful submission', async () => {
      const mockUser = createMockUser()
      const mockResponse = {
        data: {
          user: mockUser,
          token: 'mock-token',
        },
      }
      
      mockLogin.mockResolvedValue(mockResponse)
      
      const wrapper = await mountSuspended(SigninForm)
      
      const emailInput = wrapper.find('input[type="email"]')
      const passwordInput = wrapper.find('input[type="password"]')
      
      await emailInput.setValue('test@example.com')
      await passwordInput.setValue('password123')
      await nextTick()
      
      const form = wrapper.find('form')
      await form.trigger('submit')
      await nextTick()
      
      await new Promise(resolve => setTimeout(resolve, 200))
      
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
      
      expect(mockSetAuth).toHaveBeenCalledWith({
        user: mockUser,
        token: 'mock-token',
      })
      
      expect(mockNavigateTo).toHaveBeenCalledWith(routes.dashboard)
    })
  })
})
