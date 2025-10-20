import { http, HttpResponse } from 'msw'
import { db } from '../db'
import { buildWorkflowDTO } from './workflow.handlers'
import { buildRequestDTO } from './request.handlers'

const API_BASE = 'http://localhost:8000/api/v1'

export const dashboardHandlers = [
  // GET /dashboard/popular-workflows - Get popular workflows
  http.get(`${API_BASE}/dashboard/popular-workflows`, () => {
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
  http.get(`${API_BASE}/dashboard/pending-actions`, () => {
    // Get requests awaiting approval (first 5)
    const requests = db.request.findMany({
      where: { status: { equals: 'Awaiting Approval' } }
    }).slice(0, 5)

    const pendingActions = requests.map(r => buildRequestDTO(r))

    return HttpResponse.json({
      success: true,
      data: pendingActions
    })
  }),

  // GET /dashboard/recent-activity - Get recent activity
  http.get(`${API_BASE}/dashboard/recent-activity`, () => {
    // Get last 8 activity logs
    const logs = db.requestLog.getAll()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8)

    const recentActivity = logs.map(log => {
      const request = db.request.findFirst({
        where: { id: { equals: log.request_id } }
      })
      const user = db.user.findFirst({
        where: { id: { equals: log.user_id } }
      })

      return {
        id: log.id,
        request_id: log.request_id,
        request: request ? buildRequestDTO(request) : {} as any,
        action: log.action,
        user_id: log.user_id,
        user: user || {} as any,
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
