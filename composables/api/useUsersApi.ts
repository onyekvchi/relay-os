import type { User } from '@/models/user/user.model'
import type { UserDTO, UpdateUserRequest } from '@/models/user/user.dto'
import { UserMapper } from '@/models/user/user.mapper'
import type { ApiResponse } from '@/types/api'
import { HttpMethod } from '@/types/api'

/**
 * Composable for user API operations
 */
export function useUsersApi() {
  const { $api } = useNuxtApp()
  /**
   * Fetch all users with optional role filter
   * @param role - Optional role filter
   */
  const getUsers = (role?: string) => {
    return useApi<User[]>('/users', {
      query: { role },
      method: HttpMethod.GET,
      transform: (response: ApiResponse<UserDTO[]>) => {
        if (!response?.data) return []
        return response.data.map((dto: UserDTO) => UserMapper.toModel(dto))
      },
    })
  }

  /**
   * Fetch a single user by ID
   * @param id - User ID
   */
  const getUser = (id: string) => {
    return useApi<User | null>(`/users/${id}`, {
      method: HttpMethod.GET,
      transform: (response: ApiResponse<UserDTO>) => {
        if (!response?.data) return null
        return UserMapper.toModel(response.data)
      },
    })
  }

  /**
   * Get the current authenticated user
   */
  const getCurrentUser = () => {
    return useApi<User | null>('/users/me', {
      method: HttpMethod.GET,
      transform: (response: ApiResponse<UserDTO>) => {
        if (!response?.data) return null
        return UserMapper.toModel(response.data)
      },
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
    }).then(response => UserMapper.toModel(response.data!))
  }

  const getUserWorkspaces = () =>
    $api<ApiResponse<any[]>>('/users/me/workspaces')

  const updateLastActiveWorkspace = (workspaceId: string) =>
    $api<ApiResponse<null>>('/users/me/last-active-workspace', {
      method: HttpMethod.PUT,
      body: { workspace_id: workspaceId }
    })

  return {
    getUsers,
    getUser,
    getCurrentUser,
    updateUser,
    getUserWorkspaces,
    updateLastActiveWorkspace,
  }
}
