// @vitest-environment nuxt
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import apiPlugin from '~/plugins/api'
import { routes } from '~/routes'

// Hoisted mocks
const { mockUseAuthStore, mock$fetchCreate, mockNavigateTo } = vi.hoisted(() => {
  return {
    mockUseAuthStore: vi.fn(),
    mock$fetchCreate: vi.fn(),
    mockNavigateTo: vi.fn(),
  }
})

// Mock dependencies
mockNuxtImport('useAuthStore', () => mockUseAuthStore)
mockNuxtImport('navigateTo', () => mockNavigateTo)

// Mock global $fetch.create
global.$fetch = {
  create: mock$fetchCreate,
} as any

// Mock useRuntimeConfig
mockNuxtImport('useRuntimeConfig', () => () => ({
  public: {
    apiBase: 'http://api.test.com',
  },
}))

describe('~/plugins/api.ts', () => {
  let nuxtApp: any

  beforeEach(() => {
    vi.clearAllMocks()
    nuxtApp = {
      runWithContext: vi.fn(fn => fn()),
    }
  })

  it('should add Authorization header if token exists in auth store', () => {
    // Arrange
    const token = 'test-jwt-token'
    mockUseAuthStore.mockReturnValue({ token })

    // Act: Initialize the plugin
    apiPlugin(nuxtApp)

    // Assert: Check that $fetch.create was called with the correct options
    expect(mock$fetchCreate).toHaveBeenCalledOnce()
    const fetchOptions = mock$fetchCreate.mock.calls[0][0]
    expect(fetchOptions).toBeDefined()

    // Simulate a request to trigger the onRequest interceptor
    const requestOptions: { headers?: Headers } = { headers: new Headers() }
    fetchOptions.onRequest({ options: requestOptions })

    // Assert that the header was set correctly
    expect(requestOptions.headers?.get('Authorization')).toBe(`Bearer ${token}`)
  })

  it('should not add Authorization header if token does not exist', () => {
    // Arrange
    mockUseAuthStore.mockReturnValue({ token: null })

    // Act
    apiPlugin(nuxtApp)

    // Assert
    const fetchOptions = mock$fetchCreate.mock.calls[0][0]
    const requestOptions: { headers?: Headers } = { headers: new Headers() }
    fetchOptions.onRequest({ options: requestOptions })

    expect(requestOptions.headers?.has('Authorization')).toBe(false)
  })

  it('should clear auth and navigate to signin on 401 error', async () => {
    // Arrange
    const mockClearAuth = vi.fn()
    mockUseAuthStore.mockReturnValue({ clearAuth: mockClearAuth })

    // Act
    apiPlugin(nuxtApp)

    // Assert
    const fetchOptions = mock$fetchCreate.mock.calls[0][0]
    const mockResponse = { status: 401, statusText: 'Unauthorized' }

    // Simulate a response error
    await fetchOptions.onResponseError({ response: mockResponse })

    // Check that auth was cleared and user was redirected
    expect(nuxtApp.runWithContext).toHaveBeenCalledOnce()
    expect(mockClearAuth).toHaveBeenCalledOnce()
    expect(mockNavigateTo).toHaveBeenCalledWith(routes.signIn)
  })
})
