import type { User, UserRole } from './user.model'
import type { UserDTO, CreateUserRequest, UpdateUserRequest } from './user.dto'

/**
 * UserMapper - Transforms between UI models and API DTOs
 */
export class UserMapper {
  /**
   * Convert API DTO to UI Model
   */
  static toModel(dto: UserDTO): User {
    return {
      id: dto.id,
      firstName: dto.first_name,
      lastName: dto.last_name,
      email: dto.email,
      phoneNumber: dto.phone_number,
      role: dto.role as UserRole,
      lastActiveWorkspaceId: dto.last_active_workspace_id,
      twofaEnabled: dto.twofa_enabled,
      emailVerifiedAt: dto.email_verified_at,
      createdAt: dto.created_at,
      updatedAt: dto.updated_at
    }
  }

  /**
   * Convert UI Model to API DTO (for create)
   */
  static toCreateDTO(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): CreateUserRequest {
    return {
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
      phone_number: user.phoneNumber,
      role: user.role
    }
  }

  /**
   * Convert UI Model to API DTO (for update)
   */
  static toUpdateDTO(user: Partial<User>): UpdateUserRequest {
    const dto: UpdateUserRequest = {}
    
    if (user.firstName !== undefined) dto.first_name = user.firstName
    if (user.lastName !== undefined) dto.last_name = user.lastName
    if (user.phoneNumber !== undefined) dto.phone_number = user.phoneNumber
    if (user.role !== undefined) dto.role = user.role
    
    return dto
  }

  /**
   * Convert array of DTOs to array of models
   */
  static toModelList(dtos: UserDTO[]): User[] {
    return dtos.map(dto => this.toModel(dto))
  }
}
