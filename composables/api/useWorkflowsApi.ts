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
  /**
   * Fetch all workflows
   * @param includeArchived - Whether to include archived workflows
   */
  const getWorkflows = (includeArchived = false) => {
    return useApi<Workflow[]>('/workflows', {
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
    return useApi<Workflow | null>(`/workflows/${id}`, {
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
    return $api<ApiResponse<WorkflowDTO>>('/workflows', {
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
    return $api<ApiResponse<WorkflowDTO>>(`/workflows/${id}`, {
      method: HttpMethod.PUT,
      body: data,
    }).then(response => WorkflowMapper.toModel(response.data!))
  }

  /**
   * Archive a workflow (soft delete)
   * @param id - Workflow ID
   */
  const archiveWorkflow = (id: string) => {
    return $api<ApiResponse>(`/workflows/${id}`, {
      method: HttpMethod.DELETE,
    })
  }

  return {
    getWorkflows,
    getWorkflow,
    createWorkflow,
    updateWorkflow,
    archiveWorkflow,
  }
}
