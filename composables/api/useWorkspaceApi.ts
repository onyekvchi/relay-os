import type { 
  WorkspaceDTO,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  WorkspaceMemberDTO
} from '@/models/workspace'
import { HttpMethod, type ApiResponse } from '~/types/api'

export function useWorkspaceApi() {
  const { $api } = useNuxtApp()
  const authStore = useAuthStore()

  const createWorkspace = (request: CreateWorkspaceRequest) =>
    $api<ApiResponse<WorkspaceDTO>>('/workspaces', {
      method: HttpMethod.POST,
      body: request
    })

  const getCurrentWorkspace = () =>
    $api<ApiResponse<WorkspaceDTO>>(`/workspaces/${authStore.getCurrentWorkspaceId}`)

  const updateCurrentWorkspace = (request: UpdateWorkspaceRequest) =>
    $api<ApiResponse<WorkspaceDTO>>(`/workspaces/${authStore.getCurrentWorkspaceId}`, {
      method: HttpMethod.PATCH,
      body: request
    })

  const getCurrentWorkspaceMembers = () =>
    $api<ApiResponse<WorkspaceMemberDTO[]>>(`/workspaces/${authStore.getCurrentWorkspaceId}/members`)

  const inviteWorkspaceMember = (request: { email: string; first_name: string; last_name: string; role: string; job_role?: string }) =>
    $api<ApiResponse<any>>(`/workspaces/${authStore.getCurrentWorkspaceId}/members/invite`, {
      method: HttpMethod.POST,
      body: request
    })

  const updateWorkspaceMember = (userId: string, request: { role?: string; status?: string; job_role?: string }) =>
    $api<ApiResponse<WorkspaceMemberDTO>>(`/workspaces/${authStore.getCurrentWorkspaceId}/members/${userId}`, {
      method: HttpMethod.PATCH,
      body: request
    })

  const removeWorkspaceMember = (userId: string) =>
    $api<ApiResponse<null>>(`/workspaces/${authStore.getCurrentWorkspaceId}/members/${userId}`, {
      method: HttpMethod.DELETE
    })

  return {
    createWorkspace,
    getCurrentWorkspace,
    updateCurrentWorkspace,
    getCurrentWorkspaceMembers,
    inviteWorkspaceMember,
    updateWorkspaceMember,
    removeWorkspaceMember
  }
}