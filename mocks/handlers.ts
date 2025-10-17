import { http, HttpResponse } from 'msw'
import { db } from './db'
import type { LoginRequest, RegisterRequest, ForgotPasswordRequest, ResetPasswordRequest } from '~/types/auth'

const API_BASE = 'http://localhost:8000/api/v1'

export const handlers = [
  // Login
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
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
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

  // Register
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
    const user = db.user.create({
      id: `user-${Date.now()}`,
      name: body.name,
      email: body.email,
      email_verified_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    // Generate token
    const tokenValue = `token-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
    const token = db.token.create({
      id: `token-${Date.now()}`,
      userId: user.id,
      token: tokenValue,
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
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

  // Forgot Password
  http.post(`${API_BASE}/forgot-password`, async ({ request }) => {
    const body = await request.json() as ForgotPasswordRequest

    const user = db.user.findFirst({
      where: {
        email: {
          equals: body.email,
        },
      },
    })

    if (!user) {
      // Don't reveal if user exists or not
      return HttpResponse.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      })
    }

    return HttpResponse.json({
      success: true,
      message: 'Password reset link sent to your email',
    })
  }),

  // Reset Password
  http.post(`${API_BASE}/reset-password`, async ({ request }) => {
    const body = await request.json() as ResetPasswordRequest & { token?: string }

    if (!body.token) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Invalid reset token',
        },
        { status: 400 }
      )
    }

    // For mock purposes, just return success
    return HttpResponse.json({
      success: true,
      message: 'Password reset successful',
    })
  }),
]
