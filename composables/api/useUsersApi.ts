import type { UserDTO, UpdateUserRequest } from '@/models/user/user.dto'
import type { ApiResponse } from '@/types/api'
import { HttpMethod } from '@/types/api'

/**
 * Composable for user API operations
 */

const { $api } = useNuxtApp()

export function useUsersApi() {
  /**
   * Fetch all users with optional role filter
   * @param role - Optional role filter
   */
  const getUsers = (role?: string) => {
    return useApi<ApiResponse<UserDTO[]>>('/users', {
      query: { role },
      method: HttpMethod.GET,
    })
  }

  /**
   * Fetch a single user by ID
   * @param id - User ID
   */
  const getUser = (id: string) => {
    return useApi<ApiResponse<UserDTO>>(`/users/${id}`, {
      method: HttpMethod.GET,
    })
  }

  /**
   * Get the current authenticated user
   */
  const getCurrentUser = () => {
    return useApi<ApiResponse<UserDTO>>('/users/me', {
      method: HttpMethod.GET,
    })
  }

  /**
   * Update a user
   * @param id - User ID
   * @param data - User update data
   */
  const updateUser = (id: string, data: UpdateUserRequest) => {
    return $api<ApiResponse<UserDTO>>(`/users/${id}`, {
      method: HttpMethod.PUT,
      body: data,
    })
  }

  return {
    getUsers,
    getUser,
    getCurrentUser,
    updateUser,
  }
}
