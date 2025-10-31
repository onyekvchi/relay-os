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

  return {
    createWorkspace,
    getCurrentWorkspace,
    updateCurrentWorkspace,
    getCurrentWorkspaceMembers
  }
}