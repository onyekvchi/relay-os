import type { 
  LoginRequest, 
  RegisterRequest, 
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RefreshTokenRequest,
  LoginData,
  RegisterData,
  RefreshTokenData
} from '@/models/auth'
import { HttpMethod, type ApiResponse } from '~/types/api'

/**
 * Composable for authentication API operations
 */
export function useAuthApi() {
  const { $api } = useNuxtApp()

  const login = (request: LoginRequest) =>
      $api<ApiResponse<LoginData>>('/auth/login', {
        method: HttpMethod.POST,
        body: request
      })
  
  const register = (request: RegisterRequest) =>
      $api<ApiResponse<RegisterData>>('/auth/register', {
        method: HttpMethod.POST,
        body: request
      })
  
  const forgotPassword = (request: ForgotPasswordRequest) =>
      $api<ApiResponse<null>>('/auth/forgot-password', {
        method: HttpMethod.POST,
        body: request
      })
  
  const resetPassword = (request: ResetPasswordRequest) =>
      $api<ApiResponse<null>>('/auth/reset-password', {
        method: HttpMethod.POST,
        body: request
      })

  const refreshToken = (request: RefreshTokenRequest) =>
      $api<ApiResponse<RefreshTokenData>>('/auth/refresh', {
        method: HttpMethod.POST,
        body: request
      })

  const enable2FA = () =>
      $api<ApiResponse<any>>('/auth/2fa/enable', {
        method: HttpMethod.POST
      })

  const verify2FA = (request: { email: string; code: string }) =>
      $api<ApiResponse<any>>('/auth/2fa/verify', {
        method: HttpMethod.POST,
        body: request
      })

  const changePassword = (request: { current_password: string; new_password: string }) =>
      $api<ApiResponse<null>>('/auth/change-password', {
        method: HttpMethod.POST,
        body: request
      })

  const getSessions = () =>
      $api<ApiResponse<any[]>>('/auth/sessions')

  const revokeSession = (sessionId: string) =>
      $api<ApiResponse<null>>(`/auth/sessions/${sessionId}`, {
        method: HttpMethod.DELETE
      })

  const logoutAllSessions = () =>
      $api<ApiResponse<null>>('/auth/sessions/logout-all', {
        method: HttpMethod.POST
      })

  const logout = () =>
      $api<ApiResponse<null>>('/auth/logout', {
        method: HttpMethod.POST
      })

  return {
    login,
    register,
    forgotPassword,
    resetPassword,
    refreshToken,
    enable2FA,
    verify2FA,
    changePassword,
    getSessions,
    revokeSession,
    logoutAllSessions,
    logout
  }
}
