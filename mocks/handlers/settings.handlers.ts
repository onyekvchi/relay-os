import { http, HttpResponse } from 'msw'
import { db } from '../db'
import { getCurrentUser } from './auth.handlers'
import { hasPermission, Permission, isAdmin, isWorkspaceManagerOrAdmin } from '../permissions'
import type { UpdateProfileRequest, UpdatePasswordRequest } from '@/models/auth'

const API_BASE = 'http://localhost:8000/api/v1'

export const settingsHandlers = [
  // GET /settings/profile - Get current user's profile
  http.get(`${API_BASE}/settings/profile`, ({ request }) => {
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

  // PATCH /settings/profile - Update current user's profile
  http.patch(`${API_BASE}/settings/profile`, async ({ request }) => {
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

    const body = await request.json() as UpdateProfileRequest

    // Update user in database
    const updatedUser = db.user.update({
      where: {
        id: {
          equals: user.id,
        },
      },
      data: {
        first_name: body.first_name ?? user.first_name,
        last_name: body.last_name ?? user.last_name,
        phone_number: body.phone_number ?? user.phone_number,
        updated_at: new Date().toISOString(),
      },
    })

    if (!updatedUser) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Failed to update profile',
        },
        { status: 500 }
      )
    }

    return HttpResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    })
  }),

  // PATCH /settings/security - Update password
  http.patch(`${API_BASE}/settings/security`, async ({ request }) => {
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

    const body = await request.json() as UpdatePasswordRequest

    // In a real app, we would:
    // 1. Verify current_password matches stored hash
    // 2. Hash new_password
    // 3. Update password in database

    // For mock, just validate the request has required fields
    if (!body.current_password || !body.new_password) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Current password and new password are required',
        },
        { status: 400 }
      )
    }

    // Simulate password validation
    if (body.current_password === 'wrong-password') {
      return HttpResponse.json(
        {
          success: false,
          message: 'Current password is incorrect',
        },
        { status: 400 }
      )
    }

    return HttpResponse.json({
      success: true,
      message: 'Password updated successfully'
    })
  }),

  // GET /settings/workspace/team - Get team members (All authenticated users can view)
  http.get(`${API_BASE}/settings/workspace/team`, ({ request }) => {
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

    // All authenticated users can view team members
    // Get all users (in a real app, would filter by workspace)
    const teamMembers = db.user.findMany({})

    return HttpResponse.json({
      success: true,
      data: teamMembers
    })
  }),

  // POST /settings/workspace/team - Add team member (WorkspaceManager/Admin only)
  http.post(`${API_BASE}/settings/workspace/team`, async ({ request }) => {
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

    // Check if user has permission to add team members
    if (!hasPermission(user, Permission.ADD_TEAM_MEMBER)) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Insufficient permissions to add team members',
        },
        { status: 403 }
      )
    }

    const body = await request.json() as {
      email: string
      first_name: string
      last_name: string
      role: string
    }

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
          message: 'User with this email already exists',
        },
        { status: 422 }
      )
    }

    // Create new team member
    const newMember = db.user.create({
      id: `user-${Date.now()}`,
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      phone_number: '+234 800 000 0000',
      role: body.role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    return HttpResponse.json({
      success: true,
      message: 'Team member added successfully',
      data: newMember
    })
  }),

  // DELETE /settings/workspace/team/:userId - Remove team member (Admin only)
  http.delete(`${API_BASE}/settings/workspace/team/:userId`, ({ request, params }) => {
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

    // Check if user has permission to remove team members
    if (!hasPermission(user, Permission.REMOVE_TEAM_MEMBER)) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Insufficient permissions to remove team members',
        },
        { status: 403 }
      )
    }

    const { userId } = params

    // Delete user from database
    db.user.delete({
      where: { id: { equals: userId as string } }
    })

    return HttpResponse.json({
      success: true,
      message: 'Team member removed successfully'
    })
  }),

  // GET /settings/workspace - Get workspace settings
  http.get(`${API_BASE}/settings/workspace`, ({ request }) => {
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

    // Return mock workspace data
    return HttpResponse.json({
      success: true,
      data: {
        name: 'AndCo Labs',
        logo: undefined
      }
    })
  }),

  // PATCH /settings/workspace - Update workspace settings
  http.patch(`${API_BASE}/settings/workspace`, async ({ request }) => {
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

    // Check if user has permission to update workspace
    if (!hasPermission(user, Permission.UPDATE_WORKSPACE)) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Insufficient permissions to update workspace',
        },
        { status: 403 }
      )
    }

    const body = await request.json() as { name: string; logo?: string }

    // In a real app, would update workspace in database
    // For now, just return success with the updated data
    return HttpResponse.json({
      success: true,
      data: {
        name: body.name,
        logo: body.logo
      }
    })
  }),
]
