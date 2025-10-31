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
   * Update current user profile
   * @param data - User update data
   */
  const updateCurrentUser = (data: UpdateUserRequest) => {
    return $api<ApiResponse<UserDTO>>('/users/me', {
      method: HttpMethod.PATCH,
      body: data,
    }).then(response => UserMapper.toModel(response.data!))
  }

  /**
   * Update a user (admin only)
   * @param id - User ID
   * @param data - User update data
   */
  const updateUser = (id: string, data: UpdateUserRequest) => {
    return $api<ApiResponse<UserDTO>>(`/users/${id}`, {
      method: HttpMethod.PATCH,
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

  const getMyTasks = (filters?: { status?: string; workspace_id?: string }) =>
    $api<ApiResponse<any[]>>('/users/me/tasks', {
      query: filters
    })

  return {
    getCurrentUser,
    updateCurrentUser,
    updateUser,
    getUserWorkspaces,
    updateLastActiveWorkspace,
    getMyTasks,
  }
}
