import type { 
  WorkspaceDTO,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  WorkspaceMemberDTO
} from '@/models/workspace'
import { HttpMethod, type ApiResponse } from '~/types/api'

export function useWorkspaceApi() {
  const { $api } = useNuxtApp()
  const { getCurrentWorkspaceId } = useAuthStore()

  const createWorkspace = (request: CreateWorkspaceRequest) =>
    $api<ApiResponse<WorkspaceDTO>>('/workspaces', {
      method: HttpMethod.POST,
      body: request
    })

  const getCurrentWorkspace = () =>
    $api<ApiResponse<WorkspaceDTO>>(`/workspaces/${getCurrentWorkspaceId}`)

  const updateCurrentWorkspace = (request: UpdateWorkspaceRequest) =>
    $api<ApiResponse<WorkspaceDTO>>(`/workspaces/${getCurrentWorkspaceId}`, {
      method: HttpMethod.PATCH,
      body: request
    })

  const getCurrentWorkspaceMembers = () =>
    $api<ApiResponse<WorkspaceMemberDTO[]>>(`/workspaces/${getCurrentWorkspaceId}/members`)

  const inviteWorkspaceMember = (request: { email: string; first_name: string; last_name: string; role: string; job_role?: string }) =>
    $api<ApiResponse<any>>(`/workspaces/${getCurrentWorkspaceId}/members/invite`, {
      method: HttpMethod.POST,
      body: request
    })

  const updateWorkspaceMember = (userId: string, request: { role?: string; status?: string; job_role?: string }) =>
    $api<ApiResponse<WorkspaceMemberDTO>>(`/workspaces/${getCurrentWorkspaceId}/members/${userId}`, {
      method: HttpMethod.PATCH,
      body: request
    })

  const removeWorkspaceMember = (userId: string) =>
    $api<ApiResponse<null>>(`/workspaces/${getCurrentWorkspaceId}/members/${userId}`, {
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