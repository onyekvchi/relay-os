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
  token: string
  user: UserDTO
}

export interface RegisterData {
  token: string
  user: UserDTO
}
