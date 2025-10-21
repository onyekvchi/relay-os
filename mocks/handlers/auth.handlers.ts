import { http, HttpResponse } from 'msw'
import { db } from '../db'
import type { LoginRequest, RegisterRequest } from '~/types/auth'

const API_BASE = 'http://localhost:8000/api/v1'

/**
 * Helper to get current user from Authorization header
 * Returns null if no valid token found
 */
export function getCurrentUser(request: Request) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const tokenValue = authHeader.substring(7) // Remove 'Bearer ' prefix
  
  // Find token in database
  const token = db.token.findFirst({
    where: { token: { equals: tokenValue } }
  })

  if (!token) {
    return null
  }

  // Check if token is expired
  if (new Date(token.expiresAt) < new Date()) {
    return null
  }

  // Get user
  const user = db.user.findFirst({
    where: { id: { equals: token.userId } }
  })

  return user
}

export const authHandlers = [
  // POST /login - Authenticate user
  http.post(`${API_BASE}/login`, async ({ request }) => {
    const body = await request.json() as LoginRequest & { device_name?: string }

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
          message: 'Invalid credentials',
          errors: ['Email or password is incorrect'],
        },
        { status: 401 }
      )
    }

    // Generate token
    const tokenValue = `token-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
    const token = db.token.create({
      id: `token-${Date.now()}`,
      userId: user.id,
      token: tokenValue,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      createdAt: new Date().toISOString(),
    })

    return HttpResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token: token.token,
      },
    })
  }),

  // POST /register - Create new user account
  http.post(`${API_BASE}/register`, async ({ request }) => {
    const body = await request.json() as RegisterRequest & { device_name?: string }

    // Check if user already exists
    const existingUser = db.user.findFirst({
      where: {
        email: {
          equals: body.email,
        },
      },
    })

    if (existingUser) {
      return HttpResponse.json(
        {
          success: false,
          message: 'User already exists',
          errors: ['Email is already registered'],
        },
        { status: 422 }
      )
    }

    // Create new user
    const firstName = body.first_name || 'User'
    const lastName = body.last_name || 'Account'
    
    const user = db.user.create({
      id: `user-${Date.now()}`,
      first_name: firstName,
      last_name: lastName,
      email: body.email,
      phone_number: '+234 800 000 0000', // Default phone number
      role: 'User', // Default role
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    // Generate token
    const tokenValue = `token-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
    const token = db.token.create({
      id: `token-${Date.now()}`,
      userId: user.id,
      token: tokenValue,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      createdAt: new Date().toISOString(),
    })

    return HttpResponse.json({
      success: true,
      message: 'Registration successful',
      data: {
        user,
        token: token.token,
      },
    })
  }),

  // GET /auth/me - Get current authenticated user
  http.get(`${API_BASE}/auth/me`, ({ request }) => {
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

    return HttpResponse.json({
      success: true,
      data: user
    })
  }),

  // POST /logout - Invalidate current token
  http.post(`${API_BASE}/logout`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          success: false,
          message: 'No token provided',
        },
        { status: 401 }
      )
    }

    const tokenValue = authHeader.substring(7)
    
    // Find and delete token
    const token = db.token.findFirst({
      where: { token: { equals: tokenValue } }
    })

    if (token) {
      db.token.delete({
        where: { id: { equals: token.id } }
      })
    }

    return HttpResponse.json({
      success: true,
      message: 'Logged out successfully'
    })
  }),

  // POST /forgot-password - Request password reset
  http.post(`${API_BASE}/forgot-password`, async ({ request }) => {
    const body = await request.json() as { email: string }

    const user = db.user.findFirst({
      where: { email: { equals: body.email } }
    })

    // Always return success for security (don't reveal if email exists)
    return HttpResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.'
    })
  }),

  // POST /reset-password - Reset password with token
  http.post(`${API_BASE}/reset-password`, async ({ request }) => {
    const body = await request.json() as { 
      email: string
      password: string
      password_confirmation: string
      token: string
    }

    // In a real app, would validate the reset token
    // For mock, just check if user exists
    const user = db.user.findFirst({
      where: { email: { equals: body.email } }
    })

    if (!user) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Invalid reset token',
        },
        { status: 400 }
      )
    }

    // In real app, would update password hash
    // For mock, just return success
    return HttpResponse.json({
      success: true,
      message: 'Password has been reset successfully'
    })
  })
]
