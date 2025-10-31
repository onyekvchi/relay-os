/**
 * Auth DTOs - API layer types for authentication
 * These match the backend API structure exactly
 */

import type { UserDTO } from '../user/user.dto'

export interface LoginRequest {
  email: string
  password: string
  device_name: string
}

export interface RegisterRequest {
  first_name: string
  last_name: string
  email: string
  password: string
  password_confirmation: string
  device_name: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  new_password: string
}

export interface UpdateProfileRequest {
  first_name?: string
  last_name?: string
  phone_number?: string
}

export interface UpdatePasswordRequest {
  current_password: string
  new_password: string
}

export interface LoginData {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: UserDTO
}

export interface RegisterData {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: UserDTO
}

export interface RefreshTokenRequest {
  refresh_token: string
}

export interface RefreshTokenData {
  access_token: string
  token_type: string
  expires_in: number
}
