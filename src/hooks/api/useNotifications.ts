import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import type {
  AppNotification,
  NotificationsUnreadResponse,
} from '@/types/api';

export const NOTIFICATIONS_QUERY_KEY = ['notifications'] as const;
export const NOTIFICATIONS_UNREAD_QUERY_KEY = ['notifications', 'unread'] as const;

/**
 * Lista de notificaciones del usuario logueado (últimas 20).
 * Polling cada 60s para mantener el feed razonablemente fresco.
 *
 * Paginación cursor-based no implementada todavía — cuando el volumen
 * lo justifique se migra a `useInfiniteQuery` con `before=<iso>`.
 */
export function useNotifications(enabled = true) {
  return useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: () => ApiFetch.get<AppNotification[]>('/notifications?limit=20'),
    enabled,
    retry: false,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

/**
 * Contador de notificaciones no leídas — para el bell badge del header.
 * Polling 60s, igual que el inbox unread count.
 */
export function useNotificationsUnreadCount(enabled = true) {
  return useQuery({
    queryKey: NOTIFICATIONS_UNREAD_QUERY_KEY,
    queryFn: () => ApiFetch.get<NotificationsUnreadResponse>('/notifications/unread-count'),
    enabled,
    retry: false,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

/** Marca una notificación específica como leída. Optimistic update. */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, number, { previous: AppNotification[] | undefined }>({
    mutationFn: (notifId) =>
      ApiFetch.put<{ message: string }>(`/notifications/${notifId}/read`),

    onMutate: async (notifId) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      const previous = queryClient.getQueryData<AppNotification[]>(NOTIFICATIONS_QUERY_KEY);
      queryClient.setQueryData<AppNotification[]>(NOTIFICATIONS_QUERY_KEY, (old = []) =>
        old.map((n) => (n.notif_id === notifId ? { ...n, is_read: true } : n)),
      );
      // Decrementar el unread count optimísticamente.
      queryClient.setQueryData<NotificationsUnreadResponse>(
        NOTIFICATIONS_UNREAD_QUERY_KEY,
        (old) => (old ? { total: Math.max(0, old.total - 1) } : old),
      );
      return { previous };
    },

    onError: (_err, _id, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, context.previous);
      }
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_UNREAD_QUERY_KEY });
    },
  });
}

/** Marca TODAS las notificaciones del usuario como leídas. */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  return useMutation<{ message: string; updated: number }, Error, void>({
    mutationFn: () =>
      ApiFetch.put<{ message: string; updated: number }>('/notifications/read-all'),

    onSuccess: () => {
      // Marcar todas como leídas localmente y resetear contador.
      queryClient.setQueryData<AppNotification[]>(NOTIFICATIONS_QUERY_KEY, (old = []) =>
        old.map((n) => ({ ...n, is_read: true })),
      );
      queryClient.setQueryData<NotificationsUnreadResponse>(NOTIFICATIONS_UNREAD_QUERY_KEY, {
        total: 0,
      });
    },
  });
}
