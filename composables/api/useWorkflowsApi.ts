import type { WorkflowDTO, CreateWorkflowRequest, UpdateWorkflowRequest } from '@/models/workflow/workflow.dto'
import type { ApiResponse } from '@/types/api'
import { HttpMethod } from '@/types/api'

/**
 * Composable for workflow API operations
 */

const { $api } = useNuxtApp()

export function useWorkflowsApi() {
  /**
   * Fetch all workflows
   * @param includeArchived - Whether to include archived workflows
   */
  const getWorkflows = (includeArchived = false) => {
    return useApi<ApiResponse<WorkflowDTO[]>>('/workflows', {
      query: { includeArchived },
      method: HttpMethod.GET,
    })
  }

  /**
   * Fetch a single workflow by ID
   * @param id - Workflow ID
   */
  const getWorkflow = (id: string) => {
    return useApi<ApiResponse<WorkflowDTO>>(`/workflows/${id}`, {
      method: HttpMethod.GET,
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
    })
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
    })
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
