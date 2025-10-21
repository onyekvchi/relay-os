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

  // Additional auth endpoints (email verification, etc.)
  // Verify Email
  http.get(`${API_BASE}/verify-email`, async ({ request }) => {
    const url = new URL(request.url)
    const token = url.searchParams.get('token')

    if (!token) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Invalid verification token',
        },
        { status: 400 }
      )
    }

    // For mock purposes, just mark the first unverified user as verified
    const users = db.user.findMany({
      where: {
        email_verified_at: {
          equals: undefined,
        },
      },
    })
    const user = users[0] || null

    if (!user) {
      return HttpResponse.json(
        {
          success: false,
          message: 'No user found or already verified',
        },
        { status: 400 }
      )
    }

    // Update user
    const updatedUser = db.user.update({
      where: {
        id: {
          equals: user.id,
        },
      },
      data: {
        email_verified_at: new Date().toISOString(),
      },
    })

    if (!updatedUser) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Failed to update user',
        },
        { status: 500 }
      )
    }

    // Generate new token
    const tokenValue = `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const authToken = db.token.create({
      id: `token-${Date.now()}`,
      userId: updatedUser.id,
      token: tokenValue,
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    })

    return HttpResponse.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: updatedUser,
        token: authToken.token,
      },
    })
  }),

  // Resend Verification
  http.post(`${API_BASE}/resend-verification`, async ({ request }) => {
    const body = await request.json() as { email: string }

    const user = db.user.findFirst({
      where: {
        email: {
          equals: body.email,
        },
      },
    })

    if (!user) {
      return HttpResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      success: true,
      message: 'Verification email sent',
    })
  }),
]
