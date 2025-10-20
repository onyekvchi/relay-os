import { http, HttpResponse } from 'msw'
import { db } from '../db'
import type { WorkflowDTO, CreateWorkflowRequest, UpdateWorkflowRequest } from '@/models/workflow/workflow.dto'
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
  }).sort((a, b) => a.order - b.order)

  // Get approvals with user details
  const approvals = db.workflowApproval.findMany({
    where: { workflow_id: { equals: workflow.id } },
  }).sort((a, b) => a.order - b.order).map(approval => {
    const approver = db.user.findFirst({
      where: { id: { equals: approval.approver_id } },
    })
    return {
      id: approval.id,
      approver_id: approval.approver_id,
      approver: approver as UserDTO,
      order: approval.order,
    }
  })

  // Get action with user details
  const action = db.workflowAction.findFirst({
    where: { workflow_id: { equals: workflow.id } },
  })
  const actor = action ? db.user.findFirst({
    where: { id: { equals: action.actor_id } },
  }) : null

  return {
    id: workflow.id,
    name: workflow.name,
    description: workflow.description,
    fields: fields.map(f => ({
      id: f.id,
      label: f.label,
      type: f.type,
      description: f.description,
      required: f.required,
      order: f.order,
    })),
    approvals,
    action: {
      id: action!.id,
      actor_id: action!.actor_id,
      actor: actor as UserDTO,
    },
    is_archived: workflow.is_archived,
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
        is_archived: { equals: false },
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
    const body = await request.json() as CreateWorkflowRequest

    // Validate required fields
    if (!body.name || !body.fields || !body.approvals || !body.action_actor_id) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Missing required fields',
          errors: ['name, fields, approvals, and action_actor_id are required'],
        },
        { status: 422 }
      )
    }

    // Create workflow
    const workflowId = `workflow-${Date.now()}`
    const workflow = db.workflow.create({
      id: workflowId,
      name: body.name,
      description: body.description || null,
      is_archived: false,
      created_by_id: 'user-1', // TODO: Get from auth token
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    // Create fields
    body.fields.forEach((field, index) => {
      db.workflowField.create({
        id: `field-${workflowId}-${index}`,
        workflow_id: workflowId,
        label: field.label,
        type: field.type,
        description: field.description,
        required: field.required,
        order: field.order,
      })
    })

    // Create approvals with order information
    body.approvals.forEach((approval, index) => {
      db.workflowApproval.create({
        id: `approval-${workflowId}-${index}`,
        workflow_id: workflowId,
        approver_id: approval.approver_id,
        order: approval.order,
      })
    })

    // Create action
    db.workflowAction.create({
      id: `action-${workflowId}`,
      workflow_id: workflowId,
      actor_id: body.action_actor_id,
    })

    const workflowDTO = buildWorkflowDTO(workflow)

    return HttpResponse.json({
      success: true,
      message: 'Workflow created successfully',
      data: workflowDTO,
    }, { status: 201 })
  }),

  // PUT /workflows/:id - Update workflow
  http.put(`${API_BASE}/workflows/:id`, async ({ params, request }) => {
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
        description: body.description !== undefined ? body.description : workflow.description,
        is_archived: body.is_archived !== undefined ? body.is_archived : workflow.is_archived,
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
          label: field.label,
          type: field.type,
          description: field.description,
          required: field.required,
          order: field.order,
        })
      })
    }

    // Update approvals if provided
    if (body.approvals) {
      // Delete existing approvals
      db.workflowApproval.deleteMany({
        where: { workflow_id: { equals: id as string } },
      })

      // Create new approvals with order information
      body.approvals.forEach((approval, index) => {
        db.workflowApproval.create({
          id: `approval-${id}-${Date.now()}-${index}`,
          workflow_id: id as string,
          approver_id: approval.approver_id,
          order: approval.order,
        })
      })
    }

    // Update action if provided
    if (body.action_actor_id) {
      db.workflowAction.update({
        where: { workflow_id: { equals: id as string } },
        data: { actor_id: body.action_actor_id },
      })
    }

    const workflowDTO = buildWorkflowDTO(updatedWorkflow!)

    return HttpResponse.json({
      success: true,
      message: 'Workflow updated successfully',
      data: workflowDTO,
    })
  }),

  // DELETE /workflows/:id - Archive workflow
  http.delete(`${API_BASE}/workflows/:id`, ({ params }) => {
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
        is_archived: true,
        updated_at: new Date().toISOString(),
      },
    })

    return HttpResponse.json({
      success: true,
      message: 'Workflow archived successfully',
    })
  }),
]
