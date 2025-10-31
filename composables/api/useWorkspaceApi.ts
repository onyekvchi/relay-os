import type { 
  WorkspaceDTO,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  WorkspaceMemberDTO
} from '@/models/workspace'
import { HttpMethod, type ApiResponse } from '~/types/api'

export function useWorkspaceApi() {
  const { $api } = useNuxtApp()

  const createWorkspace = (request: CreateWorkspaceRequest) =>
    $api<ApiResponse<WorkspaceDTO>>('/workspaces', {
      method: HttpMethod.POST,
      body: request
    })

  const getWorkspace = (workspaceId: string) =>
    $api<ApiResponse<WorkspaceDTO>>(`/workspaces/${workspaceId}`)

  const updateWorkspace = (workspaceId: string, request: UpdateWorkspaceRequest) =>
    $api<ApiResponse<WorkspaceDTO>>(`/workspaces/${workspaceId}`, {
      method: HttpMethod.PATCH,
      body: request
    })

  const getWorkspaceMembers = (workspaceId: string) =>
    $api<ApiResponse<WorkspaceMemberDTO[]>>(`/workspaces/${workspaceId}/members`)

  return {
    createWorkspace,
    getWorkspace,
    updateWorkspace,
    getWorkspaceMembers
  }
}