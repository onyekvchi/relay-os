import type { UpdateProfileRequest, UpdatePasswordRequest } from '@/models/auth'
import type { UserDTO } from '@/models/user/user.dto'
import type { ApiResponse } from '~/types/api'
import { HttpMethod } from '~/types/api'

/**
 * Composable for settings API operations
 */
export function useSettingsApi() {
  const { $api } = useNuxtApp()
  
  /**
   * Get current user's profile
   */
  const getProfile = () => {
    return useApi<ApiResponse<UserDTO>>('/settings/profile', {
      method: HttpMethod.GET,
    })
  }

  /**
   * Update current user's profile
   */
  const updateProfile = (data: UpdateProfileRequest) => {
    return $api<ApiResponse<UserDTO>>('/settings/profile', {
      method: HttpMethod.PATCH,
      body: data,
    }).then(response => response.data!)
  }

  /**
   * Update password
   */
  const updatePassword = (data: UpdatePasswordRequest) => {
    return $api<ApiResponse<null>>('/settings/security', {
      method: HttpMethod.PATCH,
      body: data,
    })
  }

  /**
   * Get team members (WorkspaceManager/Admin only)
   */
  const getTeamMembers = () => {
    return useApi<ApiResponse<UserDTO[]>>('/settings/workspace/team', {
      method: HttpMethod.GET,
    })
  }

  /**
   * Add team member (WorkspaceManager/Admin only)
   */
  const addTeamMember = (data: {
    email: string
    first_name: string
    last_name: string
    role: string
  }) => {
    return $api<ApiResponse<UserDTO>>('/settings/workspace/team', {
      method: HttpMethod.POST,
      body: data,
    }).then(response => response.data!)
  }

  /**
   * Remove team member (Admin only)
   */
  const removeTeamMember = (userId: string) => {
    return $api<ApiResponse<null>>(`/settings/workspace/team/${userId}`, {
      method: HttpMethod.DELETE,
    })
  }

  /**
   * Get workspace settings
   */
  const getWorkspace = () => {
    return useApi<ApiResponse<{ name: string; logo?: string }>>('/settings/workspace', {
      method: HttpMethod.GET,
    })
  }

  /**
   * Update workspace settings
   */
  const updateWorkspace = (data: { name: string; logo?: string }) => {
    return $api<ApiResponse<{ name: string; logo?: string }>>('/settings/workspace', {
      method: HttpMethod.PATCH,
      body: data,
    }).then(response => response.data!)
  }

  return {
    getProfile,
    updateProfile,
    updatePassword,
    getTeamMembers,
    addTeamMember,
    removeTeamMember,
    getWorkspace,
    updateWorkspace,
  }
}
