import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiFetch } from '@/utils/Api';
import type {
  ConversationMessage,
  InboxItem,
  MarkConversationReadPayload,
  SendMessagePayload,
  SendMessageResponse,
  UnreadMessagesResponse,
} from '@/types/api';

export const INBOX_QUERY_KEY = ['messages', 'inbox'] as const;
export const CONVERSATION_QUERY_KEY = ['messages', 'conversation'] as const;
export const UNREAD_MESSAGES_QUERY_KEY = ['messages', 'unread'] as const;

/**
 * Lista de conversaciones del usuario (sidebar de /messages).
 * Polling de 30s para que el inbox se actualice si llegan mensajes
 * mientras tenés la pantalla abierta.
 */
export function useInbox(enabled = true) {
  return useQuery({
    queryKey: INBOX_QUERY_KEY,
    queryFn: () => ApiFetch.get<InboxItem[]>('/messages/inbox'),
    enabled,
    retry: false,
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
}

/**
 * Mensajes de una conversación específica (panel de mensajes).
 * Polling de 5s mientras la conversación está abierta — efecto "tiempo real"
 * sin websockets. Para Fase 6.2+ podemos migrar a SSE o WebSocket.
 */
export function useConversation(
  pubId: number | null | undefined,
  otherUserId: number | null | undefined,
) {
  const enabled = Boolean(pubId) && Boolean(otherUserId);
  return useQuery({
    queryKey: [...CONVERSATION_QUERY_KEY, pubId, otherUserId] as const,
    queryFn: () => {
      if (!pubId || !otherUserId) {
        return Promise.reject(new Error('Conversación inválida'));
      }
      return ApiFetch.get<ConversationMessage[]>(
        `/messages/conversation/${pubId}/${otherUserId}`,
      );
    },
    enabled,
    retry: false,
    staleTime: 2_000,
    refetchInterval: enabled ? 5_000 : false,
  });
}

/**
 * Contador global de mensajes no leídos (badge del header).
 * Polling de 60s para no martillar el backend desde cada pestaña abierta.
 */
export function useUnreadMessagesCount(enabled = true) {
  return useQuery({
    queryKey: UNREAD_MESSAGES_QUERY_KEY,
    queryFn: () => ApiFetch.get<UnreadMessagesResponse>('/messages/unread'),
    enabled,
    retry: false,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

/**
 * Envía un mensaje. Optimistic update: el mensaje aparece inmediato en la
 * conversación con un id temporal negativo, que se reemplaza por el real
 * cuando el backend responde. Si falla, se revierte.
 */
export function useSendMessage(pubId: number | null | undefined, otherUserId: number | null | undefined) {
  const queryClient = useQueryClient();
  const conversationKey = [...CONVERSATION_QUERY_KEY, pubId, otherUserId] as const;

  return useMutation<
    SendMessageResponse,
    Error,
    SendMessagePayload,
    { previous: ConversationMessage[] | undefined; tempId: number }
  >({
    mutationFn: (payload) => ApiFetch.post<SendMessageResponse>('/messages/send', payload),

    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: conversationKey });
      const previous = queryClient.getQueryData<ConversationMessage[]>(conversationKey);

      // Mensaje optimista — id negativo para no chocar con ids reales del backend.
      const tempId = -Date.now();
      const optimistic: ConversationMessage = {
        message_id: tempId,
        sender_id: 0, // se rellena cuando llega el real; el bubble lo trata como propio igual.
        receiver_id: payload.receiver_id,
        pub_id: payload.pub_id,
        content: payload.content,
        is_read: false,
        created_at: new Date().toISOString(),
        sender_name: '',
        sender_image: null,
      };

      queryClient.setQueryData<ConversationMessage[]>(conversationKey, (old = []) => [
        ...old,
        optimistic,
      ]);

      return { previous, tempId };
    },

    onError: (_err, _payload, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(conversationKey, context.previous);
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: conversationKey });
      void queryClient.invalidateQueries({ queryKey: INBOX_QUERY_KEY });
    },
  });
}

/**
 * Marca todos los mensajes recibidos de un sender en una publicación como leídos.
 * Se llama al abrir una conversación.
 */
export function useMarkConversationAsRead() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, MarkConversationReadPayload>({
    mutationFn: (payload) => ApiFetch.post('/messages/mark-read', payload),

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INBOX_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: UNREAD_MESSAGES_QUERY_KEY });
    },
  });
}
