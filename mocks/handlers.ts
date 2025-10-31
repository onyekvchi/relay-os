import { http, HttpResponse } from 'msw'
import { db } from './db'
import { workflowHandlers } from './handlers/workflow.handlers'
import { requestHandlers } from './handlers/request.handlers'
import { userHandlers } from './handlers/user.handlers'
import { dashboardHandlers } from './handlers/dashboard.handlers'
import { authHandlers } from './handlers/auth.handlers'

const API_BASE = 'http://localhost:8000/api/v1'

export const handlers = [
  // Auth handlers (must be first to handle authentication)
  ...authHandlers,

  // Dashboard handlers
  ...dashboardHandlers,

  // Workflow handlers
  ...workflowHandlers,

  // Request handlers
  ...requestHandlers,

  // User handlers
  ...userHandlers,
]
