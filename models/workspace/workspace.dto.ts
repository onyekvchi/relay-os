export interface WorkspaceDTO {
  id: string
  name: string
  url: string
  logo?: string
  created_at: string
  updated_at: string
  member_count: number
}

export interface CreateWorkspaceRequest {
  name: string
  url: string
  logo?: string
}

export interface UpdateWorkspaceRequest {
  name?: string
  url?: string
  logo?: string
}

export interface WorkspaceMemberDTO {
  user_id: string
  first_name: string
  last_name: string
  email: string
  phone_number?: string
  role: 'admin' | 'approver' | 'requester' | 'action_taker'
  status: 'active' | 'invited' | 'suspended'
  job_role?: string
  email_verified_at?: string
  joined_at: string
  updated_at: string
}