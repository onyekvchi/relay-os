import { http, HttpResponse } from 'msw'
import { db } from '../db'
import { getCurrentUser } from './auth.handlers'
import { hasPermission, Permission } from '../permissions'
import type { CreateWorkflowRequest, UpdateWorkflowRequest, WorkflowDTO } from '@/models/workflow/workflow.dto'
import type { UserDTO } from '@/models/user/user.dto'

const API_BASE = 'http://localhost:8000/api/v1'

/**
 * Helper to build WorkflowDTO with nested objects
 */
export function buildWorkflowDTO(workflow: any): WorkflowDTO {
  // Get creator
  const creator = db.user.findFirst({
    where: { id: { equals: workflow.created_by_id } },
  })

  // Get fields
  const fields = db.workflowField.findMany({
    where: { workflow_id: { equals: workflow.id } },
  }).sort((a, b) => a.position - b.position)

  // Step-based system doesn't use separate approval/action entities

  return {
    id: workflow.id,
    name: workflow.name,
    workflow_key: workflow.workflow_key || 'default_key',
    version: workflow.version || 1,
    status: workflow.status || 'published',
    start_key: workflow.start_key || 'start',
    description: workflow.description,
    fields: fields.map(f => ({
      id: f.id,
      key: f.key || f.label.toLowerCase().replace(/\s+/g, '_'),
      label: f.label,
      type: f.type as any,
      description: f.description,
      required: f.required,
      position: f.position || 0,
      options: f.options ? JSON.parse(f.options) : undefined
    })) as any,
    steps: workflow.steps || [],
    created_by: creator as UserDTO,
    created_at: workflow.created_at,
    updated_at: workflow.updated_at,
  }
}

export const workflowHandlers = [
  // GET /workflows - List all workflows
  http.get(`${API_BASE}/workflows`, ({ request }) => {
    const url = new URL(request.url)
    const includeArchived = url.searchParams.get('include_archived') === 'true'

    const workflows = db.workflow.findMany({
      where: includeArchived ? {} : {
        status: { equals: 'published' },
      },
    })

    const workflowDTOs = workflows.map(w => buildWorkflowDTO(w))

    return HttpResponse.json({
      success: true,
      data: workflowDTOs,
    })
  }),

  // GET /workflows/:id - Get single workflow
  http.get(`${API_BASE}/workflows/:id`, ({ params }) => {
    const { id } = params

    const workflow = db.workflow.findFirst({
      where: { id: { equals: id as string } },
    })

    if (!workflow) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Workflow not found',
        },
        { status: 404 }
      )
    }

    const workflowDTO = buildWorkflowDTO(workflow)

    return HttpResponse.json({
      success: true,
      data: workflowDTO,
    })
  }),

  // POST /workflows - Create workflow
  http.post(`${API_BASE}/workflows`, async ({ request }) => {
    const user = getCurrentUser(request)

    if (!user) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    // Check permission: Only Admin and Workspace Manager can create workflows
    if (!hasPermission(user, Permission.CREATE_WORKFLOW)) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Insufficient permissions to create workflows',
        },
        { status: 403 }
      )
    }

    const body = await request.json() as CreateWorkflowRequest

    // Validate required fields
    if (!body.name || !body.workflow_key || !body.start_key || !body.fields || !body.steps) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Missing required fields',
          errors: ['name, workflow_key, start_key, fields, and steps are required'],
        },
        { status: 422 }
      )
    }

    // Create workflow
    const workflowId = `workflow-${Date.now()}`
    const workflow = db.workflow.create({
      id: workflowId,
      name: body.name,
      workflow_key: body.workflow_key,
      version: body.version || 1,
      status: body.status || 'draft',
      start_key: body.start_key,
      description: body.description || null,
      steps: JSON.stringify(body.steps || []),
      created_by_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    // Create fields
    body.fields.forEach((field, index) => {
      db.workflowField.create({
        id: `field-${workflowId}-${index}`,
        workflow_id: workflowId,
        key: field.key || field.label.toLowerCase().replace(/\s+/g, '_'),
        label: field.label,
        type: field.type,
        description: field.description,
        required: field.required,
        position: field.position || index,
        options: field.options ? JSON.stringify(field.options) : null
      })
    })

    // Steps are stored directly in the workflow object for the step-based system

    const workflowDTO = buildWorkflowDTO(workflow)

    return HttpResponse.json({
      success: true,
      message: 'Workflow created successfully',
      data: workflowDTO,
    }, { status: 201 })
  }),

  // PUT /workflows/:id - Update workflow
  http.put(`${API_BASE}/workflows/:id`, async ({ params, request }) => {
    const user = getCurrentUser(request)

    if (!user) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    // Check permission: Only Admin and Workspace Manager can update workflows
    if (!hasPermission(user, Permission.UPDATE_WORKFLOW)) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Insufficient permissions to update workflows',
        },
        { status: 403 }
      )
    }

    const { id } = params
    const body = await request.json() as UpdateWorkflowRequest

    const workflow = db.workflow.findFirst({
      where: { id: { equals: id as string } },
    })

    if (!workflow) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Workflow not found',
        },
        { status: 404 }
      )
    }

    // Update workflow
    const updatedWorkflow = db.workflow.update({
      where: { id: { equals: id as string } },
      data: {
        name: body.name || workflow.name,
        workflow_key: body.workflow_key || workflow.workflow_key,
        version: body.version || workflow.version,
        status: body.status || workflow.status,
        start_key: body.start_key || workflow.start_key,
        description: body.description !== undefined ? body.description : workflow.description,
        steps: body.steps !== undefined ? JSON.stringify(body.steps) : workflow.steps,
        updated_at: new Date().toISOString(),
      },
    })

    // Update fields if provided
    if (body.fields) {
      // Delete existing fields
      db.workflowField.deleteMany({
        where: { workflow_id: { equals: id as string } },
      })

      // Create new fields
      body.fields.forEach((field, index) => {
        db.workflowField.create({
          id: `field-${id}-${Date.now()}-${index}`,
          workflow_id: id as string,
          key: field.key || field.label.toLowerCase().replace(/\s+/g, '_'),
          label: field.label,
          type: field.type,
          description: field.description,
          required: field.required,
          position: field.position || index,
          options: field.options ? JSON.stringify(field.options) : null
        })
      })
    }

    // Steps are updated directly in the workflow object for the step-based system

    const workflowDTO = buildWorkflowDTO(updatedWorkflow!)

    return HttpResponse.json({
      success: true,
      message: 'Workflow updated successfully',
      data: workflowDTO,
    })
  }),

  // DELETE /workflows/:id - Archive workflow
  http.delete(`${API_BASE}/workflows/:id`, ({ params, request }) => {
    const user = getCurrentUser(request)

    if (!user) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    // Check permission: Only Admin and Workspace Manager can delete workflows
    if (!hasPermission(user, Permission.DELETE_WORKFLOW)) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Insufficient permissions to delete workflows',
        },
        { status: 403 }
      )
    }

    const { id } = params

    const workflow = db.workflow.findFirst({
      where: { id: { equals: id as string } },
    })

    if (!workflow) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Workflow not found',
        },
        { status: 404 }
      )
    }

    // Archive instead of delete
    db.workflow.update({
      where: { id: { equals: id as string } },
      data: {
        status: 'archived',
        updated_at: new Date().toISOString(),
      },
    })

    return HttpResponse.json({
      success: true,
      message: 'Workflow archived successfully',
    })
  }),
]
