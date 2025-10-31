import type { Workflow } from '@/models/workflow/workflow.model'
import type { WorkflowDTO, CreateWorkflowRequest, UpdateWorkflowRequest } from '@/models/workflow/workflow.dto'
import { WorkflowMapper } from '@/models/workflow/workflow.mapper'
import type { ApiResponse } from '@/types/api'
import { HttpMethod } from '@/types/api'

/**
 * Composable for workflow API operations
 */
export function useWorkflowsApi() {
  const { $api } = useNuxtApp()
  const { getCurrentWorkspaceId } = useAuthStore()

  const getWorkflows = (includeArchived = false) => {
    return useApi<Workflow[]>(`/workspaces/${getCurrentWorkspaceId}/workflows`, {
      query: { includeArchived },
      method: HttpMethod.GET,
      transform: (response: ApiResponse<WorkflowDTO[]>) => {
        if (!response?.data) return []
        return WorkflowMapper.toModelList(response.data)
      },
    })
  }

  /**
   * Fetch a single workflow by ID
   * @param id - Workflow ID
   */
  const getWorkflow = (id: string) => {
    return useApi<Workflow | null>(`/workspaces/${getCurrentWorkspaceId}/workflows/${id}`, {
      method: HttpMethod.GET,
      transform: (response: ApiResponse<WorkflowDTO>) => {
        if (!response?.data) return null
        return WorkflowMapper.toModel(response.data)
      },
    })
  }

  /**
   * Create a new workflow
   * @param data - Workflow creation data
   */
  const createWorkflow = (data: CreateWorkflowRequest) => {
    return $api<ApiResponse<WorkflowDTO>>(`/workspaces/${getCurrentWorkspaceId}/workflows`, {
      method: HttpMethod.POST,
      body: data,
    }).then(response => WorkflowMapper.toModel(response.data!))
  }

  /**
   * Update an existing workflow
   * @param id - Workflow ID
   * @param data - Workflow update data
   */
  const updateWorkflow = (id: string, data: UpdateWorkflowRequest) => {
    return $api<ApiResponse<WorkflowDTO>>(`/workspaces/${getCurrentWorkspaceId}/workflows/${id}`, {
      method: HttpMethod.PATCH,
      body: data,
    }).then(response => WorkflowMapper.toModel(response.data!))
  }

  const publishWorkflow = (id: string) => {
    return $api<ApiResponse<WorkflowDTO>>(`/workspaces/${getCurrentWorkspaceId}/workflows/${id}/publish`, {
      method: HttpMethod.POST,
    }).then(response => WorkflowMapper.toModel(response.data!))
  }

  const archiveWorkflow = (id: string) => {
    return $api<ApiResponse<WorkflowDTO>>(`/workspaces/${getCurrentWorkspaceId}/workflows/${id}/archive`, {
      method: HttpMethod.POST,
    }).then(response => WorkflowMapper.toModel(response.data!))
  }

  const cloneWorkflow = (id: string, baseOnVersion?: number) => {
    return $api<ApiResponse<WorkflowDTO>>(`/workspaces/${getCurrentWorkspaceId}/workflows/${id}/clone`, {
      method: HttpMethod.POST,
      body: baseOnVersion ? { base_on_version: baseOnVersion } : {}
    }).then(response => WorkflowMapper.toModel(response.data!))
  }

  const getWorkflowVersions = (id: string) => {
    return $api<ApiResponse<any>>(`/workspaces/${getCurrentWorkspaceId}/workflows/${id}/versions`)
  }

  const getWorkflowVersion = (id: string, version: number) => {
    return $api<ApiResponse<WorkflowDTO>>(`/workspaces/${getCurrentWorkspaceId}/workflows/${id}/versions/${version}`)
      .then(response => WorkflowMapper.toModel(response.data!))
  }

  return {
    getWorkflows,
    getWorkflow,
    createWorkflow,
    updateWorkflow,
    publishWorkflow,
    archiveWorkflow,
    cloneWorkflow,
    getWorkflowVersions,
    getWorkflowVersion,
  }
}
