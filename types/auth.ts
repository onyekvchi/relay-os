export type LoginRequest = {
  email: string
  password: string
  device_name: string
}

export type RegisterRequest = {
  first_name: string
  last_name: string
  email: string
  password: string
  password_confirmation: string
  device_name: string
}

export type ForgotPasswordRequest = {
  email: string
}

export type ResetPasswordRequest = {
  token: string
  new_password: string
}

export type UpdateProfileRequest = {
  first_name?: string
  last_name?: string
}

export type UpdatePasswordRequest = {
  current_password: string
  new_password: string
}

export type UserData = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  role: string
  created_at: string
  updated_at: string
}

export type LoginData = {
  token: string
  user: UserData
}

export type RegisterData = {
  token: string
  user: UserData
}