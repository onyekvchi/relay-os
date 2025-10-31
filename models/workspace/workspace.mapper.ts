import type { Workspace } from './workspace.model'
import type { WorkspaceDTO } from './workspace.dto'

/**
 * WorkspaceMapper - Transforms between UI models and API DTOs
 */
export class WorkspaceMapper {
  /**
   * Convert API DTO to UI Model
   */
  static toModel(dto: WorkspaceDTO): Workspace {
    return {
      id: dto.id,
      name: dto.name,
      url: dto.url,
      logo: dto.logo,
      memberCount: dto.member_count,
      createdAt: dto.created_at,
      updatedAt: dto.updated_at
    }
  }

  /**
   * Convert array of DTOs to array of models
   */
  static toModelList(dtos: WorkspaceDTO[]): Workspace[] {
    return dtos.map(dto => this.toModel(dto))
  }
}