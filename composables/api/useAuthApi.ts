import type { 
  LoginRequest, 
  RegisterRequest, 
  ForgotPasswordRequest,
  ResetPasswordRequest,
  LoginData,
  RegisterData
} from '~/types/auth';
import { HttpMethod, type ApiResponse } from '~/types/api';

/**
 * Composable for authentication API operations
 */
export function useAuthApi() {
  const { $api } = useNuxtApp()

  const login = (request: LoginRequest) =>
      $api<ApiResponse<LoginData>>('/login', {
        method: HttpMethod.POST,
        body: request
      })
  
  const register = (request: RegisterRequest) =>
      $api<ApiResponse<RegisterData>>('/register', {
        method: HttpMethod.POST,
        body: request
      })
  
  const forgotPassword = (request: ForgotPasswordRequest) =>
      $api<ApiResponse<null>>('/forgot-password', {
        method: HttpMethod.POST,
        body: request
      })
  
  const resetPassword = (request: ResetPasswordRequest) =>
      $api<ApiResponse<null>>('/reset-password', {
        method: HttpMethod.POST,
        body: request
      })
  
  const verifyEmail = (token: string) =>
      $api<ApiResponse<LoginData>>('/verify-email', {
        query: { token }
      })
  
  const resendVerification = (request: { email: string }) =>
      $api<ApiResponse<null>>('/resend-verification', {
        method: HttpMethod.POST,
        body: request
      })

  return {
    login,
    register,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification
  }
}
