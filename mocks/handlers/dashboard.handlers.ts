import { http, HttpResponse } from 'msw'
import { db } from '../db'
import { getCurrentUser } from './auth.handlers'
import { filterRequestsByPermission } from '../permissions'
import { buildWorkflowDTO } from './workflow.handlers'
import { buildRequestDTO } from './request.handlers'

const API_BASE = 'http://localhost:8000/api/v1'

export const dashboardHandlers = [
  // GET /dashboard/popular-workflows - Get popular workflows
  http.get(`${API_BASE}/dashboard/popular-workflows`, ({ request }) => {
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

    // Get top 3 active workflows
    const workflows = db.workflow.findMany({
      where: { is_archived: { equals: false } }
    }).slice(0, 3)

    const popularWorkflows = workflows.map(w => buildWorkflowDTO(w))

    return HttpResponse.json({
      success: true,
      data: popularWorkflows
    })
  }),

  // GET /dashboard/pending-actions - Get pending actions
  http.get(`${API_BASE}/dashboard/pending-actions`, ({ request }) => {
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

    // Get requests awaiting approval (first 5)
    const requests = db.request.findMany({
      where: { status: { equals: 'Awaiting Approval' } }
    })

    // Filter by user permissions
    const filteredRequests = filterRequestsByPermission(user, requests).slice(0, 5)
    const pendingActions = filteredRequests.map(r => buildRequestDTO(r))

    return HttpResponse.json({
      success: true,
      data: pendingActions
    })
  }),

  // GET /dashboard/recent-activity - Get recent activity
  http.get(`${API_BASE}/dashboard/recent-activity`, ({ request }) => {
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

    // Get last 8 activity logs
    const logs = db.requestLog.getAll()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // Filter logs to only show activity for requests the user can see
    const allRequests = db.request.getAll()
    const visibleRequests = filterRequestsByPermission(user, allRequests)
    const visibleRequestIds = new Set(visibleRequests.map(r => r.id))

    const filteredLogs = logs
      .filter(log => visibleRequestIds.has(log.request_id))
      .slice(0, 8)

    const recentActivity = filteredLogs.map(log => {
      const req = db.request.findFirst({
        where: { id: { equals: log.request_id } }
      })
      const logUser = db.user.findFirst({
        where: { id: { equals: log.user_id } }
      })

      return {
        id: log.id,
        request_id: log.request_id,
        request: req ? buildRequestDTO(req) : {} as any,
        action: log.action,
        user_id: log.user_id,
        user: logUser || {} as any,
        comment: log.comment || undefined,
        created_at: log.created_at
      }
    })

    return HttpResponse.json({
      success: true,
      data: recentActivity
    })
  })
]
