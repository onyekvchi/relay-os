import type { UpdateProfileRequest, UpdatePasswordRequest, UserData } from '~/types/auth'
import type { ApiResponse } from '~/types/api'

export const useSettingsApi = () => {
  /**
   * Get current user's profile
   */
  const getProfile = async () => {
    return useApi<ApiResponse<UserData>>('/settings/profile', {
      method: 'GET',
    })
  }

  /**
   * Update current user's profile
   */
  const updateProfile = async (data: UpdateProfileRequest) => {
    return useApi<ApiResponse<UserData>>('/settings/profile', {
      method: 'PATCH',
      body: data,
    })
  }

  /**
   * Update password
   */
  const updatePassword = async (data: UpdatePasswordRequest) => {
    return useApi<ApiResponse<null>>('/settings/security', {
      method: 'PATCH',
      body: data,
    })
  }

  /**
   * Get team members (WorkspaceManager/Admin only)
   */
  const getTeamMembers = async () => {
    return useApi<ApiResponse<UserData[]>>('/settings/workspace/team', {
      method: 'GET',
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
      method: 'POST',
      body: data,
    })
  }

  /**
   * Remove team member (Admin only)
   */
  const removeTeamMember = async (userId: string) => {
    return useApi<ApiResponse<null>>(`/settings/workspace/team/${userId}`, {
      method: 'DELETE',
    })
  }

  return {
    getProfile,
    updateProfile,
    updatePassword,
    getTeamMembers,
    addTeamMember,
    removeTeamMember,
  }
}
