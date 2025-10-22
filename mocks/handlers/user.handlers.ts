import { http, HttpResponse } from 'msw'
import { db } from '../db'
import { getCurrentUser } from './auth.handlers'
import { isAdmin } from '../permissions'
import type { UserDTO, UpdateUserRequest } from '@/models/user/user.dto'

const API_BASE = 'http://localhost:8000/api/v1'

/**
 * Helper to build UserDTO
 */
function buildUserDTO(user: any): UserDTO {
  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone_number: user.phone_number,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
  }
}

export const userHandlers = [
  // GET /users - List all users
  http.get(`${API_BASE}/users`, ({ request }) => {
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
    const role = url.searchParams.get('role')

    let whereClause: any = {}
    
    if (role) {
      whereClause.role = { equals: role }
    }

    const users = db.user.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : {},
    })

    const userDTOs = users.map(u => buildUserDTO(u))

    return HttpResponse.json({
      success: true,
      data: userDTOs,
    })
  }),

  // GET /users/:id - Get single user
  http.get(`${API_BASE}/users/:id`, ({ params, request }) => {
    const currentUser = getCurrentUser(request)

    if (!currentUser) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    const { id } = params

    const user = db.user.findFirst({
      where: { id: { equals: id as string } },
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

    const userDTO = buildUserDTO(user)

    return HttpResponse.json({
      success: true,
      data: userDTO,
    })
  }),

  // PUT /users/:id - Update user
  http.put(`${API_BASE}/users/:id`, async ({ params, request }) => {
    const currentUser = getCurrentUser(request)

    if (!currentUser) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    // Only Admin can update users
    if (!isAdmin(currentUser)) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Insufficient permissions to update users',
        },
        { status: 403 }
      )
    }

    const { id } = params
    const body = await request.json() as UpdateUserRequest

    const user = db.user.findFirst({
      where: { id: { equals: id as string } },
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

    // Update user
    const updatedUser = db.user.update({
      where: { id: { equals: id as string } },
      data: {
        first_name: body.first_name || user.first_name,
        last_name: body.last_name || user.last_name,
        phone_number: body.phone_number || user.phone_number,
        role: body.role || user.role,
        updated_at: new Date().toISOString(),
      },
    })

    const userDTO = buildUserDTO(updatedUser!)

    return HttpResponse.json({
      success: true,
      message: 'User updated successfully',
      data: userDTO,
    })
  }),

  // GET /users/me - Get current authenticated user
  http.get(`${API_BASE}/users/me`, ({ request }) => {
    const user = getCurrentUser(request)

    if (!user) {
      return HttpResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      )
    }

    const userDTO = buildUserDTO(user)

    return HttpResponse.json({
      success: true,
      data: userDTO,
    })
  }),
]
