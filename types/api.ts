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

// Generic API Response
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errors?: string[]
  meta?: {
    total?: number
    page?: number
    perPage?: number
    lastPage?: number
  }
}

// Error type used by API plugin
export interface ApiError extends Error {
  status: number
  code?: string
  url?: string
  method?: string
}
