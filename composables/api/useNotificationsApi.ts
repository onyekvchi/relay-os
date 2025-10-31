import { HttpMethod, type ApiResponse } from '~/types/api'

export function useNotificationsApi() {
  const { $api } = useNuxtApp()

  const getNotifications = (filters?: { workspace_id?: string; unread_only?: boolean }) =>
    $api<ApiResponse<any[]>>('/notifications', {
      query: filters
    })

  const markNotificationsRead = (notificationIds: string[]) =>
    $api<ApiResponse<null>>('/notifications/read', {
      method: HttpMethod.POST,
      body: { notification_ids: notificationIds }
    })

  return {
    getNotifications,
    markNotificationsRead
  }
}