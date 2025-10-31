import { http, HttpResponse } from 'msw'
import { db } from '../db'
import { getCurrentUser } from './auth.handlers'
import { canViewRequest, canApproveRequest, canCompleteRequest, canEditRequest, filterRequestsByPermission } from '../permissions'
import type { RequestDTO, CreateRequestRequest, ApproveRequestRequest, RejectRequestRequest, RequestChangesRequest } from '@/models/request/request.dto'
import type { UserDTO } from '@/models/user/user.dto'
import type { WorkflowDTO } from '@/models/workflow/workflow.dto'

const API_BASE = 'http://localhost:8000/api/v1'

/**
 * Helper to build WorkflowDTO (reused from workflow handlers)
 */
function buildWorkflowDTO(workflow: any): WorkflowDTO {
  const creator = db.user.findFirst({
    where: { id: { equals: workflow.created_by_id } },
  })

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

/**
 * Helper to build RequestDTO with nested objects
 */
export function buildRequestDTO(request: any): RequestDTO {
  // Get workflow
  const workflow = db.workflow.findFirst({
    where: { id: { equals: request.workflow_id } },
  })
  const workflowDTO = buildWorkflowDTO(workflow!)

  // Get initiator
  const initiator = db.user.findFirst({
    where: { id: { equals: request.initiator_id } },
  })

  // Get observers
  const observerIds = JSON.parse(request.observer_ids) as string[]
  const observers = observerIds.map(id => 
    db.user.findFirst({ where: { id: { equals: id } } })
  ).filter(Boolean) as UserDTO[]

  // Get logs with user details
  const logs = db.requestLog.findMany({
    where: { request_id: { equals: request.id } },
  }).map(log => {
    const user = db.user.findFirst({
      where: { id: { equals: log.user_id } },
    })
    return {
      id: log.id,
      action: log.action,
      user_id: log.user_id,
      user: user as UserDTO,
      comment: log.comment || undefined,
      created_at: log.created_at,
    }
  })

  // Get request approvals with workflow approval details
  const requestApprovals = db.requestApproval.findMany({
    where: { request_id: { equals: request.id } },
  }).map(reqApproval => {
    const workflowApproval = db.workflowApproval.findFirst({
      where: { id: { equals: reqApproval.workflow_approval_id } },
    })
    const approver = workflowApproval ? db.user.findFirst({
      where: { id: { equals: workflowApproval.approver_id } },
    }) : null

    return {
      id: reqApproval.id,
      workflow_approval_id: reqApproval.workflow_approval_id,
      workflow_approval: {
        id: workflowApproval!.id,
        approver_id: workflowApproval!.approver_id,
        approver: approver as UserDTO,
        order: workflowApproval!.order,
      },
      status: reqApproval.status,
      comment: reqApproval.comment || undefined,
      actioned_at: reqApproval.actioned_at || undefined,
      actioned_by_id: reqApproval.actioned_by_id || undefined,
    }
  })

  return {
    id: request.id,
    workflow_id: request.workflow_id,
    workflow: workflowDTO,
    created_by: initiator as UserDTO,
    status: request.status,
    context: JSON.parse(request.field_values || '{}'),
    active_steps: JSON.parse(request.active_steps || '[]'),
    created_at: request.created_at,
    updated_at: request.updated_at,
  }
}

export const requestHandlers = [
  // GET /requests - List all requests
  http.get(`${API_BASE}/requests`, ({ request }) => {
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

    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const workflowId = url.searchParams.get('workflow_id')

    let whereClause: any = {}
    
    if (status) {
      whereClause.status = { equals: status }
    }
    if (workflowId) {
      whereClause.workflow_id = { equals: workflowId }
    }

    const requests = db.request.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : {},
    })

    // Filter requests based on user permissions
    const filteredRequests = filterRequestsByPermission(user, requests)
    const requestDTOs = filteredRequests.map(r => buildRequestDTO(r))

    return HttpResponse.json({
      success: true,
      data: requestDTOs,
    })
  }),

  // GET /requests/:id - Get single request
  http.get(`${API_BASE}/requests/:id`, ({ params, request }) => {
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

    const { id } = params

    const req = db.request.findFirst({
      where: { id: { equals: id as string } },
    })

    if (!req) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Request not found',
        },
        { status: 404 }
      )
    }

    // Check if user can view this request
    if (!canViewRequest(user, req)) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Insufficient permissions to view this request',
        },
        { status: 403 }
      )
    }

    const requestDTO = buildRequestDTO(req)

    return HttpResponse.json({
      success: true,
      data: requestDTO,
    })
  }),

  // POST /requests - Create request
  http.post(`${API_BASE}/requests`, async ({ request }) => {
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

    const body = await request.json() as CreateRequestRequest

    // Validate required fields
    if (!body.workflow_id || !body.context) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Missing required fields',
          errors: ['workflow_id and context are required'],
        },
        { status: 422 }
      )
    }

    // Verify workflow exists
    const workflow = db.workflow.findFirst({
      where: { id: { equals: body.workflow_id } },
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

    // Create request
    const requestId = `request-${Date.now()}`
    
    const newRequest = db.request.create({
      id: requestId,
      workflow_id: body.workflow_id,
      initiator_id: user.id,
      status: 'pending',
      field_values: JSON.stringify(body.context),
      active_steps: JSON.stringify([workflow?.start_key || 'start']),
      observer_ids: JSON.stringify(body.observers || []),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    // Create initial log
    db.requestLog.create({
      id: `log-${requestId}-1`,
      request_id: requestId,
      action: 'create',
      user_id: user.id,
      comment: null,
      created_at: new Date().toISOString(),
    })

    // Create request approvals based on workflow approvals
    const workflowApprovals = db.workflowApproval.findMany({
      where: { workflow_id: { equals: body.workflow_id } },
    })

    workflowApprovals.forEach((approval, index) => {
      db.requestApproval.create({
        id: `req-approval-${requestId}-${index}`,
        request_id: requestId,
        workflow_approval_id: approval.id,
        status: 'Pending',
        comment: null,
        actioned_at: null,
        actioned_by_id: null,
      })
    })

    const requestDTO = buildRequestDTO(newRequest)

    return HttpResponse.json({
      success: true,
      message: 'Request created successfully',
      data: requestDTO,
    }, { status: 201 })
  }),

  // POST /requests/:id/approve - Approve a request
  http.post(`${API_BASE}/requests/:id/approve`, async ({ params, request }) => {
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

    const { id } = params
    const body = await request.json() as ApproveRequestRequest

    const req = db.request.findFirst({
      where: { id: { equals: id as string } },
    })

    if (!req) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Request not found',
        },
        { status: 404 }
      )
    }

    // Check if user can approve this request
    if (!canApproveRequest(user, req)) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Insufficient permissions to approve this request',
        },
        { status: 403 }
      )
    }

    // For step-based system, validate step_key instead of approval_id
    if (!body.step_key) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Missing step_key',
        },
        { status: 422 }
      )
    }

    // Step-based approval logic would update request.active_steps
    // For now, just update request status
    db.request.update({
      where: { id: { equals: id as string } },
      data: {
        status: 'completed',
        updated_at: new Date().toISOString(),
      },
    })

    // Add log entry
    db.requestLog.create({
      id: `log-${id}-${Date.now()}`,
      request_id: id as string,
      action: 'approve',
      user_id: user.id,
      comment: body.comment || null,
      created_at: new Date().toISOString(),
    })

    // Check if all approvals are done
    const allApprovals = db.requestApproval.findMany({
      where: { request_id: { equals: id as string } },
    })
    const allApproved = allApprovals.every(a => a.status === 'Approved')

    // Update request status
    if (allApproved) {
      db.request.update({
        where: { id: { equals: id as string } },
        data: {
          status: 'Awaiting Action',
          updated_at: new Date().toISOString(),
        },
      })
    }

    const updatedRequest = db.request.findFirst({
      where: { id: { equals: id as string } },
    })
    const requestDTO = buildRequestDTO(updatedRequest!)

    return HttpResponse.json({
      success: true,
      message: 'Request approved successfully',
      data: requestDTO,
    })
  }),

  // POST /requests/:id/reject - Reject a request
  http.post(`${API_BASE}/requests/:id/reject`, async ({ params, request }) => {
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

    const { id } = params
    const body = await request.json() as RejectRequestRequest

    const req = db.request.findFirst({
      where: { id: { equals: id as string } },
    })

    if (!req) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Request not found',
        },
        { status: 404 }
      )
    }

    // Check if user can approve/reject this request
    if (!canApproveRequest(user, req)) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Insufficient permissions to reject this request',
        },
        { status: 403 }
      )
    }

    // For step-based system, validate step_key instead of approval_id
    if (!body.step_key) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Missing step_key',
        },
        { status: 422 }
      )
    }

    // Step-based rejection logic would update request.active_steps

    // Update request status
    db.request.update({
      where: { id: { equals: id as string } },
      data: {
        status: 'Rejected',
        updated_at: new Date().toISOString(),
      },
    })

    // Add log entry
    db.requestLog.create({
      id: `log-${id}-${Date.now()}`,
      request_id: id as string,
      action: 'reject',
      user_id: user.id,
      comment: body.comment,
      created_at: new Date().toISOString(),
    })

    const updatedRequest = db.request.findFirst({
      where: { id: { equals: id as string } },
    })
    const requestDTO = buildRequestDTO(updatedRequest!)

    return HttpResponse.json({
      success: true,
      message: 'Request rejected',
      data: requestDTO,
    })
  }),

  // POST /requests/:id/request-changes - Request changes
  http.post(`${API_BASE}/requests/:id/request-changes`, async ({ params, request }) => {
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

    const { id } = params
    const body = await request.json() as RequestChangesRequest

    const req = db.request.findFirst({
      where: { id: { equals: id as string } },
    })

    if (!req) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Request not found',
        },
        { status: 404 }
      )
    }

    // Check if user can request changes (same as approve permission)
    if (!canApproveRequest(user, req)) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Insufficient permissions to request changes',
        },
        { status: 403 }
      )
    }

    // Update request status
    db.request.update({
      where: { id: { equals: id as string } },
      data: {
        status: 'Changes Requested',
        updated_at: new Date().toISOString(),
      },
    })

    // Add log entry
    db.requestLog.create({
      id: `log-${id}-${Date.now()}`,
      request_id: id as string,
      action: 'requestChange',
      user_id: user.id,
      comment: body.comment,
      created_at: new Date().toISOString(),
    })

    const updatedRequest = db.request.findFirst({
      where: { id: { equals: id as string } },
    })
    const requestDTO = buildRequestDTO(updatedRequest!)

    return HttpResponse.json({
      success: true,
      message: 'Changes requested',
      data: requestDTO,
    })
  }),

  // POST /requests/:id/complete - Complete a request (action taker)
  http.post(`${API_BASE}/requests/:id/complete`, async ({ params, request }) => {
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

    const { id } = params
    const body = await request.json() as { comment?: string }

    const req = db.request.findFirst({
      where: { id: { equals: id as string } },
    })

    if (!req) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Request not found',
        },
        { status: 404 }
      )
    }

    // Check if user can complete this request
    if (!canCompleteRequest(user, req)) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Insufficient permissions to complete this request',
        },
        { status: 403 }
      )
    }

    // Update request status
    db.request.update({
      where: { id: { equals: id as string } },
      data: {
        status: 'Completed',
        updated_at: new Date().toISOString(),
      },
    })

    // Add log entry
    db.requestLog.create({
      id: `log-${id}-${Date.now()}`,
      request_id: id as string,
      action: 'complete',
      user_id: user.id,
      comment: body.comment || null,
      created_at: new Date().toISOString(),
    })

    const updatedRequest = db.request.findFirst({
      where: { id: { equals: id as string } },
    })
    const requestDTO = buildRequestDTO(updatedRequest!)

    return HttpResponse.json({
      success: true,
      message: 'Request completed successfully',
      data: requestDTO,
    })
  }),

  // POST /requests/:id/comment - Add a comment
  http.post(`${API_BASE}/requests/:id/comment`, async ({ params, request }) => {
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

    const { id } = params
    const body = await request.json() as { comment: string }

    const req = db.request.findFirst({
      where: { id: { equals: id as string } },
    })

    if (!req) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Request not found',
        },
        { status: 404 }
      )
    }

    // Check if user can view this request (required to comment)
    if (!canViewRequest(user, req)) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Insufficient permissions to comment on this request',
        },
        { status: 403 }
      )
    }

    // Add log entry
    db.requestLog.create({
      id: `log-${id}-${Date.now()}`,
      request_id: id as string,
      action: 'comment',
      user_id: user.id,
      comment: body.comment,
      created_at: new Date().toISOString(),
    })

    const updatedRequest = db.request.findFirst({
      where: { id: { equals: id as string } },
    })
    const requestDTO = buildRequestDTO(updatedRequest!)

    return HttpResponse.json({
      success: true,
      message: 'Comment added successfully',
      data: requestDTO,
    })
  }),
]
