// @vitest-environment nuxt
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { vi, describe, it, beforeEach, expect } from 'vitest'
import { useApi } from '~/composables/useApi'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

const { mockUseFetch, mockUseNuxtApp } = vi.hoisted(() => {
  return {
    mockUseFetch: vi.fn(),
    mockUseNuxtApp: vi.fn(),
  }
})

mockNuxtImport('useFetch', () => mockUseFetch)
mockNuxtImport('useNuxtApp', () => mockUseNuxtApp)

describe('useApi', () => {
  const mockApi = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseNuxtApp.mockReturnValue({
      $api: mockApi
    })
    mockUseFetch.mockImplementation((url, options) => {
      return { url, options }
    })
  })

  describe('Basic functionality', () => {
    it('should call useFetch with the provided URL', () => {
      // Execute
      useApi('/test-endpoint')
      
      // Verify
      expect(mockUseFetch).toHaveBeenCalledWith('/test-endpoint', expect.anything(), expect.anything())
    })
    
    it('should pass the $api fetch instance from Nuxt app', () => {
      // Execute
      useApi('/test-endpoint')
      
      // Verify
      const callArgs = mockUseFetch.mock.calls[0];
      expect(callArgs[0]).toBe('/test-endpoint');
      expect(callArgs[1]).toHaveProperty('$fetch', mockApi);
    })
    
    it('should work with dynamic URL functions', () => {
      // Setup
      const urlFn = () => '/dynamic-endpoint'
      
      // Execute
      useApi(urlFn)
      
      // Verify
      const callArgs = mockUseFetch.mock.calls[0];
      expect(callArgs[0]).toBe(urlFn);
    })
  })

  describe('Options handling', () => {
    it('should pass options to useFetch', () => {
      // Setup
      const options = {
        method: 'POST' as HttpMethod,
        body: { data: 'test' },
        headers: { 'Content-Type': 'application/json' }
      }
      
      // Execute
      useApi('/test-endpoint', options)
      
      // Verify
      const callArgs = mockUseFetch.mock.calls[0];
      expect(callArgs[0]).toBe('/test-endpoint');
      expect(callArgs[1]).toMatchObject({
        method: 'POST',
        body: { data: 'test' },
        headers: { 'Content-Type': 'application/json' },
        $fetch: mockApi
      });
    })
    
    it('should merge custom options with default $fetch option', () => {
      // Setup
      const options = {
        key: 'custom-key',
        query: { param: 'value' }
      }
      
      // Execute
      useApi('/test-endpoint', options)
      
      // Verify
      const callArgs = mockUseFetch.mock.calls[0];
      expect(callArgs[0]).toBe('/test-endpoint');
      expect(callArgs[1]).toMatchObject({
        ...options,
        $fetch: mockApi
      });
    })
    
    it('should handle undefined options', () => {
      // Execute
      useApi('/test-endpoint')
      
      // Verify
      const callArgs = mockUseFetch.mock.calls[0];
      expect(callArgs[0]).toBe('/test-endpoint');
      expect(callArgs[1]).toHaveProperty('$fetch', mockApi);
    })
  })

  describe('Integration with Nuxt app', () => {
    it('should handle missing $api in Nuxt app', () => {
      // Setup
      mockUseNuxtApp.mockReturnValue({})
      
      // Execute
      useApi('/test-endpoint')
      
      // Verify
      const callArgs = mockUseFetch.mock.calls[0];
      expect(callArgs[0]).toBe('/test-endpoint');
      expect(callArgs[1]).toHaveProperty('$fetch', undefined);
    })
  })
})
