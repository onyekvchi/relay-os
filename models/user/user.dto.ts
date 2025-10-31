/**
 * User DTOs - API layer types
 * These match the backend API structure exactly
 */

export interface UserDTO {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number?: string
  role?: string
  last_active_workspace_id?: string
  twofa_enabled?: boolean
  email_verified_at?: string
  created_at: string
  updated_at: string
}

export interface CreateUserRequest {
  first_name: string
  last_name: string
  email: string
  phone_number: string
  role: string
}

export interface UpdateUserRequest {
  first_name?: string
  last_name?: string
  phone_number?: string
  role?: string
}
