import type { UpdateProfileRequest, UpdatePasswordRequest, UserData } from '~/types/auth'
import type { ApiResponse } from '~/types/api'
import { HttpMethod } from '~/types/api'

/**
 * Composable for settings API operations
 */
export function useSettingsApi() {
  /**
   * Get current user's profile
   */
  const getProfile = async () => {
    return useApi<ApiResponse<UserData>>('/settings/profile', {
      method: HttpMethod.GET,
    })
  }

  /**
   * Update current user's profile
   */
  const updateProfile = async (data: UpdateProfileRequest) => {
    return useApi<ApiResponse<UserData>>('/settings/profile', {
      method: HttpMethod.PATCH,
      body: data,
    })
  }

  /**
   * Update password
   */
  const updatePassword = async (data: UpdatePasswordRequest) => {
    return useApi<ApiResponse<null>>('/settings/security', {
      method: HttpMethod.PATCH,
      body: data,
    })
  }

  /**
   * Get team members (WorkspaceManager/Admin only)
   */
  const getTeamMembers = async () => {
    return useApi<ApiResponse<UserData[]>>('/settings/workspace/team', {
      method: HttpMethod.GET,
    })
  }

  /**
   * Add team member (WorkspaceManager/Admin only)
   */
  const addTeamMember = async (data: {
    email: string
    first_name: string
    last_name: string
    role: string
  }) => {
    return useApi<ApiResponse<UserData>>('/settings/workspace/team', {
      method: HttpMethod.POST,
      body: data,
    })
  }

  /**
   * Remove team member (Admin only)
   */
  const removeTeamMember = async (userId: string) => {
    return useApi<ApiResponse<null>>(`/settings/workspace/team/${userId}`, {
      method: HttpMethod.DELETE,
    })
  }

  /**
   * Get workspace settings
   */
  const getWorkspace = async () => {
    return useApi<ApiResponse<{ name: string; logo?: string }>>('/settings/workspace', {
      method: HttpMethod.GET,
    })
  }

  /**
   * Update workspace settings
   */
  const updateWorkspace = async (data: { name: string; logo?: string }) => {
    return useApi<ApiResponse<{ name: string; logo?: string }>>('/settings/workspace', {
      method: HttpMethod.PATCH,
      body: data,
    })
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
