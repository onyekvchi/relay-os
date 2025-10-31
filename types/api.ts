// HTTP Methods
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  TRACE = 'TRACE',
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}

export interface Pagination {
  page: number
  limit: number
  total: number
  total_pages: number
}

export interface ErrorResponse {
  type: string
  title: string
  status: number
  detail: string
  errors?: Array<{
    field: string
    message: string
  }>
}

export interface ApiError extends Error {
  status: number
  code?: string
  url?: string
  method?: string
}
